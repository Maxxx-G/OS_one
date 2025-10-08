from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="mcp-web")


class InvokeReq(BaseModel):
    action: str
    url: str | None = None


@app.get("/healthz")
def health() -> dict[str, object]:
    return {"ok": True, "service": "mcp-web"}


@app.post("/invoke")
def invoke(req: InvokeReq) -> dict[str, object]:
    return {
        "ok": True,
        "service": "mcp-web",
        "action": req.action,
        "url": req.url,
    }
