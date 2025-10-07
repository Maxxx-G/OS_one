/**
 * Voices cache with TTL (5 minutes).
 * Reduces redundant /v1/audio/voices hits; fallback to empty on endpoint failure.
 */

const CACHE_KEY = 'os1.voices.cache.v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const AURL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

export type Voice = {
  voice_id: string;
  name: string;
  preview_url?: string;
};

type CacheEntry = {
  voices: Voice[];
  timestamp: number;
};

/**
 * Fetch voices with caching.
 * Returns cached voices if fresh (< 5 min old), otherwise fetches from endpoint.
 * Falls back to empty array on endpoint failure.
 */
export async function getVoices(): Promise<Voice[]> {
  if (typeof window === 'undefined') return [];

  try {
    // Check cache
    const cached = window.sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;
      if (age < CACHE_TTL_MS && Array.isArray(entry.voices)) {
        return entry.voices;
      }
    }
  } catch {
    // Ignore cache read errors
  }

  // Fetch from endpoint
  try {
    const res = await fetch(`${AURL}/v1/audio/voices`);
    if (!res.ok) {
      console.warn('[voicesCache] endpoint returned', res.status);
      return [];
    }
    const data = await res.json();
    const voices = Array.isArray(data?.voices) ? data.voices : [];

    // Update cache
    try {
      const entry: CacheEntry = { voices, timestamp: Date.now() };
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignore storage errors
    }

    return voices;
  } catch (err) {
    console.warn('[voicesCache] fetch failed:', err);
    return [];
  }
}

/**
 * Invalidate cache and force refresh.
 */
export function invalidateVoicesCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get cached voices without fetching (if available and fresh).
 * Returns null if cache miss or stale.
 */
export function getCachedVoices(): Voice[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = window.sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;
    if (age < CACHE_TTL_MS && Array.isArray(entry.voices)) {
      return entry.voices;
    }
  } catch {
    // Ignore
  }
  return null;
}
