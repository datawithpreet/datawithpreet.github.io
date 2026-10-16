---
layout: daily-post
title: "The pandas trap: using only the driver on a ten-node cluster"
description: "Experienced data scientists still write pandas on Databricks, funneling everything into driver memory while nine workers sit idle. The one-line mistake, how to spot it, and the fix."
date: 2026-10-16
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

You open a Databricks notebook on a fresh ten-node cluster and type `import pandas as pd` out of pure muscle memory. A few hundred gigabytes of event data, a feature pipeline you've run a hundred times on your laptop. It should be faster here — ten machines instead of one.

Then the driver dies.

The table read was fine. Spark read it distributed, no problem. The killer was one line, the most innocent-looking line in the notebook:

```python
df = spark.read.table("events")
pdf = df.toPandas()
```

`.toPandas()` takes every partition sitting on every worker and funnels it into a single machine's memory: the driver. If the data is bigger than the driver's RAM, the notebook dies with an out-of-memory error and no partial result. If it fits, everything after that line runs single-threaded on one machine while nine workers sit idle. Either way, you just turned a ten-node cluster into a very expensive laptop.

This is not a beginner mistake. Some of the best data scientists I know do exactly this. Pandas is the tool they learned first. Their models are written in sklearn, their reference answers are written in pandas, their instincts are written in pandas. On a laptop, pandas is the whole world. On Databricks, pandas is one machine pretending the other nine don't exist. The skill transfers; the mental model doesn't.

Here's the model that fixes it. A Databricks cluster is two kinds of machines doing two kinds of work. The driver runs your notebook's Python process — that's where pandas lives. The workers run Spark tasks — that's the distributed engine. Pandas means 100% of the work happens on the driver. Spark means the work fans out across the workers. That's the entire game: driver is one machine, workers are all the machines.

![The pandas trap: all the work lands on the driver while nine workers sit idle](/assets/img/databricks-edu-series/pandas-trap-01-driver-vs-workers.svg)

So my rule is simple: the driver is for orchestration, not computation. If your data fits comfortably in memory, pandas on the driver is honestly fine — no shame in it. The trap is pandas on data that doesn't fit on one machine, or pulling distributed data down to one machine just to stay inside a familiar API.

How to tell you're in the trap — three signs:

1. The Spark UI shows one active task while the rest of the cluster is idle — a single stage doing all the heavy lifting.
2. Driver memory climbs steadily in the cluster metrics while executor memory barely moves.
3. The words `.toPandas()` or `.collect()` appear anywhere near a large table. (`collect()` is the same funnel with a different name — it pulls everything to the driver as a list of rows.)

The wrong pattern, written out so you can recognize it in your own notebooks:

```python
# THE TRAP — everything lands on the driver
pdf = spark.read.table("events").toPandas()      # hundreds of GB into one machine's RAM
result = pdf.groupby("user_id")["amount"].sum()  # single-threaded pandas from here on
```

![What .toPandas() does: every distributed partition funneled into driver memory](/assets/img/databricks-edu-series/pandas-trap-03-topandas-funnel.svg)

The fix is boring, which is the point. Keep the data distributed and let Spark do the grouping:

```python
# THE FIX — the work fans out to every worker
from pyspark.sql import functions as F

result = (
    spark.read.table("events")
    .groupBy("user_id")
    .agg(F.sum("amount").alias("total_amount"))
)
result.write.mode("overwrite").saveAsTable("user_totals")
```

Same answer. One version uses the cluster. The other uses it as a paperweight.

![Before and after: one machine straining vs. the work spread across the cluster](/assets/img/databricks-edu-series/pandas-trap-02-before-after.svg)

"But my whole pipeline is pandas and sklearn." Fair — that's where most people actually live, and rewriting everything isn't the ask. You have two good exits.

First: shrink before you collect. Do the heavy grouping, filtering, and joining in Spark, then call `.toPandas()` on the small result for modeling. Aggregate distributed, model local. Most models train on aggregated features, not raw event tables — a huge events table becomes a small feature frame, and that fits on the driver just fine.

Second: use the pandas API on Spark (`pyspark.pandas`). You keep writing pandas-style code and the engine distributes it underneath:

```python
import pyspark.pandas as ps

pdf = ps.read_table("events")          # pandas API, Spark engine
result = pdf.groupby("user_id")["amount"].sum()
```

It's a genuine bridge, not magic. Some operations still fall back to the driver, so check the ones you rely on — but it's a way forward that doesn't require unlearning pandas.

The sklearn question answers itself once the model is clear. Training on a pandas frame you pulled to the driver means one machine trains the model. That's legitimate when the training data fits — which it does, once you've aggregated in Spark first. The mistake was never "using sklearn." It was collecting the raw table to feed it.

There's a cost angle nobody talks about. The usual response to driver OOMs is to size up the driver — more memory, bigger bill — instead of fixing the one line that made the big driver necessary. The driver is the worst machine in the cluster to do compute on: a single node, zero parallelism, premium price. Every gigabyte you stop funneling into it is money back.

In my healthcare data work, this bites constantly. The tables are wide, the row counts are unforgiving, and the instinct is always to pull a cohort into pandas because that's where analysis feels comfortable. Comfortable is what OOMs. Aggregate first, then analyze.

Try this on your next notebook before you change anything else. Search for `.toPandas()` and `.collect()` and ask of each one: how big is the data at this point? If the answer is "the whole table," that's your trap. Move one aggregation — just one `groupBy` — into Spark and watch the Spark UI light up across all the workers. That single change usually teaches the lesson better than any article.

Here's my short version. Open the Spark UI on your next job: if you can see all ten workers and exactly one of them is doing anything, you're not running a distributed workload. You're running a laptop with a very expensive monitor. The cluster is not a bigger laptop. Stop treating it like one.

When was the last time you caught yourself — or a teammate — running pandas on data that had no business being on the driver?

---

*Enjoying this series? It goes out every morning on [Substack](https://masterdataengineering.substack.com/) and my LinkedIn newsletter, Master Data Engineering — subscribe wherever you read.*
