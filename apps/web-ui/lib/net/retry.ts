/**
 * Timeout + retry wrapper for fetch with exponential backoff and jitter.
 * Useful for resilient API calls in unstable network conditions.
 */

export type RetryOpts = {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
};

/**
 * Fetch with automatic timeout and exponential backoff retry.
 * 
 * @param input - Request URL or Request object
 * @param init - Fetch init options
 * @param opts - Retry configuration
 * @returns Response promise
 * @throws Error if all retries exhausted or non-retryable error
 */
export async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit = {},
  opts: RetryOpts = {}
): Promise<Response> {
  const timeoutMs = opts.timeoutMs ?? 7500;
  const retries = opts.retries ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 250;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    try {
      const res = await fetch(input, { ...init, signal: ac.signal });
      clearTimeout(timer);
      
      // Don't retry on successful response
      if (res.ok) return res;
      
      // Don't retry 4xx client errors (except 408 timeout, 429 rate limit)
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        throw new Error(`http_${res.status}`);
      }
      
      // Retry 5xx server errors
      if (attempt < retries) {
        const jitter = baseDelayMs * (1 << attempt) + Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, jitter));
        continue;
      }
      
      throw new Error(`http_${res.status}`);
    } catch (error) {
      clearTimeout(timer);
      
      // Rethrow immediately on last attempt
      if (attempt === retries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('timeout');
        }
        throw error;
      }
      
      // Exponential backoff with jitter for retry
      const jitter = baseDelayMs * (1 << attempt) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, jitter));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('max_retries_exceeded');
}
