---
layout: daily-post
title: "Adaptive Query Execution: the optimizer working behind your back"
description: "Spark's static plan guesses once from estimates. AQE measures each finished stage and re-plans the next one: coalescing partitions, switching join strategies, and splitting skewed partitions."
date: 2026-10-26
categories: [daily, databricks-edu-series]
---

*Part of my daily Databricks series — the hardest topics, explained simply. Also published on [Substack](https://masterdataengineering.substack.com/) and in my LinkedIn newsletter, Master Data Engineering.*

*Part of my daily Databricks series — the hardest topics, explained simply.*

A job had a plan that looked sensible on paper and behaved badly in practice.

The job joined orders to a reference table, grouped the result, and wrote out a summary. The plan was built once, before anything ran, based on estimates of how big each side of the join would be and how the data would be spread across partitions.

When the job actually ran, those estimates turned out to be wrong.

One side of the join was much smaller than expected. The shuffle produced far more partitions than the data needed. And one partition held far more data than the rest, so one task dragged on while the others finished and waited.

Nobody had written a bad query. The plan had simply been frozen too early, before Spark knew what the data really looked like.

That is the gap Adaptive Query Execution, or AQE, exists to close.

To understand it, start with how Spark normally plans a query.

Spark's optimizer looks at your query, looks at whatever statistics it has, and builds a physical plan: which join strategy to use, how many shuffle partitions to create, and in what order to run the stages.

That plan is then fixed. It does not change as the job runs, even if the first stage reveals that the estimates were off.

That is a strange way to work, when you think about it. It is like planning a whole journey from a map drawn before you left, and refusing to reroute when you find a road closed.

AQE changes that one thing. It lets Spark re-plan between stages, using real measurements from the stage that just finished.

Here is the idea in one sentence: after each stage, Spark looks at the actual data sizes and distribution, and adjusts the plan for the next stage before it runs.

It does not rewrite your query. It does not change what the query means. It changes how the remaining work is carried out, now that Spark knows more than it did at the start.

![Static plan vs adaptive plan](/assets/img/databricks-edu-series/diagram-11-1-static-vs-adaptive.svg)

Three adjustments do most of the work, and they are worth knowing by name.

The first is coalescing shuffle partitions.

A shuffle splits data into partitions, and the default number is often far too many for the data actually being shuffled. You end up with a crowd of tiny partitions, each carrying little work but each costing scheduling and overhead.

When AQE sees that the shuffled data is smaller than expected, it merges small adjacent partitions into fewer, sensibly sized ones. The next stage then runs fewer tasks, each with enough work to be worth running.

![Coalescing shuffle partitions](/assets/img/databricks-edu-series/diagram-11-2-coalesce-partitions.svg)

The second is switching the join strategy.

A query may be planned as a sort-merge join, which shuffles both sides and sorts them before joining. That is the safe general choice when both sides are large.

But if, after an earlier stage, one side turns out to be small enough to fit in memory on each worker, AQE can switch to a broadcast join instead. The small side is sent to every worker, the shuffle of the large side is avoided, and the join runs in a fundamentally cheaper way.

The key word is "turns out." The optimizer did not know the side was small when it planned. It knows now, because it has measured it.

The third is handling skewed joins.

Skew is the case where one key holds a wildly disproportionate share of the data. One partition ends up huge, one task runs far longer than the rest, and the whole stage waits for it.

AQE can spot that imbalance from the actual partition sizes and split the skewed partition into smaller pieces, so the work is spread across more tasks. It does not remove the skew in the data. It stops one task from having to carry all of it alone.

![Splitting a skewed partition](/assets/img/databricks-edu-series/diagram-11-3-skew-split.svg)

Put together, the picture is this: a static plan guesses once, while an adaptive plan measures and adjusts, stage by stage.

Here is the wrong pattern, and it is one a lot of careful engineers fall into:

```python
# THE STATIC PATTERN — hand-tuning a plan that was built on estimates
spark.conf.set("spark.sql.adaptive.enabled", "false")
spark.conf.set("spark.sql.shuffle.partitions", "200")

result = (
    orders
    .join(customers, on="customer_id", how="left")
    .groupBy("region")
    .count()
)
```

There is nothing obviously wrong with that code. It runs, and it returns the right answer.

But it turns off the mechanism that could correct the plan, and it hard-codes a partition count that may suit one dataset and not the next. Every time the data changes shape, someone has to retune by hand, usually after noticing the job is slow.

That is the manual version of what AQE does automatically: watching what actually happened, and adjusting what happens next.

Here is the fix, and it is mostly about not getting in the way:

```python
# THE FIX — let the optimizer re-plan from real measurements
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

result = (
    orders
    .join(customers, on="customer_id", how="left")
    .groupBy("region")
    .count()
)
```

Read that slowly, because what is missing matters as much as what is there.

There is no hand-set partition count in the fix. There is no forced join strategy. There is no hint telling Spark which side to broadcast.

The settings simply switch the adaptive behaviour on: coalescing partitions, handling skew, and re-planning between stages. Spark then makes those calls from the measurements of each finished stage, rather than from estimates made before anything ran.

That distinction matters for how you think about tuning. With AQE on, a partition count or a join strategy that looks wrong in the original plan may not be a problem at all, because the plan is not final. The question to ask is not only "what did the optimizer choose at the start?" but "what did it change once it saw the data?"

Now, the limits, because AQE is often oversold.

AQE works between stages, not inside a stage that is already running. If a stage is badly shaped, AQE cannot rescue that stage halfway through. It can only shape the next one better.

AQE cannot fix a bad query. If you join on the wrong key, filter too late, or read far more data than the question needs, no amount of re-planning will make that query good. It will make a bad query run a little more efficiently, which is not the same thing.

AQE cannot fix bad data. Skew that comes from a genuinely broken key, or a dataset that was never meant to be joined this way, still needs to be understood and dealt with at the source. Splitting a skewed partition helps the job finish. It does not explain why one key held all the data.

And AQE does not remove the need to understand the basics. You still need to know what a shuffle is, what a partition is, and why a broadcast join is cheaper than a sort-merge join. AQE simply applies that knowledge at runtime, when the facts are known, instead of leaving it all to guesswork at planning time.

A few habits follow from that.

Leave AQE on unless you have a specific, measured reason to turn it off. Turning it off to "keep things predictable" trades a real optimisation for the comfort of a plan you can read in advance, even when that plan is wrong.

When a job is slow, check whether the plan changed between stages before you start hand-tuning. If AQE already coalesced partitions or switched a join, your tuning problem may be elsewhere, in the query or the data, not in the settings.

And do not hand-tune what AQE already handles. A hint that was right for last month's data may be wrong for this month's, while AQE would have adjusted on its own.

The mental model to carry away is simple.

A static plan is a guess made before the work starts. An adaptive plan is a series of decisions made as the work reveals itself.

Spark has always been good at running a plan. AQE is Spark getting better at changing one, when the evidence says it should.

Which job of yours is still running on a plan that was frozen before Spark ever saw the data?

That is the job AQE was built for.
