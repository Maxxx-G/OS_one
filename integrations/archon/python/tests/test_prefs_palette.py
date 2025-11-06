import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app import app  # noqa: E402
from routers import prefs as prefs_router  # noqa: E402
from store.prefs_store import PrefsStore  # noqa: E402


def _configure_store(tmp_path: Path, monkeypatch) -> None:
    path = tmp_path / "prefs.json"
    monkeypatch.setenv("PREFS_STORE_PATH", str(path))
    prefs_router._STORE = PrefsStore(str(path))
    prefs_router._STATE = prefs_router._STORE.load()


def test_hint_palette_roundtrip(tmp_path, monkeypatch):
    _configure_store(tmp_path, monkeypatch)
    client = TestClient(app)

    first = client.get("/v1/prefs")
    assert first.status_code == 200
    assert first.json()["hint_palette"] == "normal"

    update = client.post("/v1/prefs", json={"hint_palette": "cb_safe"})
    assert update.status_code == 200
    assert update.json()["hint_palette"] == "cb_safe"

    invalid = client.post("/v1/prefs", json={"hint_palette": "invalid_value"})
    assert invalid.status_code == 200
    assert invalid.json()["hint_palette"] == "normal"

    final = client.get("/v1/prefs")
    assert final.json()["hint_palette"] == "normal"
