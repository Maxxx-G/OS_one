import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from routers import chat as chat_router  # noqa: E402

app = FastAPI()
app.include_router(chat_router.router)


def test_chat_bad_request():
    client = TestClient(app)
    response = client.post("/v1/chat", json={"text": ""})
    assert response.status_code == 400
    assert response.json()["error"] == "bad_request"


def test_chat_stream_bad_request():
    client = TestClient(app)
    response = client.post("/v1/chat/stream", json={"text": ""})
    assert response.status_code == 400
    assert response.json()["error"] == "bad_request"