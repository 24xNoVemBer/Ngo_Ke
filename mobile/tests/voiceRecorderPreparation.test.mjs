import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { prepareVoiceRecorderForTurn, startVoiceRecorder } from '../src/voice/recorderPreparation.ts';

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
    recordingOptions: {},
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
    recordingOptions: {},
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
    recordingOptions: {},
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
    recordingOptions: {},
    prepareRecorder: async () => calls.push('prepare'),
    stopRecorder: async () => calls.push('stop'),
    removeRecording: () => calls.push('remove'),
    disableAudioMode: async () => calls.push('disable'),
  });

  assert.equal(ready, true);
  assert.deepEqual(calls, ['enable', 'prepare']);
});

test('successive turns prepare fresh recorders with metering still enabled', async () => {
  const recordingOptions = { isMeteringEnabled: true };
  const preparedOptions = [];
  const prepareTurn = () => prepareVoiceRecorderForTurn({
    isCurrent: () => true,
    enableAudioMode: async () => {},
    recordingOptions,
    prepareRecorder: async (options) => preparedOptions.push(options),
    stopRecorder: async () => {},
    removeRecording: () => {},
    disableAudioMode: async () => {},
  });

  assert.equal(await prepareTurn(), true);
  assert.equal(await prepareTurn(), true);
  assert.deepEqual(preparedOptions, [recordingOptions, recordingOptions]);
});

test('the voice stage waits for a native recorder that starts asynchronously', async () => {
  let didRecord = false;
  const started = await startVoiceRecorder(
    () => { void delay(75).then(() => { didRecord = true; }); },
    () => didRecord,
    () => true,
    async () => {},
  );
  assert.equal(started, true);
});

test('a canceled recorder start is stopped and does not advance the voice stage', async () => {
  let current = true;
  const calls = [];
  const started = await startVoiceRecorder(
    () => { current = false; },
    () => false,
    () => current,
    async () => calls.push('stop'),
  );
  assert.equal(started, false);
  assert.deepEqual(calls, ['stop']);
});

test('the voice stage reports a recorder that never starts and clears it', async () => {
  const calls = [];
  await assert.rejects(
    startVoiceRecorder(() => {}, () => false, () => true, async () => calls.push('stop')),
    { message: 'RECORDER_START_FAILED' },
  );
  assert.deepEqual(calls, ['stop']);
});
