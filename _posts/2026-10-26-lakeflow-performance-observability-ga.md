---
layout: daily-post
title: "Improved Lakeflow Performance Observability is now generally available"
description: "Lakeflow Jobs now show job-level query performance and data volume metrics, with an Optimize button that opens Genie Code."
date: 2026-10-26
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Improved Lakeflow Performance Observability is now generally available"
---

Most slow jobs do not fail loudly. They just run long, cost more, and nobody knows which query is the problem.

Databricks just made Improved Lakeflow Performance Observability generally available. Lakeflow Jobs now show query performance metrics and insights at the job level, plus data volume metrics in the job view.

- Job-level performance metrics and insights for supported tasks

- Data volume metrics visible in the job view

- An Optimize button that opens Genie Code to help improve queries using those insights

This matters because tuning usually means digging through runs and logs to find the slow part. Seeing it at the job level shortens that hunt.

In healthcare pipelines, where a nightly job feeds downstream reporting, a slow query is not just annoying. It delays everything after it.

When a job slows down, where do you look first?
