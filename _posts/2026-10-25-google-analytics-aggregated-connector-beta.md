---
layout: daily-post
title: "Google Analytics Aggregated connector is now in Beta"
description: "Google Analytics Aggregated connector is in Beta in Lakeflow Connect: aggregated GA4 reports, custom reports, and incremental ingestion into Unity Catalog tables."
date: 2026-10-25
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/google-analytics-aggregated"
source_title: "Google Analytics Aggregated connector"
---

GA4 data has lived outside my lakehouse for too long.

Databricks just put a managed Google Analytics Aggregated connector into Beta in Lakeflow Connect. It pulls aggregated GA4 report data straight into Unity Catalog tables. No DIY export pipeline.

What it brings:

- Aggregated GA4 reports: users, sessions, events, acquisition, ecommerce, and demographics.

- Custom reports with your own dimensions and metrics.

- Incremental ingestion, so recurring loads bring only new or changed data.

- Unity Catalog governance, with API and bundle based authoring and automated schema evolution.

This is the part I like. Analytics that used to sit in a separate tool now joins the rest of the data under the same governance. That makes joining engagement data with operational data far simpler.

A few limits to know. This is Beta, behind a Previews toggle. Pipelines are API or bundles only, not the UI. Auth is a service account or OAuth user to machine. No basic auth or API keys. And this is aggregated report data only, not raw hit level events.

Are you still exporting GA4 by hand, or is it already landing in your lakehouse?
