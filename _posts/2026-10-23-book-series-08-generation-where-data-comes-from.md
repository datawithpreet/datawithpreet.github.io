---
layout: daily-post
title: "Generation — Where Data Comes From"
description: "Generation is the first lifecycle stage and the one you control least. Six questions to size up any source system before you build on it, drawn from messy healthcare feeds."
date: 2026-10-23
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*


![Generation — Where Data Comes From](/assets/img/book-series/08-generation-where-data-comes-from.svg)


Every pipeline problem I have ever chased started before the pipeline did.

It started at the source. Generation is the first stage of the data engineering lifecycle, and it is the one you control least. A source system is wherever data is born: an app backed by a database, a fleet of sensors sending messages, a spreadsheet someone keeps emailing around. You consume from it. You do not own it. And when it changes, your pipeline feels it first. That gap — between owning the pipeline and not owning the source — is where surprises live.

That is why the book spends time on how to size up a source before you build anything on top of it. Here is the checklist I now run through, in plain words.

1. What kind of source is it? An application database behaves very differently from a swarm of devices sending events. Know which one you are dealing with before you promise anything downstream.

2. How fast, and how much? How many events per second, how many gigabytes per hour? A source that trickles and a source that floods need completely different ingestion plans.

3. How is the data stored, and for how long? Some sources keep data around. Others delete it quickly. If you do not pull it in time, it is simply gone.

4. What does the shape look like, and how does it change? Schemas drift. A team adds a column, renames a field, or moves to a new database, and suddenly your pipeline breaks. Ask how changes are communicated, not just whether they happen.

5. How messy is it, really? Expect duplicates, late arrivals, missing values, and errors. Ask how often they show up, and whether anyone checks for late or missing data at all.

6. What does reading it cost the source? Hitting a live application database with heavy queries can slow the app itself. A good engineer protects the source while pulling from it.

From my own work:

My Medicaid churn work lived or died at generation. The claims feeds were messy, they arrived in different shapes, and their schemas drifted over time. I learned to talk to the people who owned those feeds early, before a quiet change broke a downstream feature. That habit mattered more than any tool choice, because the model that protects $4M in program spend is only as good as the data that feeds it. Today, leading a team of four on a Medicare Stars ML effort, I still start every new feed the same way: what is the source, how fast does it move, and who tells us when it changes?

The takeaway: respect the source. You cannot fix upstream chaos with a fancier pipeline. Understand where data comes from, and everything downstream gets easier.

Day 8 of my read-through of Fundamentals of Data Engineering.
