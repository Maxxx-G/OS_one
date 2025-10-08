from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/v1/executors", tags=["executors"])

_JPATH = os.getenv("EXEC_JOBS_PATH", os.path.join(".", "data", "exec_jobs.jsonl"))


def _ensure_dir(path: str) -> None:
    directory = os.path.dirname(path) or "."
    os.makedirs(directory, exist_ok=True)


def _append(path: str, record: Dict[str, Any]) -> None:
    _ensure_dir(path)
    with open(path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def _tail(path: str, count: int = 200) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as handle:
        lines = handle.readlines()[-count:]
    items: List[Dict[str, Any]] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict):
            items.append(parsed)
    return items


class DispatchRequest(BaseModel):
    taskId: str = Field(..., min_length=1)
    runner: str = Field(..., min_length=1)
    mode: str = Field("apply", min_length=1)


@router.post("/dispatch")
def dispatch(req: DispatchRequest):
    ts = int(time.time() * 1000)
    job_id = f"job-{ts}"
    log_lines = [
        f"begin {req.runner}:{req.mode}",
        "apply STB-A (simulated)",
        "run acceptance (simulated)",
        "result: ok",
    ]
    job = {
        "id": job_id,
        "ts": ts,
        "taskId": req.taskId,
        "runner": req.runner,
        "mode": req.mode,
        "status": "ok",
        "logs": log_lines,
    }
    _append(_JPATH, job)
    return {"ok": True, "jobId": job_id}


@router.get("/logs")
def logs(jobId: str | None = None, tail: int = 50):
    items = _tail(_JPATH, max(tail, 1) + 50)
    if jobId:
        for entry in reversed(items):
            if entry.get("id") == jobId:
                return {"ok": True, "job": entry}
        raise HTTPException(status_code=404, detail="job_not_found")
    return {"ok": True, "items": items[-tail:]}
