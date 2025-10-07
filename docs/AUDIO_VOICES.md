# Audio Voices API — v2025.10.07

## Endpoint

**GET** `/v1/audio/voices`

## Purpose

List available TTS voices from ElevenLabs provider for UI selection and diagnostics. Returns a deterministic offline stub when the API key is missing to prevent crashes.

## Request

**Method**: `GET`  
**Headers**: None required  
**Query Parameters**: None  
**Body**: None

## Response

### Success (200 OK)

**With API Key Present:**
```json
{
  "ok": true,
  "provider": "elevenlabs",
  "tts_enabled": true,
  "voices": [
    {"id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel"},
    {"id": "AZnzlk1XvdvUeBnXmlld", "name": "Domi"},
    {"id": "EXAVITQu4vr4xnSDxMaL", "name": "Bella"},
    ...
  ]
}
```

**Without API Key (Offline Stub):**
```json
{
  "ok": true,
  "provider": "elevenlabs",
  "tts_enabled": false,
  "voices": []
}
```

**Provider/Network Failure:**
```json
{
  "ok": false,
  "error": "provider_unavailable"
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | `true` if request succeeded, `false` if provider failed |
| `provider` | string | Always `"elevenlabs"` |
| `tts_enabled` | boolean | `true` if API key present and valid, `false` otherwise |
| `voices` | array | List of voice objects with `id` and `name` |
| `error` | string | Only present when `ok: false`, value is `"provider_unavailable"` |

### Voice Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | ElevenLabs voice ID (e.g., `"21m00Tcm4TlvDq8ikWAM"`) |
| `name` | string | Human-readable voice name (e.g., `"Rachel"`) |

## Behavior

### Environment Gating

- **`ELEVENLABS_API_KEY` Missing**: Returns offline stub with empty voices array
- **`ELEVENLABS_API_KEY` Present**: Fetches voices from ElevenLabs API

### Timeout

- **Connection**: 2 seconds
- **Total Request**: 5 seconds
- **On Timeout**: Returns `{ ok: false, error: "provider_unavailable" }`

### Error Handling

All errors return HTTP 200 with deterministic JSON:

```json
{
  "ok": false,
  "error": "provider_unavailable"
}
```

**Error Cases**:
- Network timeout (>5s)
- HTTP error from ElevenLabs (4xx, 5xx)
- Connection failure
- Unexpected exceptions

This ensures UI can always parse the response and handle gracefully without try/catch complexity.

## Usage Examples

### cURL (No API Key)
```bash
curl http://localhost:7700/v1/audio/voices
# Returns: {"ok":true,"provider":"elevenlabs","tts_enabled":false,"voices":[]}
```

### cURL (With API Key)
```bash
export ELEVENLABS_API_KEY="sk_xxxxx"
curl http://localhost:7700/v1/audio/voices
# Returns: {"ok":true,"provider":"elevenlabs","tts_enabled":true,"voices":[{...}]}
```

### TypeScript (Next.js Client)
```typescript
async function loadVoices() {
  const response = await fetch('/v1/audio/voices');
  const data = await response.json();
  
  if (!data.ok) {
    console.warn('Voice provider unavailable');
    return [];
  }
  
  if (!data.tts_enabled) {
    console.info('TTS disabled (no API key)');
    return [];
  }
  
  return data.voices; // [{id, name}, ...]
}
```

### Python (Direct Call)
```python
import httpx

async def fetch_voices():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:7700/v1/audio/voices")
        data = response.json()
        
        if not data["ok"]:
            return []
        
        return data["voices"]
```

## Integration

### UI Voice Selector

```tsx
import { useState, useEffect } from 'react';

function VoiceSelector() {
  const [voices, setVoices] = useState([]);
  
  useEffect(() => {
    fetch('/v1/audio/voices')
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.tts_enabled) {
          setVoices(data.voices);
        }
      })
      .catch(console.error);
  }, []);
  
  return (
    <select>
      {voices.map(v => (
        <option key={v.id} value={v.id}>{v.name}</option>
      ))}
    </select>
  );
}
```

### Health Check

```typescript
async function checkVoicesHealth() {
  const response = await fetch('/v1/audio/voices');
  const data = await response.json();
  
  return {
    available: data.ok,
    enabled: data.tts_enabled,
    count: data.voices?.length || 0,
  };
}
```

## Dependencies

- **httpx**: HTTP client with async support (already in project)
- **ELEVENLABS_API_KEY**: Environment variable (optional)

## Testing

### Offline Stub Test
```bash
# No API key set
python -c "import httpx; r = httpx.get('http://localhost:7700/v1/audio/voices'); print(r.json())"
# Expected: {"ok":true,"provider":"elevenlabs","tts_enabled":false,"voices":[]}
```

### Online Test
```bash
# With API key
export ELEVENLABS_API_KEY="sk_xxxxx"
python -c "import httpx; r = httpx.get('http://localhost:7700/v1/audio/voices'); print(r.json())"
# Expected: {"ok":true,"provider":"elevenlabs","tts_enabled":true,"voices":[...]}
```

### Compilation Test
```bash
python -m compileall integrations/archon/python/routers/audio_voices.py
# Expected: No errors
```

## Constraints

- ✅ No external calls when `ELEVENLABS_API_KEY` is missing
- ✅ Deterministic offline stub (always same structure)
- ✅ 5-second timeout prevents hanging
- ✅ HTTP 200 for all responses (errors as JSON, not HTTP status)
- ✅ Windows/CRLF safe (pure Python, no shell scripts)
- ✅ No new Python dependencies (uses existing httpx)

## Rollback

```bash
# Delete new router
rm integrations/archon/python/routers/audio_voices.py

# Revert app.py changes
git checkout HEAD~1 -- integrations/archon/python/app.py

# Remove documentation
rm docs/AUDIO_VOICES.md
```

## Version & Archive

- **Version**: v2025.10.07
- **Supersedes**: N/A (initial implementation)
- **Archive**: Move to `docs/_archive/` when superseded
