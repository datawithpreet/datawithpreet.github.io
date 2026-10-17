---
layout: daily-post
title: "Your job is slow because of shuffle, not compute"
description: "Most slow Spark jobs aren't slow at calculation — they're slow at moving data between machines. What a shuffle actually is, how to spot it in one glance, and the fixes."
date: 2026-10-17
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

Your Spark job takes six hours. The cluster is big, the data is big, so six hours feels almost reasonable — until someone asks why, and nobody has a good answer.

The usual response is to make the cluster bigger. More workers, more memory, more cores. The job drops to five and a half hours. Somebody declares victory, the bill goes up 30%, and the actual problem is still sitting there untouched.

The problem was never compute. It was the shuffle.

Here's what that means. A Spark cluster is a bunch of machines, each holding a slice of your data. Most operations — filtering rows, transforming columns — happen inside each slice, on the machine that already has the data. That's fast. It's local. Nothing moves.

But some operations need data from *other* slices. A `groupBy` needs all rows with the same key in one place. A join needs matching keys from two tables to meet. When that happens, Spark has to physically move data across the network from machine to machine, reorganize it, and write it to disk on the other side. That movement is the shuffle. And on most slow jobs I've seen, the shuffle is where 80% of the time goes — not the calculation, the moving.

Think of it like an office. Ten people each have a stack of invoices sorted by date. You ask each person to total their own stack — that's fast, everyone works in parallel, nobody moves. That's a narrow transformation. Now you ask for totals *by customer*. Each person's stack has a mix of customers. So everyone has to stand up, walk around the office, and hand invoices to whoever owns each customer. The room descends into chaos for an hour. The actual adding-up takes five minutes. That hour of walking around is your shuffle.

![The shuffle bottleneck: massive data redistribution across workers vs. local compute](/assets/img/databricks-edu-series/shuffle-trap-01-data-movement.svg)

The cruel part: the bigger your cluster, the worse a bad shuffle can get. More machines means more slices, which means each key's data is scattered across more places, which means more network traffic to reassemble it. Throwing machines at a shuffle-bound job is like hiring more people to hand invoices around the office. The room just gets more crowded.

So how do you know you're looking at a shuffle problem? Open the Spark UI and look at the stages. Every stage shows two numbers that matter: shuffle read and shuffle write. If you see a stage where the shuffle write is enormous — gigabytes or terabytes — and the task time is dominated by it, that's your culprit. The other classic sign: most tasks finish in seconds, but a few stages take forever, and the event timeline shows long stretches of fetching and writing with the CPUs mostly idle. Idle CPUs with a slow job is the signature. The machines aren't working. They're waiting on the network.

The wrong pattern usually looks innocent. Here's the shape of it:

```python
# THE TRAP — a shuffle hiding inside a "simple" aggregation
events = spark.read.table("events")          # terabytes, spread across workers
result = (
    events
    .groupBy("user_id")                       # every row must travel to its key's machine
    .agg(F.sum("amount").alias("total"))
)
```

There's nothing wrong with this code. It's correct. It's also moving every byte of that table across the network to regroup it by `user_id`. If `events` is 5 TB, you're paying to relocate 5 TB before a single sum is computed.

The fixes are about moving less data, not computing faster. Three that cover most cases:

First, shrink before you shuffle. Filter early, drop columns you don't need, aggregate partially — anything that reduces the volume *before* the regrouping. A `groupBy` on 500 GB is a fundamentally different operation than a `groupBy` on 5 TB, and the difference is all network.

```python
# THE FIX — less data crosses the network
result = (
    spark.read.table("events")
    .select("user_id", "amount")              # drop the 200 columns you don't need
    .filter(F.col("event_date") >= "2026-01-01")
    .groupBy("user_id")
    .agg(F.sum("amount").alias("total"))
)
```

Second, know your join. If one side of a join is small, don't shuffle both sides — broadcast the small one to every worker instead. Spark does this automatically under a size threshold, but the threshold is conservative, and skewed or misestimated sizes defeat it. When a join stage shows a massive shuffle on both sides and one table would fit in memory, that's a broadcast join waiting to happen.

Third, respect partitioning. Data that's already partitioned by the key you're grouping or joining on doesn't need to move. If you join two tables on `user_id` every day, partitioning both by `user_id` once turns a daily multi-terabyte shuffle into a local operation. This is the highest-leverage fix and the least used, because partitioning decisions are made upstream by whoever writes the table, and they rarely think about who reads it.

![Before and after: a shuffle-dominated timeline vs. an optimized one](/assets/img/databricks-edu-series/shuffle-trap-02-before-after.svg)

There's a cost angle that makes this urgent rather than academic. Shuffle doesn't just cost time — it costs disk I/O, network, and, on Databricks, real money twice: once for the compute sitting idle while data moves, and once for the storage of all those shuffle files. Every terabyte you stop shuffling is money you stop spending on waiting.

In my healthcare data work, shuffles are the silent killer. Claims tables joined to member tables joined to provider tables, every join on a different key, every one a full reshuffle of billions of rows. The pipelines that hurt aren't the complex ones — they're the ones with four joins in a row that nobody ever looked at in the Spark UI.

Try this on your slowest job this week. Open the Spark UI, find the stage with the biggest shuffle write, and ask: what operation caused this, and did all of that data really need to move? Nine times out of ten, the answer is a `groupBy` or join that could have been fed less data, or a broadcast that didn't trigger, or a partitioning choice made two years ago by someone who never read the table. Fix the movement and the compute takes care of itself.

Here's my short version. When a Spark job is slow, don't ask "how do I compute faster?" Ask "what is moving, and why?" The cluster is fast. The network is not. Stop paying to relocate your data and start asking whether it needed to travel at all.

When did you last find a shuffle hiding inside a query that looked perfectly innocent?

---

*Enjoying this series? It goes out every morning on [Substack](https://masterdataengineering.substack.com/) and my LinkedIn newsletter, Master Data Engineering — subscribe wherever you read.*
