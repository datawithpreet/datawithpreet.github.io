---
layout: daily-post
title: "Broadcast joins: the setting that changes everything"
description: "A nightly join shuffled both tables just to look up a small label table. What a broadcast join does instead, when to use it, and when it will hurt you."
date: 2026-10-23
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A nightly job joined two tables, and it never seemed to finish.

One table was large. It held event records, and it grew every day.

The other table was small. It held a lookup: a code, and the plain-language label that went with it. The kind of table you could read in one glance.

The join itself looked innocent. Two tables, one shared key, a handful of output columns. Nothing in the code suggested trouble.

But the job shuffled both tables across the cluster, every night, just to match a small lookup against a large fact table. Most of the job's time went to moving data, not to doing anything useful with it.

That is the shuffle join at work, and it is the default for a reason. It is also the wrong tool when one side of the join is small.

Here is what a shuffle join actually does.

Spark takes both tables and repartitions them by the join key. Rows with the same key have to end up on the same machine, or they cannot be matched. So data travels across the network, gets sorted, and gets matched.

That makes sense when both tables are large. Neither side fits on one machine, so both sides have to be spread out, and the matching has to happen wherever the keys land.

It makes much less sense when one side is tiny. Why shuffle a huge table just to look up a label that would fit on every worker many times over?

A broadcast join flips the approach.

Instead of shuffling both tables, Spark sends one complete copy of the small table to every worker. Each worker then joins its own local slice of the large table against the small table it already holds.

No shuffle of the large table. No sorting of both sides. No waiting for data to arrive from across the cluster before matching can start.

The large table stays where it is. The small table travels instead, once, to every worker.

That is the whole idea, and it is worth pausing on, because it reverses the instinct most people have about joins.

![Shuffle join vs broadcast join](/assets/img/databricks-edu-series/diagram-8-1-shuffle-vs-broadcast.svg)

The instinct says: join means move both sides together.

The broadcast idea says: if one side is small enough to copy everywhere, do not move the big side at all.

Here is the wrong pattern, and it is the pattern most notebooks start with:

```python
# THE SLOW PATTERN — Spark shuffles both sides by default
events = spark.read.table("events")
labels = spark.read.table("event_labels")

result = events.join(labels, on="event_code", how="left")
result.write.saveAsTable("events_enriched")
```

Nothing in that code is wrong in the syntax sense. It runs. It returns the right answer.

It just does far more work than the problem requires. The large table gets shuffled by `event_code`, the small table gets shuffled by `event_code`, and the join happens after all that movement.

If the lookup table is small, that shuffle is pure overhead.

Spark will sometimes spot this on its own. There is a setting called `spark.sql.autoBroadcastJoinThreshold`, and by default Spark will broadcast a table that is small enough to fall under that threshold.

That automatic help has limits, and that is where jobs get stuck.

First, Spark has to know how big the table is. If the table statistics are missing or stale, Spark may guess wrong and skip the broadcast.

Second, the small table in your job might not be a plain table at all. It might be the result of a filter, a grouping, or another join, and Spark may not be able to prove it is small before it runs.

Third, the default threshold may simply be too low for a lookup that is still small in practical terms but larger than the default.

When any of that happens, you get the slow plan, and nothing in the code tells you why. The join looks the same as always. The plan is not.

The fix is to say what you mean, explicitly, with a broadcast hint:

```python
# THE FIX — send the small table to every worker, do not shuffle the large one
from pyspark.sql.functions import broadcast

events = spark.read.table("events")
labels = spark.read.table("event_labels")

result = events.join(broadcast(labels), on="event_code", how="left")
result.write.saveAsTable("events_enriched")
```

One word changes the physical plan. The large table is no longer shuffled for this join. The small table is copied to each worker, and each worker matches locally.

In SQL, the same idea looks like this:

```sql
SELECT /*+ BROADCAST(labels) */ e.*, l.label
FROM events e
LEFT JOIN event_labels labels
  ON e.event_code = labels.event_code
```

Same result. Different movement. That difference is the entire point.

![One small table copied to every worker](/assets/img/databricks-edu-series/diagram-8-2-small-table-every-worker.svg)

There is a habit worth building here: check the plan before you trust the join.

Run `explain()` on the join, and look for the word Broadcast. If you see a broadcast hash join, the small table is being copied to the workers.

If you see a sort-merge join instead, both sides are being shuffled. That does not mean the query is broken. It means you should ask whether one side was supposed to be small, and whether Spark knew that.

Here is a simple way to think about it, before you add any hint:

- Is one side genuinely small, and will it stay small?

- Is the other side large, and is shuffling it the expensive part?

- Can each worker hold a copy of the small side without strain?

If the answer to all three is yes, a broadcast join is the right call.

If the answer to any of them is no, do not force it.

That last point matters, because broadcast joins have a failure mode of their own, and it is the mirror image of the shuffle problem.

Broadcasting a table that is not actually small means copying a large table to every worker. Each worker has to hold a full copy, in memory, and the driver has to collect and send it first.

Do that with a table that keeps growing, and you trade a slow shuffle for a driver that runs out of memory, or workers that struggle to hold a copy they were never meant to hold.

A lookup that was small last month may not be small now. A dimension that started as a few hundred rows can grow into something far larger, quietly, while the broadcast hint stays in the code.

So the rule is not "always broadcast the smaller side." The rule is "broadcast the side that is small enough to copy everywhere, and check that it still is."

![Broadcast only if small](/assets/img/databricks-edu-series/diagram-8-3-when-not-to-broadcast.svg)

A few checks keep this safe in practice.

Check the size of the small side, not just its row count. A few rows with wide text columns are not the same as a few rows of short codes.

Check the plan with `explain()`, especially after the lookup changes. A plan that used to broadcast can stop broadcasting when statistics change, and a plan that used to be safe can become unsafe when the small side grows.

Be careful with broadcast and streaming, and with joins where the small side is itself the result of an expensive computation. Broadcasting does not make that computation free. It just changes where the result goes.

And if you are joining two large tables, do not reach for broadcast at all. That is the shuffle join's job. Forcing a broadcast there does not remove the work. It just moves it somewhere worse.

The mental model to carry away is simple.

A shuffle join moves both tables so matching keys meet on the same machine.

A broadcast join moves only the small table, so matching happens wherever the large table already lives.

Most slow joins are not slow because the matching is hard. They are slow because the data had to travel first.

Before you tune anything else, ask one question about your next join: which side is small enough to send everywhere, instead of shuffling everything?

That question alone will save you more time than most tuning guides.