import io
import logging
import os
import time
import json
import asyncio
from datetime import datetime

import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.routing import APIRoute

from routers import session as session_router
from routers import prefs as prefs_router
from routers import audit as audit_router
from routers import audio as audio_router
from routers import audio_stream as audio_stream_router
from routers import audio_voices as audio_voices_router
from routers import overwatch as overwatch_router
from routers import executors as executors_router
from routers import chat as chat_router
from voice_providers import elevenlabs_tts, whisper_stt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _override_audio_routes() -> None:
    async def transcribe(file: UploadFile = File(...)):
        payload = await file.read()
        text = whisper_stt(payload, getattr(file, "content_type", "") or "")
        return {"text": text}

    async def text_to_speech(payload: audio_router.TtsRequest):
        try:
            audio_bytes = elevenlabs_tts(payload.text)
        except ValueError:
            return JSONResponse({"ok": False, "error": "empty_text"}, status_code=400)
        except RuntimeError as exc:
            if str(exc) == "elevenlabs_disabled":
                return JSONResponse({"ok": False, "error": "elevenlabs_key_missing"}, status_code=412)
            raise
        except requests.HTTPError as exc:
            return JSONResponse(
                {"ok": False, "error": "elevenlabs_failed", "status": exc.response.status_code},
                status_code=502,
            )
        except requests.RequestException:
            return JSONResponse({"ok": False, "error": "elevenlabs_unreachable"}, status_code=502)

        headers = {"Content-Disposition": "inline; filename=archon-tts.mp3"}
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg", headers=headers)

    routes = list(audio_router.router.routes)
    for route in routes:
        if (
            isinstance(route, APIRoute)
            and route.path in {"/v1/audio/transcribe", "/v1/audio/tts"}
            and "POST" in route.methods
        ):
            audio_router.router.routes.remove(route)

    audio_router.router.add_api_route("/transcribe", transcribe, methods=["POST"])
    audio_router.router.add_api_route("/tts", text_to_speech, methods=["POST"])


_override_audio_routes()

app = FastAPI(
    title="Archon API",
    description="OS One Archon Integration Service",
    version="1.0.0",
)

app.include_router(session_router.router)
app.include_router(prefs_router.router)
app.include_router(audit_router.router)
app.include_router(audio_router.router)
app.include_router(audio_stream_router.router)
app.include_router(audio_voices_router.router)
app.include_router(overwatch_router.router)
app.include_router(executors_router.router)
app.include_router(chat_router.router, prefix="/v1")


@app.get("/")
async def root():
    return {
        "service": "Archon API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "archon-api",
        "timestamp": datetime.now().isoformat(),
        "env_vars": {
            "ELEVENLABS_API_KEY": "present" if os.getenv("ELEVENLABS_API_KEY") else "missing"
        },
    }


@app.get("/v1/audio/status")
async def audio_status():
    env_key = os.getenv("ELEVENLABS_API_KEY")
    has_key = bool(env_key and env_key.strip())
    return {
        "provider": "elevenlabs",
        "tts_key": has_key,
        "tts_enabled": has_key,
    }


@app.get("/v1/audio/events")
async def audio_events():
    """
    SSE endpoint for live audio status telemetry.
    Emits periodic status beats without external calls.
    """
    async def gen():
        seq = 0
        # Initial hello event
        yield b"event: hello\ndata: {}\n\n"
        
        # Periodic status beats every ~2s
        while True:
            try:
                tts_enabled = bool(os.getenv("ELEVENLABS_API_KEY", "").strip())
                status_data = {
                    "ts": int(time.time() * 1000),
                    "seq": seq,
                    "status": {
                        "tts_enabled": tts_enabled,
                        "stt_enabled": True
                    }
                }
                payload = "event: status\ndata: " + json.dumps(status_data) + "\n\n"
                yield payload.encode("utf-8")
                seq += 1
                await asyncio.sleep(2.0)
            except asyncio.CancelledError:
                break
    
    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/env")
async def get_env():
    return {
        "ELEVENLABS_API_KEY": "present" if os.getenv("ELEVENLABS_API_KEY") else "missing",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7700)


