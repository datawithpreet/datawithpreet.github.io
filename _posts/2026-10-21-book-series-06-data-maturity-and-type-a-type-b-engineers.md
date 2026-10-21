---
layout: daily-post
title: "Data Maturity and Type A and Type B Engineers"
description: "Where your company sits on the data maturity curve — starting, scaling, or leading — plus Type A and Type B engineers and where data engineers sit in an organization."
date: 2026-10-21
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Data Maturity and Type A and Type B Engineers](/assets/img/book-series/06-data-maturity-and-type-a-type-b-engineers.svg)

Your data engineering job depends less on your title and more on how mature your company is with data.

The book lays out a simple three-stage model.

Stage one: starting with data. Goals are fuzzy and the team is tiny, so you are a generalist doing a bit of everything. The job is to move fast and lay a foundation — not jump to machine learning first. Without clean data and a production path, a model has nothing to stand on.

Stage two: scaling with data. Requests stop being ad hoc, formal practices appear, and roles split into specialists. The work shifts to architectures that can actually scale. The trap is chasing shiny tech. The bottleneck here is almost never the cluster. It is the team.

Stage three: leading with data. The company is genuinely data-driven: pipelines run themselves, people self-serve analytics and ML. Engineers specialize deeper, with governance and quality in focus. The trap is complacency — stop improving, and you slide right back down.

Then a second lens: Type A and Type B engineers. Type A is abstraction — you avoid reinventing the wheel and run the lifecycle on off-the-shelf products and managed services. Type B is build — you build tools that become the company's competitive advantage, mostly in stages two and three. The part people miss: A and B are not two different species. They are often the same person at different points in a company's life: Type A lays the foundation, Type B grows out of it.

The third piece is where you sit. Some data engineers face outward, feeding apps and platforms. Some face inward, serving dashboards, reports, and models for the business. Most of us do a blend of both.

From my own work:

I have lived in all three stages. Early on I was the generalist — a small team demands it. Today at EXL I lead a team of four on a Medicare Stars ML effort — stage two and three work: formal pipelines on a Databricks lakehouse, healthcare governance included.

The Medicaid churn pipeline I built tells the same story in miniature. It started as stage-one work: messy claims feeds, foundation first, model second. That pipeline protects $4M in program spend, because the foundation came first. Most days I am Type A, running managed services. But healthcare data keeps handing me problems nothing off the shelf solves — that is where Type B shows up, the custom piece only where it creates a real advantage.

The takeaway: before you judge your job, find your company's stage. If you are the only data person in the room, you are not behind — you are at stage one, and the foundation is the whole job.

Day 6 of my read-through of Fundamentals of Data Engineering.
