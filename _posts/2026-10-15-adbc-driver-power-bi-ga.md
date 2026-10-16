---
layout: daily-post
title: "ADBC driver for Power BI is now generally available"
description: "Databricks made ADBC the default driver for new Power BI connections — Arrow-native columnar transfer, while existing connections stay on ODBC until you switch them."
date: 2026-10-15
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes - October 2026"
---

The next Power BI connection you make to Databricks won't touch ODBC. It's ADBC now.

ADBC (Arrow Database Connectivity) just went GA as the default driver for new connections in Power BI Desktop and the Power BI service. Instead of the old row-based ODBC/Thrift path, it moves data in Apache Arrow format, columnar end to end, which is how analytical data should move.

Two things worth knowing. One, existing connections stay on ODBC. Nothing migrates automatically. If you want ADBC on an old report, you switch it yourself in the Advanced Editor (Implementation="2.0"). Two, a semantic model can't mix drivers. Every Databricks connection in a model is either all ADBC or all ODBC, so plan the switch model by model.

The forward-looking bit: ADBC is required for Lakehouse//RT warehouses in Beta, which only accept the Statement Execution API path. The legacy Thrift path ODBC uses doesn't work there at all. That tells you where Databricks wants this to go.

I spend most of my day between Databricks and BI tools, so this one lands for me. The default change is a quiet push toward Arrow-native transfer. For anything already in production, check which reports are still on ODBC before you assume anything moved.

Have you switched any existing Power BI reports to ADBC yet?
