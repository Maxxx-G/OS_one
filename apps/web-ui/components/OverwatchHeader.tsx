'use client';

import React, { useEffect, useMemo } from 'react';

export type GabState = 'Idle' | 'Ready' | 'Running' | 'Unknown';

interface OverwatchHeaderProps {
  state: GabState;
  lastTs?: string;
  onStart?: () => void;
  onCancel?: () => void;
  busy?: boolean;
  disabledStart?: boolean;
  disabledCancel?: boolean;
  settingsBadge?: string;
  disabledStartReason?: string;
  disabledCancelReason?: string;
}

export default function OverwatchHeader({ state, lastTs, onStart, onCancel, busy, disabledStart, disabledCancel, settingsBadge, disabledStartReason, disabledCancelReason }: OverwatchHeaderProps) {
  useEffect(() => {
    try { console.log(`GUARDIAN_SUMMARY: OVERWATCH_HEADER PASS; state=${state}`); } catch {}
  }, [state]);

  const color = state === 'Ready'
    ? 'bg-emerald-500'
    : state === 'Running'
      ? 'bg-amber-500'
      : 'bg-neutral-400';

  const safeBadge = useMemo(() => {
    if (!settingsBadge) return undefined;
    try { return settingsBadge.replace(/\uFFFD+/g, '·'); } catch { return settingsBadge; }
  }, [settingsBadge]);

  const lastLabel = useMemo(() => {
    if (!lastTs) return '—';
    try {
      const d = new Date(lastTs);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString();
    } catch {}
    return String(lastTs);
  }, [lastTs]);

  return (
    <div className="w-full flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Overwatch Control Center</h3>
          <span className="inline-flex items-center gap-1 text-xs">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
            <span className="opacity-80">{state}</span>
          </span>
        </div>
        {safeBadge && (
          <div className="mt-0.5 text-[11px] font-mono opacity-70">{safeBadge.replace(/�+/g, '·')}</div>
        )}
        <div className="mt-0.5 text-[10px] font-mono opacity-70">Last activity: <span title={lastTs || ''}>{lastLabel}</span></div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onStart}
          disabled={!!busy || !!disabledStart}
          title={!!disabledStart ? (disabledStartReason ?? 'Start Gabriel') : 'Start Gabriel'}
          aria-disabled={!!(disabledStart || busy) ? true : undefined}
          aria-label={!!disabledStart && disabledStartReason ? `Start — ${disabledStartReason}` : undefined}
          className="px-2 py-1 text-xs rounded border border-neutral-300 bg-neutral-900 text-white disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={onCancel}
          disabled={!!busy || !!disabledCancel}
          title={!!disabledCancel ? (disabledCancelReason ?? 'Cancel run') : 'Cancel run'}
          aria-disabled={!!(disabledCancel || busy) ? true : undefined}
          aria-label={!!disabledCancel && disabledCancelReason ? `Cancel — ${disabledCancelReason}` : undefined}
          className="px-2 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
