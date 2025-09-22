import { useState, useCallback } from 'react';
import type { ProviderRequest } from '../../../../packages/providers/src';
import { useProvider } from '../state/ProviderContext';
import { store } from '../../../../packages/session/src';
import type { Message } from '../../../../packages/session/src';

export const useChatRun = () => {
  const { runComplete } = useProvider();
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  const THREAD_ID = 'default'; // TODO: per-tab/per-convo id
  const run = useCallback(async (prompt: string) => {
    if (busy) return output;
    setBusy(true);
    try {
      const req: ProviderRequest = {
        prompt,
        reasoningEffort: 'low',
        toolChoice: 'none',
        toolBudget: 0,
        thread: { store: true, previousId: null },
      };
      const res = await runComplete(req);
      const text = res.text ?? '';
      setOutput(text);

      // persist both turns
      const now = Date.now();
      const userMsg: Message = { id: `m_${now}_u`, role: 'user', text: prompt, createdAt: now };
      const asstMsg: Message = {
        id: `m_${now}_a`,
        role: 'assistant',
        text,
        responseId: res.responseId,
        createdAt: now + 1,
      };
      store.appendMessage(THREAD_ID, userMsg);
      store.appendMessage(THREAD_ID, asstMsg);

      return text;
    } finally {
      setBusy(false);
    }
  }, [busy, output, runComplete]);

  return { output, run, busy };
};
