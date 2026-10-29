---
layout: daily-post
title: "Why your 1TB query takes three hours"
description: "A slow query on a large table rarely has one problem. Walk five suspects in order: shuffle, tiny files, skew, no pruning, and the wrong join strategy."
date: 2026-10-29
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A query was supposed to finish before the morning meeting. It was still running at lunch.

Nobody had changed the logic. The data had grown, but not that much. The cluster was the same size it had always been. So the team did what teams usually do: they stared at the query, they stared at the cluster, and they argued about which one to blame.

One person said the cluster was too small. Another said the query was badly written. A third opened the execution plan and started reading it top to bottom, looking for the one slow operator that would explain everything.

There was no single slow operator. That is the first thing to understand about a slow query on a large table.

A query that takes three hours usually does not have one problem. It has several small problems stacked on top of each other, and each one adds time. Fix only one and the query still feels slow, which makes it look like the fix did not work.

The useful way to approach it is a checklist, in order. Walk it from top to bottom, and stop at the first thing that is badly wrong. That is usually where most of the time went.

The checklist has five suspects: shuffle, tiny files, skew, no pruning, and the wrong join strategy.

Start with shuffle, because it is the most common and the most expensive.

Shuffle is what happens when data has to move between machines before the next step can run. A filter or a simple calculation can run where the data already sits. A grouping, a sort, or a join usually cannot. The data has to travel across the network, get sorted, and land somewhere new.

Moving data is slow. Calculating is fast. So a query that shuffles a large table several times will spend most of its time travelling, not thinking.

You can spot one in the plan: look for exchanges, and how much data they move. If the plan shuffles the full table more than once, that is your first suspect. Extra workers help a calculation. They do not make the network faster.

![diagram 1 five suspects](/assets/img/databricks-edu-series/diagram-14-1-five-suspects.svg)

The second suspect is tiny files.

A table that grew by small daily writes, or by streaming writes, often ends up as thousands or millions of small files. Every file has to be listed, opened, and read separately, and that overhead is paid before a single row is processed.

So a query can spend a long time just getting started. It looks like it is reading data, but it is really doing paperwork: opening files, checking metadata, and closing them again.

This is easy to miss, because the table itself looks normal. Only the file layout is wrong, and it is invisible until you look for it.

If a table has far more files than it needs, compacting it — rewriting it into fewer, larger files — often makes the same query dramatically faster without changing a line of query logic.

The third suspect is skew.

Skew means one key holds far more data than the rest. One customer, one region, one null value that swallowed a huge share of the rows. Most tasks finish quickly, and then everything waits for the one task holding the giant key.

Skew is cruel because the averages look fine. The job cannot finish until its slowest task finishes.

You spot skew the same way every time: task times inside one stage that are wildly uneven. Most tasks short, one task dragging on. That pattern is skew until proven otherwise, and it is a different fix from everything else on this list.

The fourth suspect is no pruning.

Pruning means skipping data you do not need before you read it. If a table is partitioned by date, and your query only needs one month, a good plan reads only that month's files. If the query is written so the filter cannot be pushed down to the storage layer, it reads everything and filters later.

That is the difference between reading a small slice and reading the whole table. On a large table, it is the difference between minutes and hours, and it comes from one thing: whether the filter reaches the files, or only reaches the rows after they have been loaded.

Filters written late, filters hidden inside a function, or filters applied after a join can all break pruning. The query still returns the right answer. It just reads far more data to get there.

The fifth suspect is the wrong join strategy.

When Spark joins two large tables, it usually shuffles both sides and matches them up. That is the safe default, and it is expensive. But when one side of the join is small — a lookup table, a dimension table, a list of a few thousand rows — shuffling both sides is pure waste. Shipping the small side to every worker, a broadcast join, avoids one whole shuffle.

The reverse mistake is just as common: forcing a broadcast on a table that is too large for every worker to hold. Either way, the join strategy does not fit the data, and the query pays for it.

So the checklist, in order, is this:

- How much data is being shuffled, and can a shuffle be removed?

- How many files is the query opening, and are they tiny?

- Are task times even, or is one task holding everything up?

- Is the filter reaching the files, or only the rows?

- Is the join strategy right for the sizes on both sides?

Run through those five before you touch anything else. Most slow queries fail at least one, and many fail two or three at once.

![diagram 2 checklist order](/assets/img/databricks-edu-series/diagram-14-2-checklist-order.svg)

Here is what the wrong pattern looks like in practice.

A query reads a whole multi-year table, joins it to another large table, groups the result, and only then worries about which rows it actually needed:

```python
events = spark.read.table("events")
customers = spark.read.table("customers")
joined = events.join(customers, "customer_id")
recent = joined.filter("event_date >= '2026-01-01'")
result = recent.groupBy("customer_id").count()
```

Nothing in that code is incorrect. It returns the right answer. But it reads every year of events, shuffles both tables for the join, and only filters at the end, after the expensive work is done.

The fix is not a bigger cluster. The fix is to move the cheap decisions before the expensive ones, and to give the join the smallest inputs you can:

```python
events = spark.read.table("events")
customers = spark.read.table("customers")
recent = events.filter("event_date >= '2026-01-01'")
small_customers = customers.filter("region = 'north'")
joined = recent.join(broadcast(small_customers), "customer_id")
result = joined.groupBy("customer_id").count()
```

Filter first, so pruning can skip the files you do not need. Shrink the small side before the join, so a broadcast becomes possible. Only then group and aggregate.

The point is the order of operations, not any single trick. Cheap steps first: filter, shrink, prune. Expensive steps last: shuffle, join, aggregate. Written the other way round, the engine does its hard work on data it was going to throw away anyway.

![diagram 3 wrong vs fix](/assets/img/databricks-edu-series/diagram-14-3-wrong-vs-fix.svg)

A few habits follow from this checklist, and they are worth building deliberately.

Check the plan before you scale the cluster. A bigger cluster speeds up calculation. It does not fix a shuffle, tiny files, or a filter that never reaches the storage layer.

Fix one suspect at a time, and re-check after each fix. Slow queries stack problems, so the second one only becomes visible once the first is gone.

And write down what you found, in one plain sentence, before you change anything.

"The query shuffled the full table twice and read every year to answer a question about one month" is a diagnosis. "The query was slow" is not.

That sentence tells you the fix, and the next person exactly where to start.

A three-hour query is rarely one disaster. It is usually a shuffle you did not need, files that are too small, one key holding everything, a filter that arrived too late, or a join strategy that does not fit the data.

Walk the checklist in order. The first thing that is badly wrong is usually where most of the three hours went.

Which suspect would you check first on your slowest query?
