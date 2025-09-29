'use client';
import React, { useState } from 'react';
import { useAgentState } from '@/app/providers';

type Result = { target: string; ok: boolean; ts: number } | null;

export default function QuickTest() {
  const { available } = useAgentState();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Record<string, Result>>({});

  async function run() {
    setBusy(true);
    const out: Record<string, Result> = {};
    for (const agent of available) {
      try {
        const response = await fetch(`/api/health/${agent.id}`, { cache: 'no-store' });
        const json = await response.json();
        out[agent.id] = { target: agent.id, ok: !!json.ok, ts: json.ts ?? Date.now() };
      } catch {
        out[agent.id] = { target: agent.id, ok: false, ts: Date.now() };
      }
    }
    setResults(out);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-md border px-3 py-1 text-sm"
        title="Run stubbed health checks for configured agents"
      >
        {busy ? 'Quick Test...' : 'Quick Test'}
      </button>
      {Object.entries(results).map(([key, value]) =>
        value ? (
          <span
            key={key}
            className={
              'rounded-full px-2 py-0.5 text-xs ' +
              (value.ok
                ? 'border border-green-300 bg-green-100'
                : 'border border-red-300 bg-red-100')
            }
            title={`ts=${value.ts}`}
          >
            {key}: {value.ok ? 'OK' : 'FAIL'}
          </span>
        ) : null,
      )}
    </div>
  );
}
