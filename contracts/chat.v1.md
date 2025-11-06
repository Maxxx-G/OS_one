# Chat Contract v1

## Sync (POST `${ARCHON_URL}/v1/chat`)

Request:

```json
{ "text": "<user message>", "context": { "mode": "Mediated|Direct", "agent": "string?" } }
```

Response:

```json
{ "id": "string", "text": "string", "ts": "ISO-8601", "provider": "openai|anthropic|ollama|..." }
```

## Streaming (POST `${ARCHON_URL}/v1/chat/stream`, SSE)

Each event line:

```json
{ "delta":"string"?, "content":"string"?, "text":"string"?, "done":boolean?, "provider":"string?" }
```

Notes:

- UI will prefer `delta`; fallback to `content` then `text`.
- Final event sets `"done": true`. Provider may appear on any event.

## Errors

`{ "error":"string", "code":"archon_unavailable|bad_request|..." }`

## Audit expectations

- UI logs: `chat-stream { phase:start|end|error|cancel, ms?, provider? }`
- Non-stream logs: `chat-echo { ok:boolean, transport, provider? }`
