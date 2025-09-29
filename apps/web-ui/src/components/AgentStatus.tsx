import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useProvider } from '../state/ProviderContext';
import { useChatRun } from '../hooks/useChatRun';

type StatusState = 'idle' | 'ok' | 'degraded' | 'offline';

type StatusDisplay = {
  label: string;
  bg: string;
  fg: string;
};

const STATUS_THEME: Record<StatusState, StatusDisplay> = {
  idle: { label: 'Idle', bg: '#e5e7eb', fg: '#111827' },
  ok: { label: 'OK', bg: '#16a34a', fg: '#f9fafb' },
  degraded: { label: 'Degraded', bg: '#f59e0b', fg: '#111827' },
  offline: { label: 'Offline', bg: '#ef4444', fg: '#f9fafb' },
};

const formatLatency = (latencyMs: number | null) => {
  if (latencyMs == null) return '--';
  return `${latencyMs} ms`;
};

export const AgentStatus: React.FC = () => {
  const { key, model, directAgentMode } = useProvider();
  const { runQuickTest } = useChatRun();
  const [status, setStatus] = useState<StatusState>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [mode, setMode] = useState<'direct' | 'mediated'>('mediated');
  const [busy, setBusy] = useState(false);

  const theme = useMemo(() => STATUS_THEME[status], [status]);

  const resetState = useCallback(() => {
    setStatus('idle');
    setLatency(null);
    setMode('mediated');
    setBusy(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => resetState();
    window.addEventListener('agent-status:reset', handler);
    return () => window.removeEventListener('agent-status:reset', handler);
  }, [resetState]);

  const handleTest = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await runQuickTest();
      const { ok, latencyMs, mode: responseMode } = result;
      setLatency(latencyMs ?? null);
      setMode(responseMode);
      if (!ok) {
        setStatus('offline');
        return;
      }
      if (latencyMs != null && latencyMs > 2000) {
        setStatus('degraded');
      } else {
        setStatus('ok');
      }
    } catch {
      setStatus('offline');
      setLatency(null);
    } finally {
      setBusy(false);
    }
  }, [busy, runQuickTest]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 72,
            padding: '2px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: theme.bg,
            color: theme.fg,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {theme.label}
        </span>
        <span style={{ fontSize: 12, color: '#4b5563' }}>{formatLatency(latency)}</span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {directAgentMode ? 'Direct' : 'Assistant'} | {mode}
        </span>
      </div>
      <button
        type="button"
        onClick={handleTest}
        disabled={busy}
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          border: '1px solid #d1d5db',
          background: busy ? '#e5e7eb' : '#f9fafb',
          color: '#111827',
          fontSize: 12,
          cursor: busy ? 'not-allowed' : 'pointer',
        }}
      >
        {busy ? 'Testing...' : 'Test'}
      </button>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>
        {key} | {model || 'default'}
      </span>
    </div>
  );
};
