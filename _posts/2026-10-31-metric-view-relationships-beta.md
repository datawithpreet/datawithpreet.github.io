---
layout: daily-post
title: "Relationships between metric views are now in Beta"
description: "Unity Catalog metric views can now declare how they join, with cardinality and join condition as metadata, so AI assistants and BI tools join them the same way."
date: 2026-10-31
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes, October 2026"
---

Most AI tools guess your joins. That guessing is where bad dashboards start.

Databricks just shipped relationships between metric views in Beta. You declare how one metric view joins to another, right in Unity Catalog.

- You use ALTER VIEW ... ADD CONSTRAINT ... RELATIONSHIP, with a name, a direction, and a cardinality.

- The join condition goes in with ON or USING. Example: each order matches one customer.

- AI assistants and BI tools read that relationship instead of inferring it from column names. Genie Code uses it for dashboards too.

- It needs Runtime 19 or a SQL warehouse, and both views must be Unity Catalog metric views.

This is metadata only. It does not enforce the join, check your data against the cardinality, or speed up queries.

I like this because it moves join logic out of individual prompts and into one governed place. In healthcare work, that matters. The same metrics get reused across teams, and a wrong join can quietly change a trusted number. Worth trying on a small set first.

Where do your joins break most often, in the AI tool or in the BI layer?
