/**
 * Global type definitions for OS One voice features
 * Phase 4: OS1Voice unification
 */

export type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'streaming'
  | 'speaking'
  | 'muted'
  | 'error';

export interface OS1Voice {
  voiceStatus?: VoiceStatus;
  set?: (s: VoiceStatus) => void;
  get?: () => VoiceStatus | undefined;
  isTtsEnabled?: () => boolean;
}

declare global {
  interface Window {
    os1Voice?: OS1Voice;
  }
}

export {};
