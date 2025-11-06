# MCP Sidecars (dev)

Archon dev compose runs two stub MCP services on the internal `os1_dev` network:

- `mcp-files` listens at `http://mcp-files:7011`
- `mcp-web` listens at `http://mcp-web:7012`

Each container exposes `GET /healthz` for health checks and `POST /invoke` that echoes the request payload. Replace the FastAPI stubs with real MCP servers later without changing Archon or the UI, as long as the service names and ports stay the same.
