import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

async function readJson(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.from(c));
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Prefer OLLAMA_BASE, fallback to OPENWEBUI_BASE (both server-side)
  const base = process.env.OLLAMA_BASE || process.env.OPENWEBUI_BASE;
  if (!base) return res.status(500).json({ error: 'OLLAMA_BASE/OPENWEBUI_BASE missing' });

  const body = await readJson(req);
  const { model = body?.meta?.model || 'llama3', prompt = '', stream = true } = body || {};

  // Normalize to Ollama generate endpoint (works with Open-WebUI's compatibility layer)
  const url = `${base.replace(/\/+$/, '')}/api/generate`;
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream }),
  });

  if (!stream) {
    const json = await upstream.json();
    // shape to a common form
    return res.status(upstream.status).json({ text: json?.response ?? '' });
  }

  // Stream newline-delimited JSON → SSE to client
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Transfer-Encoding': 'chunked',
  });

  const reader = (upstream.body as any).getReader();
  const decoder = new TextDecoder();
  let buf = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // Ollama sends \n-delimited JSON chunks
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          const txt = obj?.response ?? '';
          if (txt) res.write(`data: ${JSON.stringify({ delta: txt })}\n\n`);
          if (obj?.done) {
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }
        } catch {
          /* ignore parse errors */
        }
      }
    }
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(e) })}\n\n`);
  } finally {
    res.end();
  }
}
