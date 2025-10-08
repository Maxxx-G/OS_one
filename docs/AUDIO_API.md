# Audio API

POST `/v1/audio/transcribe` (multipart form `file`) -> `{ ok, text, lang?, ts }`
POST `/v1/audio/tts` JSON `{ text, voice_id? }` -> `audio/mpeg` (requires ELEVENLABS_API_KEY)
Env: `WHISPER_MODEL` (default `tiny`), `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (default `Rachel`)
