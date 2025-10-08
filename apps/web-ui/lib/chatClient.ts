export type ChatPayload = {
  text: string;
};

export type ChatReply = {
  id: string;
  role: 'assistant';
  text: string;
  ts: string;
  provider?: string;
};

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const ARCHON_CHAT_PATH = process.env.NEXT_PUBLIC_ARCHON_CHAT_PATH || '/v1/chat';
const ARCHON_STREAM_PATH = process.env.NEXT_PUBLIC_ARCHON_STREAM_PATH || '/v1/chat/stream';
const HISTORY_LIMIT = 50;

function flattenContent(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => flattenContent(item)).join('');
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('text' in obj) {
      const textResult = flattenContent(obj.text);
      if (textResult) {
        return textResult;
      }
    }

    if ('content' in obj) {
      const contentResult = flattenContent(obj.content);
      if (contentResult) {
        return contentResult;
      }
    }

    if ('delta' in obj) {
      const deltaResult = flattenContent(obj.delta);
      if (deltaResult) {
        return deltaResult;
      }
    }

    if ('output' in obj) {
      const outputResult = flattenContent(obj.output);
      if (outputResult) {
        return outputResult;
      }
    }

    if ('value' in obj) {
      const valueResult = flattenContent(obj.value);
      if (valueResult) {
        return valueResult;
      }
    }
  }

  return '';
}

function pickText(source: unknown): string {
  if (!source) {
    return '';
  }

  if (typeof source === 'string') {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map((entry) => pickText(entry)).join('');
  }

  if (typeof source === 'object') {
    const obj = source as Record<string, unknown>;

    const choices = obj.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const first = choices[0] as Record<string, unknown>;

      if (first.message) {
        const messageContent = (first.message as Record<string, unknown>).content;
        const text = pickText(messageContent);
        if (text) {
          return text;
        }
      }

      if (first.delta) {
        const deltaText = pickText(first.delta);
        if (deltaText) {
          return deltaText;
        }
      }

      if (first.content) {
        const choiceContent = pickText(first.content);
        if (choiceContent) {
          return choiceContent;
        }
      }
    }

    if (obj.delta) {
      const deltaText = pickText(obj.delta);
      if (deltaText) {
        return deltaText;
      }
    }

    if (obj.content) {
      const contentText = pickText(obj.content);
      if (contentText) {
        return contentText;
      }
    }

    const textFields = ['text', 'output', 'response', 'message', 'completion'];
    for (const field of textFields) {
      if (field in obj) {
        const fieldText = flattenContent(obj[field]);
        if (fieldText) {
          return fieldText;
        }
      }
    }
  }

  return '';
}

function pickProvider(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const obj = source as Record<string, unknown>;
  const direct = obj.provider ?? obj.model_provider ?? obj.modelProvider ?? obj.model;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  const meta = obj.meta;
  if (meta && typeof meta === 'object') {
    const metaProvider = (meta as Record<string, unknown>).provider;
    if (typeof metaProvider === 'string' && metaProvider.trim()) {
      return metaProvider.trim();
    }
  }

  return undefined;
}

function pickId(source: unknown): string {
  if (source && typeof source === 'object') {
    const obj = source as Record<string, unknown>;
    if (typeof obj.id === 'string' && obj.id.trim()) {
      return obj.id.trim();
    }
  }

  return crypto.randomUUID();
}

function readTs(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const obj = source as Record<string, unknown>;
  const candidates = ['ts', 'timestamp', 'created_at', 'createdAt', 'updated_at', 'updatedAt'];
  for (const key of candidates) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const meta = obj.meta;
  if (meta && typeof meta === 'object') {
    const metaTs = readTs(meta);
    if (metaTs) {
      return metaTs;
    }
  }

  return undefined;
}

function pickTs(source: unknown): string {
  return readTs(source) ?? new Date().toISOString();
}

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function sendViaArchon(payload: ChatPayload): Promise<ChatReply> {
  const url = `${ARCHON_URL}${ARCHON_CHAT_PATH}`;
  const data = await postJSON(url, payload);

  const text = pickText(data) || '<?>';

  return {
    id: pickId(data),
    role: 'assistant',
    text,
    ts: pickTs(data),
    provider: pickProvider(data),
  };
}

export async function sendViaLocalEcho(payload: ChatPayload): Promise<ChatReply> {
  const data = await postJSON('/api/echo', payload);

  const text = pickText(data);

  return {
    id: data.id ?? crypto.randomUUID(),
    role: 'assistant',
    text: text || '',
    ts: pickTs(data),
    provider: 'local',
  };
}

export async function sendChat(
  payload: ChatPayload,
): Promise<{ reply: ChatReply; transport: 'archon' | 'local' }> {
  try {
    const reply = await sendViaArchon(payload);
    return { reply, transport: 'archon' };
  } catch {
    const reply = await sendViaLocalEcho(payload);
    return { reply, transport: 'local' };
  }
}

export function pruneHistory<T>(items: T[]): T[] {
  if (items.length <= HISTORY_LIMIT) {
    return items;
  }

  return items.slice(-HISTORY_LIMIT);
}

export type StreamChunk = {
  text?: string;
  done?: boolean;
  id?: string;
  ts?: string;
  provider?: string;
  transport?: 'archon' | 'local';
};

export type StreamOptions = {
  signal?: AbortSignal;
};

const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }

  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError',
  );
};

function isDoneSignal(source: Record<string, unknown>): boolean {
  if (source.done === true) {
    return true;
  }

  const event = source.event;
  if (
    event === 'end' ||
    event === 'message_stop' ||
    event === 'message_completed' ||
    event === 'completed'
  ) {
    return true;
  }

  const finish = (source.finish_reason ?? source.finishReason) as unknown;
  if (typeof finish === 'string' && finish && finish !== 'null') {
    return true;
  }

  const choices = source.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>;
    const choiceFinish = (first.finish_reason ?? first.finishReason) as unknown;
    if (typeof choiceFinish === 'string' && choiceFinish && choiceFinish !== 'in_progress') {
      return true;
    }
  }

  return false;
}

function normalizeStreamChunk(raw: unknown, transport?: 'archon' | 'local'): StreamChunk | null {
  if (!raw || typeof raw !== 'object') {
    if (transport) {
      return { transport };
    }
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const chunk: StreamChunk = {};

  const text = pickText(obj);
  if (text) {
    chunk.text = text;
  }

  const provider = pickProvider(obj);
  if (provider) {
    chunk.provider = provider;
  }

  const id = obj.id;
  if (typeof id === 'string' && id.trim()) {
    chunk.id = id.trim();
  }

  const ts = readTs(obj);
  if (ts) {
    chunk.ts = ts;
  }

  if (isDoneSignal(obj)) {
    chunk.done = true;
  }

  if (transport) {
    chunk.transport = transport;
  }

  if (chunk.text || chunk.done || chunk.provider || chunk.id || chunk.ts || chunk.transport) {
    return chunk;
  }

  return null;
}

export async function* streamChat(
  payload: ChatPayload,
  options: StreamOptions = {},
): AsyncGenerator<StreamChunk> {
  const { signal } = options;

  const withSignal = (init: RequestInit = {}): RequestInit => ({
    ...init,
    signal,
  });

  try {
    const res = await fetch(
      `${ARCHON_URL}${ARCHON_STREAM_PATH}`,
      withSignal({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'text/event-stream',
        },
        body: JSON.stringify(payload),
      }),
    );

    if (!res.ok || !res.body) {
      throw new Error(`ARCHON stream ${res.status}`);
    }

    yield { transport: 'archon' } as StreamChunk;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        for (const line of rawEvent.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) {
            continue;
          }

          const payloadStr = trimmed.slice(5).trim();
          if (!payloadStr) {
            continue;
          }

          if (payloadStr === '[DONE]' || payloadStr === '[done]') {
            yield { done: true, transport: 'archon' } as StreamChunk;
            continue;
          }

          try {
            const parsed = JSON.parse(payloadStr);
            const chunk = normalizeStreamChunk(parsed, 'archon');
            if (chunk) {
              yield chunk;
            }
          } catch {
            // ignore malformed SSE chunk
          }
        }

        boundary = buffer.indexOf('\n\n');
      }
    }

    buffer += decoder.decode();

    if (buffer) {
      for (const rawEvent of buffer.split('\n\n')) {
        if (!rawEvent) {
          continue;
        }

        for (const line of rawEvent.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) {
            continue;
          }

          const payloadStr = trimmed.slice(5).trim();
          if (!payloadStr) {
            continue;
          }

          if (payloadStr === '[DONE]' || payloadStr === '[done]') {
            yield { done: true, transport: 'archon' } as StreamChunk;
            continue;
          }

          try {
            const parsed = JSON.parse(payloadStr);
            const chunk = normalizeStreamChunk(parsed, 'archon');
            if (chunk) {
              yield chunk;
            }
          } catch {
            // ignore trailing malformed data
          }
        }
      }
    }

    yield { done: true, transport: 'archon' } as StreamChunk;
    return;
  } catch (error) {
    if (signal?.aborted || isAbortError(error)) {
      throw error;
    }
    // fall through to local fallback
  }

  const res = await fetch(
    '/api/echo-stream',
    withSignal({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );

  if (!res.ok || !res.body) {
    throw new Error(`Local stream ${res.status}`);
  }

  yield { transport: 'local', provider: 'local' } as StreamChunk;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (line) {
        if (line === '[DONE]' || line === '[done]') {
          yield { done: true, transport: 'local', provider: 'local' } as StreamChunk;
        } else {
          try {
            const parsed = JSON.parse(line);
            const chunk = normalizeStreamChunk(parsed, 'local') ?? {
              transport: 'local',
            };
            if (!chunk.provider) {
              chunk.provider = 'local';
            }
            yield chunk;
          } catch {
            // ignore malformed NDJSON chunk
          }
        }
      }

      newlineIndex = buffer.indexOf('\n');
    }
  }

  buffer += decoder.decode();

  for (const line of buffer.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed === '[DONE]' || trimmed === '[done]') {
      yield { done: true, transport: 'local', provider: 'local' } as StreamChunk;
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed);
      const chunk = normalizeStreamChunk(parsed, 'local') ?? {
        transport: 'local',
      };
      if (!chunk.provider) {
        chunk.provider = 'local';
      }
      yield chunk;
    } catch {
      // ignore trailing malformed data
    }
  }

  yield { done: true, transport: 'local', provider: 'local' } as StreamChunk;
}
