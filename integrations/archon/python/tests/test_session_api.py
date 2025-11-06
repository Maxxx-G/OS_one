import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app import app  # noqa: E402
from routers import session as session_router  # noqa: E402
from store.session_store import SessionStore  # noqa: E402


def _configure_store(tmp_path: Path) -> Path:
    path = tmp_path / "session.json"
    os.environ["SESSION_STORE_PATH"] = str(path)
    session_router._STORE = SessionStore(str(path))
    session_router._STATE = session_router.Session(**session_router._STORE.load())
    return path


def test_session_get_default(tmp_path):
    _configure_store(tmp_path)
    client = TestClient(app)

    response = client.get("/v1/session")
    assert response.status_code == 200

    payload = response.json()
    assert payload["mode"] == "Mediated"
    assert payload["agent"] == "OpenAI [ext]"
    assert isinstance(payload["ts"], int)


def test_session_post_and_persist(tmp_path):
    path = _configure_store(tmp_path)
    client = TestClient(app)

    update = {"mode": "Direct", "agent": "Anthropic [ext]"}
    response = client.post("/v1/session", json=update)
    assert response.status_code == 200
    assert response.json()["mode"] == "Direct"
    assert response.json()["agent"] == "Anthropic [ext]"

    follow_up = client.get("/v1/session")
    assert follow_up.status_code == 200
    assert follow_up.json()["mode"] == "Direct"
    assert follow_up.json()["agent"] == "Anthropic [ext]"

    with open(path, "r", encoding="utf-8") as handle:
        persisted = json.load(handle)

    assert persisted == update
