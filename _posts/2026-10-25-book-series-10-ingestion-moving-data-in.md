---
layout: daily-post
title: "Ingestion — Moving Data In"
description: "Ingestion is where pipelines quietly break. Batch vs streaming, push vs pull, and the questions to ask first, from Airflow batch pipelines feeding Spark and Delta Lake."
date: 2026-10-25
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Ingestion — Moving Data In](/assets/img/book-series/10-ingestion-moving-data-in.svg)

Ingestion is where most pipelines quietly break.

Generation gets the attention and storage gets the budget, but ingestion moves data from a system you do not control into a system you do. When it stops, everything downstream stops with it.

The book makes a point I wish more teams took seriously: source systems and ingestion are the biggest bottleneck in the whole lifecycle. A source can go unresponsive or send poor-quality data, and the ripple runs through storage, transformation, and serving.

Before I build anything, I run through the questions that decide how ingestion should work.

1. What is this data for, and can it be reused? If two teams need the same feed, ingest it once and share it. A second copy is how you end up with two versions of the truth.

2. Is the source reliable, and is the data there when I need it? If a feed arrives late or half-formed, every schedule downstream is fiction.

3. Where does it go next, and in what shape? Volume, frequency, and format decide the destination. A format your storage layer cannot handle cleanly will cost you every day.

4. Batch or streaming, push or pull? Almost all data starts life as a continuous stream. Batch is just that stream chopped into chunks, like a full day handled at once. Streaming hands data downstream almost as soon as it is produced. Push means the source writes it out to you. Pull means you fetch it on a schedule. Most real pipelines mix all of these.

That last choice deserves honesty. Streaming sounds modern, but it costs more in money, maintenance, and downtime, and only pays off if something real happens faster because of it. A micro-batch every minute often gives nearly the same benefit. Batch is still right for model training and weekly reporting, and that is most of the work.

From my own work:

In my own work, ingestion has mostly meant batch pipelines in Airflow feeding Spark and Delta Lake, with healthcare claims feeds that do not arrive on a perfect schedule. Some files land late, some arrive incomplete, some change shape without warning. So we land the raw data first, exactly as it arrived, so a bad day can be reworked.

We also design every load to be safe to run twice. If a job fails halfway and restarts, it should not duplicate rows or skip them. Backfills work the same way: re-running a date range should give the same result as the first run.

The takeaway: treat ingestion as a reliability problem first and a speed problem second. Know what the data is for, know where it goes next, and pick batch, streaming, push, or pull based on that, not on what sounds impressive.

Day 10 of my read-through of Fundamentals of Data Engineering.
