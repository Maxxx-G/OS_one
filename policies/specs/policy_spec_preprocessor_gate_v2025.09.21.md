# OS One Policy Spec — Pre-Processor Gate

**Version:** 1.0  
**Status:** Active  
**Owner:** OS One Orchestrators (Gabriel-led)  
**Date:** 2025-09-21  
**Security Authority:** ADA (Policy Keeper / Compliance Manager)

---
## 1. What (Rule Definition)
No raw human input may be forwarded to core LLMs (GPT-5, Codex, Copilot, etc.).  
All inbound text/audio/vision is first normalized by a **Pre-Processor** into a structured **Spec Form**.

---
## 2. How (Procedure / Mechanism)
- **Ingress:** Orchestrator receives user input (chat, voice, webcam OCR).  
- **Normalization:** Pre-Processor converts input to fields:
  - Goal / Outcome
  - Context & Constraints
  - Inputs / Artifacts (links, files)
  - Output Format
  - **LLM Controls:** reasoning.effort (low|med|high), tool_choice/budget, state/thread flags, self-review rubric
- **Validation:** If fields missing/ambiguous → Pre-Processor issues concise clarifying question(s).  
- **Handoff:** Only structured Spec Form is sent to worker LLMs. Raw text is never attached to LLM calls.  
- **Quarantine:** Violations routed to `logs/quarantine/` with trace-id and auto-open PR to fix.

---
## 3. Why (Rationale / Purpose)
- Eliminates ambiguity/GIGO; reduces token waste and tool flailing.  
- Enforces deterministic Codex blocks and predictable reasoning depth.  
- Preserves privacy by preventing accidental raw data leakage.

---
## 4. Address (Execution / Enforcement)
- **Authority:** ADA  
- **Enforcer Component:** Orchestrators (Gabriel et al.) with Pre-Processor Gate  
- **Logging:** `logs/watchdog/` (pass) and `logs/quarantine/` (fail); daily audit by ADA

---
## 5. Versioning & Audit Trail
- Created By: Orchestrator (system)  
- Modified By: …  
- Change Notes: …

**Links**
- Naming Spec: `policies/naming_convention_spec_os_one_universe_v0.1_rev1_04_09_2025.md`
- Agent Sys Addendum (pending)
- Universal Prompt + Responses Flags (pending)
