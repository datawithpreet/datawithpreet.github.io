---
layout: daily-post
title: "Driver vs. executors: where your code actually runs"
description: "A job died on the driver while a ten-worker cluster sat idle. Where your code actually runs, why collect() funnels everything to one machine, and how to keep big data distributed."
date: 2026-10-22
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A job failed at 2 AM, and the error message made no sense.

The cluster was large. Ten workers, plenty of memory, plenty of cores. The notebook cell was small. It read a table, did a bit of filtering, and then pulled the result back to the notebook with a single `collect()` so the analyst could loop over the rows in plain Python.

The cell ran for a while, then died with an out-of-memory error. On the driver.

The cluster was not out of memory. One machine was. The driver is a single machine, and the code had just asked it to hold the entire result set by itself, while nine workers sat idle.

Half of all Spark confusion comes from not knowing which machine runs which line of your code. Once you see that split clearly, a whole class of mysterious failures stops being mysterious.

Here is the mental model, in one paragraph.

The driver is the coordinator. It runs your notebook, builds the plan, and talks to the cluster. It does not do the heavy lifting.

The executors are the workers. They live on the worker machines, read the data, run the transformations, and hold the partitions in memory. When you write a transformation like `filter` or `groupBy`, that work happens on the executors, spread across the cluster.

The driver plans. The executors execute. If you remember only one sentence from this article, make it that one.

![The driver plans, the executors execute](/assets/img/databricks-edu-series/diagram-7-1-driver-vs-executors.svg)


That split explains why one cell can return instantly and still do nothing, and why another can crash a huge cluster. It is also the most common beginner mistake in Databricks: treating the driver like it is the cluster.

When you write this line, nothing heavy happens yet:

```python
clean = events.filter(events.event_date.isNotNull())
```

The driver records the plan. It does not read the data. The data is still sitting in storage, untouched, waiting for an action.

When you write this line, the executors go to work:

```python
clean.write.saveAsTable("clean_events")
```

Now the driver sends the plan to the executors, and each executor processes its own partitions in parallel. That is the distributed part, and it is the part you paid for when you rented the cluster.

The trouble starts with the lines that quietly pull everything back to the driver.

The worst offender is `collect()`.

`collect()` takes every row from every executor and ships it to the driver, into the driver's memory, as a single Python list. On a small result — a few hundred aggregated rows — that is fine, and it is exactly what `collect()` is for.

On a large result, it is a disaster. The executors did the hard work in parallel, and then you funnelled all of it through one machine. The driver runs out of memory, the job dies, and the error blames the driver even though the cluster had plenty of room. The cluster did not fail. The funnel failed.

![collect() funnels everything to one machine](/assets/img/databricks-edu-series/diagram-7-2-collect-funnel.svg)


The same trap hides in other, friendlier-looking lines.

`toPandas()` does the same thing as `collect()`, with a pandas DataFrame as the destination. It is convenient, and it is just as dangerous on a large result.

Looping over `collect()` row by row in Python is the same trap with extra steps. The loop itself runs on the driver, one row at a time, using one machine, while the cluster waits. You have turned a distributed job back into a laptop script, and you are paying cluster prices for laptop performance.

And then there is the trap that does not even look like a data movement problem: code that only exists on the driver.

Suppose you load a small lookup dictionary in your notebook, on the driver, and then try to use it inside a transformation. That transformation runs on the executors, on different machines, where your dictionary does not exist. Spark will try to ship it along, and sometimes that works, and sometimes it fails with a serialization error that reads like gibberish. The error is not really about serialization. It is about location. The thing you referenced lives on the driver. The code that needs it runs somewhere else.

Here is the wrong pattern, and I have seen it in production notebooks more times than I can count:

```python
# THE TRAP — the cluster does the work, then the driver tries to hold it all
events = spark.read.table("events")
clean = events.filter(events.event_date.isNotNull())
daily = clean.groupBy("event_date").count()

rows = daily.collect()  # every row, shipped to one machine
for row in rows:
    print(row.event_date, row.count)
```

If `daily` has a few thousand rows, this works, and nobody notices the design flaw. If the grouping is finer — by customer, by session, by device — the result can be millions of rows, and the driver collapses under a result the executors handled easily. The job was distributed right up until the last line, and then it was not.

The fix is not a clever setting. It is a habit: keep big data on the executors, and only bring small answers back to the driver.

First, do the heavy work distributed, and aggregate before you collect. If you need a summary, compute the summary on the executors, so the thing you pull back is already small.

Second, if you need a small lookup on every executor, broadcast it properly instead of hoping Spark ships a driver-side object for you. A broadcast variable is Spark's way of sending one small copy to every worker, on purpose, instead of by accident.

Third, if you genuinely need to look at rows, look at a sample. `show()` and `limit()` let the driver see a little data without asking it to hold all of it.

Here is the fixed version of the same job:

```python
# THE FIX — aggregate on the executors, bring back only a small answer
events = spark.read.table("events")
clean = events.filter(events.event_date.isNotNull())
daily = clean.groupBy("event_date").count()

daily.write.saveAsTable("daily_counts")  # big result stays distributed
daily.orderBy("event_date").limit(20).show()  # driver sees 20 rows, not millions

summary = daily.agg({"count": "sum"}).collect()  # one small row, safe to collect
print("Total events:", summary[0][0])
```

![Keep big data distributed, collect only small answers](/assets/img/databricks-edu-series/diagram-7-3-keep-big-distributed.svg)

Notice what changed, and what did not. The filtering and grouping are identical. The difference is entirely about where the result lives afterwards. The full result stays in a table, where it belongs. The driver only ever holds twenty rows for a peek, and one row for the total.

That is the rule to carry around: if the result is small, `collect()` is fine. If you are not sure it is small, do not collect it.

There are a few more lines worth knowing by heart, because they tell you where your code runs.

Code that runs on the driver includes your notebook cells themselves, the plan building, `collect()`, `toPandas()`, and any plain Python loop over collected rows.

Code that runs on the executors includes transformations like `filter`, `select`, `groupBy`, and `join`, and the functions inside them — the lambda in a `map`, the expression in a `withColumn`, the logic in a user-defined function.

A user-defined function is a good test of whether you have the model. You define it on the driver, in your notebook. It executes on the executors, once per row, on whichever machine holds that row's partition. If it references something that only exists on the driver, that reference has to travel. If it cannot travel, the job fails with a serialization error, and you will have to translate that yourself.

The driver is not useless. Orchestration belongs there. Small summaries belong there. A final check, a printed total, a chart of an aggregated result — all driver work, all fine, because the data is already small by then.

The mistake is never "using the driver." The mistake is using the driver as if it were the cluster.

A useful question to ask before you run any cell is this: where does this line actually run, and how much data does it move to that place?

If the answer is "the executors, in parallel," you are using the cluster.

If the answer is "the driver, all of it," you have a funnel, and funnels break at exactly the worst time — usually at 2 AM, on a result that was fine yesterday and grew overnight.

Next time a job dies on the driver while the cluster looks healthy, ask yourself: did I just ask one machine to hold what ten machines produced?
