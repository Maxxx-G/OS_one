# AUDIO EVENTS (SSE)

GET `/v1/audio/events` → `text/event-stream`

Emitted events:

- `event: hello` — one-time greeting (empty `{}` payload)
- `event: status` — every ~2s with JSON:
  ```json
  {
    "ts": 1730800000000,
    "seq": 12,
    "status": { "tts_enabled": false, "stt_enabled": true }
  }
  ```

Notes:

- Offline-safe, no outbound provider calls.
- `tts_enabled` reflects ELEVENLABS key presence only.
- UI can drive a HUD/waveform from the heartbeat cadence.
