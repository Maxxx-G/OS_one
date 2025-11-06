import json
import os
from typing import Optional

import requests

ELEVEN = os.getenv("ELEVENLABS_API_KEY")
ELEVEN_VOICE = os.getenv("ELEVENLABS_VOICE_ID", "Rachel")
ELEVEN_URL = "https://api.elevenlabs.io/v1/text-to-speech"


def elevenlabs_tts(text: str) -> bytes:
    text = (text or "").strip()
    if not text:
        raise ValueError("empty_text")
    if not ELEVEN:
        raise RuntimeError("elevenlabs_disabled")
    voice_id = (ELEVEN_VOICE or "Rachel").strip()
    payload = {"text": text, "model_id": "eleven_multilingual_v2"}
    response = requests.post(
        f"{ELEVEN_URL}/{voice_id}",
        headers={
            "xi-api-key": ELEVEN,
            "accept": "audio/mpeg",
            "content-type": "application/json",
        },
        data=json.dumps(payload),
        timeout=60,
    )
    response.raise_for_status()
    return response.content


def whisper_stt(file_bytes: bytes, content_type: Optional[str] = None) -> str:
    if not file_bytes or len(file_bytes) < 2048:
        return ""
    return "(transcribed speech)"
