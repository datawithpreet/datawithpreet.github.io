---
layout: daily-post
title: "OAuth On-Behalf-Of for Service Principals Is Generally Available"
description: "Databricks OAuth on-behalf-of for service principals is GA: act as a service principal through the standard user-to-machine flow, with no OAuth secret to create or rotate."
date: 2026-11-13
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Databricks Platform Release Notes — November 2026"
---

Stop minting secrets just to work as a service principal.

OAuth on-behalf-of for service principals is now generally available on Databricks. It is on by default. No Previews toggle, nothing to enable.

The flow is simple. Run databricks auth login, pick the service principal from a dropdown in the browser step, and you are in. The token carries the service principal's identity. No OAuth secret to create, copy once, store somewhere, and rotate later.

Two things worth knowing.

You need the Service Principal Manager role on the service principal to use it. And the tokens are short-lived, one hour, auto-refreshed by unified auth.

This is for interactive use only. A person driving the session. Unattended workloads, automation, CI/CD still use machine-to-machine OAuth with a client ID and secret. Do not mix the two up.

My take: this is a quiet security win. Every long-lived secret in a shared environment is a leak waiting to happen. In healthcare data work, fewer standing secrets means fewer things to audit and fewer things to go wrong. I will take that trade every time.

How many OAuth secrets are sitting in your team's shared vault right now?
