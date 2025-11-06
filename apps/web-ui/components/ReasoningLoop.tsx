'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getVoiceStatus } from '../lib/voice/os1Voice';

const SEC_ACK_KEY = 'os1.seccomms.ack';
const DIRECT_DISABLED =
  (process.env.NEXT_PUBLIC_DIRECT_DISABLED || 'false').toLowerCase() === 'true';

export default function ReasoningLoop() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'muted'>('idle');
  const loopRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // Audit helper
  const logAudit = useCallback((type: string, data?: unknown) => {
    if (typeof window !== 'undefined' && window.os1Audit) {
      window.os1Audit.log(type, data);
    }
  }, []);

  // Check SEC-COMMS acknowledgment
  const checkSecGate = useCallback((): boolean => {
    if (DIRECT_DISABLED) {
      return false;
    }
    if (typeof window === 'undefined') return false;
    const ack = localStorage.getItem(SEC_ACK_KEY);
    return ack === 'true';
  }, []);

  // Trigger Alt+M programmatically
  const triggerRecording = useCallback(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'm',
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  }, []);

  // Main loop tick
  const runLoopTick = useCallback(async () => {
    if (!isRunningRef.current) return;

    try {
      // Check voice status from global
      const voiceStatus = getVoiceStatus();
      
      // Wait if not idle
      if (voiceStatus !== 'idle') {
        setStatus(voiceStatus === 'muted' ? 'muted' : 'processing');
        return;
      }

      // Check if TTS is muted
      if (window.os1Voice?.isTtsEnabled?.() === false) {
        setStatus('muted');
        logAudit('voice-reasoning-tick', { skip: 'tts_muted' });
        return;
      }

      // Trigger recording cycle
      setStatus('listening');
      logAudit('voice-reasoning-tick', { action: 'trigger_recording' });
      triggerRecording();
      
    } catch (error) {
      const err = error as Error;
      logAudit('voice-reasoning-error', { error: err.message || 'unknown' });
      console.error('Reasoning loop error:', error);
    }
  }, [triggerRecording, logAudit]);

  // Start loop
  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;

    // SEC-COMMS gate check
    if (!checkSecGate()) {
      logAudit('voice-reasoning-start', { blocked: 'sec_gate' });
      alert('SEC-COMMS acknowledgment required for reasoning loop');
      return;
    }

    isRunningRef.current = true;
    setActive(true);
    setStatus('idle');
    logAudit('voice-reasoning-start', {});

    // Poll every 2 seconds
    loopRef.current = setInterval(() => {
      void runLoopTick();
    }, 2000);
  }, [checkSecGate, runLoopTick, logAudit]);

  // Stop loop
  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    isRunningRef.current = false;
    setActive(false);
    setStatus('idle');
    logAudit('voice-reasoning-stop', {});
  }, [logAudit]);

  // Toggle handler
  const toggle = useCallback(() => {
    if (active) {
      stopLoop();
    } else {
      startLoop();
    }
  }, [active, startLoop, stopLoop]);

  // Alt+R hotkey
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
      }
    };
  }, []);

  const statusLabel = status === 'muted' ? 'Muted' : active ? 'On' : 'Off';
  const statusColor = status === 'muted' 
    ? 'bg-orange-600' 
    : active 
      ? 'bg-green-600' 
      : 'bg-gray-500';

  return (
    <div className="reasoning-pill">
      <div className="flex items-center gap-2">
        <span className={`reasoning-status ${statusColor}`} />
        <span className="text-xs font-medium">Reasoning: {statusLabel}</span>
        <button
          onClick={toggle}
          className="reasoning-btn"
          title="Toggle reasoning loop (Alt+R)"
          aria-label={active ? 'Stop reasoning loop' : 'Start reasoning loop'}
        >
          {active ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
}
