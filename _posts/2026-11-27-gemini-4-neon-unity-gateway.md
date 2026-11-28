---
layout: daily-post
title: "Google Gemini 4 Neon Is Now Available on Unity Gateway"
description: "Gemini 4 Neon, Google's fast token-efficient reasoning model, is now callable on Unity Gateway as system.ai.gemini-4-neon — no separate Google API key, governed and billed like every other model."
date: 2026-11-27
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes (November 2026)"
---

Google's fast Gemini 4 model just landed inside Databricks, and you don't need a Google account to use it.

Gemini 4 Neon is now available on Unity Gateway. You call it with the model service name system.ai.gemini-4-neon, and it runs governed and billed like every other model in your workspace.

- It is built for fast, token-efficient reasoning and tool calling, for interactive coding and agentic workloads.

- It takes text, image, video, and audio as input.

- Reasoning is always on. There is no off switch.

- It is hosted by Databricks and billed pay-per-token.

Watch out for one thing: queries to the databricks-gemini-4-neon serving endpoint are not supported. The model service name is the only way in.

This is the part that matters to me. The newest Gemini family shows up in the same gateway my coding agents already run through, under the same governance and billing. If your agents call models through Unity Gateway, Neon is one line away. Worth trying for interactive coding work where latency and token cost matter more than maximum reasoning depth.

Which model does your coding agent default to today?
