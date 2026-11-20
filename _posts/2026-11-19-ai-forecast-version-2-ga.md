---
layout: daily-post
title: "ai_forecast version 2 is now generally available"
description: "Forecasting in pure SQL: ai_forecast v2 is GA, with holiday support, external covariates, and non-negative forecasts. Opt in with version => '2'."
date: 2026-11-19
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Forecasting used to mean exporting your table to Python, training a model, and wiring the results back in.

Databricks just made that the long way around.

ai_forecast version 2 is now generally available. It is a SQL function. Point it at a time series you already have and it extrapolates it forward. No training. No notebook. No pipeline to maintain.

What is new in v2:

- A research-optimized time series foundation model, so out-of-the-box accuracy improves without tuning.

- Built-in holiday support. Pass holiday_region => 'US' and it models holiday effects for you.

- External covariates. Feed in future values you already know, like planned pricing or campaigns, or past-only signals like weather.

- Non-negative forecasts with positive_only => true. Useful for counts that can never go below zero.

One catch: v2 is GA but it is not the default yet. Version 1 is still the default. Opt in with version => '2'.

I work with healthcare data every day, and the use cases write themselves. Daily admissions. Bed demand. Clinic volumes. All of it lives in tables already. A forecast is one SQL statement away, with upper and lower bounds included.

Needs a Pro or Serverless SQL warehouse. Some workspaces need an admin to switch it on first.

What would you forecast first if it was one SQL function?
