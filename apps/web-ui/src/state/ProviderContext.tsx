import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Provider, ProviderRequest, ProviderResponse } from '../../../../packages/providers/src/types';
import { OpenAIResponses } from '../../../../packages/providers/src/openai_responses';
import { OllamaOpenWebUI } from '../../../../packages/providers/src/ollama_openwebui';

type ProviderKey = 'openai.responses' | 'ollama.openwebui';

const PROVIDERS: Record<ProviderKey, Provider> = {
  'openai.responses': OpenAIResponses,
  'ollama.openwebui': OllamaOpenWebUI,
};

type ProviderState = {
  key: ProviderKey;
  model: string;
  setKey: (k: ProviderKey) => void;
  setModel: (m: string) => void;
  current: Provider;
  streamStatus: 'idle' | 'streaming' | 'done' | 'error';
  setStreamStatus: (s: ProviderState['streamStatus']) => void;
  runComplete: (req: ProviderRequest) => Promise<ProviderResponse>;
};

const Ctx = createContext<ProviderState | null>(null);

export const ProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [key, setKey] = useState<ProviderKey>('openai.responses');
  const [model, setModel] = useState<string>('gpt-5-mini'); // placeholder
  const [streamStatus, setStreamStatus] = useState<ProviderState['streamStatus']>('idle');

  const current = useMemo(() => PROVIDERS[key], [key]);

  const runComplete = async (req: ProviderRequest): Promise<ProviderResponse> => {
    setStreamStatus('streaming');
    try {
      const res = await current.complete({ ...req, meta: { model } });
      setStreamStatus('done');
      return res;
    } catch (e) {
      setStreamStatus('error');
      return { text: '', responseId: undefined };
    }
  };

  const value: ProviderState = {
    key,
    model,
    setKey,
    setModel,
    current,
    streamStatus,
    setStreamStatus,
    runComplete,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useProvider = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ProviderContext missing');
  return ctx;
};
