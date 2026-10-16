---
layout: daily-post
title: "What Data Engineering Actually Is — Day 1"
description: "Day 1 of my read-through of Fundamentals of Data Engineering: what data engineering really is, in plain words, with lessons from my own pipelines."
date: 2026-10-16
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![What data engineering actually is](/assets/img/book-series/01-what-data-engineering-actually-is.svg)

Data engineering is not about the tools.

That is the first thing this book gets right, and honestly it took me years to learn it on the job. Data engineering is the work of taking raw data — messy, scattered, half-broken — and turning it into information people can actually trust and use. Everything downstream depends on it: the dashboards, the reports, the machine learning models. The authors call it the intersection of security, data management, DataOps, architecture, orchestration, and software engineering. Fancy words. In plain words: you are the person who makes sure the data is right and shows up on time.

Three things from chapter one that I keep relearning every year:

1. Nobody cares which engine you ran. They care whether the number is right and whether it arrived on time. The tool is interchangeable. The discipline is not.

2. Trust is the actual product. A pipeline's output is a promise to everyone downstream. Break it once and people build their own spreadsheets — and you have lost them for a year.

3. You sit upstream, so your mistakes compound. A bad join in your pipeline does not stay in your pipeline. It becomes a wrong model, a wrong dashboard, a wrong call in the boardroom.

From my own work:

At LinkedIn, I learned what scale does to sloppy data — a small mistake becomes an enormous one when millions of rows flow through it daily. At CVS Health, I saw how healthcare data punishes assumptions: claims feeds never look like the documentation says they do, and you find out at 2 AM when the pipeline breaks. Now at EXL, leading the team behind our $4M Medicaid churn model, the pattern repeats. The model itself was the easy part. The hard part was the months of pipeline work underneath it — ingesting claims feeds cleanly, handling schema changes that providers send without warning, making sure the features feeding the model meant the same thing this month as last month. When the model started saving real money, nobody asked which framework we used. They asked if the numbers were right. They were, because the pipeline was.

That is the whole job. The problem comes first, the tool follows. Spark, Airflow, Databricks, Delta Lake — I use them every day, and I would swap any of them tomorrow. What I will not swap is the boring work: clean data, delivered on time, every time.

Day 1 of my read-through of Fundamentals of Data Engineering by Joe Reis and Matt Housley.


@Joe Reis @Matt Housley

#DataEngineering #DataEngineers #HealthcareAI #DataPipelines #BookSeries
