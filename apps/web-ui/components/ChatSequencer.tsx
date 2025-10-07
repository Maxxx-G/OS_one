'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/SessionStore';
import { pruneHistory, streamChat } from '@/lib/chatClient';
import VoiceControls from './VoiceControls';
import VoiceToolbar from './VoiceToolbar';
import { Howl } from 'howler';
import {
  setVoiceStatus as setGlobalVoiceStatus,
  isTtsEnabled as getTtsEnabled,
} from '../lib/voice/os1Voice';

const AURL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

async function transcribeBlob(blob: Blob) {
  const fd = new FormData();
  fd.append('file', blob, 'speech.wav');
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 10000);
  try {
    const r = await fetch('/api/archon/transcribe', { method: 'POST', body: fd, signal: ac.signal });
    clearTimeout(timeout);
    const json = await r.json().catch(() => ({ ok: false, error: 'bad_json' }));
    if (!r.ok || json?.ok === false) {
      throw new Error(json?.error || `stt_error_${r.status}`);
    }
    return json;
  } catch (err) {
    clearTimeout(timeout);
    console.warn('[STT] transcribe failed:', err);
    return { ok: false, error: 'stt_unavailable' } as const;
  }
}

function useRecorder(onDone: (b: Blob) => void, onStateChange?: (active: boolean) => void) {
  const recRef = React.useRef<MediaRecorder | null>(null);
  const [rec, setRec] = React.useState(false);
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        onStateChange?.(false);
        onDone(new Blob(chunks, { type: 'audio/wav' }));
      };
      recRef.current = rec;
      rec.start();
      setRec(true);
      onStateChange?.(true);
    } catch (err) {
      onStateChange?.(false);
      throw err;
    }
  }
  function stop() {
    recRef.current?.stop();
    setRec(false);
    onStateChange?.(false);
  }
  return { rec, start, stop };
}

type Role = 'user' | 'assistant' | 'system';

type Msg = {
  id: string;
  role: Role;
  text: string;
  ts: string;
};

const LS_KEY = 'os1.chat.history.v1';
const SEC_ACK_KEY = 'os1.seccomms.ack';
const SYSTEM_PREFACE_KEY = 'os1.chat.systemPreface';
const DIRECT_DISABLED =
  (process.env.NEXT_PUBLIC_DIRECT_DISABLED || 'false').toLowerCase() === 'true';

const logAudit = (type: string, data?: Record<string, unknown>) => {
  try {
    (window as any).os1Audit?.log?.(type, data);
  } catch {
    // ignore audit logging failures
  }
};

const sanitizeHistory = (raw: unknown): Msg[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const cleaned = raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const id = typeof (entry as any).id === 'string' ? (entry as any).id : crypto.randomUUID();
      const role = (entry as any).role;
      const roleValue: Role = role === 'assistant' || role === 'system' ? role : 'user';
      const text = typeof (entry as any).text === 'string' ? (entry as any).text : '';
      const ts =
        typeof (entry as any).ts === 'string' ? (entry as any).ts : new Date().toISOString();

      if (!text) {
        return null;
      }

      return { id, role: roleValue, text, ts };
    })
    .filter((item): item is Msg => Boolean(item));

  return pruneHistory(cleaned);
};

const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }

  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError',
  );
};

const readSystemPreface = (): string | null => {
  try {
    return window.localStorage.getItem(SYSTEM_PREFACE_KEY);
  } catch {
    return null;
  }
};

export default function ChatSequencer({ children }: { children?: React.ReactNode }) {
  const { mode, voiceStatus, setVoiceStatus } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [typing, setTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string>('');
  const draftRef = useRef(draft);
  const sendTextRef = useRef<(text: string) => void>(() => {});

  const { rec, start, stop } = useRecorder(
    async (blob) => {
      const j = await transcribeBlob(blob);
      if (j?.text) {
        setDraft(j.text);
        sendTextRef.current(j.text);
        logAudit('voice-online', { via: 'stt' });
      }
    },
    (active) => setVoiceStatus({ sttActive: active }),
  );

  const speakStream = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;
      
      try {
        const response = await fetch(`${AURL}/v1/audio/tts/stream`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        
        if (response.status === 412) {
          (window as any).os1Toast?.show?.('TTS disabled (no ElevenLabs key)');
          logAudit('voice-online', { via: 'tts-stream', muted: true, ok: false });
          setGlobalVoiceStatus('muted');
          return false;
        }
        
        if (!response.ok || !response.body) {
          throw new Error(`tts_stream_http_${response.status}`);
        }

        setGlobalVoiceStatus('streaming');
        setVoiceStatus({ ttsActive: true });

        // Read raw bytes; let Audio element handle codec, avoid JSON decodes on binary
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        await audio.play().catch(() => {});
        
        audio.onended = () => {
          setGlobalVoiceStatus('idle');
          setVoiceStatus({ ttsActive: false });
          URL.revokeObjectURL(url);
        };

        logAudit('voice-online', { via: 'tts-stream', ok: true });
        return true;
      } catch (err) {
        console.warn('speakStream fallback:', err);
        setGlobalVoiceStatus('idle');
        setVoiceStatus({ ttsActive: false });
        
        // Fallback: non-stream TTS (if available) or silent no-op
        try {
          const fallbackRes = await fetch(`${AURL}/v1/audio/tts`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          
          if (fallbackRes.ok) {
            const blob = await fallbackRes.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            await audio.play().catch(() => {});
            audio.onended = () => URL.revokeObjectURL(url);
            return true;
          }
        } catch (fallbackErr) {
          console.warn('TTS fallback also failed:', fallbackErr);
        }
        
        return false;
      }
    },
    [setVoiceStatus],
  );

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;
      setVoiceStatus({ ttsActive: true });
      try {
        const response = await fetch(`${AURL}/v1/audio/tts`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (response.status === 412) {
          // TTS disabled (no ElevenLabs key)
          (window as any).os1Toast?.show?.('TTS disabled (no ElevenLabs key)');
          logAudit('voice-online', { via: 'tts', muted: true, ok: false });
          setGlobalVoiceStatus('muted');
          setVoiceStatus({ ttsActive: false });
          return;
        }
        if (!response.ok) {
          logAudit('voice-online', { via: 'tts', ok: false, status: response.status });
          throw new Error(`tts_error_${response.status}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGlobalVoiceStatus('speaking');
        await new Promise<void>((resolve, reject) => {
          const sound = new Howl({ src: [url], format: ['mp3'] });
          const cleanup = () => URL.revokeObjectURL(url);
          sound.once('end', () => {
            cleanup();
            setGlobalVoiceStatus('idle');
            resolve();
          });
          sound.once('stop', () => {
            cleanup();
            setGlobalVoiceStatus('idle');
            resolve();
          });
          sound.once('loaderror', (_id, err) => {
            cleanup();
            setGlobalVoiceStatus('idle');
            reject(err ?? new Error('tts_load_error'));
          });
          sound.once('playerror', (_id, err) => {
            cleanup();
            setGlobalVoiceStatus('idle');
            reject(err ?? new Error('tts_play_error'));
          });
          sound.play();
        });
      } finally {
        setVoiceStatus({ ttsActive: false });
      }
    },
    [setVoiceStatus],
  );

  const handleVoiceToggle = useCallback(() => {
    if (rec) {
      stop();
      return;
    }
    start().catch((err) => {
      console.error('voice start failed', err);
      setVoiceStatus({ sttActive: false });
    });
  }, [rec, start, stop, setVoiceStatus]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [msgs.length, typing, errorMsg]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMsgs(sanitizeHistory(parsed));
      }
    } catch {
      // ignore parse failures
    } finally {
      setHydrated(true);
    }
  }, []);

  // Probe TTS status at mount
  useEffect(() => {
    fetch(`${AURL}/v1/audio/status`)
      .then((r) => r.json())
      .then((j) => {
        const muted = !(j && j.tts_enabled);
        if (typeof window !== 'undefined') {
          setGlobalVoiceStatus(muted ? 'muted' : 'idle');
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          setGlobalVoiceStatus('muted');
        }
      });
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(pruneHistory(msgs));
      window.localStorage.setItem(LS_KEY, serialized);
    } catch {
      // ignore storage failures (quota, private mode, etc.)
    }
  }, [msgs, hydrated]);

  const playTtsIfEnabled = useCallback(
    async (text: string) => {
      try {
        // Check if TTS is enabled via VoiceControls
        const isTtsEnabled = getTtsEnabled();
        if (!isTtsEnabled) {
          return;
        }

        // Check if streaming is enabled
        const allowStream =
          typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TTS_STREAM === '1';

        if (allowStream) {
          const streamSuccess = await speakStream(text);
          if (streamSuccess) {
            return;
          }
          // If streaming failed, fall back to regular playback
        }

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          logAudit('chat-tts', { error: 'fetch_failed', status: response.status });
          return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          logAudit('chat-tts', { error: 'playback_failed' });
        };

        await audio.play();
        logAudit('chat-tts', { length: text.length, status: 'playing' });
      } catch (error) {
        const err = error as Error;
        logAudit('chat-tts', { error: err.message || 'unknown' });
      }
    },
    [speakStream],
  );

  const startStream = useCallback(
    async (rawText: string, options: { appendUser?: boolean } = {}) => {
      const text = rawText.trim();
      if (!text) {
        return;
      }

      lastPromptRef.current = text;
      setErrorMsg(null);

      const acked = (() => {
        try {
          return window.localStorage.getItem(SEC_ACK_KEY) === '1';
        } catch {
          return false;
        }
      })();

      if (mode === 'Direct') {
        if (DIRECT_DISABLED) {
          setErrorMsg('Direct mode disabled by policy.');
          logAudit('sec-gate', { result: 'blocked', reason: 'direct_disabled', mode });
          return;
        }
        if (!acked) {
          setErrorMsg('Acknowledge SEC-COMMS policy to use Direct.');
          logAudit('sec-gate', { result: 'blocked', reason: 'no_ack', mode });
          return;
        }
      }

      logAudit('sec-gate', { result: 'allowed', mode });

      const systemPreface = readSystemPreface();
      const appendUser = options.appendUser !== false;

      if (appendUser) {
        const userTs = new Date().toISOString();
        const userMsg: Msg = {
          id: crypto.randomUUID(),
          role: 'user',
          text,
          ts: userTs,
        };

        setMsgs((current) => {
          let next = [...current];

          if (systemPreface) {
            const systemIndex = next.findIndex((entry) => entry.role === 'system');
            if (systemIndex === -1) {
              next.push({
                id: crypto.randomUUID(),
                role: 'system',
                text: systemPreface,
                ts: userTs,
              });
            } else if (next[systemIndex].text !== systemPreface) {
              next[systemIndex] = { ...next[systemIndex], text: systemPreface, ts: userTs };
            }
          }

          next.push(userMsg);
          return pruneHistory(next);
        });

        setDraft('');
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
      setTyping(true);
      logAudit('chat-stream', appendUser ? { phase: 'start' } : { phase: 'start', retry: true });
      let transport: 'archon' | 'local' | undefined;
      let provider: string | undefined;
      let assistantId = '';
      let accumulator = '';
      let assistantTs = '';

      try {
        for await (const chunk of streamChat({ text }, { signal: controller.signal })) {
          if (chunk.transport && !transport) {
            transport = chunk.transport;
          }

          if (!provider && chunk.provider) {
            provider = chunk.provider;
          }

          if (chunk.text && chunk.text.length > 0) {
            accumulator += chunk.text;

            if (!assistantId) {
              assistantId = chunk.id ?? crypto.randomUUID();
            }

            if (!assistantTs) {
              assistantTs = chunk.ts ?? new Date().toISOString();
            }

            const ts = chunk.ts ?? assistantTs;
            assistantTs = ts;

            setMsgs((current) => {
              const next = [...current];
              const index = next.findIndex((entry) => entry.id === assistantId);

              if (index === -1) {
                next.push({ id: assistantId, role: 'assistant', text: accumulator, ts });
              } else {
                next[index] = { ...next[index], text: accumulator, ts };
              }

              return pruneHistory(next);
            });
          }

          if (chunk.done) {
            break;
          }

          if (controller.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
        }

        const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const duration = Math.round(finishedAt - startedAt);
        const auditPayload: Record<string, unknown> = { phase: 'end', ms: duration };
        if (transport) {
          auditPayload.transport = transport;
        }
        if (provider) {
          auditPayload.provider = provider;
        }
        if (!appendUser) {
          auditPayload.retry = true;
        }
        logAudit('chat-stream', auditPayload);

        // Play TTS for assistant reply if enabled
        if (accumulator.trim()) {
          void playTtsIfEnabled(accumulator);
        }
      } catch (error) {
        const aborted = isAbortError(error);
        if (aborted) {
          const payload: Record<string, unknown> = { phase: 'cancel' };
          if (transport) {
            payload.transport = transport;
          }
          if (provider) {
            payload.provider = provider;
          }
          if (!appendUser) {
            payload.retry = true;
          }
          logAudit('chat-stream', payload);
        } else {
          setErrorMsg('Network error. Try again.');
          setDraft(lastPromptRef.current);
          const payload: Record<string, unknown> = { phase: 'error' };
          if (transport) {
            payload.transport = transport;
          }
          if (provider) {
            payload.provider = provider;
          }
          if (!appendUser) {
            payload.retry = true;
          }
          logAudit('chat-stream', payload);
        }
        return;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setTyping(false);
      }
    },
    [mode],
  );

  const handleSend = useCallback(() => {
    void startStream(draft, { appendUser: true });
  }, [draft, startStream]);

  useEffect(() => {
    sendTextRef.current = (text: string) => {
      void startStream(text, { appendUser: true });
    };
  }, [startStream]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    (window as any).os1Chat = {
      sendDraft: (textValue: string) => setDraft(textValue),
      getHistory: () => msgs,
      setSystemPreface: (preface: string | null) => {
        try {
          const value = preface?.trim();
          if (value && value.length > 0) {
            window.localStorage.setItem(SYSTEM_PREFACE_KEY, value);
          } else {
            window.localStorage.removeItem(SYSTEM_PREFACE_KEY);
          }
        } catch {
          // ignore storage failures
        }
      },
    };
  }, [msgs]);

  const handleClear = useCallback((source?: 'kbd') => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMsgs([]);
    setTyping(false);
    setErrorMsg(null);
    lastPromptRef.current = '';
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(LS_KEY);
      } catch {
        // ignore storage failures
      }
    }
    logAudit('chat-clear', source ? { via: source } : undefined);
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleRetry = useCallback(() => {
    if (typing || !lastPromptRef.current) {
      return;
    }
    void startStream(lastPromptRef.current, { appendUser: false });
  }, [startStream, typing]);

  const handleTranscriptReady = useCallback(
    (text: string) => {
      // Set the transcript in the composer and auto-send
      setDraft(text);
      void startStream(text, { appendUser: true });
    },
    [startStream],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleVoiceToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rec, start, stop, handleVoiceToggle]);

  useEffect(() => {
    if (!msgs.length) {
      return;
    }
    const last = msgs[msgs.length - 1];
    if (last.role !== 'assistant') {
      return;
    }
    const txt = last.text || '';
    if (!txt.trim()) {
      return;
    }
    speak(txt)
      .then(() => logAudit('voice-online', { via: 'tts' }))
      .catch(() => {});
  }, [msgs, speak]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const inComposer =
        target instanceof HTMLTextAreaElement && target.dataset?.testid === 'composer-input';

      if (meta && key === 'enter') {
        if (!inComposer) {
          return;
        }
        event.preventDefault();
        void startStream(draftRef.current, { appendUser: true });
        return;
      }

      if (meta && key === 'l') {
        if (!inComposer) {
          return;
        }
        event.preventDefault();
        handleClear('kbd');
        return;
      }

      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [handleCancel, handleClear, startStream]);

  return (
    <>
      <div
        className="message-list"
        id="chat-scroll-region"
        data-testid="message-list"
        role="log"
        aria-live="polite"
        ref={listRef}
      >
        {children}
        {msgs.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        {typing ? (
          <div className="chat-msg assistant">
            <div className="bubble typing-bubble" aria-live="polite" aria-label="Assistant typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        ) : null}
        {errorMsg ? (
          <div className="error-banner" role="alert">
            {errorMsg}
          </div>
        ) : null}
      </div>
      <footer className="composer" role="region" aria-label="Composer" data-testid="composer">
        <div className="voice-tools">
          <button className="btn sm" onClick={() => (rec ? stop() : start())}>
            {rec ? '⏹ Stop' : '🎙 Alt+M'}
          </button>
        </div>
        <div className="row">
          <VoiceControls onTranscriptReady={handleTranscriptReady} />
          <textarea
            className="input"
            placeholder="Type a message"
            aria-label="Message composer"
            data-testid="composer-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button type="button" className="btn" data-testid="composer-send" onClick={handleSend}>
            Send
          </button>
          {typing ? (
            <button
              type="button"
              className="btn"
              onClick={handleCancel}
              aria-label="Cancel streaming"
            >
              Cancel
            </button>
          ) : errorMsg ? (
            <button type="button" className="btn" onClick={handleRetry} aria-label="Retry message">
              Retry
            </button>
          ) : null}
          <button type="button" className="btn" onClick={() => handleClear()}>
            Clear
          </button>
        </div>
      </footer>
      <VoiceToolbar
        sttActive={voiceStatus.sttActive}
        ttsActive={voiceStatus.ttsActive}
        onToggle={handleVoiceToggle}
      />
    </>
  );
}
