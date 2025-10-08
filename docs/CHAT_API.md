# Chat API

Minimal proxy to Ollama for synchronous and streaming chat completions.

## Environment

- `OLLAMA_OS1_URL` (default `http://host.docker.internal:11434`)
- `OLLAMA_MODEL` (default `deepseek-r1:8b`)

## POST /v1/chat

- Body: `{ "messages": [{"role": string, "content": string}] }`
- Response: `{ "ok": true, "provider": "ollama", "text": string, "id": string, "ts": number }`
- Errors: `{ "ok": false, "error": "ollama_<status_code>" }` with status 502 on provider failures

## GET /v1/chat/stream

- Query params: `u` (user message), `system` (optional system message)
- Response: `text/event-stream` (SSE) with:
  - `event: token\ndata: {"t": string}\n\n` for each token chunk
  - `event: done\ndata: {}\n\n` when complete
  - `event: error\ndata: {"error": "ollama_stream_failed"}\n\n` on failures
