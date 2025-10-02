from typing import Literal, Optional
import time

from fastapi import APIRouter
from pydantic import BaseModel

from store.session_store import SessionStore

router = APIRouter(prefix="/v1/session", tags=["session"])


class Session(BaseModel):
    mode: Literal["Mediated", "Direct"] = "Mediated"
    agent: str = "OpenAI [ext]"


_STORE = SessionStore()
_STATE = Session(**_STORE.load())


@router.get("")
def get_session():
    """Return the current session state with a unix timestamp."""
    return {"mode": _STATE.mode, "agent": _STATE.agent, "ts": int(time.time())}


class Patch(BaseModel):
    mode: Optional[Literal["Mediated", "Direct"]] = None
    agent: Optional[str] = None


@router.post("")
def update_session(payload: Patch):
    if payload.mode is not None:
        _STATE.mode = payload.mode
    if payload.agent is not None:
        _STATE.agent = payload.agent
    _STORE.save({"mode": _STATE.mode, "agent": _STATE.agent})
    print(f"[archon][session] mode={_STATE.mode} agent={_STATE.agent}")
    return {"ok": True, "mode": _STATE.mode, "agent": _STATE.agent}
