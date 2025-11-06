---
title: OS One — Autonomy Index (1000:1)
id: os_one.design-insight.autonomy-index.v2025.10.06
version: v2025.10.06
origin_prompt: "what ai can do vs mouse and keyboard — comparison; distilled to 1000:1 input compression"
status: draft
---
# Autonomy Index (1000:1)
**Thesis:** Human semantic input replaces mechanical input at ~1000:1 (words : keystrokes/clicks).

## Observation
- Natural-language directives compress interaction.
- Agents expand intent into thousands of automated ops.

## Implications (Architecture / UX / Metrics)
- Interface: intent-first; GUI = assist layer.
- Agents: planning + tool-use + critique loops.
- **Metric:** `AutonomyIndex = SystemOutputOps / HumanInputTokens`.

## Design Directives
- Log input/output tokens per task; surface AutonomyIndex in dashboards.
- Treat 1000:1 milestones as autonomy gates for features.

## Risks
- Over-automation; hallucinated ops → include sandbox & review gates.

## Next STBs
- stb.metrics.autonomy-index.instrumentation
- stb.ui.intent-capture.minimal
