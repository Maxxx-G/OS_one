'use client';
import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'os1.bmad.v1';

const INITIAL_HYPOTHESES: Record<string, boolean> = {
  'Scope is minimal': false,
  'Guardrails defined': false,
  'STB <=5 files': false,
};

type Draft = {
  notes: string;
  tags: string;
  hypotheses: Record<string, boolean>;
};

const createDefaultDraft = (): Draft => ({
  notes: '',
  tags: '',
  hypotheses: { ...INITIAL_HYPOTHESES },
});

function emit(type: string, data?: unknown) {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    const audit = (window as any).os1Audit;
    audit?.log?.(type, data);
  } catch {
    // ignore audit errors
  }
}

export default function BmadDock() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => createDefaultDraft());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;
        setDraft(() => {
          const base = createDefaultDraft();
          return {
            ...base,
            ...parsed,
            hypotheses: {
              ...base.hypotheses,
              ...(parsed.hypotheses ?? {}),
            },
          };
        });
      }
    } catch {
      // ignore malformed storage entries
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore write failures
    }
  }, [draft, hydrated]);

  const checklist = useMemo(() => Object.keys(draft.hypotheses), [draft.hypotheses]);

  const handleDockToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      emit('bmad-toggle', { open: next });
      return next;
    });
  };

  const handleExport = () => {
    const lines = [
      '# BMAD Brainstorm Draft',
      '',
      '## Tags',
      draft.tags || '(none)',
      '',
      '## Notes',
      draft.notes || '(empty)',
      '',
      '## Hypotheses',
      ...checklist.map((key) => `- [${draft.hypotheses[key] ? 'x' : ' '}] ${key}`),
    ];

    try {
      const newline = String.fromCharCode(10);
      const markdown = lines.join(newline);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bmad_brainstorm.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      emit('bmad-export', { bytes: markdown.length });
    } catch {
      // ignore export errors
    }
  };

  const handleReset = () => {
    setDraft(createDefaultDraft());
    emit('bmad-reset');
  };

  const handlePin = () => {
    try {
      const prefaceLines = [
        '# BMAD Preface',
        '',
        draft.notes || '(empty)',
        '',
        `Tags: ${draft.tags || '(none)'}`,
      ];
      const preface = prefaceLines.join(String.fromCharCode(10));
      const chatApi = (window as any).os1Chat;
      if (chatApi?.setSystemPreface) {
        chatApi.setSystemPreface(preface);
      } else {
        window.localStorage.setItem('os1.chat.systemPreface', preface);
      }
      emit('bmad-pin', { bytes: preface.length });
    } catch {
      // ignore pin failures
    }
  };

  return (
    <div className="bmad-dock" data-testid="bmad-dock">
      <button type="button" className="bmad-toggle" onClick={handleDockToggle}>
        BMAD
      </button>
      {open ? (
        <div className="bmad-panel" role="region" aria-label="BMAD Brainstorm">
          <header className="bmad-head">
            <strong>BMAD Brainstorm</strong>
            <div className="bmad-actions">
              <button type="button" className="btn" onClick={handleExport}>
                Export .md
              </button>
              <button type="button" className="btn ghost" onClick={handleReset}>
                Reset
              </button>
              <button
                type="button"
                className="btn"
                onClick={handlePin}
                title="Use BMAD notes as a system preface for the next chat send"
              >
                Pin -&gt; System
              </button>
            </div>
          </header>
          <div className="bmad-body">
            <label className="bmad-label" htmlFor="bmad-tags">
              Tags (comma-sep)
            </label>
            <input
              id="bmad-tags"
              className="bmad-input"
              value={draft.tags}
              onChange={(event) =>
                setDraft((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="e.g. ui, chat, phase-2"
            />
            <label className="bmad-label" htmlFor="bmad-notes">
              Notes
            </label>
            <textarea
              id="bmad-notes"
              className="bmad-textarea"
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Brainstorm here..."
            />
            <span className="bmad-label">Hypotheses</span>
            <ul className="bmad-list">
              {checklist.map((key) => (
                <li key={key}>
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.hypotheses[key])}
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          hypotheses: {
                            ...current.hypotheses,
                            [key]: !current.hypotheses[key],
                          },
                        }))
                      }
                    />
                    <span>{key}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
