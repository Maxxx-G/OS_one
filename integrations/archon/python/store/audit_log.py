from __future__ import annotations

import json
import os
import time
from collections import deque
from typing import Any, Dict, List


class AuditLog:
    """Append-only JSONL audit log with size-based rotation."""

    def __init__(self, path: str | None = None, max_mb: float | None = None, keep: int = 5):
        default_path = os.environ.get("AUDIT_LOG_PATH", os.path.join(".", "data", "audit.jsonl"))
        self.path = path or default_path
        self.max_bytes = self._resolve_max_bytes(max_mb)
        self.keep = self._resolve_keep(keep)
        self._ensure_directory()

    def _resolve_max_bytes(self, max_mb: float | None) -> int:
        target_mb = 10.0 if max_mb is None else float(max_mb)
        env_value = os.environ.get("AUDIT_MAX_MB")
        if env_value is not None:
            try:
                target_mb = float(env_value)
            except ValueError:
                pass
        max_bytes = int(target_mb * 1024 * 1024)
        return max(1, max_bytes)

    def _resolve_keep(self, keep: int) -> int:
        target_keep = keep
        env_value = os.environ.get("AUDIT_KEEP")
        if env_value is not None:
            try:
                target_keep = int(env_value)
            except ValueError:
                pass
        return max(1, target_keep)

    def _ensure_directory(self) -> None:
        directory = os.path.dirname(self.path) or "."
        os.makedirs(directory, exist_ok=True)

    def _rotate_if_needed(self) -> None:
        try:
            if not os.path.exists(self.path):
                return
            if os.path.getsize(self.path) <= self.max_bytes:
                return

            base = self.path
            oldest = f"{base}.{self.keep}"
            if os.path.exists(oldest):
                try:
                    os.remove(oldest)
                except OSError:
                    pass

            for index in range(self.keep - 1, 0, -1):
                src = f"{base}.{index}"
                dst = f"{base}.{index + 1}"
                if os.path.exists(src):
                    try:
                        os.replace(src, dst)
                    except OSError:
                        pass

            os.replace(base, f"{base}.1")
        except OSError:
            pass

    def append(self, event: str, payload: Dict[str, Any] | None = None) -> None:
        self._rotate_if_needed()

        record = {"ts": int(time.time() * 1000), "event": event, "payload": payload or {}}
        data = json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n"

        flags = os.O_APPEND | os.O_CREAT | os.O_WRONLY
        if hasattr(os, "O_BINARY"):
            flags |= os.O_BINARY

        fd = os.open(self.path, flags, 0o666)
        try:
            os.write(fd, data.encode("utf-8"))
            os.fsync(fd)
        finally:
            os.close(fd)

    def tail(self, limit: int = 100) -> List[Dict[str, Any]]:
        if limit <= 0:
            return []

        try:
            with open(self.path, "r", encoding="utf-8") as handle:
                lines = deque(maxlen=limit)
                for raw in handle:
                    raw = raw.strip()
                    if raw:
                        lines.append(raw)
        except FileNotFoundError:
            return []

        events: List[Dict[str, Any]] = []
        for raw in lines:
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                events.append(parsed)

        return events

    def info(self) -> Dict[str, Any]:
        details: Dict[str, Any] = {"path": self.path, "bytes": 0, "keep": self.keep, "rotated": []}

        try:
            if os.path.exists(self.path):
                details["bytes"] = os.path.getsize(self.path)
        except OSError:
            pass

        rotated: List[Dict[str, Any]] = []
        for index in range(1, self.keep + 1):
            candidate = f"{self.path}.{index}"
            try:
                if os.path.exists(candidate):
                    rotated.append({"path": candidate, "bytes": os.path.getsize(candidate)})
            except OSError:
                continue
        details["rotated"] = rotated
        return details
