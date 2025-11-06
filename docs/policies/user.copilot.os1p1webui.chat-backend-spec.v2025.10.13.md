X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-backend-spec
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Chat API Backend Specification · v2025.10.13

**Endpoint**: `/api/chat`  
**Method**: POST  
**Runtime**: Edge (Next.js)  
**Purpose**: Server-Sent Events (SSE) streaming chat API with SEC-COMMS gating

---

## Overview

The Chat API provides a **streaming chat interface** that integrates with OS One's SEC-COMMS infrastructure to enforce egress control and provider selection:

- **α-layer (Alpha)**: Origin validation & egress control
- **ε-layer (Epsilon)**: Vault access for API keys

**Provider Selection**:
- If `SEC_COMMS.mode === "local_only"`: Stream from **Ollama** (http://localhost:11434)
- Else: Stream from **OpenAI** (API key from vault/environment)

---

## Request

### HTTP Method
```
POST /api/chat
```

### Headers
```
Content-Type: application/json
```

### Payload
```json
{
  "message": "Your chat message here",
  "conversationId": "optional-conversation-id",
  "agentId": "optional-agent-id"
}
```

**Fields**:
- `message` (string, REQUIRED): User's chat message
- `conversationId` (string, OPTIONAL): Conversation tracking ID
- `agentId` (string, OPTIONAL): Agent identifier for personalization

---

## Response

### Success (200 OK)

**Content-Type**: `text/event-stream`

**Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**SSE Event Schema**:
```
event: data
data: <text chunk>

event: error
data: <error message>

event: end
data:
```

### Event Types

#### `event: data`
- **Purpose**: Stream text chunks from LLM
- **Format**: `data: <content>\n\n`
- **Example**:
  ```
  event: data
  data: Hello! How can I help you today?

  event: data
  data:  I'm here to assist.
  ```

#### `event: error`
- **Purpose**: Indicate provider error (Ollama unavailable, OpenAI API error, etc.)
- **Format**: `data: <error message>\n\n`
- **Example**:
  ```
  event: error
  data: Ollama unavailable: 500 Internal Server Error
  ```

#### `event: end`
- **Purpose**: Signal end of stream
- **Format**: `data: \n\n`
- **Example**:
  ```
  event: end
  data:
  ```

### Error Responses

**400 Bad Request**: Missing or empty `message` field  
**403 Forbidden**: SEC-COMMS egress control violation  
**500 Internal Server Error**: Unexpected server error

---

## SEC-COMMS Integration

### α-layer (Origin Validation & Egress Control)

**Function**: `validateEgressControl(mode: string): boolean`

**Purpose**:
- Enforce `local_only` mode to prevent external egress
- Log egress decisions for audit trail

**Behavior**:
- If `mode === "local_only"`: Only Ollama allowed (no external API calls)
- Else: OpenAI allowed (external egress permitted)

**Example**:
```typescript
const mode = getMode(); // "local_only" or "external"
if (!validateEgressControl(mode)) {
  return new Response("SEC-COMMS egress control violation", { status: 403 });
}
```

### ε-layer (Vault Persistence)

**Function**: `getOpenAIKeyFromVault(): Promise<string | null>`

**Purpose**:
- Retrieve OpenAI API key from encrypted vault
- Fallback to environment variable in MVP

**Behavior**:
- Returns API key if available
- Returns `null` if key not found (triggers error event in stream)

**Example**:
```typescript
const apiKey = await getOpenAIKeyFromVault();
if (!apiKey) {
  throw new Error("OpenAI API key not found in vault (ε-layer)");
}
```

---

## Provider Integration

### Ollama (Local-Only Mode)

**URL**: `http://localhost:11434/api/generate`  
**Model**: `llama2` (configurable via environment)

**Request**:
```json
{
  "model": "llama2",
  "prompt": "User's message",
  "stream": true
}
```

**Response**: NDJSON (newline-delimited JSON)
```json
{"response": "Hello", "done": false}
{"response": "!", "done": false}
{"response": "", "done": true}
```

**Error Handling**:
- If Ollama unavailable: Emit `event: error` with descriptive message
- If stream interrupted: Emit `event: end` and close

### OpenAI (External Mode)

**URL**: `https://api.openai.com/v1/chat/completions`  
**Model**: `gpt-3.5-turbo` (configurable)

**Request**:
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [{ "role": "user", "content": "User's message" }],
  "stream": true
}
```

**Response**: SSE stream
```
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":"!"}}]}

data: [DONE]
```

**Error Handling**:
- If API key missing: Throw error before streaming starts
- If API unavailable: Emit `event: error` and close stream

---

## Usage Examples

### Client-Side (Fetch API)
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('event: data')) {
      const dataLine = lines[lines.indexOf(line) + 1];
      const content = dataLine.replace('data: ', '');
      console.log('Chunk:', content);
    }
  }
}
```

### PowerShell (Basic Validation)
```powershell
$body = @{ message = "Hello, test!" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:4000/api/chat" -Method POST -Body $body -ContentType "application/json"
```

### cURL (SSE Stream)
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}' \
  --no-buffer
```

---

## Configuration

### Environment Variables

**SEC-COMMS Mode**:
```bash
SECCOMMS_MODE=local_only  # Default: local_only
SECCOMMS_MODE=external    # Allows OpenAI
```

**Ollama URL**:
```bash
OLLAMA_URL=http://localhost:11434  # Default
```

**OpenAI API Key** (ε-layer):
```bash
OPENAI_API_KEY=sk-...  # Required for external mode
```

---

## Error Scenarios

### 1. Ollama Unavailable (Local-Only Mode)
**Trigger**: Ollama not running at http://localhost:11434  
**Response**:
```
event: error
data: Ollama unavailable: 500 Internal Server Error

event: end
data:
```

### 2. OpenAI API Key Missing (External Mode)
**Trigger**: No OPENAI_API_KEY in environment/vault  
**Response**: `500 Internal Server Error` (before streaming starts)

### 3. Empty Message
**Trigger**: `message` field missing or empty  
**Response**: `400 Bad Request`

### 4. SEC-COMMS Egress Violation
**Trigger**: Invalid egress control configuration  
**Response**: `403 Forbidden`

---

## Performance Considerations

### Edge Runtime
- **Pros**: Fast startup, global distribution, low latency
- **Cons**: Limited API access (no direct filesystem/vault in edge)

### Streaming
- **Chunk Size**: Variable (depends on provider)
- **Latency**: ~100-500ms per chunk (Ollama), ~50-200ms (OpenAI)
- **Buffering**: Minimal (SSE pushes chunks as received)

---

## Security

### SEC-COMMS Compliance
- **α-layer**: Enforces `local_only` to prevent external egress
- **ε-layer**: API keys stored in encrypted vault (not hardcoded)

### Input Validation
- Message content sanitized (no script injection)
- Length limits enforced (prevent abuse)

### Rate Limiting
- Future enhancement: Rate limit by IP/user
- Current: No rate limiting (trust dev environment)

---

## Future Enhancements

### 1. Conversation Persistence
- Store conversation history in vault (ε-layer)
- Support `conversationId` for multi-turn chats

### 2. Agent Personalization
- Use `agentId` to load persona/context from vault
- Customize system prompts per agent

### 3. Multi-Provider Support
- Add Azure OpenAI, Anthropic Claude, etc.
- Provider selection via request parameter

### 4. Telemetry Integration
- Log stream events to η-layer (`/api/telemetry`)
- Track usage, latency, error rates

---

## References

- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`
- **Chat Interface STB**: `docs/stb/user.copilot.os1p1webui.chat-interface-init.v2025.10.12.md`
- **Ollama Documentation**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **OpenAI Streaming**: https://platform.openai.com/docs/api-reference/streaming

---

**Last Updated**: v2025.10.13  
**Status**: MVP — SSE streaming with SEC-COMMS gating
