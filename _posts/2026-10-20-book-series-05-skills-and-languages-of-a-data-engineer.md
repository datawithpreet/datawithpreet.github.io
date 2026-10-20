---
layout: daily-post
title: "Skills and Languages of a Data Engineer"
description: "The four core languages of data engineering — SQL, Python, a JVM language, and bash — plus the non-technical skills that separate juniors from seniors."
date: 2026-10-20
categories: [book-series]
---

*Part of my daily series on Fundamentals of Data Engineering by Joe Reis and Matt Housley — [read the whole series](/book-series/).*

![Skills and Languages of a Data Engineer](/assets/img/book-series/05-skills-and-languages-of-a-data-engineer.svg)

People ask me this: "Which languages should I learn to become a data engineer?"

The book's answer is short: four languages. That is the core list.

One: SQL. The authors call it the lingua franca of data, and they are right. Sidelined during the MapReduce craze, it came roaring back — Spark SQL, BigQuery, Snowflake, streaming SQL. Get scary good at SQL. Most real transformation work is still well-written queries.

Two: Python. The glue. So many data tools are written in Python or ship a Python API — pandas, Airflow, PySpark. The language you reach for when two pieces won't talk to each other.

Three: a JVM language, usually Java or Scala — home of the heavy open-source machinery: Spark, Hive, Beam. It runs faster than Python and exposes hooks the Python API can't reach. Not a daily driver, but when you need it, nothing else will do.

Four: bash. The humble command line — awk and sed to slice through files, quick OS scripts, commands called out of your orchestrator. Nobody brags about it, but the people who don't know it move slower.

One caveat: SQL is not the answer to everything. You could write SQL to stem and tokenize text for an NLP pipeline, but you really should not — that is native Spark work. A good data engineer knows which tool to NOT reach for. Secondary languages earn their place when your company already runs on them.

But the chapter goes beyond languages — and this is what separates juniors from seniors. The non-technical skills: communicating with technical and non-technical people. Scoping real requirements before you build. Agile, DevOps, and DataOps are cultures, not tools. Controlling costs. Learning continuously, because this field moves fast. Data teams rarely fail on technology. They fail on communication.

From my own work:

Ten years in, my toolbox is exactly the four above. The Medicaid churn pipeline I built lived mostly in SQL — claims tables arrive messy, and the model eats only clean features. That pipeline protects $4M in program spend, and the middle — deduping, rolling up visits, aligning timestamps — was window functions and joins.

Python is my daily driver around the data: Airflow DAGs, glue, quick prototypes. The Medicare Stars ML effort I lead — a team of four — sits at that SQL-plus-Python seam. And bash: every backfill and emergency rerun starts in a terminal. Non-negotiable.

The takeaway: learn SQL like your career depends on it (it does). Learn Python for the glue work. Know enough of a JVM language to read the machinery. Live on the command line. Invest as much in communication and cost sense as in code.

Day 5 of my read-through of Fundamentals of Data Engineering.
