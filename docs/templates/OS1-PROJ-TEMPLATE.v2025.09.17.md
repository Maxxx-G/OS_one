# OS1 - Project Plan Template (v2025.09.17)

> Duplicate this file when spinning up a new OS One project plan. Keep sections concise and action-oriented.

## 0) Meta

- Owner:
- Status:
- Supersedes:

## 1) Scope & North Star

- Outline the product or system vision in 2-3 bullets.

## 2) Architecture Snapshot

- Note critical surfaces (providers, memory, storage, UI, CI) with current status.

## 3) Recent Worklog

- Bullet completed phases or releases since the prior version.

## 4) MVP Definition

- Describe the smallest viable milestone and what is explicitly out of scope.

## 5) Next 48 Hours

- Enumerate the immediate tasks or checkpoints.

## 6) Risks & Mitigations

- Track blockers, dependencies, and mitigation strategies.

## Stability Guardrails

- Formatting scripts: `npm run fmt:check` / `npm run fmt` (see `.prettierrc.json`).
- File naming policy pointer: [ops.one.policy.filenaming.v01.00.md](docs/templates/ops.one.policy.filenaming.v01.00.md).
- Agent context catalog: [agent.context.catalog.v01.00.md](docs/templates/agent.context.catalog.v01.00.md).

## Providers & Toggles

- OpenAI Responses (proxy via `/api/llm/responses`).
- Ollama or Open-WebUI streaming fallback.
- Memory stack (LM1 schema, LM2 retrieval, LM3 write-back or mirroring).
- Voice and Webcam (Always-On Brain, optional preview).
- Sec-Comms guard (local only by default; gated enablement).

## Appendices (optional)

- Supporting diagrams, rollout notes, or policy references.
