---
layout: daily-post
title: "Genie Search is now generally available"
description: "Genie Search is GA: one search index across Google Drive, Jira, Confluence, and Workday, so Genie One answers from your docs and tickets as well as your tables."
date: 2026-11-09
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Genie just stopped being a data-only assistant.

Genie Search is generally available as of today. It builds one search index across Google Drive, Jira, Confluence, and Workday, so Genie One can answer from your docs, tickets, and org chart.

What matters for real teams:

- One index, not four searches. Ask once and Genie searches everything connected.

- Permissions travel with the content. You only see what you can already open. Non-public docs get rechecked at query time.

- Read-only by design. Updating a Jira issue or drafting an email is what the MCP connectors are for.

- No cost at this time. Databricks says pricing may change later with notice.

My take: this decides whether Genie gets used every day or only when someone has a SQL question. Most of what a data team needs lives in docs and tickets. If Genie can search both, it becomes the first place people ask.

One limit: it is an index, refreshed on a per-source cadence, not a live query. Genie Code does not use it yet.

Would you let Genie search your company's docs and tickets?
