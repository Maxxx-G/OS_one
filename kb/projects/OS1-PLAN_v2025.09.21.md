# OS1 — Project Plan (v2025.09.21)

## 0) Meta

Owner: Maxxi-Corp (Orchestrators) • Status: Active • Supersedes: v2025.09.17

## 1) Scope & North Star

- Usable WebUI w/ internal + external LLMs; multi-service brain; voice/vision; OS control.

## 2) Architecture (Quad-Hybrid)

- Spec-Kit artifacts embedded (Goals → Arch → Tasks → TDD).
- BMAD planning/story files; Pre-Processor Gate enforced.
- GPT-5 Responses defaults: reasoning effort, tool choice/budget, threads.
- OS_One brain orchestration + Neural Pathways routing.

## 3) Since v2025.09.17 — Worklog

- 5C: CI path fix (ARCHON_DIR) + README.
- 6A: Provider interface + adapters (OpenAI Responses, Ollama stubs).
- 6B: Selector UI (transport, model, status).
- 6C: Chat wiring (input→provider; stub output).
- 6D: Streaming via /api/llm/responses (secure proxy).
- 6E: UI/UX repo area + naming; assets normalized.
- 6F: Screenshot renames (CI-friendly).
- 6G: Session store (responseId, thread capture).
- 6H: Supabase schema + RLS (threads/messages).
- 6I: Dev-safe Supabase adapters (fallback to local).

## 4) Current Status

- WebUI streams via OpenAI Responses; sessions persist locally; DB foundation ready.
- CI: Prettier green; Archon path fixed; parity tooling in place.

## 5) Risks & Mitigations

- Auth gap for DB writes → Next: Supabase Auth block (inject JWT/user_id).
- Provider surface drift → Single Provider interface; adapters behind env flags.
- Input ambiguity → Pre-Processor Gate policy active.

## 6) Next 7 Days

- 6J: Supabase Auth (client context, JWT) → enable DB writes.
- 6K: Messages API + switch session to DB when authed.
- 6L: Providers-ping CI smoke (proxy + minimal stream assert).
- 6M: Ollama/Open-WebUI real wiring.

## 7) Next 14 Days (Milestones)

- Pilot WebUI (20 users); per-thread resume; model/transport routing policy.
- Begin Always-On Brain prototype (listener, webcam, OS control) under feature flag.

## 8) Acceptance / DOR-Definition

- Stream & complete paths via Providers; Auth’d DB persistence; CI smoke; rollback path.
