---
layout: daily-post
title: "Genie ZeroOps is now in Beta"
description: "Genie ZeroOps is in Beta: it watches your jobs, pipelines, and tables, finds the root cause when something breaks, and proposes a fix — or opens a PR."
date: 2026-11-11
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Your 3 AM failed job just got an on-call engineer.

Databricks just put Genie ZeroOps into Beta. It watches your jobs, pipelines, and tables in the background. When something breaks, it finds the root cause and proposes a fix.

Setup is plain English from the Jobs & Pipelines page. Tell it what to monitor, like "all owned jobs", and it backfills the last 24 hours of failures and stale tables into an inbox.

A few details that matter:

- It flags failures and data quality issues, not just crashes. Stale or incomplete tables show up too.

- Notifications go to Slack, Teams, PagerDuty, or a webhook. Email is not supported.

- For Git-backed jobs it can open a pull request with the fix. Nothing gets pushed until you tell it to.

- An insight auto-resolves after the next successful run.

I work with healthcare data, so a stale table is worse than a loud failure. A job that crashes pages you. A table that quietly stops updating feeds bad numbers downstream. That is where I would point it first.

What is the failure you keep getting paged for?
