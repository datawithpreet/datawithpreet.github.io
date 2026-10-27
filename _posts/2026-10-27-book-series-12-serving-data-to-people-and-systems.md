---
layout: daily-post
title: "Serving — Getting Data to the People and Systems That Need It"
description: "Serving is the last stage of the data engineering lifecycle, and the whole point of the rest. Analytics, machine learning, and reverse ETL, and what serving taught me on real pipelines."
date: 2026-10-27
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Serving — Getting Data to the People and Systems That Need It](/assets/img/book-series/12-serving-data-to-people-and-systems.svg)

Data that nobody uses is just storage with extra steps.

Serving is the last stage of the lifecycle, and the whole point of the stages before it. Data earns its keep only when someone uses it: a person reading a report, a model making a prediction, or a system acting on a score. The opposite trap is real: huge amounts of data collected and never consumed, because nobody asked what decision it was supposed to serve.

The book groups serving into three uses:

1. Analytics. Business intelligence describes what happened and where things stand. Operational analytics is about the present: a live view someone can act on straight away. Embedded analytics is hardest, because the audience is customers, not colleagues. Each customer must see only their own data; a leak between customers is a breach of trust, not just a bug.

2. Machine learning. Models need data that is good enough, easy to find, and fair. A feature store helps: one place where features are stored, versioned, and shared, so teams stop rebuilding the same inputs. But do not rush into machine learning before the basics work. Build the analytics foundation first, or the model is just a fancy way to be wrong at scale.

3. Reverse ETL. This is the flow back the other way: taking processed data, scores, or metrics out of the warehouse and pushing them into tools people already work in, like a CRM or an advertising platform. It used to be done by hand, exporting a spreadsheet and uploading it. Now tools are built for it, and it makes sense: insight stuck in a dashboard nobody opens is not much better than data nobody uses.

Self-service is the same test: anyone slicing data themselves needs clean data and the skills to use it. Poor quality and silos stand in the way.

From my own work:

In my own work, serving is where a pipeline proves itself or quietly fails. For the churn model, what mattered was not just training a model, it was serving clean, reliable features to it, on a schedule the team could trust, so the scores actually got used. A dashboard built on definitions everyone agrees on gets opened every week. One built on fuzzy definitions gets ignored.

Leading a team of four on Medicare Stars work taught me the other side: one shared definition beats four clever local ones. If a member, a claim, or a measure means something different in every report, serving has failed even if every pipeline ran green.

The takeaway: do not judge a pipeline by how much data it moved. Judge it by whether the right person, model, or system got what it needed, in time to act on it.

Day 12 of my read-through of Fundamentals of Data Engineering.
