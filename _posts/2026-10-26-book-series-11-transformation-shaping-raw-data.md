---
layout: daily-post
title: "Transformation \u2014 Shaping Raw Data"
description: "Raw data is potential; transformed data is useful. The layers of transformation, three questions to ask first, and lessons from messy claims feeds."
date: 2026-10-26
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Transformation — Shaping Raw Data](/assets/img/book-series/11-transformation-shaping-raw-data.svg)

Raw data does not help anyone on its own.

It sits there, messy and inconsistent, in the wrong shape for the question someone actually wants to answer. Transformation is where that changes: raw data gets turned into something a report, a dashboard, or a model can use. Without it, everything upstream is just storage.

The book breaks the work into layers. First, the basics right after ingestion: put values into the right types, dates as dates and numbers as numbers, records into a standard format, and bad records out. Then the deeper work: reshaping the schema, normalising, and applying the rules of the business. Finally, the downstream steps: aggregates for reporting, or features for a machine learning model.

Before building one, I ask three questions:

1. What is it worth? Every transformation costs time, compute, and maintenance. If nobody can say what decision it serves, it is not worth building yet.

2. Is it simple and self-contained? A transformation that depends on five other transformations breaks in five places. Small steps are easier to test and fix.

3. What business rule does it carry? If a sale, a member, or a claim means something specific, define it in one place and apply it everywhere. One definition, used everywhere.

One more thing the book gets right: transformation does not live neatly in one box. It leaks into the rest of the lifecycle. A source system might stamp a timestamp before sending a record. A streaming pipeline might enrich a record in flight. Cleaning and wrangling are transformation too, wherever they happen. For machine learning, the same idea is featurization: building the inputs a model learns from, then automating that work so it runs the same way every time.

From my own work:

In my own work, this is most of the job. Healthcare claims feeds arrive messy: dates as text, codes in different formats, rows that should never have made it in. The first pass is unglamorous and essential: standardise types and formats, drop the bad rows, and keep the raw copy untouched so a bad day can be reworked.

Then the business logic comes in. In SQL and dimensional models, raw transactions become clean, reusable pieces: a member, a claim, a visit, defined once and used the same way by every downstream report. For the churn model, feature engineering was the same story: turning raw history into signals a model could learn from.

The takeaway: do not judge a pipeline by how much data it holds. Judge it by how cleanly it has been shaped for the next person who needs it. Raw data is potential. Transformed data is useful.

Day 11 of my read-through of Fundamentals of Data Engineering.
