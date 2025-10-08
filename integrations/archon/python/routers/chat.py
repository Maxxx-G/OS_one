from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
import os, json, time, httpx, asyncio

router = APIRouter()
OLLAMA = os.getenv("OLLAMA_OS1_URL","http://host.docker.internal:11434")
MODEL = os.getenv("OLLAMA_MODEL","deepseek-r1:8b")
def _now(): return int(time.time()*1000)

@router.post("/chat")
async def chat_sync(payload: dict):
  msgs = payload.get("messages") or []
  body = {"model": MODEL, "messages": msgs, "stream": False}
  async with httpx.AsyncClient(timeout=60) as cli:
    r = await cli.post(f"{OLLAMA}/api/chat", json=body)
  if r.status_code != 200:
    return JSONResponse({"ok":False,"error":f"ollama_{r.status_code}"}, status_code=502)
  data = r.json()
  text = (data.get("message") or {}).get("content","")
  return {"ok":True,"provider":"ollama","text":text,"id":data.get("id",""),"ts":_now()}

@router.get("/chat/stream")
async def chat_stream(u:str="",system:str=""):
  body = {"model":MODEL,"messages":([{"role":"system","content":system}] if system else []) + [{"role":"user","content":u}],"stream":True}
  async def gen():
    async with httpx.AsyncClient(timeout=None) as cli:
      async with cli.stream("POST",f"{OLLAMA}/api/chat",json=body) as r:
        if r.status_code != 200:
          yield b"event: error\ndata:{\"error\":\"ollama_stream_failed\"}\n\n"
          return
        async for chunk in r.aiter_text():
          for line in chunk.splitlines():
            if not line.strip(): continue
            try: j = json.loads(line)
            except: continue
            if j.get("done"):
              yield b"event: done\ndata:{}\n\n"
              return
            token = ((j.get("message") or {}).get("content") or "")
            if token: yield ("event: token\ndata:"+json.dumps({"t":token})+"\n\n").encode()
  return StreamingResponse(gen(),media_type="text/event-stream")
