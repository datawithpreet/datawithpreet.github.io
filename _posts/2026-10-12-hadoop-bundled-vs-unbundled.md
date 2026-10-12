---
layout: post
title: "Bundled vs Unbundled: What Hadoop Got Right for Its Era"
description: "Hadoop coupled storage and compute for a good reason — slow networks. The trade flipped when object storage got cheap. Know which era you're building for."
date: 2026-10-12
categories: [daily, data-engineering]
---

Hadoop is the textbook example of bundled architecture. Storage and compute lived on the same nodes, so scaling one meant scaling the other. Drowning in cold data? You still had to buy compute you would never use.

That coupled-scaling pain is what drove the whole unbundling wave.

Two things people forget. First, bundling is older than Hadoop. Oracle, SQL Server, Teradata appliances were all bundled, just vertically instead of horizontally. Second, Hadoop bundled for a good reason. Networks were slow, so moving compute to the data was the right call. Data locality was not a mistake. It was the correct optimization for its era.

The trade flipped when cloud networks got fast and object storage got absurdly cheap. Suddenly separation won. First in analytics with Snowflake, then the lakehouse. Now it is happening in OLTP with Neon.

The pattern is simple. Bundled wins when the network is the bottleneck. Unbundled wins when storage gets cheap. Know which era you are building for.
