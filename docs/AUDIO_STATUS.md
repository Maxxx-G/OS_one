# AUDIO STATUS

GET `/v1/audio/status` -> `200 OK`

Response:
- `ok`: boolean (always `true`)
- `tts_enabled`: boolean indicating whether `ELEVENLABS_API_KEY` is present
- `stt_enabled`: boolean indicating whether Speech-to-Text (faster-whisper multipart) is available
- `voice_id`: string containing the active voice ID for TTS (from prefs → env var → default "Rachel")
- `ts`: integer timestamp in milliseconds

Voice ID Precedence:
1. User preference (`tts_voice_id` from `/v1/prefs`)
2. Environment variable (`ELEVENLABS_VOICE_ID`)
3. Default fallback (`"Rachel"`)

Examples:
- No key, no prefs: 
  ```json
  {
    "ok": true,
    "tts_enabled": false,
    "stt_enabled": true,
    "voice_id": "Rachel",
    "ts": 1234567890
  }
  ```

- With key and custom voice in prefs:
  ```json
  {
    "ok": true,
    "tts_enabled": true,
    "stt_enabled": true,
    "voice_id": "custom-voice-id",
    "ts": 1234567890
  }
  ```

Notes:
- This endpoint has no side effects and is safe for offline checks.
- UI can treat `tts_enabled:false` as muted without attempting playback.
- The `voice_id` field reflects the voice that will be used for TTS requests (unless overridden per-request).
- To change the default voice, update user preferences via `POST /v1/prefs` with `{"tts_voice_id": "new-voice-id"}`.
