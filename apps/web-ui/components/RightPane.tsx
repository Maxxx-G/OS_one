'use client';

import React, { useEffect, useRef, useState } from 'react';
import GuardianPanel from './GuardianPanel';
import OverwatchHeader, { GabState } from './OverwatchHeader';
import OverwatchMetrics from './OverwatchMetrics';

const TOP_OFFSET_PX = 64;        // adjust if your header height differs
const WIDTH_BASE_PX = 420;       // < 1280px
const WIDTH_WIDE_PX = 480;       // >= 1280px
const MAX_VW = 85;               // cap

  // Agent metrics type
  type AgentMetrics = {
    totals?: { runs?: number; pass?: number; fail?: number };
    latency_ms?: number;
    last?: { pass?: boolean; ts?: string };
    processing?: boolean;
    locked?: boolean;
    fresh_ts?: string;
    recent?: any;
  };

  const [open, setOpen] = useState<boolean>(false);
  const [gabState, setGabState] = useState<GabState>('Unknown');
  const [gabLast, setGabLast] = useState<string | undefined>(undefined);
  const [gabBusy, setGabBusy] = useState<boolean>(false);
  const [metricsProcessing, setMetricsProcessing] = useState<boolean>(false);
  const [metricsLocked, setMetricsLocked] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  // Settings (shared with ReadyPill via localStorage)
  const [gabPolicy, setGabPolicy] = useState<boolean>(true);
  const [gabDry, setGabDry] = useState<boolean>(false);
  const [gabLimit, setGabLimit] = useState<number>(5);

  const syncSettings = () => {
    try {
      const p = JSON.parse(localStorage.getItem('os1.gab.policy') ?? 'true');
      const d = JSON.parse(localStorage.getItem('os1.gab.dry') ?? 'false');
      const lRaw = localStorage.getItem('os1.gab.limit');
      const l = lRaw != null ? Number(lRaw) : (d ? 3 : 5);
      setGabPolicy(!!p);
      setGabDry(!!d);
      setGabLimit(isFinite(l) && l > 0 ? Math.min(10, Math.max(1, Math.floor(l))) : (d ? 3 : 5));
      try { console.log(`GUARDIAN_SUMMARY: AGENT_SETTING VIEW PASS; policy=${!!p}; dry=${!!d}; limit=${isFinite(l) ? l : (d?3:5)}`); } catch {}
    } catch {
      // defaults already set
    }
  };
  const drawerRef = useRef<HTMLDivElement>(null);

  // Restore persisted state + hotkeys (Ctrl+Alt+O to toggle, Esc to close)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('os1.ui.overwatchOpen');
      setOpen(saved === '1');
    } catch {}

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Persist and focus heading on open for a11y
  useEffect(() => {
    try { localStorage.setItem('os1.ui.overwatchOpen', open ? '1' : '0'); } catch {}
    if (open && drawerRef.current) {
      drawerRef.current.querySelector<HTMLElement>('[data-overwatch-focus]')?.focus();
    }
  }, [open]);

  // Read settings on mount and when drawer opens; refresh on storage changes
  useEffect(() => { syncSettings(); }, []);
  useEffect(() => { if (open) syncSettings(); }, [open]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e || !e.key) { syncSettings(); return; }
      if (e.key.startsWith('os1.gab.')) {
        syncSettings();
        // Log settings view pass
        try {
          const p = JSON.parse(localStorage.getItem('os1.gab.policy') ?? 'true');
          const d = JSON.parse(localStorage.getItem('os1.gab.dry') ?? 'false');
          const lRaw = localStorage.getItem('os1.gab.limit');
          const l = lRaw != null ? Number(lRaw) : (d ? 3 : 5);
          console.log(`GUARDIAN_SUMMARY: AGENT_SETTING VIEW PASS; policy=${!!p}; dry=${!!d}; limit=${isFinite(l) ? l : (d?3:5)}`);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Poll agent metrics with visibility-aware backoff
  useEffect(() => {
    if (!open) return;
    let alive = true;
    let timer: any;
    async function poll() {
      try {
        setMetricsLoading(true);
        const r = await fetch('/api/agent/metrics', { cache: 'no-store' });
        const j = await r.json().catch(() => ({}));
        let derived: GabState = 'Unknown';
        const processing = !!j?.processing;
        const locked = !!j?.locked;
        const runs = (j?.totals?.runs ?? 0);
        // Derive state
        if (processing || locked) derived = 'Running';
        else if (j?.last?.pass === true) derived = 'Ready';
        else if (!j?.fresh_ts || (Date.now() - (new Date(j.fresh_ts).getTime())) > 24*60*60*1000) derived = 'Idle';
        else derived = 'Unknown';
        if (!alive) return;
        setGabState(derived);
        setGabLast(j?.fresh_ts);
        setMetricsProcessing(processing);
        setMetricsLocked(locked);
        setMetrics(j);
        try {
          console.log(`GUARDIAN_SUMMARY: AGENT_METRICS VIEW PASS; processing=${processing}; locked=${locked}; runs=${runs}`);
          const pass = j?.totals?.pass ?? 0; const fail = j?.totals?.fail ?? 0;
          console.log(`GUARDIAN_SUMMARY: OVERWATCH_METRICS VIEW PASS; runs=${runs}; pass=${pass}; fail=${fail}`);
        } catch {}
      } catch {}
      finally {
        setMetricsLoading(false);
        if (!alive) return;
        const vis = (typeof document !== 'undefined' ? document.visibilityState : 'visible');
        const ms = vis === 'visible' ? 10000 : 30000;
        timer = setTimeout(poll, ms);
      }
    }
    poll();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [open]);

  // Actions
  const startGabriel = async () => {
    try {
      // Guard: busy
      const guardBusy = gabState === 'Running' || metricsProcessing || metricsLocked || gabBusy;
      if (guardBusy) {
        const reason = gabBusy ? 'busy' : (metricsLocked ? 'locked' : (metricsProcessing ? 'processing' : (gabState === 'Running' ? 'running' : 'busy')));
        try { console.log(`GUARDIAN_SUMMARY: AGENT_START BLOCKED; reason=${reason}`); } catch {}
        return;
      }
      if (!gabDry) {
        try { const ok = window.confirm('Run with writes? Backups will be created. Proceed?'); if (!ok) return; } catch {}
      }
      setGabBusy(true);
      const body = { mode: 'all', policy: gabPolicy, dryrun: gabDry, limit: gabLimit } as any;
      const r = await fetch('/api/agent/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      await r.json().catch(() => ({}));
      setGabState('Running');
      try { console.log(`GUARDIAN_SUMMARY: AGENT_EXEC VIEW PASS; mode=all; dry=${gabDry}; policy=${gabPolicy}; limit=${gabLimit}`); } catch {}
    } catch {}
    finally { setGabBusy(false); }
  };

  const cancelGabriel = async () => {
    try {
      setGabBusy(true);
      const r = await fetch('/api/agent/cancel');
      await r.json().catch(() => ({}));
      setGabState('Idle');
      try { console.log('GUARDIAN_SUMMARY: AGENT_CANCEL VIEW PASS'); } catch {}
    } catch {}
    finally { setGabBusy(false); }
  };

  // Compute guards and reasons
  const isProcessing = !!metrics?.processing;
  const isLocked = !!metrics?.locked;
  const isRunning = gabState === 'Running';
  const busy = gabBusy;
  const startReason = busy ? 'Busy' : isLocked ? '.agent.lock active' : isProcessing ? 'Agent processing' : undefined;
  const cancelReason = busy ? 'Busy' : (!isProcessing && !isLocked && !isRunning ? 'Nothing to cancel' : undefined);

  return (
    <>
      {/* Edge Tab */}
      <button
        aria-label="Toggle Overwatch"
        title="Overwatch (Ctrl+Alt+O)"
        onClick={() => setOpen(v => !v)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] h-28 w-6 rounded-l-md shadow
                   bg-neutral-800 text-neutral-100 text-[10px] tracking-wide rotate-180 [writing-mode:vertical-rl]
                   focus:outline-none focus:ring-2 focus:ring-neutral-300"
      >
        Overwatch
      </button>

      {/* Overlay (click to close) */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={[
          'fixed inset-0 z-[50] bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        ].join(' ')}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="complementary"
        aria-label="Overwatch"
        className={[
          'fixed z-[70] right-0',
          `top-[${TOP_OFFSET_PX}px]`,
          `h-[calc(100vh-${TOP_OFFSET_PX}px)]`,
          'translate-x-full transition-transform duration-300 ease-in-out will-change-transform',
          open ? '!translate-x-0' : '',
          'bg-white/95 backdrop-blur border-l border-neutral-200 shadow-xl overflow-y-auto'
        ].join(' ')}
        style={{ width: `min(${MAX_VW}vw, ${WIDTH_BASE_PX}px)` }}
      >
        <style>{`
          @media (min-width: 1280px) {
            [role="complementary"] { width: min(${MAX_VW}vw, ${WIDTH_WIDE_PX}px); }
          }
          @media (prefers-reduced-motion: reduce) {
            [role="complementary"] { transition: none !important; }
          }
        `}</style>

        <div className="p-0">
          <div className="overwatch-header">
            <OverwatchHeader
              state={gabState}
              lastTs={gabLast}
              onStart={startGabriel}
              onCancel={cancelGabriel}
              busy={gabBusy}
              disabledStart={!!(busy || isProcessing || isLocked)}
              disabledCancel={!!(busy || (!isProcessing && !isLocked && !isRunning))}
              disabledStartReason={startReason}
              disabledCancelReason={cancelReason}
              settingsBadge={`Policy:${gabPolicy?'ON':'OFF'} · Dry:${gabDry?'ON':'OFF'} · Limit:${gabLimit}`}
            />
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            >
              Close
            </button>
          </div>

          <div className="p-3 space-y-3">
            <OverwatchMetrics data={metrics} loading={metricsLoading} />
            <GuardianPanel />

            <div className="mt-3">
              {typeof (globalThis as any).__OS1_RightExtras === 'function'
                ? (globalThis as any).__OS1_RightExtras()
                : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
