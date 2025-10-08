import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app import app  # noqa: E402
from routers import audit as audit_router  # noqa: E402
from store.audit_log import AuditLog  # noqa: E402


def _configure(tmp_path: Path, monkeypatch, max_mb: str = "0.0005", keep: str = "3") -> Path:
    path = tmp_path / "audit.jsonl"
    monkeypatch.setenv("AUDIT_LOG_PATH", str(path))
    monkeypatch.setenv("AUDIT_MAX_MB", max_mb)
    monkeypatch.setenv("AUDIT_KEEP", keep)
    audit_router._LOG = AuditLog()
    return path


def test_rotation_env(tmp_path, monkeypatch):
    _configure(tmp_path, monkeypatch)
    client = TestClient(app)

    for idx in range(300):
        response = client.post("/v1/audit", json={"event": "evt", "payload": {"i": idx}})
        assert response.status_code == 200

    info_response = client.get("/v1/audit/info")
    assert info_response.status_code == 200

    info = info_response.json()
    assert info["keep"] == 3
    assert info["bytes"] <= audit_router._LOG.max_bytes
    assert info["rotated"], "expected at least one rotated segment"
    assert len(info["rotated"]) <= 3
    for segment in info["rotated"]:
        assert os.path.exists(segment["path"])
        assert segment["bytes"] > 0
