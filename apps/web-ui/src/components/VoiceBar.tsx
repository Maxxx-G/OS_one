import React, { useEffect, useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useChatRun } from '../hooks/useChatRun';
import VoiceLoop from './VoiceLoop';
import ConfirmCenter from './ConfirmCenter';
import { useVoiceLoop } from '../state/voiceLoop';
import { useOverwatch } from '../../store/overwatch';

const VOICE_LOOP_ON = process.env.NEXT_PUBLIC_VOICE_LOOP === '1';
const MODEL_NAME = process.env.DEEPSEEK_MODEL || 'deepseek-r1:8b';

type HealthStatus = 'unknown' | 'good' | 'bad';

export const VoiceBar: React.FC = () => {
  const { start, stop, onResult, supported } = useVoice();
  const { run, busy } = useChatRun();
  const [state, setState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [interim, setInterim] = useState('');
  const [finalTxt, setFinalTxt] = useState('');
  const [health, setHealth] = useState<HealthStatus>('unknown');
  
  const voiceLoopStore = useVoiceLoop();
  const { enabled: loopEnabled, phase: loopPhase, lastIntent } = voiceLoopStore;
  
  const ow = useOverwatch();

  const pingHealth = async () => {
    try {
      const response = await fetch('/api/voice/health');
      const data = await response.json();
      setHealth(data.llmOk && data.ttsOk ? 'good' : 'bad');
    } catch {
      setHealth('bad');
    }
  };

  // Auto-ping health on mount if voice loop enabled
  useEffect(() => {
    if (VOICE_LOOP_ON) {
      pingHealth();
    }
  }, []);

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
          if (!ok.ok) setState('error');
          else setState('listening');
        } else {
          stop();
          setState('idle');
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [state, start, stop]);

  const toggle = () => {
    if (state !== 'listening') {
      const ok = start();
      if (!ok.ok) setState('error');
      else setState('listening');
    } else {
      stop();
      setState('idle');
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <button className="border rounded px-2 py-1" onClick={toggle} disabled={!supported}>
        {state === 'listening' ? 'Stop (Alt+Space)' : 'Talk (Alt+Space)'}
      </button>
      {!supported && (
        <span className="text-xs text-gray-500">Speech API not supported in this browser</span>
      )}
      {state === 'listening' && (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          listening {interim}
        </span>
      )}
      {!!finalTxt && (
        <span className="text-xs text-gray-600">
          last: "{finalTxt}" {busy && ''}
        </span>
      )}
      
      {VOICE_LOOP_ON && (
        <>
          <div className="border-l h-6 mx-2" />
          <div className="flex items-center gap-2" title={`Voice Loop • Model: ${MODEL_NAME}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={loopEnabled}
                onChange={(e) => voiceLoopStore.setEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs">Voice Loop</span>
            </label>
            {loopEnabled && (
              <>
                <span
                  className={`text-[10px] px-2 py-1 rounded ${
                    ow.active ? 'bg-green-700 text-white' : 'bg-purple-700 text-white'
                  }`}
                  title="Overwatch monitoring status"
                >
                  {ow.active ? 'Overwatch: Active' : 'Overwatch: Paused'}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    loopPhase === 'thinking'
                      ? 'bg-blue-100 text-blue-800'
                      : loopPhase === 'speaking'
                      ? 'bg-green-100 text-green-800'
                      : loopPhase === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Phase: {loopPhase}
                </span>
                {lastIntent && lastIntent !== 'none' && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                    Intent: {lastIntent}
                  </span>
                )}
                <button
                  onClick={pingHealth}
                  className={`text-[10px] px-2 py-1 rounded ${
                    health === 'good'
                      ? 'bg-green-700 text-white'
                      : health === 'bad'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                  title="Check voice endpoints health"
                >
                  {health === 'unknown'
                    ? 'Health?'
                    : health === 'good'
                    ? 'Health: OK'
                    : 'Health: Check'}
                </button>
                <button
                  onClick={() => window.dispatchEvent(new Event('os1:actionlog:toggle'))}
                  className="text-[10px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
                  title="Toggle Action Log"
                >
                  Log
                </button>
              </>
            )}
          </div>
        </>
      )}
      
      {VOICE_LOOP_ON && <VoiceLoop />}
      {VOICE_LOOP_ON && <ConfirmCenter />}
    </div>
  );
};
