---
layout: daily-post
title: "Why your DataFrame has 200 partitions and what to do about it"
description: "Nobody asked for 200 partitions. It's Spark's oldest default, stamped on every wide transformation — and it's wrong for almost everyone in both directions. The two settings that replace it."
date: 2026-10-20
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A colleague once pinged me about a daily aggregate job. It read a few gigabytes of events, grouped by customer, and wrote the result out. Every single day, the output folder had exactly 200 files.

Nobody had asked for 200 files. The code had no repartition call. The cluster had 16 cores, not 200. And yet — 200 tasks, 200 files, every day, like clockwork.

He'd spent a morning looking for the setting someone must have configured. There wasn't one. That was the point. Nobody configured 200. Two hundred is what you get when nobody configures anything.

Two hundred is Spark's default for `spark.sql.shuffle.partitions`. It's a leftover from the early Spark era, picked when clusters were bigger and data was bigger, and it has survived every Spark release since because changing a default breaks everyone's assumptions. So it stays. Every wide transformation you run — `groupBy`, `join`, `distinct`, window functions, `orderBy` — shuffles into exactly 200 partitions unless you tell it otherwise.

You can see it if you know where to look. Open the query plan and find the Exchange node: it will say something like `Exchange hashpartitioning(customer_id, 200)`. Or just count your output files after a shuffle-heavy write. Two hundred, every time. It's the most common number in Spark, and it's a coincidence.

![Where Spark's default of 200 shuffle partitions comes from: groupBy, Exchange stamped 200, 200 output files](/assets/img/databricks-edu-series/diagram-5-1-where-200-comes-from.svg)

The problem is that one fixed number cannot be right for every dataset. Partition size is what matters, and 200 partitions of different-sized shuffles produce wildly different partition sizes.

Take a small shuffle: a few hundred megabytes grouped into 200 partitions. Each task holds a couple of megabytes. The scheduler spends more time launching and collecting 200 tasks than the tasks spend working. You get the tiny-task death from my earlier partitions post — and a folder full of 200 tiny files that every downstream job then has to open, one by one, forever.

Now take a big shuffle: two terabytes into 200 partitions. Each task holds ten gigabytes. Tasks drag, a couple of them straggle, and at least one of them runs out of memory and takes the whole stage down with it. Same default. Opposite disaster.

![200 partitions, two ways to be wrong: tiny 2 MB partitions overwhelm the scheduler, huge 10 GB partitions straggle](/assets/img/databricks-edu-series/diagram-5-2-one-number-two-disasters.svg)

Two hundred is wrong for almost everyone, in both directions. It's just wrong in whichever direction your data happens to be.

And yet the default has a second life as a superstition. You'll see `repartition(200)` in blog posts and old codebases — people who read somewhere that 200 is "the Spark way" and hard-coded it. Shuffling into 200 on purpose buys you exactly nothing over the default except an extra shuffle to get there. If you find a `repartition(200)` in your code, delete it and let the shuffle do its default thing, or better, do what's below.

The other classic mistake is the overcorrection. Someone learns the default is bad, gets burned by tiny tasks, and sets `spark.sql.shuffle.partitions` to 8 globally "for speed." Then the big jobs — the ones that actually needed the parallelism — collapse into 8 giant tasks and grind. A global constant was the problem. A different global constant is not the fix.

So what replaces it? Two settings, working together. That's the whole prescription.

**Setting one: `spark.sql.shuffle.partitions`, set deliberately per job.**

This is your starting number, and you compute it from your data, not from a blog. The math is simple: shuffle partitions ≈ data size ÷ target partition size. If you're shuffling 50 GB and want roughly 250–500 MB per partition, that's 100–200 partitions. If you're shuffling 2 GB, that's 8–16. Set it in the session for the job that needs it — `spark.conf.set(...)` at the top of the notebook — not as a cluster-wide default. It should change from job to job, because the data does.

**Setting two: `spark.sql.adaptive.coalescePartitions.enabled`, the runtime cleanup crew.**

Adaptive Query Execution is on by default on modern Databricks runtimes, and its partition-coalescing feature watches the shuffle as it runs and merges small partitions back together. You set 128 to be safe, the data turns out smaller than you guessed, and AQE quietly merges the 5 MB partitions into 64 MB ones (controlled by `spark.sql.adaptive.advisoryPartitionSizeInBytes`, default 64 MB) before the next stage runs.

These two cover each other's weaknesses. Setting one without the other is incomplete: the manual number is a guess made before the data is seen, and it can only be wrong in the too-many direction if AQE is there to clean up. AQE without the manual number can fix too-many but not too-few — it merges, it never splits. Together: you pick a sane starting point, the runtime fixes your aim.

![The two settings that replace the default: spark.sql.shuffle.partitions and spark.sql.adaptive.coalescePartitions](/assets/img/databricks-edu-series/diagram-5-3-the-two-settings-fix.svg)

How do you know you're in the 200-trap? Three checks, thirty seconds.

First, look at the plan. Find the Exchange node. If it says 200 and you didn't choose 200, that's the default talking.

Second, count the output. A shuffle-heavy write that lands exactly 200 files is the default's fingerprint.

Third, compare tasks to cores in the Spark UI, like last time. Two hundred tasks on a 16-core cluster with each task holding a few megabytes: the default is hurting you. Two hundred tasks each holding gigabytes: the default is hurting you differently.

Here's the wrong pattern, straight from a codebase near you:

```python
# THE TRAP — shuffling into 200 because that's "the Spark way"
spark.read.table("events") \
    .groupBy("customer_id") \
    .agg(F.sum("amount").alias("total")) \
    .repartition(200) \
    .write.saveAsTable("customer_totals")
```

The `groupBy` already shuffled into 200 (the default). The `repartition(200)` then pays for a second full shuffle to arrive at... 200 again. All cost, zero change. And if the dataset is 2 GB, those 200 partitions are 10 MB each — tiny tasks, tiny files, slow everything.

The fix: delete the superstition, size the shuffle deliberately, and let AQE clean up the leftovers:

```python
# THE FIX — a deliberate number plus runtime coalescing
spark.conf.set("spark.sql.shuffle.partitions", "16")                    # sized to ~2 GB of data
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true") # merge the small ones

spark.read.table("events") \
    .groupBy("customer_id") \
    .agg(F.sum("amount").alias("total")) \
    .write.saveAsTable("customer_totals")
```

Sixteen partitions for a 2 GB shuffle means ~125 MB per task — a healthy size. And if the data turns out to be smaller than expected, AQE merges the runts before the next stage. No repartition call, no superstition, no 200 tiny files in the output folder.

One honest caveat: the manual setting is still a guess. You don't know the exact shuffle size until it runs, and skew (its own topic in this series) can make a mockery of any average. That's precisely why the second setting exists — the guess gets you in the right neighborhood, and the runtime corrects it. Don't agonize over 16 vs 24. Pick something in the right order of magnitude and let AQE do the fine-tuning.

The mental model fits on an index card: 200 is nobody's choice. It's a placeholder from another era that shows up in your Exchange node, your task count, and your output folder. Replace the placeholder with a number you computed, and turn on the runtime that fixes your aim.

Next time a job writes exactly 200 files — where did that number come from?
