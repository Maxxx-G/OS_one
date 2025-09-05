from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def root():
    return {"service": "archon-api", "status": "ok"}

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/version")
def version():
    return {"service": "archon-api", "version": "0.0.1-dev"}
