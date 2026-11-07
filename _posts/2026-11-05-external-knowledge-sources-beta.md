---
layout: daily-post
title: "External knowledge sources are in Beta"
description: "Databricks external knowledge sources in Beta pull Power BI semantic model metadata into Databricks so Genie answers using your real measure definitions."
date: 2026-11-05
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/genie/genie-ontology/external-knowledge-sources/"
source_title: "External knowledge sources"
---

Most teams I know define the same metric twice.

Once in Power BI, where the business reports on it. Once again in Databricks, so Genie can answer questions. Two definitions in two places. Sooner or later they drift.

Databricks just shipped external knowledge sources in Beta. It pulls metadata from your Power BI semantic models into Databricks through a Unity Catalog connection, and Genie answers using your real measure definitions.

- Your measures and calculated columns come across as they are defined in Power BI.

- Relationships come across too, so Genie understands how the model hangs together.

- Both sides read the same definition, so the governed numbers stay the same.

This is metadata only. It does not copy your underlying tables. And Power BI is the only source supported today.

An account admin turns it on from the account console Previews page. Turning it off stops the snippets in every workspace.

If your reporting lives in Power BI and your data work lives in Databricks, this is worth trying. One definition, used everywhere, instead of two that slowly disagree.

Are you still maintaining the same metric in two places?
