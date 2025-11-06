'use client';

import { useEffect, useRef } from 'react';
import { useVoiceLoop } from '@/store/voiceLoop';

const VOICE_LOOP_ON = process.env.NEXT_PUBLIC_VOICE_LOOP === '1';
const TTS_STREAM_ON = process.env.NEXT_PUBLIC_TTS_STREAM === '1';

export default function VoiceLoop() {
  const { enabled, phase, lastTranscript, lastIntent, setPhase, setOutput, setError } = useVoiceLoop();

  const busyRef = useRef(false);

  useEffect(() => {
    if (!VOICE_LOOP_ON || !enabled) return;
    if (phase !== 'thinking') return;
    if (!lastTranscript.trim()) return;
    if (busyRef.current) return;

    const controller = new AbortController();
    busyRef.current = true;
    setError(null);

    const run = async () => {
      try {
        const response = await fetch('/api/voice/reason', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ transcript: lastTranscript, intent: lastIntent }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          thought?: string;
          reply?: string;
          error?: string;
        };

        if (!response.ok || !data?.ok) {
          const code = data?.error || (response.status === 503 ? 'llm_unavailable' : 'llm_bad_gateway');
          setError(code);
          setPhase('error');
          return;
        }

        setOutput(data.thought || '', data.reply || '');

        if (TTS_STREAM_ON && (data.reply || '').trim()) {
          setPhase('speaking');
          const spoken = await streamTts(data.reply || '');
          if (!spoken) {
            setError('tts_failed');
          }
        }

        setPhase('idle');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setError('network_error');
        setPhase('error');
      } finally {
        busyRef.current = false;
      }
    };

    run();

    return () => {
      controller.abort();
      busyRef.current = false;
    };
  }, [enabled, lastIntent, lastTranscript, phase, setError, setOutput, setPhase]);

  return null;
}

async function streamTts(text: string): Promise<boolean> {
  if (!text || !TTS_STREAM_ON) return false;
  if (typeof window === 'undefined') return false;

  let objectUrl: string | null = null;

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok || !response.body) {
      return false;
    }

    const mediaSource = new MediaSource();
    objectUrl = URL.createObjectURL(mediaSource);
    const audio = new Audio();
    audio.src = objectUrl;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    audio.addEventListener('abort', cleanup, { once: true });

    const playbackReady = new Promise<void>((resolve, reject) => {
      mediaSource.addEventListener(
        'sourceopen',
        () => {
          try {
            const mime = response.headers.get('content-type') || 'audio/mpeg';
            const sourceBuffer = mediaSource.addSourceBuffer(mime);
            const reader = response.body!.getReader();

            const pump = async (): Promise<void> => {
              const { done, value } = await reader.read();
              if (done) {
                try {
                  mediaSource.endOfStream();
                } catch {}
                resolve();
                return;
              }

              if (value && value.length) {
                await new Promise<void>((resolveAppend, rejectAppend) => {
                  const chunk = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
                  const onUpdate = () => {
                    sourceBuffer.removeEventListener('updateend', onUpdate);
                    resolveAppend();
                  };
                  sourceBuffer.addEventListener('updateend', onUpdate, { once: true });
                  try {
                    sourceBuffer.appendBuffer(chunk);
                  } catch (appendError) {
                    sourceBuffer.removeEventListener('updateend', onUpdate);
                    rejectAppend(appendError as Error);
                  }
                });
              }

              await pump();
            };

            void pump().catch(reject);
          } catch (error) {
            reject(error as Error);
          }
        },
        { once: true },
      );
    });

    const started = await audio.play().then(() => true).catch(() => false);
    if (!started) {
      cleanup();
      return false;
    }

    await playbackReady;
    return true;
  } catch (error) {
    console.warn('VoiceLoop TTS failed', error);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    return false;
  }
}
