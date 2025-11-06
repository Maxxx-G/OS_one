from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from store.prefs_store import PrefsStore

router = APIRouter(prefix="/v1/overwatch", tags=["overwatch"])

_QPATH = os.getenv("OVERWATCH_QUEUE_PATH", os.path.join(".", "data", "overwatch_queue.jsonl"))


def _ensure_dir(path: str) -> None:
    directory = os.path.dirname(path) or "."
    os.makedirs(directory, exist_ok=True)


def _append(record: Dict[str, Any]) -> None:
    _ensure_dir(_QPATH)
    with open(_QPATH, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def _read_all() -> List[Dict[str, Any]]:
    if not os.path.exists(_QPATH):
        return []
    with open(_QPATH, "r", encoding="utf-8") as handle:
        records: List[Dict[str, Any]] = []
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                records.append(parsed)
        return records


def _tail(max_items: int = 200) -> List[Dict[str, Any]]:
    records = _read_all()
    if max_items <= 0:
        return records
    return records[-max_items:]


def _recalculate_weights() -> Dict[str, float]:
    records = _read_all()
    tasks: Dict[str, int] = {}
    retro_events: List[Dict[str, Any]] = []
    for entry in records:
        entry_id = entry.get("id")
        if entry.get("retro"):
            retro_events.append(entry)
        elif entry.get("status") == "queued" and entry_id:
            ts = entry.get("ts")
            if isinstance(ts, int):
                tasks[entry_id] = ts

    total = 0
    successes = 0
    flakes = 0
    cycle_total = 0
    cycle_count = 0

    for retro_event in retro_events:
        status_raw = str(retro_event.get("status", ""))
        status = status_raw.lower()
        total += 1
        if status == "success":
            successes += 1
        if status in {"flake", "cancelled"}:
            flakes += 1
        task_id = retro_event.get("id")
        if task_id and task_id in tasks:
            retro_ts = retro_event.get("ts")
            if isinstance(retro_ts, int):
                cycle_ms = retro_ts - tasks[task_id]
                if cycle_ms > 0:
                    cycle_total += cycle_ms
                    cycle_count += 1

    success_rate = successes / total if total else 0.0
    flake_rate = flakes / total if total else 0.0
    avg_cycle_ms = cycle_total / cycle_count if cycle_count else 0.0

    weights = {
        "success_rate": round(success_rate, 4),
        "avg_cycle_ms": round(avg_cycle_ms, 2),
        "flake_rate": round(flake_rate, 4),
    }

    store = PrefsStore()
    prefs = store.load()
    prefs["ow_weights"] = weights
    store.save(prefs)
    return weights


class DispatchRequest(BaseModel):
    input: str = Field(..., min_length=1)


@router.post("/dispatch")
def dispatch(req: DispatchRequest):
    ts = int(time.time() * 1000)
    task = {
        "id": f"ow-{ts}",
        "ts": ts,
        "input": req.input.strip(),
        "stbA": "<stub STB-A>",
        "stbB": "<stub STB-B>",
        "status": "queued",
    }
    _append(task)
    return {"ok": True, "task": task}


@router.get("/queue")
def queue():
    return {"ok": True, "items": _tail()}


class PlanRequest(BaseModel):
    plan_md: str = Field(..., min_length=1)


@router.post("/plan")
def plan(req: PlanRequest):
    stub = req.plan_md.strip() or "(empty plan)"
    return {
        "ok": True,
        "stbA": f"<!-- STB-A Draft -->\n{stub}",
        "stbB": "<!-- STB-B Draft Placeholder -->",
    }


class RetroRequest(BaseModel):
    taskId: str = Field(..., min_length=1)
    status: str = Field(..., min_length=1)
    notes: str | None = None


@router.post("/retro")
def retro(req: RetroRequest):
    ts = int(time.time() * 1000)
    retro_record = {
        "id": req.taskId,
        "retro": True,
        "status": req.status,
        "notes": req.notes,
        "ts": ts,
    }
    _append(retro_record)
    weights = _recalculate_weights()
    return {"ok": True, "weights": weights}
