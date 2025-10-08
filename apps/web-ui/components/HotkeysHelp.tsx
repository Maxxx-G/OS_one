'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { hintColorCssVar } from '../lib/acclimation';

const LS_KEYS = {
  enabled: 'os1.hints.enabled',
};

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const PREFS_URL = `${ARCHON_URL}/v1/prefs`;

function readEnabledFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(LS_KEYS.enabled) === '1';
  } catch {
    return false;
  }
}

function usePalette() {
  const [palette, setPalette] = useState<'normal' | 'cb_safe'>('normal');

  useEffect(() => {
    fetch(PREFS_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.hint_palette) {
          setPalette(j.hint_palette);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch(PREFS_URL)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.hint_palette) {
            setPalette(j.hint_palette);
          }
        })
        .catch(() => {
          /* ignore */
        });
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const setPaletteRemote = useCallback(async (v: 'normal' | 'cb_safe') => {
    try {
      await fetch(PREFS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hint_palette: v }),
      });
    } catch {
      /* ignore */
    }
    setPalette(v);
  }, []);

  return { palette, setPaletteRemote };
}

export default function HotkeysHelp() {
  const [enabled, setEnabled] = useState<boolean>(() => readEnabledFromStorage());
  const { palette } = usePalette();

  const persist = useCallback((next: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LS_KEYS.enabled, next ? '1' : '0');
      } catch {
        /* ignore storage issues */
      }

      try {
        window.dispatchEvent(new CustomEvent('os1:hints', { detail: next }));
      } catch {
        /* ignore */
      }
    }

    void fetch(`${ARCHON_URL}/v1/prefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hints_enabled: next }),
    }).catch(() => {
      /* ignore */
    });
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, [persist]);

  const setEnabledAndPersist = useCallback(
    (value: boolean) => {
      setEnabled((prev) => {
        if (prev === value) {
          return prev;
        }
        persist(value);
        return value;
      });
    },
    [persist],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      if (!(event.shiftKey && (key === '?' || key === '/'))) {
        return;
      }
      event.preventDefault();
      toggle();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [toggle]);

  useEffect(() => {
    const onToggle = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === 'boolean') {
        setEnabled((prev) => (prev === detail ? prev : detail));
      }
    };

    window.addEventListener('os1:hints' as any, onToggle as EventListener);
    return () => {
      window.removeEventListener('os1:hints' as any, onToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    const win = window as any;
    win.os1Hints = Object.assign(win.os1Hints || {}, {
      show: () => setEnabledAndPersist(true),
      hide: () => setEnabledAndPersist(false),
      toggle,
    });

    win.os1Overwatch = Object.assign(win.os1Overwatch || {}, {
      handleSpeedKeys() {
        win.os1Hints?.show?.();
      },
    });

    return () => {
      if (win.os1Hints?.toggle === toggle) {
        delete win.os1Hints.toggle;
      }
    };
  }, [setEnabledAndPersist, toggle]);

  return (
    <div
      className="hotkeys-help"
      style={{ cssText: hintColorCssVar(undefined, palette) } as any}
      aria-live="polite"
    >
      {enabled && (
        <div className="hotkeys-card" role="dialog" aria-label="Speed keys">
          <div className="row">
            <kbd>⌘/Ctrl</kbd>
            <span>+</span>
            <kbd>Enter</kbd>
            <span>Send</span>
          </div>
          <div className="row">
            <kbd>Esc</kbd>
            <span>Abort stream</span>
          </div>
          <div className="row">
            <kbd>⌘/Ctrl</kbd>
            <span>+</span>
            <kbd>L</kbd>
            <span>Clear chat</span>
          </div>
          <div className="row">
            <kbd>Alt</kbd>
            <span>+</span>
            <kbd>M</kbd>
            <span>Voice input (record/stop)</span>
          </div>
          <div className="row">
            <kbd>Alt</kbd>
            <span>+</span>
            <kbd>Shift</kbd>
            <span>+</span>
            <kbd>P</kbd>
            <span>Toggle TTS replies</span>
          </div>
          <div className="row subtle">
            Press <kbd>?</kbd> to toggle
          </div>
        </div>
      )}
    </div>
  );
}
