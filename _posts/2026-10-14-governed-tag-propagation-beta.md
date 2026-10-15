---
layout: daily-post
title: "Governed Tag Propagation Is Now in Beta"
description: "Governed tag propagation in Beta uses Unity Catalog lineage to carry classification tags downstream through CTAS, views, INSERT INTO ... SELECT, and MERGE."
date: 2026-10-14
categories: [daily, databricks]
source_url: "https://docs.databricks.com/aws/en/release-notes/product/2026/october"
source_title: "Databricks Platform Release Notes - October 2026"
---

Most data engineers have a story like this one. You carefully tag the bronze table as PII. Then someone runs a CTAS into silver, and the tag silently dies. Along with it, every ABAC policy that depended on the tag.

Databricks is fixing that. Governed tag propagation is now in Beta.

When you enable propagation on a governed tag, Unity Catalog uses lineage to carry that tag downstream automatically. It fires on CREATE TABLE AS SELECT, CREATE VIEW, INSERT INTO ... SELECT, and MERGE. And it works at the column level too: a classified column passes its tag to the downstream columns that read from it.

The result is that classification and ABAC enforcement stay glued to the data as it moves through your pipelines. No more re-tagging every derived table after each transformation.

This is the kind of unglamorous fix that matters most in regulated domains. In healthcare, a de-identified research mart is only as safe as its weakest downstream copy. If the tag travels with the data, the masking and row filters travel with it.

I want to try this on a real pipeline and see how it handles edge cases, like tags surviving complex merges.

How do you keep classification tags alive across your medallion layers today?
