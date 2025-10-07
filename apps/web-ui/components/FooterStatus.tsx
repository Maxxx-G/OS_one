'use client';

import { useEffect, useState } from 'react';

type HealthStatus = '?' | 'OK' | 'ERR';

interface HealthPayload {
  ok?: boolean;
  llmOk?: boolean;
  ttsOk?: boolean;
  sttOk?: boolean;
  voice?: { llmOk?: boolean; ttsOk?: boolean };
}

/**
 * FooterStatus - Launch readiness status badge
 * Shows agent mode (Mediated/Direct), provider, and health status
 */
export default function FooterStatus() {
  const [health, setHealth] = useState<HealthStatus>('?');
  const [stt, setStt] = useState<'?' | 'OK' | 'ERR'>('?');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/health');
        const data: HealthPayload = await response.json();
        const isHealthy =
          data?.ok && (data.llmOk || data.voice?.llmOk || data.voice?.ttsOk);
        setHealth(isHealthy ? 'OK' : 'ERR');
        if (typeof data.sttOk === 'boolean') {
          setStt(data.sttOk ? 'OK' : 'ERR');
        } else {
          setStt('?');
        }
      } catch {
        setHealth('ERR');
        setStt('ERR');
      }
    })();
  }, []);

  const mode =
    process.env.NEXT_PUBLIC_DIRECT_AGENT === '1' ? 'Direct' : 'Mediated';
  const provider = process.env.NEXT_PUBLIC_PROVIDER || 'OpenAIResponses';
  const isLive = !!process.env.NEXT_PUBLIC_LIVE_BASE;

  return (
    <div className="fixed bottom-2 left-2 text-xs px-2 py-1 rounded bg-neutral-900/90 border border-neutral-700 text-neutral-200 shadow-lg">
      <span className="font-medium">{mode}</span>
      <span className="mx-2 text-neutral-500">•</span>
      <span>
        {provider}
        {isLive ? ' (Live)' : ' (Universe)'}
      </span>
      <span className="ml-2 inline-flex gap-1">
        <span
          className={`px-1.5 py-0.5 rounded font-mono ${
            health === 'OK'
              ? 'bg-green-700 text-white'
              : health === 'ERR'
              ? 'bg-red-700 text-white'
              : 'bg-gray-700 text-white'
          }`}
          title="LLM/TTS aggregate"
        >
          {health}
        </span>
        <span
          className={`px-1 py-0.5 rounded font-mono ${
            stt === 'OK'
              ? 'bg-green-700 text-white'
              : stt === 'ERR'
              ? 'bg-red-700 text-white'
              : 'bg-gray-700 text-white'
          }`}
          title="STT Health"
        >
          STT:{stt}
        </span>
      </span>
    </div>
  );
}
