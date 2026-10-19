---
layout: daily-post
title: "Data engineering vs data science — upstream and downstream"
description: "Data engineering sits upstream, data science downstream. The Data Science Hierarchy of Needs explains why data scientists spend 70 to 80 percent of their time on data wrangling."
date: 2026-10-19
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Data engineering vs data science — upstream and downstream](/assets/img/book-series/04-data-engineering-vs-data-science.svg)

Ask a room of people what the difference is between a data engineer and a data scientist, and you will get ten confident answers. Most of them will be wrong.

The book puts it in one clean picture. Think of a river. Data engineering sits upstream. Data science sits downstream.

Upstream is where the inputs get built: pulling data out of source systems, cleaning it, moving it, storing it, shaping it into something someone else can actually use. Downstream is where those inputs get turned into something useful: analysis, experiments, models.

Neither is the "real" work. They are different halves of the same river. And the river only flows one way — no upstream, no downstream.

Then there is the part that stung a little when I first read it: the Data Science Hierarchy of Needs. Monica Rogati drew it back in 2017 as a pyramid.

At the bottom, the wide unglamorous base: collecting data, moving and storing it, cleaning and processing it. At the top, the narrow peak everyone wants to live on: analytics, experimentation, machine learning.

Here is the uncomfortable stat: most data scientists spend 70 to 80 percent of their time at the bottom of that pyramid — hunting data, cleaning it, fixing it.

In an ideal world, a data scientist spends over 90 percent of their time on the top layers. That gap is exactly where a data engineer stands: holding the bottom of the pyramid steady so someone else can climb it.

One more boundary the book draws: a data engineer typically does not build ML models, create dashboards, compute KPIs, or write the software app. Not because we can't. Because that is the downstream job. Our job is to make the downstream possible.

From my own work:

I have spent ten years on the upstream side of this river. I ran our Medicaid churn pipeline end to end — claims data in, cleaned features out, feeding a model that protects $4M in program spend. Now I lead a team of four on a Medicare Stars machine learning effort, and the pattern repeats.

Our data scientists spend their weeks tuning models and testing experiments. They can do that because the floor under them is solid — the data is already collected, cleaned, versioned, and served. That floor is my team's job. When it cracks, their week slides right back down the pyramid, and modeling stops.

Nobody thanks you for a solid floor. They only notice when it is gone.

The takeaway: a data scientist drowning in data cleaning doesn't have a modeling problem — they have an upstream problem.

Day 4 of my read-through of Fundamentals of Data Engineering.
