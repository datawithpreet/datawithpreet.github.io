---
layout: daily-post
title: "Genie Migrate Conversion to Lakeflow Pipelines Is Generally Available"
description: "Genie Migrate now turns T-SQL scripts from SQL Server and Azure Synapse into serverless Lakeflow pipelines, validated with a dry run before anything touches data."
date: 2026-11-24
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/migration/genie-migrate/convert"
source_title: "Convert SQL scripts and ETL pipelines with Genie Migrate"
---

Your T-SQL does not have to stay on SQL Server anymore.

Genie Migrate now converts T-SQL scripts into Lakeflow pipelines, and it went generally available on November 24. It covers SQL Server and Azure Synapse dedicated SQL pools.

The flow is simple. Group your scripts, pick a catalog and schema for each group, and each group becomes one serverless pipeline. Genie Code sends subagents to convert the files in parallel, checking syntax and the actual logic, joins and WHERE clauses included. Each group gets a dry run before anything touches data.

Two limits worth knowing. Converted files come back with manual review comments, and you should read them before running the pipeline. A workspace admin also has to switch on Migration Projects Experimental Features in Previews first.

It converts up to 500 files and 10 groups per run. That is enough for a real migration batch, not a demo.

This is the part of migration work nobody wants to do by hand. Rewriting hundreds of procedures line by line is slow, boring, and where the bugs creep in.

Have you ever migrated a SQL Server workload to the lakehouse? What broke first?
