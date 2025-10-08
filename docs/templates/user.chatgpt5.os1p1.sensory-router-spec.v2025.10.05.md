# OS One — Sensory Router Spec (v2025.10.05)

## Purpose
Specify the **Sensory Router** that coordinates multi-modal streams (voice, vision, text) with **preemptive control**, respecting the Speech Control Hierarchy and Async/Sync Policy.

## Responsibilities
- Prioritize/control streams using **Respect Tiers** (Owner/Gabriel/Assistants/Agents).
- Dispatch **STOP/YIELD/MUTE** instantly (T0).
- Orchestrate **parallel text + audio** output for Assistants (token→TTS while rendering text).
- Apply **final-response slot** rule for Agents after tasks.
- Log all events to an **append-only outbox** for replay/audit.

## Ingress Adapters
- **Mic/STT** (Whisper): VAD, partial transcripts → `TEXT_TOKEN`.
- **Camera** (vision): frames/snapshots → `FRAME`.
- **UI/Text**: user/assistant input → `TEXT_TOKEN` / control commands.
- **Artifacts**: files/images → artifact events with hashes.

## Event Bus
- Lock-free queues with **priority classes**: T0 > T1 > T2 > T3.
- Messages carry: `session_id`, `actor_id`, `tier`, `task_id`, `seq`, `timestamp`, `kind`, `payload`.

## Schedulers
- **Global Preemptive Controller**: enforces tiers & floor; executes STOP/YIELD/MUTE.
- **Per-Modality Executors**: STT, TTS, Vision, Text each run async with backpressure.
- **Handover Barrier**: ensures single active speaker; coordinates floor switching.

## Control Path (Sync)
- `/control/interrupt` → emit `INTERRUPT_STOP` → halt TTS/UI immediately.
- `/control/floor` → grant/revoke speaking floor according to tiers.
- All control emits are **durable** (transaction logged before effect).

## Content Path (Async)
- LLM tokens → UI render + TTS feed in parallel.
- Vision frames throttled/coalesced under load (token-bucket).
- Cancellable streams: on STOP, executors flush buffers and mark `CANCELLED_BY=<actor,reason>`.

## Recording & Outbox
- Default ON: transcript (json), audio in/out (wav), artifacts with hashes.
- Dot-schema filenames under `docs/recordings/`:  
  `session.brainstorm.vYYYY.MM.DD.json` / `.wav`
- Outbox is append-only; includes interrupt metadata (who/when/why).

## Interfaces (Sketch)
- **Events**
    - Control: `INTERRUPT_STOP|YIELD|MUTE|FLOOR_GRANT`
    - Content: `TEXT_TOKEN|AUDIO_CHUNK|FRAME|LLM_PARTIAL`
    - Commit: `SESSION_START|CONSENT_SET|RECORD_ON|RECORD_OFF`
    - Telemetry: `TRACE|METRIC`
- **APIs**
    - POST `/control/interrupt` `{ actor_id, target_id, reason }`
    - POST `/control/floor` `{ grant_to, channel, ttl_ms }`
    - POST `/recorder/toggle` `{ on: boolean, mode: 'private|temp|public' }`
    - WS `/stream` (bi-di): token/audio/frame multiplex with backpressure

## Enforcement of Speech Hierarchy
- Tier table loaded from policy; cached in Router.
- Gabriel has **global override**; can preempt any stream including Owner in critical contexts.
- Agents never cut Assistants; Assistants can cut Agents.
- After task issuance, Agents guaranteed **one final response slot**.

## Observability
- Per-session tracing (ingress → router → executor → egress).
- SLO alarms: T0 >100 ms; T1 >300 ms; failed preemption.
- Audit: every interrupt logged with hashes for integrity.

## Guardrails
- Honors filenaming & One-Fence Rule for all emitted artifacts.
- All messages carry **idempotency keys**: `session_id:task_id:seq`.
- Policy changes bump version `vYYYY.MM.DD`.

## References
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Speech Control: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Filenaming: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
