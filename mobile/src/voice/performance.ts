declare const __DEV__: boolean;

export type VoicePerformanceMetric = 'stop-to-transcript' | 'transcript-to-audio' | 'cancel-to-idle';

const SAMPLE_WINDOW_SIZE = 20;
const samples: Partial<Record<VoicePerformanceMetric, number[]>> = {};

export function voicePerformanceNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

export function summarizeVoiceDurations(values: readonly number[]) {
  const sorted = values.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const percentile = (fraction: number) => sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
  return { count: sorted.length, p50Ms: Math.round(percentile(0.5)), p95Ms: Math.round(percentile(0.95)) };
}

export function recordVoicePerformance(metric: VoicePerformanceMetric, elapsedMs: number): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__ || !Number.isFinite(elapsedMs) || elapsedMs < 0) return;
  const value = Math.round(elapsedMs);
  const window = samples[metric] ?? (samples[metric] = []);
  window.push(value);
  console.info(`[ngoke-voice-perf] ${metric} ${value}ms`);
  if (window.length < SAMPLE_WINDOW_SIZE) return;
  const summary = summarizeVoiceDurations(window);
  if (summary) console.info(`[ngoke-voice-perf] ${metric} summary ${JSON.stringify(summary)}`);
  window.length = 0;
}
