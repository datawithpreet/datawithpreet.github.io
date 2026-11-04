---
layout: daily-post
title: "Higher limits and BROWSE support for Unity Catalog secrets"
description: "Unity Catalog secrets now scale to 1,000 per schema and 10,000 per metastore, with BROWSE giving metadata-only discovery without exposing values."
date: 2026-11-02
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes, November 2026"
---

Secrets sprawl is real on a big platform. Databricks just raised the ceiling in a useful way.

- A schema can now hold up to 1,000 secrets, up from 100.

- A metastore can now hold up to 10,000, up from 1,000.

- The higher limits cover Databricks-managed secrets and secrets backed by AWS Secrets Manager.

BROWSE on a catalog now applies to Unity Catalog secrets.

That means someone can discover a secret exists and see its metadata: name, owner, and expiration date. They still cannot read the value. They still cannot reference it in code. Those actions still need READ SECRET and REFERENCE SECRET.

This matters in healthcare data work, where teams juggle a lot of credentials across systems. Engineers often just need to know a secret exists and who owns it, not the value itself. This gives them that visibility without widening access.

Worth trying on a catalog where secret sprawl has already hit the old limits.

How does your team handle secret discovery today without handing out values?
