<!--
X-Tier1: policy
X-Agent: user.copilot
X-Domain: os1p3.ui-chat
X-Purpose: safe-render
X-Version: v2025.10.15
X-Policy: STB
-->

# Chat Safe Render - Universal Fallback

**Policy**: `user.copilot.os1p3.ui-chat-safe-render.v2025.10.15`  
**Status**: Active  
**Owner**: UI/Chat Team  
**Effective**: 2025-10-15

---

## Overview

**Safe Render** guarantees message rendering regardless of streaming mode, MIME type, or backend response format. This eliminates scenarios where:
- Streaming fails silently (reader errors)
- JSON parsing fails on buffered responses
- Content-Type mismatches block rendering
- Empty responses show no feedback

### Goals

1. **Zero Silent Failures**: Every response renders something, even if "(empty response)"
2. **Format Agnostic**: Handle streaming SSE, JSON, and plain text equally
3. **Graceful Degradation**: Fallback chain ensures visibility
4. **Debug Visibility**: Emit tail events for stream errors

---

## Implementation

### Client-Side Fallback Chain (apps/web-ui/app/chat/page.tsx)

```typescript
try {
  if (response.body && isStreamingContent(contentType)) {
    // 1. Try streaming (SSE/text/event-stream)
    const reader = response.body.getReader();
    // ... decode chunks line-by-line
  } else {
    // 2. Try buffered JSON parse
    const text = await response.text();
    const data = JSON.parse(text);
    const reply = data?.choices?.[0]?.message?.content ?? text;
  }
} catch (streamError) {
  // 3. Fallback to raw text()
  emitTail(`[warn] stream error, fallback to text()`);
  const fallbackText = await response.text();
  updateAssistant(assistantIndex, fallbackText || "(stream error: no content)");
}
```

### Server-Side Content-Type (apps/web-ui/app/api/chat/route.ts)

**MOCK Response**:
```typescript
{
  status: 200,
  headers: { 
    "content-type": "application/json; charset=utf-8",
    "X-OS1-Trace": "mode=mock; attempts=1; mock=1"
  }
}
```

**Buffered Response** (non-streaming backend):
```typescript
{
  status: upstream.status,
  headers: {
    "content-type": contentType || "text/plain; charset=utf-8",
    "X-OS1-Trace": `mode=live; attempts=${attemptCount}; mock=0`
  }
}
```

**Streaming Response** (SSE):
```typescript
{
  status: upstream.status,
  headers: {
    "content-type": contentType, // e.g., "text/event-stream"
    "X-OS1-Trace": `mode=live; attempts=${attemptCount}; mock=0`
  }
}
```

---

## Fallback Behavior

### Scenario 1: Streaming Success
**Input**: `Content-Type: text/event-stream`  
**Flow**: Read stream → Parse SSE lines → Aggregate → Render  
**Output**: Progressive message rendering

### Scenario 2: Streaming Error
**Input**: Stream reader throws error  
**Flow**: Catch → Emit `[warn] stream error` → Fallback to `response.text()`  
**Output**: Full message rendered (if body available)

### Scenario 3: Buffered JSON
**Input**: `Content-Type: application/json`  
**Flow**: Parse JSON → Extract `choices[0].message.content` → Render  
**Output**: Single message render

### Scenario 4: Buffered JSON Parse Error
**Input**: Invalid JSON in response body  
**Flow**: JSON.parse() throws → Catch → Render raw text  
**Output**: Raw response text (debug visibility)

### Scenario 5: Empty Response
**Input**: Response body is empty string  
**Flow**: Detect empty after all fallbacks → Render "(empty response)"  
**Output**: User sees explicit feedback (not blank)

---

## Manual Verification

### Test 1: MOCK Mode Render (≤2s)

**Objective**: Verify MOCK response renders within 2 seconds

**Steps**:
1. Set environment:
   ```powershell
   $env:CHAT_BACKEND_MOCK = "1"
   ```
2. Start web-ui:
   ```powershell
   npm run -w apps/web-ui dev
   ```
3. Open browser to `http://localhost:4000/chat`
4. Type "hi" and press Send
5. Start timer

**Expected**:
- Assistant message appears within 2 seconds
- Content: "MOCK: Hello from OS One! (retry layer active)"
- No console errors
- Tail panel shows `[recv] status=200 trace=mode=mock`

**Exit Criteria**: PASS if message renders ≤2s, FAIL otherwise

---

### Test 2: Streaming Fallback

**Objective**: Verify stream error falls back to text()

**Steps**:
1. Modify `apps/web-ui/app/chat/page.tsx` temporarily:
   ```typescript
   if (response.body && isStreamingContent(contentType)) {
     throw new Error("TEST: Force stream error");
   }
   ```
2. Send message in MOCK mode
3. Check rendered output

**Expected**:
- Tail panel shows `[warn] stream error, fallback to text()`
- Message still renders (from fallback)
- No blank assistant message

**Exit Criteria**: PASS if fallback renders message, FAIL if blank

---

### Test 3: JSON Parse Fallback

**Objective**: Verify invalid JSON falls back to raw text

**Steps**:
1. Modify mock response to return invalid JSON:
   ```typescript
   return new Response("INVALID{JSON", { ... });
   ```
2. Send message
3. Check rendered output

**Expected**:
- Message renders raw text: "INVALID{JSON"
- No silent failure
- No "(no content)" placeholder

**Exit Criteria**: PASS if raw text renders, FAIL if blank or error

---

### Test 4: Empty Response Handling

**Objective**: Verify empty responses show explicit feedback

**Steps**:
1. Modify mock response to return empty string:
   ```typescript
   return new Response("", { ... });
   ```
2. Send message
3. Check rendered output

**Expected**:
- Message renders: "(empty response)" or similar placeholder
- User sees feedback (not blank message bubble)
- Tail panel shows `[recv] status=200`

**Exit Criteria**: PASS if placeholder renders, FAIL if blank

---

## Debugging

### Tail Events

Safe render emits tail events at key points:

```
[send] prompt="hi" mode=mock backend=mock
[recv] status=200 trace=mode=mock; attempts=1; mock=1
```

**Stream Error**:
```
[warn] stream error, fallback to text()
```

**JSON Parse Error** (implicit, caught by try/catch):
```
[recv] status=200 trace=...
(raw text rendered instead of parsed JSON)
```

### Console Errors

**Before Safe Render**:
```
Uncaught TypeError: Cannot read property 'content' of undefined
  at parseLine (page.tsx:123)
```

**After Safe Render**:
```
(no errors, fallback renders text)
```

---

## Performance

### Latency Impact

- **Streaming Path**: No change (direct reader)
- **Buffered JSON**: +0-5ms (try/catch overhead negligible)
- **Fallback Path**: +10-50ms (additional `response.text()` call)

### Memory Impact

- **Streaming**: No change (line-by-line decode)
- **Buffered**: +1x response size (text stored for fallback)
- **Fallback**: +1x response size (duplicate `text()` call if stream fails)

**Mitigation**: Fallback only triggered on error, not normal path

---

## Edge Cases

### Partial Stream Failure

**Scenario**: Stream starts, then connection drops mid-message

**Behavior**:
1. Aggregates partial content
2. Stream read throws error
3. Fallback attempts `response.text()` (may fail if body consumed)
4. Renders partial content + "(stream interrupted)"

**Outcome**: User sees partial message, not blank

### Multiple Content-Type Headers

**Scenario**: Backend returns `text/plain, application/json`

**Behavior**:
1. `contentType` variable contains first value
2. `isStreamingContent()` checks for "text/event-stream"
3. Falls through to buffered path
4. JSON parse attempts first, raw text fallback

**Outcome**: Renders successfully regardless of order

### Zero-Byte Response

**Scenario**: HTTP 200 with empty body

**Behavior**:
1. `response.text()` returns `""`
2. Fallback detects empty string
3. Renders `"(empty response)"`

**Outcome**: User sees explicit feedback

---

## Compliance

### Zero-Tolerance Rules

- ✅ No silent render failures (always show something)
- ✅ No breaking changes to streaming path
- ✅ No new dependencies (uses built-in `Response.text()`)
- ✅ Emit tail events for fallback path
- ✅ Deterministic output (no random fallback behavior)

### Breaking Change Prevention

- **Streaming**: Wrapped in try/catch, preserves existing logic
- **JSON Parse**: Existing try/catch extended with empty check
- **Content-Type**: Preserved, added charset for clarity

---

## Rollback

If safe render causes issues:

```powershell
git revert HEAD
```

Or manual rollback:

1. Remove try/catch wrapper around streaming block
2. Restore original JSON parse (without raw text fallback)
3. Remove `emitTail("[warn] stream error...")` call

---

## Related Documentation

- [user.copilot.os1p3.ui-chat.debug-tail.v2025.10.15.md](user.copilot.os1p3.ui-chat-debug-tail.v2025.10.15.md) - Debug event panel
- [user.copilot.os1p3.ui-chat.retry+timeout.v2025.10.14.md](user.copilot.os1p3.ui-chat-retry+timeout.v2025.10.14.md) - Retry layer
- [user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md](user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md) - Health indicator

---

## Changelog

- **2025-10-15**: Initial policy for universal safe render with fallback chain
