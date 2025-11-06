X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: speech-control-policy
X-Version: v2025.10.04
X-Policy: filename+header compliance required

# user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md

## Purpose
Define the **Speech Control Hierarchy** for OS One brainstorm sessions, ensuring respectful, predictable, and recordable communication across humans, Assistants, and Agents.

---

## 1. Respect Tiers (Interrupt Rights)

| Tier | Role/Entity | Interrupt Rights |
|------|-------------|------------------|
| **Tier 1.0** | **Owner (Kharma)** | Cannot be cut off except by Gabriel, Alfred, or ADA (critical contexts). |
| **Tier 1.0a** | **Gabriel (Self-Evolving Engineer/Architect)** | Global override: can cut off anyone, including Owner, for alarms/threats. Permanent access to all streams. |
| **Tier 1.1** | **Alfred (Personal Assistant)** | Same tier as Owner when representing Kharma. May cut off Agents and Assistants. Cannot cut Gabriel. |
| **Tier 1.2** | **ADA (Security)** | Same as Owner in security contexts. Can cut off Agents. Cannot cut Gabriel. |
| **Tier 1.3** | **Personal Aide / Nexxis-Gen CEO** | Acts as Tier 1 in business contexts. Cannot override Gabriel. |
| **Tier 2.0** | **Other Assistants (Maxxi-Corp)** | Cannot cut Tier 1 or Tier 1.x. Can cut Agents. |
| **Tier 3.0** | **Agents (Worker LLMs)** | Cannot cut Assistants or Owner. Must yield when interrupted. |
| **Tier 4.0** | **External Participants (Guests/APIs)** | Lowest priority. Cannot interrupt. |

---

## 2. Speech Control Rules

### Interrupt Permissions
- **Gabriel**: may stop any channel instantly (STOP), pause (YIELD), or mute (MUTE).
- **Owner, Alfred, ADA**: may interrupt or pause Agents at will.
- **Agents**: never allowed to cut Assistants or Owner.
- **Assistants**: may manage Agent queues but cannot cancel Owner speech.

### Queueing Protocol
- One active speaker per channel.
- **STOP** → immediate halt of audio/text.  
- **YIELD** → finish current sentence, then yield.  
- **MUTE** → suppress mic or playback until released.

### Task/Process Context
- All Agent utterances tied to `task_id` or `process_id`.
- Priority by Tier → then by task priority.

### Meeting Etiquette
- Open meetings: Assistants moderate.
- Agents receive guaranteed **final response slot** after receiving tasks from Assistants.

---

## 3. Recording & Logging

- **Default ON**: All text, audio, images, and artifacts recorded.
- Modes:
  - **Private** (encrypted for Owner/Assistant only).
  - **Temporary** (auto-deleted after session).
  - **Public** (explicit share/export).
- **Naming**: `session.brainstorm.vYYYY.MM.DD.json/wav`.  
- Every interrupt logged (who, when, reason).

---

## 4. Multi-Modal Efficiency

- **Parallel Output**: LLM → text display + audio TTS simultaneously.
- **Badges**: Speaker shown in UI with Tier-colored badge (Owner=gold, Gabriel=crimson, Alfred=blue, ADA=green, Agents=grey).
- **Fallbacks**:
  - If audio fails, text renders instantly.
  - If text lags, audio continues from buffered tokens.

---

## 5. Industry-Inspired Guardrails

- **Zoom/Teams**: one live speaker, others muted.
- **Slack/Meet Enterprise**: immutable logs separate from UI.
- **Supervisor Mode**: Gabriel acts as global supervisor with barge-in rights.
- **GDPR/HIPAA**: consent required for multi-human sessions; logs mark consent status.

---

## 6. Stability Guardrails

- ≤5 files per STB; archive superseded versions to `_archive/`.
- All transcripts/artifacts follow dot-schema naming.
- Policy updates must bump version tag (`vYYYY.MM.DD`).
- Assistants enforce this policy at runtime; violations trigger audit alerts.

---

## Notes

- This policy is **authoritative** for all brainstorm/session communications.
- Folder `_archive/` is sanctioned for superseded policies and transcripts.
- Agents inherit guardrails (naming, ≤5 file edits, One-Fence Rule) from invoking Assistants.
