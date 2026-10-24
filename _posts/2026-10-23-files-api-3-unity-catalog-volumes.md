---
layout: daily-post
title: "Files API 3.0 for Unity Catalog volumes is now in Beta"
description: "Files API 3.0 for Unity Catalog volumes is in Beta: multipart uploads for files over 5000 MiB, and conditional operations that guard writes with the file version you expect."
date: 2026-10-23
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks on AWS — October 2026 release notes"
---

Uploading a 20 GB file to a Unity Catalog volume used to mean one fragile request.

If it failed halfway, you started over.

Files API 3.0 is now in Beta, and it fixes that.

- Multipart uploads. A single request caps at 5000 MiB. Anything larger splits into parts you upload independently and complete at the end.

- Conditional operations. Uploads, downloads, and deletes can now depend on the file version you expect. If someone else changed it first, you get a 412 instead of a silent overwrite.

Last-writer-wins is fine until two pipelines write to the same volume. Checking an ETag before you overwrite turns a silent loss into a clean failure you can retry.

One caveat. This is Beta, and a workspace admin has to enable Files API V3 with Large File Upload Support from the Previews page.

For teams landing models or large datasets into volumes, this is worth trying. The multipart model matches what the big cloud providers do.

How are you landing large files into Unity Catalog today?
