// ────────────────────────────────────────────────────────────
// Voice Phase 3 Final v2025.10.07 — Verified Stable Build
// ────────────────────────────────────────────────────────────

export const runtime = 'edge';

type ReasonOk = { ok: true; thought: string; reply: string };
type ReasonErr = { ok: false; error: string };

type ReasonBody = ReasonOk | ReasonErr;

const JSON_HEADERS = { 'content-type': 'application/json' } as const;

function env() {
  return {
    base: (process.env.OLLAMA_BASE || process.env.OPENWEBUI_BASE || '').trim(),
    model: (process.env.DEEPSEEK_MODEL || 'deepseek-r1:8b').trim(),
  };
}

function trimBase(url: string) {
  return url.replace(/\/+$/, '');
}

async function callLocalLLM(base: string, model: string, prompt: string) {
  const endpoint = `${trimBase(base)}/api/generate`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    return { status: 502, body: { ok: false, error: 'llm_bad_gateway' } as ReasonBody };
  }

  const data: Record<string, unknown> = await res.json().catch(() => ({}));
  // Normalize common local surfaces using nullish coalescing
  const text: string =
    (typeof data.response === 'string' ? data.response : null) ??
    (typeof data.message === 'string' ? data.message : null) ??
    (typeof data.text === 'string' ? data.text : null) ??
    '';

  const cleaned = text.trim();
  if (!cleaned) {
    return { status: 200, body: { ok: true, thought: '', reply: '' } as ReasonBody };
  }

  const thinkMatch = cleaned.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const thought = thinkMatch[1].trim();
    const reply = cleaned.replace(thinkMatch[0], '').trim();
    return { status: 200, body: { ok: true, thought, reply } as ReasonBody };
  }

  const [firstLine, ...rest] = cleaned.split(/\r?\n/);
  const reply = rest.join('\n').trim() || firstLine;
  return {
    status: 200,
    body: { ok: true, thought: firstLine || '', reply } as ReasonBody,
  };
}

function jsonResponse(status: number, body: ReasonBody) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const transcript = typeof payload?.transcript === 'string' ? payload.transcript.trim() : '';
  const intent = typeof payload?.intent === 'string' ? payload.intent : 'unknown';
  const conversationContext = typeof payload?.conversation_context === 'string' ? payload.conversation_context : '';

  if (!transcript) {
    return jsonResponse(400, { ok: false, error: 'bad_request' });
  }

  const { base, model } = env();
  if (!base) {
    return jsonResponse(503, { ok: false, error: 'llm_unavailable' });
  }

  let prompt =
    `You are a concise assistant operating inside a voice reasoning loop.\n`;
  
  // Include conversation context if available
  if (conversationContext) {
    prompt += `Recent conversation context:\n${conversationContext}\n\n`;
  }
  
  prompt +=
    `The user's last transcript was: "${transcript}".\n` +
    `Detected intent: ${intent}.\n` +
    `Think briefly, then answer in one short paragraph. If a command is detected, acknowledge and ask to confirm.`;

  try {
    const result = await callLocalLLM(base, model, prompt);
    return jsonResponse(result.status, result.body);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unknown_error';
    console.error('[voice/reason] LLM call failed:', errorMsg);
    return jsonResponse(502, { ok: false, error: 'reason_transport_error' });
  }
}
