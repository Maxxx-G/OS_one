from __future__ import annotations

import json
import os
import tempfile
from typing import Dict, List, Literal, TypedDict

HintPalette = Literal["normal", "cb_safe"]


class OwWeights(TypedDict):
    success_rate: float
    avg_cycle_ms: float
    flake_rate: float


class PrefsDict(TypedDict):
    hints_enabled: bool
    acclimation_start: str | None
    hint_palette: HintPalette
    mcp_enabled: List[str]
    ow_weights: OwWeights
    tts_voice_id: str | None


DEFAULT_WEIGHTS: OwWeights = {
    "success_rate": 0.0,
    "avg_cycle_ms": 0.0,
    "flake_rate": 0.0,
}

DEFAULT: PrefsDict = {
    "hints_enabled": False,
    "acclimation_start": None,
    "hint_palette": "normal",
    "mcp_enabled": [],
    "ow_weights": DEFAULT_WEIGHTS.copy(),
    "tts_voice_id": None,
}

_VALID_PALETTES = {"normal", "cb_safe"}


class PrefsStore:
    """File-backed preferences storage with atomic writes."""

    def __init__(self, path: str | None = None):
        self.path = path or os.environ.get("PREFS_STORE_PATH", os.path.join(".", "data", "prefs.json"))
        self._ensure_directory()

    def _ensure_directory(self) -> None:
        directory = os.path.dirname(self.path)
        if not directory:
            directory = "."
        os.makedirs(directory, exist_ok=True)

    def _sanitize_weights(self, raw: Dict[str, object] | None) -> OwWeights:
        if not isinstance(raw, dict):
            return DEFAULT_WEIGHTS.copy()
        success_raw = raw.get("success_rate")
        avg_raw = raw.get("avg_cycle_ms")
        flake_raw = raw.get("flake_rate")
        success = float(success_raw) if isinstance(success_raw, (int, float)) else DEFAULT_WEIGHTS["success_rate"]
        avg = float(avg_raw) if isinstance(avg_raw, (int, float)) else DEFAULT_WEIGHTS["avg_cycle_ms"]
        flake = float(flake_raw) if isinstance(flake_raw, (int, float)) else DEFAULT_WEIGHTS["flake_rate"]
        return {
            "success_rate": success,
            "avg_cycle_ms": avg,
            "flake_rate": flake,
        }

    def _sanitize(self, raw: Dict[str, object]) -> PrefsDict:
        hints_raw = raw.get("hints_enabled")
        hints = hints_raw if isinstance(hints_raw, bool) else DEFAULT["hints_enabled"]

        start_raw = raw.get("acclimation_start")
        if start_raw is None:
            start = None
        elif isinstance(start_raw, str):
            start = start_raw
        else:
            start = DEFAULT["acclimation_start"]

        palette_raw = raw.get("hint_palette")
        if isinstance(palette_raw, str) and palette_raw in _VALID_PALETTES:
            palette = palette_raw
        else:
            palette = DEFAULT["hint_palette"]

        mcp_raw = raw.get("mcp_enabled")
        if isinstance(mcp_raw, list) and all(isinstance(item, str) for item in mcp_raw):
            mcp_enabled = mcp_raw
        else:
            mcp_enabled = DEFAULT["mcp_enabled"]

        weights = self._sanitize_weights(raw.get("ow_weights"))
        
        tts_voice_raw = raw.get("tts_voice_id")
        if isinstance(tts_voice_raw, str) or tts_voice_raw is None:
            tts_voice_id = tts_voice_raw
        else:
            tts_voice_id = DEFAULT["tts_voice_id"]

        return {
            "hints_enabled": hints,
            "acclimation_start": start,
            "hint_palette": palette,
            "mcp_enabled": mcp_enabled,
            "ow_weights": weights,
            "tts_voice_id": tts_voice_id,
        }

    def load(self) -> PrefsDict:
        try:
            with open(self.path, "r", encoding="utf-8") as handle:
                raw = json.load(handle)
        except (FileNotFoundError, json.JSONDecodeError, OSError, TypeError, ValueError):
            return self._sanitize(DEFAULT.copy())

        if not isinstance(raw, dict):
            return self._sanitize(DEFAULT.copy())

        return self._sanitize(raw)

    def save(self, prefs: PrefsDict) -> None:
        directory = os.path.dirname(self.path)
        if not directory:
            directory = "."
        tmp_fd, tmp_path = tempfile.mkstemp(prefix="prefs.", suffix=".json", dir=directory)
        sanitized = self._sanitize(dict(prefs))
        try:
            with os.fdopen(tmp_fd, "w", encoding="utf-8") as handle:
                json.dump(sanitized, handle)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_path, self.path)
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
