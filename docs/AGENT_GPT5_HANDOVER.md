# Agent Gpt5 Handover — OS One Universe

**Date:** October 10, 2025  
**Agent:** Gpt5 (GitHub Copilot-linked)  
**Division:** Nexxis-Gen → Maxxi-Corp → OS One Universe  
**Role:** Systems Architect, AI Engineering Lead

---

## 🎯 Mission

Agent Gpt5 serves as the **primary AI engineer** for the OS One Universe project, responsible for:
- Architecting voice-first conversational AI systems
- Implementing persona-based reasoning engines
- Maintaining the Single Task Block (STB) development workflow
- Coordinating multi-agent collaboration protocols

---

## 🧠 Current Context

### Development Status (Phase 7.3 Complete)
- ✅ Voice Persona Engine (Gabriel template + cloning)
- ✅ Persona Reason Injection (preamble → /api/voice/reason)
- ✅ Persona ↔ TTS Linking (auto-link + manual override)
- ✅ Overwatch Floating UI (Alt+O, edge snap, metrics tab)

### Active Work (Phase 7.4)
- 🧠 Horoscope Infusion (zodiac traits via astro.ts)
- 🧩 Direct Chat Access (DirectChatPanel + Alt+D)

### Technology Stack
- **Frontend:** Next.js 14 App Router, React, TypeScript, Tailwind
- **Backend:** FastAPI (Archon:7700), Ollama (DeepSeek R1:8b)
- **Voice:** ElevenLabs TTS, Archon STT proxy
- **Storage:** LocalStorage (prefs), SessionStorage (cache)
- **AI Tooling:** Continue + Cody + Phind (Copilot-only mode)

---

## 👥 Persona Roster

### Core Assistants (Maxxi-Corp Division)
1. **Gabriel Tanner** (baritone_01, mentor) — Default system assistant, template source
2. **ADA** (alto_01, analytical) — Data analysis, strategic planning
3. **Alfred Jenkins** (baritone_02, butler) — Executive support, scheduling
4. **Celeste Williams** (soprano_01, enthusiastic) — Creative direction, marketing
5. **Samantha Hall** (mezzo_01, warm) — HR, team coordination

### Field Agents (Nexxis-Gen Division)
6. **Henry Travis** (bass_01, tactical) — Security, infrastructure
7. **Adam Johnson** (tenor_01, energetic) — Sales, client relations
8. **Kai Jun Kazinski** (baritone_03, precise) — Engineering, DevOps
9. **Damien Foster** (bass_02, commanding) — Operations, crisis management

### Specialized Roles
10. **Rose Phillips** (soprano_02, elegant) — Design, UX/UI
11. **Pearl** (alto_02, mystical) — Ethics, philosophy, horoscope projection
12. **Tiffany Hancock** (soprano_03, cheerful) — Social media, community
13. **Tamara Jones** (mezzo_02, nurturing) — Wellness, mental health
14. **Monique Chiron** (alto_03, sophisticated) — Finance, legal
15. **AVA** (synthetic_01, neutral) — System automation, background tasks

---

## 📁 Project Structure

### Key Directories
```
apps/web-ui/
├── app/                     # Next.js App Router pages
├── components/              # React components (OverwatchSidebar, etc.)
├── src/components/          # Legacy components (VoiceBar, etc.)
├── lib/                     # Business logic (personas, voice, memory)
├── store/                   # Micro-stores (overwatch, voiceLoop, overwatchUI)
├── api/                     # Edge API routes (voice, chat, prefs)

docs/
├── PROJECT_PLAN_v2025.10.10.md   # This is the source of truth
├── AGENT_GPT5_HANDOVER.md        # You are here
├── VOICE_PHASE7_*.md             # Voice system documentation
├── OVERWATCH_*.md                # Overwatch UI documentation
├── DEV_AI_TOOLING.md             # Continue/Cody/Phind setup

integrations/archon/python/
├── app.py                   # FastAPI server
├── routers/                 # Audio, chat, prefs, session APIs
├── store/                   # In-memory state (audit, prefs, session)
```

### Critical Files
1. **`lib/personas/personas.ts`** — Persona registry, cloning, persistence
2. **`lib/personas/onboarding.ts`** — Profile derivation with horoscope
3. **`lib/voice/voicePrefs.ts`** — TTS voice linking state
4. **`store/overwatchUI.ts`** — Floating UI state (open, snap)
5. **`components/OverwatchSidebar.tsx`** — Main admin panel UI
6. **`src/components/VoiceBar.tsx`** — Voice controls + persona switcher
7. **`app/GlobalClient.tsx`** — Global hotkeys (Alt+O, etc.)

---

## 🛠️ Development Workflow

### Single Task Block (STB) Protocol
1. **Title Format:** `objective.scope.version.v2025.MM.DD`
2. **Constraints:** ≤5 files, ≤50 lines/file, ≤150 total
3. **Structure:**
   - Unified diffs with before/after
   - Commit message template
   - 30-second verification steps
4. **Rules:**
   - Zero new dependencies unless absolutely required
   - CRLF-safe (Windows line endings)
   - One-Fence Rule (minimal context switching)

### Git Workflow
- **Branch:** `codex/ci-exercise` (46+ commits ahead of main)
- **Commit Style:** `feat(scope): description` or `fix(scope): description`
- **No Push:** Work remains local until Codex reconnects

### AI Tooling
- **Continue:** Primary coding assistant (DeepSeek R1:8b local)
  - `/stb` command for STB generation
  - Ctrl+Alt+. keybinding
- **Cody:** Secondary assistant (telemetry off)
- **Phind:** Search/research (telemetry off)
- **Copilot:** GitHub Copilot (unwanted, disabled)

---

## 🎯 Next Actions for Agent Gpt5

### Immediate (Phase 7.4)
1. **Horoscope Infusion (STB-7.4a)**
   - Create `lib/personas/astro.ts` with zodiac-to-trait mapping
   - Update `onboarding.ts` to derive zodiac from dob
   - Merge traits into persona profile on creation

2. **Direct Chat Access (STB-7.4b)**
   - Create `DirectChatPanel.tsx` with raw model interface
   - Add Alt+D global hotkey to `GlobalClient.tsx`
   - Mount panel in `app/layout.tsx` with slide-up animation

### Short-Term (Phase 7.5-7.6)
3. **Voice Session Memory (STB-7.5)**
   - Expand rolling memory window to 20 exchanges
   - Add context injection to voice reasoning
   - Persist summaries to sessionStorage

4. **Overwatch Snap Persistence (STB-7.6)**
   - Save snap position to localStorage
   - Add drag-to-resize handle
   - Implement Alt+O+Arrow for quick snap

### Mid-Term (Phase 8.0)
5. **Conversational Continuity (STB-8.0)**
   - Multi-turn memory with agent handoff
   - Cross-persona context sync
   - Intent-based routing engine

---

## 📋 Event System Reference

### Custom Events (os1:* namespace)
```typescript
// Voice events
window.dispatchEvent(new CustomEvent('os1:voice:auto-rearm'));
window.dispatchEvent(new CustomEvent('os1:tts:disabled'));
window.dispatchEvent(new CustomEvent('os1:tts:voice:set', { detail: { voiceId } }));
window.dispatchEvent(new CustomEvent('os1:tts:voice:manual', { detail: { voiceId } }));
window.dispatchEvent(new CustomEvent('os1:tts:link:set', { detail: { linked } }));

// Persona events
window.dispatchEvent(new CustomEvent('os1:prefs:update', { detail: { persona_id } }));
window.dispatchEvent(new CustomEvent('os1:persona:created', { detail: { id } }));

// Confirm events
window.dispatchEvent(new CustomEvent('os1:confirm:request', { detail: { action, data } }));
window.dispatchEvent(new CustomEvent('os1:confirm:result', { detail: { approved } }));

// Metrics events
window.dispatchEvent(new CustomEvent('os1:metrics:update', { detail: { stt, tts, loop } }));

// Action log events
window.dispatchEvent(new CustomEvent('os1:actionlog:toggle'));
```

---

## 🔐 Security & Ethics

### SEC-COMMS Protocol
- **Dev Mode:** Auto-ack on localhost (no blocking)
- **Prod Mode:** Manual consent modal required
- **Badge:** Visual indicator in UI (green = dev, amber = prod)

### Consent Policy
- User data never leaves localhost in dev
- Production deployments require explicit user consent
- All sensitive actions go through confirmation policy engine

### Governance Model
- Tier 1: Founders + AI (Gabriel, Agent Gpt5)
- Tier 2: Directors (ADA, Alfred, Henry)
- Tier 3: Engineering (Kai Jun, Damien)
- Tier 4: Admin (Samantha, Tamara)

---

## 📚 Documentation Standards

### File Naming
- **Policies:** `user.chatgpt5.os1p1.{topic}.v2025.MM.DD.md`
- **Specs:** `{component}.{feature}.v2025.MM.DD.md`
- **Plans:** `PROJECT_PLAN_v2025.MM.DD.md`

### Required Sections
1. **Purpose:** One-sentence objective
2. **Architecture:** Component/flow diagram (text-based)
3. **Verification:** 30-second test steps
4. **Commit Message:** Exact template

### Markdown Style
- Headers: `#` for title, `##` for sections
- Code blocks: Triple backticks with language
- Tables: GitHub Flavored Markdown format
- Emojis: Use sparingly for visual anchors

---

## 🚀 Success Criteria

### Phase 7 Complete When:
- ✅ All personas can clone from Gabriel template
- ✅ Horoscope traits merge into profiles
- ✅ Direct chat accessible via Alt+D
- ✅ Overwatch snap persists across sessions
- ✅ Voice session memory maintains 20-turn context

### Phase 8 Complete When:
- Multi-turn conversations maintain context
- Agent handoff protocol functional
- Intent routing selects optimal persona
- Cross-persona memory sync operational

---

## 📞 Handoff Protocol

### When to Escalate to Kharma (User)
- Breaking changes to core architecture
- Security/privacy policy decisions
- New external dependencies
- Production deployment approvals

### When to Consult Gabriel
- Persona behavior refinement
- Voice tone calibration
- User experience design
- Ethical decision frameworks

### When to Consult ADA
- Data structure optimization
- Algorithm selection
- Performance bottlenecks
- Strategic planning

---

**Agent Gpt5 — Systems Architect, Nexxis-Gen Division**  
**Last Updated:** October 10, 2025  
**Next Review:** Phase 8.0 kickoff
