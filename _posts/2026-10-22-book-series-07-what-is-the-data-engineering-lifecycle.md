---
layout: daily-post
title: "What Is the Data Engineering Lifecycle?"
description: "The five stages that turn raw data into something people can use — generation, storage, ingestion, transformation, and serving — plus the undercurrents beneath them."
date: 2026-10-22
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![What Is the Data Engineering Lifecycle?](/assets/img/book-series/07-what-is-the-data-engineering-lifecycle.svg)

Most data engineering job descriptions are just a list of tools. The book gives you something better: a map.

That map is the data engineering lifecycle: five stages that take raw data and turn it into something people can use. Once you see it, you stop arguing about tools and start asking where a pipeline is weak.

Here it is, in plain words.

1. Generation. Data is born somewhere — an app, a claims system, a sensor, a spreadsheet someone still emails around. Every source has its own shape and quirks. If you do not understand the source, nothing downstream will save you.

2. Storage. Data needs a place to live. Storage is not a bucket you fill once. It runs underneath the whole lifecycle, and how you store data decides how easily you can find, query, and trust it later.

3. Ingestion. Moving data in, in batches or as a stream. This is also where most pipelines break. Sources are outside your control: they go quiet, send bad data, or your loader stalls, and everything downstream starves. Batch is still right for most reporting and training. Streaming earns its complexity only when a real use case needs data that fast.

4. Transformation. Raw data, as it arrives, is rarely useful. Here you clean it, fix the types, join it, and shape it into something a report or a model can use. This is where data starts creating value.

5. Serving. The whole point. Getting finished data to the analysts, data scientists, and systems that need it. If nobody can find it or trust it, the earlier stages do not matter.

Two things people miss. First, the stages are not a neat assembly line — they repeat, overlap, and run out of order, and that is normal. Second, six undercurrents hold everything up: security, data management, DataOps, data architecture, orchestration, and software engineering. Ignore one and the pipeline wobbles.

From my own work:

My Medicaid churn pipeline is the lifecycle, end to end: messy claims feeds as the source, a Delta Lake store underneath, Airflow batch ingestion on a schedule, transformation turning raw claims into features a model could read, and serving that gave the model and dashboards data they could trust. It protects $4M in program spend because every stage got attention — not because any single tool was fancy.

Today I lead a team of four on a Medicare Stars ML effort, and the same map runs our conversations. When something breaks, we ask which stage broke. Nine times out of ten, it is the source or the ingestion, not the model.

The takeaway: learn the lifecycle before the next tool. Tools change every year. The five stages do not.

Day 7 of my read-through of Fundamentals of Data Engineering.
