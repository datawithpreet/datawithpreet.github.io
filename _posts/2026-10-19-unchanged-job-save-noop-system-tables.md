---
layout: daily-post
title: "Saving an unchanged job no longer adds rows to the jobs system tables"
description: "No-op job saves stop polluting the jobs system tables — change_time now reflects the last real change."
date: 2026-10-19
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks on AWS — October 2026 release notes"
---

Nobody asked for this feature, but every team that audits jobs will feel it.

Databricks just changed what happens when you save a job without changing anything.

Previously, a no-op save — from the UI, the Jobs API, or a Declarative Automation Bundle deploy — wrote fresh rows into system.lakeflow.jobs and system.lakeflow.job_tasks. And it bumped change_time like something had actually changed.

Now it doesn't. Save a job with identical settings and nothing lands in either table. change_time stays pinned to the last real change.

This matters if you run anything on top of the jobs system tables: audit queries, change-history dashboards, lineage checks. Until now those tables kept growing with meaningless history, and change_time was unreliable as a "last changed" signal.

One caveat: this is a staged rollout, so some accounts may not see it for a week or more.

It's a small hygiene win, not a flagship launch. And it's the kind I like. Quiet changes that make system tables actually trustworthy are what let you build real automation on top of them.

Do you query system.lakeflow.jobs or job_tasks for anything? Curious how people are using them.
