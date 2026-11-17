---
layout: daily-post
title: "PostgreSQL integrated CDC pipeline is now in Beta"
description: "One integrated CDC pipeline now ingests PostgreSQL change data into Databricks with no separate ingestion gateway — Beta, continuous by default, up to 250 tables."
date: 2026-11-16
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "PostgreSQL integrated CDC pipeline is now in Beta"
---

Postgres changes just got a lot simpler to land in a lakehouse.

Databricks just put the PostgreSQL integrated CDC pipeline into Beta. One pipeline now does the whole job.

No separate ingestion gateway to run. Extraction and application happen in a single pipeline update, using logical replication through a replication slot with the pgoutput plugin.

Continuous mode is the default. Triggered mode is there too if you prefer scheduled runs.

What stood out:

- Up to 250 tables per pipeline, with SCD Type 1 by default and Type 2 when you need full history.

- Auto full refresh runs on its own when a table needs one. The gateway-based flow does not support that.

- Replication slot health is reported every five minutes in the event log, so a stuck slot does not quietly fill up the source database.

I work with healthcare data every day, and Postgres is everywhere in that world. CDC that needs less babysitting matters more than CDC that is clever. This one looks like the former. Still Beta, and it needs a primary instance, not a read replica.

What is your Postgres to lakehouse setup today, a gateway or something else?
