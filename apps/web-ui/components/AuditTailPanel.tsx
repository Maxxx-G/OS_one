'use client';

import React, { useCallback, useEffect, useState } from 'react';

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

type AuditRecord = {
  ts: number;
  event: string;
  payload?: any;
};

export default function AuditTailPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AuditRecord[]>([]);
  const [limit, setLimit] = useState(50);
  const [busy, setBusy] = useState(false);

  const pull = useCallback(async () => {
    try {
      setBusy(true);
      const response = await fetch(`${ARCHON_URL}/v1/audit/tail?limit=${limit}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      /* ignore fetch errors */
    } finally {
      setBusy(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!open) {
      return;
    }
    pull();
    const intervalId = setInterval(pull, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [open, pull]);

  const formatTimestamp = useCallback((ts: number): string => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return String(ts);
    }
  }, []);

  const payloadPreview = useCallback((payload: any): string => {
    try {
      return JSON.stringify(payload);
    } catch {
      return '';
    }
  }, []);

  return (
    <section className="audit-tail">
      <button
        className="btn sm ghost"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        data-hotkey="Alt+A"
        aria-expanded={open}
        title="Toggle Audit Tail (Alt+A)"
      >
        Tail
      </button>
      {open && (
        <div className="audit-tail-body">
          <div className="row">
            <label htmlFor="audit-limit-select">Limit</label>
            <select
              id="audit-limit-select"
              className="select sm"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            >
              {[25, 50, 100, 200, 500, 1000].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button className="btn sm" onClick={pull} disabled={busy}>
              Refresh
            </button>
          </div>
          {items.length === 0 ? (
            <div className="muted">No audit items.</div>
          ) : (
            <ul className="audit-tail-list" role="log" aria-live="polite">
              {items.map((item, index) => (
                <li key={index}>
                  <span className="t">{formatTimestamp(item.ts)}</span>
                  <span className="k">{item.event}</span>
                  <span className="v">{payloadPreview(item.payload)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
