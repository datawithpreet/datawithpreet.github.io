---
layout: daily-post
title: "The data engineering lifecycle, in plain words"
description: "Most data teams fail in the gaps between lifecycle stages. Five stages, six undercurrents, and what the $4M Medicaid churn pipeline taught me about stage boundaries."
date: 2026-10-17
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![The data engineering lifecycle, in plain words](/assets/img/book-series/02-data-engineering-lifecycle.svg)

Most data teams fail in the gaps between stages. Not inside any single stage — between them.

That is the real lesson of the data engineering lifecycle — the big idea chapter one of this book builds on. Joe Reis and Matt Housley describe five stages every dataset walks through, from creation to use:

1. Generation — data gets born in source systems. Claims feeds, app databases, logs.
2. Storage — where that data lands and lives.
3. Ingestion — how it moves into your system.
4. Transformation — how raw rows get shaped into something useful.
5. Serving — how it reaches dashboards, reports, models.

Underneath all five run the undercurrents: security, data management, DataOps, architecture, orchestration, software engineering. Not stages — they flow through every stage.

Three things that hit me rereading this:

First, the framework pulls the conversation away from technology and toward the data itself. The stages don't care which tool you use. "Where does it come from, where does it live, how does it move, how do we shape it, who uses it" works on any stack.

Second, most of us over-invest in one stage and neglect the rest. Beautiful transformation with ingestion held together by hope. Great serving with money-eating storage. The lifecycle forces you to look at the whole chain, not your favorite link.

Third, the undercurrents are where production breaks. A pipeline nobody monitors is a pipeline nobody trusts. They decide whether a pipeline runs once or for years.

From my own work:

Building the pipeline behind our $4M Medicaid churn model, I walked this lifecycle end to end. Generation: messy claims feeds that never matched their documentation. Storage: Delta Lake for raw and curated layers. Ingestion: Airflow jobs with backfills and idempotency. Transformation: months of turning raw claims into features that meant the same thing this month as last month. Serving: the model itself, plus dashboards.

The failures were almost all at stage boundaries. A provider changed their feed format without telling anyone — a generation problem that showed up as an ingestion failure. A transformation assumption drifted silently, and the model behaved oddly — a transformation problem that showed up in serving. The fix was always the same: manage the whole lifecycle as one system, not five separate jobs.

The takeaway: draw the lifecycle for your own system. Five stages — mark the one you know least about. That is where your next 2 AM incident is already waiting.

Day 2 of my read-through of Fundamentals of Data Engineering by Joe Reis and Matt Housley.
