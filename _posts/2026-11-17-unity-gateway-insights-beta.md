---
layout: daily-post
title: "Unity Gateway Insights: Find Where Your Coding Agents Waste Tokens (Beta)"
description: "Unity Gateway Insights (Beta) turns agent traces into a waste report ranked by tokens at stake."
date: 2026-11-17
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Analyze agent usage and find wasted tokens with Unity Gateway Insights (Beta)"
---

Your coding agents are burning tokens. Now Databricks shows you exactly where.

Unity Gateway Insights is in Beta. It reads the unified trace table, samples your agent sessions, and groups them into workstreams. Each report answers two questions: what are agents actually working on, and where is the waste.

Waste is ranked by tokens at stake, in four buckets.

- Bloated context

- Model right-sizing

- Wasted MCP spend

- Failing MCP calls

A workstream with 10% of sessions and 35% of tokens is the first place to look. The report also spots workflows people repeat by hand and hands you a copy-paste skill prompt to turn them into a shared skill.

Two limits to know. It measures tokens, not dollars. And it only sees agents launched through the Unity Gateway CLI, so sessions outside that path do not show up.

I like this direction. Token spend is becoming the new cloud bill, and in data work the teams that watch it early are the ones that do not get surprised later. Reports take 15 to 20 minutes to generate and stay private to whoever runs them.

Have you looked at what your coding agents actually cost in tokens yet?
