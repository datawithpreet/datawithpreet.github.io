---
layout: daily-post
title: "BU Spark! DS+X Hackathon — Oct 24–25, 2026"
description: "Mentor and Technical Judge at BU Spark! DS+X, Boston University, Oct 24–25, 2026 — what the event is, what I did, and the ideas that stood out."
date: 2026-10-25
categories: [events]
---

![DS+X judges and mentors](/assets/img/dsx-judges-group.svg)

## What DS+X is, and why it matters

DS+X is Boston University's data science hackathon, run by BU Spark! together with the Faculty of Computing and Data Sciences. The "X" is the whole point: data science plus whatever you care about — health, climate, public policy, art, justice, or something else entirely. The organisers call this "Hackathon 2.0": not isolated technical puzzles, but data science colliding with real problems, with art, ethics, design, and storytelling in the mix.

It is a young event, and that is part of why it matters. The first-ever DS+X was Oct 25–26, 2025, at the Duan Family Center for Computing and Data Sciences, with nearly 200 student hackers, two dozen industry mentors and judges, and over $5,000 in prizes and internship opportunities, over 30 hours. The 2026 edition I took part in, Oct 24–25, 2026, was only the second edition — a new event, still being shaped, where mentors and judges are not just scoring, they are helping set what good work looks like.

For students, that matters in a very practical way. Most of them are in their first or second year. A weekend like this is often their first time taking an idea from nothing to a working demo, in front of people who actually build data systems for a living, and learning how to defend their choices, admit their limits, and fix what breaks.

## How I got involved, and how I was selected

I applied through the organisers' Airtable form on Oct 23, 2026, as a Mentor, Judge, and Workshop Facilitator. The organisers confirmed those roles, and their shifts sheet confirmed me as a Technical Judge in Data Science and Visualisation. The organisers were Lydia Holck, Ziba Cranmer, Alena Patel, Karina Palos, and the BU Spark! team.

I was not a student participant, and I was not judging my own work. I was there as an outside practitioner — a data engineering manager in healthcare analytics — brought in to mentor on Saturday and to judge technically on Sunday. That distinction matters for the judging: I had to leave any preference for a team I had liked or mentored on Saturday out of Sunday's scoring entirely.

## What I did, exactly — Saturday: mentoring, table to table

I arrived at 9:45 AM on Saturday, checked in on the 2nd floor of the Center for Computing and Data Sciences, 665 Commonwealth Ave, Boston, and spent the day going table to table. I did not give one big talk and leave. I sat with teams, one by one, and worked through their actual problems: is this idea deterministic or does it need a model at all, where is your data coming from, what happens when it is missing or messy, how will you show this in a demo that actually runs?

The teams I met on Saturday were working on a huge range of things: a credit-card application helper, a dining app, computer-vision accident and traffic detection, a research-paper PII identifier, a Massachusetts Medicaid FAQ app, a WHOOP AI validation layer, a diabetes wearable-monitoring team, a cheapest-hospital dashboard, a library space finder, an organiser digital twin, a safer map for riders, two draw-with-your-hands apps, a 3D body-part visualisation using hands, a hardware device team, and a plagiarism team. I kept my notes on topics, not team names, because on Saturday I was a mentor, not a judge.

The day ended at 8:00 PM. That Saturday work is also why Sunday had to be disciplined: I knew some of these teams, and I had to judge them on Sunday's evidence alone.

## What I did, exactly — Sunday: Technical Judge, Health & BioTech

On Sunday I judged as a Technical Judge for Health & BioTech. Presentations ran 11:30 AM to 1:30 PM, with no live Q&A — questions went in Discord, in the thread for that specific project. Scoring was due by 2:30 PM.

I judged 20 Health & BioTech projects. I did not judge on the pitch alone. For each project I looked at the Devpost page, the demo where there was one, and the code where there was a GitHub link — the repository, the tests, the Kiro specs where they existed, and the machine learning model itself: what data it was trained on, how it was evaluated, and whether the team's claims matched what the code actually did. A Kiro tag on Devpost, I learned quickly, is not by itself proof of a Kiro spec in the repo — I checked the repo, not the tag.

The official rubric was: Idea Impact and Relevance 25%, Data Science Application 25%, Technical Implementation 20%, Design 10%, Responsibility and Ethics 10%, and Presentation 10%, each scored 1 to 5. I kept the level low on purpose, because these are 1–2 year students: technical questions, asked in plain, human language, about code I had actually read — not expert jargon meant to intimidate.

## The students

The students were BU students from across disciplines — coding and non-coding backgrounds, designers, storytellers, and first-year students alongside more experienced hackers. That mix is the event's strength and its challenge: a team can have a brilliant health idea and still be learning how to clean data, version code, or explain a model honestly. Part of my job as a judge was to tell the difference between a team that did not know something yet, and a team that was pretending to know it.

## Some great ideas that were presented

These are the Health & BioTech projects I judged on Sunday, and what made them stand out to me as a technical judge:

- **Clear-Cost-Boston** — a Boston hospital price comparison tool, built from real published hospital price files: 25 procedures at three Boston hospitals, comparing cash prices, gross charges, and insurer-negotiated rates. The team was honest about its limits — missing prices stay unavailable, and a published price is a starting point, not a personal estimate. I had met this team on Saturday, as the cheapest-hospital dashboard team, and I judged it on Sunday's evidence alone.
- **ResiliNet** — an outbreak simulation across Boston's 230 census tracts, sending people who need a bed to nearby hospitals, rerouting overflow, and scoring how well each neighbourhood can still reach care, with "what if" scenarios like closing a hospital or slowing spread. What stayed with me was the team's honesty: their own validation showed their weekly bed forecast did not beat a naive baseline, and they said so plainly.
- **COR Heart Studio** — a 3D heart and brain outlook tool, built from openly licensed anatomy, with guideline-based grading and treatment effects drawn from randomised trials. All patients were synthetic, and the team was clear it is not a medical device and gives no diagnosis.
- **Coverage Keeper** — a MassHealth renewal navigator, built around a real and coming problem: paperwork, not eligibility, is what makes people lose coverage. Their agent checks documents against rules, cites its evidence, and keeps a human in the loop — it proves paperwork, it does not decide eligibility.
- **Threshold** — a cancer-trial finder and criteria linter, covering 1,011 trials recruiting in Massachusetts, that also shows researchers which eligibility rules exclude people unnecessarily — for example, blanket HIV exclusions years after FDA guidance said controlled HIV should generally be eligible.
- **Trial Pulse** — a ranking of Massachusetts trials by early-stop risk, built with careful ML hygiene: leak fixes and time-split evaluation, ranking risk rather than claiming outreach benefit it had not shown.
- **Terravia** — a chronic disease map of Massachusetts counties plus a chatbot that answers only from trusted CDC PLACES data, by design: a deterministic pipeline, not a free-form language model answer, because hallucinations in health data would be dangerous.
- **MYTER** — seizure detection with fewer electrodes, asking whether useful detection is possible without the full 21-electrode clinical setup. The team was clear this was a research prototype based on one patient's recordings, not a medical device, and that EEG is individual — promising, not proven.
- **ENGRAM Assist** — a wheeled assistance rover with an arm and gripper, fetching light objects at home by voice or hand gesture, built for people with mobility challenges who cannot safely get up, speak, or tap a phone. The team was clear it had been tested on a table and floor at the event, not in a real home or with patients.
- **EMBR, Titrate, TrialMatch, Glitch, Multi-Signal Health Flags, Signal2Care, CareConnect, HeartGuardianAI, Teria Test, ReHA, and Relay** — a chest strap estimating core temperature from heart rate, dose-response experiment design, trial search and outreach, a voice-first menopause app, wearable multi-signal flags, iMessage check-ins from wearable signals, volunteer house-call vaccinations, a wearable cardiovascular dashboard, cosmetics safety guidance, a webcam rehab game, and a last-minute appointment filler. Each one taught me something about where student builders are strong — ideas, honesty about limits, and working demos — and where they are still learning: validation, privacy, and what a prototype is not yet allowed to claim.

## My experience of the event

What I will remember is not one winner. It is the honesty of the best teams. The teams that impressed me most were not the ones with the smoothest pitch — they were the ones who could say, plainly, "this is simulated, this is not validated yet, this is what would break first." That is a professional habit, not just a student habit, and it is exactly what data work in healthcare demands: if you cannot say what your model does not know, you should not be near patient data.

It is also why I take judging seriously as a contribution, not as a favour. Judging 20 projects, reading their code, and scoring them on a public rubric is work that shapes what those students build next. That is the contribution I am recording here.
