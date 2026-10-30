---
layout: daily-post
title: "The small-files problem"
description: "A query that used to finish in seconds started taking minutes, and the query had not changed. The table was stored as thousands of tiny files, and the engine pays a toll on every one."
date: 2026-10-30
categories: [daily, databricks-edu-series]
---

Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.

Part of my daily Databricks series — the hardest topics, explained simply.

A query that used to finish in seconds started taking minutes, and nobody could say why.

The query had not changed. The cluster had not changed. The data had grown, but slowly, and not by enough to explain it. So the team did what teams usually do: they blamed the cluster, then they blamed the query, then they opened the execution plan and went looking for a slow operator.

The plan looked fine. No giant shuffle, no skew, no obvious bottleneck. The query just spent a long time doing something before it seemed to start working at all.

Then someone looked somewhere nobody had looked yet: not at the query, and not at the cluster, but at the table itself. Not the rows. The files.

The table held a reasonable amount of data. It was stored as an enormous number of tiny files. That was the whole problem.

A table on a lakehouse is not one thing. It is a collection of files, and every query has to deal with each file individually.

Before a single row is read, the engine has to list the files, open each one, read its metadata, and then close it again. That work is paid per file, not per row. It does not matter whether a file holds a million rows or ten rows. Opening it costs roughly the same.

So a table made of a few large files is cheap to start reading. A table made of thousands of tiny files is expensive to start reading, even when both tables hold exactly the same data.

Think of it like this. Reading one book takes a while, but you open it once. Reading the same words spread across a thousand sticky notes means picking up, reading, and putting down a thousand separate notes. The words are the same. The work is not.

That is the small-files problem. The query is not slow because the data is big. It is slow because the data is broken into too many pieces, and the engine pays a toll on every piece.

![diagram 15](/assets/img/databricks-edu-series/diagram-15-1-tiny-vs-large.svg)

How does a table end up like this? Usually nobody decides to make it happen. It creeps in through normal, reasonable-looking writes.

The most common cause is streaming. A streaming job writes a small batch every few minutes, and each batch becomes its own set of files. Run that for weeks and the table quietly accumulates thousands of files, each holding a few minutes of data.

Small daily appends do the same thing. A job that adds one small file a day looks harmless for a month, and then a year later the table has hundreds of files where a handful would do.

Over-partitioning is the third way in. Partitioning by a column with too many distinct values — one partition per day per region per category, say — splits every write into dozens of tiny files instead of a few sensible ones. Each partition looks tidy on its own. Together, they are a mess.

The cruel part is that nothing looks broken. The row counts are right. The queries return the right answers. The table itself looks completely normal until you count its files.

That is why this problem survives so long. Everyone investigates the query, because the query is what feels slow. The file layout is invisible unless you go looking for it.

There are a few signs worth knowing.

The first is a query that is slow to start and then fast once it gets going. If most of the time goes to the beginning, before real work seems to happen, suspect file overhead.

The second is a table where the file count is wildly out of proportion to the data. A modest table with thousands of files is a table with a layout problem, not a data problem.

The third is a table whose file count keeps growing faster than its data. That means the writer is the problem, and it will keep getting worse until someone fixes the writer.

Here is what the wrong pattern looks like in practice.

A streaming job writes every micro-batch straight to the table, exactly as it arrives, with no thought about file size:

```python
events.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/checkpoints/events") \
    .start("/tables/events")
```

Nothing in that code is incorrect. It runs, it appends, and it keeps up with the stream. But every micro-batch lands as its own small files, and the table gets a little harder to read with every batch.

The fix has two halves, and you need both.

The first half is compaction: rewriting the small files into fewer, larger ones. On Delta Lake, that is what OPTIMIZE does. It reads the small files and writes the same data back as a smaller number of sensibly sized files, without changing a single row:

```sql
OPTIMIZE events
```

Run that, and the same query that crawled through thousands of files now opens a handful instead. No query logic changed. No cluster changed. Only the layout changed.

The second half is fixing the writer, because compaction alone is a treadmill. If the writer keeps producing tiny files, you will be compacting forever.

That usually means one of two changes. Either batch the writes so each one lands as a reasonable amount of data, or coalesce before writing so a write that would have produced many small files produces a few larger ones:

```python
events.coalesce(4).write.format("delta").mode("append").save("/tables/events")
```

Coalescing is not free, and it is not a cure-all. It trades a little write-time work for much cheaper reads, and on a table that gets read far more often than it gets written, that trade is almost always worth making.

![diagram 15](/assets/img/databricks-edu-series/diagram-15-2-where-time-goes.svg)

A few cautions, because compaction is one of those fixes people overdo once they discover it.

Compaction rewrites data, and rewriting data costs compute. Running it constantly on a table that barely changes is wasteful. Run it on a schedule that matches how fast the table fragments, not on every write.

Also, compaction and cleanup are different jobs, and cleanup is the dangerous one. VACUUM deletes old file versions, and if it deletes versions someone still needs for time travel, that history is gone. Keep the retention window longer than the oldest version anyone might still query, and never let cleanup run on autopilot without knowing what it removes.

And partitioning deserves a second look whenever a table fragments. If every write fans out into dozens of tiny partitions, no amount of compaction fixes the root cause. Fewer, broader partitions, or dropping a partition column that adds nothing, often does more than any scheduled job.

So the checklist for a table that reads slowly is short:

- How many files does the table have, compared to how much data it holds?

- Is the file count growing faster than the data itself?

- Is the writer producing small files on every batch or every day?

- When was the table last compacted, and does it need it again?

- Is a partition column splitting writes into pieces too small to be useful?

Answer those five, and the small-files problem stops being invisible. It becomes a maintenance job with a clear fix.

![diagram 15](/assets/img/databricks-edu-series/diagram-15-3-wrong-vs-fix.svg)

There is a habit underneath all of this that is worth building deliberately.

Treat file layout as part of pipeline health, not as an afterthought. A pipeline that writes clean data in a terrible layout is still a pipeline with a problem, and it will charge you for that problem on every single read, forever, until someone looks at the files.

Check the layout whenever a writer changes. Check it when a table starts a new ingestion pattern. Check it when a query that used to be fast quietly stops being fast.

The data did not get bigger. The pieces just got smaller. And once you see that, the fix is straightforward.

How many files is your most-read table hiding?

