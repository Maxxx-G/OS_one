import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Provider,
  ProviderRequest,
  ProviderResponse,
} from '../../../../packages/providers/src/types';
import { OpenAIResponses } from '../../../../packages/providers/src/openai_responses';
import { OllamaOpenWebUI } from '../../../../packages/providers/src/ollama_openwebui';

type ProviderKey = 'openai.responses' | 'ollama.openwebui';

type ProviderState = {
  key: ProviderKey;
  model: string;
  setKey: (k: ProviderKey) => void;
  setModel: (m: string) => void;
  directAgentMode: boolean;
  setDirectAgentMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  current: Provider;
  streamStatus: 'idle' | 'streaming' | 'done' | 'error';
  setStreamStatus: (s: ProviderState['streamStatus']) => void;
  runComplete: (
    req: ProviderRequest,
    options?: { directAgent?: boolean },
  ) => Promise<ProviderResponse>;
};

const PROVIDERS: Record<ProviderKey, Provider> = {
  'openai.responses': OpenAIResponses,
  'ollama.openwebui': OllamaOpenWebUI,
};

const STORAGE_KEYS = {
  provider: 'os1.provider.key',
  model: 'os1.provider.model',
  direct: 'os1.provider.directAgent',
} as const;

const isValidProviderKey = (value: string | null): value is ProviderKey =>
  value === 'openai.responses' || value === 'ollama.openwebui';

const readStorage = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
};

const Ctx = createContext<ProviderState | null>(null);

export const ProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [key, setKeyState] = useState<ProviderKey>('openai.responses');
  const [model, setModelState] = useState<string>('gpt-5-mini');
  const [directAgentMode, setDirectAgentModeState] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<ProviderState['streamStatus']>('idle');

  useEffect(() => {
    const storedKey = readStorage(STORAGE_KEYS.provider);
    if (isValidProviderKey(storedKey)) {
      setKeyState(storedKey);
    }
    const storedModel = readStorage(STORAGE_KEYS.model);
    if (storedModel) {
      setModelState(storedModel);
    }
    const storedDirect = readStorage(STORAGE_KEYS.direct);
    if (storedDirect === 'true' || storedDirect === 'false') {
      setDirectAgentModeState(storedDirect === 'true');
    }
  }, []);

  const setKey = useCallback((next: ProviderKey) => {
    setKeyState((prev) => {
      if (prev === next) return prev;
      writeStorage(STORAGE_KEYS.provider, next);
      return next;
    });
  }, []);

  const setModel = useCallback((next: string) => {
    setModelState(next);
    writeStorage(STORAGE_KEYS.model, next);
  }, []);

  const setDirectAgentMode = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setDirectAgentModeState((prev) => {
      const computed = typeof value === 'function' ? value(prev) : value;
      writeStorage(STORAGE_KEYS.direct, computed ? 'true' : 'false');
      return computed;
    });
  }, []);

  const current = useMemo(() => PROVIDERS[key], [key]);

  const runComplete = useCallback<ProviderState['runComplete']>(
    async (req, options) => {
      const directAgent = options?.directAgent ?? directAgentMode;
      setStreamStatus('streaming');
      try {
        const res = await current.complete({
          ...req,
          meta: {
            ...req.meta,
            model,
            providerKey: key,
            directAgent,
          },
        });
        setStreamStatus('done');
        return res;
      } catch (e) {
        setStreamStatus('error');
        return { text: '', responseId: undefined };
      }
    },
    [current, directAgentMode, key, model],
  );

  const value: ProviderState = {
    key,
    model,
    setKey,
    setModel,
    directAgentMode,
    setDirectAgentMode,
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
