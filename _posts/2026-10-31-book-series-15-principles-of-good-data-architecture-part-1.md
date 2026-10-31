---
layout: daily-post
title: "Principles of Good Data Architecture, Part 1"
description: "Four principles for good data architecture: shared components, planning for failure, scalability, and leadership that raises the whole team."
date: 2026-10-31
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Principles of Good Data Architecture, Part 1](/assets/img/book-series/15-principles-of-good-data-architecture-part-1.svg)

Good architecture is not a diagram you frame on the wall. It is a set of decisions you can live with when things change — and things always change.

Chapter 3 lays out nine principles for judging those decisions. I am splitting them across two posts. Today, the first four.

1. Choose common components wisely. Pick the shared pieces every team can reuse — storage, orchestration, monitoring, the processing engine — so teams stop reinventing the same wheel. The trap is forcing one tool on every problem. A shared piece should make teams faster, not box them in.

2. Plan for failure. Everything fails eventually, so the question is not if, but how bad and for how long. Before you build, agree on two things: how long the system can be down, and how much data loss is acceptable. An internal report can wait a day. A live system cannot wait five minutes.

3. Architect for scalability. A scalable system grows when load grows and shrinks when it fades, ideally on its own. But bigger is not always better. A simple database with a failover node beats a sprawling cluster if that is what the load actually needs. Measure today's load and the spikes before you choose.

4. Architecture is leadership. The best architects are not the people who hand down one database for everyone and police it. They raise the whole team — mentoring, training, explaining the choices, and deciding with teams instead of for them. One great decision-maker is a bottleneck.

From my own work:

On the Databricks lakehouse work at EXL, Spark, Airflow, and Delta were our common components, and they worked because they fit the actual problem: messy claims and health data that had to become trustworthy, governed tables. Swapping one piece did not mean rebuilding the rest.

Failure planning was part of the same job. Jobs failed, feeds arrived late, schemas drifted. The systems that survived were the ones where we had agreed up front how a job could be rerun safely and how a backfill would work without duplicating data.

Leading a team of four on Medicare Stars work taught me the leadership half. When definitions, ownership, and refresh timing were agreed early, the technical work stayed calm. When they were not, no tool fixed it.

The takeaway: before your next design decision, ask four questions. Can everyone reuse this? What happens when it fails? Can it grow and shrink? Does it make the team stronger, or just more dependent on one person? Answer all four honestly, and you are on solid ground.

Day 15 of my read-through of Fundamentals of Data Engineering.
