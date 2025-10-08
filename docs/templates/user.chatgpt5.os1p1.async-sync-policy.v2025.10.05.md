# OS One — Async vs Sync Policy (v2025.10.05)

## Purpose
Define when OS One uses **synchronous** vs **asynchronous** processing, ensuring low-latency control, smooth UX, and reliable auditability across chat, voice, and perception.

## Principles
- **Async by default, sync at boundaries.**
- **Control outranks content** (interrupts > replies).
- **Streams for perception**, **transactions for intent**.

## Latency Tiers (Targets)
- **T0: Critical control (≤100 ms)** — STOP, YIELD, MUTE, floor-change, alarms.
- **T1: Live UX (≤300 ms)** — token→TTS, mic VAD, badge/status updates.
- **T2: Cognitive (≤2 s)** — LLM turns, RAG retrieval, captions.
- **T3: Background (≥2 s)** — indexing, summaries, exports, uploads.

## Use Sync When…
- User-compliance or gating actions: **start/stop recording**, **consent change**, **floor grant**, **enable/disable Direct-Agent**, **commit/rollback**.
- **Ordered state sequences** (e.g., STOP → flush TTS → switch speaker).
- **Security** transitions and unlocks.

## Use Async When…
- **Perception streams**: STT, TTS, camera frames/snapshots.
- **Multi-agent fan-out + aggregation** (parallel requests).
- **Telemetry**: traces, metrics, non-critical logs.
- **Enrichment**: embeddings, summarization, diarization.

## Message Classes
- **Control**: `INTERRUPT_STOP`, `YIELD`, `MUTE`, `FLOOR_GRANT` (T0, sync path).
- **Content**: `TEXT_TOKEN`, `AUDIO_CHUNK`, `FRAME`, `LLM_PARTIAL` (async, cancellable).
- **Telemetry**: metrics/trace (async, lossy ok).
- **Commit**: `SESSION_START`, `CONSENT_SET`, `RECORD_ON|OFF` (sync + durable).

## Consistency Model
- **Strong** for control/commit routes; **eventual** for logs/analytics.
- **Idempotency keys**: `session_id:task_id:seq` on all messages.
- **Sagas** for multi-step ops (e.g., start recording → create files → header write → UI ack).

## Decision Matrix
- STOP/ALARM/SECURITY → **Sync** (T0)
- Start/Stop recording → **Sync**
- Live LLM reply read-aloud → **Async tokens** + **Sync on STOP**
- Vision snapshots → **Async**
- Exports/shares → **Async**
- Enable Direct-Agent → **Sync** (gated + audited)

## Guardrails
- Enforce **≤5 files per STB** (policy).
- All artifacts obey dot-schema names.
- Any policy change bumps version `vYYYY.MM.DD`.
- Complies with **One-Fence Rule** for STB delivery.

## References
- Speech Control: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Filenaming: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
