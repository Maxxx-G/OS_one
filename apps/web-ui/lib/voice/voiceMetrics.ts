/**
 * Voice Metrics — In-memory ring buffer for telemetry.
 * Tracks STT/TTS latency, retries, confirmations.
 */

export type MetricEntry = {
  ts: number;
  type: 'stt' | 'tts_stream' | 'tts_fallback' | 'confirm';
  latency_ms?: number;
  retry_count?: number;
  outcome?: 'ok' | 'cancel' | 'fail';
};

const MAX_ENTRIES = 100;
const metrics: MetricEntry[] = [];

/**
 * Add a metric entry.
 */
export function addMetric(entry: Omit<MetricEntry, 'ts'>): void {
  metrics.unshift({ ...entry, ts: Date.now() });
  if (metrics.length > MAX_ENTRIES) {
    metrics.pop();
  }
}

/**
 * Get aggregated stats for the last N minutes.
 */
export function getStats(windowMinutes = 5): {
  stt_avg_ms: number;
  stt_retry_rate: number;
  tts_avg_ms: number;
  tts_fail_rate: number;
  confirm_ok_count: number;
  confirm_cancel_count: number;
  total_entries: number;
} {
  const cutoff = Date.now() - windowMinutes * 60 * 1000;
  const recent = metrics.filter(m => m.ts >= cutoff);

  const sttEntries = recent.filter(m => m.type === 'stt');
  const ttsEntries = recent.filter(m => m.type === 'tts_stream' || m.type === 'tts_fallback');
  const confirmEntries = recent.filter(m => m.type === 'confirm');

  const sttLatencies = sttEntries.map(m => m.latency_ms).filter((l): l is number => l !== undefined);
  const ttsLatencies = ttsEntries.map(m => m.latency_ms).filter((l): l is number => l !== undefined);

  const sttRetries = sttEntries.reduce((sum, m) => sum + (m.retry_count || 0), 0);
  const ttsFails = ttsEntries.filter(m => m.outcome === 'fail').length;

  const confirmOk = confirmEntries.filter(m => m.outcome === 'ok').length;
  const confirmCancel = confirmEntries.filter(m => m.outcome === 'cancel').length;

  return {
    stt_avg_ms: sttLatencies.length ? Math.round(sttLatencies.reduce((a, b) => a + b, 0) / sttLatencies.length) : 0,
    stt_retry_rate: sttEntries.length ? Math.round((sttRetries / sttEntries.length) * 100) / 100 : 0,
    tts_avg_ms: ttsLatencies.length ? Math.round(ttsLatencies.reduce((a, b) => a + b, 0) / ttsLatencies.length) : 0,
    tts_fail_rate: ttsEntries.length ? Math.round((ttsFails / ttsEntries.length) * 100) / 100 : 0,
    confirm_ok_count: confirmOk,
    confirm_cancel_count: confirmCancel,
    total_entries: recent.length,
  };
}

/**
 * Get raw metrics (for export/debugging).
 */
export function getRawMetrics(limit = 50): MetricEntry[] {
  return metrics.slice(0, limit);
}

/**
 * Clear all metrics (for testing).
 */
export function clearMetrics(): void {
  metrics.length = 0;
}
