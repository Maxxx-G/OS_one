from typing import AsyncIterator

import asyncio
import math
import os
import struct
import time

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from store.prefs_store import PrefsStore

router = APIRouter(prefix="/v1/audio", tags=["audio"])

_PREFS_STORE = PrefsStore()
ELEVEN_KEY_ENV = "ELEVENLABS_API_KEY"
ELEVEN_VOICE_ENV = "ELEVENLABS_VOICE_ID"
ELEVEN_DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"


async def _eleven_stream(text: str, api_key: str, voice_id: str) -> AsyncIterator[bytes]:
    # voice_id now passed as parameter instead of fetched from env
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
    headers = {
        "xi-api-key": api_key,
        "accept": "audio/mpeg",
        "content-type": "application/json",
    }
    payload = {"text": text, "optimize_streaming_latency": 2}

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            async with client.stream("POST", url, headers=headers, json=payload) as resp:
                if resp.status_code >= 400:
                    raise HTTPException(
                        status_code=502,
                        detail={"error": "tts_provider_failed", "status": resp.status_code},
                    )
                async for chunk in resp.aiter_bytes():
                    if chunk:
                        yield chunk
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="tts_provider_failed") from exc


def _generate_dummy_wave(duration_s: float = 1.0, sample_rate: int = 16000, freq_hz: float = 440.0) -> bytes:
    samples = int(duration_s * sample_rate)
    pcm = bytearray()
    for idx in range(samples):
        sample = int(32767 * math.sin(2.0 * math.pi * freq_hz * (idx / sample_rate)))
        pcm.extend(struct.pack("<h", sample))

    data_size = len(pcm)
    byte_rate = sample_rate * 2
    block_align = 2
    header = b"RIFF" + struct.pack("<I", 36 + data_size)
    header += b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, byte_rate, block_align, 16)
    header += b"data" + struct.pack("<I", data_size)
    return header + pcm


_DUMMY_WAVE = _generate_dummy_wave()


async def _dummy_stream() -> AsyncIterator[bytes]:
    chunk_size = 2048
    for start in range(0, len(_DUMMY_WAVE), chunk_size):
        await asyncio.sleep(0)
        yield _DUMMY_WAVE[start : start + chunk_size]


@router.post("/tts/stream")
async def tts_stream(body: dict | None = None) -> StreamingResponse:
    payload = body or {}
    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=400, detail="bad_request")
    text = text.strip()

    print("[voice-stream-start]", int(time.time() * 1000), {"len": len(text)})
    api_key = os.getenv(ELEVEN_KEY_ENV, "").strip()
    
    prefs = _PREFS_STORE.load()
    voice_id = prefs.get("tts_voice_id") or os.getenv(ELEVEN_VOICE_ENV, ELEVEN_DEFAULT_VOICE)

    async def generator() -> AsyncIterator[bytes]:
        try:
            if api_key:
                async for chunk in _eleven_stream(text, api_key, voice_id):
                    yield chunk
            else:
                async for chunk in _dummy_stream():
                    yield chunk
        finally:
            print("[voice-stream-end]", int(time.time() * 1000))

    provider = "elevenlabs" if api_key else "dummy"
    headers = {"X-Archon-Audio-Provider": provider}
    return StreamingResponse(generator(), media_type="audio/mpeg", headers=headers)
