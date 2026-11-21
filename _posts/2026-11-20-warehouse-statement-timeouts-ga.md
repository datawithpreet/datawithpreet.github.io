---
layout: daily-post
title: "Warehouse-level statement timeouts are now generally available"
description: "Per-warehouse kill switch: statement_timeout caps long-running queries on one SQL warehouse, in seconds up to two days. Dashboards get a short leash, ETL gets a long one."
date: 2026-11-20
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Every data team has the same story. One bad query runs all night on a shared warehouse and burns credits nobody budgeted for.

Databricks just gave every warehouse its own kill switch.

Warehouse-level statement timeouts are now generally available. Set a timeout on one SQL warehouse and long-running queries on it are cut off after the duration you choose.

How it works:

- One field: statement_timeout, set through the SQL warehouses API, SDKs, Terraform, or Declarative Automation Bundles.

- The value is in seconds, 0 to 172800 (two days). Set it to 0 and the warehouse-level timeout is gone.

- Precedence is session, then warehouse, then workspace. A session setting still wins when you need it.

- One gotcha: changing it with the Update API restarts the warehouse. Plan the change, don't push it mid-day.

The point is granularity. Dashboards get a short leash. The ETL warehouse gets a long one. Each warehouse gets the timeout that fits what actually runs on it.

I work with healthcare data every day. A runaway ad-hoc query should never stand between a care team and the dashboard they need.

What timeout would you put on your busiest warehouse?
