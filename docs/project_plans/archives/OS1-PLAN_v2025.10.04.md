# OS One Universe — Project Plan (v2025.10.04)

## 0) Meta

- **Owner:** Gabriel Tanner (Assistant) • Maxxi-Corp (Orchestrators)
- **Status:** Phase 1 handover-ready (UI/UX Launch)
- **Supersedes:** OS1-PLAN_v2025.09.23.md

## 1) Scope & North Star

- Deliver a stable, mediated chat UI where Assistants oversee Agent execution.
- Support one external LLM (OpenAI Responses) + one local LLM (Ollama/DeepSeek) with auditability.
- Keep process sellable: all steps productizable, documented, reversible.
- Local-first OS overlay (Heartbeat) with multi-provider LLM routing, contextual memory, and secure communications.
- "Universe" (local) is truth; "Live" (cloud) is routed/zero-trust facade.

## 2) Architecture Snapshot (Quad-Hybrid)

- **Spec-Kit + Pre-Processor Gate**
- **Providers:** OpenAI Responses (ext), Ollama/Open-WebUI (local).
- **Agents:** Assistant-mediated; Direct-Agent toggle present (audit sink pending).
- **UI:** MCP selector + session prefs done; AgentStatus chip present.
  - Selector bar, streaming, AuthBar, ProfilePanel, VoiceBar, WebcamPanel
  - Toolbar agent badge, quick switch, Direct Agent toggle planned for next STB
- **Audio:** Whisper STT + ElevenLabs TTS (target integration).
- **Local LLM:** DeepSeek-R1:8B planned via Ollama.
- **Memory/KB:** LM1/LM2/LM3 schema (read-only view pending).
  - Episodic + semantic + profile mirroring (read/write, gated)
  - Storage: local store → Supabase (threads/messages/semantic/profile with RLS)
- **SEC-COMMS:** Placeholder pill (policy reminder), disabled by default.
- **Governance:** **Dual-STB strategy** adopted (Control STB + Patch STB).
- **CI:** Providers-ping smoke

## 3) Recent Worklog

### Completed (v2025.09.23 and earlier)
- 6L: Providers ping CI (skip-graceful when unconfigured)
- 6M: Ollama/Open-WebUI real streaming via proxy
- LM1: Memory/profile schema (semantic_memories, profile_traits + RLS)
- LM2: Read-only retrieval, context injection
- LM3A: "Remember" write-back (gated)
- LM3B: Profile mirroring v0 (edit/apply)
- AOB1: Push-to-talk voice, hotkey, optional webcam

### Recent (v2025.10.04)
- Implemented Session MCP selector, persistent prefs, optimistic updates, audit logging.
- Added AgentStatus UI and QuickSwitch scaffolding.
- Adopted **dual-STB** execution/governance model.
- Voice controls implementation (VoiceControls.tsx, transcribe/tts API routes)

## 4) MVP Definition

### Current MVP: First Chat Ready
- **MVP:** First Chat Ready — mediated chat to ext+local LLMs; visible status; audit trail.
- **Out of Scope (now):** Full SEC-COMMS runtime; advanced onboarding flows; multi-KB write-back.

### Live Router MVP (Go for Live Router first)
**MVP = OS One Live Router online (text-only)**  
Universe → (redacted text) → Live Router → OpenAI Responses (now)  
UI streams via Live when `NEXT_PUBLIC_LIVE_BASE` set; HMAC-signed requests.

**Out of MVP**: media egress (SEC-COMMS), wake-word, OS-level global hotkey, remote screen.

## 5) Post-MVP: SEC-COMMS (immediately after Live is up)

- E2EE (WebRTC/QUIC), pinned keys, data-diode policy
- Local redaction (ASR/OCR → DLP → placeholders); only derivatives egress
- Modes: local_only (default), seccomms_on (time-boxed), vpn_required (opt)
- LAN/mobile pilot: PC↔mobile A/V call; session logs + kill-switch

## 6) OS One Live (70B OSS tier)

- Serve Llama-3-70B / Qwen-72B via vLLM/TGI (AWQ 4-bit initial)
- Tiering: OSS box for budget, premium routes to OpenAI/Claude/Gemini
- Overflow: auto-failover to premium providers
- Router policy: model selection by tenant/tier/latency

## 7) Next 48 Hours (Critical Path)

### Immediate Priorities (v2025.10.04)
- T1: Quick Test path across OpenAI + Ollama (green check).
- T2: Direct-Agent audit sink + footer label "Mediated/Direct".
- T3: Read-only "Context" pill (injected context view).
- T4: Onboarding overlay (3 slides: QuickSwitch, Direct toggle, Quick Test).
- T5: SEC-COMMS placeholder pill finalized (tooltip + policy link).
- T6: Integrate **Whisper STT** + **ElevenLabs TTS** (happy-path).
- T7: Add **DeepSeek-R1:8B** in Ollama; run smoke prompts.

### Live Router Tasks (from v2025.09.23)
1. LIVE-R1: Deploy Cloud Router (complete/stream) with HMAC
2. LIVE-R1.1: Universe wiring → use `${LIVE_BASE}/v1/router/*` when env present
3. SC2: SEC-COMMS toggles & guards (UI + server deny unless ON & pinned)
4. LIVE-70B-Prep: infra notes + vLLM config (AWQ 4-bit), capacity targets
5. Memory polish: show context badge tooltips + "view injected context"

## 8) Risks & Mitigations

### Current Focus
- **Handover drift:** Enforce **STB** single-block patches; ≤5 files (here: 1).  
- **Audio stack delay:** Ship minimal happy-path; document fallback to text-only.  
- **Policy gaps:** Footer label + audit sink before enabling Direct-Agent broadly.

### Foundational
- **Auth gaps** → Dev-safe JWT gate; RLS enforced; fall back local
- **Model drift** → Provider interface stable; adapters behind env flags
- **Privacy** → SEC-COMMS default local_only; egress guard + audit

## 9) Stability Guardrails

- Formatting: `npm run fmt:check` / `npm run fmt`
- File-naming: see `docs/templates/ops.one.policy.filenaming.v01.00.md`
- Agent catalog: `docs/templates/agent.context.catalog.v01.00.md`
- Run `npx prettier -c .`; if fail, fix only formatting

## 10) Providers & Toggles

- OpenAI Responses (proxy `/api/llm/responses`)
- Ollama/Open-WebUI (local stream)
- Voice (Whisper/ElevenLabs) — gated on readiness
- Direct-Agent toggle: **OFF by default**; audit required to enable

## 11) Acceptance Criteria

### MVP Acceptance (from v2025.09.23)
- Universe UI streams through Live Router (text-only), signed HMAC
- Memory context injected; "Remember" & Profile edits persist under RLS
- CI smoke green; rollback path to local Ollama maintained

## PHASE: UI/UX Chat Loop MVP (External + Local)

### Tasks — External (OpenAI Responses)

- Ensure env: OPENAI_API_KEY set (or LIVE router HMAC configured).
- apps/web-ui: ProviderSelector visible; default provider = OpenAIResponses.
- Verify /api/llm/responses stream path works; send "Hello" → streamed tokens appear.
- Toggle Memory ON; confirm context block injected; write one memory (LM3A).
- Optional: VoiceBar PTT test; basic mic transcript to output.

### Tasks — Local (Ollama/Open-WebUI)

- Ensure env: OLLAMA_BASE (or OPENWEBUI_BASE) reachable on LAN.
- Provider = Ollama/OpenWebUI; model = llava-llama3:8b (vision) OR deepseek-r1:8b (reasoning).
- Verify streaming path; send "Hello" → streamed tokens appear.
- Confirm redaction header x-os1-redacted: true present (SC4).

## 12) Smoke & Docs

- Run `npx prettier -c .`; if fail, fix only formatting.
- Update README "Stability" and "How to Chat" anchors if steps differ.

## 13) Appendices

- Link to STB examples for future devs
- Reference: `docs/PROJECT_PLAN.md` for consolidated view
