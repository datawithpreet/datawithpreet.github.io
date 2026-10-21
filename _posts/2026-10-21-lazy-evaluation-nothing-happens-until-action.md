---
layout: daily-post
title: "Lazy evaluation: why nothing happens until you call an action"
description: "Ten transformations run in two seconds and nothing actually happened. Why Spark waits for an action, why that makes it fast, and the three ways the wait bites you."
date: 2026-10-21
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A teammate once ran a notebook cell and watched it finish in about two seconds.

The cell read a large events table, filtered it, joined it to a customer table, and built a new column by parsing a messy date string. Ten transformations, one after another, and the whole thing came back instantly. He turned to me and said the pipeline was fast. Then he ran the next cell, a simple row count, and the job ground on for a long time before failing with a date-parsing error.

Nothing about the second cell was complicated. The count was not the problem. The problem had been sitting in the first cell all along, waiting. The first cell had done almost no work at all.

That is lazy evaluation. In Spark, writing a transformation does not run it. It only records the intention to run it. Nothing is read, nothing is filtered, nothing is joined, until something forces the issue. That something is called an action.

Think of it like writing a recipe versus cooking the meal. Transformations are the recipe: read this table, filter these rows, join this table, parse this date. You can write ten steps of a recipe in a minute. No food gets cooked. An action is turning on the stove: `show()`, `count()`, `collect()`, or writing the result to a table. Only then does Spark take your recipe, work out the best way to cook it, and actually run it.


![Transformations build the plan, actions run it](/assets/img/databricks-edu-series/diagram-6-1-recipe-vs-cooking.svg)
This is not a quirk. It is the reason Spark can be fast at all.

Because Spark waits until it sees the whole recipe, its optimizer gets to rewrite it before running anything. If you filter after a join, it can push the filter before the join, so less data gets shuffled. If you only select three columns out of fifty, it can skip reading the other forty-seven. If two transformations cancel each other out, it can drop them both. None of that is possible if each step runs the moment you write it, because by then the work is already done and paid for.

Eager execution, the pandas way, runs every line as you write it. That is intuitive, and it is also why a pandas script that reads a huge file, filters it, and then selects three columns has already paid the cost of reading everything. Spark's laziness is what lets the optimizer look at the full picture and do less work than you asked for. You ask for a ten-step pipeline. Spark quietly turns it into a five-step one.

So far, so good. Here is where it bites.

The first bite is the delayed error. Because nothing runs until the action, nothing fails until the action either. A bad date format, a missing column, a join key that does not exist in one of the tables — all of these are written down as intentions in the transformation steps and only discovered when the action triggers execution. The error message points at the action line, not at the line that actually caused it. My teammate spent an hour staring at a count that was never the problem, because the real bug was a date-parsing step written half a notebook above it.


![The error surfaces far from its cause: the bug is in the parse, the error appears at count()](/assets/img/databricks-edu-series/diagram-6-2-error-surfaces-late.svg)
The second bite is repeated work. Every action re-runs the whole recipe from scratch unless you tell Spark to remember the result. Run `count()` and then `show()` on the same DataFrame, and Spark reads the source, filters, and joins twice — once per action. On a small table you never notice. On a large one you pay for the same expensive pipeline twice and wonder why the job is slow, when the job was actually two jobs wearing one notebook's clothes.

The third bite is the false sense of speed. A notebook full of transformation cells that all return instantly looks like a fast pipeline. It is not a fast pipeline. It is an unrun pipeline. The real runtime shows up all at once, at the first action, and it always looks like that one innocent action is slow. It is not. It is carrying the cost of everything above it.

The way to tell which lines are which is simple, and worth memorizing.

Transformations return a DataFrame. They build the plan. `select`, `filter`, `withColumn`, `groupBy`, `join`, `dropDuplicates` — all transformations, all lazy.

Actions return something else: a number, a list of rows, or a written table. `count()`, `show()`, `collect()`, `take()`, `write` — these trigger execution. If the line returns a DataFrame, nothing ran. If it returns anything else, everything ran.

Here is the wrong pattern, and it is everywhere in notebooks:

```python
# THE TRAP — a broken step hides until the action, then everything re-runs
events = spark.read.table("events")
clean = events.filter(F.col("event_date").isNotNull())
joined = clean.join(customers, "customer_id")
parsed = joined.withColumn("event_day", F.to_date("raw_date", "yyyy-MM-dd"))

parsed.count()   # fails here, on a date problem written four lines up
parsed.show(10)  # runs the whole pipeline a second time from scratch
parsed.write.saveAsTable("daily_events")  # ...and a third time
```

Three actions, three full runs of the same pipeline, and the first failure blames the count instead of the parse. If the pipeline is expensive, you have just paid for it three times. If the data is bad, you find out at the end instead of the start.

The fix has two parts, and both are habits rather than clever tricks.


![The fix: validate early with limit(100).show(), cache once, reuse the cached result](/assets/img/databricks-edu-series/diagram-6-3-validate-cache-reuse.svg)
First, validate early and small. After a risky transformation — a parse, a cast, a join on a new key — run a cheap action on a sample before building the rest of the pipeline. `show(5)` or a filtered `count()` on a small slice forces just enough execution to surface bad data while the offending line is still on your screen.

Second, cache anything you are going to act on more than once. If three actions need the same result, compute it once, keep it, and let the actions read the kept copy.

```python
# THE FIX — fail fast on a sample, then compute once and reuse
events = spark.read.table("events")
clean = events.filter(F.col("event_date").isNotNull())
joined = clean.join(customers, "customer_id")
parsed = joined.withColumn("event_day", F.to_date("raw_date", "yyyy-MM-dd"))

parsed.limit(100).show()  # cheap action: bad dates surface NOW, next to the parse
parsed.cache()            # compute once, keep the result
parsed.count()            # reads the cached result
parsed.write.saveAsTable("daily_events")  # reads the cached result, not the source
```

The `limit(100).show()` is the key move. It is a small, deliberate action placed right after the risky step, so a failure lands where it belongs. The `cache()` is the second move: one computation, three uses, no triple billing. And when you are done, `unpersist()` frees the memory — a cached DataFrame you no longer need is just a new way to waste a cluster.

One honest caveat: caching is not free, and it is not always the answer. Caching a DataFrame you only act on once wastes memory and adds a write step for nothing. The rule is boring and correct: cache what you reuse, validate what is risky, and let everything else stay lazy. Laziness is a feature. You just have to remember it is there.

The mental model fits on an index card: transformations write the recipe, actions cook the meal. The optimizer needs the whole recipe before it starts, which is why Spark waits. And waiting means errors arrive late, repeated actions re-run everything, and a notebook that looks instant has not actually done anything yet.

Next time a cell returns in two seconds and the next one fails — which line was really the problem?
