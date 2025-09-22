import { useState, useCallback } from 'react';
import type { ProviderRequest } from '../../../../packages/providers/src';
import { useProvider } from '../state/ProviderContext';

export const useChatRun = () => {
  const { runComplete } = useProvider();
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (prompt: string) => {
    if (busy) return output;
    setBusy(true);
    try {
      const req: ProviderRequest = {
        prompt,
        reasoningEffort: 'low',
        toolChoice: 'none',
        toolBudget: 0,
        thread: { store: false, previousId: null },
      };
      const text = await runComplete(req);
      setOutput(text);
      return text;
    } finally {
      setBusy(false);
    }
  }, [busy, output, runComplete]);

  return { output, run, busy };
};
