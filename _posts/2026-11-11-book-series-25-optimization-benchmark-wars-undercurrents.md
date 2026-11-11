---
layout: daily-post
title: "Optimization, the Benchmark Wars, and the Undercurrents"
description: "Vendor benchmarks are rigged by design: tiny test data, nonsense cost math, one-sided tuning. How to choose technology on your own tests instead."
date: 2026-11-11
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Optimization, the Benchmark Wars, and the Undercurrents](/assets/img/book-series/25-optimization-benchmark-wars-undercurrents.svg)

A vendor once showed me a benchmark that said their database was 100x faster than the one we were using.

It was true. On a dataset small enough to fit in memory, running the same query on repeat.

That is the benchmark game. The numbers are real. The setup is rigged.

The book opens with a comparison I keep coming back to: a private jet against a sports car. Both are fast, but which one performs better is a silly question. They were built for completely different jobs. Most database benchmarks do exactly this, comparing systems built for different work on tests that look nothing like your real day.

Three tricks show up again and again.

First, tiny test data. A product that claims petabyte scale gets tested on a dataset that would fit on your phone. If the whole thing sits in memory, the same query runs lightning fast every time. Your real data will not fit in memory. Test with data that looks like yours.

Second, cost comparisons that make no sense. Some systems run all the time. Others charge per query or per second. Comparing them on cost per second is like comparing a taxi meter with a car lease.

Third, one-sided tuning. A vendor runs a join test on data shaped perfectly for their system, then tunes their own engine and leaves the competitor untuned. The result says more about the setup than the product.

So how do you actually choose? This is where the undercurrents come in, the stuff running underneath every stage of the lifecycle. Data management: ask how they protect your data, how they handle privacy rules, and whether you can host your own data. DataOps: things will break, so ask how you deploy, how you get alerted, and how fast you get an answer. Architecture: pick tools you can walk away from, and do not hand-build what is already solved. Your own database-to-warehouse connector is not a competitive advantage.

From my own work:

At EXL, I have sat through vendor demos where the benchmark slide was the whole pitch. The number that mattered was not on that slide. What mattered was how the tool handled our claims data at our volume, with our messy schemas and our real queries. That is the only test I trust.

I have lived the Airflow side of this too. It runs our orchestration, and it is the standard for a reason, but its scheduler and backend database can become the bottleneck. Knowing that up front shaped how we sized our jobs.

The takeaway: never buy on a benchmark. Run your own data, your own queries, your own failure modes through a tool before you trust it. The vendor's number is their marketing. Your test is your answer.

Day 25 of my read-through of Fundamentals of Data Engineering.
