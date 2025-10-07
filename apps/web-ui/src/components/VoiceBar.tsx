import React, { useEffect, useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useChatRun } from '../hooks/useChatRun';
import VoiceLoop from './VoiceLoop';
import ConfirmCenter from './ConfirmCenter';
import VoiceMetricsPanel from './VoiceMetricsPanel';
import { useVoiceLoop } from '../state/voiceLoop';
import { useOverwatch } from '../../store/overwatch';
import { initSecCommsDevAck } from '../../lib/seccomms/devAck';
import { getVoices, invalidateVoicesCache, type Voice } from '../../lib/voice/voicesCache';
import { fetchPolicy, getLastUpdated, clearPolicy } from '../../lib/voice/confirmationPolicy';
import { getMemoryStats, clearMemory } from '../../lib/voice/conversationMemory';

const VOICE_LOOP_ON = process.env.NEXT_PUBLIC_VOICE_LOOP === '1';
const MODEL_NAME = process.env.DEEPSEEK_MODEL || 'deepseek-r1:8b';
const AURL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

type HealthStatus = 'unknown' | 'good' | 'bad';

export const VoiceBar: React.FC = () => {
  const { start, stop, onResult, supported } = useVoice();
  const { run, busy } = useChatRun();
  const [state, setState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [interim, setInterim] = useState('');
  const [finalTxt, setFinalTxt] = useState('');
  const [health, setHealth] = useState<HealthStatus>('unknown');
  const [ttsDisabled, setTtsDisabled] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [policyLastUpdated, setPolicyLastUpdated] = useState<number | null>(null);
  const [memoryStats, setMemoryStats] = useState({ exchangeCount: 0, turnsSinceSummary: 0, hasSummary: false, lastSummaryAt: null as number | null });
  
  const voiceLoopStore = useVoiceLoop();
  const { enabled: loopEnabled, phase: loopPhase, lastIntent, pendingQuestion, pendingTopic } = voiceLoopStore;
  
  const ow = useOverwatch();

  const pingHealth = async () => {
    try {
      const response = await fetch('/api/voice/health');
      const data = await response.json();
      setHealth(data.llmOk && data.ttsOk ? 'good' : 'bad');
      
      // Auto-clear TTS disabled badge if status recovers
      if (data.ttsOk && ttsDisabled) {
        setTtsDisabled(false);
      }
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

  // Listen for TTS failure events
  useEffect(() => {
    const onTtsFailure = () => setTtsDisabled(true);
    window.addEventListener('os1:tts:disabled', onTtsFailure);
    return () => window.removeEventListener('os1:tts:disabled', onTtsFailure);
  }, []);

  // Periodic health check to auto-clear TTS disabled badge
  useEffect(() => {
    if (!ttsDisabled) return;
    
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700'}/v1/audio/status`);
        const j = await r.json();
        if (j?.tts_enabled) {
          setTtsDisabled(false);
        }
      } catch {
        // Keep disabled state if probe fails
      }
    }, 5000); // Check every 5s
    
    return () => clearInterval(interval);
  }, [ttsDisabled]);

  // Initialize SEC-COMMS dev auto-ack for localhost
  useEffect(() => {
    const dispose = initSecCommsDevAck();
    return () => {
      if (typeof dispose === 'function') {
        dispose();
      }
    };
  }, []);

  // Load voices on mount
  useEffect(() => {
    if (!VOICE_LOOP_ON) return;
    getVoices().then(setVoices);
  }, []);

  // Update memory stats periodically
  useEffect(() => {
    if (!VOICE_LOOP_ON) return;
    
    const updateStats = () => setMemoryStats(getMemoryStats());
    updateStats(); // Initial load
    
    const interval = setInterval(updateStats, 3000); // Update every 3s
    return () => clearInterval(interval);
  }, []);

  // Load persisted voice selection from prefs
  useEffect(() => {
    if (!VOICE_LOOP_ON) return;
    fetch(`${AURL}/v1/prefs`)
      .then(r => r.json())
      .then(data => {
        if (data?.tts_voice_id) {
          setSelectedVoice(data.tts_voice_id);
        }
      })
      .catch(() => {});
  }, []);

  const handleVoiceChange = async (voiceId: string) => {
    // Optimistic update
    setSelectedVoice(voiceId);

    // Persist to backend
    try {
      await fetch(`${AURL}/v1/prefs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tts_voice_id: voiceId }),
      });
    } catch (err) {
      console.warn('[VoicePicker] Failed to update pref:', err);
    }
  };

  const refreshVoices = async () => {
    invalidateVoicesCache();
    const fresh = await getVoices();
    setVoices(fresh);
  };

  const refreshConfirmPolicy = async () => {
    clearPolicy();
    await fetchPolicy();
    setPolicyLastUpdated(getLastUpdated());
  };

  const handleClearMemory = () => {
    if (confirm('Clear conversation memory?')) {
      clearMemory();
      setMemoryStats(getMemoryStats());
    }
  };

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

  // Auto re-arm listen when voice loop asks a question
  useEffect(() => {
    const onAutoRearm = () => {
      if (VOICE_LOOP_ON && loopEnabled && state === 'idle') {
        const ok = start();
        if (ok.ok) {
          setState('listening');
        }
      }
    };
    window.addEventListener('os1:voice:auto-rearm', onAutoRearm as EventListener);
    return () => window.removeEventListener('os1:voice:auto-rearm', onAutoRearm as EventListener);
  }, [VOICE_LOOP_ON, loopEnabled, state, start]);

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
        <span className={`text-xs px-2 py-1 rounded ${
          loopPhase === 'listening' 
            ? 'bg-green-100 text-green-800 animate-pulse' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {loopPhase === 'listening' ? '🎤 Auto-listening' : `listening ${interim}`}
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
                {pendingQuestion && (
                  <span 
                    className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                    title={`Follow-up expected: "${pendingQuestion}"`}
                  >
                    🤔 {pendingTopic ? `Expecting: ${pendingTopic}` : 'Follow-up'}
                    <button
                      onClick={() => voiceLoopStore.setPendingQuestion(null)}
                      className="text-[10px] hover:text-amber-900"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </span>
                )}
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
                
                {/* Memory Status Indicator */}
                <div className="flex items-center gap-1">
                  <span 
                    className={`text-[10px] px-2 py-1 rounded ${
                      memoryStats.hasSummary 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-neutral-700 text-white'
                    }`}
                    title={
                      memoryStats.lastSummaryAt 
                        ? `${memoryStats.exchangeCount} turns, summary at ${new Date(memoryStats.lastSummaryAt).toLocaleTimeString()}` 
                        : `${memoryStats.exchangeCount} turns (${memoryStats.turnsSinceSummary} until summary)`
                    }
                  >
                    💭 {memoryStats.exchangeCount} {memoryStats.hasSummary ? '✓' : `(${memoryStats.turnsSinceSummary}/5)`}
                  </span>
                  {memoryStats.exchangeCount > 0 && (
                    <button
                      onClick={handleClearMemory}
                      className="text-[10px] px-1 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                      title="Clear conversation memory"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Confirmation Policy Refresh */}
                <button
                  onClick={refreshConfirmPolicy}
                  className="text-[10px] px-2 py-1 rounded bg-purple-800 hover:bg-purple-700"
                  title={policyLastUpdated ? `Policy loaded ${new Date(policyLastUpdated).toLocaleTimeString()}` : 'Reload confirmation policy'}
                >
                  Policy ⟳
                </button>
                
                {/* Voice Picker */}
                <div className="flex items-center gap-1">
                  <select
                    value={selectedVoice}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    disabled={voices.length === 0}
                    className="text-[10px] px-2 py-1 rounded bg-neutral-800 text-white border border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={voices.length === 0 ? 'No voices available' : 'Select TTS voice'}
                  >
                    <option value="">Default Voice</option>
                    {voices.map(v => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {health === 'bad' && (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="TTS health warning" />
                  )}
                  <button
                    onClick={refreshVoices}
                    className="text-[10px] px-1 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                    title="Refresh voices"
                  >
                    ⟳
                  </button>
                </div>
                
                {/* Metrics Panel Toggle */}
                <VoiceMetricsPanel />
              </>
            )}
          </div>
        </>
      )}
      
      {VOICE_LOOP_ON && <VoiceLoop />}
      {VOICE_LOOP_ON && <ConfirmCenter />}
      
      {ttsDisabled && (
        <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-800">
          <span>⚠️ TTS Disabled</span>
          <button
            onClick={() => setTtsDisabled(false)}
            className="text-[10px] px-1 hover:underline"
            title="Dismiss (will auto-clear when service recovers)"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
