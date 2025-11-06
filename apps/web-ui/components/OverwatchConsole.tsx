'use client';
import React from 'react';

export default function OverwatchConsole() {
  const [open, setOpen] = React.useState(false);
  const [cmd, setCmd] = React.useState('');

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  async function submit() {
    (window as any).os1Audit?.log?.('ow-command', { cmd });
    await fetch(
      (process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700') + '/v1/overwatch/dispatch',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: cmd })
      }
    );
    setCmd('');
  }

  return open ? (
    <div className="overwatch-console" role="dialog" aria-label="Overwatch">
      <input
        className="input sm"
        placeholder="/overwatch make stb Phase-2…"
        value={cmd}
        onChange={e => setCmd(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit();
        }}
      />
      <button className="btn sm" onClick={submit}>
        Run
      </button>
    </div>
  ) : null;
}
