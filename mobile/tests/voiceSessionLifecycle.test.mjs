import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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

function mountVoiceSession({ prepare = async () => {}, stop = async () => {}, transcribe = async () => 'answer', hash = async () => 'hash', lookupTrack, options: optionOverrides = {} } = {}) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pendingEffects = [];
  let props = {};
  let result;
  let recording = false;
  let durationMillis = 1000;
  let playbackStatus = { playing: false, currentTime: 0, duration: 0, error: null };
  let recorderStops = 0;
  let recorderStarts = 0;
  let recorderPrepares = 0;
  let fileDeletes = 0;
  let transcribeCalls = 0;
  const playerEvents = [];
  const playerSources = [];
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
    replace(source) { playerEvents.push('replace'); playerSources.push(source); },
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
      useAudioPlayerStatus: () => playbackStatus,
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
      lookupVoiceTrack: lookupTrack ?? (() => ({ kind: 'story', nodeId: 'node-1', textHash: 'hash', source: 'story-audio' })),
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
    ...optionOverrides,
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
    playerSources,
    set playbackStatus(status) { playbackStatus = status; },
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

test('live playback uses only the matching English pilot track and rejects changed server text', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 'english-pilot-audio';
  let catalog;
  try {
    catalog = await import('../src/voice/localizedCatalog.ts');
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }

  const dataset = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(readFileSync(new URL('../assets/voice/post8/old-quarter-pilot/manifest.json', import.meta.url), 'utf8'));
  const node = dataset.nodes.find((item) => item.id === 'oldquarter-bach-ma');
  const id = `${node.id}-story`;
  const revision = manifest.catalogues.en.datasetRevision;
  const textHash = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
  const track = catalog.lookupVoiceTrack({
    collectionId: manifest.collectionId, locale: 'en', contentId: id, datasetRevision: revision,
  });
  assert.equal(track?.kind, 'story');
  assert.equal(track?.textHash, textHash(node.story));

  const options = {
    mode: 'live', collectionId: manifest.collectionId, locale: 'en', datasetRevision: revision,
    scope: `live:${manifest.collectionId}:en:${revision}:${node.id}`, nodeId: node.id,
  };
  const view = mountVoiceSession({
    lookupTrack: catalog.lookupVoiceTrack,
    hash: async (_algorithm, text) => textHash(text),
    options,
  });
  await view.render().playTrack(id, node.story, 'story', node.id);
  assert.deepEqual(view.playerEvents, ['replace', 'play']);
  assert.deepEqual(view.playerSources, [track.source]);

  const stale = mountVoiceSession({
    lookupTrack: catalog.lookupVoiceTrack,
    hash: async (_algorithm, text) => textHash(text),
    options,
  });
  await stale.render().playTrack(id, `${node.story} Changed.`, 'story', node.id);
  assert.deepEqual(stale.playerEvents, []);
  assert.equal(stale.render().playbackError, 'en:voice.notice.audio_unavailable');
  view.unmount();
  stale.unmount();
});

test('playback keeps kind and node checks in the hook with the four-field catalogue query', async () => {
  const queries = [];
  const lookupTrack = (query) => {
    queries.push(query);
    return { kind: 'story', nodeId: 'node-1', textHash: 'hash', source: 'story-audio' };
  };
  const view = mountVoiceSession({ lookupTrack });

  await view.render().playTrack('story', 'story text', 'answer', 'node-1');
  await view.render().playTrack('story', 'story text', 'story', 'node-2');

  assert.deepEqual(view.playerEvents, []);
  assert.deepEqual(JSON.parse(JSON.stringify(queries)), [
    { collectionId: 'fiction-letter', locale: 'en', contentId: 'story', datasetRevision: 'rev-1' },
    { collectionId: 'fiction-letter', locale: 'en', contentId: 'story', datasetRevision: 'rev-1' },
  ]);
  view.unmount();
});

test('intro playback requires a node-less intro track and keeps the current node as its playback scope', async () => {
  let track = { kind: 'intro', nodeId: undefined, textHash: 'hash', source: 'intro-audio' };
  const view = mountVoiceSession({ lookupTrack: () => track });

  await view.render().playTrack('intro', 'intro text', 'intro', 'node-1');
  assert.deepEqual(view.playerEvents, ['replace', 'play']);
  assert.deepEqual(view.playerSources, ['intro-audio']);
  view.playbackStatus = { playing: false, currentTime: 0, duration: 60, error: 'native playback error' };
  assert.equal(view.render().playbackError, 'en:voice.notice.audio_unavailable');

  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: null };
  track = { ...track, nodeId: 'node-1' };
  await view.render().playTrack('intro', 'intro text', 'intro', 'node-1');
  track = { ...track, kind: 'story' };
  await view.render().playTrack('intro', 'intro text', 'intro', 'node-1');
  track = { ...track, kind: 'intro', nodeId: undefined };
  await view.render().playTrack('intro', 'intro text', 'intro', 'node-2');
  assert.deepEqual(view.playerEvents, ['replace', 'play']);
  assert.equal(view.render().playbackError, 'en:voice.notice.audio_unavailable');
  view.unmount();
});

test('an intro hash completed after a current-node scope change cannot start playback', async () => {
  const digest = deferred();
  const view = mountVoiceSession({
    lookupTrack: () => ({ kind: 'intro', nodeId: undefined, textHash: 'hash', source: 'intro-audio' }),
    hash: () => digest.promise,
  });
  const playing = view.render().playTrack('intro', 'intro text', 'intro', 'node-1');
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

test('native playback failure stays visible, retry reloads the source, and scope change clears stale errors', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 'ma-may-vietnamese-audio';
  let catalog;
  try {
    catalog = await import('../src/voice/localizedCatalog.ts');
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }

  const dataset = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(readFileSync(new URL('../assets/voice/post8/remaining/manifest.json', import.meta.url), 'utf8'));
  const localeCatalogue = manifest.catalogues['old-quarter-pilot'].vi;
  const node = dataset.nodes.find((item) => item.id === 'oldquarter-ma-may');
  const id = `${node.id}-story`;
  const textHash = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
  const track = catalog.lookupVoiceTrack({
    collectionId: 'old-quarter-pilot', locale: 'vi', contentId: id, datasetRevision: localeCatalogue.datasetRevision,
  });
  assert.equal(track?.kind, 'story');
  assert.equal(track?.nodeId, node.id);
  assert.equal(track?.textHash, textHash(node.story));

  const options = {
    mode: 'live', collectionId: 'old-quarter-pilot', locale: 'vi', datasetRevision: localeCatalogue.datasetRevision,
    scope: `live:old-quarter-pilot:vi:${localeCatalogue.datasetRevision}:${node.id}`, nodeId: node.id, isFocused: true,
  };
  const view = mountVoiceSession({
    lookupTrack: catalog.lookupVoiceTrack,
    hash: async (_algorithm, text) => textHash(text),
    options,
  });
  await view.render().playTrack(id, node.story, 'story', node.id);
  assert.deepEqual(view.playerEvents, ['replace', 'play']);
  assert.deepEqual(view.playerSources, [track.source]);

  view.playbackStatus = { playing: false, currentTime: 0, duration: 48.49 };
  await view.render().playTrack(id, node.story, 'story', node.id);
  assert.deepEqual(view.playerEvents, ['replace', 'play', 'play']);
  assert.deepEqual(view.playerSources, [track.source]);

  view.playbackStatus = { playing: false, currentTime: 0, duration: 48.49, error: 'EACCES /private/mm-may.mp3' };
  assert.equal(view.render().playbackError, 'vi:voice.notice.audio_unavailable');
  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: null };
  assert.equal(view.render().playbackError, 'vi:voice.notice.audio_unavailable');

  await view.render().playTrack(id, node.story, 'story', node.id);
  assert.deepEqual(view.playerEvents, ['replace', 'play', 'play', 'replace', 'play']);
  assert.deepEqual(view.playerSources, [track.source, track.source]);
  assert.equal(view.render().playbackError, null);

  view.playbackStatus = { playing: false, currentTime: 0, duration: 48.49, error: 'EACCES /private/mm-may.mp3' };
  assert.equal(view.render().playbackError, 'vi:voice.notice.audio_unavailable');
  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: null };
  assert.equal(view.render().playbackError, 'vi:voice.notice.audio_unavailable');
  const englishRevision = manifest.catalogues['old-quarter-pilot'].en.datasetRevision;
  const nextScope = {
    ...options,
    locale: 'en',
    datasetRevision: englishRevision,
    scope: `live:old-quarter-pilot:en:${englishRevision}:${node.id}`,
  };
  view.render(nextScope);
  assert.equal(view.render().activeTrackId, null);
  assert.equal(view.render().playbackError, null);
  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: 'late stale /private/mm-may.mp3' };
  assert.equal(view.render().playbackError, null);

  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: null };
  const englishDataset = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));
  const englishNode = englishDataset.nodes.find((item) => item.id === node.id);
  const englishId = `${englishNode.id}-story`;
  const englishTrack = catalog.lookupVoiceTrack({
    collectionId: 'old-quarter-pilot', locale: 'en', contentId: englishId, datasetRevision: englishRevision,
  });
  assert.equal(englishTrack?.kind, 'story');
  assert.equal(englishTrack?.nodeId, englishNode.id);
  assert.equal(englishTrack?.textHash, textHash(englishNode.story));
  await view.render().playTrack(englishId, englishNode.story, 'story', englishNode.id);
  assert.equal(view.playerSources.at(-1), englishTrack.source);
  view.playbackStatus = { playing: false, currentTime: 0, duration: 69.825, error: 'EACCES /private/mm-may-en.mp3' };
  assert.equal(view.render().playbackError, 'en:voice.notice.audio_unavailable');
  view.render({ ...nextScope, isFocused: false });
  assert.equal(view.render().activeTrackId, null);
  assert.equal(view.render().playbackError, null);
  view.playbackStatus = { playing: false, currentTime: 0, duration: 0, error: 'late navigation /private/mm-may-en.mp3' };
  assert.equal(view.render().playbackError, null);
  assert.ok(view.playerEvents.includes('pause'));
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
