# UI Chat Health Pill
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-health-pill  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
Persistent health indicator displayed in the main navigation/header that shows real-time chat backend status. The pill automatically polls `/api/chat/health` every 10 seconds and updates its color and label based on the response.

## Visual States

### 🟩 Healthy (Green)
- **Condition**: Backend reachable and operational
- **API Response**: `{ ok: true, mock: false }`
- **Colors**: 
  - Background: `bg-green-100`
  - Text: `text-green-800`
  - Border: `border-green-300`
- **Label**: "Healthy"

### 🟦 Mock (Blue)
- **Condition**: Mock mode enabled (CHAT_BACKEND_MOCK=1)
- **API Response**: `{ ok: true, mock: true }`
- **Colors**:
  - Background: `bg-blue-100`
  - Text: `text-blue-800`
  - Border: `border-blue-300`
- **Label**: "Mock"

### 🟥 Down (Red)
- **Condition**: Backend unreachable or returned error
- **API Response**: `{ ok: false }` OR network error
- **Colors**:
  - Background: `bg-red-100`
  - Text: `text-red-800`
  - Border: `border-red-300`
- **Label**: "Down"

### ⚪ Checking (Gray)
- **Condition**: Initial state or validating
- **Colors**:
  - Background: `bg-gray-100`
  - Text: `text-gray-800`
  - Border: `border-gray-300`
- **Label**: "Checking"

## Implementation Details

### Component Location
- **File**: `apps/web-ui/components/HealthPill.tsx`
- **Rendered**: AgentToolbar (top navigation bar)
- **Position**: Between SecCommsPill and Help button

### Polling Behavior
- **Interval**: 10 seconds (10,000ms)
- **Timeout**: 5 seconds per request
- **Method**: GET `/api/chat/health`
- **Cache**: Disabled (`cache: "no-store"`)
- **Lifecycle**: Starts on mount, stops on unmount

### API Contract

**Endpoint**: `GET /api/chat/health`

**Response Format**:
```typescript
{
  ok: boolean;      // Backend is reachable
  mock: boolean;    // CHAT_BACKEND_MOCK is enabled
  url?: string;     // Backend URL (optional)
}
```

**Examples**:

Healthy backend:
```json
{
  "ok": true,
  "mock": false,
  "url": "http://localhost:7700/v1/chat"
}
```

Mock mode:
```json
{
  "ok": true,
  "mock": true,
  "url": "http://localhost:7700/v1/chat"
}
```

Backend down:
```json
{
  "ok": false,
  "mock": false,
  "url": "http://localhost:7700/v1/chat"
}
```

## User Experience

### Tooltip
Hovering over the pill displays:
```
Chat backend: {Status}
Last checked: {Time}
```

Example: `Chat backend: Healthy\nLast checked: 2:45:30 PM`

### Accessibility
- **Role**: `status` (ARIA live region)
- **Live**: `polite` (announces changes without interrupting)
- **Label**: `Chat backend status: {Status}`
- **Keyboard**: Focusable with tooltip on focus

### Transitions
- **Duration**: 300ms
- **Property**: `all` (smooth color/border changes)
- **Effect**: Pill smoothly transitions between states

## Troubleshooting

### Pill shows "Down" but backend is running

**Possible causes**:
1. Backend not listening on expected URL
2. CORS issues blocking request
3. Backend health check timing out
4. Network/firewall blocking localhost

**Fix**:
1. Verify backend URL in environment:
   ```bash
   echo $env:CHAT_BACKEND_URL
   ```
2. Test health endpoint manually:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:7700/v1/chat" -Method OPTIONS
   ```
3. Check console for fetch errors:
   - Open browser DevTools (F12)
   - Check Console tab for "[HealthPill] Poll failed" messages
4. Ensure backend has proper CORS headers:
   ```
   Access-Control-Allow-Origin: http://localhost:4000
   Access-Control-Allow-Methods: OPTIONS, POST
   ```

### Pill stuck on "Checking"

**Possible causes**:
1. `/api/chat/health` route not responding
2. JavaScript error preventing state update
3. Component not mounted properly

**Fix**:
1. Check browser console for errors
2. Verify `/api/chat/health` endpoint exists:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:4000/api/chat/health"
   ```
3. Restart dev server:
   ```bash
   npm run dev
   ```

### Pill shows "Mock" in production

**Possible causes**:
1. `CHAT_BACKEND_MOCK=1` environment variable set in production
2. Environment configuration error

**Fix**:
1. Check production environment variables
2. Ensure `CHAT_BACKEND_MOCK` is unset or `"0"`
3. Restart application after fixing environment

### Rapid color changes (flickering)

**Possible causes**:
1. Backend intermittently available
2. Network instability
3. Health check timeout too aggressive

**Fix**:
1. Increase health check timeout in route.ts:
   ```typescript
   const timeoutMs = 5000; // Increase from default
   ```
2. Investigate backend stability
3. Check network conditions

## Development Tips

### Local Testing

**Test Mock mode**:
```powershell
$env:CHAT_BACKEND_MOCK = "1"
npm run dev
```
Pill should show "Mock" (blue).

**Test Down state**:
1. Stop backend server
2. Pill should turn red after timeout

**Test Healthy state**:
1. Start backend on `http://localhost:7700`
2. Ensure `CHAT_BACKEND_MOCK` is unset or `"0"`
3. Pill should turn green

### Console Logging

The component logs warnings on failures:
```
[HealthPill] Poll failed: Error: HTTP 502
```

Enable verbose logging in development by modifying the catch block.

### Performance Considerations

- **Polling overhead**: ~1 request per 10 seconds = 360 requests/hour
- **Network impact**: Minimal (~100 bytes per request)
- **CPU impact**: Negligible (idle between polls)
- **Memory**: Single timer, cleaned up on unmount

## Edge Runtime Compatibility

The health endpoint uses Edge Runtime:
```typescript
export const runtime = "edge";
```

This ensures:
- Fast cold starts
- Low memory footprint
- Global CDN deployment capability
- No Node.js dependencies

## Related Components

### SecCommsPill
- Similar UI pattern (status pill)
- Shows SEC-COMMS auto-ack status
- Located next to HealthPill

### ContextPill
- Displays current context/mode
- Located after Help button
- Similar styling pattern

### FooterStatus
- Shows launch readiness status
- Located in footer
- Complementary to HealthPill

## Future Enhancements

### Potential improvements:
1. **Click to retry**: Manual health check trigger
2. **History**: Show recent status changes
3. **Metrics**: Display average latency
4. **Alerts**: Browser notification on status change
5. **Backend selector**: Switch between multiple backends
6. **Detailed view**: Expandable panel with more info

## References
- Component: `apps/web-ui/components/HealthPill.tsx`
- Health endpoint: `apps/web-ui/app/api/chat/health/route.ts`
- Toolbar: `apps/web-ui/components/AgentToolbar.tsx`
- Backend settings: `apps/web-ui/lib/chat/backend.ts`
