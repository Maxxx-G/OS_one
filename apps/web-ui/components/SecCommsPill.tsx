'use client';
import React, { useCallback, useEffect, useState } from 'react';

const ACK_KEY = 'os1.seccomms.ack';

export default function SecCommsPill() {
  const [open, setOpen] = useState(false);
  const [acked, setAcked] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      return window.localStorage.getItem(ACK_KEY) === '1';
    } catch {
      return false;
    }
  });

  const persistAck = useCallback((next: boolean) => {
    setAcked(next);
    try {
      window.localStorage.setItem(ACK_KEY, next ? '1' : '0');
    } catch {
      // ignore storage failures
    }
    try {
      (window as any).os1Audit?.log?.('sec-ack-toggle', { ack: next });
    } catch {
      // ignore audit failures
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className="sec-pill"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="seccomms-modal"
        data-testid="seccomms-pill"
        onClick={() => setOpen(true)}
        title="SEC-COMMS policy (Phase-1 placeholder)"
      >
        SEC-COMMS
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={close}>
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="SEC-COMMS policy (Phase-1 placeholder)"
            id="seccomms-modal"
            data-testid="seccomms-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-head">
              <h3>SEC-COMMS (Phase-1)</h3>
              <button type="button" className="btn-close" onClick={close} aria-label="Close">
                &times;
              </button>
            </header>
            <div className="modal-body">
              <ul className="policy-list">
                <li>
                  <strong>Placeholder only</strong> - non-functional in Phase-1.
                </li>
                <li>
                  <strong>Local-only</strong> transport; external links disabled.
                </li>
                <li>
                  <strong>Mediated required</strong>; <em>Direct</em> is prohibited until Phase-2
                  audit passes.
                </li>
                <li>Scopes reserved: audio, webcam, AI chat, MCP hooks.</li>
                <li>Phase-2: bind provider state and add audit sink logging.</li>
              </ul>
              <div className="ack-row">
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={acked}
                    onChange={() => persistAck(!acked)}
                    data-testid="seccomms-ack"
                  />
                  <span>I understand and accept SEC-COMMS policy for Direct mode.</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

