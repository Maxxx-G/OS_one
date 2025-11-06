X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: ui-health-spec
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore UI Health Integration Specification · v2025.10.12

**Feature**: Health Status Badge  
**Component**: LexiCore Editor Page (`/lexicore`)  
**Hook**: `useLexicoreHealth`  
**Purpose**: Real-time service health visibility with SEC-COMMS compliance

---

## Overview

The LexiCore UI health integration provides a **visible status badge** on the editor page that displays the operational state of the LexiCore service in real-time. This feature enhances user experience by:
- Providing immediate feedback on service availability
- Confirming SEC-COMMS α-layer compliance (local_only mode)
- Preventing user confusion when the service is offline
- Enabling graceful degradation of features

---

## Architecture

### Hook: `useLexicoreHealth`

**Location**: `apps/web-ui/app/lexicore/hooks/useLexicoreHealth.ts`

**Functionality**:
- Polls `/api/lexicore/health` endpoint on component mount
- Returns health status object: `{ ok, mode, loading, version?, timestamp? }`
- Client-side only (no SSR/SSG conflicts)
- Cache disabled (`cache: "no-store"`) for fresh status

**Interface**:
```typescript
interface HealthStatus {
  ok: boolean;          // Service operational
  mode: string;         // "local_only", "offline", "error", "unknown"
  loading: boolean;     // Initial fetch in progress
  version?: string;     // Service version (e.g., "v2025.10.12")
  timestamp?: string;   // Last health check timestamp (ISO 8601)
}
```

**Usage**:
```tsx
import { useLexicoreHealth } from "./hooks/useLexicoreHealth";

const health = useLexicoreHealth();
// Access: health.ok, health.mode, health.loading
```

### UI Integration: Status Badge

**Location**: `apps/web-ui/app/lexicore/page.tsx`

**Render Logic**:
```tsx
{health.loading ? "⏳ Checking..." : 
 health.ok && health.mode === "local_only" ? "✅ Healthy" : "❌ Offline"}
```

**Badge States**:

| Condition | Display | Background | Text Color | Border |
|---|---|---|---|---|
| `loading === true` | ⏳ Checking... | Gray (#f3f4f6) | Dark gray (#374151) | Gray (#d1d5db) |
| `ok && mode==='local_only'` | ✅ Healthy | Green (#d1fae5) | Dark green (#065f46) | Green (#10b981) |
| Otherwise | ❌ Offline | Red (#fee2e2) | Dark red (#991b1b) | Red (#ef4444) |

**Visual Design**:
- **Position**: Next to page title (horizontal layout)
- **Shape**: Pill-shaped (border-radius: 12px)
- **Size**: Small (padding: 0.25rem 0.75rem, font-size: 14px)
- **Weight**: Bold (font-weight: 600)

---

## User Experience

### Initial Load
1. User navigates to `/lexicore`
2. Page renders immediately with "⏳ Checking..." badge (gray)
3. `useLexicoreHealth` hook fetches `/api/lexicore/health`
4. Badge updates to "✅ Healthy" (green) or "❌ Offline" (red)

### Healthy State
- **Badge**: ✅ Healthy (green)
- **Interpretation**: LexiCore service is operational in local_only mode
- **Actions Available**: Save to Vault, Load from Vault, Replay Embed
- **SEC-COMMS**: α-layer confirmed (no external egress)

### Offline State
- **Badge**: ❌ Offline (red)
- **Interpretation**: LexiCore service unavailable (dev server not running, network error, etc.)
- **Actions Available**: Editor still functional (local editing only), but Save/Load/Replay will fail
- **User Guidance**: Badge provides visual cue to avoid attempting API calls

---

## SEC-COMMS Compliance

### α-layer (Origin Validation & Egress Control)
- **Health Badge Purpose**: Confirms `mode: "local_only"`
- **Visual Indicator**: Green badge = SEC-COMMS compliant (no external egress)
- **User Trust**: Transparency via visible status

### Edge Runtime
- Health endpoint uses Next.js edge runtime (fast response <10ms)
- Badge updates happen client-side (no page reload required)
- No additional network requests after initial health check

---

## Technical Details

### Performance
- **Initial Fetch**: 1 request to `/api/lexicore/health` on mount
- **No Polling**: Health status is static after initial fetch (not real-time)
- **Cache Strategy**: `cache: "no-store"` ensures fresh status on page reload

### Error Handling
```tsx
try {
  const res = await fetch("/api/lexicore/health");
  if (res.ok) {
    // Parse and set healthy status
  } else {
    // Set error state
  }
} catch (err) {
  // Set offline state (network failure)
}
```

### Accessibility
- Badge uses semantic colors (green=success, red=error)
- Emoji indicators (✅, ❌, ⏳) for visual clarity
- Text labels ("Healthy", "Offline", "Checking...") for screen readers

---

## Future Enhancements

### Real-Time Polling (Optional)
```tsx
useEffect(() => {
  const interval = setInterval(checkHealth, 30000); // Poll every 30s
  return () => clearInterval(interval);
}, []);
```

### Detailed Status Tooltip
- Hover over badge to show:
  - Last checked timestamp
  - Service version
  - Uptime (if available)

### Degraded State
- ⚠️ "Degraded" badge (yellow) for partial failures:
  - Vault accessible, but Replay unavailable
  - Network latency high

---

## Smoke Testing

**Script**: `scripts/tools/user.copilot.os1p1lexicore.ui-health-smoke.v2025.10.12.ps1`

**Tests**:
1. **Page Availability**: Verifies `/lexicore` returns 200 OK
2. **Badge Content**: Checks for "Healthy", "Offline", or "Checking" text in HTML

**Report Output**: `docs/reports/user.copilot.os1p1lexicore.ui-health-smoke.v2025.10.12.md`

**Example**:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p1lexicore.ui-health-smoke.v2025.10.12.ps1
```

---

## Integration Points

### Client-Side Health Checks
```tsx
// Other components can use the same hook
import { useLexicoreHealth } from "@/app/lexicore/hooks/useLexicoreHealth";

const health = useLexicoreHealth();
if (!health.ok) {
  return <div>LexiCore is currently offline</div>;
}
```

### Conditional Rendering
```tsx
// Disable Save button if service offline
<button 
  onClick={handleSave}
  disabled={!health.ok}
>
  Save to Vault (ε)
</button>
```

---

## Limitations

- **Static Status**: Badge does not update in real-time (requires page reload)
- **No Retry Logic**: Failed health check is final until next mount
- **No Detailed Diagnostics**: Badge shows only healthy/offline (no granular errors)

For advanced monitoring, use:
- `/api/lexicore/health` endpoint directly (JSON payload)
- Telemetry dashboard (`/telemetry`)
- Browser DevTools Network tab

---

## References

- **LexiCore MVP Spec**: `docs/policies/user.copilot.os1p1lexicore.mvp-spec.v2025.10.12.md`
- **Health Endpoint Spec**: `docs/policies/user.copilot.os1p1lexicore.health-spec.v2025.10.12.md`
- **Genesis Registry**: `docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`

---

**Last Updated**: v2025.10.12  
**Status**: Active — Deployed with LexiCore MVP
