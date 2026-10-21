---
layout: daily-post
title: "SurveyMonkey connector is now in Beta in Lakeflow Connect"
description: "Databricks shipped a managed SurveyMonkey connector in Beta — incremental ingestion of surveys, responses, and contacts under Unity Catalog governance."
date: 2026-10-20
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks on AWS — October 2026 release notes"
---

Survey data arrives as a hand-exported CSV.

Databricks just gave that workflow a proper pipeline.

The managed SurveyMonkey connector is now in Beta in Lakeflow Connect, enabled by a workspace admin from the Previews page.

It ingests surveys, survey structure, collectors, survey responses, and contacts straight into Databricks.

- Incremental ingestion is supported. No full reload every run.

- You can author the pipeline in the UI, through the API, or with Declarative Automation Bundles.

- It runs under Unity Catalog governance and can be orchestrated with Lakeflow Jobs.

Auth is OAuth user-to-machine only. No machine-to-machine, no basic auth, no API keys.

Two limits. No API-based row filtering yet. Schema evolution covers new and deleted columns only. A rename needs a full refresh.

If you run feedback surveys, this matters. Responses stop living in scattered exports and land governed, in one place, where you can join them to other data. I work with healthcare data every day, and that turns a one-off survey into a dataset you can trend.

Worth trying if SurveyMonkey is already in your stack.

How are you getting survey data into your lakehouse today? Still manual exports, or a pipeline?
