---
layout: daily-post
title: "Cache, persist, checkpoint: three things that sound the same"
description: "Cache keeps a result in memory, persist picks where it lives, and checkpoint cuts a growing lineage. What each one actually does, and when to use which."
date: 2026-10-25
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A job read the same cleaned dataset three times, and nobody noticed for a while.

The job started by joining raw events to a reference table, filtering out bad rows, and tidying a handful of columns. That cleaned result was then used three times: once for a summary, once for a top-customers list, and once for a quality check.

Each of those three uses was an action, and each action ran the whole cleaning work again.

The job was not wrong. Every answer was correct.

It was just doing the same expensive work three times, because nothing told Spark to keep the cleaned result around after the first use.

That is the problem cache and persist exist to solve. Checkpoint sounds like it belongs in the same group, but it does not. It solves a different problem entirely, and mixing the three up is how jobs get slower while looking optimised.

To see why, start with the one idea underneath all of this.

Spark is lazy. A transformation like a filter or a join does not run anything. It just adds a step to a plan.

An action like `count`, `show`, or a write is what actually runs the plan. And here is the part that surprises people: if you use the same DataFrame in three actions, Spark runs its plan three times, once per action, unless you tell it to keep the result.

That is not a bug. Spark has no way of knowing you intend to reuse the result, so it recomputes it each time, faithfully and expensively.

Here is the wrong pattern, and it looks completely reasonable:

```python
# THE SLOW PATTERN — the cleaning work runs once per action
cleaned = (
    events
    .join(labels, on="event_code", how="left")
    .filter("event_code IS NOT NULL")
    .select("customer_id", "event_code", "amount")
)

cleaned.groupBy("event_code").count().show()
cleaned.orderBy("amount", ascending=False).limit(10).show()
cleaned.filter("amount < 0").count()
```

Nothing in that code is wrong in the syntax sense. It runs, and it returns the right answers.

But the join, the filter, and the column selection run three times, once per action. If the cleaning work is the expensive part of the job, the job pays for it three times over.

![One cleaned result, recomputed three times](/assets/img/databricks-edu-series/diagram-10-1-recompute-three-times.svg)

Now, the three words people confuse.

First, `cache()`.

Calling `cache()` on a DataFrame tells Spark to keep its computed result in memory on the workers, so the next action can reuse it instead of recomputing it.

It is a shorthand. Underneath, `cache()` is exactly the same as `persist()` with the memory-only storage level.

Second, `persist()`.

`persist()` is the general version of `cache()`, with one extra decision attached: where should the kept result live?

That decision is the storage level, and it matters, because memory is limited and results are often larger than people expect:

- `MEMORY_ONLY` keeps partitions in memory, and recomputes any partition that does not fit. This is what `cache()` does.

- `MEMORY_AND_DISK` keeps partitions in memory, and spills the overflow to disk instead of recomputing it. This is the safer default for results you genuinely need to reuse.

- `DISK_ONLY` writes everything to disk. Slower to read back than memory, but it never eats worker memory and never recomputes.

Memory is fast and scarce. Disk is slower and plentiful. Recompute is the fallback when neither holds the partition.

![Storage levels compared](/assets/img/databricks-edu-series/diagram-10-2-storage-levels.svg)

Third, `checkpoint()`.

Checkpoint is not a faster cache. It does not keep a result in memory for reuse.

Checkpoint writes a DataFrame to reliable storage, and then cuts the lineage: the recorded plan that describes how the DataFrame was built. After a checkpoint, Spark forgets the long chain of steps that produced the result and treats the written files as the new starting point.

That solves a problem cache and persist cannot solve. When a plan grows very long, carrying the whole chain around becomes a burden of its own: plans get huge, optimisation gets slow, and in extreme cases the job fails under the weight of its own lineage.

Checkpoint is the reset button for that chain. You pay for a write to disk, and in return the plan starts fresh.

So the three words, in one line each: `cache()` keeps a result in memory for reuse, `persist()` is the general version with a storage level, and `checkpoint()` writes a result out and forgets how it was built.

Using checkpoint where you meant persist means you pay for a disk write and get no in-memory reuse. Using cache where you meant checkpoint means the lineage keeps growing, no matter how fast the reuse is.

Here is the fix for the opening job:

```python
# THE FIX — compute the cleaned result once, reuse it three times
from pyspark.storagelevel import StorageLevel

cleaned = (
    events
    .join(labels, on="event_code", how="left")
    .filter("event_code IS NOT NULL")
    .select("customer_id", "event_code", "amount")
)

cleaned.persist(StorageLevel.MEMORY_AND_DISK)
cleaned.count()

cleaned.groupBy("event_code").count().show()
cleaned.orderBy("amount", ascending=False).limit(10).show()
cleaned.filter("amount < 0").count()

cleaned.unpersist()
```

Read that slowly, because three details are doing quiet work.

First, the persist level is `MEMORY_AND_DISK`, not plain memory. If the cleaned result does not fully fit in memory, the overflow spills to disk instead of being recomputed on the next action. That is the level to reach for when you are not sure a result fits.

Second, the `count()` right after the persist is deliberate. Persist on its own is lazy, like everything else in Spark. Nothing is kept until an action runs. That first `count()` forces the computation once, and fills the cache. The three actions after it then read the kept result instead of rebuilding it.

Third, the `unpersist()` at the end matters. Cached data stays cached until the application ends or you release it, so memory held by one finished result is unavailable to the next step.

That last point leads to the failure mode of caching, and it is the mirror image of the recompute problem.

Caching everything sounds safe. It is not.

Every cached result takes memory from the same shared pool the rest of the job uses. Cache a huge result, or several results at once, and workers start evicting partitions or struggling for memory. A job that cached too eagerly can run slower than the same job with no cache at all.

So cache only what you actually reuse, and only for as long as you reuse it.

A result used in one action does not need caching. For reuse across jobs, a cache does not help at all, because it disappears when the application ends. For that, write a table. That is what tables are for.

Checkpoint, meanwhile, belongs in a different situation. Here is the shape of it:

```python
# CHECKPOINT — reset the lineage when the plan itself becomes the problem
from pyspark.sql import DataFrame

spark.sparkContext.setCheckpointDir("/mnt/checkpoints/lineage")

result = raw
for step in transformation_steps:
    result = apply_step(result, step)

result = result.checkpoint()
```

![Checkpoint cuts the long lineage](/assets/img/databricks-edu-series/diagram-10-3-checkpoint-cuts-lineage.svg)

The loop is the tell. Each iteration adds another layer to the plan, and after many iterations the plan itself is long enough to cause trouble.

Checkpointing there writes the current result out, cuts the lineage, and lets the job continue from a short, fresh plan.

Notice what checkpoint does not do here: it does not make the next action faster by keeping data in memory. If the goal is simply reuse, persist is the tool. If the goal is to stop a plan from growing, checkpoint is the tool.

A few habits keep these three straight in practice.

Check the Storage tab in the Spark UI after a job runs. It shows what is cached, how much of it is in memory, and how much spilled to disk. That tells you whether your level choice matched reality.

Release results you no longer need. An `unpersist()` at the end of a reuse block prevents a large class of memory pressure.

And when a plan keeps growing through a loop, reach for checkpoint, not a bigger cache. A bigger cache stores more data. It does not shorten a plan.

The mental model to carry away is simple.

Lazy evaluation means reuse is never automatic. Persist and cache make reuse happen, by keeping a result where the next action can find it. Checkpoint makes a long plan short again.

Three words that sound alike, three different jobs.

Which result in your most important job is being recomputed right now, simply because nobody told Spark to keep it?

That answer is usually worth more than any tuning setting.
