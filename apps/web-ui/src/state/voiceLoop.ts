'use client';

import { useState } from 'react';
import { detectFollowUp } from '../../lib/voice/followUpDetector';

export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface VoiceLoopState {
  enabled: boolean;
  phase: VoicePhase;
  lastThought: string;
  lastReply: string;
  lastIntent: string;
  error: string | null;
  pendingQuestion: string | null;
  pendingTopic: string | null;
}

/**
 * Simple hook-based store for Voice Loop state.
 * Alternative to Zustand for minimal dependency footprint.
 */
export function useVoiceLoop() {
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [lastThought, setLastThought] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [lastIntent, setLastIntent] = useState('none');
  const [error, setErrorRaw] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);

  const setError = (err: string | null) => {
    setErrorRaw(err);
    if (err) setPhase('error');
  };

  const setReply = (reply: string) => {
    setLastReply(reply);
    // Use enhanced interrogative detection
    const followUp = detectFollowUp(reply);
    if (followUp.isQuestion) {
      setPendingQuestion(reply);
      setPendingTopic(followUp.topic);
    } else {
      setPendingQuestion(null);
      setPendingTopic(null);
    }
  };

  const reset = () => {
    setEnabled(false);
    setPhase('idle');
    setLastThought('');
    setLastReply('');
    setLastIntent('none');
    setErrorRaw(null);
    setPendingQuestion(null);
    setPendingTopic(null);
  };

  return {
    enabled,
    phase,
    lastThought,
    lastReply,
    lastIntent,
    error,
    pendingQuestion,
    pendingTopic,
    setEnabled,
    setPhase,
    setThought: setLastThought,
    setReply,
    setIntent: setLastIntent,
    setError,
    setPendingQuestion,
    reset,
  };
}
