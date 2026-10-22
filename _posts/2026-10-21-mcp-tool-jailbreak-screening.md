---
layout: daily-post
title: "Screen MCP tool calls and results for jailbreaks (Beta)"
description: "Databricks added Beta screening of MCP tool calls and results for jailbreaks and prompt injection in Unity Gateway, with the Jailbreak guardrail on input, output, or both."
date: 2026-10-21
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks on AWS — October 2026 release notes"
---

Most agent security talk stops at the prompt.

That is no longer enough.

Databricks now lets you screen MCP tool calls and their results for jailbreaks and prompt injection attempts in Unity Gateway. It is in Beta as of October 21.

- The Jailbreak guardrail can be applied on input, on output, or on both.

- That means the tool call going out gets screened, and so does the result coming back.

This matters because a tool result can steer an agent just as much as a bad prompt can. If you only guard the front door, the side door stays open.

I work with healthcare data every day, and trust boundaries like this are where I get cautious. Agent workflows touching governed data need screening at every step, not just at the start. This is worth trying when you build MCP-based agents on Databricks.

Are you screening tool results today, or only the prompts going in?
