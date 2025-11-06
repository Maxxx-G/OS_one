'use client';

import { useEffect, useState } from 'react';

type MetricsData = {
  stt_avg_ms: number;
  stt_retry_rate: number;
  tts_avg_ms: number;
  tts_fail_rate: number;
  confirm_ok_count: number;
  confirm_cancel_count: number;
  total_entries: number;
};

export default function VoiceMetricsPanel() {
  const [show, setShow] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  // Fetch metrics
  const refresh = async () => {
    try {
      const res = await fetch('/api/voice/metrics');
      const data = await res.json();
      if (data.ok) {
        setMetrics(data);
      }
    } catch (err) {
      console.warn('[Metrics] fetch failed:', err);
    }
  };

  // Auto-refresh every 10s when panel is open
  useEffect(() => {
    if (!show) return;
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [show]);

  // Hotkey: Alt+M to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyM') {
        e.preventDefault();
        setShow(v => !v);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-[10px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white"
        title="Voice Metrics (Alt+M)"
      >
        📊 Metrics
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 right-2 z-40 text-xs bg-neutral-900/95 border border-neutral-700 rounded p-3 w-[280px]">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">Voice Pipeline Metrics (5m)</div>
        <button
          onClick={() => setShow(false)}
          className="text-[10px] px-1 hover:text-neutral-400"
          title="Close (Alt+M)"
        >
          ✕
        </button>
      </div>

      {!metrics ? (
        <div className="text-neutral-500 text-center py-2">Loading...</div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">STT Latency</div>
              <div className="font-mono">{metrics.stt_avg_ms}ms</div>
            </div>
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">STT Retry Rate</div>
              <div className="font-mono">{metrics.stt_retry_rate.toFixed(2)}</div>
            </div>
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">TTS Latency</div>
              <div className="font-mono">{metrics.tts_avg_ms}ms</div>
            </div>
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">TTS Fail Rate</div>
              <div className="font-mono">{(metrics.tts_fail_rate * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">Confirm OK</div>
              <div className="font-mono text-green-400">{metrics.confirm_ok_count}</div>
            </div>
            <div className="bg-neutral-800 rounded px-2 py-1">
              <div className="text-[10px] text-neutral-400">Confirm Cancel</div>
              <div className="font-mono text-amber-400">{metrics.confirm_cancel_count}</div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 text-center">
            {metrics.total_entries} entries • Auto-refresh 10s
          </div>
        </div>
      )}
    </div>
  );
}
