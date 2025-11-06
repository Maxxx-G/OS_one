'use client';
import { useState, useEffect } from 'react';
import { overwatchUI } from '../store/overwatchUI';
import { useOverwatch } from '../store/overwatch';
import OverwatchMetrics from './OverwatchMetrics';

export default function OverwatchSidebar() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'right' | 'left' | 'top' | 'bottom'>('right');
  const { active, pause, resume } = useOverwatch();

  useEffect(() => {
    setOpen(overwatchUI.get());
    setSide(overwatchUI.getSnap());
    const unsub = overwatchUI.subscribe(() => {
      setOpen(overwatchUI.get());
      setSide(overwatchUI.getSnap());
    });
    return () => { unsub(); };
  }, []);

  return (
    <div className="pointer-events-none">
      {/* Skinny tab */}
      <button
        onClick={() => overwatchUI.toggle()}
        className={`fixed z-20 pointer-events-auto bg-zinc-800 hover:bg-zinc-700 text-white px-1 py-3 text-xs font-mono transition-colors ${
          side === 'right' ? 'right-0 top-1/3 rounded-l' : ''
        }${side === 'left' ? 'left-0 top-1/3 rounded-r' : ''
        }${side === 'top' ? 'top-0 left-1/2 -translate-x-1/2 rounded-b' : ''
        }${side === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 rounded-t' : ''}`}
        title="Toggle Overwatch panel"
      >
        OW
      </button>

      {/* Floating panel */}
      <div
        className={`fixed z-20 pointer-events-auto bg-zinc-900 border-zinc-700 shadow-2xl transition-all duration-300 ${
          side === 'right' ? `right-0 top-0 h-screen w-80 border-l rounded-l-2xl ${open ? 'translate-x-0' : 'translate-x-full'}` : ''
        }${side === 'left' ? `left-0 top-0 h-screen w-80 border-r rounded-r-2xl ${open ? 'translate-x-0' : '-translate-x-full'}` : ''
        }${side === 'top' ? `top-0 left-0 w-full h-64 border-b rounded-b-2xl ${open ? 'translate-y-0' : '-translate-y-full'}` : ''
        }${side === 'bottom' ? `bottom-0 left-0 w-full h-64 border-t rounded-t-2xl ${open ? 'translate-y-0' : 'translate-y-full'}` : ''}`}
        aria-hidden={!open}
      >
        <div className="p-6 h-full flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Overwatch</h2>
            <div className="flex gap-2">
              <select
                className="text-xs bg-zinc-800 text-white rounded px-2 py-1"
                value={side}
                onChange={(e) => overwatchUI.setSnap(e.target.value as any)}
              >
                {(['right', 'left', 'top', 'bottom'] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => overwatchUI.set(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
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

          {/* Metrics */}
          <div className="flex-1 overflow-auto">
            <OverwatchMetrics />
          </div>
        </div>
      </div>
    </div>
  );
}
