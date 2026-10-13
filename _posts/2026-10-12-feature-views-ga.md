---
layout: daily-post
title: "Feature Views Are Now Generally Available on Databricks"
description: "Databricks moved Feature Views from Public Preview to GA. One declarative feature definition now covers batch, streaming, and request-time features for both training and serving."
date: 2026-10-12
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes — October 2026"
---

Feature Views just went GA on Databricks.

This is the declarative successor to the classic Feature Store APIs. You define an ML feature once, from a Delta table, a Kafka stream, or request-time data, with time-windowed aggregations, column selections, filters, or row-wise transformation_sql.

That single definition feeds everything. create_training_set gives you point-in-time-correct features for training. The same Feature object gets registered in Unity Catalog, logged with the model through fe.log_model, and materialized for serving. Training and serving share one definition. Train-serve skew dies here.

Batch features materialize to an offline Delta store and/or the online Lakebase store. Streaming features go to the online store only. Databricks quotes p99 end-to-end latency of 200 ms on StreamSource input. Needs Runtime 17.0 ML or above, plus databricks-feature-engineering 0.16.0. And this is not brand new. It was in Public Preview since June. Today is just GA.

Where this hits home for me: in healthcare data we need the same features for batch scoring and real-time serving, and keeping both in sync is where things quietly break. One declarative definition for all of it is the right shape.

Have you tried Feature Views yet? Worth migrating to?
