'use client';

import React, { useCallback, useEffect, useState } from 'react';

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const PREFS_URL = `${ARCHON_URL}/v1/prefs`;

export default function PaletteToggle() {
  const [val, setVal] = useState<'normal' | 'cb_safe'>('normal');

  useEffect(() => {
    fetch(PREFS_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.hint_palette) {
          setVal(j.hint_palette);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const onChange = useCallback(async () => {
    const next = val === 'normal' ? 'cb_safe' : 'normal';
    setVal(next);
    try {
      await fetch(PREFS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hint_palette: next }),
      });
    } catch {
      /* ignore */
    }
    try {
      window.dispatchEvent(new CustomEvent('os1:toast', { detail: `Palette: ${next}` }));
    } catch {
      /* ignore */
    }
  }, [val]);

  return (
    <button
      className="btn sm ghost"
      type="button"
      onClick={onChange}
      data-hotkey="Alt+P"
      title="Toggle hint palette"
    >
      {val === 'normal' ? 'Pal:Normal' : 'Pal:CB-safe'}
    </button>
  );
}
