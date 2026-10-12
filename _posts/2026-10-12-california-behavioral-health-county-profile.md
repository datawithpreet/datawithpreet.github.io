---
layout: daily-post
title: "How California Built Its Behavioral Health County Profile on Databricks"
description: "California unified behavioral health data from all 58 counties into one public dashboard on Databricks. The hard part wasn't the dashboard — it was the semantic layer."
date: 2026-10-12
categories: [daily, databricks]
source_url: "https://www.databricks.com/blog/how-california-built-its-behavioral-health-public-county-profile-databricks"
source_title: "How California built its Behavioral Health Public County Profile on Databricks"
---

California just put its entire behavioral health system on a public dashboard. And it runs on Databricks.

The state launched the Behavioral Health Public County Profile this month. One dashboard, all 58 counties, nearly 40 million people. Funding, service delivery, homelessness and housing services, demographics, performance measures. All of it comparable, county to county.

The backstory matters. In 2024 voters passed Proposition 1, replacing the Mental Health Services Act with the Behavioral Health Services Act. Funding is now tied to statewide goals. This dashboard is the accountability engine for that.

The stack is what you would expect from a serious data team. Spark Declarative Pipelines and Lakeflow Connect for ingestion. Semantic Views so a metric means the same thing in LA County and Fresno County. Serverless compute. Full lineage. All of it in a FedRAMP-authorized environment, because this is protected health information.

I work in healthcare data. The thing that stands out to me is not the dashboard. It is the semantic layer. Fifty-eight counties, fifty-eight data systems, one definition of every metric. That is the hard part, and they solved it.
