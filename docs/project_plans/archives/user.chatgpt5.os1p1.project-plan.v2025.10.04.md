# OS One Universe — Project Plan (v2025.10.04)

## 0) Meta
- **Owner:** Gabriel Tanner (Assistant) • Maxxi-Corp (Orchestrators)
- **Status:** Phase-1 handover-ready (UI/UX Chat Loop MVP)
- **Supersedes:** OS1-PLAN_v2025.10.04.md; user.chatgpt5.os1p1.project-plan.v2025.09.23.md

## 1) Scope & North Star
- Deliver a stable mediated chat UI where Assistants oversee Agent execution.
- Support one external LLM (OpenAI Responses) + one local LLM (Ollama/DeepSeek) with auditability.
- Local-first "Universe"; cloud "Live Router" is a zero-trust facade.
- Keep everything sellable: documented, reversible, productizable steps.

## 2) Architecture Snapshot
- **Providers:** OpenAI Responses (ext), Ollama/Open-WebUI (local).
- **Agents:** Assistant-mediated; Direct-Agent toggle exists (audit sink pending).
- **UI:** Session MCP selector + prefs done; AgentStatus chip present; QuickSwitch scaffold.
- **Audio:** Whisper STT + ElevenLabs TTS (target integration).
- **Local LLM:** DeepSeek-R1:8B via Ollama (planned; smoke to run).
- **Memory/KB:** LM1/LM2/LM3 schemas; read-only context view pending.
- **SEC-COMMS:** Placeholder pill (policy reminder), disabled by default.
- **Governance:** **Dual-STB** strategy (Control STB + Patch STB).
- **CI:** Providers-ping smoke (skip-graceful when unconfigured).

## 3) Recent Worklog (consolidated)
- Implemented Session MCP selector, persistent prefs, optimistic updates, audit logging.
- Added AgentStatus UI + QuickSwitch scaffolding.
- Adopted **dual-STB** execution/governance model.
- Voice controls foundation (PTT, routes) scaffolded.
- From v2025.09.23: First-Chat readiness tasks defined; guardrails aligned.

## 4) MVP Definition
- **MVP:** First Chat Ready — mediated chat to ext+local LLMs; visible status; audit trail.
- **Out of Scope (now):** Full SEC-COMMS runtime; advanced onboarding flows; multi-KB write-back.

## 5) Next 48 Hours (Critical Path)
- T1: Quick Test path across OpenAI + Ollama (green check).
- T2: Direct-Agent audit sink + footer label "Mediated/Direct".
- T3: Read-only "Context" pill (injected context view).
- T4: Onboarding overlay (3 slides: QuickSwitch, Direct toggle, Quick Test).
- T5: SEC-COMMS placeholder pill finalized (tooltip + policy link).
- T6: Integrate **Whisper STT** + **ElevenLabs TTS** (happy-path).
- T7: Add **DeepSeek-R1:8B** in Ollama; run smoke prompts.

## 6) Risks & Mitigations
- **Handover drift:** Enforce **STB** single-block patches; ≤5 files; archive superseded plans.
- **Audio stack delay:** Ship minimal happy-path; fall back to text-only.
- **Policy gaps:** Footer label + audit sink before enabling Direct-Agent broadly.

## 7) Stability Guardrails
- Formatting: run formatter when available (`npm run fmt`), but do not block MVP.
- File-naming policy: see `docs/templates/ops.one.policy.filenaming.v2025.10.04.md`.
- Agent catalog: `docs/templates/agent.context.catalog.v01.00.md`.
- **STB delivery:** **One-Fence Rule** (single fenced block; inner code via 4-space indents).

## 8) Providers & Toggles
- OpenAI Responses (proxy `/api/llm/responses`)
- Ollama/Open-WebUI (local stream)
- Voice (Whisper/ElevenLabs) — gated on readiness
- Direct-Agent toggle: **OFF** by default; audit required to enable

## 9) Acceptance Criteria (for MVP)
- Universe UI streams via Live Router when configured (text-only), signed HMAC.
- Memory context injected; "Remember" & Profile edits persist (RLS).
- CI smoke green; rollback path to local Ollama maintained.

## 10) Appendices
- STB examples and prior plan history archived under `docs/_archive/`.
