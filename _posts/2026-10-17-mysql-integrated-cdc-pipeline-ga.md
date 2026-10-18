---
layout: daily-post
title: "MySQL integrated CDC pipeline is now GA"
description: "Databricks made the MySQL integrated CDC pipeline generally available — one pipeline for extraction and application, no ingestion gateway to babysit."
date: 2026-10-17
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/mysql-integrated-pipeline"
source_title: "Integrated CDC pipeline for MySQL is now generally available"
---

Two pipelines to sync one MySQL table was always more infrastructure than the problem deserved.

Databricks made the MySQL integrated CDC pipeline generally available this week. One pipeline update now does both jobs: it extracts from MySQL, then applies the changes.

How it works:

The first run takes a full snapshot. After that, the pipeline reads the MySQL binlog for inserts, updates, and deletes, stages them in a Unity Catalog volume, and merges them into streaming tables using your primary keys. SCD Type 1 or Type 2, exactly-once semantics.

My favorite part: no ingestion gateway to babysit anymore. The old setup needed a long-running gateway plus a separate pipeline. This is one thing, with auto full refresh when unsupported DDL lands and automatic type widening when a column grows.

The trade-off: it runs scheduled by default, and Databricks suggests starting at a 60-minute interval. Continuous mode is still beta, so don't plan on sub-minute latency. Classic compute only, no serverless.

In healthcare, operational data lives in MySQL more than people admit. Claims queues, registries, scheduling systems. A simpler sync path matters here.

Are you replicating MySQL into Databricks today? Gateway pipeline, Debezium, or something homegrown?
