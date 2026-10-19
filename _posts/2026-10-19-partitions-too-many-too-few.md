---
layout: daily-post
title: "Partitions: too many, too few, and how to tell"
description: "One partition is one task, and one task is one core. A story about a job that ignored a bigger cluster, the two ways partition counts go wrong, and the two-number check that tells you which one you've got."
date: 2026-10-19
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

A job runs on a ten-node cluster and takes forty minutes. Someone doubles the cluster to twenty nodes, expecting twenty minutes. It takes forty minutes again. Not one minute less.

No error. No skew. No bad query plan. The code is fine and the cluster is fine. The job simply has eight partitions — eight tasks — and eight tasks can only use eight cores at a time. The other hundred and fifty-two cores sit idle, billing by the minute, doing nothing. Nobody told Spark to spread the work out, so it didn't.

![Too few partitions: one giant task while most workers sit idle vs right-sized partitions keeping all workers busy](/assets/img/databricks-edu-series/partitions-01-too-few.svg)

This is the partition problem, and it is the single most common reason Spark jobs refuse to scale. Not the cluster size. Not the code. The number of chunks the data got split into.

A partition is the unit of parallelism in Spark. One partition becomes one task, and one task occupies one core. That sentence is the whole game: your partition count decides the maximum number of cores your job can use at once. Get the count wrong in either direction and you pay for it — slowly.

Too few partitions is the silent one. Everything looks healthy — the cluster is big, the stages complete — but the Spark UI shows a stage with 8 tasks on a cluster with 160 cores. Ninety-five percent of your compute is idle. Each giant task holds a huge slice of data in memory, so it runs slower than it should, and if one task straggles, the whole stage waits on it. You scale the cluster up and nothing changes, because eight tasks will never use more than eight cores.

Too many partitions is the loud one, and it usually arrives wearing the costume of "tuning." Someone adds `repartition(5000)` to a 2 GB dataset — five thousand tasks, each holding a few hundred kilobytes. Launching each task costs the scheduler real work: serializing the task, shipping it to an executor, reporting it back. When the tasks are tiny, the scheduling overhead becomes the whole job. The stage spends more time starting and finishing tasks than running them. It is death by a thousand tasks, and it looks exactly like a slow cluster in every dashboard.

![Too many partitions: thousands of tiny tasks and the scheduler spending more time assigning tasks than running them](/assets/img/databricks-edu-series/partitions-02-too-many.svg)

Where do the bad numbers come from? The usual suspects:

- **The 200 default.** `spark.sql.shuffle.partitions` is 200 in Spark, and Databricks adjusts it in many cases — but 200 partitions of a 1 GB shuffle is 5 MB per task (too many), and 200 partitions of a 1 TB shuffle is 5 GB per task (too few). One number cannot fit all data.
- **Tiny files.** Every input file becomes at least one partition. A folder with a million small files — a classic streaming-landing pattern — means a million tiny tasks before your query even starts.
- **Over-eager repartitioning.** `repartition()` triggers a full shuffle, which is expensive by itself. People call it to "parallelize more" and end up with the tiny-task problem, paying a shuffle to get slower.
- **Over-eager coalescing.** The reverse: `coalesce(1)` to get one clean output file, collapsing a big job into a single giant task that crawls and sometimes OOMs.

So how do you tell? It takes one number from the Spark UI. Open the job, click the slow stage, and compare two things: **the number of tasks and the number of cores on your cluster.**

If tasks are far below cores — a stage with 8 tasks on 160 cores — you have too few partitions. Bump the count up so the cluster is actually fed.

If tasks are far above cores — a stage with 20,000 tasks on 32 cores — you have too many. Each task finishes in milliseconds, and the scheduler is drowning. Bring the count down.

The rule of thumb I use: aim for **2 to 4 tasks per core**, with each partition holding roughly **128 MB to 1 GB** of data. Those two checks agree with each other most of the time. Sixty-four cores, so 128–256 partitions; 50 GB of data, so about 100–200 partitions. When both rules point at the same range, you're in the right neighborhood.

![How to tell: compare task count to core count, aim for 2-4 tasks per core, target 128 MB to 1 GB per partition](/assets/img/databricks-edu-series/partitions-03-how-to-tell.svg)

Here's the wrong pattern, and it's everywhere:

```python
# THE TRAP — five thousand tiny tasks on a 2 GB dataset
spark.read.table("events") \
    .repartition(5000) \
    .groupBy("user_id") \
    .agg(F.sum("amount").alias("total")) \
    .write.saveAsTable("user_totals")
```

The groupBy already shuffles. The `repartition(5000)` adds a second full shuffle just to create tasks that each hold a few hundred kilobytes. The fix is not a bigger number — it's a sane one, and usually not calling repartition at all:

```python
# THE FIX — let the shuffle land at a sensible count, or coalesce down
spark.conf.set("spark.sql.shuffle.partitions", "64")   # sized to the data, not the default

spark.read.table("events") \
    .groupBy("user_id") \
    .agg(F.sum("amount").alias("total")) \
    .coalesce(32) \          # shrink without a shuffle
    .write.saveAsTable("user_totals")
```

Two things to notice. First, `coalesce` avoids the shuffle when you're only reducing partitions — it's the cheap direction. Second, on modern Databricks runtimes, Adaptive Query Execution is on by default and will coalesce small shuffle partitions at runtime for you (`spark.sql.adaptive.coalescePartitions.enabled`). AQE is not a substitute for understanding partitions, but it does clean up the too-many case automatically in a lot of pipelines. The too-few case — eight giant tasks — it won't fix for you. That's still yours to see.

There is one more honest caveat: perfect balance is a myth. Real data has skew (that's its own topic in this series), and partitions will never be exactly equal. The goal isn't identical task times — it's a task count in the right range, so no core idles while the scheduler drowns or the cluster naps.

The mental model fits on an index card: partitions are tasks, tasks are cores in use. Count your tasks. Count your cores. If the numbers don't rhyme, you've found your bottleneck — and it's the cheapest fix in Spark.

Next time a job refuses to go faster no matter how big a cluster you throw at it — what does your task count say?
