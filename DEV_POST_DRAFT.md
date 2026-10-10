---
title: Outside in 20 — an open model that gives you a reason to close the tab
published: false
tags: devchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05).*

## What I Built

An activity recommendation app can easily turn into another feed. Outside in 20 deliberately stops at a much smaller decision: **what could I do outside with the next five, ten, fifteen or twenty minutes?**

Write one sentence, select your practical limits, and choose from up to three short cards. There are twelve activities: listening, watching clouds or birds, small walks, sketching, reading, photography, a conversation, or a modest litter collection. No streaks, account, leaderboard or location permission.

“Take one card” opens just the chosen activity. You can keep it on screen or print it, then put the planner away. The objective is a shorter screen moment, not a longer session.

## Demo

[Try Outside in 20](https://yifuwu0828.github.io/outside-in-20/) · [Run the validation page](https://yifuwu0828.github.io/outside-in-20/validation.html).

The public GitHub Pages build has also passed the same twelve semantic fixtures and 192 constraint combinations, with zero violations. This run used already cached model assets.

In the locally tested demo, “I want to draw a small piece of nature on paper,” with ten minutes, seated only and paper available, ranks the leaf sketch first. A five-minute seated/no-equipment filter instead restricts results to listening and sky watching, even when the words ask for a photo walk.

The cache was also tested with the local server stopped: reload the app, ask for a gentle walk, and it still performs real inference. That is a warmed-cache result on the tested browser, not a claim that first-time visitors need no download.

## Code

[Source code and licenses on GitHub](https://github.com/yifuwu0828/outside-in-20).

The new local repository includes original source and cards, vendored runtime/model assets with licenses and hashes, a loopback-only Python static server, and a separate reproducible validation page. It was created during this challenge's submission window.

## How I Built It

The core is the open-weight [all-MiniLM-L6-v2 encoder](https://huggingface.co/Xenova/all-MiniLM-L6-v2), running through [Transformers.js](https://github.com/huggingface/transformers.js) and ONNX Runtime Web. The tested build pins Transformers.js 3.8.1 and the model revision `751bff37182d3f1213fa05d7196b954e230abad9`.

It creates 384-dimensional, mean-pooled, normalized embeddings for the twelve activity descriptions. Each preference gets a query embedding; cosine similarity ranks only the eligible cards. Time, posture and equipment remain deterministic constraints. A semantic ranking never overrides them.

The model retrieves meaning rather than generating instructions. “A feathered visitor” can retrieve bird watching, but every displayed instruction is fixed, reviewed catalogue text. Weak matches show an uncertainty message instead of pretending to understand an unrelated request.

Actual development checks:

- Twelve expectations defined before the first model run: all twelve intended cards ranked first.
- 192 constraint combinations: no card violated the selected time, movement or equipment limits.
- Real query inference also respected contradictory text under a five-minute seated constraint.
- Empty, numeric-only and overlong text was rejected; no eligible cards produced an explicit empty state.
- A SQL repair request and an invented-word sentence both received an uncertain match.
- First successful model initialization took 482 ms from local assets; the full test took 612 ms on this machine. An already warmed, server-stopped reload initialized in 352 ms. These are local development observations, not a remote download or mobile speed benchmark.

The twelve fixtures are a small, authored check—not a measured accuracy rate on real users. The 0.28 similarity guard is heuristic. Negation and unfamiliar requests can still confuse this encoder. “Seated” describes a card, not an audited accessible venue. There is no live weather or route knowledge, and I have not performed a physical outdoor field test.

## Why Does Open Innovation Matter?

The useful boundary is **where the preference goes**. In this build, it stays in the browser: no closed inference endpoint, API key or remote prompt logging. The runtime and model are served from the same origin, remote model loading is disabled, and Content Security Policy restricts connections to that origin.

Open weights also make the test reproducible. Someone else can inspect the cards, rerun the fixtures, replace the encoder, or make a narrower catalogue. The approximately 37 MB initial asset download is a real tradeoff. Once cached, the tested build reloads and computes with its server stopped.

This is intentionally a small tool. It does not need to know your coordinates or invent a perfect outing. It needs to offer one plausible, constrained idea—and give you a reason to close the tab.
