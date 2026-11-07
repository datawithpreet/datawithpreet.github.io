---
layout: daily-post
title: "Unity Catalog wikis are in Beta"
description: "Unity Catalog wikis in Beta let teams document a table's meaning, intended use, and sources right in Catalog Explorer."
date: 2026-11-06
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/november"
source_title: "Unity Catalog wikis (Beta)"
---

Every data team has a table nobody dares to touch, because nobody knows what it actually means.

Unity Catalog wikis are now in Beta. They let you write a wiki on a table in Catalog Explorer. Meaning, intended use, sources. The context that usually lives in someone's head or a Confluence page nobody finds.

What you get:

- A one-line description at the top of the table's Overview tab.

- A rich-text page with links, images, and mentions of other Unity Catalog objects.

- A sources section linking back to where it came from.

- Comments and suggested edits from anyone who can view the table.

Data owners and stewards write and publish them. Genie Code can draft one if you attach files or context. Anyone who can see the table can comment, suggest an edit, or upvote and downvote it.

Small feature. Saves hours. I work with healthcare data all day. Half of a table's value is knowing what it means and what to watch out for. A table with a README is a table people actually use.

Worth knowing: it is behind an account-level Previews toggle. Wikis are tables only, one per table. Wikis use Databricks-managed keys only, so regulated data does not belong in one.

What is the one table on your team that needs a wiki most?
