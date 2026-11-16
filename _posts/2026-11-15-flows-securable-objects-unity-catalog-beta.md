---
layout: daily-post
title: "Flows are securable objects in Unity Catalog (Beta)"
description: "Lakeflow pipeline flows are now securable objects in Unity Catalog: grant READ, REFRESH, WRITE, APPLY TAG, and MANAGE on a single flow without opening up the whole pipeline."
date: 2026-11-15
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Flows are securable objects in Unity Catalog (Beta)"
---

Your pipeline flows now have their own locks.

Databricks made Lakeflow pipeline flows securable objects in Unity Catalog. Beta for now, and you join through your Databricks account team.

Here is what changed.

- Each flow lives in a schema as catalog.schema.flow_name, next to the table it writes to.

- You can grant READ FLOW, REFRESH FLOW, WRITE FLOW, APPLY TAG, and MANAGE on one flow at a time. CREATE FLOW goes on the schema.

- The grant is a single line: GRANT REFRESH FLOW ON FLOW main.sales.orders_flow TO `data-engineers`;

That is the whole point. A team can refresh a flow, or reset its checkpoint, without getting access to the pipeline or the target table around it.

This is the governance I care about. In healthcare data, the question is who can touch which step, and whether you can prove it later. Flow-level grants close a gap that used to be all or nothing.

One thing to know first. A user still needs USE CATALOG and USE SCHEMA on the parents, and privileges granted on a catalog or schema flow down to every flow inside it. Set those carefully.

Would you hand out REFRESH FLOW to your downstream teams, or keep refreshes with the pipeline owners?
