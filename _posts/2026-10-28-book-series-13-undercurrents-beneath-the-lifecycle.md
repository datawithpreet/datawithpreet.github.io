---
layout: daily-post
title: "The Undercurrents Beneath the Lifecycle"
description: "Six undercurrents run beneath every stage of the data engineering lifecycle: security, data management, DataOps, architecture, orchestration, and software engineering."
date: 2026-10-28
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![The Undercurrents Beneath the Lifecycle](/assets/img/book-series/13-undercurrents-beneath-the-lifecycle.svg)

The stages get all the attention. The stuff underneath them decides whether they work.

Over the last few posts I walked through the five stages: generation, storage, ingestion, transformation, and serving. Those are the visible part. But six undercurrents run underneath every stage, a point I wish someone had drilled into me earlier. Ignore them and a pipeline looks fine until it quietly fails.

Here they are, in plain words:

1. Security. Give every person and system only the access they actually need, for only as long as they need it. Handing out admin access because it is easier is a breach waiting to happen.

2. Data management. This sounds corporate, and for years I treated it that way. It is really just treating data like an asset: knowing what you have, who owns it, and whether definitions match. Without it, two teams use the same word differently.

3. DataOps. Think of it as DevOps for data products. Automate repetitive work, watch your data closely so bad numbers do not sit in a report for months, and respond to incidents fast and without blame. Find the problem before the business finds it for you.

4. Data architecture. The plan for how your systems fit together, now and as needs change. It starts with the business need, not the tool. You do not have to be the architect, but you must understand the design you are building against.

5. Orchestration. How many jobs get coordinated to run in the right order. A plain scheduler only knows the time. An orchestrator knows dependencies: this job runs when that data is ready, not just at 2 AM. That stops a late job from silently producing stale numbers.

6. Software engineering. Tools have made the hard parts easier, but someone still has to write good code, test it, and version it. SQL counts as code. A pipeline nobody tested is a promise nobody kept.

From my own work:

On the churn pipeline, the model mattered less than the discipline around it: definitions everyone agreed on, runs we could trust, and tight access for sensitive health data. When a definition drifted, the reports drifted with it.

Leading a team of four on Medicare Stars work taught me the same lesson: jobs in the right order, with monitoring that flagged trouble before a stakeholder did, kept the team credible. Trust is built by boring reliability, and lost in one bad week.

The takeaway: do not just ask whether each stage works. Ask what runs underneath all of them. These six are not extras to add later. They are the ground the lifecycle stands on.

Day 13 of my read-through of Fundamentals of Data Engineering.
