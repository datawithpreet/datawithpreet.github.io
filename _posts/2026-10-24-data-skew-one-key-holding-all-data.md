---
layout: daily-post
title: "Data skew: one key holding all the data"
description: "Most tasks finish quickly and one task runs forever. What data skew is, how to spot it, and how salting fixes it."
date: 2026-10-24
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A job was almost done, and then it was not.

Most of the tasks finished quickly. The cluster went quiet. One task kept running, long after everything else had finished, and the job could not finish until it did.

Nothing had failed. Nothing had thrown an error. The job was just waiting on one task, and that one task was doing a very large share of the work.

That is data skew, and once you have seen it, you recognise it instantly.

Everything looks fine, except for one task that runs forever.

To understand skew, you have to understand how Spark splits work.

When Spark groups data, or joins it, it sends rows with the same key to the same task. That is not a choice. It is how grouping works.

If you group by customer, all the rows for one customer have to end up together, or the group cannot be counted correctly. If you join on a key, matching rows have to meet on the same machine.

So the size of a task is decided by the size of its key.

When keys are roughly even, tasks are roughly even. The work spreads out, and the cluster finishes together.

![Balanced vs skewed tasks](/assets/img/databricks-edu-series/diagram-9-1-balanced-vs-skewed.svg)

When one key is far larger than the rest, one task gets far more work than the rest. The other tasks finish and sit idle. The big task keeps going, alone, and the whole job waits for it.

That is skew in one sentence.

One key holding all the data.

Where does a key like that come from?

Sometimes it is a real, dominant value. One large customer, one popular product, one region that produces far more records than every other region combined.

Sometimes it is a placeholder value. A null, an empty string, a zero, or a default code like "unknown" that thousands of unrelated rows happen to share.

That second case catches people by surprise, because the rows have nothing in common except the placeholder. They are not really one group. But Spark treats them as one key, so they all land on one task anyway.

A null is the classic example. Rows missing a key still have to go somewhere, and they all go to the same place.

![One key holds all the rows](/assets/img/databricks-edu-series/diagram-9-2-null-hot-key.svg)

Here is the wrong pattern, and it looks completely ordinary:

```python
# THE SLOW PATTERN — one key can dominate a single task
summary = (
    events
    .groupBy("customer_id")
    .count()
)

summary.write.saveAsTable("events_by_customer")
```

![Salting splits, then combines](/assets/img/databricks-edu-series/diagram-9-3-salting.svg)

Nothing in that code says "make one task huge." The code just asks for a count per customer.

If one customer has a far larger share of the rows than any other, that customer's task will be far larger than any other. Adding more workers does not help, because the extra workers cannot take rows away from that one task. The work cannot be split if the key cannot be split.

That is the part people miss when they first hit skew.

They assume the cluster is too small, or the job needs more parallelism, or a setting needs tuning.

But skew is not a shortage of machines. It is a shortage of balance. More machines just mean more idle machines waiting on the same one task.

So the first step is not tuning. It is diagnosis.

Open the stage in the Spark UI and look at the task durations, not just the total job time.

In a healthy stage, task durations are roughly similar. In a skewed stage, most tasks are short and one task, or a few tasks, are far longer than the rest.

That pattern is the tell. One long task among many short ones usually means one key is doing most of the work.

Then check the keys themselves, before you change any code.

A simple count by key, ordered by size, tells you more than any setting will:

```python
# DIAGNOSE FIRST — which keys actually dominate?
events.groupBy("customer_id").count().orderBy("count", ascending=False).show()
```

If the top key is far ahead of the second key, you have found your problem.

If a null or a placeholder sits at the top, you have found it even faster, and the fix may be simpler than you expect.

Start with the easy fixes, and only reach for the clever ones when you need them.

If the dominant key is a placeholder, handle it separately.

Filter out the nulls, process them on their own path, or give them a sensible treatment before the grouping happens. Do not let unrelated rows pretend to be one group just because they share a missing value.

If the dominant key is real, and you are aggregating, pre-aggregate where you can.

Combine rows early, reduce the volume before the shuffle, and make sure you are not carrying columns you do not need into the heavy step. Less data per key means a smaller task, even if the key itself stays large.

If the other side of a join is small, consider a broadcast join instead of a shuffle join. A broadcast join does not shuffle the large side by key at all, so a skewed key on the large side stops being a bottleneck for that join.

For a skewed join where both sides are large, or a skewed aggregation that cannot be avoided, the standard fix is salting.

Salting means deliberately splitting the hot key into several smaller keys, doing the work in pieces, and then combining the pieces back together.

For an aggregation, it looks like this:

```python
# THE FIX — salt the hot key, aggregate in pieces, then combine
from pyspark.sql.functions import col, lit, rand, floor

salted = events.withColumn("salt", floor(rand() * 10))

partial = (
    salted
    .groupBy("customer_id", "salt")
    .count()
)

summary = (
    partial
    .groupBy("customer_id")
    .sum("count")
)

summary.write.saveAsTable("events_by_customer")
```

Read that slowly, because the idea is doing all the work.

First, each row gets a random salt, a number from zero to nine. The hot key is no longer one key. It is now ten keys, and those ten keys spread across ten tasks.

Each task aggregates its own piece. Then a second, much smaller aggregation adds the ten pieces back together into one total per customer.

The result is the same. The work is no longer stuck on one task.

For a skewed join, the same idea applies, with one extra step. You salt the large side and copy the small side once per salt value, so every salted piece still finds its match.

Salting is not free, and it is not the first thing to reach for.

It adds a step. It makes the code harder to read. It can change the shape of the result if you forget the final combine step, and that is a real risk.

So use it where the skew is real, measured, and worth fixing — not on every groupBy just in case.

There is also help built into Spark that is worth knowing about.

Adaptive Query Execution can detect skew at runtime and split skewed partitions automatically, when skew join optimisation is enabled. It does not fix every case, and it does not replace understanding the keys, but it can soften a problem you have not yet diagnosed.

Think of it as a safety net, not a strategy.

A few habits keep skew from becoming a mystery.

Check the top keys before you tune anything. A count by key is cheap, and it answers the question directly.

Watch task durations, not just job duration. One long task is a different problem from a generally slow job, and it needs a different fix.

Treat placeholders with suspicion. Nulls, empty strings, and default codes are keys too, and they often carry more rows than any real value.

And remember that adding workers does not fix skew. If one task holds most of the data, more workers just wait longer.

The mental model to carry away is simple.

Spark splits work by key, so work is only as balanced as your keys are.

When one key dominates, one task dominates, and the whole job waits for it.

Before you scale the cluster, check the keys. Before you rewrite the job, find the hot one.

What is the largest key in your most important job, and how far ahead of the second largest is it?

That answer tells you whether you have a tuning problem or a skew problem.
