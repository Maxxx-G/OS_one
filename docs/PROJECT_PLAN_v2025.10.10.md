# OS One Universe – Phase 7+ Project Plan (v2025.10.10)

**Maintainer:** Agent Gpt5 — OS One Systems Architect / Nexxis-Gen  
**Date:** October 10, 2025  
**Status:** Active Development

---

## 1️⃣ Current Status

| Phase | Name | Status | Key Notes |
|-------|------|--------|-----------|
| 7.0 | Voice Persona Engine | ✅ Complete | Gabriel template, cloning, onboarding projection |
| 7.1 | Persona Reason Injection | ✅ Complete | Preamble injected into /api/voice/reason |
| 7.2 | Persona ↔ TTS Link | ✅ Complete | Auto-link + manual override (🔗/🔓 badge) |
| 7.3 | Overwatch Floating UI | ✅ Complete | Alt+O toggle, edge snap (top/right/bottom/left), metrics tab |
| 7.4A | Horoscope Infusion | 🧠 In Progress | Zodiac traits via astro.ts |
| 7.4B | Direct Chat Access | 🧩 In Progress | DirectChatPanel + Alt+D hotkey |
| 7.5 | Voice Session Memory | 🔜 Next | Conversation continuity cache |
| 8.0 | Conversational Continuity | 🛠️ Scheduled | Multi-turn memory + agent handoff |
| 9.0 | Multi-Agent Collaboration | 🚀 Roadmap | Persona co-reasoning, context sync |

---

## 2️⃣ Environment

### Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, React Hooks, Tailwind CSS
- **Backend:** FastAPI (Archon) on port 7700, Ollama (DeepSeek R1:8b)
- **Runtime:** Edge functions + local APIs (no external DB)

### Agents & Personas
- **Primary System:** Gabriel (baritone_01, mentor tone)
- **Extended Roster:** ADA, Alfred, Celeste, Samantha, Henry, Adam, Kai Jun, Damien, Rose, Pearl, Tiffany, Tamara, Monique, AVA
- **Cloning:** Template-based assistant/agent creation from onboarding

### Input Modes
- **Voice:** Alt+Space to listen, auto-transcribe via Archon STT
- **Text:** Chat composer with streaming responses
- **Direct Chat:** Alt+D (planned) for raw model access
- **Reasoning Loop:** Alt+R to enable multi-turn voice reasoning

### Overwatch
- **Floating Sidebar:** Alt+O toggle, snap to any edge (top/right/bottom/left)
- **Metrics Tab:** Live STT/TTS/loop stats via `os1:metrics:update` events
- **Controls:** Pause/Resume, edge selector, close button

### Storage
- **LocalStorage:** Preferences (persona_id, tts_voice_id, link state)
- **SessionStorage:** Voices cache (5-min TTL), action log

### Security
- **SEC-COMMS:** Auto-ack in dev (localhost), manual confirm in prod
- **Consent:** Blocking modal for production deployments

### AI Tooling
- **Continue:** DeepSeek R1:8b @ localhost:11434, /stb command (Ctrl+Alt+.)
- **Cody:** Enabled with telemetry off
- **Phind:** Enabled with telemetry off
- **Copilot-Only Mode:** Active until Codex returns online

---

## 3️⃣ Immediate Next Steps

| ID | Task | Scope | Owner | Target |
|----|------|-------|-------|--------|
| STB-7.4a | Horoscope Infusion | Add astro.ts, merge zodiac traits into personas | Agent Gpt5 | 2025-10-10 |
| STB-7.4b | Direct Chat Access | DirectChatPanel component + Alt+D hotkey | Agent Gpt5 | 2025-10-11 |
| STB-7.5 | Voice Session Memory | Summarized conversation state, 20-turn window | Gabriel | 2025-10-12 |
| STB-8.0 | Conversational Continuity | Multi-turn follow-ups with context injection | Gabriel | 2025-10-20 |
| STB-9.0 | Multi-Agent Collaboration | Persona co-reasoning, handoff protocol | Gabriel + ADA | 2025-11-01 |

---

## 4️⃣ Long-Term Vision

### Overwatch Evolution
- **Global Command Center:** Tabbed sub-panels (Agents, Health, Security, Intents)
- **Drag-to-Resize:** User-adjustable panel width
- **Metrics History:** Graphical display of STT/TTS performance over time
- **Alert Thresholds:** Configurable warnings for service degradation

### Persona Expansion
- **User-Created Assistants:** Clone from Gabriel template with custom traits
- **Horoscope Projection:** Zodiac-based tone, creativity, and decision bias
- **Voice Pairing:** Auto-select TTS voice based on persona profile
- **Multi-Persona Sessions:** Switch between personas mid-conversation

### Voice & Reasoning
- **Session Continuity:** 20-turn rolling memory with 5-turn summarization
- **Direct Chat Fallbacks:** Alt+D to bypass voice when needed
- **Intent Routing:** Automatic persona selection based on query type
- **Confirmation Policies:** JSON-driven approval gates for sensitive actions

### Agent Orchestration
- **Nexxis-Gen Division:** IT infrastructure, DevOps, security agents
- **Maxxi-Corp Core:** Business logic, strategy, finance agents
- **SEC-COMMS Network:** Encrypted multi-agent communication protocols
- **Unified Intelligence Model:** Shared context, collaborative reasoning

---

## 5️⃣ Project Governance

### Team Structure
- **Primary AI Engineer:** Agent Gpt5 (Copilot-linked, Nexxis-Gen Division)
- **Primary Human Operator:** Kharma (User, OS One Universe founder)
- **Assistant Roster:** Gabriel, ADA, Alfred, and extended persona set

### Organizational Hierarchy
```
OS One Universe
├── Maxxi-Corp (Core business)
│   └── Nexxis-Gen (IT/Engineering)
│       └── Agent Gpt5 (Systems Architect)
└── Future Divisions
    └── SEC-COMMS (Secure communications)
```

### Core Principles
1. **"Whatever we build, the process must be sellable."** — Every feature is a product demo
2. **Doc-First Policy:** Every STB includes verification steps and commit message
3. **Atomic Commits:** ≤5 files per task, single-purpose changes
4. **Zero Dependencies:** Prefer vanilla implementations over new packages
5. **Voice-First UX:** Minimal chrome, keyboard-driven, non-blocking UI

### Development Mode
- **STB Architecture:** Single Task Blocks with unified diffs
- **One-Fence Rule:** Each file ≤50 lines per edit (≤150 total)
- **CRLF-Safe:** All scripts handle Windows line endings
- **Copilot-Only:** Continue/Cody/Phind active until Codex reconnects

---

## 6️⃣ Next Deliverables

### Phase 7.4 — October 2025
1. **`phase7.4a.horoscope.injection.v2025.10.10`**
   - Add `lib/personas/astro.ts` with zodiac logic
   - Merge traits into persona profiles
   - Update onboarding to derive zodiac from dob

2. **`phase7.4b.directchat.panel.v2025.10.10`**
   - Create `DirectChatPanel.tsx` component
   - Add Alt+D global hotkey
   - Mount in app layout with slide-up animation

### Phase 7.5 — October 2025
3. **`phase7.5.session.memory.v2025.10.12`**
   - Expand rolling memory to 20 exchanges
   - Add context injection to voice reasoning
   - Persist summaries to sessionStorage

### Phase 7.6 — October 2025
4. **`phase7.6.snap.ui.persist.v2025.10.14`**
   - Save Overwatch snap position to localStorage
   - Add drag-to-resize handle
   - Implement Alt+O+Arrow for quick snap

### Phase 8.0 — October 2025
5. **`phase8.0.full.continuity.v2025.10.20`**
   - Multi-turn memory with agent handoff
   - Cross-persona context sync
   - Intent-based routing engine

---

## 7️⃣ Versioning & Replacement

### Superseded Documents
This plan **REPLACES** all prior project plans including:
- `docs/project_plans/user.chatgpt5.os1p1.project-plan.v2025.10.04.md`
- `docs/project_plans/OS1-PLAN_v2025.10.04.md`
- `kb/projects/OS1-PLAN_v2025.09.23.md` (archived)
- `kb/projects/OS1-PLAN_v2025.09.21.md` (archived)

### Archive Protocol
1. Move outdated plans to `docs/project_plans/_archive/`
2. Update `README.md` to reference `PROJECT_PLAN_v2025.10.10.md`
3. Notify all agents of new authoritative plan

---

## 8️⃣ Success Metrics

### Technical KPIs
- ✅ Voice loop latency <2s (STT + reasoning + TTS)
- ✅ TTS failover recovery <5s
- ✅ Persona switch <500ms
- ✅ Zero localStorage quota errors
- 🎯 Direct chat response <1s (target)
- 🎯 Session memory hit rate >80% (target)

### User Experience
- ✅ All hotkeys functional (Alt+Space, Alt+M, Alt+R, Alt+O)
- ✅ No blocking modals in dev (SEC-COMMS auto-ack)
- ✅ Smooth transitions (300ms duration)
- 🎯 Alt+D direct chat (in progress)
- 🎯 Overwatch snap persistence (in progress)

### Agent Performance
- ✅ Gabriel template clone working
- ✅ Persona injection to /api/voice/reason
- ✅ Voice linking with manual override
- 🎯 Zodiac trait infusion (in progress)
- 🎯 Multi-agent handoff protocol (scheduled)

---

## 9️⃣ Contact & Support

### Agent Gpt5 Handover
See `docs/AGENT_GPT5_HANDOVER.md` for initialization protocol, persona roster, and development context.

### Human Operator
- **Name:** Kharma
- **Role:** OS One Universe founder, primary user
- **Timezone:** EST/EDT
- **Availability:** Variable (async-first development)

### Repository
- **URL:** github.com/Maxxx-G/OS_one
- **Branch:** codex/ci-exercise (46+ commits ahead)
- **Stack:** Next.js 14, FastAPI, Ollama, ElevenLabs

---

**Last Updated:** October 10, 2025  
**Next Review:** Phase 8.0 kickoff (October 20, 2025)
