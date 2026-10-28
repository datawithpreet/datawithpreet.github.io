---
layout: daily-post
title: "Editing files in Unity Catalog volumes is now generally available"
description: "Edit files stored in Unity Catalog volumes directly in the workspace file editor, with no download and upload round trip."
date: 2026-10-27
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes, October 2026"
---

Small change, big relief for anyone who lives in Unity Catalog volumes.

Databricks just made editing files in Unity Catalog volumes generally available. You can now edit a file right in the workspace file editor, where it lives.

Before this, the loop was clumsy.

Download the file. Edit it locally. Upload it again.

For a one-line fix, that was a lot of friction.

You can open a file in two places:

- From Catalog Explorer.

- From the schema browser in a notebook or in the SQL editor.

That matters for governance too. The file stays in the volume. It stays under Unity Catalog access controls instead of being copied out to a laptop and back in.

In my healthcare data work, volumes hold the unglamorous stuff that still has to be right: ingestion configs, SQL files, and scripts. Small edits to those should not need a round trip.

Worth trying the next time you need to fix a config in place. One note: Databricks rolls releases out in stages, so timing may vary by workspace.

How often do you still download a file just to change one line?
