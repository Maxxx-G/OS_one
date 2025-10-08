# Overwatch Metrics + Snap UI

**Phase**: Voice Phase 7.3  
**Date**: 2025-10-09  
**Purpose**: Add live metrics display and edge-snap functionality to Overwatch floating panel

## Features

### 1. Edge Snap
- **Positions**: top | right | bottom | left
- **Control**: Dropdown in panel header
- **Persistence**: State stored in `overwatchUI` micro-store
- **Animation**: Smooth transitions with Tailwind

### 2. Live Metrics Tab
- **Event**: Listens for `os1:metrics:update` custom events
- **Data**:
  - STT: success, fail, retry counts
  - TTS: fail, recover counts
  - Loop: phase, intent
- **Display**: Real-time updates with color-coded values

## Implementation

### Store (`store/overwatchUI.ts`)
```typescript
let snap: 'right' | 'left' | 'top' | 'bottom' = 'right';
export const overwatchUI = {
  getSnap: () => snap,
  setSnap: (s) => { snap = s; subs.forEach(fn => fn()); }
};
```

### Panel (`components/OverwatchSidebar.tsx`)
- Dynamic positioning based on `side` state
- Dropdown selector in header
- Conditional border radius (rounded-l for right, etc.)

### Metrics (`components/OverwatchMetrics.tsx`)
- Subscribes to `os1:metrics:update` events
- Merges incoming data with previous state
- Color-coded display (green=good, red=bad, amber=warn)

## Verification Steps

```powershell
npm run dev
```

1. **Snap test**:
   - Click OW tab → panel opens
   - Use dropdown → select "left" → panel snaps to left edge
   - Try "top" → panel becomes horizontal bar at top
   - Try "bottom" → panel at bottom
   - Return to "right" → back to original position

2. **Metrics test** (console):
   ```javascript
   // Simulate STT success
   window.dispatchEvent(new CustomEvent('os1:metrics:update', {
     detail: { stt: { ok: 5, fail: 1, retry: 2 } }
   }));

   // Simulate TTS recovery
   window.dispatchEvent(new CustomEvent('os1:metrics:update', {
     detail: { tts: { fail: 3, recover: 2 } }
   }));

   // Simulate loop phase
   window.dispatchEvent(new CustomEvent('os1:metrics:update', {
     detail: { loop: { phase: 'reasoning', intent: 'search' } }
   }));
   ```

3. **Integration test**:
   - Alt + O still works
   - VoiceBar "OW ▶" button still works
   - Tab button moves with snap position
   - Close button works from any position

## Event Schema

```typescript
interface MetricsUpdate {
  stt?: { ok: number; fail: number; retry: number };
  tts?: { fail: number; recover: number };
  loop?: { phase: string; intent: string };
}

window.dispatchEvent(new CustomEvent('os1:metrics:update', {
  detail: metricsUpdate
}));
```

## Future Enhancements

- Local storage persistence for snap preference
- Drag-to-reposition support
- Metrics history graph
- Export metrics data
- Custom metric thresholds with alerts
