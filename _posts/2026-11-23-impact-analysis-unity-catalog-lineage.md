---
layout: daily-post
title: "Impact Analysis in Unity Catalog Lineage (Beta)"
description: "Unity Catalog now shows the downstream blast radius of a table or column before you change it, with impact levels, owners, and a Genie Code summary."
date: 2026-11-23
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/data-governance/unity-catalog/impact-analysis"
source_title: "Impact analysis"
---

Before you rename that column, know exactly who you will break.

Every data engineer has shipped a schema change and broken a dashboard three teams down. I have done it. Slack finds you before the pipeline finishes.

Databricks shipped impact analysis in Unity Catalog lineage, in Beta. Open the Lineage tab in Catalog Explorer and click Conduct impact analysis. It lists every downstream asset before you change anything.

Each asset gets an impact level, Critical, High, Medium, or Low, based on how often it and everything downstream is read. Certified assets come first, with the owner and certification status.

It works at table and column level. Downstream covers tables, notebooks, jobs, pipelines, queries, dashboards, Genie Agents, alerts, and apps.

With Genie Code, it summarizes the blast radius and lists the top 10 impacted dependencies. One suggested follow-up exports a CSV of impacted assets and owners.

One limit to know. Results are approximate, and an empty list is not proof a change is safe. New dependencies take a few days to show up.

An account admin has to turn it on from the Previews page first.

I will run this before any rename, deprecation, or type change. Export the owner CSV instead of hunting people down on Slack.

What is the smallest change you shipped that broke the most things downstream?
