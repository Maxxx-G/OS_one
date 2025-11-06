'use client';
import { useEffect, useState } from 'react';

interface MetricsData {
  stt: { ok: number; fail: number; retry: number };
  tts: { fail: number; recover: number };
  loop: { phase: string; intent: string };
}

export default function OverwatchMetrics() {
  const [data, setData] = useState<MetricsData>({
    stt: { ok: 0, fail: 0, retry: 0 },
    tts: { fail: 0, recover: 0 },
    loop: { phase: 'idle', intent: 'none' },
  });

  useEffect(() => {
    const onMetrics = (e: any) => {
      setData((prev) => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('os1:metrics:update', onMetrics);
    return () => window.removeEventListener('os1:metrics:update', onMetrics);
  }, []);

  return (
    <div className="text-xs text-zinc-300 space-y-2">
      <div className="font-semibold text-sm text-white mb-2">Live Metrics</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="opacity-70">STT Success:</span>
          <span className="text-green-400">{data.stt.ok}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">STT Fail:</span>
          <span className="text-red-400">{data.stt.fail}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">STT Retry:</span>
          <span className="text-amber-400">{data.stt.retry}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">TTS Fail:</span>
          <span className="text-red-400">{data.tts.fail}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">TTS Recover:</span>
          <span className="text-green-400">{data.tts.recover}</span>
        </div>
      </div>
      <div className="border-t border-zinc-700 pt-2 mt-2">
        <div className="flex justify-between">
          <span className="opacity-70">Loop Phase:</span>
          <span className="text-blue-400">{data.loop.phase}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Intent:</span>
          <span className="text-purple-400">{data.loop.intent}</span>
        </div>
      </div>
    </div>
  );
}
