import assert from 'node:assert/strict';
import test from 'node:test';
import { canCleanUpVoiceTurn, canContinueVoiceStart, canStartVoiceTurn, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange } from '../src/voice/appState.ts';
import { stopVoiceRecorderWithTimeout } from '../src/voice/recorderPreparation.ts';

test('native permission dialog does not cancel its pending result', () => {
  assert.equal(shouldCancelVoiceOnAppStateChange('background', true), false);
  assert.equal(shouldCancelVoiceOnAppStateChange('inactive', true), false);
});

test('background, lock or call interruption cancels when a permission prompt is not open', () => {
  assert.equal(shouldCancelVoiceOnAppStateChange('background', false), true);
  assert.equal(shouldCancelVoiceOnAppStateChange('inactive', false), true);
  assert.equal(shouldCancelVoiceOnAppStateChange('active', false), false);
});

test('a permission result only continues into recording while the app is active', () => {
  assert.equal(canContinueVoiceStart('active'), true);
  assert.equal(canContinueVoiceStart('inactive'), false);
  assert.equal(canContinueVoiceStart('background'), false);
});

test('changing chapter, mode or dataset revision invalidates the active voice scope', () => {
  assert.equal(shouldCancelVoiceOnScopeChange('demo:r1:demo-01', 'demo:r1:demo-02'), true);
  assert.equal(shouldCancelVoiceOnScopeChange('demo:r1:demo-01', 'live:r1:demo-01'), true);
  assert.equal(shouldCancelVoiceOnScopeChange('demo:r1:demo-01', 'demo:r2:demo-01'), true);
  assert.equal(shouldCancelVoiceOnScopeChange('demo:r1:demo-01', 'demo:r1:demo-01'), false);
});

test('late voice results require the same turn and both saved/current scopes', () => {
  const expected = { turnId: 'turn-1', scope: 'demo:r1:demo-01' };
  assert.equal(isCurrentVoiceTurn(expected, expected.scope, expected), true);
  assert.equal(isCurrentVoiceTurn(null, expected.scope, expected), false);
  assert.equal(isCurrentVoiceTurn({ ...expected, turnId: 'turn-2' }, expected.scope, expected), false);
  assert.equal(isCurrentVoiceTurn(expected, 'demo:r1:demo-02', expected), false);
});

test('stale cleanup releases only its owner or an abandoned turn', () => {
  assert.equal(canCleanUpVoiceTurn('new-turn', 'old-turn'), false);
  assert.equal(canCleanUpVoiceTurn(null, 'old-turn'), true);
  assert.equal(canCleanUpVoiceTurn('old-turn', 'old-turn'), true);
});

test('a timed out native stop stays locked until its original promise settles', async () => {
  let finishStop;
  const outcome = await stopVoiceRecorderWithTimeout(
    () => new Promise((resolve) => { finishStop = resolve; }), 5,
  );
  assert.equal(outcome.kind, 'timed-out');
  assert.equal(canStartVoiceTurn('error', true), false);
  finishStop();
  assert.equal((await outcome.completion).kind, 'stopped');
  assert.equal(canStartVoiceTurn('error', false), true);
});

test('a rejected native stop remains locked because recorder state is unknown', async () => {
  const outcome = await stopVoiceRecorderWithTimeout(
    () => Promise.reject(new Error('native stop failed')), 100,
  );
  assert.equal(outcome.kind, 'failed');
  assert.equal(canStartVoiceTurn('idle', true), false);
});
