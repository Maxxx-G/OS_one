'use client';
import React, { useCallback, useEffect, useState } from 'react';

type Slide = {
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    title: 'Quick Switch',
    body: 'Use the Agent dropdown to switch between external (OpenAI) and local (Ollama). This is a visual stub in Phase-1.',
  },
  {
    title: 'Direct vs Mediated',
    body: 'Direct talks straight to the agent; Mediated routes via Assistant (default). Policy requires Mediated in Phase-1.',
  },
  {
    title: 'Quick Test',
    body: 'Runs a simple echo test against the selected agent. Placeholder only�no network call in Phase-1.',
  },
];

export default function HelpOverlay() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setIndex(0);
  }, []);

  const next = useCallback(() => {
    setIndex((current) => Math.min(current + 1, SLIDES.length - 1));
  }, []);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
      if (event.key === 'ArrowRight') {
        next();
      }
      if (event.key === 'ArrowLeft') {
        prev();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, close, next, prev]);

  const atLastSlide = index === SLIDES.length - 1;

  return (
    <>
      <button
        type="button"
        className="help-pill"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Help
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={close}>
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Onboarding Help"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-head">
              <h3>{SLIDES[index].title}</h3>
              <button type="button" className="btn-close" onClick={close} aria-label="Close">
                &times;
              </button>
            </header>
            <div className="modal-body">
              <p className="modal-text">{SLIDES[index].body}</p>
            </div>
            <footer className="modal-foot">
              <button
                type="button"
                className="modal-btn ghost"
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous slide"
              >
                Back
              </button>
              <div className="modal-dots" aria-hidden="true">
                {SLIDES.map((_, idx) => (
                  <span key={idx} className={`dot${idx === index ? ' active' : ''}`} />
                ))}
              </div>
              <button
                type="button"
                className="modal-btn"
                onClick={atLastSlide ? close : next}
                aria-label={atLastSlide ? 'Finish onboarding' : 'Next slide'}
              >
                {atLastSlide ? 'Done' : 'Next'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
