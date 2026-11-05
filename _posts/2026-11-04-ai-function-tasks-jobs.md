---
layout: daily-post
title: "AI Function Tasks for Jobs (Beta)"
description: "Databricks AI Function tasks in Beta let a Lakeflow Job parse, extract, or classify files and table rows without SQL, processing only new or changed inputs."
date: 2026-11-04
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/jobs/tasks/ai-functions/"
source_title: "AI Function tasks for jobs"
---

Most unstructured data work starts with a script nobody wants to maintain.

Databricks now has AI Function tasks in Beta for Lakeflow Jobs. You add one as a job task, with no SQL to write. It runs one AI function on every file in a Unity Catalog volume or every row of a table, and writes results to a table it creates and manages.

- ai_parse_document pulls structured content and layout from unstructured documents.

- ai_extract pulls fields you define from text, using a schema you set.

- ai_classify labels text with labels you provide.

Each run is incremental. It processes only inputs added or changed since the last run, and drops results for deleted inputs. A nightly parse of new documents does not reprocess the whole volume.

That pattern shows up in healthcare data. Referral letters, scanned forms, and free-text notes need to land in a governed table first.

Chaining works too. Parse first, then extract, then classify, with each task reading the previous output table.

Worth trying where a parsing pipeline is the bottleneck, not the analysis itself.

Where would you drop this first: document parsing, extraction, or classification?
