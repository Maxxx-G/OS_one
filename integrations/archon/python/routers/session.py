from typing import Literal, Optional
import time

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/v1/session", tags=["session"])


class Session(BaseModel):
    mode: Literal["Mediated", "Direct"] = "Mediated"
    agent: str = "OpenAI [ext]"


STATE = Session()


@router.get("")
def get_session():
    """Return the current session state with a unix timestamp."""
    return {"mode": STATE.mode, "agent": STATE.agent, "ts": int(time.time())}


class Patch(BaseModel):
    mode: Optional[Literal["Mediated", "Direct"]] = None
    agent: Optional[str] = None


@router.post("")
def update_session(payload: Patch):
    if payload.mode is not None:
        STATE.mode = payload.mode
    if payload.agent is not None:
        STATE.agent = payload.agent
    print(f"[archon][session] mode={STATE.mode} agent={STATE.agent}")
    return {"ok": True, "mode": STATE.mode, "agent": STATE.agent}
