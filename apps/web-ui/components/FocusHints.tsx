'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { hintColorCssVar } from '../lib/acclimation';

type Hint = {
  text: string;
  rect: DOMRect;
};

const ENABLED_KEY = 'os1.hints.enabled';
const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

function readEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

export default function FocusHints() {
  const [enabled, setEnabled] = useState<boolean>(() => readEnabled());
  const [hints, setHints] = useState<Hint[]>([]);

  const collectHints = useCallback(
    (forceEnabled?: boolean) => {
      if (typeof document === 'undefined') {
        return;
      }

      const activeEnabled = typeof forceEnabled === 'boolean' ? forceEnabled : enabled;
      if (!activeEnabled) {
        setHints([]);
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      const region = active?.closest('[data-hint-region]') as HTMLElement | null;
      if (!region) {
        setHints([]);
        return;
      }

      const nodes = region.querySelectorAll<HTMLElement>('[data-hotkey]');
      const nextHints: Hint[] = [];
      nodes.forEach((node) => {
        const label = node.getAttribute('data-hotkey');
        if (!label) {
          return;
        }
        const rect = node.getBoundingClientRect();
        nextHints.push({ text: label, rect });
      });
      setHints(nextHints);
    },
    [enabled],
  );

  useEffect(() => {
    const onFocus = () => {
      collectHints();
    };
    window.addEventListener('focusin', onFocus);
    window.addEventListener('resize', onFocus);
    window.addEventListener('scroll', onFocus, true);

    collectHints();

    return () => {
      window.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', onFocus);
      window.removeEventListener('scroll', onFocus, true);
    };
  }, [collectHints]);

  useEffect(() => {
    const onToggle = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === 'boolean') {
        setEnabled((prev) => (prev === detail ? prev : detail));
        collectHints(detail);
      }
    };

    window.addEventListener('os1:hints' as any, onToggle as EventListener);
    return () => {
      window.removeEventListener('os1:hints' as any, onToggle as EventListener);
    };
  }, [collectHints]);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const response = await fetch(`${ARCHON_URL}/v1/prefs`, { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const remoteEnabled = Boolean(data?.hints_enabled);
        if (!alive) {
          return;
        }
        if (remoteEnabled !== enabled) {
          try {
            window.localStorage.setItem(ENABLED_KEY, remoteEnabled ? '1' : '0');
          } catch {
            /* ignore */
          }
          setEnabled(remoteEnabled);
          try {
            window.dispatchEvent(new CustomEvent('os1:hints', { detail: remoteEnabled }));
          } catch {
            /* ignore */
          }
          collectHints(remoteEnabled);
        }
      } catch {
        /* ignore */
      }
    };

    pull();
    const interval = window.setInterval(pull, 15000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [collectHints, enabled]);

  return (
    <div className="focus-hints" style={{ cssText: hintColorCssVar() } as any} aria-hidden={!enabled}>
      {enabled &&
        hints.map((hint, index) => (
          <span
            key={`${hint.text}-${index}`}
            className="hint-badge"
            style={{ left: `${Math.round(hint.rect.left)}px`, top: `${Math.round(hint.rect.top - 16)}px` }}
          >
            {hint.text}
          </span>
        ))}
    </div>
  );
}
