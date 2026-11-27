---
layout: daily-post
title: "Table Metrics History System Table Is Generally Available"
description: "system.storage.table_metrics_history records daily storage size for Unity Catalog managed tables — active, vacuumable, and time-travel bytes — so you can find reclaimable storage and attribute costs to teams."
date: 2026-11-25
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes (November 2026)"
---

Your lakehouse finally has a storage bill you can actually read.

Databricks just made the table metrics history system table generally available. It lives at system.storage.table_metrics_history and records one row per Unity Catalog managed table, every day.

Each row breaks storage into active, vacuumable, and time-travel bytes, with a file count for each. History goes back 13 months, so you can chart growth over time instead of guessing from today's snapshot.

Two queries I would run first:

- Top tables by vacuumable_bytes. Those are your VACUUM candidates, storage you can reclaim right now.

- Top tables by time_travel_bytes. Those are the tables where a shorter retention window saves real money.

It covers managed tables, materialized views, and streaming tables. Foreign tables and Hive metastore tables are not included. Collection runs on serverless compute that Databricks pays for, so there is nothing to schedule.

In healthcare data, tables only grow. Retention windows and old snapshots quietly eat budget while nobody watches. This table turns that into a query you can run every Monday and a cost you can attribute to a team.

When was the last time you checked how much of your storage is reclaimable?
