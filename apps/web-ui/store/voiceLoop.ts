import { create } from 'zustand';
import type { VoiceIntent } from '@/lib/voice/intent';

export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type VoiceLoopState = {
  enabled: boolean;
  phase: VoicePhase;
  lastTranscript: string;
  lastThought: string;
  lastReply: string;
  lastIntent: VoiceIntent;
  error: string | null;
  setEnabled(value: boolean): void;
  setPhase(value: VoicePhase): void;
  setTranscript(value: string, intent: VoiceIntent): void;
  setOutput(thought: string, reply: string): void;
  setError(value: string | null): void;
  reset(): void;
};

export const useVoiceLoop = create<VoiceLoopState>((set) => ({
  enabled: false,
  phase: 'idle',
  lastTranscript: '',
  lastThought: '',
  lastReply: '',
  lastIntent: 'none',
  error: null,
  setEnabled: (value) => set({ enabled: value }),
  setPhase: (value) => set({ phase: value }),
  setTranscript: (value, intent) => set({ lastTranscript: value, lastIntent: intent }),
  setOutput: (thought, reply) => set({ lastThought: thought, lastReply: reply }),
  setError: (value) => set({ error: value }),
  reset: () => set({ phase: 'idle', lastTranscript: '', lastThought: '', lastReply: '', lastIntent: 'none', error: null }),
}));
