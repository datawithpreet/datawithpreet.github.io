---
layout: daily-post
title: "Databricks Agent Memory Pipelines Are Now in Beta"
description: "Agent memory pipelines in Beta let Databricks agents remember facts, preferences, and decisions across conversations via scheduled LLM distillation."
date: 2026-10-13
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes - October 2026"
---

Most agents I have built forget everything the moment a session ends.

Databricks just shipped something that fixes that. Agent memory pipelines are now in Beta.

A memory pipeline connects a session store to a memory store. On each run, an LLM reads through stored conversations and distills the durable stuff. Facts. Preferences. Decisions. Those become memory entries the agent can recall in later conversations.

You can run it on demand or on a schedule of about every 24 hours. You manage it through the Agent Bricks CLI, with options for the model, instructions on what to distill, and manual or scheduled triggers.

This matters for any agent that is supposed to get smarter over time. A support agent that remembers what a user already tried. A healthcare data agent that remembers how a team defines a metric. Without memory, every conversation starts from zero.

I want to try this on a real agent workload and see what it actually retains versus what it drops.

What would you trust an agent to remember about your work?
