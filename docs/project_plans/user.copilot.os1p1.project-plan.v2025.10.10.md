# OS One Universe – Phase 7+ Project Plan (v2025.10.10)

**Maintainer:** Agent Gpt5 — OS One Systems Architect / Nexxis-Gen  
**Date:** October 10, 2025  
**Status:** Active Development

---

## 1️⃣ Current Status

**Core-Ready**: SEC-COMMS α–η operational; WebUI builds green; smoke suite green; governance framework live.

| Phase | Name | Status | Key Notes |
|-------|------|--------|-----------|
| 7.0 | Voice Persona Engine | ✅ Complete | Gabriel template, cloning, onboarding projection |
| 7.1 | Persona Reason Injection | ✅ Complete | Preamble injected into /api/voice/reason |
| 7.2 | Persona ↔ TTS Link | ✅ Complete | Auto-link + manual override (🔗/🔓 badge) |
| 7.3 | Overwatch Floating UI | ✅ Complete | Alt+O toggle, edge snap (top/right/bottom/left), metrics tab |
| 7.4 | SEC-COMMS α–δ | ✅ Complete | Origin guard, crypto, mesh, identity & relay |
| 7.5 | SEC-COMMS ε (Vault) | ✅ Complete | AES-GCM vault, /api/memory, persistence |
| 7.6 | SEC-COMMS ζ (Replay) | ✅ Complete | Neural embeddings, /api/replay, semantic search |
| 7.7 | SEC-COMMS η (Telemetry) | ✅ Complete | /telemetry dashboard, /api/telemetry, SSE heartbeat |
| 7.8 | MADM α (Consensus) | ✅ Complete | Vision doc, scalar voting (–5..+5) |
| 7.9 | Genesis Hub | ✅ Complete | 10 Tier I apps, AI UI Builder bridge spec |
| 8.0 | θ Autonomic Regulation | 🔜 Next | Load/ethics/resource homeostasis |
| 8.1 | Chat Interface Init | � Next | UI + /api/chat SSE, model connector |
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
- **SEC-COMMS:** Origin + egress guard, X-SEC-COMMS-MODE header
- **Middleware Headers:** CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, COOP/COEP, HSTS (prod)
- **Identity (δ):** ES256 sign/verify, /api/relay authenticated echo (Edge runtime)
- **Vault (ε):** AES-GCM-256 encryption, data/vault/ (excluded from git)
- **Replay (ζ):** Embeddings at data/embeddings/, semantic search via /api/replay
- **Telemetry (η):** Live dashboard at /telemetry, /api/telemetry snapshot
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
| STB-8.0a | Chat Interface Init | UI + /api/chat SSE, model connector gated by SEC-COMMS | Gabriel | 2025-10-14 |
| STB-8.0b | Autonomic Regulation (θ) | Load/ethics/resource governors, policy gates | Gabriel | 2025-10-16 |
| STB-8.1 | CI Smoke Workflow | Enable smoke suite on PRs to main, artifact upload | Agent Gpt5 | 2025-10-18 |
| STB-8.2 | Voice Session Memory | Summarized conversation state, 20-turn window | Gabriel | 2025-10-20 |
| STB-9.0 | Multi-Agent Collaboration | Persona co-reasoning, handoff protocol | Gabriel + ADA | 2025-11-01 |

---

## 4️⃣ Architecture — Security & Runtime

### SEC-COMMS Stack (α–η)
**Status**: Operational across all layers

#### α (Alpha) — Origin Validation & Egress Control
- Middleware-enforced origin validation
- Egress target whitelisting
- X-SEC-COMMS-MODE header (`local_only`, `seccomms_on`, `vpn_required`)

#### β (Beta) — Cryptographic Primitives
- AES-GCM-256 encryption (`lib/seccomms-crypto.ts`)
- SHA-256 hashing
- WebCrypto API integration

#### γ (Gamma) — Mesh Bridge Runtime
- Multi-node messaging framework
- Local-first with relay hooks
- Page: `/mesh` (runtime bridge demo)

#### δ (Delta) — Identity & Authenticated Relay
- ES256 signature generation/verification
- JWT-like token format with expiration
- API: `/api/relay` (GET status, POST authenticated echo)
- Smoke test: `os1_identity_smoke.ps1`

#### ε (Epsilon) — Vault Persistence
- AES-GCM-256 encrypted vault at `data/vault/`
- Files: `seccomms.keys`, `madm.log`, `memory.snap`, `vault.meta`
- API: `/api/memory` (POST /save, GET /load)
- Audit: `os1_vault_check.ps1`
- **Compliance**: Vaults never versioned or transmitted without authorization

#### ζ (Zeta) — Neural Replay & Adaptive Embeddings
- Semantic vectors from vault experiences
- Local: Ollama `nomic-embed-text` (768-dim)
- Remote: OpenAI `text-embedding-3-small` (1536-dim)
- Storage: `data/embeddings/` (excluded from git)
- API: `/api/replay` (POST trigger, GET list, similarity search)
- Audit: `os1_replay_audit.ps1`
- **Purpose**: "Temporal cortex" for pattern recognition across sessions

#### η (Eta) — Telemetry & Visualization
- Live dashboard: `/telemetry`
- API: `/api/telemetry` (vault/embeddings/security snapshot)
- Features: SSE heartbeat sparkline, vault status grid, embeddings count
- Smoke test: `user.copilot.os1p1webui.telemetry-smoke.v2025.10.12.ps1`

### WebUI Endpoints & Pages

**Pages** (Client-Side):
- `/` — Main app interface
- `/seccomms` — SEC-COMMS β loopback demo
- `/mesh` — Mesh bridge γ runtime demo
- `/telemetry` — Telemetry η dashboard (SSE heartbeat, vault/embeddings)

**API Routes** (Server-Side):
- `/api/stream` — SSE streaming (Edge runtime)
- `/api/relay` — Identity δ authenticated echo (Edge runtime)
- `/api/memory` — Vault ε save/load (Node.js runtime)
- `/api/replay` — Neural replay ζ trigger/search (Node.js runtime)
- `/api/telemetry` — System snapshot η (Node.js runtime)
- `/api/voice/*` — Voice reasoning, TTS, metrics
- `/api/archon/*` — Archon proxy, transcription

### Middleware Security Headers
**File**: `apps/web-ui/middleware.ts`

**Headers** (all routes):
- `Content-Security-Policy`: self-only by default, extend `connect-src` per provider
- `Referrer-Policy`: no-referrer
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `Permissions-Policy`: camera/microphone default-deny
- `Cross-Origin-Opener-Policy`: same-origin
- `Cross-Origin-Embedder-Policy`: require-corp
- `Strict-Transport-Security`: enabled in production only
- `X-SEC-COMMS-MODE`: reflects current SEC-COMMS mode

**Verification**: `os1_headers_check.ps1`

---

## 5️⃣ Governance — Policies & Validation

### Filenaming Convention (Compound Identifiers)
**Policy**: `docs/policies/user.copilot.docs.stb-filename-header-policy.v2025.10.10.md`

**Pattern**: `user.copilot.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}`

**Compound Domains** (extended 2025-10-11):
- `os1p1webui` — WebUI features (phase 1)
- `os1p1docs` — Documentation & templates (phase 1)
- `os1p2madm` — MADM consensus system (phase 2)
- `os1p2vault` — Vault persistence (phase 2)
- `os1p2replay` — Neural replay (phase 2)
- `os1universe` — Genesis Series hub & ecosystem

**Examples**:
- `user.copilot.os1p1webui.chat-interface-init.v2025.10.14.md`
- `user.copilot.os1p2replay.spec.v2025.10.12.md`
- `user.copilot.os1universe.genesis-hub.v2025.10.12.md`

### STB Validator
**Script**: `scripts/validate_stb_headers.mjs`

**Extensions**: `.md`, `.ps1`, `.json`, `.yaml`, `.yml`, `.ts`, `.tsx`

**Checks**:
- Filename matches pattern (including compound identifiers)
- Header block present with X-Tier1, X-Agent, X-Domain, X-Purpose, X-Version, X-Policy
- Version matches filename

**Usage**: `npm run validate:stb`

**CI Integration**: Pre-commit hook + planned PR workflow

### Legacy Template Migration
**Date**: 2025-10-11

**Renamed Files** (7 total):
- `OS1-PROJ-TEMPLATE.v2025.09.17.md` → `user.copilot.os1p1docs.proj-template.v2025.09.17.md`
- `OS1-SINGLE-TASK-BLOCK-COPILOT.v2025.09.21.md` → `user.copilot.os1p1docs.stb-template-copilot.v2025.09.21.md`
- `agent.context.catalog.v01.00.md` → `user.copilot.os1p1docs.agent-context-catalog.v2025.10.04.md`
- Plus 4 more (see `user.copilot.filenaming.template-rename-completion.v2025.10.11.md`)

**References Updated**: 25 occurrences across 6,705 files

**Method**: PowerShell script `os1_rename_templates.ps1` with `git mv` for history preservation

### Smoke & Security Validation

**Smoke Suite** (`npm run smoke`):
- STB validator (filename + header compliance)
- Repo audit (large files, binary assets)
- Secrets scan (API keys, tokens)
- UI build verification
- Report generation

**Security Checks**:
- Headers self-check: `os1_headers_check.ps1`
- Identity smoke: `os1_identity_smoke.ps1`
- Vault audit: `os1_vault_check.ps1`
- Replay audit: `os1_replay_audit.ps1`
- Telemetry smoke: `user.copilot.os1p1webui.telemetry-smoke.v2025.10.12.ps1`

**Reports**: `docs/reports/`

---

## 6️⃣ Genesis Series Hub & MADM α

### The Genesis Series (Tiered Subscription Suite)
**Hub**: `docs/hubs/user.copilot.os1universe.genesis-hub.v2025.10.12.md`  
**Registry**: `docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json`

#### Tier I — Foundational Apps (10 total)
| App | Domain | SEC-COMMS | Status |
|-----|--------|-----------|--------|
| AuroraWire | News & Research | α,ε,ζ,η | Planned |
| Nexxis Trade | Crypto & Finance | α,ε,ζ,η | Planned |
| Maxxi Ops | Business & IT | α,δ,ε,ζ,η | Planned |
| CineForge | Video Studio | α,ε,ζ,η | Planned |
| WaveMind | Music Studio | α,ε,ζ,η | Planned |
| LexiCore | Word Processor | α,δ,ε,ζ,η | Planned |
| Dev Matrix | IDE & CLI | α,δ,ε,ζ,η | Planned |
| EchoReach | Marketing & Sales | α,δ,ε,ζ,η | Planned |
| Nova Path | Learning & Coaching | α,ε,ζ,η | Planned |
| Eidos | Art / 3D / Motion | α,ε,ζ,η | Planned |

**Shared Infrastructure**: SEC-COMMS α–η, vault ε, replay ζ, telemetry η

#### Tier II — Adaptive Path
- Semi-autonomous orchestration via personality vectors
- Intent translation: prompts → policies
- Habit recognition via replay (ζ)

#### Tier III — Sovereign Intelligence
- Reserved/controlled distribution
- ADA-supervised autonomy
- Dual-key ethics enforcement

#### Roadmap Phases
- **θ (Theta)**: Autonomic regulation (load/ethics/resources)
- **ι (Iota)**: Multi-tenant subscription & licensing
- **κ (Kappa)**: App marketplace curation + plugin signing

### MADM α (Consensus Kernel)
**Vision**: `docs/vision/user.copilot.os1p2madm.consensus-kernel.v2025.10.11.md`

**Scalar Voting**: –5 (strong reject) to +5 (strong accept)

**Tiers**:
- **Tier 1**: Human input (weighted highest)
- **Tier 2+**: Agent consensus (aggregated via heartbeat)

**Acceptance Thresholds**:
- Simple: >60% positive
- Security: >80% positive
- Ethics: >90% positive

**Future**: Visual dashboard in telemetry η, decision tokenization via SEC-COMMS δ

### AI UI Builder Bridge
**Spec**: `docs/policies/user.copilot.os1universe.ai-ui-builder-bridge.v2025.10.12.md`

**5-Phase Workflow**:
1. **Discovery**: Scan repos for policies/schemas/templates
2. **Plan Draft**: Generate STB document
3. **Synthesis**: Create code files (≤5, minimal footprint)
4. **Validation**: STB/build/smoke/secrets checks
5. **Round-Trip**: Submit PR with ES256 signature + human review

**Safeguards**:
- Read-only by default
- Write actions gated by PR policy
- No external egress in `local_only` mode
- Auto-revert if smoke fails

**API Contract**: 5 endpoints for AI builder integration

---

## 7️⃣ Long-Term Vision

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

## 7️⃣ Long-Term Vision

### Overwatch Evolution
- **Global Command Center:** Tabbed sub-panels (Agents, Health, Security, Intents)
- **Drag-to-Resize:** User-adjustable panel width
- **Metrics History:** Graphical display of STT/TTS performance over time
- **Alert Thresholds:** Configurable warnings for service degradation
- **Telemetry Integration:** Embed `/telemetry` dashboard in Overwatch tab

### Persona Expansion
- **User-Created Assistants:** Clone from Gabriel template with custom traits
- **Voice Pairing:** Auto-select TTS voice based on persona profile
- **Multi-Persona Sessions:** Switch between personas mid-conversation
- **Personality Vectors:** Adaptive curriculum via Nova Path (Tier I app)

### Voice & Reasoning
- **Session Continuity:** 20-turn rolling memory with 5-turn summarization
- **Direct Chat Fallbacks:** Alt+D to bypass voice when needed
- **Intent Routing:** Automatic persona selection based on query type
- **Confirmation Policies:** JSON-driven approval gates for sensitive actions

### Agent Orchestration
- **Nexxis-Gen Division:** IT infrastructure, DevOps, security agents
- **Maxxi-Corp Core:** Business logic, strategy, finance agents
- **SEC-COMMS Network:** Encrypted multi-agent communication protocols (α–η)
- **Unified Intelligence Model:** Shared context via vault ε + replay ζ
- **MADM Consensus:** Hierarchical voting system for collaborative decisions

---

## 8️⃣ Project Governance

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
6. **Security by Default:** SEC-COMMS enforcement, strict headers, vault encryption
7. **Governance Compliance:** Filename + header validation, smoke suite green

### Development Mode
- **STB Architecture:** Single Task Blocks with unified diffs
- **One-Fence Rule:** Each file ≤50 lines per edit (≤150 total)
- **CRLF-Safe:** All scripts handle Windows line endings
- **Copilot-Only:** Continue/Cody/Phind active until Codex reconnects

---

## 9️⃣ Next Deliverables

### Phase 8.0 — October 2025
1. **`user.copilot.os1p1webui.chat-interface-init.v2025.10.14.md`**
   - Create chat UI component with streaming support
   - Add /api/chat SSE endpoint
   - Model connector gated by SEC-COMMS
   - Integration with vault ε for message history

2. **`user.copilot.os1p1webui.autonomic-theta-init.v2025.10.16.md`**
   - Load balancing via telemetry η metrics
   - Ethics circuit breakers (halt on policy violations)
   - Resource governors (token limits, rate limiting)
   - Policy gates for sensitive operations

### Phase 8.1 — October 2025
3. **`user.copilot.os1p1docs.ci-smoke-workflow.v2025.10.18.md`**
   - Enable smoke suite on PRs to main
   - Artifact upload for reports
   - Auto-fail on validator errors or secrets
   - Integration with GitHub Actions

### Phase 8.2 — October 2025
4. **`user.copilot.os1p1webui.session-memory.v2025.10.20.md`**
   - Expand rolling memory to 20 exchanges
   - Add context injection to voice reasoning
   - Persist summaries to vault ε
   - 5-turn summarization window

### Phase 9.0 — November 2025
5. **`user.copilot.os1p2madm.multi-agent-collab.v2025.11.01.md`**
   - Multi-agent handoff protocol
   - Cross-persona context sync via replay ζ
   - MADM α consensus for collaborative decisions
   - Intent-based routing engine

---

## 🔟 Success Metrics & KPIs

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

## 🔟 Success Metrics & KPIs

### Build & Validation
- ✅ **Build Status**: 100% green across all modified modules
- ✅ **TypeScript Errors**: 0 compile errors
- ✅ **STB Compliance**: 0 validator errors on templates/policies
- ✅ **Smoke Suite**: All checks passing (repo audit, secrets scan, UI build)
- ✅ **Security Headers**: Presence verified by headers-check + telemetry

### Technical KPIs
- ✅ Voice loop latency <2s (STT + reasoning + TTS)
- ✅ TTS failover recovery <5s
- ✅ Persona switch <500ms
- ✅ Zero localStorage quota errors
- ✅ SEC-COMMS mode switching <100ms
- ✅ Vault encryption/decryption <200ms
- ✅ Embedding generation <1s (local), <500ms (remote)
- 🎯 Chat interface response <1s (target)
- 🎯 Session memory hit rate >80% (target)

### User Experience
- ✅ All hotkeys functional (Alt+Space, Alt+M, Alt+R, Alt+O)
- ✅ No blocking modals in dev (SEC-COMMS auto-ack)
- ✅ Smooth transitions (300ms duration)
- ✅ Telemetry dashboard updates every 4s
- ✅ SSE heartbeat sparkline visualization
- 🎯 Alt+D direct chat (planned)
- 🎯 Overwatch snap persistence (planned)

### Agent Performance
- ✅ Gabriel template clone working
- ✅ Persona injection to /api/voice/reason
- ✅ Voice linking with manual override
- ✅ ES256 identity generation/verification
- ✅ Vault encryption/persistence operational
- ✅ Neural replay embedding generation
- 🎯 Multi-agent handoff protocol (scheduled)

### Governance Compliance
- ✅ Filename policy: All new files follow compound identifier pattern
- ✅ Header validation: X-Tier1, X-Agent, X-Domain, X-Purpose, X-Version, X-Policy
- ✅ Git hygiene: Vault and embeddings excluded from version control
- ✅ Rollback snippets: Included in all STB documents
- ✅ Smoke reports: Generated in docs/reports/

---

## 1️⃣1️⃣ Risks & Mitigations

### Security Risks
**Risk**: Over-permissive CSP when enabling AI providers  
**Mitigation**: Env-mapped CSP profiles + report-only ramp; SEC-COMMS mode gating

**Risk**: Vault/embedding files committed to git  
**Mitigation**: `.gitignore` exclusions + pre-commit hooks + CI validation

**Risk**: ES256 private keys exposed  
**Mitigation**: Secrets scan in smoke suite; never commit keys; vault encryption

### Performance Risks
**Risk**: Vault/embedding storage growth unbounded  
**Mitigation**: Rotation utilities (`rotateEmbeddings(keepCount)`), retention policies, audit scripts

**Risk**: Telemetry polling overhead  
**Mitigation**: 4s poll interval; static route pre-rendering; Node.js runtime for fs access

### Development Risks
**Risk**: Multi-agent filename drift  
**Mitigation**: STB validator + pre-commit hook + CI enforcement; compound identifier policy

**Risk**: Breaking changes to existing APIs  
**Mitigation**: Smoke suite validation; rollback snippets in all STBs; PR review gates

**Risk**: Dependency creep  
**Mitigation**: "Zero dependencies" principle; vanilla implementations preferred; PR approval for new packages

---

## 1️⃣2️⃣ Versioning & Replacement

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
