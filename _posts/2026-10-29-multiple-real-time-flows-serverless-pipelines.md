---
layout: daily-post
title: "Multiple real-time flows per serverless pipeline and source stage adaptive repartitioning are in Beta"
description: "Serverless pipelines on the preview channel can now run multiple real-time flows with reserved task slots, and auto-scale Kafka and Kinesis source readers to traffic."
date: 2026-10-29
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes, October 2026"
---

Streaming pipelines force a tradeoff. Overprovision task slots, or watch one flow starve another when traffic spikes.

Databricks just put two Beta changes for serverless pipelines on the preview channel that attack that tradeoff directly.

- Multiple real-time flows can now run in one pipeline, with task slots reserved for each flow. No more flows competing for the same slots.

- Source stage adaptive repartitioning adjusts the number of tasks reading from each Kafka or Kinesis source to match its traffic. A spiky source gets more readers. A quiet source gets fewer.

- To use the auto-scaling, leave maxPartitions unset on Kafka sources, and maxPartitions and shardsPerTask unset on Kinesis sources. Set them and you get the fixed number you configured instead.

One limit worth knowing. Adaptive repartitioning does not adjust shuffle partition counts. For stateful flows, you still set spark.sql.shuffle.partitions yourself.

For teams running several low-latency streams, this removes a lot of manual sizing work. I would try it first on a pipeline where source traffic varies a lot across the day, not on a steady stream.

How are you sizing streaming task slots today, by hand or by guesswork?
