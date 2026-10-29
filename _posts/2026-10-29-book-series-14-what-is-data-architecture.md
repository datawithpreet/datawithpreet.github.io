---
layout: daily-post
title: "What Is Data Architecture?"
description: "Data architecture is the design of systems that support a company's evolving data needs, through flexible and reversible decisions and honest trade-offs."
date: 2026-10-29
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![What Is Data Architecture?](/assets/img/book-series/14-what-is-data-architecture.svg)

Most teams do not have a data problem. They have an architecture problem they have not named yet.

Chapter 3 opens with a word that sounds grander than it is: architecture. Strip away the corporate baggage: it is simply the design of your systems, made so they can change. Business needs shift, tools change, data grows. A design that cannot bend will break.

The book starts one level up, with enterprise architecture: systems design across a whole company, not just the data team. The core idea: design for change, through flexible and reversible decisions, chosen after weighing trade-offs honestly. A decision you can undo is a decision you can learn from.

Data architecture is the same idea, narrowed to data. A subset of enterprise architecture, it answers one question: how do we design systems that support the company's evolving data needs, through flexible, reversible decisions and honest trade-offs?

Split it into two halves:

1. Operational architecture: what needs to be done. Which business processes does the data serve? Who owns it? How good must it be? How fast must it arrive, from creation to query time?

2. Technical architecture: how it will happen. How data is ingested, stored, transformed, and served. Moving a large feed every hour from a source database into a lake is a technical question, not a business one.

Then, what makes architecture good? Good architecture serves real business requirements with a common set of reusable building blocks, and stays flexible. Bad architecture forces one-size-fits-all decisions on every team and ends up as a big ball of mud, where nobody dares change anything. Good design expects change; it does not pretend today's answer fits next year.

From my own work:

On the Databricks lakehouse work at EXL, the stack was Spark, Airflow, and Delta, but the starting point was the problem, not the stack: messy claims and health data that had to become trustworthy, governed tables. We picked tools that fit that problem, and kept the design modular, so swapping one piece did not mean rebuilding everything.

Leading a team of four on Medicare Stars work taught me the same lesson. When definitions, ownership, and refresh timing were agreed up front, the technical half stayed calm. When they were not, no tool saved us. Architecture is deciding those things early, while they are still cheap to change.

The takeaway: before you pick a tool, ask two questions. What needs to be true for the business, and can we still change our minds later? If the second answer is no, you do not have an architecture. You have a trap.

Day 14 of my read-through of Fundamentals of Data Engineering.
