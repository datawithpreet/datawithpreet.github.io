---
layout: daily-post
title: "On-demand state repartitioning is GA"
description: "Resize shuffle partitions on a stateful streaming query without rebuilding the checkpoint."
date: 2026-10-18
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks platform release notes for October 2026"
---

One of the most annoying streaming traps on Databricks is finally gone.

On-demand state repartitioning is GA on Databricks Runtime 18 LTS. It lets you resize the number of shuffle partitions for a stateful Structured Streaming query or a Lakeflow pipeline — without rebuilding your checkpoint and losing all your streaming state.

Before this, the partition count was locked in at checkpoint creation. Change `spark.sql.shuffle.partitions` on a checkpointed query and it was silently ignored.

The only way out was a fresh checkpoint, and a fresh checkpoint meant losing your state history.

The fix is simple:

- Stop the query.

- Set `spark.sql.streaming.stateStore.partitions` (this config takes precedence over `spark.sql.shuffle.partitions` for stateful queries).

- Restart. After the last planned microbatch completes, the query redistributes state into the new partition count, then resumes.

One caveat: the query has to use the RocksDB state store provider. It has been the default since DBR 17.3, so most newer pipelines qualify.

I have watched teams over-partition streaming jobs "just in case," because the choice was permanent. That hack can retire now.

When is the last time you actually revisited partition counts on your streaming pipelines?
