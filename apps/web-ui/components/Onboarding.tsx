'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const KEY = 'os1.onboarding.seen.v1';

export default function Onboarding() {
  const slides = useMemo(
    () => [
      {
        title: 'Quick Switch',
        body: 'Use the Agent dropdown to switch between OpenAI (external) and Ollama (local). The status chip updates instantly.',
      },
      {
        title: 'Direct Toggle',
        body: 'Direct sends prompts straight to the agent (no mediation). Keep it OFF for safety. Toggle only for debugging.',
      },
      {
        title: 'Quick Test',
        body: 'Run stubbed health checks for both agents. You should see OK badges for openai and ollama.',
      },
    ],
    [],
  );

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const seen = window.localStorage.getItem(KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('os1:onboarding:open', handler as EventListener);
    return () => window.removeEventListener('os1:onboarding:open', handler as EventListener);
  }, []);

  const close = useCallback(() => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(KEY, '1');
    } catch {}
    setOpen(false);
    setIndex(0);
  }, []);

  if (!open) return null;
  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="w-[720px] max-w-[90vw] rounded-xl border bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Welcome to OS One - Quick Tour</h2>
          <button
            className="rounded-md border px-2 py-1 text-sm"
            onClick={close}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium">{slide.title}</div>
          <p className="mt-1 text-sm opacity-90">{slide.body}</p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs opacity-70">
            Slide {index + 1} / {slides.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
            >
              Back
            </button>
            {index < slides.length - 1 ? (
              <button
                className="rounded-md border px-3 py-1 text-sm"
                onClick={() => setIndex((value) => Math.min(slides.length - 1, value + 1))}
              >
                Next
              </button>
            ) : (
              <button className="rounded-md border px-3 py-1 text-sm" onClick={close}>
                Got it
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs opacity-70">
          Tip: Open this tour anytime via the Help button in the toolbar.
        </p>
      </div>
    </div>
  );
}
