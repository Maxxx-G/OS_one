'use client';
import React, { useState } from 'react';

export default function SecCommsPill() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="rounded-full border px-3 py-1 text-xs"
        title="SEC-COMMS (Phase-2): secure audio/video/chat. Local-only by default. Mediated mode required."
        onClick={() => setOpen(true)}
      >
        SEC-COMMS
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-[520px] max-w-[90vw] rounded-xl border bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold">SEC-COMMS (Phase-2)</h2>
              <button
                className="rounded-md border px-2 py-1 text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <ul className="list-disc pl-5">
                <li>Non-functional placeholder (Phase-1).</li>
                <li>
                  Defaults: <b>local-only</b> transport, <b>mediated</b> mode required.
                </li>
                <li>Scopes: audio, webcam, AI chat, MCP hooks.</li>
                <li>Policy reminder: no direct mode for SEC-COMMS until Phase-2 audit passes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
