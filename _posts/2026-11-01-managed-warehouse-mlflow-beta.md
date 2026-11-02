---
layout: daily-post
title: "Managed warehouse for MLflow is now in Beta"
description: "MLflow can now manage its own warehouse for Unity Catalog traces, so you can browse traces in the UI without selecting a SQL warehouse first."
date: 2026-11-01
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes, November 2026"
---

I have wasted too much time picking compute just to look at traces.

Databricks just shipped a managed warehouse for MLflow in Beta. With traces stored in Unity Catalog, you can open them in the MLflow UI without selecting a SQL warehouse first.

MLflow runs the trace queries itself. It uses your SQL warehouse if you set one for the experiment. Otherwise it creates a managed warehouse in the background if your workspace has Lakehouse//RT enabled, and falls back to serverless compute if neither applies.

The point is low-latency, interactive browsing. You open the view and it just works. No compute decision first.

I like this for teams shipping LLM features. Trace review is debugging work, and in healthcare work it is also review work. You need to see what a model actually did, without friction first.

It is Beta, behind a Previews toggle your admin enables. It is billed like other SQL warehouse or serverless compute. It is only for the MLflow UI, not general work, and the Python SDK still needs a SQL warehouse.

Would you let MLflow manage this, or do you still want to pick your own compute?
