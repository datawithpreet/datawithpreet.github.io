---
layout: daily-post
title: "Genie Code CLI Is Now Generally Available"
description: "Genie Code CLI (GA) brings the Databricks coding agent into your terminal: one shared Genie budget, Unity Catalog permissions still apply."
date: 2026-11-18
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Genie Code CLI is now generally available"
---

Your Databricks agent just left the browser.

Genie Code CLI is now generally available. It is the same coding agent that already knew your pipelines, now running in your terminal.

One command installs it. Run `genie` and it reads and edits local files, runs commands, and reaches into Databricks on your behalf. Ask it to clean up a folder of monthly CSVs, load them into Unity Catalog, and show revenue by region. One prompt, start to finish.

- One shared Genie budget across the CLI and the workspace. Your free monthly Genie usage applies here too.

- It runs as you. Unity Catalog permissions still apply to everything it touches.

- No model subscription to bring. Databricks provides the models, and usage is billed like Genie Code.

This is the part that matters to me. A terminal agent that respects the same governance as the workspace means I can automate the boring pipeline work without opening a second door into the data. For healthcare data, that is not a nice-to-have. It is the whole point.

It is not a full replacement for workspace Genie Code yet. Some workspace capabilities are still missing. It runs on your local machine, no SSH tunnel sessions.

Would you trust a CLI agent with write access to your governed tables?
