'use client';
import React, { useCallback, useEffect, useState } from 'react';

const STUB = {
  session: 'Phase 1 (stub)',
  mode: 'Mediated',
  agent: 'OpenAI [ext]',
  project: 'OS One Universe',
  guards: { redactionDefault: true, directDefault: false },
};

export default function ContextPill() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  return (
    <>
      <button
        type="button"
        className="context-pill"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Context
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={close}>
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Injected Context (read-only)"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-head">
              <h3>Injected Context (read-only)</h3>
              <button type="button" className="btn-close" onClick={close} aria-label="Close">
                Close
              </button>
            </header>
            <pre className="modal-pre">{JSON.stringify(STUB, null, 2)}</pre>
          </div>
        </div>
      ) : null}
    </>
  );
}
