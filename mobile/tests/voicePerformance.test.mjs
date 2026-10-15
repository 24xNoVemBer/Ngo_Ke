import assert from 'node:assert/strict';
import test from 'node:test';
import { recordVoicePerformance, summarizeVoiceDurations } from '../src/voice/performance.ts';

test('voice performance summary uses nearest-rank p50 and p95 without changing samples', () => {
  const values = [50, 10, 40, 20, 30];
  assert.deepEqual(summarizeVoiceDurations(values), { count: 5, p50Ms: 30, p95Ms: 50 });
  assert.deepEqual(values, [50, 10, 40, 20, 30]);
});

test('voice performance summary ignores invalid durations and handles an empty window', () => {
  assert.deepEqual(summarizeVoiceDurations([4, Number.NaN, -1, 2]), { count: 2, p50Ms: 2, p95Ms: 4 });
  assert.equal(summarizeVoiceDurations([]), null);
});

test('dev voice timing logs one bounded p50/p95 summary after twenty samples', () => {
  const oldDev = globalThis.__DEV__;
  const oldInfo = globalThis.console.info;
  const logs = [];
  globalThis.__DEV__ = true;
  globalThis.console.info = (message) => logs.push(message);
  try {
    for (let value = 1; value <= 20; value += 1) recordVoicePerformance('cancel-to-idle', value);
  } finally {
    if (oldDev === undefined) delete globalThis.__DEV__;
    else globalThis.__DEV__ = oldDev;
    globalThis.console.info = oldInfo;
  }
  assert.equal(logs.length, 21);
  assert.equal(logs.at(-1), '[ngoke-voice-perf] cancel-to-idle summary {"count":20,"p50Ms":10,"p95Ms":19}');
});
