import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app import app  # noqa: E402
from routers import prefs as prefs_router  # noqa: E402
from store.prefs_store import PrefsStore  # noqa: E402


def _configure_store(tmp_path: Path) -> Path:
    path = tmp_path / "prefs.json"
    os.environ["PREFS_STORE_PATH"] = str(path)
    prefs_router._STORE = PrefsStore(str(path))
    prefs_router._STATE = prefs_router._STORE.load()
    return path


def test_prefs_get_default(tmp_path):
    _configure_store(tmp_path)
    client = TestClient(app)

    response = client.get("/v1/prefs")
    assert response.status_code == 200

    payload = response.json()
    assert payload["hints_enabled"] is False
    assert payload["acclimation_start"] is None
    assert isinstance(payload["ts"], int)


def test_prefs_post_and_persist(tmp_path):
    path = _configure_store(tmp_path)
    client = TestClient(app)

    update = {"hints_enabled": True, "acclimation_start": "2025-10-01T00:00:00Z"}
    response = client.post("/v1/prefs", json=update)
    assert response.status_code == 200

    payload = response.json()
    assert payload["hints_enabled"] is True
    assert payload["acclimation_start"] == "2025-10-01T00:00:00Z"

    follow_up = client.get("/v1/prefs")
    assert follow_up.status_code == 200
    persisted = follow_up.json()
    assert persisted["hints_enabled"] is True
    assert persisted["acclimation_start"] == "2025-10-01T00:00:00Z"

    with open(path, "r", encoding="utf-8") as handle:
        saved = json.load(handle)

    # Check that the updated fields were persisted (file may contain additional default fields)
    assert saved["hints_enabled"] == update["hints_enabled"]
    assert saved["acclimation_start"] == update["acclimation_start"]


def test_prefs_reset_acclimation(tmp_path):
    path = _configure_store(tmp_path)
    client = TestClient(app)

    client.post("/v1/prefs", json={"hints_enabled": True, "acclimation_start": "2025-10-01T00:00:00Z"})

    reset = client.post("/v1/prefs", json={"acclimation_start": None})
    assert reset.status_code == 200
    assert reset.json()["acclimation_start"] is None

    with open(path, "r", encoding="utf-8") as handle:
        saved = json.load(handle)

    assert saved["acclimation_start"] is None
