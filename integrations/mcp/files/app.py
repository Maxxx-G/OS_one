from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="mcp-files")


class InvokeReq(BaseModel):
    action: str
    path: str | None = None


@app.get("/healthz")
def health() -> dict[str, object]:
    return {"ok": True, "service": "mcp-files"}


@app.post("/invoke")
def invoke(req: InvokeReq) -> dict[str, object]:
    return {
        "ok": True,
        "service": "mcp-files",
        "action": req.action,
        "path": req.path,
    }
