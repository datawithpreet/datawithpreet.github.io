---
layout: daily-post
title: "Reading the Spark UI without panicking"
description: "The Spark UI stops being intimidating once you read three screens in order: Jobs, Stages, and Storage. Where the time went, what kind of problem it is, and whether caching is part of the story."
date: 2026-10-27
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A dashboard job that used to finish in twenty minutes took two hours one morning, and nobody knew why.

The team opened the Spark UI, and that was where the investigation stalled.

There were tabs everywhere. Jobs, Stages, Storage, Environment, Executors, SQL. Each one was full of numbers, and every number looked like it could be the problem.

Someone suggested adding more workers. Someone else suggested restarting the cluster. A third person opened the raw driver log and started scrolling, which is a bit like opening a phone book to find out why your car will not start.

Nobody was being careless. They were just starting in the wrong place.

The Spark UI looks intimidating because it shows you everything at once. It stops being intimidating once you realise you only need three screens, in a fixed order.

Those three screens are Jobs, Stages, and Storage.

Everything else is detail you go to later, once one of those three has told you where to look.

Start with Jobs.

The Jobs screen is the summary of the whole run. Each job is one action your code triggered, like a count, a write, or a collect.

For each job you get a duration, a status, and the number of stages it ran. That is already enough to answer the first question: which part of the run actually took the time?

A slow run is rarely slow everywhere. Usually one job dominates, and the rest are quick.

So do not start by staring at the whole run. Find the long job, note its duration, and click into it.

Next, go to Stages.

A job is made of stages, and a stage is a set of tasks that can run in parallel without shuffling data between machines.

The Stages screen shows you, for each stage, how many tasks ran, how long they took, and how much data was shuffled in and shuffled out.

This is where most slow jobs explain themselves, if you know what to look for.

First, look at the task count.

If a stage ran on four tasks while the cluster had dozens of cores sitting idle, the job was never really parallel. That is a partitioning problem, not a compute problem, and adding workers will not fix it.

If a stage ran on thousands of tiny tasks, the opposite happened. Each task did almost nothing, but each one still cost scheduling time. That is also a partitioning problem, in the other direction.

Then look at the distribution of task times, not just the average.

A healthy stage has tasks that finish in roughly similar times. A sick stage has most tasks finishing quickly and one or two dragging on far longer than the rest.

That pattern has a name, and it is worth recognising on sight: skew.

One key, one partition, or one chunk of data is carrying a wildly disproportionate share of the work, and the whole stage waits for that one task.

Then look at shuffle read and shuffle write.

A stage with a huge shuffle write moved a lot of data between machines. A stage with a huge shuffle read had to wait for that data to arrive.

If the shuffle numbers are large and the task times are long, the job is probably slow because of data movement, not because the calculations are hard. That points you toward the join, the grouping, or the partitioning that caused the shuffle, rather than toward the code doing the arithmetic.

Those three checks are usually enough to say what kind of problem you have, even before you know the exact fix.

![Three screens to read in order](/assets/img/databricks-edu-series/diagram-12-1-three-screens.svg)

The third screen is Storage, and people either skip it or misunderstand it.

Storage shows you what is cached: which datasets are held in memory across the cluster, how much space they take, and what fraction of each one is actually cached.

The Storage screen tells you whether that caching bet paid off.

If a dataset you expected to be cached shows a small cached fraction, it did not fit, or it was evicted, and later stages are re-reading it from disk or recomputing it from scratch. That is a real finding, and it explains a whole class of mysteriously slow repeat queries.

If a dataset is cached but nothing ever reuses it, you paid the storage cost for nothing. The memory it occupies is memory other work cannot use.

Either way, the screen answers a simple question: is the data I thought was in memory actually there?

![Task times showing one long skewed task](/assets/img/databricks-edu-series/diagram-12-2-stage-tasks.svg)

Now, here is the wrong pattern, and it is the one the team in the opening story fell into:

- Open every tab at once and try to hold all the numbers in your head.

- Chase the first red or unusual number you see, wherever it happens to be.

- Change something big, like the cluster size, before you know which stage was slow.

- Treat the driver log as the first place to look, instead of the last.

That pattern feels thorough, because you looked at a lot of things. It is not thorough. It is scattered.

It also leads to the most expensive mistake in Spark debugging: fixing a problem you do not have.

Adding workers to a job that ran on four tasks does nothing, because the job was never using the workers it already had. Restarting a cluster does nothing for a skewed stage, because the skew will be there again on the next run.

Here is the fix, and it is a checklist, not a setting:

- Jobs first: find the one job that took most of the time.

- Stages next: check the task count, the spread of task times, and the shuffle size for that job's stages.

- Storage last: check whether the datasets you expected to be cached actually are.

- Only then decide what to change, and change one thing.

That order matters. Jobs tells you where the time went. Stages tells you what kind of problem it is. Storage tells you whether caching is part of the story.

If you do those three checks and still cannot see the problem, that is when you go deeper: the SQL plan for the query shape, the executor metrics for memory pressure, and finally the driver log for the actual error.

Notice the order there too. The log is last, not first.

The log tells you what failed. These three screens tell you what was slow, a different question.

![How to read one stage row](/assets/img/databricks-edu-series/diagram-12-3-stage-row.svg)

A few habits follow from that, and they are worth building deliberately.

Do not compare a stage to other stages in other jobs. Compare its tasks to each other. A stage whose tasks all take ten minutes is a different problem from a stage whose tasks take ten seconds except one that takes ten minutes, even though both stages look slow from the outside.

Do not treat a long stage as proof that the code in that stage is heavy. A stage can be long because it waited for a shuffle, because it waited for one skewed task, or because it re-read data that should have been cached. The stage tells you where the time went. The task pattern tells you why.

And note what you found, in plain words, before you change anything.

"Job 4, stage 7: 200 tasks, most finished in 8 seconds, one ran for 40 minutes" is a diagnosis. "It was slow" is not.

Write that sentence down, and the fix usually suggests itself: one long task points to skew, a huge shuffle points to the join or grouping, a low cached fraction points to caching.

The Spark UI is not a test you have to pass. It is a set of three questions, asked in order.

Where did the time go? What kind of problem is it? Is caching part of the story?

Answer those three, and the UI stops being a wall of numbers and starts being what it was meant to be: a short walk from "this job is slow" to "this is the stage, and this is why."

Which job of yours would you open first, if you only looked at those three screens?

That is the job to start with tomorrow morning, before anything else changes.
