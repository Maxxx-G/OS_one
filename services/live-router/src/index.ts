import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const HMAC_SECRET = process.env.OS1_HMAC_SECRET || '';

function verify(req: Request) {
  if (!HMAC_SECRET) return false;
  const sig = req.header('x-os1-signature') || '';
  const body = JSON.stringify(req.body || {});
  const h = crypto.createHmac('sha256', HMAC_SECRET).update(body).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig, 'hex')); } catch { return false; }
}

app.post('/v1/router/complete', async (req: Request, res: Response) => {
  if (!verify(req)) return res.status(401).json({ error: 'bad signature' });
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

  const { prompt = '', system, model = 'gpt-5-mini', reasoningEffort = 'low', toolChoice = 'none' } = req.body || {};
  const up = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: prompt, instructions: system, reasoning: { effort: reasoningEffort }, tool_choice: toolChoice })
  });
  const j: any = await up.json().catch(() => ({}));
  const text = j?.output_text ?? j?.output?.[0]?.content?.[0]?.text?.value ?? j?.content?.[0]?.text?.value ?? '';
  res.status(up.status || 200).json({ text, provider: 'openai.responses', id: j?.id, usage: j?.usage });
});

app.post('/v1/router/stream', async (req: Request, res: Response) => {
  if (!verify(req)) return res.status(401).end();
  if (!OPENAI_API_KEY) return res.status(500).end();

  const { prompt = '', system, model = 'gpt-5-mini', reasoningEffort = 'low', toolChoice = 'none' } = req.body || {};
  const up = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: prompt, instructions: system, reasoning: { effort: reasoningEffort }, tool_choice: toolChoice, stream: true })
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
  });

  const reader = (up.body as any).getReader?.();
  if (!reader) return res.end();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`OS1 Live Router on :${PORT}`));
