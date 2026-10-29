---
layout: daily-post
title: "Serverless GPU for clean room notebooks is now generally available"
description: "Run model training and inference inside a clean room on serverless GPU compute, under the same approvals and governance as other clean room notebooks."
date: 2026-10-28
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes, October 2026"
---

Clean rooms just got GPUs. That changes what joint analysis can do.

Databricks made serverless GPU for clean room notebooks generally available.

You can now run model training and inference inside a clean room, on serverless GPU compute. No GPU cluster to provision. No cluster to babysit.

The notebooks run on AI Runtime.

The part that matters most to me is what did not change. The approval flow stays the same. Data access stays the same. Results land in the same output tables.

- You can train and run inference over shared data, without any party seeing another's raw data directly.

- You skip the cluster work. Serverless handles the compute.

- You keep the clean room controls intact. GPU power does not mean looser governance.

For healthcare data teams, this matters. Joint work across organisations usually stalls on trust and infrastructure. This removes one blocker. Worth trying when a shared analysis needs real model work, not just shared tables.

One note: Databricks rolls releases out in stages, so timing may vary by workspace.

Have you run a clean room workload yet, or has the compute setup been the thing holding it back?
