---
layout: daily-post
title: "Run Claude Code and Codex in the SSH tunnel"
description: "Claude Code and Codex now run inside Databricks SSH tunnel sessions, with no install and no separate API keys. Model requests go through Unity Gateway."
date: 2026-11-07
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Run Claude Code and Codex in the SSH tunnel"
---

Your AI coding agent can now run where your data actually lives.

Claude Code and Codex now work inside Databricks SSH tunnel sessions. From VS Code, Cursor, or your terminal. On serverless or a dedicated classic cluster.

No install. Type claude or codex in the session terminal and the launcher downloads the tooling on first run.

No separate API keys. Model requests go through Unity Gateway, authenticated with your SSH session's credentials. Same access controls and budgets as everything else.

You need Databricks CLI 1.23.0 or above, and Unity Gateway enabled in the workspace. The SSH tunnel itself is still in Beta.

This is the part I care about. I work with governed healthcare data every day, and an agent running under the same Unity Catalog controls as the rest of my work is a real shift. Worth trying.

One thing to know. Agent history and settings live on the compute. On serverless they disappear when the compute shuts down. Keep your real work in /Workspace or /Volumes.

Would you let an AI coding agent loose inside your governed workspace, or keep it on the outside?
