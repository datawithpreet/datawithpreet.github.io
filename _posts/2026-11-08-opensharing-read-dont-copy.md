---
layout: daily-post
title: "Read, don't copy: replacing file and API feeds with OpenSharing"
description: "OpenSharing lets you read a customer's table in place instead of taking a copy — no duplicate storage, incremental reads, and backfills that are just a query."
date: 2026-11-08
categories: [daily, databricks]
source_url: "https://www.databricks.com/blog/read-dont-copy-replacing-file-and-api-feeds-opensharing-part-1-why"
source_title: "Read, don't copy: replacing file and API feeds with OpenSharing - Part 1 (The Why)"
---

Stop copying your customers' data. Read it where it lives.

OpenSharing is an open protocol for reading a table in place, built on formats like Delta Lake and Iceberg. No SFTP drop. No API pull. No duplicate copy to babysit.

What changes:

- No duplicate data to store, so no duplicate storage cost.

- Shared tables expose a change data feed, so each run reads only what changed.

- Backfills become a query. Reprocess months of history without asking for a re-export.

- You read from cloud storage with your own compute, so nothing loads the customer's systems.

- The customer sees an audit trail of every query.

I work with healthcare data every day, and most ingestion pain is not the transform. It is the feed. A file that lands late, an API that rate-limits mid-pull, a backfill that needs three emails. Reading the table in place removes that whole layer.

Worth trying if your team onboards external feeds. The protocol is open, so the reader does not need to be on Databricks.

What is your most painful customer feed to maintain: SFTP, API, or something worse?
