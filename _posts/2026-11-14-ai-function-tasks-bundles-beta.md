---
layout: daily-post
title: "AI Function tasks now work in Declarative Automation Bundles (Beta)"
description: "AI Function tasks can now be declared in Declarative Automation Bundles: parse, extract, and classify documents as version-controlled YAML, incremental on every run."
date: 2026-11-14
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Your document pipeline is now just YAML.

Databricks added AI Function tasks to Declarative Automation Bundles. Beta, and it needs CLI 1.24.0 or later.

One task runs an AI function on every file in a Unity Catalog volume, or every row of a table. The output lands in a Unity Catalog table. No notebook. No SQL. The whole thing is declared in the bundle.

Three functions, one per task.

ai_parse_document pulls text, tables, and layout out of documents.

ai_extract pulls the fields you define, with confidence scores and citations back to the source text.

ai_classify labels each row into the labels you define, with confidence scores and rationales.

Tasks chain. The parse task's output table feeds the extract task, which feeds classify. Parse, extract, classify in one deployable file.

Each run is incremental. Only new, changed, or deleted files and rows get processed. Nothing re-runs from scratch.

This is the part I like. Document work like invoices, contracts, and tickets used to live as one-off job configs clicked together in the UI. Now it is version-controlled code. Reviewed, promoted, rolled back like anything else.

One thing to know first. Table inputs need change data feed enabled on the source table. Workspace admins control access from the Previews page.

Would you move a document pipeline into a bundle, or keep it in the UI for now?
