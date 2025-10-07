from __future__ import annotations

import time
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from store.prefs_store import PrefsStore, PrefsDict, DEFAULT_WEIGHTS

router = APIRouter(prefix="/v1/prefs", tags=["prefs"])

_STORE = PrefsStore()
_STATE: PrefsDict = _STORE.load()


class OwWeightsPatch(BaseModel):
    success_rate: float
    avg_cycle_ms: float
    flake_rate: float



class Patch(BaseModel):
    hints_enabled: Optional[bool] = None
    acclimation_start: Optional[str] = None
    hint_palette: Optional[str] = None
    mcp_enabled: Optional[List[str]] = None
    ow_weights: Optional[OwWeightsPatch] = None
    tts_voice_id: Optional[str] = None

    class Config:
        extra = "forbid"


_PALETTES = {"normal", "cb_safe"}


def _refresh_state() -> None:
    global _STATE
    _STATE = _STORE.load()


@router.get("")
def get_prefs():
    """Return stored preferences with a current timestamp."""
    _refresh_state()
    return {**_STATE, "ts": int(time.time())}


@router.post("")
def update_prefs(payload: Patch):
    """Persist provided preference values and return the updated state."""
    global _STATE

    updates = payload.model_dump(exclude_unset=True)
    if "hints_enabled" in updates:
        _STATE["hints_enabled"] = bool(updates["hints_enabled"])
    if "acclimation_start" in updates:
        _STATE["acclimation_start"] = updates["acclimation_start"]
    if "hint_palette" in updates:
        palette = updates["hint_palette"]
        _STATE["hint_palette"] = palette if palette in _PALETTES else "normal"
    if "mcp_enabled" in updates:
        mcp_list = updates["mcp_enabled"]
        if isinstance(mcp_list, list) and all(isinstance(item, str) for item in mcp_list):
            _STATE["mcp_enabled"] = mcp_list
    if "ow_weights" in updates:
        weights = updates["ow_weights"].model_dump()
        _STATE["ow_weights"] = {
            "success_rate": float(weights.get("success_rate", DEFAULT_WEIGHTS["success_rate"])),
            "avg_cycle_ms": float(weights.get("avg_cycle_ms", DEFAULT_WEIGHTS["avg_cycle_ms"])),
            "flake_rate": float(weights.get("flake_rate", DEFAULT_WEIGHTS["flake_rate"])),
        }
    if "tts_voice_id" in updates:
        voice = updates["tts_voice_id"]
        if isinstance(voice, str) or voice is None:
            _STATE["tts_voice_id"] = voice

    _STORE.save(_STATE)
    _refresh_state()
    print(
        "[archon][prefs] hints=%s start=%s palette=%s mcp_enabled=%s ow_weights=%s tts_voice_id=%s"
        % (
            _STATE["hints_enabled"],
            _STATE["acclimation_start"],
            _STATE["hint_palette"],
            _STATE["mcp_enabled"],
            _STATE["ow_weights"],
            _STATE["tts_voice_id"],
        )
    )
    return {"ok": True, **_STATE}
