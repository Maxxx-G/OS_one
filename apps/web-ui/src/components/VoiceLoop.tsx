'use client';

import { useEffect, useRef } from 'react';
import { useVoiceLoop } from '../state/voiceLoop';
import { classifyIntent } from '../../lib/voice/intent';
import { performVoiceAction } from '../../lib/voice/actions';
import { fetchWithRetry } from '../../lib/net/retry';
import { addLog } from '../../lib/voice/actionLog';
import { detectFollowUp } from '../../lib/voice/followUpDetector';
import { addMetric } from '../../lib/voice/voiceMetrics';

/**
 * VoiceLoop orchestrator component.
 * Manages the voice reasoning loop: listen → think (DeepSeek) → speak (optional TTS).
 * Controlled by the voiceLoop store and NEXT_PUBLIC_VOICE_LOOP flag.
 */
export default function VoiceLoop() {
  const {
    enabled,
    phase,
    setPhase,
    setThought,
    setReply,
    setIntent,
    setError,
    pendingQuestion,
    setPendingQuestion,
  } = useVoiceLoop();

  const processingRef = useRef(false);

  // Helper for confirmation prompts
  const requestConfirmation = async (message: string): Promise<boolean> => {
    const id = Math.random().toString(36).slice(2);
    return new Promise<boolean>((resolve) => {
      const onResult = (e: Event) => {
        const detail = (e as CustomEvent<{ id: string; ok: boolean }>).detail;
        if (detail?.id === id) {
          window.removeEventListener('os1:confirm:result', onResult as EventListener);
          resolve(!!detail.ok);
        }
      };
      window.addEventListener('os1:confirm:result', onResult as EventListener);
      window.dispatchEvent(
        new CustomEvent('os1:confirm:request', {
          detail: { id, message },
        })
      );
    });
  };

  useEffect(() => {
    if (!enabled || phase !== 'listening' || processingRef.current) {
      return;
    }

    // Simulated: In real implementation, this would be triggered by STT completion
    // For now, we'll just demonstrate the flow
    const handleTranscript = async (transcript: string) => {
      if (!transcript.trim()) {
        setPhase('idle');
        return;
      }

      processingRef.current = true;
      setPhase('thinking');

      try {
        // Classify intent
        const intent = classifyIntent(transcript);
        setIntent(intent);
        
        // Perform action if intent detected
        if (intent !== 'none') {
          // Confirmation for destructive/sensitive actions
          if (intent === 'overwatch.pause' || intent === 'overwatch.resume') {
            const message = intent === 'overwatch.pause' 
              ? 'Pause Overwatch monitoring now?' 
              : 'Resume Overwatch monitoring now?';
            
            const confirmed = await requestConfirmation(message);

            if (!confirmed) {
              addLog({ ts: Date.now(), intent, transcript, result: 'cancel' });
              addMetric({ type: 'confirm', outcome: 'cancel' });
              setPhase('idle');
              processingRef.current = false;
              return;
            }
            addMetric({ type: 'confirm', outcome: 'ok' });
          }

          const actionResult = await performVoiceAction(intent, transcript);
          if (actionResult.ok) {
            // Action succeeded - skip LLM reasoning and provide feedback
            addLog({
              ts: Date.now(),
              intent,
              transcript,
              result: 'ok',
              note: actionResult.uiHint,
            });
            setReply(actionResult.uiHint || 'Action completed');
            setPhase('speaking');
            // Optional: TTS feedback here if needed
            // await ttsStreamIfEnabled(actionResult.uiHint || 'Done');
            setPhase('idle');
            processingRef.current = false;
            return;
          }
          // Action failed
          addLog({ ts: Date.now(), intent, transcript, result: 'fail' });
        }
        
        // No action or action failed - fall back to LLM reasoning
        const res = await fetchWithRetry('/api/voice/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript, 
            intent,
            previousQuestion: pendingQuestion, // Pass follow-up context
          }),
        }, { timeoutMs: 8000, retries: 2, baseDelayMs: 300 });

        const data = await res.json();
        
        if (!data.ok) {
          throw new Error(data.error || 'llm_error');
        }

        setThought(data.thought || '');
        setReply(data.reply || ''); // This will auto-detect question and update pendingQuestion
        setError(null);

        // Optional TTS stream
        const ttsEnabled = process.env.NEXT_PUBLIC_TTS_STREAM === '1';
        if (ttsEnabled && data.reply) {
          setPhase('speaking');
          await streamTTS(data.reply);
        }

        // Auto re-arm listen if reply asked a question
        const replyIsQuestion = data.reply && detectFollowUp(data.reply).isQuestion;
        if (replyIsQuestion && enabled) {
          // Brief pause before re-arm (let TTS finish settling)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Dispatch auto-listen event for VoiceBar to handle
          window.dispatchEvent(new CustomEvent('os1:voice:auto-rearm'));
          
          // Set listening phase with 30s timeout
          setPhase('listening');
          const autoListenTimeout = setTimeout(() => {
            if (phase === 'listening') {
              setPhase('idle');
            }
          }, 30000);
          
          // Store timeout ref for cleanup (simplified - in production use ref)
          (window as any).__os1_auto_listen_timeout = autoListenTimeout;
        } else {
          setPhase('idle');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        setPhase('error');
      } finally {
        processingRef.current = false;
      }
    };

    // In a real implementation, this would be called by STT result handler
    // For now, this is a placeholder
  }, [enabled, phase, setPhase, setThought, setReply, setError, setIntent, pendingQuestion]);

  return null; // This is an invisible orchestrator component
}

/**
 * Stream TTS audio if enabled.
 * Assumes /api/tts/stream endpoint exists from existing voice infrastructure.
 */
async function streamTTS(text: string): Promise<void> {
  try {
    const res = await fetch('/api/tts/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.warn('TTS stream failed:', res.status);
      return;
    }

    // Stream audio playback
    const reader = res.body?.getReader();
    if (!reader) return;

    const audioContext = new AudioContext();
    const chunks: BlobPart[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks and play
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  } catch (err) {
    console.warn('TTS playback error:', err);
  }
}
