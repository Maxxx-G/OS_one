from __future__ import annotations

import importlib.util
import io
import logging
import os
import time
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from store.prefs_store import PrefsStore

logger = logging.getLogger("archon.audio")

router = APIRouter(prefix="/v1/audio", tags=["audio"])

_PREFS_STORE = PrefsStore()
_WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
_WHISPER_MODEL: Optional["WhisperModel"] = None
_TTS_TIMEOUT = httpx.Timeout(60.0, connect=10.0)
_MULTIPART_AVAILABLE = importlib.util.find_spec("multipart") is not None

if _MULTIPART_AVAILABLE:
    from fastapi import File, UploadFile


@router.get("/status")
async def audio_status():
    """
    Return the current audio service status, including TTS and STT availability.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    tts_enabled = bool(api_key)
    
    prefs = _PREFS_STORE.load()
    voice_id = prefs.get("tts_voice_id") or os.getenv("ELEVENLABS_VOICE_ID", "Rachel")
    
    return {
        "ok": True,
        "tts_enabled": tts_enabled,
        "stt_enabled": _MULTIPART_AVAILABLE,
        "voice_id": voice_id,
        "ts": int(time.time() * 1000),
    }


def _load_whisper_model():
    global _WHISPER_MODEL
    if _WHISPER_MODEL is not None:
        return _WHISPER_MODEL

    try:
        from faster_whisper import WhisperModel  # type: ignore import-not-found
    except ModuleNotFoundError as exc:
        raise HTTPException(status_code=503, detail="whisper-unavailable") from exc
    except Exception as exc:  # pragma: no cover - defensive path
        logger.exception("Unexpected error importing faster_whisper: %s", exc)
        raise HTTPException(status_code=500, detail="whisper-import-failed") from exc

    try:
        _WHISPER_MODEL = WhisperModel(
            _WHISPER_MODEL_NAME,
            device=os.getenv("WHISPER_DEVICE", "cpu"),
            compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
        )
    except Exception as exc:  # pragma: no cover - diagnostics only
        logger.exception("Failed to load Whisper model '%s': %s", _WHISPER_MODEL_NAME, exc)
        raise HTTPException(status_code=500, detail="whisper-load-failed") from exc

    return _WHISPER_MODEL


if _MULTIPART_AVAILABLE:

    @router.post("/transcribe")
    async def transcribe(file: UploadFile = File(...)):
        payload = await file.read()
        if not payload:
            return JSONResponse({"ok": False, "error": "empty_file"}, status_code=400)

        try:
            model = _load_whisper_model()
            segments, info = model.transcribe(io.BytesIO(payload))
        except HTTPException:
            raise
        except Exception as exc:  # pragma: no cover - diagnostics only
            logger.exception("Transcription failed: %s", exc)
            raise HTTPException(status_code=500, detail="transcription-failed") from exc

        text = "".join(segment.text for segment in segments if getattr(segment, "text", None))
        language = getattr(info, "language", None)

        return {
            "ok": True,
            "text": text.strip(),
            "lang": language,
            "ts": int(time.time() * 1000),
        }

else:

    @router.post("/transcribe")
    async def transcribe():
        raise HTTPException(status_code=503, detail="multipart-not-installed")


class TtsRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None


@router.post("/tts")
async def text_to_speech(payload: TtsRequest):
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        return JSONResponse({"ok": False, "error": "elevenlabs_key_missing"}, status_code=412)

    text = (payload.text or "").strip()
    if not text:
        return JSONResponse({"ok": False, "error": "empty_text"}, status_code=400)

    prefs = _PREFS_STORE.load()
    voice_id = (payload.voice_id or prefs.get("tts_voice_id") or os.getenv("ELEVENLABS_VOICE_ID", "Rachel")).strip()
    if not voice_id:
        return JSONResponse({"ok": False, "error": "voice_id_missing"}, status_code=400)

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=_TTS_TIMEOUT) as client:
            response = await client.post(url, headers=headers, json={"text": text})
            response.raise_for_status()
    except httpx.TimeoutException:
        return JSONResponse({"ok": False, "error": "elevenlabs_timeout"}, status_code=504)
    except httpx.HTTPStatusError as exc:
        return JSONResponse(
            {
                "ok": False,
                "error": "elevenlabs_failed",
                "status": exc.response.status_code,
            },
            status_code=502,
        )
    except httpx.HTTPError:
        return JSONResponse({"ok": False, "error": "elevenlabs_unreachable"}, status_code=502)

    if not response.content:
        return JSONResponse({"ok": False, "error": "elevenlabs_empty"}, status_code=502)

    headers = {"Content-Disposition": "inline; filename=archon-tts.mp3"}
    return StreamingResponse(io.BytesIO(response.content), media_type="audio/mpeg", headers=headers)
