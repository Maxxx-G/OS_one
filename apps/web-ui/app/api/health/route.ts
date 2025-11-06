/**
 * Aggregated Health Check Endpoint
 * Web-UI Launch Readiness v2025.10.07
 * 
 * Checks LLM, TTS, and voice endpoints for overall system health
 */

export const runtime = 'edge';

async function headCheck(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function sttProbe(base: string): Promise<boolean> {
  const b = base.replace(/\/+$/, '');
  // Try HEAD on /v1/audio/transcribe first
  try {
    const h = await fetch(`${b}/v1/audio/transcribe`, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    if (h.ok) return true;
  } catch {}
  // Fallback: OPTIONS on /v1/audio/status (less strict; presence implies path reachable)
  try {
    const o = await fetch(`${b}/v1/audio/status`, { method: 'OPTIONS', signal: AbortSignal.timeout(3000) });
    if (o.ok) return true;
  } catch {}
  return false;
}

export async function GET() {
  // Check LLM base (Ollama or Open-WebUI)
  const llmBase = (process.env.OLLAMA_BASE || process.env.OPENWEBUI_BASE || '').replace(
    /\/+$/,
    '',
  );
  const llmOk = llmBase ? await headCheck(`${llmBase}/api/version`) : false;

  // Check TTS via Live Router
  const liveBase = (process.env.NEXT_PUBLIC_LIVE_BASE || '').replace(/\/+$/, '');
  const ttsOk = liveBase ? await headCheck(`${liveBase}/v1/audio/tts/stream`) : false;
  const sttOk = liveBase ? await sttProbe(liveBase) : false;

  // Check voice health endpoint
  let voice = { llmOk: false, ttsOk: false };
  try {
    const voiceRes = await fetch('/api/voice/health');
    if (voiceRes.ok) {
      voice = await voiceRes.json();
    }
  } catch {
    // Voice health endpoint unavailable
  }

  return new Response(
    JSON.stringify({
      ok: true,
      llmOk,
  ttsOk,
  sttOk,
      voice,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  );
}
