---
layout: post
title: "Funke: Native HL7v2 Parsing on Databricks"
description: "Databricks open-sourced Funke, a PySpark library that parses HL7v2 messages into native Spark types. My take on what it changes for healthcare data teams."
date: 2026-10-11
categories: [daily, databricks]
---

HL7v2 is the format healthcare actually runs on. Parsing it has always been the painful part.

Databricks just open-sourced Funke, a PySpark library that parses HL7v2 messages into native Spark types. Lossless, hierarchy intact, queryable with plain SQL. No FHIR detour, no vendor engine flattening everything into wide tables.

It deploys as an Asset Bundle, ingests through a Declarative Pipeline, and everything lands in Unity Catalog. There is a demo that streams synthetic ADT events into a live bed census dashboard, which is a nice touch.

I work with healthcare data every day, so here is my honest read. The plumbing was never the interesting problem, but it was the expensive one. Funke kills the plumbing. The hard part is still on you: turning segments and fields into something the business can actually use. That has not changed.

If your pipelines touch EHR feeds, this is worth an hour.

Source: [Introducing Funke: Native HL7v2 Parsing on Databricks](https://www.databricks.com/blog/introducing-funke-native-hl7v2-parsing-databricks)
