# Overwatch Hotkey (Alt + O)

**Phase**: Voice Phase 7.3  
**Date**: 2025-10-09  
**Purpose**: Global keyboard shortcut for Overwatch sidebar

## Behavior

Press **Alt + O** anywhere → toggles the floating Overwatch sidebar.

## Implementation

**Location**: `apps/web-ui/app/GlobalClient.tsx`

```typescript
const onKey = (e: KeyboardEvent) => {
  if (e.altKey && (e.key === 'o' || e.key === 'O')) {
    e.preventDefault();
    overwatchUI.toggle();
  }
};
window.addEventListener('keydown', onKey);
```

## Verification Steps

```powershell
npm run dev
```

1. **Initial state**: Ensure sidebar is closed
2. **Open**: Press `Alt + O` → panel slides in
3. **Close**: Press `Alt + O` again → panel slides out
4. **Cross-page**: Navigate to different routes → hotkey still works

## Notes

- **Global scope**: Works across all pages (mounted in GlobalClient)
- **Non-blocking**: Does not steal focus from inputs unless Alt + O pressed
- **State sync**: Uses same `overwatchUI` store as OW tab and VoiceBar button
- **Cleanup**: Listener removed on unmount (proper useEffect cleanup)

## Related Hotkeys

- **Alt + Space**: Toggle voice listen (VoiceBar)
- **Alt + M**: Toggle metrics panel (VoiceBar)
- **Alt + R**: Toggle reasoning loop (ReasoningLoop)
- **Alt + O**: Toggle Overwatch sidebar (GlobalClient) ← **NEW**
