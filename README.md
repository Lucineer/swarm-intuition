# 🔮 Swarm Intuition

You don't need complex monitoring that only alerts you after issues occur. Your fleet generates operational data as it runs. This tool helps you find patterns in that data to anticipate potential bottlenecks.

It processes timestamped cause-and-effect signals from your services, like "service X latency increased" followed by "database Y connections spiked." By correlating these events, it can highlight historical sequences that may indicate future problems.

**Live Demo:** [https://swarm-intuition.casey-digennaro.workers.dev](https://swarm-intuition.casey-digennaro.workers.dev)

---

## Why This Exists

Operational telemetry is often stored in isolated systems. This creates a gap between seeing a metric change and understanding its consequences across your fleet. This project correlates events across services and time using the data you already collect, providing a connected view of system behavior.

---

## Quick Start

1.  **Fork** this repository. It is designed for you to own and modify.
2.  **Deploy** to Cloudflare Workers. You need to create one KV namespace called `INTUITION_KV`.
3.  **Send data** to the ingest endpoint from your services. It will begin logging correlations after receiving sequential events.

---

## What Makes This Different

1.  **Your Data Only:** It builds a correlation model solely from the event pairs your fleet sends. It does not use external training data.
2.  **Zero Dependencies:** It runs as a single Cloudflare Worker using only KV storage. There are no containers, external databases, or message queues.
3.  **You Control Everything:** Forking the repo gives you full control over data, logic, and deployment. There is no central service or vendor lock-in.

---

## Features

*   **Event Ingestion:** Accepts POST requests with JSON events containing `cause`, `effect`, and timestamps.
*   **Pattern Correlation:** Counts frequency and calculates the observed time delta between repeated cause/effect pairs.
*   **Forecast Queries:** Ask questions (e.g., "what often follows API latency?") to get summaries of historical patterns.
*   **Minimal Dashboard:** View total learned signals and recent correlations.
*   **Optional LLM Synthesis:** Configure an LLM (DeepSeek by default) to format prediction summaries. You can swap the provider or remove this layer.
*   **Edge Runtime:** Deploys on Cloudflare's network, with typical response times of 50-100ms for ingestion and queries.
*   **MIT Licensed:** Free to use, modify, and distribute.

---

## Architecture

One Cloudflare Worker handles two primary functions:
1.  **Ingest:** Receives event signals and stores them in KV, indexing them by cause and effect.
2.  **Query:** Retrieves historical event chains for a given cause and formats a response, optionally using a configured LLM for summarization.

---

## One Limitation

It requires a minimum volume of correlated data to be useful. You need to send at least 100-150 sequential cause-effect observations before it can identify recurring patterns with basic confidence. It will not generate meaningful predictions from sparse or unrelated events.

---

Superinstance and Lucineer (DiGennaro et al.)

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>

---

<i>Built with [Cocapn](https://github.com/Lucineer/cocapn-ai) — the open-source agent runtime.</i>
<i>Part of the [Lucineer fleet](https://github.com/Lucineer)</i>

