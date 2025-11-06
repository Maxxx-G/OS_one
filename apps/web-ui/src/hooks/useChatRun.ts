import { useState, useCallback } from 'react';
import { redactText } from '../lib/redact';
import type { ProviderRequest } from '../../../../packages/providers/src';
import { useProvider } from '../state/ProviderContext';
import { store } from '../../../../packages/session/src';
import type { Message } from '../../../../packages/session/src';

const measureNow = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

export const useChatRun = () => {
  const { runComplete, directAgentMode, key, model } = useProvider();
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  const THREAD_ID = 'default'; // TODO: per-tab/per-convo id

  const buildRequest = useCallback(
    (prompt: string, options?: { store?: boolean }) => {
      const redactionEnabled = process.env.NEXT_PUBLIC_OS1_REDACT !== 'off';
      const payloadPrompt = redactionEnabled ? redactText(prompt).text : prompt;
      const request: ProviderRequest = {
        prompt: payloadPrompt,
        reasoningEffort: 'low',
        toolChoice: 'none',
        toolBudget: 0,
        thread: { store: options?.store ?? true, previousId: null },
        meta: { directAgent: directAgentMode },
      };
      return { request, payload: payloadPrompt };
    },
    [directAgentMode],
  );

  const run = useCallback(
    async (prompt: string) => {
      if (busy) return output;
      setBusy(true);
      try {
        const { request, payload } = buildRequest(prompt, { store: true });
        const res = await runComplete(request, { directAgent: directAgentMode });
        const text = res.text ?? '';
        setOutput(text);

        // persist both turns
        const now = Date.now();
        const userMsg: Message = {
          id: `m_${now}_u`,
          role: 'user',
          text: payload,
          createdAt: now,
          provider: key,
          model,
        };
        const asstMsg: Message = {
          id: `m_${now}_a`,
          role: 'assistant',
          text,
          responseId: res.responseId,
          createdAt: now + 1,
          provider: key,
          model,
        };
        store.appendMessage(THREAD_ID, userMsg);
        store.appendMessage(THREAD_ID, asstMsg);

        return text;
      } finally {
        setBusy(false);
      }
    },
    [busy, output, buildRequest, runComplete, directAgentMode, key, model],
  );

  const runQuickTest = useCallback(async () => {
    const { request } = buildRequest('hello', { store: false });
    const start = measureNow();
    try {
      const res = await runComplete(request, { directAgent: directAgentMode });
      const latency = Math.round(measureNow() - start);
      const ok = Boolean((res.text ?? '').trim().length || res.responseId);
      return {
        ok,
        latencyMs: latency,
        mode: directAgentMode ? 'direct' : 'mediated',
        provider: key,
        model,
      };
    } catch (error) {
      const latency = Math.round(measureNow() - start);
      return {
        ok: false,
        latencyMs: latency,
        mode: directAgentMode ? 'direct' : 'mediated',
        provider: key,
        model,
      };
    }
  }, [buildRequest, directAgentMode, key, model, runComplete]);

  return { output, run, busy, runQuickTest };
};
