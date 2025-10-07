from __future__ import annotations

import logging
import os
from typing import Any

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

logger = logging.getLogger("archon.audio_voices")

router = APIRouter(prefix="/v1/audio", tags=["audio"])

_VOICES_TIMEOUT = httpx.Timeout(5.0, connect=2.0)


@router.get("/voices")
async def list_voices():
    """
    List available TTS voices from ElevenLabs.
    Returns deterministic offline stub when API key is missing.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    
    # Offline stub when key missing
    if not api_key:
        return {
            "ok": True,
            "provider": "elevenlabs",
            "tts_enabled": False,
            "voices": [],
        }
    
    # Fetch voices from ElevenLabs
    try:
        async with httpx.AsyncClient(timeout=_VOICES_TIMEOUT) as client:
            response = await client.get(
                "https://api.elevenlabs.io/v1/voices",
                headers={"xi-api-key": api_key},
            )
            response.raise_for_status()
            data = response.json()
            
            # Map to {id, name} format
            voices = [
                {"id": v.get("voice_id", ""), "name": v.get("name", "Unknown")}
                for v in data.get("voices", [])
                if v.get("voice_id")
            ]
            
            return {
                "ok": True,
                "provider": "elevenlabs",
                "tts_enabled": True,
                "voices": voices,
            }
    
    except httpx.TimeoutException:
        logger.warning("ElevenLabs voices fetch timed out after 5s")
        return JSONResponse(
            {"ok": False, "error": "provider_unavailable"},
            status_code=200,
        )
    
    except httpx.HTTPStatusError as exc:
        logger.warning("ElevenLabs voices fetch failed: HTTP %s", exc.response.status_code)
        return JSONResponse(
            {"ok": False, "error": "provider_unavailable"},
            status_code=200,
        )
    
    except Exception as exc:
        logger.exception("Unexpected error fetching voices: %s", exc)
        return JSONResponse(
            {"ok": False, "error": "provider_unavailable"},
            status_code=200,
        )
