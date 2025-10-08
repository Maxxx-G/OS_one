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
    path = tmp_path / "prefs_mcp.json"
    os.environ["PREFS_STORE_PATH"] = str(path)
    prefs_router._STORE = PrefsStore(str(path))
    prefs_router._STATE = prefs_router._STORE.load()
    return path


def test_mcp_enabled_default(tmp_path):
    """Test that mcp_enabled defaults to an empty list."""
    _configure_store(tmp_path)
    client = TestClient(app)

    response = client.get("/v1/prefs")
    assert response.status_code == 200

    payload = response.json()
    assert "mcp_enabled" in payload
    assert payload["mcp_enabled"] == []


def test_mcp_enabled_update(tmp_path):
    """Test updating mcp_enabled list."""
    path = _configure_store(tmp_path)
    client = TestClient(app)

    # Update with multiple MCPs
    update = {"mcp_enabled": ["filesystem", "git", "web"]}
    response = client.post("/v1/prefs", json=update)
    assert response.status_code == 200

    payload = response.json()
    assert payload["mcp_enabled"] == ["filesystem", "git", "web"]

    # Verify persistence
    follow_up = client.get("/v1/prefs")
    assert follow_up.status_code == 200
    persisted = follow_up.json()
    assert persisted["mcp_enabled"] == ["filesystem", "git", "web"]

    # Check file content
    with open(path, "r", encoding="utf-8") as handle:
        saved = json.load(handle)
    assert saved["mcp_enabled"] == ["filesystem", "git", "web"]


def test_mcp_enabled_partial_update(tmp_path):
    """Test that partial updates don't reset other fields."""
    _configure_store(tmp_path)
    client = TestClient(app)

    # Set initial state
    client.post("/v1/prefs", json={"hints_enabled": True, "mcp_enabled": ["filesystem"]})

    # Update only mcp_enabled
    response = client.post("/v1/prefs", json={"mcp_enabled": ["git", "docker"]})
    assert response.status_code == 200

    payload = response.json()
    assert payload["hints_enabled"] is True  # Should be preserved
    assert payload["mcp_enabled"] == ["git", "docker"]


def test_mcp_enabled_clear(tmp_path):
    """Test clearing mcp_enabled by setting to empty list."""
    path = _configure_store(tmp_path)
    client = TestClient(app)

    # Set some MCPs
    client.post("/v1/prefs", json={"mcp_enabled": ["filesystem", "git"]})

    # Clear the list
    response = client.post("/v1/prefs", json={"mcp_enabled": []})
    assert response.status_code == 200
    assert response.json()["mcp_enabled"] == []

    # Verify file
    with open(path, "r", encoding="utf-8") as handle:
        saved = json.load(handle)
    assert saved["mcp_enabled"] == []


def test_mcp_enabled_invalid_type(tmp_path):
    """Test that invalid types are sanitized to default."""
    path = _configure_store(tmp_path)
    client = TestClient(app)

    # Try to set non-list value (should be ignored/sanitized)
    client.post("/v1/prefs", json={"mcp_enabled": ["filesystem"]})

    # Manually corrupt the file to test sanitization
    with open(path, "w", encoding="utf-8") as handle:
        json.dump({"mcp_enabled": "not-a-list"}, handle)

    # Reload should sanitize to default
    prefs_router._STATE = prefs_router._STORE.load()
    response = client.get("/v1/prefs")
    assert response.status_code == 200
    assert response.json()["mcp_enabled"] == []
