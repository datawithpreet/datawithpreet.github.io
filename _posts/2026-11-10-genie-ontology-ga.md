---
layout: daily-post
title: "Genie Ontology is now generally available"
description: "Genie Ontology is GA: a business-aware context layer for Genie, combining governed Unity Catalog definitions with what it learns from your actual usage."
date: 2026-11-10
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Every bad AI answer about "revenue" is a context problem, not a model problem.

Genie Ontology is now generally available. It gives Genie a business-aware map of your organization.

It works with two kinds of knowledge.

Modeled knowledge is the definitions you govern and certify through Unity Catalog. Metric views, domains, Pages, certification.

Learned knowledge is snippets Genie extracts from your assets and usage. Metric views, dashboards, SQL queries, dbt runs in query history. Even business definitions from Power BI.

Each snippet gets an authority score from its source, usage, and freshness. Modeled knowledge wins over learned knowledge. If Genie cannot resolve a conflict, it asks.

One ontology serves both Genie One and Genie Code. Everything is gated by Unity Catalog permissions, so people only see snippets from assets they can access.

I work with healthcare data every day. Definitions are the whole game there. An "active patient" or a "readmission" means different things to different teams. A model that guesses the wrong definition answers confidently and wrong.

Teach the AI your business once. Every answer after that gets smarter.

What is the one definition your team argues about most?
