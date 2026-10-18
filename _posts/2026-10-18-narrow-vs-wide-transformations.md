---
layout: daily-post
title: "Narrow vs. wide transformations"
description: "The single most useful distinction in Spark: narrow transformations stay local, wide ones shuffle. A story about a one-line groupBy that made a job twenty times slower, and the fix."
date: 2026-10-18
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

A pipeline runs in twelve minutes. Someone adds one line — a `groupBy` to compute per-user totals — and it runs in four hours. No bug. No skew. No bad config. The new line is correct Spark, written the way the docs show it. And it just made the job twenty times slower.

The difference between the fast version and the slow version is a single word: narrow vs. wide. It is the most useful distinction in Spark, and almost nobody learns it first. Every slow job I've ever debugged traces back to it — not to the cluster size, not to the code style, to which kind of transformation the code actually is.

Here is the definition, plainly. A **narrow** transformation is one where each output partition needs data from at most one input partition. `filter`, `map`, `withColumn` — each worker handles its own slice of the data, in parallel, and nothing crosses the network. A **wide** transformation is one where an output partition needs data from many input partitions. `groupBy`, `join`, `distinct`, `repartition` — before the real work can start, the cluster has to physically move data across machines so that matching keys end up together. That movement is the shuffle, and it is the most expensive thing in Spark.

![Narrow vs wide: each worker processes its own data locally, vs data moving across machines to regroup by key](/assets/img/databricks-edu-series/narrow-wide-01-local-vs-network.svg)

Think of a mailroom. Ten clerks each have a pile of letters. You tell each clerk to stamp their own pile — that's narrow. Everyone works at once, nobody moves, it's done in minutes. Now you tell them to sort all the mail by zip code — that's wide. Every clerk's pile has to be split up and redistributed across the room so all the 02125 letters end up with one person. The stamping was the easy part. The walking around the room is where the hour went.

This is why the one-line change was so brutal. The pipeline before it was all narrow operations: reading, filtering, transforming columns. Fast, local, parallel. The `groupBy` was the first wide operation in the whole job — the first moment anything had to travel. And it traveled: every row in the table, across the network, reorganized by key, written to disk on the other side. The calculation itself (adding up a column) took seconds. The moving took hours.

There is a visible signature for this, and it's in the Spark UI. Narrow transformations chain together inside a single stage and run fast. Every wide transformation ends the stage, writes shuffle files, and starts a new one. So when you open a job's DAG and count five stage boundaries, you are counting five wide transformations — five moments where the cluster stopped computing and started relocating data. If a job is slow, count the stage boundaries first. That's your suspect list.

![Spark stage boundary: narrow operations stay in one stage, the wide operation's shuffle starts a new stage](/assets/img/databricks-edu-series/narrow-wide-02-stage-boundaries.svg)

The trap almost always has the same shape: the wide operation is fed the widest possible data. Here's the classic version:

```python
# THE TRAP — a wide operation on the widest possible data
result = (
    spark.read.table("events")                      # full table: all columns, all history
    .groupBy("user_id", "event_type")
    .agg(F.sum("amount").alias("total"))
)
report = result.filter(F.col("event_type") == "purchase")
```

Read that carefully. The filter keeps only purchase events — and it runs *after* the groupBy. Every event type got shuffled across the network, regrouped, written to disk, and then thrown away. The majority of the movement bought nothing. This pattern is everywhere because it reads naturally: aggregate everything, then pick what you want. It is correct. It is also paying to relocate data you were about to discard.

The fix is a ordering rule, not a clever trick: **narrow first, wide last.** Shrink the data with cheap local operations before it ever crosses the wire.

```python
# THE FIX — narrow first, wide last
result = (
    spark.read.table("events")
    .filter(F.col("event_type") == "purchase")      # narrow: no data moves
    .select("user_id", "amount")                    # narrow: drop the columns you don't need
    .groupBy("user_id")                             # wide: now it moves far less
    .agg(F.sum("amount").alias("total"))
)
```

![Wrong vs right: groupBy on the full table shuffles everything, filtering first shuffles far less](/assets/img/databricks-edu-series/narrow-wide-03-wrong-vs-right.svg)

Same answer, a fraction of the shuffle. The filter and the select each run locally on every worker, in parallel, for free. The groupBy still shuffles — it has to, that's its nature — but it shuffles a sliver of what it used to.

Two more habits that come from the same rule. First, watch out for wide operations stacked back to back. A join shuffles on the join key; a groupBy right after it shuffles again, on a dataset that's now *bigger* than what you started with. Whenever you see join-then-aggregate, ask whether you can aggregate first and join the small result to the dimension table instead. The second wide operation should always work on the smallest data you can give it.

Second, be suspicious of `distinct()` on full rows. `df.distinct()` on a two-hundred-column table shuffles every byte of every row. If you only need distinct keys, `df.select("user_id").distinct()` moves almost nothing by comparison. Same function name, wildly different cost — the difference is entirely what you feed it.

None of this is about avoiding wide transformations. You can't — grouping, joining, and deduplicating are the whole point of data work. It's about respecting what they cost. A wide operation is a moment where your cluster stops being a parallel computer and becomes a moving company. You want as few of those moments as possible, each carrying as little as possible.

In my healthcare data work this is the daily reality. Claims joined to members joined to providers, each on a different key, each a full reshuffle of billions of rows — and then a groupBy on top, fed by the widest version of everything. The pipelines that hurt are never the complicated ones. They're the ones with three wide operations in a row that nobody ever counted in the Spark UI.

So here's the habit. Before you write a `groupBy`, a `join`, or a `distinct`, pause and ask: is this data as small as it can be? Filter first. Select the columns you need. Then go wide. The compute was never the problem — the moving was.

What's the widest operation in your pipeline right now — and what is it carrying across the network that it doesn't need to?
