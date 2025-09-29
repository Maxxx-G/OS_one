import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
const REDACT_HDR = { 'x-os1-redacted': 'true' };

export const config = { api: { bodyParser: false } };

async function readJson(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.from(c));
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function hmacHex(secret: string, body: any) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body || {}))
    .digest('hex');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await readJson(req);

  const LIVE_BASE = process.env.LIVE_BASE;
  const OS1_HMAC_SECRET = process.env.OS1_HMAC_SECRET || '';
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  const stream = !!body?.stream;

  // Path A: OS One Live Router (if configured)
  if (LIVE_BASE && OS1_HMAC_SECRET) {
    const endpoint = stream ? '/v1/router/stream' : '/v1/router/complete';
    const sig = hmacHex(OS1_HMAC_SECRET, body);
    const upstream = await fetch(`${LIVE_BASE.replace(/\/+$/, '')}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-os1-signature': sig, ...REDACT_HDR },
      body: JSON.stringify(body),
    });

    if (!stream) {
      const j = await upstream.json().catch(() => ({}));
      return res.status(upstream.status || 200).json(j);
    }

    // SSE passthrough
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
    });
    const reader = (upstream.body as any).getReader?.();
    if (!reader) return res.end();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    return res.end();
  }

  // Path B: OpenAI Responses fallback (existing behavior)
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

  const {
    prompt = '',
    system,
    meta = {},
    reasoningEffort = 'low',
    toolChoice = 'none',
  } = body || {};
  const model = meta?.model || 'gpt-5-mini';

  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      ...REDACT_HDR,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      instructions: system,
      reasoning: { effort: reasoningEffort },
      tool_choice: toolChoice === 'none' ? 'none' : toolChoice,
      stream,
    }),
  });

  if (!stream) {
    const j: any = await upstream.json().catch(() => ({}));
    const text =
      j?.output_text ??
      j?.output?.[0]?.content?.[0]?.text?.value ??
      j?.content?.[0]?.text?.value ??
      '';
    return res
      .status(upstream.status || 200)
      .json({ text, provider: 'openai.responses', id: j?.id, usage: j?.usage });
  }

  // SSE passthrough for OpenAI
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Transfer-Encoding': 'chunked',
  });
  const reader = (upstream.body as any).getReader?.();
  if (!reader) return res.end();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
