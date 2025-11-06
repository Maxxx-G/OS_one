from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, conlist

from store.audit_log import AuditLog

router = APIRouter(prefix="/v1/audit", tags=["audit"])

_LOG = AuditLog()


class AuditReq(BaseModel):
    event: str
    payload: Optional[Dict[str, Any]] = None

    class Config:
        extra = "forbid"


class AuditBulk(BaseModel):
    items: conlist(AuditReq, min_length=1, max_length=500)

    class Config:
        extra = "forbid"


@router.post("")
def audit_post(req: AuditReq):
    """Append a new audit event to the JSONL log."""

    _LOG.append(req.event, req.payload or {})
    return {"ok": True}


@router.post("/bulk")
def audit_bulk(req: AuditBulk):
    """Append multiple audit events to the JSONL log."""

    for item in req.items:
        _LOG.append(item.event, item.payload or {})
    return {"ok": True, "count": len(req.items)}


@router.get("/tail")
def audit_tail(limit: int = Query(100, ge=1, le=1000)):
    """Return the most recent audit events up to the requested limit."""

    return {"items": _LOG.tail(limit)}


@router.get("/info")
def audit_info():
    """Return rotation metadata and file sizes for the audit log."""

    return _LOG.info()
