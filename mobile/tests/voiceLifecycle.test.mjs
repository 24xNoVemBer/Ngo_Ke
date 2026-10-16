import assert from 'node:assert/strict';
import test from 'node:test';
import { canCleanUpVoiceTurn, canContinueVoiceStart, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange } from '../src/voice/appState.ts';

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

test('stale cleanup may finish its own turn but never reset a newer turn', () => {
  for (const stage of ['preparing', 'recording', 'stopping', 'ready', 'transcribing', 'playing']) {
    assert.equal(canCleanUpVoiceTurn('new-turn', 'old-turn'), false, `${stage} protects the new turn`);
    assert.equal(canCleanUpVoiceTurn(null, 'old-turn'), true, `${stage} can release an abandoned turn`);
    assert.equal(canCleanUpVoiceTurn('old-turn', 'old-turn'), true, `${stage} can release its owner`);
  }
});
