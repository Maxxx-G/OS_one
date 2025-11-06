/**
 * Voice Health Check Endpoint
 * Phase 4: OS1Voice unification + healthcheck
 * 
 * Verifies LLM and TTS endpoint reachability
 */

export const runtime = 'edge';

async function checkEndpoint(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const ollamaBase = process.env.OLLAMA_BASE || '';
  const openWebUiBase = process.env.OPENWEBUI_BASE || '';
  const archonUrl = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

  // Prefer OLLAMA_BASE, fallback to OPENWEBUI_BASE
  const llmBase = ollamaBase || openWebUiBase;
  
  // Check LLM reachability (Ollama or Open-WebUI)
  const llmOk = llmBase
    ? await checkEndpoint(`${llmBase.replace(/\/+$/, '')}/api/version`)
    : false;

  // Check TTS stream endpoint
  const ttsOk = archonUrl
    ? await checkEndpoint(`${archonUrl}/v1/audio/status`)
    : false;

  return new Response(
    JSON.stringify({
      ok: true,
      llmOk,
      ttsOk,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  );
}
