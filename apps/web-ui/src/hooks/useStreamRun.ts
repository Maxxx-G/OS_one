import { useCallback, useState } from 'react';
import { useProvider } from '../state/ProviderContext';
import type { ProviderRequest } from '../../../../packages/providers/src';

export const useStreamRun = () => {
  const { current, setStreamStatus, model } = useProvider();
  const [text, setText] = useState('');

  const runStream = useCallback(
    async (prompt: string) => {
      setText('');
      setStreamStatus('streaming');
      const req: ProviderRequest = {
        prompt,
        reasoningEffort: 'low',
        toolChoice: 'none',
        toolBudget: 0,
        thread: { store: false, previousId: null },
        meta: { model },
      };
      try {
        for await (const chunk of current.stream(req)) {
          if (chunk.type === 'text') setText((prev) => prev + String(chunk.data));
        }
        setStreamStatus('done');
      } catch {
        setStreamStatus('error');
      }
      return text;
    },
    [current, model, setStreamStatus, text],
  );

  return { text, runStream };
};
