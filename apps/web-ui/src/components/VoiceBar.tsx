import React, { useEffect, useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useChatRun } from '../hooks/useChatRun';

export const VoiceBar: React.FC = () => {
  const { start, stop, onResult, supported } = useVoice();
  const { run, busy } = useChatRun();
  const [state, setState] = useState<'idle'|'listening'|'error'>('idle');
  const [interim, setInterim] = useState('');
  const [finalTxt, setFinalTxt] = useState('');

  useEffect(() => {
    onResult((t, final) => {
      if (final) {
        setFinalTxt(t);
        setInterim('');
        setState('idle');
        run(t);
      } else {
        setInterim(t);
        setState('listening');
      }
    });
  }, [onResult, run]);

  // Hotkey: Alt+Space to toggle listen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        if (state !== 'listening') {
          const ok = start();
          if (!ok.ok) setState('error'); else setState('listening');
        } else {
          stop(); setState('idle');
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [state, start, stop]);

  const toggle = () => {
    if (state !== 'listening') { const ok = start(); if (!ok.ok) setState('error'); else setState('listening'); }
    else { stop(); setState('idle'); }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <button className="border rounded px-2 py-1" onClick={toggle} disabled={!supported}>
        {state === 'listening' ? 'Stop (Alt+Space)' : 'Talk (Alt+Space)'}
      </button>
      {!supported && <span className="text-xs text-gray-500">Speech API not supported in this browser</span>}
      {state === 'listening' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">listening… {interim}</span>}
      {!!finalTxt && <span className="text-xs text-gray-600">last: “{finalTxt}” {busy && '…'}</span>}
    </div>
  );
};
