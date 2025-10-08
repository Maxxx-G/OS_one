# Overwatch Floating UI

**Phase 7.3**: Right-edge floating sidebar for Overwatch admin controls.

## Architecture

### Micro-store (overwatchUI.ts)
- Pure subscription pattern, no deps
- `get()`, `set()`, `toggle()`, `subscribe()`
- 10 lines, stored in `apps/web-ui/store/overwatchUI.ts`

### Component (OverwatchSidebar.tsx)
- **Skinny tab**: Fixed `right-0 top-1/3`, "OW" label
- **Floating panel**: 320px width, slides right (translate-x)
- **Status display**: Active/Paused pill (green/amber)
- **Controls**: Pause/Resume buttons (uses `useOverwatch()`)
- Mounted globally in `app/layout.tsx` after `GlobalClient`

### Quick Access
- **VoiceBar shortcut**: "OW ▶" button (zinc-700)
- **Keyboard**: Alt+O (future enhancement)

## Event Integration
- Uses existing `useOverwatch()` hook (overwatchStore)
- No new events required
- Reactive via `overwatchUI.subscribe()`

## Verification
1. Start dev server: `npm run dev`
2. Click skinny "OW" tab on right edge → panel slides in
3. Click "Pause" → status pill turns amber, voice loops pause
4. Click "Resume" → status pill turns green, voice loops resume
5. Click "×" or tab → panel slides out
6. Click "OW ▶" in VoiceBar → panel opens

## Future Enhancements
- **Tabs**: Agents, Thresholds, Intents (Phase 8)
- **Drag handle**: Top-edge resize (Phase 8)
- **Alt+O**: Global hotkey toggle (Phase 8)
- **Persistence**: Remember open/closed state in localStorage

## Files Modified
1. `apps/web-ui/store/overwatchUI.ts` (NEW) - 10 lines
2. `apps/web-ui/components/OverwatchSidebar.tsx` (NEW) - 75 lines
3. `apps/web-ui/app/layout.tsx` (EDIT) - +2 lines (import + mount)
4. `apps/web-ui/src/components/VoiceBar.tsx` (EDIT) - +9 lines (OW button)
5. `docs/OVERWATCH_UI_FLOAT.md` (NEW) - this file

**Total**: ≤100 lines, 0 new deps, voice-first companion UI established.
