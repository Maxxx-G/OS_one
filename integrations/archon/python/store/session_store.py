from __future__ import annotations

import json
import os
import tempfile
from typing import Literal, TypedDict


class SessionDict(TypedDict):
    mode: Literal["Mediated", "Direct"]
    agent: str


DEFAULT: SessionDict = {"mode": "Mediated", "agent": "OpenAI [ext]"}


class SessionStore:
    """File-backed session storage with atomic writes."""

    def __init__(self, path: str | None = None):
        self.path = path or os.environ.get("SESSION_STORE_PATH", os.path.join(".", "data", "session.json"))
        self._ensure_directory()

    def _ensure_directory(self) -> None:
        directory = os.path.dirname(self.path)
        if not directory:
            directory = "."
        os.makedirs(directory, exist_ok=True)

    def load(self) -> SessionDict:
        try:
            with open(self.path, "r", encoding="utf-8") as handle:
                data = json.load(handle)
        except (FileNotFoundError, json.JSONDecodeError, OSError, TypeError, ValueError):
            return DEFAULT.copy()

        mode = data.get("mode") if isinstance(data, dict) else None
        agent = data.get("agent") if isinstance(data, dict) else None

        if mode not in ("Mediated", "Direct"):
            mode = DEFAULT["mode"]
        if not isinstance(agent, str) or not agent:
            agent = DEFAULT["agent"]

        return {"mode": mode, "agent": agent}

    def save(self, session: SessionDict) -> None:
        directory = os.path.dirname(self.path)
        if not directory:
            directory = "."
        tmp_fd, tmp_path = tempfile.mkstemp(prefix="session.", suffix=".json", dir=directory)
        try:
            with os.fdopen(tmp_fd, "w", encoding="utf-8") as handle:
                json.dump(session, handle)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_path, self.path)
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
