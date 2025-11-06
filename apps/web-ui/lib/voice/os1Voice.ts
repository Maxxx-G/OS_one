/**
 * OS1Voice global helpers — single source of truth
 * Phase 4: Typed window.os1Voice unification
 */

import type { VoiceStatus, OS1Voice } from '../../types/global';

/**
 * Ensures window.os1Voice exists and has get/set methods installed
 * Idempotent — safe to call multiple times
 */
export function ensureOS1Voice(): OS1Voice {
  if (!window.os1Voice) {
    window.os1Voice = {};
  }

  // Install get/set helpers if not present
  if (!window.os1Voice.set) {
    window.os1Voice.set = (status: VoiceStatus) => {
      window.os1Voice!.voiceStatus = status;
    };
  }

  if (!window.os1Voice.get) {
    window.os1Voice.get = () => window.os1Voice!.voiceStatus;
  }

  return window.os1Voice!;
}

/**
 * Set voice status (ensures global is initialized)
 */
export const setVoiceStatus = (s: VoiceStatus) => ensureOS1Voice().set!(s);

/**
 * Get current voice status
 */
export const getVoiceStatus = () => ensureOS1Voice().get?.();

/**
 * Check if TTS is enabled (via global flag)
 */
export const isTtsEnabled = () => window.os1Voice?.isTtsEnabled?.() === true;
