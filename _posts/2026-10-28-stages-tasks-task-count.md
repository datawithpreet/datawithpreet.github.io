---
layout: daily-post
title: "Stages, tasks, and why your task count is the first thing to check"
description: "A stage can never use more cores than it has tasks. Count the tasks first, before you scale the cluster or blame the code."
date: 2026-10-28
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A team once told me their job was slow even though they were running it on a big cluster.

They had the numbers ready. Dozens of workers, plenty of cores, a cluster that cost real money every hour it ran. The job still took hours, and every run looked the same.

Someone suggested a bigger cluster. Someone else suggested rewriting the code. A third person opened the query plan and started hunting for a slow operator.

Then someone opened the Stages screen and counted.

The slowest stage had four tasks.

Four tasks, on a cluster with dozens of cores. At most four cores were ever doing work at once. The rest were sitting idle, billing by the hour, waiting for four tasks to finish.

That one number explained the whole job. Nothing else they were about to change would have helped.

This is why the task count is the first thing to check when a job is slow. Not the first interesting thing. The first thing.

To see why, you need three definitions, and they are simpler than the Spark UI makes them look.

A job is one action. A count, a write, a collect, a show. Every time your code asks Spark for a result, that is a job.

A stage is a chunk of a job that can run without moving data between machines. Spark splits a job at every shuffle, because a shuffle is where data has to travel. Everything between two shuffles is one stage.

A task is the unit of work inside a stage. One task processes one partition of data, on one core, on one machine.

So the chain is simple: a job breaks into stages, a stage breaks into tasks, and a task is what actually runs.

That chain gives you the most useful rule in Spark performance, and it fits in one sentence: a stage can never use more cores than it has tasks.

A stage with four tasks uses at most four cores, no matter how big the cluster is. A stage with four thousand tiny tasks uses every core it can get, but pays scheduling time for each one.

The task count is the ceiling on parallelism. Everything else you tune sits underneath that ceiling.

![One job breaks down into stages and tasks](/assets/img/databricks-edu-series/diagram-13-1-job-stage-task.svg)

Here is the wrong pattern, and it is the one that team fell into before anyone counted:

- Open the job, see a long duration, and start guessing what is slow.

- Add workers, because a slow job must need more machines.

- Blame the code, because a slow job must have a slow calculation in it.

- Look at the average task time, because an average feels like a summary.

None of those steps answers the first question. How parallel was this stage, actually?

The average task time is the worst of the four, because it hides the pattern that matters. A stage where every task takes ten minutes is a different problem from a stage where most tasks take ten seconds and one takes an hour. The average of the second stage looks fine until you realise the whole stage waits for that one task.

So the fix is a short check, in a fixed order, and the task count comes first.

First, find the slow stage, and read its task count.

If the task count is small while the cluster is large, the job was never parallel. The data arrived in too few partitions, or an earlier step collapsed it down, or a filter left a handful of partitions holding everything. Adding workers cannot help, because there is nothing for the extra workers to do.

If the task count is enormous and each task finishes in a blink, the opposite happened. The data was split into far too many pieces. Each task did almost nothing, but each one still cost time to schedule, start, and report back. The job spent more time managing tasks than doing work.

If the task count is in a sane middle range and tasks finish in roughly similar times, the stage really was parallel, and then it makes sense to look further: shuffle size, skewed keys, or the work itself.

That is the whole check. Task count first, then the spread of task times, then everything else.

![Four tasks on a 96-core cluster leave most cores idle](/assets/img/databricks-edu-series/diagram-13-2-task-count-vs-cores.svg)

Now, where does the task count actually come from? It comes from partitions, and partitions come from decisions you may not realise you made.

Reading a file usually gives you one partition per file, or per chunk of a file. A shuffle gives you as many partitions as the shuffle setting says. A repartition gives you exactly the number you asked for.

That means a stage can inherit a bad task count from a step long before it. A small input file read as four partitions will stay at four tasks through every narrow transformation after it, until something shuffles it. A join that shuffles into the default partition count will carry that count into the next stage, whether it suits the data or not.

Here is a small example of how the wrong pattern looks in code.

You read a modest dataset, filter it down, and then run a heavy transformation on what is left:

```python
df = spark.read.parquet("/data/events")
filtered = df.filter("event_date >= '2026-01-01'")
result = filtered.groupBy("customer_id").count()
result.write.mode("overwrite").parquet("/data/output")
```

Nothing in that code looks wrong. But if the filtered data lands in a handful of partitions, the heavy work after the filter runs on a handful of tasks, on a handful of cores, while the rest of the cluster waits.

The fix is not a bigger cluster. The fix is to give the stage enough tasks to use the cluster, at the point where it matters:

```python
df = spark.read.parquet("/data/events")
filtered = df.filter("event_date >= '2026-01-01'")
repartitioned = filtered.repartition(96)
result = repartitioned.groupBy("customer_id").count()
result.write.mode("overwrite").parquet("/data/output")
```

The number there is not a magic value. It is an example, chosen to match the cluster in front of you. The point is the habit: before you scale the cluster, check whether the stage has enough tasks to use the cluster it already has.

The same habit works in the other direction. If a stage has thousands of tiny tasks, coalescing them down, or letting a shuffle setting produce fewer partitions, can make the job faster without touching the logic at all.

Either way, you are not guessing. You are matching the task count to the machine you are paying for.

![Too few, just right, and too many tasks](/assets/img/databricks-edu-series/diagram-13-3-three-patterns.svg)

A few habits follow from this, and they are worth building deliberately.

Check the task count before you check anything else about a slow stage. Duration tells you something is slow. The task count tells you whether parallelism was ever on the table.

Compare tasks inside one stage to each other, not to tasks in other stages. Similar task times mean the work was spread evenly. One task dragging far behind the rest means something is uneven, and that is a different investigation.

Do not scale the cluster until the task count justifies it. If a stage has four tasks, a bigger cluster is just a bigger bill for the same four tasks.

And write down what you found, in one plain sentence, before you change anything.

"Stage 3: 4 tasks on a 96-core cluster, each task ran for over an hour" is a diagnosis. "The job was slow" is not.

That sentence tells you the fix, and it tells the next person who looks at the job exactly where to start.

A job is an action. A stage is a chunk of that action between shuffles. A task is one partition of work on one core.

Count the tasks first. If the count does not make sense, nothing else you tune will make sense either.

Which stage of yours would you count first, if you opened the Spark UI right now?
