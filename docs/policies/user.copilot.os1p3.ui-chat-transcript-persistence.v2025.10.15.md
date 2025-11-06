# UI Chat Transcript Persistence
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-transcript-persistence  
X-Version: v2025.10.15  
X-Policy: Single-Fence STB ≤ 5 files deterministic

## Overview
Persists chat transcripts in browser's IndexedDB so conversations survive page reloads, tab crashes, and accidental navigation. Provides resilient UX without requiring external storage or backend writes.

## Purpose
- **Resilient UX**: No data loss on page reload
- **Offline-first**: Client-only, no server dependency
- **Zero-config**: Works automatically, no user action required
- **Privacy**: Data stays in browser, never transmitted

## Implementation

### Storage Layer
**File**: `apps/web-ui/lib/chat/store.ts`

**Database**: `os1_chat_db` (IndexedDB)  
**Object Store**: `transcripts`  
**Key**: `messages`

**API**:
```typescript
export const ChatStore = {
  save(messages: Message[]): Promise<void>;
  load(): Promise<Message[]>;
  clear(): Promise<void>;
};
```

### Message Format
```typescript
type Message = {
  role: "user" | "assistant";
  content: string;
};
```

### Integration Points

**Hydration** (on mount):
```typescript
useEffect(() => {
  ChatStore.load().then(setMessages);
}, []);
```

**Persistence** (on change):
```typescript
useEffect(() => {
  if (messages.length > 0) {
    ChatStore.save(messages);
  }
}, [messages]);
```

**Clear** (manual):
```typescript
await ChatStore.clear();
setMessages([]);
```

## User Experience

### Automatic Behavior
1. User sends message → saved to IndexedDB
2. Assistant replies → saved to IndexedDB
3. User reloads page → messages restore automatically
4. Tab crashes → messages recover on reopen

### Clear Button
- Located below Send button
- Only enabled when messages exist
- Shows confirmation dialog
- Clears both state and IndexedDB
- Cannot be undone

## Manual Testing

### Test 1: Basic Persistence
1. Open chat page: `http://localhost:4000/chat`
2. Send a message: "Hello"
3. Wait for assistant reply
4. **Reload page** (F5 or Ctrl+R)
5. **Verify**: Both messages appear immediately

### Test 2: Tab Crash Recovery
1. Send several messages
2. **Kill tab** (Task Manager or force quit)
3. Reopen `http://localhost:4000/chat`
4. **Verify**: All messages restored

### Test 3: Navigation
1. Send messages
2. Navigate to different page (e.g., home)
3. Navigate back to `/chat`
4. **Verify**: Messages still present

### Test 4: Clear Functionality
1. Send messages (have conversation)
2. Click **Clear** button
3. Confirm dialog
4. **Verify**: 
   - Messages disappear from UI
   - Reload page → no messages (truly cleared)

### Test 5: Multiple Tabs
1. Open `/chat` in Tab A
2. Send messages
3. Open `/chat` in Tab B
4. **Verify**: Tab B shows same messages
5. Send message in Tab B
6. **Verify**: Both tabs update (if page refreshed)

## DevTools Verification

### Inspect IndexedDB
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → `os1_chat_db` → `transcripts`
4. Click `messages` key
5. **Verify**: Array of message objects visible

### Console Logging
The implementation logs all operations:

**Hydration**:
```
[ChatStore] Restored 5 message(s)
```

**Persistence**:
```
[ChatStore] Saved 6 message(s)
```

**Clear**:
```
[ChatStore] Cleared all messages
```

**Errors**:
```
[ChatStore] Save failed: Error: ...
```

## Error Handling

### IndexedDB Not Available
- **Cause**: Old browser, private mode, or disabled
- **Behavior**: Silent failure, no persistence
- **Console**: Error logged but app continues
- **Fallback**: In-memory only (current session)

### Save Failures
- **Cause**: Quota exceeded, corruption, permissions
- **Behavior**: Error logged to console
- **Impact**: Messages stay in memory (work until reload)
- **Recovery**: Clear storage and try again

### Load Failures
- **Cause**: Corrupted data, schema mismatch
- **Behavior**: Returns empty array
- **Impact**: No messages loaded (fresh start)
- **Recovery**: Automatic (starts clean)

## Browser Compatibility

### Supported
✅ Chrome 24+  
✅ Firefox 16+  
✅ Safari 10+  
✅ Edge 79+

### Not Supported
❌ IE 11 (degraded gracefully)  
❌ Private/Incognito (may be restricted)

### Detection
```typescript
if (typeof window === "undefined" || !window.indexedDB) {
  // IndexedDB not available
}
```

## Performance Considerations

### Storage Size
- **Each message**: ~100-500 bytes (text only)
- **Typical conversation**: 20-50 messages = 5-25 KB
- **IndexedDB quota**: 50+ MB (varies by browser)
- **Practical limit**: Thousands of messages

### Performance Impact
- **Save**: ~5-10ms per operation
- **Load**: ~10-20ms on mount
- **Memory**: Minimal (messages already in state)
- **Overhead**: Negligible for typical use

### Optimization
- Debouncing: Not needed (state already batches)
- Throttling: Not needed (useEffect handles)
- Cleanup: Manual via Clear button

## Security Considerations

### Data Privacy
- **Local only**: Never sent to server
- **Same-origin**: Isolated by domain
- **No encryption**: Plain text in IndexedDB
- **User control**: Clear button available

### Sensitive Content
⚠️ **Warning**: IndexedDB is NOT encrypted

- Don't store passwords, API keys, or secrets
- Messages are plain text on disk
- Anyone with file system access can read
- Consider user education for sensitive topics

### Recommendations
- Add warning for sensitive conversations
- Optional: Implement client-side encryption
- Optional: Auto-clear after N days
- Optional: Session-only mode (no persistence)

## Troubleshooting

### Messages don't persist

**Possible causes**:
1. Private browsing mode
2. IndexedDB disabled
3. Quota exceeded
4. JavaScript errors

**Fix**:
1. Check browser mode (no private/incognito)
2. Check DevTools Console for errors
3. Clear browser data and retry
4. Verify IndexedDB in Application tab

### Messages restore but outdated

**Possible causes**:
1. Multiple tabs open
2. Race condition on save
3. Browser caching

**Fix**:
1. Close all tabs except one
2. Click Clear button
3. Start fresh conversation

### Clear button doesn't work

**Possible causes**:
1. Permission denied
2. Database locked
3. JavaScript error

**Fix**:
1. Check Console for errors
2. Close other tabs using same DB
3. Restart browser if needed

### Quota exceeded error

**Symptoms**:
```
[ChatStore] Save failed: QuotaExceededError
```

**Fix**:
1. Click Clear button
2. Or: DevTools → Application → Clear storage
3. Reduce conversation length (clear old)

## Future Enhancements

### Potential improvements:
1. **Encryption**: Client-side encryption for sensitive content
2. **Compression**: LZ-string for large conversations
3. **Auto-cleanup**: Delete messages older than N days
4. **Export/Import**: Download/upload transcript JSON
5. **Search**: Index and search message content
6. **Sessions**: Multiple conversation threads
7. **Sync**: Optional cloud backup (with encryption)
8. **Metadata**: Timestamps, tags, favorites

## Migration

### Schema Changes
If message format changes in future:

1. **Version bump**: Update `DB_VERSION`
2. **Migration**: Handle old format in `onupgradeneeded`
3. **Backward compat**: Load old → transform → save new
4. **Fallback**: Clear on error (safe but lossy)

### Example Migration
```typescript
request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;
  
  if (oldVersion < 2) {
    // Migrate from v1 to v2
    // Transform message format
  }
};
```

## Related Features

### Session Persistence
- **Current**: Transcript only (messages)
- **Future**: Input state, UI prefs, scroll position

### Export Feature
- **Related**: Download transcript as JSON/TXT
- **Benefit**: User-owned backup outside browser

### Cloud Sync
- **Related**: Optional backend sync
- **Benefit**: Cross-device conversations
- **Trade-off**: Privacy vs convenience

## References
- Storage module: `apps/web-ui/lib/chat/store.ts`
- Chat page: `apps/web-ui/app/chat/page.tsx`
- IndexedDB API: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- Browser compatibility: [Can I Use - IndexedDB](https://caniuse.com/indexeddb)
