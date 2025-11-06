# TTS Streaming Debug Runbook

**Version**: 2025.10.07  
**Context**: Voice Phase 4 Stream Audit — fixing TTS streaming decode errors with proper headers, buffering, and fallback mechanisms.

---

## 1. Quick Audit

Run the automated verification script:

```powershell
npm run verify:stream
```

**Expected Output**:
- Git audit shows recent changes to `ChatSequencer.tsx`, `/api/tts/route.ts`
- TTS stream endpoint returns `Content-Type: audio/*` (e.g., `audio/mpeg`)
- Response includes `Transfer-Encoding: chunked` or `Content-Length` header
- Response includes `Connection: keep-alive` (for HTTP/1.1)

**What This Checks**:
- Confirms streaming headers are set correctly by Archon backend
- Validates that file changes match expected audit trail
- Ensures dev server is running on `localhost:4000`

---

## 2. UI Fallback Path

The `ChatSequencer.tsx` component implements a two-tier playback strategy:

### Primary Path: `/v1/audio/tts/stream` (Feature-Flagged)
```typescript
const speakStream = async (text: string) => {
  // 1. Fetch streaming endpoint
  // 2. Read chunks with ReadableStream reader
  // 3. Buffer as BlobPart[] array
  // 4. Create Blob → Audio element → play
  // 5. Clean up with URL.revokeObjectURL
};
```

**Activation**: Set `NEXT_PUBLIC_TTS_STREAM=1` in `.env.local`

### Fallback Path: `/v1/audio/tts` (Always Available)
If the primary stream fails (network error, 404, decode error), the code automatically falls back to:

```typescript
catch (err) {
  const fallbackRes = await fetch(`${AURL}/v1/audio/tts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice_id }),
  });
  // Play entire audio blob
}
```

**Behavior**: The UI gracefully degrades to non-streaming TTS without user intervention.

---

## 3. Common Failure Modes

### 3.1 JSON Decode on Binary Stream
**Symptom**: `SyntaxError: Unexpected token in JSON at position 0`

**Cause**: Code attempts `await response.json()` on audio stream instead of `response.body.getReader()`.

**Fix**: Always use `ReadableStream` reader for `/stream` endpoints:
```typescript
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}
```

---

### 3.2 Premature Stream Close
**Symptom**: Audio cuts off mid-sentence or playback never starts.

**Cause**: Missing `Connection: keep-alive` header or server timeout.

**Fix**: Ensure backend returns:
```
Connection: keep-alive
Transfer-Encoding: chunked
```

**Verify** with PowerShell:
```powershell
$res = Invoke-WebRequest -Uri http://localhost:7700/v1/audio/tts/stream -Method POST -ContentType "application/json" -Body '{"text":"test"}' -UseBasicParsing
$res.Headers['Connection']
$res.Headers['Transfer-Encoding']
```

---

### 3.3 Wrong MIME Type
**Symptom**: Browser refuses to play audio or throws `DOMException`.

**Cause**: `Content-Type` header is `application/octet-stream` instead of `audio/mpeg`.

**Fix**: Set explicit MIME type in `/api/tts/route.ts`:
```typescript
headers.set('Content-Type', 'audio/mpeg');
```

**Verify** Blob type:
```typescript
console.log('Blob MIME:', blob.type); // Should be 'audio/mpeg'
```

---

### 3.4 TypeScript Type Mismatch
**Symptom**: `Type 'Uint8Array[]' is not assignable to type 'BlobPart[]'`

**Cause**: `Blob` constructor expects `BlobPart[]` (union type including `Uint8Array`, `string`, `Blob`).

**Fix**: Declare chunks array as `BlobPart[]`:
```typescript
const chunks: BlobPart[] = [];  // ✅ Correct
const chunks: Uint8Array[] = []; // ❌ TypeScript error
```

---

## 4. Next Checks

If automated audit passes but audio still fails:

### 4.1 Verify Chunk Types
Add debug logging in `speakStream`:
```typescript
const { done, value } = await reader.read();
console.log('[speakStream] chunk type:', value?.constructor.name, 'size:', value?.byteLength);
```

**Expected**: `Uint8Array` chunks with `byteLength > 0`

---

### 4.2 Probe Total Audio Size
```typescript
const blob = new Blob(chunks, { type: 'audio/mpeg' });
console.log('[speakStream] total blob size:', blob.size, 'bytes');
```

**Expected**: Size > 1KB for typical TTS output (1-5 seconds of speech)

**If < 100 bytes**: Backend may be returning error JSON instead of audio.

---

### 4.3 Network Tab Inspection (Browser DevTools)
1. Open DevTools → Network tab
2. Filter: `tts`
3. Play audio in UI
4. Check `/v1/audio/tts/stream` request:
   - **Status**: 200 OK
   - **Type**: `audio/mpeg` or similar
   - **Size**: Several KB (not 0 bytes)
   - **Timing**: `Transfer-Encoding: chunked` shows progressive download

**Red Flags**:
- Status 500 or 404 → Backend not reachable
- Type `application/json` → Returning error instead of audio
- Size 0 bytes → Empty stream

---

## 5. Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_ARCHON_URL=http://localhost:7700
NEXT_PUBLIC_TTS_STREAM=1          # Enable streaming (optional, fallback available)
NEXT_PUBLIC_VOICE_LOOP=1          # Enable voice loop
NEXT_PUBLIC_DEVHUD=1              # Show diagnostic overlay (development only)
```

**Reload dev server** after changing `.env.local`:
```powershell
npm run dev
```

---

## 6. Archon Backend Verification

If UI fallback works but streaming doesn't, verify Archon itself:

```powershell
# Test non-streaming endpoint (should always work)
curl -X POST http://localhost:7700/v1/audio/tts -H "Content-Type: application/json" -d "{\"text\":\"test\"}" --output test.mp3

# Test streaming endpoint
curl -X POST http://localhost:7700/v1/audio/tts/stream -H "Content-Type: application/json" -d "{\"text\":\"test\"}" --output test_stream.mp3
```

**Expected**: Both files should be valid MP3 audio (playable in media player).

**If streaming endpoint returns JSON error**: Archon may not support `/stream` variant. Verify Archon API docs or use fallback only.

---

## 7. Success Criteria

✅ `npm run verify:stream` passes all checks  
✅ UI plays TTS audio with `NEXT_PUBLIC_TTS_STREAM=1`  
✅ UI gracefully falls back if streaming fails  
✅ No console errors in browser DevTools  
✅ Audio playback smooth (no cuts/gaps)  

---

## 8. Related Files

- `apps/web-ui/components/ChatSequencer.tsx` - Client-side streaming implementation with fallback
- `apps/web-ui/app/api/tts/route.ts` - Next.js Edge API proxy to Archon
- `ops/verify_stream_stack.ps1` - Automated audit script
- `docs/AUDIO_TTS_STREAM.md` - TTS streaming architecture docs (if exists)

---

**Last Updated**: 2025.10.07  
**Owner**: Voice Phase 4 Stream Audit Task
