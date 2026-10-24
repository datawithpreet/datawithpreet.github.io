---
layout: daily-post
title: "Storage — Where Data Lives"
description: "Storage shows up in several places in a pipeline, not one box. Four questions to ask before choosing, plus hot, lukewarm, and cold data, from Spark and Delta Lake work at scale."
date: 2026-10-24
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Storage — Where Data Lives](/assets/img/book-series/09-storage-where-data-lives.svg)

Storage sounds boring until it breaks everything else.

Most teams talk about storage like it is one box you pick once. In real pipelines, it is not. Storage shows up in several places at once: where raw data lands, where cleaned data lives, where dashboards and models read from, and where old data is kept just in case.

The book treats storage as a stage that touches the rest of the lifecycle, not a separate cupboard. A warehouse can store, process, and serve. A streaming system can ingest, hold, and query messages. The lines blur, which is exactly why the choice matters.

Before I pick anything, I run through four questions, in plain words.

1. How will it be written and read? A system built for fast lookups is not the same as one built for big scans. Force the wrong pattern and you pay for it every day.

2. Will it slow everything downstream? Storage can become the bottleneck no one planned for. If reads or writes cannot keep up, the whole pipeline waits.

3. Can it grow with us? Think about total size, expected reads and writes, and what happens when that doubles. A pilot choice can fall apart at real volume.

4. Can people find it, trust it, and use it later? That means metadata, lineage, how the shape is handled when it changes, and where the data is allowed to live.

Then there is temperature. Hot data gets read many times a day and needs fast retrieval. Lukewarm data gets read every week or month. Cold data is rarely touched, often kept for compliance or recovery, and it is cheap to keep but expensive to pull back. Keeping everything hot is wasteful.

There is no universal answer. Object storage, a warehouse, a lakehouse, and a database each trade something off. The right pick depends on the use case, the volume, how often data arrives, and how it will be read.

From my own work:

In my own work, storage decisions show up in Spark and Delta Lake pipelines at scale, run with Airflow, not in one system.

Raw data lands first, as it arrives, so we can rework it without losing the original. Governed tables come next, with data quality checks for claims and clear lineage, so teams can find and trust the data. A separate serving layer feeds dashboards and models, including feature stores. Older data moves to cheaper, slower tiers for compliance and recovery.

If storage forces an unnatural access pattern, you feel it in performance first, and in trust second.

The takeaway: choose storage by how the data will actually be used, not by what is fashionable. Ask how it will be read, whether it will bottleneck you, and whether it can grow.

Day 9 of my read-through of Fundamentals of Data Engineering.
