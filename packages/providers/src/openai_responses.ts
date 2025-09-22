import type { Provider, ProviderRequest, ProviderResponse, StreamChunk } from './types';

async function postJSON(url: string, body: any) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Proxy error: ${r.status}`);
  return r;
}

export const OpenAIResponses: Provider = {
  name: 'openai.responses',
  async *stream(req: ProviderRequest): AsyncIterable<StreamChunk> {
    const r = await postJSON('/api/llm/responses', { ...req, stream: true });
    const reader = (r.body as any).getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines (very light)
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';
      for (const evt of parts) {
        const line = evt.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') {
          yield { type: 'event', data: 'done' };
          return;
        }
        try {
          const obj = JSON.parse(payload);
          // Shape a minimal text delta if present
          const txt = obj?.output_text ?? obj?.text ?? obj?.delta ?? '';
          if (txt) yield { type: 'text', data: txt };
          else yield { type: 'event', data: obj };
        } catch {
          // ignore parse errors
        }
      }
    }
  },
  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const r = await postJSON('/api/llm/responses', { ...req, stream: false });
    const j = await r.json();
    // Normalise: prefer unified 'output_text' if available
    const text = j?.output_text ?? j?.output?.[0]?.content?.[0]?.text?.value ?? j?.text ?? '';
    return { text, responseId: j?.id, usage: j?.usage };
  },
};
