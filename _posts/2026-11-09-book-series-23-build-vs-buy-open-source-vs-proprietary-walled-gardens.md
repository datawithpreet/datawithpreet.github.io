---
layout: daily-post
title: "Build vs Buy: Open Source vs Proprietary Walled Gardens"
description: "Build only where building makes you different. Community open source, commercial open source, and proprietary walled gardens — how to choose."
date: 2026-11-09
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Build vs Buy: Open Source vs Proprietary Walled Gardens](/assets/img/book-series/23-build-vs-buy-open-source-vs-proprietary-walled-gardens.svg)

Every data team eventually hits the same question: build it ourselves, or use something that already exists?

The book treats it as a trade-off, not a right answer. Building gives you end-to-end control — nobody else decides your roadmap. Buying comes down to time and expertise: do you have the people and hours to build something better than what already exists? Both sides get judged the same way: total cost, opportunity cost, and whether it gives you an edge.

The rule that stuck with me: build only where building makes you different, and use what already exists for everything else. The authors ask: when your car needs new tires, do you make them from scratch? No — you buy them and have someone fit them. They have seen teams build their own database from scratch when a simple open source one would have done the job. All that effort, for a worse result.

Open source comes in two flavors, and they are not the same.

1. Community open source. Free to use and change, maintained by people worldwide. Before you adopt one, check the signs of life: how many people use it, how often it ships, how fast issues get answered. And be honest about hosting and maintaining it yourself.

2. Commercial open source. A company takes the open project and runs it for you as a managed service — Databricks around Spark, Confluent around Kafka, dbt Labs around dbt. The core stays free; you pay for the managed service and the extras. The question is whether the vendor's extras beat running it yourself.

Then there are the proprietary walled gardens — closed tools from independent companies and from the cloud platforms themselves. They can be excellent, especially as managed services. But check three things first: does it work with the rest of your stack, is pricing clear at low and high usage, and will the company still be around in two years? Cloud services are built to work beautifully together — which is why they are hard to leave.

From my own work:

At EXL we run Spark and Airflow on a Databricks lakehouse, a managed platform, instead of building our own orchestration and storage. That let a small team focus on what mattered — the churn model's features and the messy healthcare claims feeds behind them — instead of babysitting servers. We built custom only where it made us different: the pipeline logic specific to our data. The rest, we stood on someone else's shoulders.

The takeaway: build where it makes you different, buy where it doesn't. And know who holds the budget before you make the case — a good choice waiting on approval dies quietly.

Day 23 of my read-through of Fundamentals of Data Engineering.
