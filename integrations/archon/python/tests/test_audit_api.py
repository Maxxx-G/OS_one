import json
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


def _configure_log(tmp_path: Path) -> Path:
    path = tmp_path / "audit.jsonl"
    os.environ["AUDIT_LOG_PATH"] = str(path)
    audit_router._LOG = AuditLog(str(path))
    return path


def test_audit_append_and_tail(tmp_path):
    path = _configure_log(tmp_path)
    client = TestClient(app)

    response = client.post(
        "/v1/audit",
        json={"event": "chat-stream:start", "payload": {"provider": "openai"}},
    )
    assert response.status_code == 200
    assert response.json()["ok"] is True

    tail = client.get("/v1/audit/tail", params={"limit": 10})
    assert tail.status_code == 200

    items = tail.json()["items"]
    assert any(item["event"] == "chat-stream:start" for item in items)

    with open(path, "r", encoding="utf-8") as handle:
        lines = [line for line in handle.readlines() if line.strip()]

    assert any("chat-stream:start" in line for line in lines)


def test_audit_tail_clamps_limit(tmp_path):
    _configure_log(tmp_path)
    client = TestClient(app)

    for idx in range(5):
        client.post("/v1/audit", json={"event": f"evt-{idx}"})

    tail = client.get("/v1/audit/tail", params={"limit": 5000})
    assert tail.status_code == 200

    items = tail.json()["items"]
    assert len(items) == 5
    assert items[-1]["event"] == "evt-4"

    tail_default = client.get("/v1/audit/tail")
    assert tail_default.status_code == 200
    assert len(tail_default.json()["items"]) == 5
