---
layout: daily-post
title: "Z-ordering: when it helps and when it's a waste of compute"
description: "A query for one customer read almost every file in the table, because that customer's rows were scattered everywhere. Z-ordering groups similar values together so the engine can skip files — but only when the questions stay the same."
date: 2026-10-31
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

Part of my daily Databricks series — the hardest topics, explained simply.

A dashboard query was slow, and the usual suspects were all innocent.

The query filtered a large events table down to one customer. It was a simple filter, on a single column, and the table was partitioned by date. The team had done the sensible thing: partition by the column most queries seemed to use. So why did a query for one customer still read so much data?

The execution plan showed no shuffle problem and no skew. The query was just reading far more than it needed to.

The problem was not the query. It was where the customer's rows lived.

A Delta table is a collection of files, and each file keeps statistics about the data inside it, most importantly the minimum and maximum values for each column. Before reading a file, the engine can look at those statistics and ask a simple question: could this file possibly contain a row I need?

If the answer is no, the file is skipped entirely. It is never opened. That is data skipping, and it is one of the cheapest performance wins in all of Databricks, because a skipped file costs almost nothing.

But data skipping only works when the statistics are useful. And statistics are only useful when similar values live in the same files.

In that events table, one customer's rows were scattered across nearly every file. The table was partitioned by date, and each day's files held a mix of every customer active that day. So the minimum and maximum customer values in each file covered almost the whole range. No file could be skipped, because every file might contain the customer.

That is the core idea behind Z-ordering. It is not a new kind of index. It is a way of laying data out so that rows with similar values end up in the same files, and the statistics on those files become narrow enough to skip with.

![diagram 16](/assets/img/databricks-edu-series/diagram-16-1-scattered-vs-grouped.svg)

Here is how it works in plain terms.

Sorting a table by one column is easy: all the rows for one customer sit together. But most queries do not filter on one column. They filter on two or three — a customer and a region, say, or a product category and a date range. Sorting by one column does nothing for the other.

Z-ordering handles several columns at once. It interleaves their values, a bit like shuffling two decks of cards together in a careful order, so that rows that are close on any of the chosen columns tend to land in the same files. Instead of sorting by one column and hoping the others cooperate, you arrange the data so that closeness on several columns all point in the same direction.

Once the data is laid out that way, the file statistics change completely. One file might hold customers in a narrow range, another file a different narrow range. A query for a single customer can look at those ranges, skip the files that cannot possibly contain that customer, and read only the few that can.

That is the whole trick. Z-ordering does not make the engine faster. It makes its existing skipping mechanism work, by giving it statistics worth trusting.

![diagram 16](/assets/img/databricks-edu-series/diagram-16-2-file-skipping.svg)

Now for the wrong pattern, because this is a feature people reach for too eagerly.

The first wrong pattern is assuming partitioning already solved the problem. Partitioning helps when the query filters on the partition column. A table partitioned by date is fast for queries that filter by date. It does nothing for a query that filters by customer, because that customer's rows are still spread across every date partition. Partitioning and Z-ordering solve different problems, and one does not replace the other.

The second wrong pattern is compacting without Z-ordering and expecting the same result. A plain OPTIMIZE rewrites small files into larger ones, which is good housekeeping, but it does not rearrange rows by value. The files get bigger, but the customer's rows are still scattered. Compaction fixes file count. Z-ordering fixes file layout. They are different jobs.

The third wrong pattern is Z-ordering by everything. Adding more columns to a Z-order does not make it proportionally better. Each extra column dilutes the clustering, because the layout has to satisfy more dimensions at once. Past a few columns, the benefit fades and you are paying for a full rewrite to get almost nothing back.

Here is what the fix looks like on Delta Lake. You run OPTIMIZE with a ZORDER BY clause, naming the columns your queries actually filter on:

```sql
OPTIMIZE events
ZORDER BY (customer_id, region)
```

That rewrites the table, grouping rows so that similar customer and region values land together. The next time a query filters on customer, the engine can skip most of the files instead of reading them all. Just the one or two columns that show up again and again in filters — picking those is the real work. Look at the queries people actually run, not the columns that sound important.

![diagram 16](/assets/img/databricks-edu-series/diagram-16-3-helps-vs-waste.svg)

So when does Z-ordering actually help?

It helps when the same filters come up over and over. A dashboard that always filters by customer, or a report that always filters by product category, is a perfect candidate. The layout matches the questions, so the skipping pays off every single time the query runs.

It helps on large tables, where reading the whole table is genuinely expensive. On a small table, skipping files saves so little that it is not worth thinking about.

It helps when the filter column is not the partition column. That is the gap Z-ordering exists to fill: the queries that partitioning cannot help.

And it helps when the filtered values are selective, meaning a typical query needs only a small slice of the data. If every query reads most of the table anyway, there is nothing to skip, and no layout trick will save you.

When is it a waste of compute? More often than people admit.

It is a waste on a small table, where the rewrite costs more than the skipping ever saves.

It is a waste when the filters keep changing. Z-ordering is a bet on a particular set of columns. If next month's queries filter on completely different columns, the layout no longer matches the questions, and the benefit is gone until someone rewrites the table again.

It is a waste on a table that is written far more often than it is read, or where new data arrives constantly. A Z-ordered layout decays as new, unordered data is appended. Keeping it fresh means rewriting the table again and again, and on a fast-moving table that treadmill can cost more than the queries it speeds up.

It is a waste when the partition column already answers the question. If every query filters by date and the table is partitioned by date, Z-ordering adds nothing.

And it is a waste as a first move. Before reaching for it, check the simpler things: is the query filtering on a column at all, is the table partitioned sensibly, is the file count sane. Z-ordering is for a table whose access pattern is already understood, not a substitute for understanding it.

One more thing worth knowing: on newer Delta tables, Liquid Clustering is the successor to this idea, maintaining a similar layout automatically as data changes instead of needing a manual rewrite. That is a topic of its own. The lesson here is about layout matching questions.

So the checklist before you Z-order anything is short:

- Which columns do the repeated queries actually filter on?

- Is one of those columns already the partition column?

- Is the table large enough that skipping files matters?

- Will those filters still be the same filters in a few months?

- How often does new data arrive, and who will pay to re-run the rewrite?

Answer those five, and Z-ordering stops being a magic setting. It becomes a deliberate trade: one expensive rewrite, in exchange for cheaper reads, for as long as the questions stay the same.

The dashboard query did not need a bigger cluster. It needed its customer's rows to live in the same neighbourhood, instead of scattered across the whole table.

Which columns do your most-run queries actually filter on?
