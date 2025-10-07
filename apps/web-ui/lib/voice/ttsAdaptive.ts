/**
 * Adaptive TTS Mode — Graceful degradation on stream failures.
 * 
 * Strategy:
 * - Track consecutive stream failures
 * - After 2 consecutive failures → skip stream for next 2 calls (use fallback only)
 * - After cooldown → probe stream again
 * - On success → reset state
 * - On failure → extend cooldown +1 call
 */

type AdaptiveState = {
  consecutiveFailures: number;
  skipStreamCount: number; // Remaining calls to skip stream
  lastFailureTime: number;
};

const state: AdaptiveState = {
  consecutiveFailures: 0,
  skipStreamCount: 0,
  lastFailureTime: 0,
};

const FAILURE_THRESHOLD = 2;
const COOLDOWN_CALLS = 2;

/**
 * Check if we should skip stream attempt and use fallback only.
 */
export function shouldSkipStream(): boolean {
  return state.skipStreamCount > 0;
}

/**
 * Record a stream failure.
 * Increments consecutive failures; if threshold reached, enter skip-stream mode.
 */
export function recordStreamFailure(): void {
  state.consecutiveFailures++;
  state.lastFailureTime = Date.now();

  if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
    state.skipStreamCount = COOLDOWN_CALLS;
    console.warn(`[TTS Adaptive] ${state.consecutiveFailures} consecutive failures → skip stream for ${COOLDOWN_CALLS} calls`);
  }
}

/**
 * Record a stream success.
 * Resets adaptive state.
 */
export function recordStreamSuccess(): void {
  if (state.consecutiveFailures > 0 || state.skipStreamCount > 0) {
    console.info('[TTS Adaptive] Stream success → reset adaptive state');
  }
  state.consecutiveFailures = 0;
  state.skipStreamCount = 0;
}

/**
 * Record a fallback call (decrement skip count).
 * When skip count reaches 0, next call will probe stream again.
 */
export function recordFallbackCall(): void {
  if (state.skipStreamCount > 0) {
    state.skipStreamCount--;
    console.info(`[TTS Adaptive] Fallback used, ${state.skipStreamCount} skip calls remaining`);
  }
}

/**
 * Extend cooldown by 1 call if probe fails.
 */
export function extendCooldown(): void {
  state.skipStreamCount = Math.max(1, state.skipStreamCount + 1);
  console.warn(`[TTS Adaptive] Probe failed → extend cooldown to ${state.skipStreamCount} calls`);
}

/**
 * Get current adaptive state (for debugging/observability).
 */
export function getAdaptiveState(): Readonly<AdaptiveState> {
  return { ...state };
}
