# AUDIO TTS STREAM

**Endpoint**: POST `/v1/audio/tts/stream`

Streams MP3 audio for a given text prompt. The response is delivered as a chunked `audio/mpeg` stream so the UI can begin playback immediately.

## Request
- Method: POST
- Body: `{ "text": string }`

## Responses
- `200 OK` with `audio/mpeg` chunked body. When `ELEVENLABS_API_KEY` is present, frames are proxied from ElevenLabs using the configured `ELEVENLABS_VOICE_ID` (default `21m00Tcm4TlvDq8ikWAM`).
- If the key is absent, a short dummy sine tone is streamed so clients can exercise the pipeline offline.
- `400 Bad Request` when `text` is missing or empty.
- `502 tts_provider_failed` when the upstream provider rejects the request.

## Observability
The router logs `[voice-stream-start]` and `[voice-stream-end]` lines (with millisecond timestamps) to stdout for lightweight tracing without invoking the audit sink.

## Notes
- This endpoint does not replace `/v1/audio/tts`; both are available.
- The dummy tone matches the existing status probe behaviours and keeps clients from crashing when keys are not provisioned.
- Streaming is performed with `httpx` and FastAPI's `StreamingResponse`; no new dependencies are introduced.
