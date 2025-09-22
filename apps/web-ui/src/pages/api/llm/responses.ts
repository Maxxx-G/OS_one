import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: false }, // stream-friendly
};

async function readJson(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

  const body = await readJson(req);
  const {
    prompt,
    system,
    model = body?.meta?.model || 'gpt-5-mini',
    reasoningEffort = 'low',
    toolChoice = 'none',
    toolBudget = 0,
    thread = { store: false, previousId: null },
    stream = true
  } = body || {};

  const payload: any = {
    model,
    input: prompt ?? '',
    instructions: system ?? undefined,
    reasoning: { effort: reasoningEffort },
    tool_choice: toolChoice === 'none' ? 'none' : toolChoice,
    // tools: [...], // add when you wire tools
    store: !!thread?.store,
    previous_response_id: thread?.previousId ?? undefined,
    // shape minimal output for now
  };

  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...payload, stream })
  });

  if (!stream) {
    const json = await upstream.json();
    return res.status(upstream.status).json(json);
  }

  // SSE passthrough
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked'
  });

  const reader = (upstream.body as any).getReader();
  const encoder = new TextEncoder();
  try {
    // naive passthrough of upstream bytes (which are already SSE)
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(e) })}\n\n`);
  } finally {
    res.end();
  }
}
