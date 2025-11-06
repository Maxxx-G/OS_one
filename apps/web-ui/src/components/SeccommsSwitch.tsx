import React, { useState } from 'react';
import { useSeccomms } from '../state/SeccommsContext';

export const SeccommsSwitch: React.FC = () => {
  const { mode, setMode, pinnedPeer, setPinnedPeer, arm, expiresAt } = useSeccomms();
  const [seconds, setSeconds] = useState(900); // default 15 minutes
  const remaining = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`px-2 py-1 rounded ${mode === 'seccomms_on' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
      >
        {mode === 'seccomms_on'
          ? `SEC-COMMS: ON${remaining ? ` (${remaining}s)` : ''}`
          : 'SEC-COMMS: OFF'}
      </span>
      <input
        className="border rounded px-2 py-1 w-64"
        placeholder="pinned peer fingerprint (hex)"
        value={pinnedPeer}
        onChange={(e) => setPinnedPeer(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 w-24"
        type="number"
        min={60}
        value={seconds}
        onChange={(e) => setSeconds(parseInt(e.target.value || '0', 10))}
        title="timebox seconds"
      />
      {mode === 'local_only' ? (
        <button
          className="border rounded px-2 py-1"
          onClick={() => {
            setMode('seccomms_on');
            arm(seconds);
          }}
        >
          Enable
        </button>
      ) : (
        <button className="border rounded px-2 py-1" onClick={() => setMode('local_only')}>
          Disable
        </button>
      )}
    </div>
  );
};
