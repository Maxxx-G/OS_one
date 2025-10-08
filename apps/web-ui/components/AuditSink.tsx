'use client';

import { useEffect, useState } from 'react';

type AuditEventDetail = {
  type: string;
  data?: unknown;
};

type AuditEntry = {
  time: string;
  type: string;
  data?: unknown;
};

declare global {
  interface Window {
    os1Audit?: {
      log: (type: string, data?: unknown) => void;
    };
  }
}

export default function AuditSink() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<AuditEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.os1Audit = window.os1Audit || {};
    window.os1Audit.log = (type: string, data?: unknown) => {
      const evt = new CustomEvent<AuditEventDetail>('os1:audit', {
        detail: { type, data },
      });
      window.dispatchEvent(evt);
    };

    const handler: EventListener = (event) => {
      const custom = event as CustomEvent<AuditEventDetail>;
      const now = new Date();
      setEvents((prev) =>
        [
          {
            time: now.toLocaleTimeString(),
            type: custom.detail?.type ?? 'unknown',
            data: custom.detail?.data,
          },
          ...prev,
        ].slice(0, 20),
      );
    };

    window.addEventListener('os1:audit', handler);

    return () => {
      window.removeEventListener('os1:audit', handler);
    };
  }, []);

  const exportMarkdown = () => {
    try {
      const history = (window as any).os1Chat?.getHistory?.() ?? [];
      const lines = [
        '# OS1 Transcript',
        '',
        ...history.map((msg: any) => `**${msg.role}**: ${msg.text}`),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transcript.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      (window as any).os1Audit?.log?.('chat-export', { type: 'md', count: history.length });
    } catch {
      // ignore export failures
    }
  };

  const exportJson = () => {
    try {
      const history = (window as any).os1Chat?.getHistory?.() ?? [];
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transcript.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      (window as any).os1Audit?.log?.('chat-export', { type: 'json', count: history.length });
    } catch {
      // ignore export failures
    }
  };

  return (
    <div className={`audit-tray${open ? ' open' : ''}`} data-testid="audit-sink">
      <button
        type="button"
        className="audit-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        Audit
      </button>
      {open && (
        <div className="audit-body" role="log" aria-live="polite">
          <div className="audit-actions">
            <button type="button" className="btn" onClick={exportMarkdown}>
              Export .md
            </button>
            <button type="button" className="btn" onClick={exportJson}>
              Export .json
            </button>
          </div>
          {events.length === 0 ? (
            <div className="audit-empty">No events yet</div>
          ) : (
            <ul className="audit-list">
              {events.map((item, index) => (
                <li key={index}>
                  <span className="t">{item.time}</span>
                  <span className="k">{item.type}</span>
                  {item.data !== undefined ? (
                    <pre className="v">{JSON.stringify(item.data, null, 2)}</pre>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
