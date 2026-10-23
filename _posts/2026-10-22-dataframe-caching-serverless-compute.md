---
layout: daily-post
title: "DataFrame caching on serverless compute is now in Public Preview"
description: "Databricks put DataFrame caching on serverless compute into Public Preview: call df.cache() or df.persist() once and reuse the snapshot for the rest of your session."
date: 2026-10-22
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks on AWS — October 2026 release notes"
---

df.cache() finally works on serverless the way you would expect it to.

Databricks has put DataFrame caching on serverless compute into Public Preview. You call df.cache() or df.persist(), Databricks computes the result once and holds it as a snapshot for the rest of your session.

- Cache a heavy join, aggregation, or filter once, then reuse it across steps.

- Compute a streaming micro-batch once in foreachBatch, then write it to several sinks.

- Prepare feature data once, then train or tune several models on it.

There is one catch worth knowing. Only the cached DataFrame and DataFrames derived from it read the snapshot. A new DataFrame that repeats the same query starts from the source tables again.

It needs serverless environment version 5 or above. The snapshot is fixed at cache time and stays private to your session for up to seven days.

I work with healthcare data every day, and this fits how a session actually runs. You build a clean cohort once, then check it, slice it, and model on it. Worth trying, as long as you remember the snapshot will not pick up later source changes.

What would you cache first?
