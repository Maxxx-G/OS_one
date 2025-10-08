'use client';
import { useState, useEffect } from 'react';
import { overwatchUI } from '../store/overwatchUI';
import { useOverwatch } from '../store/overwatch';

export default function OverwatchSidebar() {
  const [open, setOpen] = useState(false);
  const { active, pause, resume } = useOverwatch();

  useEffect(() => {
    setOpen(overwatchUI.get());
    const unsub = overwatchUI.subscribe(() => setOpen(overwatchUI.get()));
    return () => { unsub(); };
  }, []);

  return (
    <>
      {/* Skinny tab */}
      <button
        onClick={() => overwatchUI.toggle()}
        className="fixed right-0 top-1/3 z-50 bg-zinc-800 hover:bg-zinc-700 text-white px-1 py-3 rounded-l text-xs font-mono transition-colors"
        title="Toggle Overwatch panel"
      >
        OW
      </button>

      {/* Floating panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-zinc-900 border-l border-zinc-700 rounded-l-2xl shadow-2xl z-40 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Overwatch</h2>
            <button
              onClick={() => overwatchUI.set(false)}
              className="text-zinc-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                active ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {active ? 'Active' : 'Paused'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={pause}
              disabled={!active}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded font-medium text-sm transition-colors"
            >
              Pause
            </button>
            <button
              onClick={resume}
              disabled={active}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded font-medium text-sm transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
