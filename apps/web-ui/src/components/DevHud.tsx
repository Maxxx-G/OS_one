'use client';

import { useVoiceLoop } from '../state/voiceLoop';

/**
 * DevHud - Development diagnostic overlay for voice loop debugging.
 * Shows current phase, errors, transcript, and reply.
 * Only visible when NEXT_PUBLIC_DEVHUD=1 is set.
 */
export default function DevHud() {
  // Feature-flagged: only render when explicitly enabled
  if (process.env.NEXT_PUBLIC_DEVHUD !== '1') {
    return null;
  }

  const { phase, error, lastThought, lastReply, lastIntent } = useVoiceLoop();

  return (
    <div className="fixed bottom-2 right-2 text-xs px-3 py-2 rounded bg-neutral-900/90 border border-neutral-700 text-white shadow-lg max-w-sm">
      <div className="font-semibold text-cyan-400 mb-1">Voice Loop DevHud</div>
      
      <div className="flex items-center gap-2">
        <span className="opacity-70">Phase:</span>
        <span
          className={`font-bold ${
            phase === 'error'
              ? 'text-red-400'
              : phase === 'thinking'
              ? 'text-blue-400'
              : phase === 'speaking'
              ? 'text-green-400'
              : 'text-gray-400'
          }`}
        >
          {phase}
        </span>
      </div>

      {error && (
        <div className="text-red-400 mt-1">
          <span className="opacity-70">Error:</span> {error}
        </div>
      )}

      {lastIntent && lastIntent !== 'none' && (
        <div className="text-purple-400 mt-1">
          <span className="opacity-70">Intent:</span> {lastIntent}
        </div>
      )}

      {lastThought && (
        <div className="opacity-70 mt-1">
          <span>Thought:</span> {lastThought.slice(0, 60)}
          {lastThought.length > 60 ? '…' : ''}
        </div>
      )}

      {lastReply && (
        <div className="opacity-70 mt-1">
          <span>Reply:</span> {lastReply.slice(0, 80)}
          {lastReply.length > 80 ? '…' : ''}
        </div>
      )}
    </div>
  );
}
