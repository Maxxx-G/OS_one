# Navbar Retry + θ Mini
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-navbar-retry-theta  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
Adds two operational controls to the main navigation bar:
1. **Retry Last**: Button to re-send the last prompt if a previous call failed or timed out
2. **θ Mini**: Real-time theta layer status showing active agents and CPU usage

## Features

### Retry Last Button

**Purpose**: Provides quick recovery from failed/timed-out chat requests without retyping.

**Behavior**:
- Remembers last prompt sent to `/api/chat`
- Dispatches `os1-retry-last` custom event when clicked
- Chat page listens for event and automatically re-sends prompt
- 1-second debounce prevents accidental double-clicks
- Disabled state during debounce period

**Use Cases**:
- Backend temporarily unavailable (504 timeout)
- Network interruption during request
- Server restart/deployment
- Rate limit hit (retry after cooldown)

**Implementation**:
```typescript
// NavbarOps.tsx dispatches event
window.dispatchEvent(new CustomEvent("os1-retry-last"));

// chat/page.tsx listens and resends
window.addEventListener("os1-retry-last", handleRetry);
```

### θ Mini Status

**Purpose**: Real-time visibility into theta layer operational state.

**Display Format**: `θ {agents} @ {cpu}%`

**Examples**:
- `θ 3 @ 45%` - 3 active agents, 45% CPU usage
- `θ 0 @ 12%` - No active agents, 12% baseline CPU
- `θ …` - Loading/checking status

**Polling**:
- Endpoint: `GET /api/theta/status`
- Interval: 10 seconds
- Timeout: 5 seconds per request
- Silent failure: Shows "θ …" if unreachable

**API Contract**:
```typescript
{
  ok: boolean;
  agents: number;  // Active agent count
  cpu: number;     // CPU usage percentage (0-100)
}
```

## Component Location

**File**: `apps/web-ui/components/NavbarOps.tsx`

**Rendered In**: AgentToolbar (main navigation bar)

**Position**: Between HealthPill and Help button

**Visual Grouping**: Part of operational status indicators

## User Interaction

### Retry Last Button

**States**:
- **Enabled**: White background, hover effect
- **Disabled**: 50% opacity, no hover, 1-second cooldown

**Accessibility**:
- Type: `button`
- Title: "Re-send last prompt if previous call failed or timed out"
- Keyboard: Focusable and activatable

**Visual**:
- Size: Small (`text-xs`)
- Padding: `px-2 py-1`
- Border: Subtle gray
- Transitions: Smooth color changes

### θ Mini Status

**Format**: Text display (non-interactive)

**Styling**:
- Font: Monospace (for number alignment)
- Size: Extra small (`text-xs`)
- Color: Gray (#6B7280)

**Tooltip**: 
```
Theta layer: {N} agent(s), {X}% CPU
```

or

```
Theta layer status loading...
```

## Verification Steps

### Test Retry Functionality

1. **Cause a timeout**:
   ```powershell
   # Stop backend server
   # Send a chat message
   # Should show timeout banner
   ```

2. **Click "Retry last"**:
   - Button should disable for 1 second
   - Input should populate with last message
   - Message should auto-send
   - Should work when backend is back online

3. **Verify debounce**:
   - Rapidly click "Retry last" multiple times
   - Should only send once (1-second cooldown)

4. **Edge cases**:
   - Click retry with no previous message → No action
   - Click retry while chat is busy → No action
   - Click retry after page refresh → Uses stored `window.os1LastPrompt`

### Test θ Mini Status

1. **Initial load**:
   - Should show "θ …" while loading
   - Should update to actual values within 5 seconds

2. **Status updates**:
   - Numbers should change over time (every 10 seconds)
   - Reflect actual theta layer activity

3. **Backend unavailable**:
   - If `/api/theta/status` fails, shows "θ …"
   - Console shows debug message (non-blocking)

4. **Hover tooltip**:
   - Shows detailed status
   - Updates with each poll

### Integration Tests

1. **Retry + Health Pill**:
   - Health shows "Down" → Retry should wait
   - Health shows "Healthy" → Retry should work
   - Health shows "Mock" → Retry should use mock

2. **Retry + Busy state**:
   - Send message (busy = true)
   - Click Retry → Should not trigger
   - Wait for completion → Retry should work

3. **Multiple components**:
   - NavbarOps, HealthPill, SecCommsPill all visible
   - No layout conflicts
   - Proper spacing maintained

## Troubleshooting

### "Retry last" does nothing

**Possible causes**:
1. No previous prompt stored
2. Chat is currently busy
3. Event listener not attached

**Fix**:
1. Send a message first to populate `os1LastPrompt`
2. Wait for current message to complete
3. Check console for JavaScript errors
4. Verify `useEffect` dependency array includes `busy`

### θ Mini shows "θ …" permanently

**Possible causes**:
1. `/api/theta/status` endpoint doesn't exist
2. Backend not running
3. CORS/network blocking request

**Fix**:
1. Verify endpoint exists:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:4000/api/theta/status"
   ```
2. Check console for fetch errors
3. Ensure backend is running and accessible

### θ Mini numbers don't update

**Possible causes**:
1. Polling stopped (component unmounted)
2. Backend returning stale data
3. Timer cleared prematurely

**Fix**:
1. Check component is mounted (visible in toolbar)
2. Verify backend `/api/theta/status` returns changing values
3. Check console for polling errors

### Retry sends wrong prompt

**Possible causes**:
1. `window.os1LastPrompt` overwritten
2. Multiple chat pages open
3. Race condition in event handler

**Fix**:
1. Only keep one chat tab open
2. Clear `window.os1LastPrompt` manually if needed
3. Use `lastPromptRef` for most recent value

## Implementation Details

### State Management

**NavbarOps Component**:
```typescript
const [theta, setTheta] = useState<ThetaStatus | null>(null);
const [disabled, setDisabled] = useState(false);
```

**Chat Page**:
```typescript
const lastPromptRef = useRef<string>("");
(window as any).os1LastPrompt = prompt; // Fallback
```

### Event Flow

1. User clicks "Retry last" in NavbarOps
2. Button disabled, 1-second timer starts
3. Custom event `os1-retry-last` dispatched
4. Chat page `handleRetry` function triggered
5. Retrieves `lastPromptRef.current` or `window.os1LastPrompt`
6. Sets input value and triggers `send()` on next tick
7. Normal chat flow proceeds

### Polling Lifecycle

**θ Mini Status**:
1. Component mounts → immediate poll
2. Every 10 seconds → scheduled poll
3. Each poll → 5-second timeout
4. Component unmounts → cleanup timer

**Cleanup**:
```typescript
return () => {
  mounted = false;
  clearTimeout(timer);
};
```

## Performance Considerations

### Retry Button
- **Debounce**: 1 second prevents spam
- **Memory**: Single string in ref + window
- **CPU**: Minimal (event dispatch only)

### θ Mini Polling
- **Frequency**: 1 request per 10 seconds = 360/hour
- **Payload**: ~50-100 bytes per request
- **Timeout**: 5 seconds max per request
- **Overhead**: Negligible

## Security Considerations

### Retry Mechanism
- Only retries user's own prompts
- No automatic retry loops (manual click required)
- Respects busy state (won't spam backend)
- 1-second debounce prevents abuse

### θ Status
- Read-only endpoint (GET only)
- No sensitive data exposed
- Public metrics (agents/cpu counts)
- No authentication required (internal endpoint)

## Future Enhancements

### Potential improvements:
1. **Smart retry**: Exponential backoff for multiple failures
2. **Retry counter**: Show how many times retried
3. **Retry history**: Last N failed prompts
4. **θ Details**: Click to expand full theta dashboard
5. **θ Alerts**: Visual warning if CPU > 80%
6. **Auto-retry**: Optional automatic retry on timeout

## References
- Component: `apps/web-ui/components/NavbarOps.tsx`
- Chat page: `apps/web-ui/app/chat/page.tsx`
- Toolbar: `apps/web-ui/components/AgentToolbar.tsx`
- θ Status API: `/api/theta/status` (to be implemented)
- Health Pill: `apps/web-ui/components/HealthPill.tsx`
