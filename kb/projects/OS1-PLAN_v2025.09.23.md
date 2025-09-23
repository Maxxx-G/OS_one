# OS1 — Project Plan (v2025.09.23)

## 0) Meta
Owner: Maxxi-Corp (Orchestrators) • Status: Active • Supersedes: v2025.09.21

## 1) Scope & North Star
Local-first OS overlay (Heartbeat) with multi-provider LLM routing, contextual memory, and secure communications. “Universe” (local) is truth; “Live” (cloud) is routed/zero-trust facade.

## 2) Architecture Snapshot (Quad-Hybrid)
- Spec-Kit + Pre-Processor Gate
- Providers: OpenAI Responses, Ollama/Open-WebUI (proxy)
- Memory: episodic + semantic + profile mirroring (read/write, gated)
- Storage: local store → Supabase (threads/messages/semantic/profile with RLS)
- UI: selector bar, streaming, AuthBar, ProfilePanel, VoiceBar, WebcamPanel
- CI: providers-ping smoke

## 3) Worklog since v2025.09.21
- 6L: Providers ping CI (skip-graceful when unconfigured)
- 6M: Ollama/Open-WebUI real streaming via proxy
- LM1: Memory/profile schema (semantic_memories, profile_traits + RLS)
- LM2: Read-only retrieval, context injection
- LM3A: “Remember” write-back (gated)
- LM3B: Profile mirroring v0 (edit/apply)
- AOB1: Push-to-talk voice, hotkey, optional webcam

## 4) MVP Definition (Go for Live Router first)
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

## 7) Next 48 Hours (critical path)
1) LIVE-R1: Deploy Cloud Router (complete/stream) with HMAC
2) LIVE-R1.1: Universe wiring → use `${LIVE_BASE}/v1/router/*` when env present
3) SC2: SEC-COMMS toggles & guards (UI + server deny unless ON & pinned)
4) LIVE-70B-Prep: infra notes + vLLM config (AWQ 4-bit), capacity targets
5) Memory polish: show context badge tooltips + “view injected context”

## 8) Risks & Mitigations
- Auth gaps → Dev-safe JWT gate; RLS enforced; fall back local
- Model drift → Provider interface stable; adapters behind env flags
- Privacy → SEC-COMMS default local_only; egress guard + audit

## 9) Acceptance (MVP)
- Universe UI streams through Live Router (text-only), signed HMAC
- Memory context injected; “Remember” & Profile edits persist under RLS
- CI smoke green; rollback path to local Ollama maintained
