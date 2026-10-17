---
layout: daily-post
title: "The agentic code converter is GA for SQL conversion"
description: "Databricks made its agentic code converter generally available for SQL conversion — T-SQL, Snowflake, Redshift, Oracle, BigQuery, and Teradata SQL into Databricks SQL, with Genie Code subagents that validate and retry."
date: 2026-10-16
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes — October 2026"
---

Every migration I have seen has the same graveyard: thousands of T-SQL, Oracle, and Teradata scripts nobody wants to rewrite by hand.

Databricks made its agentic code converter generally available for SQL conversion. A few specifics:

- Converts T-SQL, Snowflake SQL, Redshift SQL, Oracle, BigQuery, and Teradata SQL into Databricks SQL.
- Genie Code runs the work with subagents that convert files in parallel, validate the output, and retry the parts that fail. Up to 300 files per batch.
- Work is organized in migration projects with per-file status (green, yellow, red, gray) and a side-by-side diff in the SQL editor so you can accept edits file by file.
- You can write custom migration skills in a SKILL.md file to encode your team's rules. They apply to every conversion automatically. Teradata BTEQ scripts are not supported yet, and the notebooks target is still in beta.

I work on healthcare data estates where a broken migration means broken reporting that people depend on. This does not replace testing the converted SQL against your own data. Nothing should. But it moves the work from weeks of manual rewrites to review-and-accept. That is a real shift. Worth trying on a pilot schema before your next migration.

If you had this on your last migration, how many weeks would you have gotten back?
