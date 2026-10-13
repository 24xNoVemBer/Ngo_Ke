import assert from 'node:assert/strict';
import test from 'node:test';
import { hasReachedVoiceRecordingLimit, MAX_VOICE_RECORDING_DURATION_MS } from '../src/voice/recordingLimit.ts';

test('voice recording stops before the 20-second gateway cap and ignores invalid durations', () => {
  assert.equal(hasReachedVoiceRecordingLimit(MAX_VOICE_RECORDING_DURATION_MS - 501), false);
  assert.equal(hasReachedVoiceRecordingLimit(MAX_VOICE_RECORDING_DURATION_MS - 500), true);
  assert.equal(hasReachedVoiceRecordingLimit(MAX_VOICE_RECORDING_DURATION_MS), true);
  assert.equal(hasReachedVoiceRecordingLimit(Number.NaN), false);
  assert.equal(hasReachedVoiceRecordingLimit(Number.POSITIVE_INFINITY), false);
});
