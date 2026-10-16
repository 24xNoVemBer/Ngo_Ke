import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { setTimeout, clearTimeout } from 'node:timers';
import { setImmediate } from 'node:timers/promises';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { canCleanUpVoiceTurn, canContinueVoiceStart, canStartVoiceTurn, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange } from '../src/voice/appState.ts';
import { prepareVoiceRecorderForTurn, startVoiceRecorder, stopVoiceRecorderWithTimeout } from '../src/voice/recorderPreparation.ts';
import { hasReachedVoiceRecordingLimit } from '../src/voice/recordingLimit.ts';
import { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer } from '../src/voice/playback.ts';

const hookUrl = new URL('../src/voice/useVoiceSession.ts', import.meta.url);
const hookCode = ts.transpileModule(readFileSync(hookUrl, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function mountVoiceSession({ prepare = async () => {}, stop = async () => {}, transcribe = async () => 'answer', hash = async () => 'hash' } = {}) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pendingEffects = [];
  let props = {};
  let result;
  let recording = false;
  let durationMillis = 1000;
  let recorderStops = 0;
  let recorderStarts = 0;
  let recorderPrepares = 0;
  let fileDeletes = 0;
  let transcribeCalls = 0;
  const playerEvents = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: { current: initial } };
      return slots[index].value;
    },
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useEffect(callback, dependencies) {
      const index = cursor++;
      if (!same(slots[index]?.dependencies, dependencies)) {
        pendingEffects.push(() => {
          slots[index]?.cleanup?.();
          slots[index] = { dependencies, cleanup: callback() };
        });
      }
    },
    useCallback(callback, dependencies) {
      const index = cursor++;
      if (!same(slots[index]?.dependencies, dependencies)) slots[index] = { dependencies, callback };
      return slots[index].callback;
    },
  };
  const recorder = {
    get isRecording() { return recording; },
    uri: 'file:///cache/voice-question.m4a',
    async prepareToRecordAsync() { recorderPrepares += 1; return prepare(); },
    record() { recorderStarts += 1; recording = true; },
    stop() { recorderStops += 1; recording = false; return stop(); },
  };
  const player = {
    loop: false,
    pause() { playerEvents.push('pause'); },
    play() { playerEvents.push('play'); },
    replace() { playerEvents.push('replace'); },
  };
  class MockFile {
    exists = true;
    delete() { fileDeletes += 1; }
    bytes() { return new Uint8Array([1]); }
  }
  const modules = {
    react,
    'expo-audio': {
      RecordingPresets: { HIGH_QUALITY: {} },
      useAudioPlayer: () => player,
      useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
      useAudioRecorder: () => recorder,
      useAudioRecorderState: () => ({ durationMillis, metering: -30 }),
      setAudioModeAsync: async () => {},
      requestRecordingPermissionsAsync: async () => ({ granted: true, canAskAgain: true }),
    },
    'react-native': { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-crypto': { CryptoDigestAlgorithm: { SHA256: 'SHA-256' }, digestStringAsync: hash },
    'expo-file-system': { File: MockFile },
    '../data/locale': { DEFAULT_LOCALE: 'vi' },
    '../i18n/translator': { translate: (locale, key) => `${locale}:${key}` },
    './localizedCatalog': {
      DEFAULT_VOICE_COLLECTION: 'fiction-letter',
      lookupVoiceTrack: () => ({ kind: 'story', nodeId: 'node-1', textHash: 'hash', source: 'story-audio' }),
    },
    './appState': { canCleanUpVoiceTurn, canContinueVoiceStart, canStartVoiceTurn, isCurrentVoiceTurn, shouldCancelVoiceOnAppStateChange, shouldCancelVoiceOnScopeChange },
    './recorderPreparation': { prepareVoiceRecorderForTurn, startVoiceRecorder, stopVoiceRecorderWithTimeout },
    './recordingLimit': { hasReachedVoiceRecordingLimit },
    './transcribe': {
      createVoiceRequestBody: () => ({}),
      transcribeVoiceRequest: (...args) => { transcribeCalls += 1; return transcribe(...args); },
    },
    './playback': { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer },
    './performance': { recordVoicePerformance() {}, voicePerformanceNow: () => 0 },
  };
  const module = { exports: {} };
  runInNewContext(`(function(require,module,exports){${hookCode}\n})`, {
    process: { env: {} }, setTimeout, clearTimeout, AbortController,
  })((id) => {
    if (modules[id]) return modules[id];
    throw new Error(`Unexpected import: ${id}`);
  }, module, module.exports);
  const hook = module.exports.useVoiceSession;
  const options = {
    apiBaseUrl: 'http://gateway', scope: 'demo:rev-1:node-1', collectionId: 'fiction-letter',
    locale: 'en', nodeId: 'node-1', mode: 'demo', datasetRevision: 'rev-1', isFocused: true,
    onTranscript() {},
  };
  props = options;
  const render = (next = props) => {
    props = next;
    dirty = true;
    for (let passes = 0; dirty; passes += 1) {
      assert.ok(passes < 20, 'hook entered a state/effect loop');
      dirty = false;
      cursor = 0;
      pendingEffects = [];
      result = hook(props);
      pendingEffects.forEach((effect) => effect());
    }
    return result;
  };
  return {
    render,
    options,
    playerEvents,
    get counts() { return { recorderStops, recorderStarts, recorderPrepares, fileDeletes, transcribeCalls }; },
    set duration(value) { durationMillis = value; },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

const ticks = async (count = 6) => { for (let index = 0; index < count; index += 1) await setImmediate(); };

test('hung native prepare shows recovery, blocks another mic start, then cleans the canceled turn', async () => {
  const nativePrepare = deferred();
  const view = mountVoiceSession({ prepare: () => nativePrepare.promise });
  const starting = view.render().startRecording();
  for (let index = 0; index < 8 && view.counts.recorderPrepares === 0; index += 1) await setImmediate();
  assert.equal(view.counts.recorderPrepares, 1);
  view.render().cancel();
  assert.equal(view.render().stage, 'error');
  assert.match(view.render().error, /RECORDER_RECOVERY_PENDING/);
  await view.render().startRecording();
  assert.equal(view.counts.recorderStarts, 0);
  nativePrepare.resolve();
  await starting;
  assert.equal(view.render().stage, 'idle');
  assert.equal(view.counts.recorderStops, 1);
  assert.equal(view.counts.fileDeletes, 1);
  assert.equal(view.playerEvents.includes('play'), false);
  assert.equal(view.playerEvents.includes('replace'), false);
  view.unmount();
});

test('a stalled stop leaves stopping, recovers the UI, and does not re-open the mic until native completion', async () => {
  const nativeStop = deferred();
  let stopCount = 0;
  const view = mountVoiceSession({ stop: () => ++stopCount === 1 ? nativeStop.promise : Promise.resolve() });
  const recorder = view.render().startRecording();
  await recorder;
  assert.equal(view.render().stage, 'recording');
  view.duration = 20_000;
  view.render();
  assert.equal(view.render().stage, 'stopping');
  await new Promise((resolve) => setTimeout(resolve, 1050));
  assert.equal(view.render().stage, 'error');
  assert.match(view.render().error, /RECORDER_RECOVERY_PENDING/);
  await view.render().startRecording();
  assert.equal(view.counts.recorderStarts, 1);
  assert.equal(view.playerEvents.includes('play'), false);
  assert.equal(view.playerEvents.includes('replace'), false);
  nativeStop.resolve();
  await ticks();
  assert.equal(view.render().stage, 'idle');
  await view.render().startRecording();
  assert.equal(view.counts.recorderStarts, 2);
  view.render().cancel();
  await ticks();
  view.unmount();
});

test('ready cancellation discards its recording without submitting or autoplaying', async () => {
  const view = mountVoiceSession();
  await view.render().startRecording();
  assert.equal(view.render().stage, 'recording');
  view.duration = 20_000;
  view.render();
  await ticks();
  assert.equal(view.render().stage, 'ready');
  view.render().cancel();
  assert.equal(view.render().stage, 'idle');
  assert.equal(view.counts.fileDeletes, 1);
  assert.equal(view.counts.transcribeCalls, 0);
  assert.equal(view.playerEvents.includes('play'), false);
  assert.equal(view.playerEvents.includes('replace'), false);
  view.unmount();
});

test('transcribing cancellation ignores the delayed response; a stale play hash cannot start audio', async () => {
  const answer = deferred();
  const digest = deferred();
  let delivered = 0;
  const view = mountVoiceSession({ transcribe: () => answer.promise, hash: () => digest.promise });
  view.options.onTranscript = () => { delivered += 1; };
  await view.render().startRecording();
  const submission = view.render().submitRecording();
  await ticks();
  assert.equal(view.render().stage, 'transcribing');
  view.render().cancel();
  answer.resolve('late transcript');
  await submission;
  assert.equal(delivered, 0);
  assert.equal(view.render().stage, 'idle');

  const playing = view.render().playTrack('story', 'story text', 'story', 'node-1');
  view.options.scope = 'demo:rev-2:node-2';
  view.options.nodeId = 'node-2';
  view.options.datasetRevision = 'rev-2';
  view.render(view.options);
  digest.resolve('hash');
  await playing;
  assert.equal(view.playerEvents.includes('replace'), false);
  assert.equal(view.playerEvents.includes('play'), false);
  view.unmount();
});
