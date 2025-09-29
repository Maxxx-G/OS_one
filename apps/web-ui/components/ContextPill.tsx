'use client';
import React, { useEffect, useState } from 'react';
import { useAgentState } from '@/app/providers';

type ContextPayload = {
  ok: boolean;
  ts: number;
  system: {
    project: string;
    guardrails: { redactionDefault: boolean; directDefault: boolean };
    files: {
      systemInstructions: string;
      verbsReference: string;
      stbTemplate: string;
    };
  };
};

export default function ContextPill() {
  const { current, mode, available } = useAgentState();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ContextPayload | null>(null);
  const agentMeta = available.find((agent) => agent.id === current)!;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const response = await fetch('/api/context', { cache: 'no-store' });
        const json = (await response.json()) as ContextPayload;
        if (alive) setData(json);
      } catch {
        if (alive) setData(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-2 py-1 text-sm"
        title="Show injected context (read-only)"
      >
        Context
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-[720px] overflow-auto rounded-xl border bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Injected Context (read-only)</h2>
              <button
                className="rounded-md border px-2 py-1 text-sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="mb-1 text-sm font-medium">Session</div>
                <div className="text-sm">
                  <div>
                    Mode: <b>{mode === 'direct' ? 'Direct' : 'Mediated'}</b>
                  </div>
                  <div>
                    Agent: <b>{agentMeta.label}</b> ({agentMeta.type})
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-1 text-sm font-medium">System</div>
                {data ? (
                  <div className="text-sm">
                    <div>
                      Project: <b>{data.system.project}</b>
                    </div>
                    <div>
                      Guardrails: redactionDefault=
                      <b>{String(data.system.guardrails.redactionDefault)}</b>, directDefault=
                      <b>{String(data.system.guardrails.directDefault)}</b>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm opacity-70">Loading...</div>
                )}
              </div>
            </div>
            <div className="mt-3 rounded-lg border p-3">
              <div className="mb-1 text-sm font-medium">Files (IDs)</div>
              <pre className="overflow-auto whitespace-pre-wrap text-xs">
                {data ? JSON.stringify(data.system.files, null, 2) : 'Loading...'}
              </pre>
            </div>
            <p className="mt-2 text-xs opacity-70">
              Phase-1 stub: values from <code>/api/context</code> plus live agent state from
              Provider. Replace with KB-backed injection in Phase-2.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
