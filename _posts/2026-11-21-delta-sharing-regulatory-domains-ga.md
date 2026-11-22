---
layout: daily-post
title: "Databricks-to-Databricks Delta Sharing across regulatory domains is now generally available"
description: "A commercial-cloud workspace can now share Unity Catalog data directly with AWS GovCloud, GovCloud DoD, and Azure China. Read, don't copy, now across regulatory borders."
date: 2026-11-21
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

For years, sharing data with a partner in a regulated cloud meant one thing. Export a file.

Databricks just closed that gap.

Databricks-to-Databricks Delta Sharing across regulatory domains is now generally available. A commercial-cloud workspace can now share Unity Catalog data directly with workspaces in AWS GovCloud, AWS GovCloud DoD, and Azure China.

What that means in practice:

- The recipient reads the shared tables, views, volumes, notebooks, and agent skills in place. No copies, no separate ingestion.

- Shares are Unity Catalog objects, with auditing and usage tracking on both sides. Recipients get read-only access.

- Shares crossing into or out of AWS GovCloud or GovCloud DoD use pre-signed URLs instead of cloud tokens.

Two limits worth knowing. Azure China shares with commercial clouds and Azure China only, not with GovCloud. And Azure Government is not supported at all.

I work with healthcare data every day, and governed sharing is where most data-sharing plans stall. This removes the compliance boundary that used to force copies. If your sharing workflow still starts with export a file, this is worth a look.

Would you trust a live share with a partner in a regulated cloud, or do you still want a copy on your side?
