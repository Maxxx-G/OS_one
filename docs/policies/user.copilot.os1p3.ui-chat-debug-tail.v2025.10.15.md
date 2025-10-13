<!--
X-Tier1: policy
X-Agent: user.copilot
X-Domain: os1p3.ui-chat
X-Purpose: debug-tail
X-Version: v2025.10.15
X-Policy: STB
-->

# Chat Debug Tail Panel

**Policy**: `user.copilot.os1p3.ui-chat-debug-tail.v2025.10.15`  
**Status**: Active  
**Owner**: UI/Chat Team  
**Effective**: 2025-10-15

---

## Overview

The **Debug Tail** panel provides real-time visibility into chat proxy events, eliminating zero-mystery scenarios when messages don't appear or fail. It shows the last 20 events from the chat lifecycle including health checks, backend configuration, retry attempts, timeouts, and errors.

### Goals

1. **Zero Mystery**: Every chat interaction is traceable via debug events
2. **Quick Recovery**: One-click resend from tail panel
3. **Bug Reporting**: Copy-to-clipboard for easy developer handoff
4. **Observability**: Complement health pill and canary monitoring

---

## Event Types

All events follow the format: `[category] key=value key2=value2`

### Send Events

```
[send] prompt="Hello world..." mode=backend backend=http://localhost:4100
```

- **prompt**: First 40 chars of user message
- **mode**: `mock` | `backend` | `unavailable`
- **backend**: Resolved backend URL from router

### Receive Events

```
[recv] status=200 trace=mode=live; attempts=1; mock=0
```

- **status**: HTTP status code from `/api/chat`
- **trace**: X-OS1-Trace header value (mode/attempts/mock)

### Retry Events

```
[retry] attempt=2/3
```

- **attempt**: Current retry attempt out of total (from X-OS1-Retry header)

### Timeout Events

```
[timeout] 504 after retries
```

- Emitted when 504 Gateway Timeout occurs after exhausting retries

### Error Events

```
[error] HTTP 500
[error] network error
```

- **HTTP errors**: 4xx/5xx status codes
- **Network errors**: Fetch failures, aborted requests, DNS issues

---

## UI Components

### Toggle Button

- **Location**: Fixed bottom-right corner (below chat input)
- **Label**: `Tail ▲` (closed) or `Tail ▼` (open)
- **Badge**: Shows event count (e.g., `Tail ▼ 12`)
- **Behavior**: Click to expand/collapse panel

### Event List

- **Display**: Scrollable list, newest at bottom
- **Format**: `HH:MM:SS — [category] details`
- **Limit**: Last 20 events (rolling buffer)
- **Scroll**: Auto-scrolls to newest event

### Actions

1. **Copy**: Copies all events to clipboard in ISO timestamp format
   ```
   2025-10-15T14:32:01.234Z — [send] prompt="Debug test" mode=mock
   2025-10-15T14:32:01.456Z — [recv] status=200 trace=mode=mock; attempts=1
   ```

2. **Resend Last**: Dispatches `os1-retry-last` event to re-send last prompt
   - Same mechanism as navbar "Retry Last" button
   - Uses `window.os1LastPrompt` stored globally

3. **Clear**: Empties event buffer (does not affect chat history)

---

## Integration Points

### Chat Page (`apps/web-ui/app/chat/page.tsx`)

- **Event Emission**: `emitTail(message)` helper function
- **Custom Events**: Dispatches `os1-tail` with detail=message
- **Instrumentation Points**:
  - Before fetch: send mode and backend
  - After response: status and trace header
  - On retry banner: attempt number
  - On 504: timeout after retries
  - On error: error message

### API Route (`apps/web-ui/app/api/chat/route.ts`)

- **X-OS1-Trace Header**: Added to all responses
- **Format**: `mode={mode}; attempts={N}; mock={0|1}`
- **Values**:
  - `mode=mock`: CHAT_BACKEND_MODE=mock or settings.mock=true
  - `mode=live`: Backend proxy to real endpoint
  - `attempts`: Retry count from fetchWithRetry
  - `mock`: 1 if mock mode, 0 if live

### ChatTail Component (`apps/web-ui/components/ChatTail.tsx`)

- **Event Listener**: window `os1-tail` custom event
- **State**: TailEvent[] with { timestamp, message }
- **Buffer**: Rolling last 20 events (slice(-19) + new event)

---

## Usage Scenarios

### Debugging Failed Messages

1. User sends message, sees no response
2. Open tail panel (click "Tail ▲")
3. Check recent events:
   ```
   14:32:01 — [send] prompt="Test" mode=backend
   14:32:01 — [error] HTTP 502
   ```
4. Determine root cause (backend down, 5xx error)
5. Copy events for bug report

### Verifying Mock Mode

1. Check tail for `[send] mode=mock`
2. Confirm `[recv] trace=mode=mock; mock=1`
3. Validates CHAT_BACKEND_MODE=mock is active

### Monitoring Retries

1. Send message during intermittent backend issues
2. Watch tail show retry progression:
   ```
   14:35:10 — [send] mode=backend
   14:35:11 — [retry] attempt=2/3
   14:35:13 — [retry] attempt=3/3
   14:35:15 — [recv] status=200
   ```
3. Confirms retry layer working correctly

### Quick Recovery

1. Message fails with `[error] HTTP 504`
2. Click "Resend last" in tail panel
3. Message re-sent without retyping

---

## Technical Details

### Custom Event Pattern

```typescript
// Emit event
window.dispatchEvent(new CustomEvent("os1-tail", { detail: message }));

// Listen for event
window.addEventListener("os1-tail", (event) => {
  const message = (event as CustomEvent).detail;
  // Add to buffer
});
```

### Buffer Management

```typescript
setEvents((prev) => [...prev.slice(-19), { timestamp: Date.now(), message }]);
```

- Keeps last 19 events + new event = 20 total
- Prevents unbounded memory growth

### SSR Safety

```typescript
if (typeof window !== "undefined") {
  window.dispatchEvent(/* ... */);
}
```

- All window operations guarded for Next.js SSR

---

## Compliance

### Zero-Tolerance Rules

- ✅ Event emission must not throw errors (guarded by `typeof window !== "undefined"`)
- ✅ Buffer limit enforced (20 events max)
- ✅ No PII in event messages (prompts truncated to 40 chars)
- ✅ Tail panel does not block chat UI (fixed positioning, z-index isolation)

### Monitoring

- Guardian canary validates chat health (hourly)
- Health pill shows backend status (10s polling)
- Tail panel shows runtime events (per-message)

---

## Related Documentation

- [user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md](user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md) - Health status indicator
- [user.copilot.os1p3.ui-navbar.retry+theta-mini.v2025.10.14.md](user.copilot.os1p3.ui-navbar.retry+theta-mini.v2025.10.14.md) - Retry button
- [CHAT_API.md](../CHAT_API.md) - Chat backend API reference

---

## Changelog

- **2025-10-15**: Initial policy for debug tail panel
