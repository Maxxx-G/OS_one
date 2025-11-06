'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ensureOS1Voice } from '../lib/voice/os1Voice';

/**
 * Log audit event via global audit sink
 */
const logAudit = (type: string, data?: Record<string, unknown>) => {
  try {
    (window as any).os1Audit?.log?.(type, data);
  } catch {
    // ignore audit logging failures
  }
};

type VoiceControlsProps = {
  onTranscriptReady: (text: string) => void;
};

export default function VoiceControls({ onTranscriptReady }: VoiceControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Load TTS preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('os1.voice.tts_enabled');
      if (stored === '1') {
        setIsTtsEnabled(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTts = useCallback(() => {
    setIsTtsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('os1.voice.tts_enabled', next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      logAudit('voice-tts-toggle', { enabled: next });
      return next;
    });
  }, []);

  const startRecording = useCallback(async () => {
    setPermissionDenied(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Use webm/opus if available, fallback to webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Send to transcription
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      logAudit('voice-start', { mimeType });
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        logAudit('voice-start', { error: 'permission_denied' });
      } else {
        logAudit('voice-start', { error: err.message || 'unknown' });
      }
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      logAudit('voice-stop', {});
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsTranscribing(true);

      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.status}`);
        }

        const result = await response.json();
        const text = result.text || '';

        if (text.trim()) {
          logAudit('voice-transcribe-ok', { length: text.length });
          onTranscriptReady(text);
        } else {
          logAudit('voice-transcribe-err', { reason: 'empty_result' });
        }
      } catch (error) {
        const err = error as Error;
        logAudit('voice-transcribe-err', { error: err.message || 'unknown' });
        console.error('Transcription error:', error);
      } finally {
        setIsTranscribing(false);
      }
    },
    [onTranscriptReady],
  );

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Keyboard shortcuts: Alt+M (record), Alt+Shift+P (TTS toggle)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+M: Toggle recording
      if (event.altKey && event.key.toLowerCase() === 'm' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        toggleRecording();
      }

      // Alt+Shift+P: Toggle TTS
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'p' && !event.ctrlKey) {
        event.preventDefault();
        toggleTts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRecording, toggleTts]);

  // Expose TTS state globally for ChatSequencer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const g = ensureOS1Voice();
      g.isTtsEnabled = () => isTtsEnabled;
    }
  }, [isTtsEnabled]);

  return (
    <div className="voice-ctrls" role="group" aria-label="Voice Controls">
      <button
        type="button"
        className={`voice-mic-btn ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
        onClick={toggleRecording}
        disabled={isTranscribing}
        aria-pressed={isRecording}
        title={isRecording ? 'Stop recording (Alt+M)' : 'Start voice input (Alt+M)'}
      >
        {isRecording ? (
          <>
            <span className="recording-dot" aria-hidden="true" />
            <span>Recording...</span>
          </>
        ) : isTranscribing ? (
          <span>Transcribing...</span>
        ) : (
          <>
            <span className="mic-icon" aria-hidden="true">
              🎤
            </span>
            <span className="sr-only">Voice Input</span>
          </>
        )}
      </button>

      <button
        type="button"
        className={`voice-tts-btn ${isTtsEnabled ? 'enabled' : ''}`}
        onClick={toggleTts}
        aria-pressed={isTtsEnabled}
        title={isTtsEnabled ? 'Disable TTS replies (Alt+Shift+P)' : 'Enable TTS replies (Alt+Shift+P)'}
      >
        <span className="tts-icon" aria-hidden="true">
          🔊
        </span>
        <span className="sr-only">{isTtsEnabled ? 'TTS On' : 'TTS Off'}</span>
      </button>

      {permissionDenied && (
        <div className="voice-error" role="alert">
          <span className="text-sm text-red-600">Microphone permission denied</span>
        </div>
      )}
    </div>
  );
}
