'use client';

import { useEffect, useState } from 'react';
import { getLog, subscribe, clearLog, type ActionLogEntry } from '../../lib/voice/actionLog';

type ConfirmRequest = {
  id: string;
  message: string;
};

export default function ConfirmCenter() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState<ActionLogEntry[]>(getLog());

  // Subscribe to log updates
  useEffect(() => subscribe(() => setLog(getLog())), []);

  // Listen for confirm requests and log toggle
  useEffect(() => {
    const onRequest = (e: Event) => {
      setRequest((e as CustomEvent<ConfirmRequest>).detail);
    };
    const onToggle = () => setShowLog((v) => !v);

    window.addEventListener('os1:confirm:request', onRequest as EventListener);
    window.addEventListener('os1:actionlog:toggle', onToggle);

    return () => {
      window.removeEventListener('os1:confirm:request', onRequest as EventListener);
      window.removeEventListener('os1:actionlog:toggle', onToggle);
    };
  }, []);

  function respond(ok: boolean) {
    if (!request) return;
    window.dispatchEvent(
      new CustomEvent('os1:confirm:result', {
        detail: { id: request.id, ok },
      })
    );
    setRequest(null);
  }

  return (
    <>
      {/* Confirmation Modal */}
      {request && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 w-[320px]">
            <div className="text-sm mb-3">{request.message}</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                onClick={() => respond(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-500"
                onClick={() => respond(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Log Panel */}
      {showLog && (
        <div className="fixed bottom-2 right-2 z-40 text-xs bg-neutral-900/95 border border-neutral-700 rounded p-3 w-[360px] max-h-[40vh] overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Action Log</div>
            <button
              className="px-2 py-0.5 text-[10px] rounded bg-neutral-700 hover:bg-neutral-600"
              onClick={() => {
                if (confirm('Clear action log?')) clearLog();
              }}
            >
              Clear
            </button>
          </div>
          {log.length === 0 ? (
            <div className="text-neutral-500 text-center py-2">No actions yet</div>
          ) : (
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li key={i} className="flex justify-between gap-2 text-[10px]">
                  <span className="opacity-70 shrink-0">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                  <span className="mx-2 truncate">{entry.intent}</span>
                  <span className="shrink-0">
                    {entry.result}
                    {entry.note ? ` • ${entry.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
