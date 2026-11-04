---
layout: daily-post
title: "Trigger Lakeflow Jobs When Upstream Jobs Complete (Beta)"
description: "Databricks Lakeflow Jobs can now start when upstream jobs finish, even across workspaces on the same Unity Catalog metastore."
date: 2026-11-03
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/jobs/job-completion-triggers"
source_title: "Trigger jobs when upstream jobs complete"
---

Most of my pipeline chains run on timers. That has always felt wrong.

Databricks now has job completion triggers in Beta for Lakeflow Jobs. A downstream job can start when its upstream jobs finish. Configure it on the downstream job only. The upstream jobs do not change.

- Upstream jobs can sit in different workspaces, as long as all share one Unity Catalog metastore.

- One trigger watches 1 to 10 upstream jobs, with one result filter for all: Succeeded, Failed, or Completed with any result.

- With several upstream jobs, the downstream run starts only after all have a new matching completion. Historical completions do not start a run.

- The trigger passes the contributing runs through an upstream_completions parameter: workspace, job, run, result, and completion time.

In healthcare pipelines, ingestion, validation, and reporting often live in separate jobs and separate workspaces. Chaining on completion beats a guessed schedule. It cuts idle waiting, and it avoids downstream runs when upstream data never arrived. Worth trying where a missed upstream run turns into a silent bad downstream run.

Are you still chaining jobs with timers, or have you moved to event-driven triggers?
