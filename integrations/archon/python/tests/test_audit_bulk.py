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


def _configure_log(tmp_path: Path) -> None:
    path = tmp_path / "audit.jsonl"
    os.environ["AUDIT_LOG_PATH"] = str(path)
    audit_router._LOG = AuditLog(str(path))


def test_audit_bulk(tmp_path):
    _configure_log(tmp_path)
    client = TestClient(app)

    payload = {
        "items": [
            {"event": "a", "payload": {"x": 1}},
            {"event": "b", "payload": {"y": 2}},
        ]
    }

    response = client.post("/v1/audit/bulk", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["ok"] is True
    assert data["count"] == 2

    tail = client.get("/v1/audit/tail", params={"limit": 10})
    assert tail.status_code == 200

    events = [item["event"] for item in tail.json()["items"]]
    assert "a" in events and "b" in events
