import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import { setImmediate } from 'node:timers/promises';
import ts from 'typescript';
import { StackRouter, CommonActions, StackActions } from '@react-navigation/routers';
import * as sources from '../src/data/sourceState.ts';
import * as qa from '../src/qa/match.ts';
import * as confirmation from '../src/qr/confirmPoint.ts';
import * as recommendation from '../src/recommendation/pick.ts';
import * as voiceIntent from '../src/voice/intent.ts';
import * as voiceAppState from '../src/voice/appState.ts';
import * as translator from '../src/i18n/translator.ts';

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

// Execute screen handlers and state transitions without a native renderer.
// Native layout, permissions and hardware are checked separately on devices.
function mount(file, props = {}, overrides = {}, exportName) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pending = [];
  let tree;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const element = (type, properties) => ({ type, props: properties });
  const react = {
    createContext: (value) => ({ value, Provider: 'MotionProvider' }),
    useContext: (context) => context.value,
    useRef(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: { current: initial } };
      return slots[i].value;
    },
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (next) => {
        const value = typeof next === 'function' ? next(slots[i].value) : next;
        if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; }
      }];
    },
    useEffect(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) {
        pending.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: callback() }; });
      }
    },
    useCallback(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, callback };
      return slots[i].callback;
    },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx: element, jsxs: element },
    'react-native': new Proxy({
      AccessibilityInfo: overrides.__accessibilityInfo ?? { announceForAccessibility() {} },
      StyleSheet: { create: (styles) => styles, absoluteFill: {} },
      Platform: { OS: 'android' },
      Keyboard: { dismiss() {} },
      Linking: overrides.__linking ?? { openSettings: async () => {} },
      useWindowDimensions: () => overrides.__windowDimensions ?? ({ width: 400, height: 850, fontScale: 1 }),
      Animated: {
        View: 'Animated.View',
        Image: 'Animated.Image',
        Value: class {
          constructor(val) {
            this.val = val;
          }
          interpolate() {
            return this;
          }
          setValue(value) { this.val = value; }
          stopAnimation() { this.animation?.stop(); }
        },
        timing(value, config) {
          return { start: (cb) => { value.setValue(config.toValue); cb?.({ finished: true }); }, stop() {} };
        },
        spring(value, config) {
          return { start: (cb) => { value.setValue(config.toValue); cb?.({ finished: true }); }, stop() {} };
        },
        loop() {
          return { start: () => {}, stop: () => {} };
        },
        sequence() {
          return { start: (cb) => cb?.({ finished: true }), stop() {} };
        },
      },
    }, { get: (object, key) => object[key] ?? key }),
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
    '@react-navigation/native': { DefaultTheme: { colors: {} }, NavigationContainer: 'NavigationContainer', useIsFocused: () => true },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }) },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-svg': { default: 'Svg', Path: 'Path', __esModule: true },
    './app.json': { expo: { extra: {} } },
    '../data/demo.json': fixture,
    '../data/sourceState': sources,
    '../recommendation/pick': recommendation,
    '../voice/intent': voiceIntent,
    './src/voice/config': { readVoiceApiBaseUrl: () => '' },
    './src/voice/catalog': { voiceCatalogueRevision: 'fixture-revision', voiceTracks: {} },
    '../voice/catalog': { voiceCatalogueRevision: 'fixture-revision', voiceTracks: {} },
    './src/voice/localizedCatalog': {
      voiceCatalogueRevision: 'fixture-revision',
      lookupVoiceTrack: ({ collectionId = 'fiction-letter', locale = 'vi', contentId } = {}) => {
        if (collectionId === 'fiction-letter' && (locale === 'vi' || !locale)) {
          return { id: contentId, kind: 'answer', source: 1, textHash: 'dummy', durationSeconds: 10 };
        }
        return undefined;
      },
    },
    '../voice/localizedCatalog': {
      voiceCatalogueRevision: 'fixture-revision',
      lookupVoiceTrack: ({ collectionId = 'fiction-letter', locale = 'vi', contentId } = {}) => {
        if (collectionId === 'fiction-letter' && (locale === 'vi' || !locale)) {
          return { id: contentId, kind: 'answer', source: 1, textHash: 'dummy', durationSeconds: 10 };
        }
        return undefined;
      },
    },
    '../voice/performance': { recordVoicePerformance() {}, voicePerformanceNow: () => 0 },
    './performance': { recordVoicePerformance() {}, voicePerformanceNow: () => 0 },
    '../voice/useVoiceSession': { useVoiceSession: () => ({
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }) },
    './src/data/sourceState': sources,
    '../qa/match': qa,
    '../qr/confirmPoint': confirmation,
    './src/data/live': { readLiveConfig: () => undefined, loadLiveSource: async () => sources.liveEmpty('no-config'), loadLiveSourceV2: async () => sources.liveEmpty('no-config') },
    './src/navigation': { areas: {} },
    '../assets/photoMap': { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'Demo', getAlleyMeta: () => ({ name: 'Ngõ demo', coverPhoto: 1, photographer: 'Demo' }) },
    '../theme': { colors: {}, radius: {}, spacing: {}, typography: {} },
    './src/theme': { colors: {} },
    './src/hooks/MotionPreferences': { MotionProvider: 'MotionProvider', useMotionPreferences: () => ({ reducedMotion: false, foreground: true }) },
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    './MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true }) },
    '../theme/motion': { motionDurations: { fast: 220, ambientPulse: 2400 }, motionEasings: {}, motionScales: {}, motionSprings: { tactilePress: {} } },
    './AppIcon': { AppIcon: 'AppIcon' },
    '../i18n/translator': translator,
    './src/i18n/translator': translator,
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale() {},
        collectionId: 'fiction-letter',
        setCollectionId() {},
        isReady: true,
        t: (key, params) => translator.t('vi', key, params),
      }),
      LocaleProvider: 'LocaleProvider',
    },
    './src/context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale() {},
        collectionId: 'fiction-letter',
        setCollectionId() {},
        isReady: true,
        t: (key, params) => translator.t('vi', key, params),
      }),
      LocaleProvider: 'LocaleProvider',
    },
    './src/data/collections': {
      DEFAULT_COLLECTION_ID: 'fiction-letter',
      getBundledDataset: () => fixture,
      getCollectionRevision: () => 'fixture-revision',
      isCollectionId: (v) => v === 'fiction-letter' || v === 'old-quarter-pilot',
      AVAILABLE_COLLECTIONS: [
        { id: 'fiction-letter', nameKey: 'collection.fiction_letter.name', districtKey: 'collection.fiction_letter.district', themeKey: 'collection.fiction_letter.theme', taglineKey: 'collection.fiction_letter.tagline', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
        { id: 'old-quarter-pilot', nameKey: 'collection.old_quarter_pilot.name', districtKey: 'collection.old_quarter_pilot.district', themeKey: 'collection.old_quarter_pilot.theme', taglineKey: 'collection.old_quarter_pilot.tagline', nodeCount: 3, coverPhoto: 1, kind: 'reviewed' },
      ],
      getLocalizedCollections: (loc = 'vi') => [
        { id: 'fiction-letter', name: loc === 'en' ? 'Hanoi Letters — Story Alleys' : 'Thư Hà Nội — Ngõ Kể chuyện', coverPhoto: 1, kind: 'simulated', nodeCount: 6 },
        { id: 'old-quarter-pilot', name: loc === 'en' ? 'Old Quarter Pilot' : 'Thử nghiệm Phố Cổ', coverPhoto: 1, kind: 'reviewed', nodeCount: 3 },
      ],
    },
    '../data/collections': {
      DEFAULT_COLLECTION_ID: 'fiction-letter',
      getBundledDataset: () => fixture,
      getCollectionRevision: () => 'fixture-revision',
      isCollectionId: (v) => v === 'fiction-letter' || v === 'old-quarter-pilot',
      AVAILABLE_COLLECTIONS: [
        { id: 'fiction-letter', nameKey: 'collection.fiction_letter.name', districtKey: 'collection.fiction_letter.district', themeKey: 'collection.fiction_letter.theme', taglineKey: 'collection.fiction_letter.tagline', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
        { id: 'old-quarter-pilot', nameKey: 'collection.old_quarter_pilot.name', districtKey: 'collection.old_quarter_pilot.district', themeKey: 'collection.old_quarter_pilot.theme', taglineKey: 'collection.old_quarter_pilot.tagline', nodeCount: 3, coverPhoto: 1, kind: 'reviewed' },
      ],
      getLocalizedCollections: (loc = 'vi') => [
        { id: 'fiction-letter', name: loc === 'en' ? 'Hanoi Letters — Story Alleys' : 'Thư Hà Nội — Ngõ Kể chuyện', coverPhoto: 1, kind: 'simulated', nodeCount: 6 },
        { id: 'old-quarter-pilot', name: loc === 'en' ? 'Old Quarter Pilot' : 'Thử nghiệm Phố Cổ', coverPhoto: 1, kind: 'reviewed', nodeCount: 3 },
      ],
    },
    './src/data/localeStorage': {
      readPersistedLocaleAsync: async () => 'vi',
      writePersistedLocaleAsync: async () => {},
      resolveEffectiveLocale: () => 'vi',
    },
    '../data/localeStorage': {
      readPersistedLocaleAsync: async () => 'vi',
      writePersistedLocaleAsync: async () => {},
      resolveEffectiveLocale: () => 'vi',
    },
    './src/data/locale': {
      isLocale: (v) => v === 'vi' || v === 'en',
    },
    '../data/locale': {
      isLocale: (v) => v === 'vi' || v === 'en',
    },
    '../hooks/useMotion': {
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),
      useWaveformLoop: () => [1, 1, 1, 1, 1, 1, 1],
      useLaserScanner: () => ({ scanProgress: 0, translateYPct: { interpolate: () => 0 }, beamOpacity: 1 }),
    },
    'expo-crypto': {
      CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
      digestStringAsync: async (_algo, str) =>
        createHash('sha256').update(str, 'utf8').digest('hex'),
    },
    ...overrides,
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext('(function(require,module,exports){' + code + '\n})', { process: { env: {} }, setTimeout, clearTimeout, AbortController: globalThis.AbortController, ...overrides.__globals })((id) => {
    if (modules[id]) return modules[id];
    if (/\/screens\//.test(id) || /\/components\//.test(id) || id === './UnavailableScreen') {
      const name = id.split('/').at(-1);
      return { [name]: name };
    }
    throw new Error(`Unexpected import: ${id}`);
  }, module, module.exports);
  const component = exportName ? module.exports[exportName] : module.exports.default ?? Object.values(module.exports)[0];
  return {
    render(nextProps = props) {
      props = nextProps;
      dirty = true;
      let passes = 0;
      while (dirty) {
        assert.ok(passes++ < 20, 'state/effect loop');
        dirty = false; cursor = 0; pending = [];
        tree = component(props);
        pending.forEach((effect) => effect());
      }
      return tree;
    },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function elements(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => elements(child, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}
function screen(tree, name, navigation = { goBack() {}, navigate() {}, replace() {}, popTo() {} }, params) {
  return elements(tree, 'Screen').find((item) => item.props.name === name).props.children({ navigation, route: { params } }).props;
}

test('status bar follows navigation and unavailable pages without iOS native-stack overrides', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  const style = () => elements(tree, 'StatusBar')[0].props.barStyle;
  const navigate = (name) => {
    elements(tree, 'NavigationContainer')[0].props.onStateChange({ index: 0, routes: [{ name }] });
    tree = app.render();
  };
  assert.equal(style(), 'light-content');
  assert.equal(elements(tree, 'Navigator')[0].props.screenOptions.statusBarStyle, undefined);
  for (const item of elements(tree, 'Screen')) {
    if (typeof item.props.options === 'object') assert.equal(item.props.options.statusBarStyle, undefined);
  }
  navigate('Plan');
  assert.equal(style(), 'dark-content');
  navigate('Home');
  assert.equal(style(), 'light-content');
  screen(tree, 'Home').onModeChange('live');
  tree = app.render();
  assert.equal(style(), 'dark-content');
  navigate('Qa');
  assert.equal(style(), 'dark-content');
  screen(tree, 'Home').onModeChange('demo');
  tree = app.render();
  assert.equal(style(), 'light-content');
  navigate('Location');
  assert.equal(style(), 'dark-content');
  navigate('Landing');
  assert.equal(style(), 'light-content');
});

test('viewing, confirming, reading and planning share state without confirming a preview', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  screen(tree, 'Home').onSelectNode('demo-02');
  tree = app.render();
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-02');
  assert.equal(screen(tree, 'Location').currentNodeId, undefined);
  screen(tree, 'Camera').onConfirmNode('demo-03');
  tree = app.render();
  assert.equal(screen(tree, 'Home').currentNodeId, 'demo-03');
  assert.equal(screen(tree, 'Location').currentNodeId, 'demo-03');
  screen(tree, 'Plan').onSelectNode('demo-05');
  tree = app.render();
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-05');
  assert.equal(screen(tree, 'Location').currentNodeId, 'demo-03');
  screen(tree, 'Qa').onReadNode('demo-05');
  screen(tree, 'Qa').onReadNode('demo-05');
  tree = app.render();
  assert.equal(screen(tree, 'Home').readNodeIds.size, 1);
  screen(tree, 'Home').onSelectNode('unknown');
  assert.equal(screen(app.render(), 'Home').currentNodeId, 'demo-05');
});

test('Live retry makes a new request and late results cannot replace Demo', async () => {
  const requests = [];
  const app = mount('../App.tsx', {}, {
    './src/data/live': { readLiveConfig: () => undefined, loadLiveSource: () => new Promise((resolve) => requests.push(resolve)), loadLiveSourceV2: () => new Promise((resolve) => requests.push(resolve)) },
  });
  let tree = app.render();
  screen(tree, 'Home').onModeChange('live');
  tree = app.render();
  assert.equal(requests.length, 1);
  screen(tree, 'Home').onRetryLive();
  app.render();
  assert.equal(requests.length, 1, 'busy retry is blocked');
  requests[0](sources.liveError('network'));
  await Promise.resolve();
  tree = app.render();
  assert.equal(screen(tree, 'Home').source.status, 'error');
  screen(tree, 'Home').onRetryLive();
  tree = app.render();
  assert.equal(requests.length, 2);
  screen(tree, 'Home').onModeChange('demo');
  app.render();
  requests[1](sources.liveEmpty('no-data'));
  await Promise.resolve();
  tree = app.render();
  assert.equal(screen(tree, 'Home').source.mode, 'demo');
  assert.equal(screen(tree, 'Home').source.status, 'ready');
});

test('Q&A uses only the selected point, clears the previous answer and offers real actions', () => {
  let selected = 'demo-01';
  const read = new Set();
  let answerPlays = 0;
  const voiceSession = {
    stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
    playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
    startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
    playTrack() { answerPlays++; }, replayTrack() {},
  };
  const props = () => ({ dataset: fixture, currentNodeId: selected, onSelectNode: (id) => { selected = id; }, onReadNode: (id) => read.add(id), readNodeIds: read, onOpenNotebook() {} });
  const view = mount('../src/screens/QaScreen.tsx', props(), { '../voice/useVoiceSession': { useVoiceSession: () => voiceSession } });
  let tree = view.render();
  assert.ok(elements(tree, 'Pressable').some((item) => item.props.accessibilityLabel === 'Xem lời kể bằng chữ'));
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Đây là điểm nào?');
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'answer stays hidden until the reader is opened');
  assert.equal(answerPlays, 0, 'text suggestions do not start audio');
  const showText = () => elements(tree, 'Pressable').find((item) => elements(item, 'Text').some((text) => text.props.children === 'Xem lời kể bằng chữ'));
  showText().props.onPress();
  tree = view.render(props());
  assert.ok(JSON.stringify(tree).includes(fixture.qa[0].answer));
  const labels = elements(tree, 'Pressable').map((item) => item.props.accessibilityLabel);
  assert.ok(labels.includes('Thu gọn lời kể'));
  assert.ok(labels.includes('Thu gọn câu trả lời'));
  assert.ok(labels.includes('Đặt câu hỏi khác'));
  assert.ok(labels.includes(`Hỏi tiếp: ${fixture.qa.find((item) => item.id === 'qa-02').question}`));
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Điểm tiếp theo').props.onPress();
  tree = view.render(props());
  assert.equal(selected, 'demo-02');
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false);
  const nodeQuestions = fixture.qa.filter((item) => item.nodeId === 'demo-02').map((item) => item.question);
  assert.deepEqual(Array.from(elements(tree, 'ExpandableInputDrawer')[0].props.suggestedQuestions), nodeQuestions);
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion(nodeQuestions[0]);
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa.find((item) => item.nodeId === 'demo-02').answer), false);
  const dock = elements(tree, 'VoiceInteractionDock')[0].props;
  assert.equal(typeof dock.onStartRecording, 'function');
  assert.equal(typeof dock.onSubmitRecording, 'function');
  assert.equal(typeof dock.onCancel, 'function');
  assert.equal(typeof dock.onOpenInput, 'function');
  assert.equal(typeof dock.onQuickAction, 'function');
  assert.equal(answerPlays, 0, 'question chips do not start audio');
  assert.equal(read.size, 2);

  selected = 'demo-01';
  tree = view.render(props());
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Đây là điểm nào?');
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'changing back keeps the answer hidden');
  showText().props.onPress();
  tree = view.render(props());
  assert.ok(JSON.stringify(tree).includes(fixture.qa[0].answer));
  tree = view.render({ ...props(), dataset: { ...fixture, qa: [] } });
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'dataset refresh clears the old answer');
  assert.deepEqual(Array.from(elements(tree, 'ExpandableInputDrawer')[0].props.suggestedQuestions), []);
  assert.ok(JSON.stringify(tree).includes('Chưa có câu hỏi cho điểm này'), 'missing Q&A still has an explicit fallback');
});

test('voice answers play catalogue audio in Demo and known Live, and explain the Live text fallback when missing', async () => {
  function run(mode, hasAudio = mode === 'demo') {
    let transcript;
    const played = [];
    const props = { dataset: fixture, mode, datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {} };
    const view = mount('../src/screens/QaScreen.tsx', props, {
      '../voice/useVoiceSession': { useVoiceSession: (options) => {
        transcript = options.onTranscript;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
          playTrack(...args) { played.push(args); }, replayTrack() {},
        };
      } },
      '../voice/localizedCatalog': {
        voiceCatalogueRevision: 'rev-1',
        lookupVoiceTrack: ({ collectionId = 'fiction-letter', locale = 'vi', contentId } = {}) => {
          if (!hasAudio) return undefined;
          if (collectionId === 'fiction-letter' && (locale === 'vi' || !locale)) {
            return { id: contentId, kind: 'answer', source: 1, textHash: 'dummy', durationSeconds: 10 };
          }
          return undefined;
        },
      },
    });
    view.render();
    const context = { turnId: 'turn-1', scope: `${mode}:rev-1:demo-01`, nodeId: 'demo-01', mode, datasetRevision: 'rev-1' };
    transcript(fixture.qa[0].question, context);
    return { view, tree: view.render(), transcript, context, played };
  }

  const demo = run('demo');
  await Promise.resolve();
  assert.equal(demo.played.length, 1);
  assert.equal(demo.played[0][0], `${fixture.qa[0].id}-answer`);
  const followUp = fixture.qa.find((entry) => entry.question === 'Có chuyện xưa nào ở đây không?');
  assert.ok(followUp, 'the first answer exposes the expected story follow-up');
  demo.transcript(followUp.question, { ...demo.context, turnId: 'turn-2' });
  await Promise.resolve();
  assert.equal(demo.played.length, 2);
  assert.equal(demo.played[1][0], `${followUp.id}-answer`);
  assert.equal(demo.played[1][1], followUp.answer);

  const live = run('live', false);
  assert.equal(live.played.length, 0);
  assert.ok(JSON.stringify(live.tree).includes('Bản đọc chưa có trong chế độ Live'));
  assert.equal(JSON.stringify(live.tree).includes(fixture.qa[0].answer), false, 'the Live answer remains collapsed until opened');
  live.transcript('Nghe lại', live.context);
  const replayTree = live.view.render();
  assert.equal(live.played.length, 0, 'replay never falls back to Demo audio in Live');
  assert.ok(JSON.stringify(replayTree).includes('Chế độ Live chưa có bản đọc'));

  const liveWithTrack = run('live', true);
  await Promise.resolve();
  assert.equal(liveWithTrack.played.length, 1, 'known matching track plays in Live');
  assert.equal(liveWithTrack.played[0][0], `${fixture.qa[0].id}-answer`);

  demo.view.unmount();
  live.view.unmount();
  liveWithTrack.view.unmount();
});

test('native playback errors show an accessible text fallback without exposing native details', () => {
  const nativeError = 'Failed to open /private/audio-clip.mp3';
  const voiceSession = {
    stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
    playback: { playing: false, currentTime: 0, duration: 0, error: nativeError },
    activeTrackId: 'demo-01-story', playbackError: null,
    startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
  };
  const view = mount('../src/screens/QaScreen.tsx', {
    dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01',
    onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
  }, {
    '../voice/useVoiceSession': { useVoiceSession: () => voiceSession },
    '../voice/catalog': {
      voiceCatalogueRevision: 'fixture-revision',
      voiceTracks: { 'demo-01-story': { kind: 'story', nodeId: 'demo-01', source: {}, textHash: 'hash', durationSeconds: 12 } },
    },
    '../voice/localizedCatalog': {
      voiceCatalogueRevision: 'fixture-revision',
      lookupVoiceTrack: ({ contentId }) => {
        if (contentId === 'demo-01-story') {
          return { kind: 'story', nodeId: 'demo-01', source: {}, textHash: 'hash', durationSeconds: 12 };
        }
        return undefined;
      },
    },
  });
  const tree = view.render();
  const alerts = elements(tree, 'Text').filter((item) => item.props.accessibilityRole === 'alert');
  assert.ok(alerts.some((item) => item.props.children === 'Không mở được bản đọc. Bạn vẫn có thể xem lời kể bằng chữ.'));
  assert.equal(JSON.stringify(tree).includes(nativeError), false);
  view.unmount();
});

test('voice transcripts route every canonical answer to its owning chapter audio', async () => {
  for (const node of fixture.nodes) {
    const entries = fixture.qa.filter((entry) => entry.nodeId === node.id);
    const played = [];
    let transcript;
    const props = {
      dataset: fixture,
      mode: 'demo',
      datasetRevision: 'rev-1',
      currentNodeId: node.id,
      onSelectNode() {},
      onReadNode() {},
      readNodeIds: new Set(),
      onOpenNotebook() {},
    };
    const view = mount('../src/screens/QaScreen.tsx', props, {
      '../voice/useVoiceSession': { useVoiceSession: (options) => {
        transcript = options.onTranscript;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
          playTrack(...args) { played.push(args); }, replayTrack() {},
        };
      } },
    });
    view.render();

    for (const [index, entry] of entries.entries()) {
      transcript(entry.question, {
        turnId: `${node.id}-${index}`,
        scope: `demo:rev-1:${node.id}`,
        nodeId: node.id,
        mode: 'demo',
        datasetRevision: 'rev-1',
      });
      await Promise.resolve();
      assert.deepEqual(played.at(-1), [`${entry.id}-answer`, entry.answer, 'answer', node.id]);
      view.render();
    }

    const foreignEntry = fixture.qa.find((entry) => entry.nodeId !== node.id);
    transcript(foreignEntry.question, {
      turnId: `${node.id}-foreign`,
      scope: `demo:rev-1:${node.id}`,
      nodeId: node.id,
      mode: 'demo',
      datasetRevision: 'rev-1',
    });
    await Promise.resolve();
    assert.equal(played.length, entries.length, `${node.id} must not play another chapter's answer`);
    view.unmount();
  }
});

test('a new mic turn cancels a pending automatic answer playback', async () => {
  let transcript;
  let finishStop;
  let starts = 0;
  const played = [];
  const playbackStopped = new Promise((resolve) => { finishStop = resolve; });
  const view = mount('../src/screens/QaScreen.tsx', {
    dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01',
    onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
  }, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => {
      transcript = options.onTranscript;
      return {
        stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
        playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
        startRecording() { starts++; }, submitRecording() {}, cancel() {}, stopPlayback: () => playbackStopped,
        playTrack(...args) { played.push(args); }, replayTrack() {},
      };
    } },
  });
  view.render();
  transcript(fixture.qa[0].question, {
    turnId: 'turn-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1',
  });
  const dock = elements(view.render(), 'VoiceInteractionDock')[0].props;
  dock.onStartRecording();
  finishStop(true);
  await Promise.resolve();

  assert.equal(starts, 1);
  assert.equal(played.length, 0, 'the prior turn must not restart answer audio over the new microphone session');
  view.unmount();
});

test('voice answer auto-play is blocked and explained if the old playback does not stop', async () => {
  let transcript;
  const played = [];
  const view = mount('../src/screens/QaScreen.tsx', {
    dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01',
    onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
  }, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => {
      transcript = options.onTranscript;
      return {
        stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
        playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
        startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback: async () => false,
        playTrack(...args) { played.push(args); }, replayTrack() {},
      };
    } },
  });
  view.render();
  transcript(fixture.qa[0].question, {
    turnId: 'turn-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1',
  });
  await Promise.resolve();

  assert.equal(played.length, 0);
  view.unmount();
});

test('voice playback and recording expose accessible progress values and a full-size cancel target', () => {
  const player = mount('../src/components/VoicePlayerBar.tsx', {
    label: 'Lời kể chương một', active: true, playing: false,
    currentTime: 30, duration: 120, measuredDuration: 0,
    onPlay() {}, onReplay() {}, onStop() {},
  });
  const playerTree = player.render();
  const playerTitle = elements(playerTree, 'Text').find((item) => item.props.children === 'Lời kể chương một');
  assert.ok(playerTitle);
  assert.equal(playerTitle.props.numberOfLines, undefined);
  const playbackProgress = elements(playerTree, 'View').find((item) => item.props.accessibilityRole === 'progressbar');
  assert.deepEqual(JSON.parse(JSON.stringify(playbackProgress.props.accessibilityValue)), { min: 0, max: 100, now: 25 });

  const dock = mount('../src/components/VoiceInteractionDock.tsx', {
    stage: 'recording', error: null, recordingDurationMs: 1000, metering: -40,
    onStartRecording() {}, onSubmitRecording() {}, onCancel() {}, onOpenInput() {},
  }, { '../voice/metering': { meteringToLevel: (value) => (value + 80) / 80 } });
  const dockTree = dock.render();
  const recordingProgress = elements(dockTree, 'View').find((item) => item.props.accessibilityLabel === 'Mức âm thanh đang thu');
  assert.deepEqual(JSON.parse(JSON.stringify(recordingProgress.props.accessibilityValue)), { min: 0, max: 100, now: 50 });
  const cancel = elements(dockTree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Hủy bản ghi');
  assert.equal(cancel.props.style.minHeight, 48);
});

test('duplicate submit, cancel and scope change invalidate pending voice turns', async () => {
  const deferred = () => {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
  };
  let nativeStop = deferred();
  let asrResponse = deferred();
  let stopCalls = 0;
  let transcribeCalls = 0;
  let requestSignal;
  let delivered = 0;
  let isRecording = false;
  const playbackEvents = [];
  const audioPlayer = {
    loop: false,
    plays: 0,
    pause() {},
    play() { playbackEvents.push('play'); this.plays += 1; },
    replace() { playbackEvents.push('replace'); },
  };
  const recorder = {
    get isRecording() { return isRecording; },
    uri: 'file:///cache/voice-question.m4a',
    async prepareToRecordAsync() {},
    record() { isRecording = true; },
    stop() { stopCalls += 1; return nativeStop.promise; },
  };
  class MockFile {
    constructor() { this.exists = false; }
    delete() {}
    bytes() { return new Uint8Array(); }
  }
  const options = {
    apiBaseUrl: 'http://gateway', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01',
    mode: 'demo', datasetRevision: 'rev-1', isFocused: true,
    onTranscript() { delivered += 1; },
  };
  const view = mount('../src/voice/useVoiceSession.ts', options, {
    'expo-audio': {
      RecordingPresets: { HIGH_QUALITY: {} },
      useAudioPlayer: () => audioPlayer,
      useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
      useAudioRecorder: () => recorder,
      useAudioRecorderState: () => ({ durationMillis: 1000, metering: -30 }),
      setAudioModeAsync: async () => { playbackEvents.push('audio-mode'); },
      requestRecordingPermissionsAsync: async () => ({ granted: true, canAskAgain: true }),
    },
    'react-native': { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-crypto': {
      CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
      digestStringAsync: async () => { playbackEvents.push('hash'); return 'hash'; },
    },
    'expo-file-system': { File: MockFile },
    './catalog': {
      voiceTracks: {
        'demo-01-story': { kind: 'story', nodeId: 'demo-01', textHash: 'hash', source: 'story-audio' },
      },
      voiceCatalogueRevision: 'rev-1',
    },
    './localizedCatalog': {
      voiceTracks: {
        'demo-01-story': { kind: 'story', nodeId: 'demo-01', textHash: 'hash', source: 'story-audio' },
      },
      voiceCatalogueRevision: 'rev-1',
      lookupVoiceTrack: ({ contentId }) => {
        if (contentId === 'demo-01-story') {
          return { kind: 'story', nodeId: 'demo-01', textHash: 'hash', source: 'story-audio' };
        }
        return undefined;
      },
    },
    './appState': voiceAppState,
    './recorderPreparation': {
      prepareVoiceRecorderForTurn: async ({ isCurrent }) => isCurrent(),
      startVoiceRecorder: async (start, _isActive, isCurrent) => { await start(); return isCurrent(); },
      stopVoiceRecorderWithTimeout: async (stopRecorder) => {
        try {
          await stopRecorder();
          return { kind: 'stopped' };
        } catch (error) {
          return { kind: 'failed', error };
        }
      },
    },
    './recordingLimit': { hasReachedVoiceRecordingLimit: () => false },
    './transcribe': {
      createVoiceRequestBody: () => ({}),
      transcribeVoiceRequest: async (_url, _body, controller) => {
        transcribeCalls += 1;
        requestSignal = controller.signal;
        return asrResponse.promise;
      },
    },
    './playback': {
      isPlaybackRequestCurrent: (request, current, requestedScope, activeScope) => request === current && requestedScope === activeScope,
      restartAudioPlayer: async () => {},
      stopAudioPlayer: async (player) => { player.loop = false; return true; },
    },
    __globals: { AbortController },
  }, 'useVoiceSession');

  await view.render().playTrack('demo-01-story', 'Câu chuyện mở đầu', 'story', 'demo-01');
  assert.deepEqual(playbackEvents, ['hash', 'audio-mode', 'replace', 'play']);
  assert.equal(audioPlayer.loop, true, 'story playback automatically repeats');
  assert.equal(audioPlayer.plays, 1);

  await view.render().startRecording();
  assert.equal(view.render().stage, 'recording');
  const submission = view.render().submitRecording();
  assert.equal(view.render().stage, 'stopping');
  await view.render().submitRecording();
  assert.equal(stopCalls, 1, 'a second tap cannot stop or submit the same recorder again');

  nativeStop.resolve();
  for (let i = 0; i < 10 && transcribeCalls === 0; i += 1) await setImmediate();
  assert.equal(view.render().stage, 'transcribing');
  await view.render().submitRecording();
  assert.equal(transcribeCalls, 1, 'a second tap during ASR cannot create another request');

  view.render().cancel();
  assert.equal(requestSignal.aborted, true);
  asrResponse.resolve('late transcript');
  await submission;
  assert.equal(delivered, 0, 'the canceled turn cannot deliver its late transcript');
  assert.equal(view.render().stage, 'idle');

  nativeStop = deferred();
  await view.render().startRecording();
  const canceledStop = view.render().submitRecording();
  assert.equal(view.render().stage, 'stopping');
  view.render().cancel();
  nativeStop.resolve();
  await canceledStop;
  assert.equal(view.render().stage, 'idle', 'cancel during native stop returns the dock to idle');
  assert.equal(transcribeCalls, 1, 'cancel during native stop prevents upload');

  nativeStop = deferred();
  asrResponse = deferred();
  await view.render().startRecording();
  const staleScopeSubmission = view.render().submitRecording();
  nativeStop.resolve();
  for (let i = 0; i < 10 && transcribeCalls < 2; i += 1) await setImmediate();
  assert.equal(view.render().stage, 'transcribing');
  assert.equal(transcribeCalls, 2);

  options.scope = 'demo:rev-2:demo-02';
  options.nodeId = 'demo-02';
  options.datasetRevision = 'rev-2';
  view.render(options);
  assert.equal(requestSignal.aborted, true, 'changing node/revision aborts the prior request');
  assert.equal(view.render().stage, 'idle');
  asrResponse.resolve('answer from the previous point');
  await staleScopeSubmission;
  assert.equal(delivered, 0, 'the prior point cannot deliver its late transcript');
  view.unmount();
});

test('regression - stale voice submission resolution cannot reset a newer active turn across locale or collection', async () => {
  let delivered = [];
  let transcribeCalls = 0;
  const asrResponses = [];
  const requestSignals = [];

  const audioPlayer = { play: async () => {}, pause: async () => {}, replace: async () => {}, loop: false };
  const recorder = {
    prepareToRecordAsync: async () => {},
    record: async () => {},
    stop: async () => {},
    uri: 'file://recording.m4a',
  };
  const deletedFiles = [];
  class MockFile {
    constructor(uri) { this.uri = uri; }
    exists() { return true; }
    delete() { deletedFiles.push(this.uri); }
    bytes() { return new Uint8Array(); }
  }

  const options = {
    apiBaseUrl: 'http://gateway',
    scope: 'demo:rev-1:demo-01',
    nodeId: 'demo-01',
    mode: 'demo',
    datasetRevision: 'rev-1',
    locale: 'vi',
    collectionId: 'fiction-letter',
    isFocused: true,
    onTranscript(text) { delivered.push(text); },
  };

  const deferred = () => {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    return { promise, resolve };
  };

  const view = mount('../src/voice/useVoiceSession.ts', options, {
    'expo-audio': {
      RecordingPresets: { HIGH_QUALITY: {} },
      useAudioPlayer: () => audioPlayer,
      useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
      useAudioRecorder: () => recorder,
      useAudioRecorderState: () => ({ durationMillis: 1000, metering: -30 }),
      setAudioModeAsync: async () => {},
      requestRecordingPermissionsAsync: async () => ({ granted: true, canAskAgain: true }),
    },
    'react-native': { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-crypto': {
      CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
      digestStringAsync: async () => 'hash',
    },
    'expo-file-system': { File: MockFile },
    './catalog': {
      voiceTracks: {},
      voiceCatalogueRevision: 'rev-1',
    },
    './localizedCatalog': {
      voiceTracks: {},
      voiceCatalogueRevision: 'rev-1',
      lookupVoiceTrack: () => undefined,
    },
    './appState': voiceAppState,
    './recorderPreparation': {
      prepareVoiceRecorderForTurn: async ({ isCurrent }) => isCurrent(),
      startVoiceRecorder: async (start, _isActive, isCurrent) => { await start(); return isCurrent(); },
      stopVoiceRecorderWithTimeout: async (stopRecorder) => {
        try {
          await stopRecorder();
          return { kind: 'stopped' };
        } catch (error) {
          return { kind: 'failed', error };
        }
      },
    },
    './recordingLimit': { hasReachedVoiceRecordingLimit: () => false },
    './transcribe': {
      createVoiceRequestBody: () => ({}),
      transcribeVoiceRequest: async (_url, _body, controller) => {
        transcribeCalls += 1;
        requestSignals.push(controller.signal);
        const def = deferred();
        asrResponses.push(def);
        return def.promise;
      },
    },
    './playback': {
      isPlaybackRequestCurrent: () => true,
      restartAudioPlayer: async () => {},
      stopAudioPlayer: async () => true,
    },
    __globals: { AbortController },
  }, 'useVoiceSession');

  // Turn 1: VI start and submit
  await view.render().startRecording();
  assert.equal(view.render().stage, 'recording');
  const submission1 = view.render().submitRecording();
  for (let i = 0; i < 10 && transcribeCalls === 0; i += 1) await setImmediate();
  assert.equal(view.render().stage, 'transcribing');
  assert.equal(transcribeCalls, 1);

  // Switch locale to EN on same scope/node/rev -> cancels turn 1
  options.locale = 'en';
  view.render(options);
  assert.equal(view.render().stage, 'idle');
  assert.equal(requestSignals[0].aborted, true, 'Turn 1 signal aborted upon locale change');

  // Turn 2: EN start and submit
  await view.render().startRecording();
  assert.equal(view.render().stage, 'recording');
  const submission2 = view.render().submitRecording();
  for (let i = 0; i < 10 && transcribeCalls === 1; i += 1) await setImmediate();
  assert.equal(view.render().stage, 'transcribing');
  assert.equal(transcribeCalls, 2);

  // Resolve OLD turn 1 ASR and wait for submission1 cleanup
  asrResponses[0].resolve('stale transcript 1');
  await submission1;

  // CRITICAL: Turn 2 must NOT have been reset to idle by Turn 1 cleanup!
  assert.equal(view.render().stage, 'transcribing', 'Turn 2 remains transcribing after Turn 1 resolves');
  assert.equal(delivered.length, 0, 'Old transcript is ignored');

  // Resolve NEW turn 2 ASR and wait for submission2
  asrResponses[1].resolve('fresh transcript 2');
  await submission2;

  // Turn 2 delivered exactly once and stage transitioned to idle
  assert.deepEqual(delivered, ['fresh transcript 2']);
  assert.equal(view.render().stage, 'idle');

  view.unmount();
});

test('permanently denied microphone exposes an accessible settings action', () => {
  let opened = false;
  const dock = mount('../src/components/VoiceInteractionDock.tsx', {
    stage: 'error', error: 'Quyền micro đã bị chặn trong Cài đặt.', recordingDurationMs: 0,
    onStartRecording() {}, onSubmitRecording() {}, onCancel() {}, onOpenInput() {},
    onOpenSettings() { opened = true; },
  }, { '../voice/metering': { meteringToLevel: () => 0 } });
  const tree = dock.render();
  const settings = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở cài đặt quyền micro');
  assert.ok(settings);
  assert.ok(settings.props.style.minHeight >= 48);
  settings.props.onPress();
  assert.equal(opened, true);
});

test('voice stage changes are announced without repeating the recording timer', () => {
  const announcements = [];
  const props = {
    stage: 'preparing', error: null, recordingDurationMs: 0, metering: -60,
    onStartRecording() {}, onSubmitRecording() {}, onCancel() {}, onOpenInput() {},
  };
  const dock = mount('../src/components/VoiceInteractionDock.tsx', props, {
    __accessibilityInfo: { announceForAccessibility: (message) => announcements.push(message) },
    '../voice/metering': { meteringToLevel: () => 0 },
  });

  dock.render();
  dock.render({ ...props, stage: 'recording', recordingDurationMs: 1000 });
  dock.render({ ...props, stage: 'recording', recordingDurationMs: 2000 });
  dock.render({ ...props, stage: 'ready', recordingDurationMs: 2000 });
  dock.render({ ...props, stage: 'stopping', recordingDurationMs: 2000 });
  dock.render({ ...props, stage: 'transcribing', recordingDurationMs: 2000 });

  assert.deepEqual(announcements, [
    'Đang bật micro.',
    'Đang thu câu hỏi. Chạm Gửi để kết thúc hoặc Hủy bản ghi.',
    'Đã thu xong. Chạm Gửi để hỏi tiếp hoặc Hủy bản ghi.',
    'Đang lưu câu nói.',
    'Đang xử lý câu hỏi.',
  ]);
  dock.unmount();
});

test('voice Q&A routes every chapter question and one follow-up to its exact answer track', async () => {
  for (const node of fixture.nodes.filter((item) => item.available)) {
    for (const entry of fixture.qa.filter((item) => item.nodeId === node.id)) {
      let transcript;
      const played = [];
      const view = mount('../src/screens/QaScreen.tsx', {
        dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: node.id,
        onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
      }, {
        '../voice/useVoiceSession': { useVoiceSession: (options) => {
          transcript = options.onTranscript;
          return {
            stage: 'idle', error: null, recordingDurationMs: 0, metering: undefined,
            playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
            startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
            playTrack(...args) { played.push(args); }, replayTrack() {},
          };
        } },
      });
      view.render();
      const context = {
        turnId: 'turn-1', scope: `demo:rev-1:${node.id}`, nodeId: node.id, mode: 'demo', datasetRevision: 'rev-1',
      };

      transcript(entry.question, context);
      view.render();
      await Promise.resolve();
      assert.deepEqual(played[0]?.slice(0, 3), [`${entry.id}-answer`, entry.answer, 'answer'], `${node.id}/${entry.id}`);

      const followUp = fixture.qa.find((item) => item.id === entry.followUps[0]);
      assert.ok(followUp, `${entry.id} has a valid first follow-up`);
      transcript(followUp.question, { ...context, turnId: 'turn-2' });
      view.render();
      await Promise.resolve();
      assert.deepEqual(played[1]?.slice(0, 3), [`${followUp.id}-answer`, followUp.answer, 'answer'], `${node.id}/${followUp.id}`);
      view.unmount();
    }
  }
});

test('unmatched voice transcript stays hidden until the user opens it for diagnosis', () => {
  const transcriptText = 'Mình muốn hỏi một câu chưa có trong dữ liệu';
  let onTranscript;
  const voiceSession = {
    stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
    playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
    startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
  };
  const properties = {
    dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01',
    onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
  };
  const view = mount('../src/screens/QaScreen.tsx', properties, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => {
      onTranscript = options.onTranscript;
      return voiceSession;
    } },
  });
  view.render();
  onTranscript(transcriptText, {
    turnId: 'turn-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1',
  });
  let tree = view.render();
  assert.ok(JSON.stringify(tree).includes('Câu hỏi chưa khớp'));
  assert.equal(JSON.stringify(tree).includes('Chưa có lời kể cho câu này'), false, 'voice mismatch is not presented as missing story content');
  assert.equal(JSON.stringify(tree).includes(transcriptText), false, 'recognized speech remains hidden by default');
  const reveal = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Xem câu đã nhận dạng');
  assert.ok(reveal, 'an unmatched transcript has a visible diagnostic disclosure');
  reveal.props.onPress();
  tree = view.render();
  assert.ok(JSON.stringify(tree).includes(transcriptText), 'the user can inspect what speech recognition heard');
});

test('voice action cards wait for an explicit tap before opening QR or GPS', () => {
  let transcript;
  const opened = [];
  const properties = { dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {}, onOpenCamera: () => opened.push('qr'), onOpenLocation: () => opened.push('gps') };
  const view = mount('../src/screens/QaScreen.tsx', properties, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => { transcript = options.onTranscript; return {
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }; } },
  });
  view.render();
  const send = (text) => transcript(text, { turnId: 'turn-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  send('Mở QR');
  let tree = view.render();
  assert.ok(JSON.stringify(tree).includes('Xác định điểm bằng mã QR'));
  assert.deepEqual(opened, [], 'voice reveals the QR card without starting the camera');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở thẻ quét QR').props.onPress();
  assert.deepEqual(opened, ['qr']);
  send('Mở thẻ GPS');
  tree = view.render();
  assert.deepEqual(opened, ['qr'], 'GPS card does not request or navigate until tapped');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở thẻ GPS').props.onPress();
  assert.deepEqual(opened, ['qr', 'gps']);
});

test('asking what comes next never navigates, while an explicit next-chapter command does', () => {
  let transcript;
  const selected = [];
  const view = mount('../src/screens/QaScreen.tsx', {
    dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01',
    onSelectNode: (id) => selected.push(id), onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {},
  }, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => { transcript = options.onTranscript; return {
      stage: 'idle', error: null, recordingDurationMs: 0, metering: undefined,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }; } },
  });
  view.render();
  const send = (text, turnId) => transcript(text, {
    turnId, scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1',
  });

  send('Chương kế là gì?', 'question-1');
  view.render();
  send('Điểm kế tiếp là điểm nào?', 'question-2');
  view.render();
  assert.deepEqual(selected, [], 'questions about the next chapter stay on the current chapter');

  send('Mở chương kế', 'command-1');
  assert.deepEqual(selected, ['demo-02']);
  view.unmount();
});

test('voice plan recommendations stay inline and preserve their draft when opening Plan', () => {
  let transcript;
  let draft = {};
  let openedDraft;
  let selected;
  const properties = () => ({ dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode: (id) => { selected = id; }, onReadNode() {}, readNodeIds: new Set(), planDraft: draft, onPlanDraftChange: (next) => { draft = next; }, onOpenNotebook: (next) => { openedDraft = next; } });
  const view = mount('../src/screens/QaScreen.tsx', properties(), {
    '../voice/useVoiceSession': { useVoiceSession: (options) => { transcript = options.onTranscript; return {
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }; } },
  });
  view.render();
  transcript('Chọn trải nghiệm ẩm thực trong 30 phút', { turnId: 'plan-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  let tree = view.render(properties());
  assert.deepEqual(draft, { topic: 'an thuc', budgetMinutes: 30 });
  assert.ok(elements(tree, 'Pressable').some((item) => item.props.accessibilityLabel?.startsWith('Mở chương ')), 'picks come from the recommendation core');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel?.startsWith('Mở chương ')).props.onPress();
  assert.ok(selected, 'opening an inline pick selects a chapter without GPS confirmation');

  transcript('Chọn trải nghiệm chuyện xưa trong mười lăm phút', { turnId: 'plan-2', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  tree = view.render(properties());
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở bảng chọn trải nghiệm').props.onPress();
  assert.deepEqual(openedDraft, { topic: 'chuyen xua', budgetMinutes: 15 });
});

test('negated manual Plan input clears the previous topic and recommendations', () => {
  let draft = { topic: 'an thuc', budgetMinutes: 30 };
  const props = () => ({
    nodes: fixture.nodes,
    draft,
    onDraftChange: (next) => { draft = next; },
    onSelectNode() {},
  });
  const view = mount('../src/screens/PlanScreen.tsx', props(), {}, 'PlanScreen');
  let tree = view.render();
  elements(tree, 'Pressable').find((item) =>
    elements(item, 'Text').some((text) => [].concat(text.props.children).join('').includes('Nhập chủ đề')),
  ).props.onPress();
  tree = view.render(props());
  elements(tree, 'TextInput').find((item) => item.props.accessibilityLabel === 'Ô gõ chủ đề')
    .props.onChangeText('không đi ẩm thực trong 30 phút');
  tree = view.render(props());
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Dùng chủ đề đã gõ')
    .props.onPress();
  tree = view.render(props());

  assert.equal(draft.topic, undefined);
  assert.equal(draft.budgetMinutes, 30);
  assert.ok(JSON.stringify(tree).includes('Vui lòng chọn chủ đề'));
  assert.equal(JSON.stringify(tree).includes('Chủ đề ẩm thực · 30 phút'), false);
  view.unmount();
});

test('Plan draft is owned by App and survives the notebook route', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  const firstDraft = { topic: 'an thuc', budgetMinutes: 30 };
  screen(tree, 'Qa').onPlanDraftChange(firstDraft);
  tree = app.render();
  screen(tree, 'Qa').onOpenNotebook();
  tree = app.render();
  assert.deepEqual(screen(tree, 'Plan').draft, firstDraft);
  screen(tree, 'Plan').onDraftChange({ ...firstDraft, budgetMinutes: 45 });
  tree = app.render();
  assert.deepEqual(screen(tree, 'Qa').planDraft, { ...firstDraft, budgetMinutes: 45 });
});

test('Home pins match ids after reordering and empty sources have working escape actions', () => {
  const nodes = [...fixture.nodes].reverse();
  let selected;
  const props = { mode: 'demo', source: { ...sources.getSourceState('demo', fixture), dataset: { ...fixture, nodes } }, currentNodeId: 'demo-03', onSelectNode: (id) => { selected = id; }, readNodeIds: new Set(), onModeChange() {}, navigation: { goBack() {}, navigate() {} }, route: {} };
  const view = mount('../src/screens/HomeScreen.tsx', props);
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === `Xem ${fixture.nodes[1].name}`).props.onPress();
  assert.equal(selected, 'demo-02');
  assert.ok(elements(tree, 'Text').some((item) => [].concat(item.props.children).join('') === 'Đã mở 0/6 câu chuyện · Demo'));
  const renamed = nodes.map((node) => ({ ...node, id: 'live-' + node.id }));
  tree = view.render({ ...props, currentNodeId: 'live-demo-03', source: { ...props.source, dataset: { ...fixture, nodes: renamed } } });
  const pins = elements(tree, 'Pressable').filter((item) => item.props.accessibilityLabel?.startsWith('Xem '));
  assert.equal(pins.length, 6, 'Live ids do not depend on hardcoded demo ids');
  pins.find((item) => item.props.accessibilityLabel === `Xem ${fixture.nodes[1].name}`).props.onPress();
  assert.equal(selected, 'live-demo-02');
  tree = view.render({ ...props, mode: 'live', source: sources.liveEmpty('no-config'), onRetryLive() {} });
  assert.equal(elements(tree, 'Path').length, 0);
  const empty = elements(tree, 'UnavailableScreen')[0].props;
  assert.equal(typeof empty.onBack, 'function');
  assert.equal(typeof empty.onSwitchToDemo, 'function');
  assert.equal(typeof empty.onRetry, 'function');
});

test('leaving Camera closes it and ignores permission results from the old screen', async () => {
  let focused = true;
  let grant;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/CameraScreen.tsx', props, {
    '@react-navigation/native': { useIsFocused: () => focused },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [null, () => new Promise((resolve) => { grant = resolve; })] },
  });
  let tree = view.render();
  const button = () => elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bật camera và quét QR');
  button().props.onPress();
  focused = false;
  tree = view.render();
  grant({ granted: true });
  await setImmediate();
  focused = true;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0, 'a late grant cannot reopen Camera');
  button().props.onPress();
  grant({ granted: true });
  await setImmediate();
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 1);
  focused = false;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0);
});


test('Prologue replaces itself once and never fades the whole screen to zero', () => {
  const calls = [];
  const view = mount('../src/screens/PrologueScreen.tsx', { navigation: { replace: (name) => calls.push(name) } });
  const tree = view.render();
  const start = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  start.props.onPress();
  start.props.onPress();
  assert.deepEqual(calls, ['Landing']);
  assert.equal(elements(tree, 'ImageBackground').length, 1);
});

test('real stack stays bounded across notebook selections and Back returns Home', () => {
  const options = { routeNames: ['Prologue', 'Landing', 'Home', 'Qa', 'Plan'], routeParamList: {}, routeGetIdList: {} };
  const router = StackRouter({ initialRouteName: 'Landing' });
  let state = router.getInitialState(options);
  const dispatch = (action) => { state = router.getStateForAction(state, action, options); assert.ok(state); };
  const navigation = {
    navigate: (name, params) => dispatch(CommonActions.navigate(name, params)),
    replace: (name) => dispatch(StackActions.replace(name)),
    popTo: (name) => dispatch(StackActions.popTo(name)),
  };
  dispatch(CommonActions.navigate('Home'));
  dispatch(CommonActions.navigate('Qa'));
  const app = mount('../App.tsx');
  for (let i = 0; i < 5; i++) {
    let tree = app.render();
    screen(tree, 'Qa', navigation).onOpenNotebook();
    assert.equal(state.routes.at(-1).params.fromQa, true);
    screen(tree, 'Plan', navigation, state.routes.at(-1).params).onSelectNode('demo-05');
    assert.deepEqual(state.routes.map((r) => r.name), ['Landing', 'Home', 'Qa']);
  }
  dispatch(StackActions.pop());
  assert.equal(state.routes.at(-1).name, 'Home');
  dispatch(CommonActions.navigate('Plan'));
  screen(app.render(), 'Plan', navigation).onSelectNode('demo-03');
  assert.deepEqual(state.routes.map((r) => r.name), ['Landing', 'Home', 'Qa']);
});

test('Q&A Previous/Next skip closed neighbours and correctly disable at boundaries', () => {
  const dataset = { ...fixture, nodes: fixture.nodes.map((node, i) => ({ ...node, available: i === 0 || i === 2 })) };
  let selected = 'demo-01';
  const props = () => ({ dataset, currentNodeId: selected, onSelectNode: (id) => { selected = id; }, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {} });
  const view = mount('../src/screens/QaScreen.tsx', props());
  const button = (tree, label) => elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === label);
  let tree = view.render();
  assert.equal(button(tree, 'Điểm trước đó').props.disabled, true);
  button(tree, 'Điểm tiếp theo').props.onPress();
  assert.equal(selected, 'demo-03');
  tree = view.render(props());
  assert.equal(button(tree, 'Điểm tiếp theo').props.disabled, true);
  button(tree, 'Điểm trước đó').props.onPress();
  assert.equal(selected, 'demo-01');
});

test('ready Live passes its mode to Q&A/Plan and Home does not label it Demo', async () => {
  const app = mount('../App.tsx', {}, { './src/data/live': { readLiveConfig() {}, loadLiveSource: async () => ({ status: 'ready', mode: 'live', dataset: fixture }), loadLiveSourceV2: async () => ({ status: 'ready', mode: 'live', dataset: fixture }) } });
  screen(app.render(), 'Home').onModeChange('live');
  app.render();
  await setImmediate();
  const tree = app.render();
  assert.equal(screen(tree, 'Qa').mode, 'live');
  assert.equal(screen(tree, 'Plan').mode, 'live');
  const home = mount('../src/screens/HomeScreen.tsx', { ...screen(tree, 'Home'), navigation: { goBack() {}, navigate() {} }, route: {} });
  assert.ok(elements(home.render(), 'Text').some((item) => [].concat(item.props.children).join('') === 'Đã mở 0/6 câu chuyện · Live'));
});

test('Home switches to a wrapping scrollable trail at large font scale', () => {
  const selected = [];
  const view = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    onModeChange() {},
    currentNodeId: 'demo-01',
    onSelectNode: (id) => selected.push(id),
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: {} },
  }, { __windowDimensions: { width: 400, height: 850, fontScale: 2 } });

  const tree = view.render();
  const trail = elements(tree, 'AlleyTrailView')[0];
  assert.ok(trail, 'large text uses the vertical trail instead of positioned map labels');
  assert.equal(elements(tree, 'Svg').length, 0);
  assert.equal(trail.props.nodes.length, 6);
  trail.props.onSelectNode('demo-02');
  assert.deepEqual(selected, ['demo-02']);
  assert.ok(elements(tree, 'Pressable').some((item) => item.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn'));
});

test('motion loops stop/reset when hidden and reduced motion keeps entrances visible', () => {
  let active = true;
  let started = 0;
  let stopped = 0;
  class Value {
    constructor(value) { this.val = value; }
    setValue(value) { this.val = value; }
    interpolate() { return this; }
  }
  const view = mount('../src/hooks/useMotion.ts', { active: true }, {
    './MotionPreferences': { useMotionState: () => ({ active }) },
    'react-native': { Animated: { Value, timing: () => ({}), sequence: () => ({}),
      loop: () => ({ start: () => started++, stop: () => stopped++ }) } },
  }, 'usePulseLoop');
  view.render();
  assert.equal(started, 1);
  active = false;
  const result = view.render();
  assert.equal(stopped, 1);
  assert.equal(result.scaleAnim.val, 0);
  view.unmount();
  const entrance = mount('../src/hooks/useMotion.ts', {}, { './MotionPreferences': { useMotionState: () => ({ active: false }) } }, 'useEntranceFadeSlide');
  assert.equal(entrance.render().opacity.val, 1);
});

test('OS motion preference handles late reads and removes both listeners', async () => {
  let resolve;
  let preference;
  let appState;
  let removed = 0;
  const view = mount('../src/hooks/MotionPreferences.tsx', {}, {
    'react-native': {
      AppState: { currentState: 'active', addEventListener: (_, cb) => { appState = cb; return { remove: () => removed++ }; } },
      AccessibilityInfo: { isReduceMotionEnabled: () => new Promise((r) => { resolve = r; }),
        addEventListener: (_, cb) => { preference = cb; return { remove: () => removed++ }; } },
    },
  }, 'useMotionPreferences');
  assert.equal(view.render().reducedMotion, true);
  preference(true);
  resolve(false);
  await setImmediate();
  assert.equal(view.render().reducedMotion, true, 'late initial query cannot overwrite a newer OS change');
  appState('background');
  assert.equal(view.render().foreground, false);
  preference(false);
  appState('active');
  assert.deepEqual(JSON.parse(JSON.stringify(view.render())), { reducedMotion: false, foreground: true });
  view.unmount();
  assert.equal(removed, 2);
});

test('drawer remains mounted for exit and stale interrupted exits cannot hide a reopened drawer', () => {
  const animations = [];
  const frames = [];
  let focused = 0;
  class Value {
    constructor(value) { this.val = value; }
    stopAnimation() {}
    interpolate() { return this; }
  }
  const props = { visible: true, value: '', onChangeText() {}, onSubmit() {}, onClose() {} };
  const view = mount('../src/components/ExpandableInputDrawer.tsx', props, {
    __globals: { requestAnimationFrame: (cb) => frames.push(cb) },
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: true }) },
    'react-native': new Proxy({
      StyleSheet: { create: (s) => s }, Platform: { OS: 'android' }, Keyboard: { dismiss() {} },
      useWindowDimensions: () => ({ height: 850 }),
      Animated: { View: 'Animated.View', Value, timing: () => {
        const item = { start(cb) { this.cb = cb; }, stop() { this.cb?.({ finished: false }); } };
        animations.push(item); return item;
      } },
    }, { get: (o, k) => o[k] ?? k }),
  });
  let opened = view.render();
  assert.equal(elements(opened, 'KeyboardAvoidingView')[0].props.behavior, 'height');
  elements(opened, 'TextInput')[0].props.ref.current = { focus: () => focused++ };
  elements(opened, 'Modal')[0].props.onShow();
  frames.shift()();
  assert.equal(focused, 1, 'focus follows native modal presentation');
  elements(opened, 'Modal')[0].props.onShow();
  let tree = view.render({ ...props, visible: false });
  frames.shift()();
  assert.equal(focused, 1, 'closing cancels a queued keyboard focus');
  const closing = animations.at(-1);
  assert.equal(elements(tree, 'Modal').length, 1, 'exit has time to run');
  view.render(props);
  closing.cb({ finished: true });
  assert.equal(elements(view.render(), 'Modal').length, 1, 'old close cannot unmount the reopened drawer');
  view.render({ ...props, visible: false });
  animations.at(-1).cb({ finished: true });
  assert.equal(elements(view.render(), 'Modal').length, 0);
  view.unmount();
});

test('photo retains previous image until load and ignores stale image callbacks', () => {
  const view = mount('../src/components/CrossfadePhoto.tsx', { source: 1 });
  view.render();
  let tree = view.render({ source: 2 });
  const oldLoad = elements(tree, 'Animated.Image')[0].props.onLoad;
  assert.equal(elements(tree, 'Image')[0].props.source, 1);
  tree = view.render({ source: 3 });
  oldLoad();
  assert.equal(elements(view.render(), 'Image')[0].props.source, 1);
  elements(tree, 'Animated.Image')[0].props.onLoad();
  assert.equal(elements(view.render(), 'Image')[0].props.source, 3);
});


test('GPS permission arriving after Back is ignored before reading coordinates', async () => {
  let focused = true;
  let grant;
  let positionReads = 0;
  const view = mount('../src/screens/LocationScreen.tsx', { nodes: fixture.nodes, onConfirmNode() {} }, {
    '@react-navigation/native': { useIsFocused: () => focused },
    '../location/nearest': { pickCandidate() { throw new Error('must not run'); } },
    'expo-location': { requestForegroundPermissionsAsync: () => new Promise((r) => { grant = r; }),
      getCurrentPositionAsync: () => { positionReads++; }, Accuracy: { Balanced: 1 } },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Lấy vị trí của tôi').props.onPress();
  focused = false;
  view.render();
  grant({ granted: true });
  await setImmediate();
  assert.equal(positionReads, 0);
  view.unmount();
});

test('cancelled GPS result cannot replace a manual confirmation', async () => {
  let position;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/LocationScreen.tsx', props, {
    '../location/nearest': { pickCandidate: () => ({ kind: 'candidate', node: fixture.nodes[0], distanceMeters: 10, accuracy: 10 }) },
    'expo-location': { requestForegroundPermissionsAsync: async () => ({ granted: true }),
      getCurrentPositionAsync: () => new Promise((r) => { position = r; }), Accuracy: { Balanced: 1 } },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Lấy vị trí của tôi').props.onPress();
  await setImmediate();
  tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Dừng chờ GPS').props.onPress();
  tree = view.render();
  const manual = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel?.includes(fixture.nodes[1].name));
  assert.ok(manual);
  manual.props.onPress();
  position({ coords: { latitude: 0, longitude: 0, accuracy: 10 } });
  await setImmediate();
  tree = view.render();
  assert.deepEqual(confirmed, ['demo-02']);
  assert.equal(elements(tree, 'Text').some((item) => item.props.children === 'GỢI Ý TỪ GPS'), false);
});

test('Camera latches the first QR callback and closes when app backgrounds', async () => {
  let foreground = true;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/CameraScreen.tsx', props, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bật camera và quét QR').props.onPress();
  await setImmediate();
  tree = view.render();
  const scan = elements(tree, 'CameraView')[0].props.onBarcodeScanned;
  scan({ data: 'ngo-ke://node/demo-01' });
  scan({ data: 'ngo-ke://node/demo-02' });
  tree = view.render();
  assert.equal(elements(tree, 'CameraView')[0].props.onBarcodeScanned, undefined);
  elements(tree, 'Pressable').find((item) => JSON.stringify(item.props.children).includes('Xác nhận điểm này')).props.onPress();
  view.render();
  assert.deepEqual(confirmed, ['demo-01']);
  foreground = false;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0);
});

test('late persisted locale read does not override manual user choice in App', async () => {
  let resolvePersisted;
  const storagePromise = new Promise((resolve) => {
    resolvePersisted = resolve;
  });
  const app = mount('../App.tsx', {}, {
    './src/data/localeStorage': {
      readPersistedLocaleAsync: () => storagePromise,
      writePersistedLocaleAsync: async () => {},
      resolveEffectiveLocale: () => 'vi',
    },
  });
  let tree = app.render();
  const getLocaleContext = () => elements(tree, 'LocaleProvider')[0].props.value;
  assert.equal(getLocaleContext().locale, 'vi');
  assert.equal(getLocaleContext().isReady, false);

  // User manually switches locale to 'en' before storage resolves
  getLocaleContext().setLocale('en');
  tree = app.render();
  assert.equal(getLocaleContext().locale, 'en');

  // Now storage resolves late with 'vi'
  resolvePersisted('vi');
  await setImmediate();
  tree = app.render();

  assert.equal(getLocaleContext().isReady, true);
  assert.equal(getLocaleContext().locale, 'en', 'Manual choice is preserved; late storage read does not overwrite it');
  app.unmount();
});

test('logical node preserved across locale change vs reset on collection change in App', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  const getLocaleContext = () => elements(tree, 'LocaleProvider')[0].props.value;

  // Select node demo-02 in Home
  screen(tree, 'Home').onSelectNode('demo-02');
  tree = app.render();
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-02');

  // Change locale to 'en'
  getLocaleContext().setLocale('en');
  tree = app.render();
  assert.equal(getLocaleContext().locale, 'en');
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-02', 'Node preserved on locale change');

  // Change collection to 'old-quarter-pilot'
  getLocaleContext().setCollectionId('old-quarter-pilot');
  tree = app.render();
  assert.equal(getLocaleContext().collectionId, 'old-quarter-pilot');
  assert.equal(screen(tree, 'Home').currentNodeId, undefined, 'Node reset on collection change');
  app.unmount();
});

test('AlleySelectScreen selects actual collection and calls setCollectionId before navigation', () => {
  let selectedCollection;
  const navigated = [];
  const navigation = {
    navigate: (route, params) => navigated.push({ route, params }),
    goBack: () => {},
  };
  const view = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'demo',
    nodeCount: 6,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
        setCollectionId: (id) => { selectedCollection = id; },
      }),
    },
    '../data/collections': {
      isCollectionId: (v) => v === 'fiction-letter' || v === 'old-quarter-pilot',
      getLocalizedCollections: () => [
        { id: 'fiction-letter', name: 'Lá thư Hà Nội', district: 'Hàng Buồm', theme: 'Chuyện xưa', tagline: '', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
        { id: 'old-quarter-pilot', name: 'Ngõ Phất Lộc', district: 'Hàng Buồm', theme: 'Ẩm thực', tagline: '', nodeCount: 3, coverPhoto: 1, kind: 'reviewed' },
      ],
    },
  });
  const tree = view.render();
  const cards = elements(tree, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Mở'));
  assert.equal(cards.length, 2);

  // Tap second card: old-quarter-pilot
  cards[1].props.onPress();
  assert.equal(selectedCollection, 'old-quarter-pilot');
  assert.deepEqual(JSON.parse(JSON.stringify(navigated)), [{ route: 'Home', params: { alleyId: 'old-quarter-pilot' } }]);
  view.unmount();
});

test('QaScreen passes locale and collectionId to useVoiceSession and resolves localized catalog tracks', () => {
  let sessionConfig;
  const catalogLookups = [];
  const view = mount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: {
      ...fixture,
      collectionId: 'old-quarter-pilot',
      nodes: fixture.nodes,
      intro: fixture.intro,
    },
    datasetRevision: 'pilot-rev-en',
    currentNodeId: 'demo-01',
    readNodeIds: new Set(),
    onSelectNode() {},
    onReadNode() {},
    onOpenNotebook() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        collectionId: 'old-quarter-pilot',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: (config) => {
        sessionConfig = config;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
        };
      },
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack: (params) => {
        catalogLookups.push(params);
        return { durationSeconds: 42, url: 'file://pilot-en.mp3' };
      },
    },
  });
  view.render();
  assert.ok(sessionConfig);
  assert.equal(sessionConfig.locale, 'en');
  assert.equal(sessionConfig.collectionId, 'old-quarter-pilot');

  // Verify lookupVoiceTrack was called with locale and collectionId
  assert.ok(catalogLookups.length > 0);
  assert.equal(catalogLookups[0].locale, 'en');
  assert.equal(catalogLookups[0].collectionId, 'old-quarter-pilot');
  assert.equal(catalogLookups[0].contentId, 'demo-01-story');
  assert.equal(catalogLookups[0].datasetRevision, 'pilot-rev-en');
  view.unmount();
});

test('AlleySelectScreen in live mode shows only actual server collection with actual node count and explicit loading/error states without bundle picker', () => {
  let selectedCollection = null;
  let retried = false;
  const navigation = {
    navigate: (_route, params) => {
      selectedCollection = params?.alleyId ?? null;
    },
    goBack: () => {},
  };

  // 1. Ready live source with known collection
  const viewReady = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'live',
    nodeCount: 3,
    liveSource: {
      mode: 'live',
      status: 'ready',
      dataset: {
        schemaVersion: 2,
        locale: 'vi',
        collectionId: 'old-quarter-pilot',
        kind: 'reviewed',
        nodes: fixture.nodes.slice(0, 3),
        qa: [],
      },
    },
    liveBusy: false,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
        setCollectionId: (id) => { selectedCollection = id; },
      }),
    },
    '../data/collections': {
      isCollectionId: (v) => v === 'fiction-letter' || v === 'old-quarter-pilot',
      AVAILABLE_COLLECTIONS: [
        { id: 'fiction-letter', nameKey: 'collection.fiction_letter.name', districtKey: 'collection.fiction_letter.district', themeKey: 'collection.fiction_letter.theme', taglineKey: 'collection.fiction_letter.tagline', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
        { id: 'old-quarter-pilot', nameKey: 'collection.old_quarter_pilot.name', districtKey: 'collection.old_quarter_pilot.district', themeKey: 'collection.old_quarter_pilot.theme', taglineKey: 'collection.old_quarter_pilot.tagline', nodeCount: 3, coverPhoto: 1, kind: 'reviewed' },
      ],
      getLocalizedCollections: () => [],
    },
  });
  const treeReady = viewReady.render();
  const readyCards = elements(treeReady, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Mở'));
  assert.equal(readyCards.length, 1, 'in live mode only one actual server collection is shown, never bundle picker');
  readyCards[0].props.onPress();
  assert.equal(selectedCollection, 'old-quarter-pilot');
  assert.ok(JSON.stringify(treeReady).includes('Nguồn máy chủ Live · 3 điểm'));
  assert.ok(JSON.stringify(treeReady).includes('Phố Cổ, Hoàn Kiếm · Nguồn máy chủ Live'));
  assert.equal(JSON.stringify(treeReady).includes('Phố Hàng Bút'), false, 'bundled fiction collection is not shown in live');
  assert.equal(JSON.stringify(treeReady).includes('Lá thư Hà Nội'), false);
  viewReady.unmount();

  // 2. Ready live source with arbitrary collection
  const viewArbitrary = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'live',
    nodeCount: 4,
    liveSource: {
      mode: 'live',
      status: 'ready',
      dataset: {
        schemaVersion: 2,
        locale: 'en',
        collectionId: 'custom-heritage-quarter',
        kind: 'reviewed',
        nodes: fixture.nodes.slice(0, 4),
        qa: [],
      },
    },
    liveBusy: false,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
        setCollectionId: (id) => { selectedCollection = id; },
      }),
    },
  });
  const treeArbitrary = viewArbitrary.render();
  const arbitraryCards = elements(treeArbitrary, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Open'));
  assert.equal(arbitraryCards.length, 1);
  assert.ok(JSON.stringify(treeArbitrary).includes('Live backend source · 4 stops'));
  assert.ok(JSON.stringify(treeArbitrary).includes('custom-heritage-quarter'));
  assert.equal(JSON.stringify(treeArbitrary).includes('Hanoi Old Quarter · simulated content'), false);
  viewArbitrary.unmount();

  // 3. Busy loading live state
  const viewLoading = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'live',
    nodeCount: 0,
    liveSource: { mode: 'live', status: 'empty' },
    liveBusy: true,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
        setCollectionId: () => {},
      }),
    },
  });
  const treeLoading = viewLoading.render();
  assert.ok(JSON.stringify(treeLoading).includes('Đang kết nối máy chủ Live...'));
  assert.equal(elements(treeLoading, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Mở')).length, 0);
  viewLoading.unmount();

  // 4. Live error state with working retry
  const viewError = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'live',
    nodeCount: 0,
    liveSource: { mode: 'live', status: 'error', title: 'Máy chủ live trả lỗi', detail: 'HTTP 503 Service Unavailable' },
    liveBusy: false,
    onRetryLive: () => { retried = true; },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
        setCollectionId: () => {},
      }),
    },
  });
  const treeError = viewError.render();
  assert.ok(JSON.stringify(treeError).includes('Máy chủ live trả lỗi'));
  assert.ok(JSON.stringify(treeError).includes('HTTP 503 Service Unavailable'));
  const retryBtn = elements(treeError, 'Pressable').find((p) => p.props.accessibilityLabel === 'Thử lại');
  assert.ok(retryBtn);
  retryBtn.props.onPress();
  assert.equal(retried, true);
  viewError.unmount();
});

test('QaScreen in live mode mounts audio controls for known live tracks and shows explicit localized fallback for missing tracks', async () => {
  let liveTranscript;
  const played = [];
  const propsKnown = {
    dataset: {
      ...fixture,
      collectionId: 'old-quarter-pilot',
      nodes: fixture.nodes,
      intro: fixture.intro,
      qa: fixture.qa,
    },
    mode: 'live',
    datasetRevision: 'live-rev-pilot',
    currentNodeId: 'demo-01',
    onSelectNode() {},
    onReadNode() {},
    readNodeIds: new Set(),
    onOpenNotebook() {},
  };

  // 1. Known live track: audio controls are mounted and playable
  const viewKnown = mount('../src/screens/QaScreen.tsx', propsKnown, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-pilot',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: (options) => {
        liveTranscript = options.onTranscript;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 45 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
          playTrack(...args) { played.push(args); }, replayTrack() {},
        };
      },
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack: ({ contentId }) => {
        if (contentId === 'demo-01-story') {
          return { id: 'demo-01-story', kind: 'story', durationSeconds: 45, url: 'file://pilot-story.mp3' };
        }
        if (contentId === 'qa-01-answer') {
          return { id: 'qa-01-answer', kind: 'answer', durationSeconds: 22, url: 'file://pilot-answer.mp3' };
        }
        return undefined;
      },
    },
  });

  const treeKnown = viewKnown.render();
  const playerBars = elements(treeKnown, 'VoicePlayerBar');
  assert.equal(playerBars.length, 1, 'VoicePlayerBar is mounted for known live story track');
  assert.equal(JSON.stringify(treeKnown).includes('Lời kể Live chưa có bản đọc'), false, 'live_no_audio notice is hidden when storyTrack exists');

  // Play known story
  playerBars[0].props.onPlay();
  assert.equal(played.length, 1);
  assert.equal(played[0][0], 'demo-01-story');

  // Ask question via voice -> plays known answer track in Live
  const context = { turnId: 'turn-1', scope: 'live:live-rev-pilot:demo-01', nodeId: 'demo-01', mode: 'live', datasetRevision: 'live-rev-pilot' };
  liveTranscript(fixture.qa[0].question, context);
  await Promise.resolve();
  assert.equal(played.length, 2);
  assert.equal(played[1][0], 'qa-01-answer');
  const treeAfterAnswer = viewKnown.render();
  assert.equal(elements(treeAfterAnswer, 'VoicePlayerBar').length, 2, 'VoicePlayerBar rendered for both live story and live answer');
  viewKnown.unmount();

  // 2. Missing live track: explicit localized fallbacks and no player
  const playedMissing = [];
  let missingTranscript;
  const viewMissing = mount('../src/screens/QaScreen.tsx', {
    ...propsKnown,
    dataset: { ...fixture, collectionId: 'unknown-collection' },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'unknown-collection',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: (options) => {
        missingTranscript = options.onTranscript;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
          playTrack(...args) { playedMissing.push(args); }, replayTrack() {},
        };
      },
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack: () => undefined,
    },
  });

  const treeMissing = viewMissing.render();
  assert.equal(elements(treeMissing, 'AudioCard').length, 0, 'No AudioCard when live track is missing');
  assert.ok(JSON.stringify(treeMissing).includes('Lời kể Live chưa có bản đọc'), 'explicit localized notice shown');

  // Asking question in missing live track
  missingTranscript(fixture.qa[0].question, { turnId: 'turn-2', scope: 'live:live-rev-pilot:demo-01', nodeId: 'demo-01', mode: 'live', datasetRevision: 'live-rev-pilot' });
  const treeMissingAnswer = viewMissing.render();
  assert.equal(playedMissing.length, 0, 'no audio played for missing live answer');
  assert.ok(JSON.stringify(treeMissingAnswer).includes('Bản đọc chưa có trong chế độ Live'), 'explicit fallback notice for answer');
  assert.equal(elements(treeMissingAnswer, 'VoicePlayerBar').length, 0, 'no VoicePlayerBar for missing live answer');

  // Command listen on missing track
  missingTranscript('Bắt đầu nghe lời kể.', { turnId: 'turn-3', scope: 'live:live-rev-pilot:demo-01', nodeId: 'demo-01', mode: 'live', datasetRevision: 'live-rev-pilot' });
  const treeMissingListen = viewMissing.render();
  assert.equal(playedMissing.length, 0);
  assert.ok(JSON.stringify(treeMissingListen).includes('Lời kể Live chưa có bản đọc'));

  viewMissing.unmount();
});

test('HomeScreen reflects selected collection localized title instead of legacy alley fallback', () => {
  // 1. VI old-quarter-pilot
  const viewPilotVi = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: sources.getSourceState('demo', { ...fixture, collectionId: 'old-quarter-pilot' }),
    onModeChange() {},
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale() {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treePilotVi = viewPilotVi.render();
  const textPilotVi = JSON.stringify(treePilotVi);
  assert.ok(textPilotVi.includes('Thử nghiệm Phố Cổ'), 'pilot collection title is displayed');
  assert.equal(textPilotVi.includes('Ngõ Tạm Thương'), false, 'does not fall back to legacy ALLEY_LIST[0]');
  viewPilotVi.unmount();

  // 2. EN old-quarter-pilot
  const viewPilotEn = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: sources.getSourceState('demo', { ...fixture, collectionId: 'old-quarter-pilot' }),
    onModeChange() {},
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale() {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treePilotEn = viewPilotEn.render();
  const textPilotEn = JSON.stringify(treePilotEn);
  assert.ok(textPilotEn.includes('Old Quarter Pilot'), 'EN pilot collection title is displayed');
  assert.equal(textPilotEn.includes('Ngõ Tạm Thương'), false);
  viewPilotEn.unmount();

  // 3. VI fiction-letter
  const viewFictionVi = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: sources.getSourceState('demo', { ...fixture, collectionId: 'fiction-letter' }),
    onModeChange() {},
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'fiction-letter' } },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale() {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeFictionVi = viewFictionVi.render();
  const textFictionVi = JSON.stringify(treeFictionVi);
  assert.ok(textFictionVi.includes('Thư Hà Nội — Ngõ Kể chuyện'), 'fiction-letter collection title is displayed');
  assert.equal(textFictionVi.includes('Ngõ Tạm Thương'), false);
  viewFictionVi.unmount();

  // 4. Stale demo route param with Live source: active collection derives from source.dataset
  const viewStaleRouteLive = mount('../src/screens/HomeScreen.tsx', {
    mode: 'live',
    source: {
      mode: 'live',
      status: 'ready',
      dataset: { ...fixture, collectionId: 'old-quarter-pilot' },
    },
    onModeChange() {},
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'fiction-letter' } }, // Stale demo route
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale() {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textStaleLive = JSON.stringify(viewStaleRouteLive.render());
  assert.ok(textStaleLive.includes('Thử nghiệm Phố Cổ'), 'Live header uses actual server collection name');
  assert.equal(textStaleLive.includes('Thư Hà Nội'), false, 'Live does not use stale fiction route title');
  viewStaleRouteLive.unmount();
});

test('QaScreen and CameraScreen branch semantic content labels on reviewed-pilot versus simulated fiction (W4 F5 regression)', () => {
  // 1. Fiction simulated collection in Demo mode
  const fictionQaProps = {
    currentNode: fixture.nodes[0],
    nodeQa: fixture.qa.slice(0, 2),
    dataset: { ...fixture, collectionId: 'fiction-letter', kind: 'simulated' },
    collectionId: 'fiction-letter',
    datasetRevision: 'rev-fiction',
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode() {},
    onAskQuestion() {},
    onModeChange() {},
    match: { status: 'matched', entry: fixture.qa[0] },
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  };
  const viewFictionQa = mount('../src/screens/QaScreen.tsx', fictionQaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'fiction-letter',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  let treeFictionQa = viewFictionQa.render();
  elements(treeFictionQa, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Đây là điểm nào?');
  treeFictionQa = viewFictionQa.render(fictionQaProps);
  const textFictionQa = JSON.stringify(treeFictionQa);
  assert.ok(textFictionQa.includes('Truyện hư cấu'), 'fiction collection shows fictional story disclaimer');
  assert.ok(textFictionQa.includes('TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ'), 'waveform note shows fiction label');
  assert.ok(textFictionQa.includes('LỜI KỂ TRONG TRUYỆN'), 'verified tag shows story passage');
  viewFictionQa.unmount();

  const viewFictionCamera = mount('../src/screens/CameraScreen.tsx', {
    nodes: fixture.nodes,
    onConfirmNode() {},
    collectionKind: 'simulated',
    collectionId: 'fiction-letter',
  }, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textFictionCamera = JSON.stringify(viewFictionCamera.render());
  assert.ok(textFictionCamera.includes('nội dung mô phỏng'), 'camera footer shows simulated disclaimer');
  viewFictionCamera.unmount();

  // 2. Minimal actual reviewed-pilot collection in Demo mode (reviewed heritage stays sourced)
  const actualReviewedPilot = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
  const pilotQaProps = {
    currentNode: actualReviewedPilot.nodes[0],
    nodeQa: actualReviewedPilot.qa.filter((q) => q.nodeId === actualReviewedPilot.nodes[0].id),
    dataset: actualReviewedPilot,
    collectionId: actualReviewedPilot.collectionId,
    datasetRevision: 'rev-pilot',
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode() {},
    onAskQuestion() {},
    onModeChange() {},
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  };
  const viewPilotQa = mount('../src/screens/QaScreen.tsx', pilotQaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-pilot',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  let treePilotQa = viewPilotQa.render();
  elements(treePilotQa, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Vì sao đền có tên Bạch Mã?');
  treePilotQa = viewPilotQa.render(pilotQaProps);
  const textPilotQa = JSON.stringify(treePilotQa);
  assert.ok(textPilotQa.includes('điểm đã duyệt · nguồn Demo'), 'reviewed pilot shows reviewed demo disclaimer');
  assert.ok(textPilotQa.includes('DEMO · DI SẢN ĐÃ DUYỆT'), 'waveform note shows reviewed heritage');
  assert.ok(textPilotQa.includes('NỘI DUNG CÓ NGUỒN'), 'verified tag shows sourced content');
  assert.equal(textPilotQa.includes('TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ'), false, 'must not label reviewed heritage as fictional story');
  assert.equal(textPilotQa.includes('Truyện hư cấu'), false, 'must not label reviewed heritage as fiction');
  assert.equal(textPilotQa.includes('LIVE · DI SẢN ĐÃ DUYỆT'), false, 'demo transport must not show LIVE');
  viewPilotQa.unmount();

  const viewPilotCamera = mount('../src/screens/CameraScreen.tsx', {
    nodes: actualReviewedPilot.nodes,
    onConfirmNode() {},
    collectionKind: 'reviewed',
    collectionId: 'old-quarter-pilot',
  }, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textPilotCamera = JSON.stringify(viewPilotCamera.render());
  assert.ok(textPilotCamera.includes('dữ liệu di sản đã duyệt'), 'reviewed camera footer shows reviewed heritage notice');
  assert.equal(textPilotCamera.includes('nội dung mô phỏng'), false, 'reviewed camera footer must not say simulated');
  viewPilotCamera.unmount();

  // 3. Simulated copy with SAME IDs (must stay simulated despite old-quarter-pilot ID or oldquarter-/pilot- prefixes)
  const simulatedPilotDataset = {
    ...actualReviewedPilot,
    kind: 'simulated',
  };
  const simPilotQaProps = {
    currentNode: simulatedPilotDataset.nodes[0],
    nodeQa: simulatedPilotDataset.qa.filter((q) => q.nodeId === simulatedPilotDataset.nodes[0].id),
    dataset: simulatedPilotDataset,
    collectionId: simulatedPilotDataset.collectionId,
    datasetRevision: 'rev-sim-pilot',
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode() {},
    onAskQuestion() {},
    onModeChange() {},
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  };
  const viewSimPilotQa = mount('../src/screens/QaScreen.tsx', simPilotQaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-pilot',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  let treeSimPilotQa = viewSimPilotQa.render();
  elements(treeSimPilotQa, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Vì sao đền có tên Bạch Mã?');
  treeSimPilotQa = viewSimPilotQa.render(simPilotQaProps);
  const textSimPilotQa = JSON.stringify(treeSimPilotQa);
  assert.ok(textSimPilotQa.includes('Truyện hư cấu'), 'simulated copy with old-quarter-pilot ID must show fictional disclaimer');
  assert.ok(textSimPilotQa.includes('TRUYỆN HƯ CẤU · NGHE NGƯỜI KỂ'), 'simulated copy must show fiction waveform note');
  assert.ok(textSimPilotQa.includes('LỜI KỂ TRONG TRUYỆN'), 'simulated copy must show story passage tag');
  assert.equal(textSimPilotQa.includes('DEMO · DI SẢN ĐÃ DUYỆT'), false, 'simulated copy must not show reviewed heritage');
  assert.equal(textSimPilotQa.includes('NỘI DUNG CÓ NGUỒN'), false, 'simulated copy must not show sourced content');
  assert.equal(textSimPilotQa.includes('điểm đã duyệt · nguồn Demo'), false, 'simulated copy must not show reviewed demo disclaimer');
  viewSimPilotQa.unmount();

  const viewSimPilotCamera = mount('../src/screens/CameraScreen.tsx', {
    nodes: simulatedPilotDataset.nodes,
    onConfirmNode() {},
    collectionKind: 'simulated',
    collectionId: 'old-quarter-pilot',
  }, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textSimPilotCamera = JSON.stringify(viewSimPilotCamera.render());
  assert.ok(textSimPilotCamera.includes('nội dung mô phỏng'), 'camera with collectionKind simulated must show simulated notice');
  assert.equal(textSimPilotCamera.includes('dữ liệu di sản đã duyệt'), false, 'camera with collectionKind simulated must not say reviewed');
  viewSimPilotCamera.unmount();

  // 4. CameraScreen with absent collectionKind defaults to simulated
  const viewAbsentKindCamera = mount('../src/screens/CameraScreen.tsx', {
    nodes: actualReviewedPilot.nodes,
    onConfirmNode() {},
    collectionId: 'old-quarter-pilot',
  }, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textAbsentKindCamera = JSON.stringify(viewAbsentKindCamera.render());
  assert.ok(textAbsentKindCamera.includes('nội dung mô phỏng'), 'camera with absent collectionKind defaults to simulated');
  assert.equal(textAbsentKindCamera.includes('dữ liệu di sản đã duyệt'), false, 'camera with absent collectionKind must not say reviewed');
  viewAbsentKindCamera.unmount();

  // 5. User-facing transport DEMO vs LIVE stays separate
  const livePilotQaProps = {
    ...pilotQaProps,
    mode: 'live',
  };
  const viewLivePilotQa = mount('../src/screens/QaScreen.tsx', livePilotQaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-pilot',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const textLivePilotQa = JSON.stringify(viewLivePilotQa.render());
  assert.ok(textLivePilotQa.includes('LIVE · DI SẢN ĐÃ DUYỆT'), 'live reviewed shows LIVE transport');
  assert.ok(textLivePilotQa.includes('điểm đã duyệt · nguồn Live'), 'live reviewed disclaimer shows Live transport');
  assert.equal(textLivePilotQa.includes('DEMO · DI SẢN ĐÃ DUYỆT'), false, 'live transport must not show DEMO');
  viewLivePilotQa.unmount();
});
