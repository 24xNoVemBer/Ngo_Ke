import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareVoiceRecorderForTurn } from '../src/voice/recorderPreparation.ts';

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('cancellation after enabling audio skips recorder preparation and restores audio mode', async () => {
  let current = true;
  const calls = [];
  const ready = await prepareVoiceRecorderForTurn({
    isCurrent: () => current,
    enableAudioMode: async () => { calls.push('enable'); current = false; },
    prepareRecorder: async () => calls.push('prepare'),
    stopRecorder: async () => calls.push('stop'),
    removeRecording: () => calls.push('remove'),
    disableAudioMode: async () => calls.push('disable'),
  });

  assert.equal(ready, false);
  assert.deepEqual(calls, ['enable', 'disable']);
});

test('cancellation during native prepare stops and discards the prepared recorder before returning', async () => {
  let current = true;
  const prepareStarted = deferred();
  const prepareFinished = deferred();
  const calls = [];
  const operation = prepareVoiceRecorderForTurn({
    isCurrent: () => current,
    enableAudioMode: async () => calls.push('enable'),
    prepareRecorder: () => { calls.push('prepare'); prepareStarted.resolve(); return prepareFinished.promise; },
    stopRecorder: async () => calls.push('stop'),
    removeRecording: () => calls.push('remove'),
    disableAudioMode: async () => calls.push('disable'),
  });

  await prepareStarted.promise;
  current = false;
  prepareFinished.resolve();

  assert.equal(await operation, false);
  assert.deepEqual(calls, ['enable', 'prepare', 'stop', 'remove', 'disable']);
});

test('a recorder preparation failure cleans native resources and preserves the error', async () => {
  const failure = new Error('prepare failed');
  const calls = [];
  await assert.rejects(prepareVoiceRecorderForTurn({
    isCurrent: () => true,
    enableAudioMode: async () => calls.push('enable'),
    prepareRecorder: async () => { calls.push('prepare'); throw failure; },
    stopRecorder: async () => calls.push('stop'),
    removeRecording: () => calls.push('remove'),
    disableAudioMode: async () => calls.push('disable'),
  }), failure);

  assert.deepEqual(calls, ['enable', 'prepare', 'stop', 'remove', 'disable']);
});

test('a current recorder is not stopped or discarded after successful preparation', async () => {
  const calls = [];
  const ready = await prepareVoiceRecorderForTurn({
    isCurrent: () => true,
    enableAudioMode: async () => calls.push('enable'),
    prepareRecorder: async () => calls.push('prepare'),
    stopRecorder: async () => calls.push('stop'),
    removeRecording: () => calls.push('remove'),
    disableAudioMode: async () => calls.push('disable'),
  });

  assert.equal(ready, true);
  assert.deepEqual(calls, ['enable', 'prepare']);
});
