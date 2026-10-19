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
import * as threeLensesModule from '../src/data/threeLensesCompanion.ts';

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
  const defaultAudioPlayer = overrides.__audioPlayer ?? {
    play() {},
    pause() {},
    seekTo: async () => {},
    volume: 1,
  };
  const rnDefaults = {
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
        stopAnimation(cb) {
          this.animation?.stop();
          cb?.(this.val);
          overrides.__onStopAnimation?.();
        }
      },
      timing(value, config) {
        if (overrides.__animatedTiming) return overrides.__animatedTiming(value, config);
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
    Easing: overrides.__easing ?? {
      out: (fn) => fn,
      in: (fn) => fn,
      inOut: (fn) => fn,
      cubic: (t) => t,
      quad: (t) => t,
      linear: (t) => t,
    },
  };
  const rnOverrides = overrides['react-native'] ?? {};
  const rnMerged = {
    ...rnDefaults,
    ...rnOverrides,
    StyleSheet: {
      ...rnDefaults.StyleSheet,
      ...(rnOverrides.StyleSheet ?? {}),
    },
    Animated: {
      ...rnDefaults.Animated,
      ...(rnOverrides.Animated ?? {}),
    },
    Easing: {
      ...rnDefaults.Easing,
      ...(rnOverrides.Easing ?? {}),
    },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx: element, jsxs: element },
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
    '@react-navigation/native': { DefaultTheme: { colors: {} }, NavigationContainer: 'NavigationContainer', useIsFocused: () => true },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }) },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-svg': { default: 'Svg', Path: 'Path', Defs: 'Defs', LinearGradient: 'LinearGradient', Stop: 'Stop', __esModule: true },
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
    '../theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380, ambientPulse: 2400, radarPing: 1800, laserScan: 2000, staggerStep: 50 },
      motionSprings: {
        tactilePress: { tension: 260, friction: 20, useNativeDriver: true },
        gentleSlide: { tension: 140, friction: 18, useNativeDriver: true },
      },
      motionEasings: { gentleOut: (t) => t, accelerate: (t) => t, easeInOutQuad: (t) => t, linear: (t) => t },
      motionScales: { pressedButton: 0.97, pressedCard: 0.975, pulseHaloMin: 1.0, pulseHaloMax: 1.12, popInMin: 0.92, popInMax: 1.0 },
    },
    './src/theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380, ambientPulse: 2400, radarPing: 1800, laserScan: 2000, staggerStep: 50 },
      motionSprings: {
        tactilePress: { tension: 260, friction: 20, useNativeDriver: true },
        gentleSlide: { tension: 140, friction: 18, useNativeDriver: true },
      },
      motionEasings: { gentleOut: (t) => t, accelerate: (t) => t, easeInOutQuad: (t) => t, linear: (t) => t },
      motionScales: { pressedButton: 0.97, pressedCard: 0.975, pulseHaloMin: 1.0, pulseHaloMax: 1.12, popInMin: 0.92, popInMax: 1.0 },
    },
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
    './src/data/threeLensesCompanion': {
      getScopedCompanion: () => null,
      verifyCompanionIntegritySync: () => ({ valid: true, error: null }),
      THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses',
    },
    '../data/threeLensesCompanion': {
      getScopedCompanion: () => null,
      verifyCompanionIntegritySync: () => ({ valid: true, error: null }),
      THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses',
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
    'react-native': new Proxy(rnMerged, { get: (object, key) => object[key] ?? key }),
    'expo-audio': {
      useAudioPlayer: () => defaultAudioPlayer,
      createAudioPlayer: () => defaultAudioPlayer,
      ...(overrides['expo-audio'] ?? {}),
    },
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext('(function(require,module,exports){' + code + '\n})', { process: { env: {} }, setTimeout, clearTimeout, AbortController: globalThis.AbortController, ...overrides.__globals })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
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
  navigate('AlleySelect');
  assert.equal(style(), 'dark-content', 'AlleySelect light background requires dark status bar icons');
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

test('LocationScreen branches manual accessibility label and visit minutes on collectionKind alone', () => {
  const actualReviewedPilotVi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
  const actualReviewedPilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));

  const locationMocks = (locale) => ({
    '@react-navigation/native': { useIsFocused: () => true },
    '../location/nearest': { pickCandidate: () => undefined },
    'expo-location': {
      requestForegroundPermissionsAsync: async () => ({ granted: true }),
      getCurrentPositionAsync: async () => ({ coords: { latitude: 0, longitude: 0, accuracy: 10 } }),
      Accuracy: { Balanced: 1 },
    },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale,
        t: (key, params) => translator.t(locale, key, params),
      }),
    },
  });

  // 1. Reviewed pilot in VI
  const viewReviewedVi = mount('../src/screens/LocationScreen.tsx', {
    nodes: actualReviewedPilotVi.nodes,
    currentNodeId: actualReviewedPilotVi.nodes[0].id,
    onConfirmNode() {},
    collectionKind: 'reviewed',
  }, locationMocks('vi'));
  const treeReviewedVi = viewReviewedVi.render();
  const pressablesVi = elements(treeReviewedVi, 'Pressable');
  const bachMaRowVi = pressablesVi.find((p) => p.props.accessibilityLabel === 'Chọn điểm Đền Bạch Mã bằng tay');
  assert.ok(bachMaRowVi, 'reviewed row must have truthful non-simulated accessibilityLabel');
  const simulatedLabelsVi = pressablesVi
    .map((p) => p.props.accessibilityLabel)
    .filter((l) => typeof l === 'string' && l.includes('Chọn điểm') && l.includes('mô phỏng'));
  assert.equal(simulatedLabelsVi.length, 0, 'reviewed rows must not claim simulated in accessibilityLabel');
  const textReviewedVi = JSON.stringify(treeReviewedVi);
  assert.ok(textReviewedVi.includes('Gợi ý tham quan: 10 phút (chưa đo)'), 'reviewed row shows suggested unmeasured visit time');
  assert.equal(textReviewedVi.includes('10 phút mô phỏng'), false, 'reviewed row must not say 10 phút mô phỏng');
  assert.ok(textReviewedVi.includes('Tọa độ trong bản demo là mô phỏng'), 'fixture disclaimer is preserved');
  viewReviewedVi.unmount();

  // 2. Simulated payload with SAME IDs in VI (kind alone controls labels)
  const viewSimulatedVi = mount('../src/screens/LocationScreen.tsx', {
    nodes: actualReviewedPilotVi.nodes,
    currentNodeId: actualReviewedPilotVi.nodes[0].id,
    onConfirmNode() {},
    collectionKind: 'simulated',
  }, locationMocks('vi'));
  const treeSimulatedVi = viewSimulatedVi.render();
  const pressablesSimVi = elements(treeSimulatedVi, 'Pressable');
  const bachMaSimRowVi = pressablesSimVi.find((p) => p.props.accessibilityLabel === 'Chọn điểm Đền Bạch Mã bằng tay, mô phỏng');
  assert.ok(bachMaSimRowVi, 'simulated row must include mô phỏng in accessibilityLabel');
  const textSimulatedVi = JSON.stringify(treeSimulatedVi);
  assert.ok(textSimulatedVi.includes('10 phút mô phỏng'), 'simulated row shows 10 phút mô phỏng');
  viewSimulatedVi.unmount();

  // 3. Absent collectionKind defaults to simulated for backwards compatibility
  const viewAbsentVi = mount('../src/screens/LocationScreen.tsx', {
    nodes: actualReviewedPilotVi.nodes,
    currentNodeId: actualReviewedPilotVi.nodes[0].id,
    onConfirmNode() {},
  }, locationMocks('vi'));
  const treeAbsentVi = viewAbsentVi.render();
  const pressablesAbsentVi = elements(treeAbsentVi, 'Pressable');
  const bachMaAbsentRowVi = pressablesAbsentVi.find((p) => p.props.accessibilityLabel === 'Chọn điểm Đền Bạch Mã bằng tay, mô phỏng');
  assert.ok(bachMaAbsentRowVi, 'absent collectionKind defaults to simulated accessibilityLabel');
  const textAbsentVi = JSON.stringify(treeAbsentVi);
  assert.ok(textAbsentVi.includes('10 phút mô phỏng'), 'absent collectionKind defaults to 10 phút mô phỏng');
  viewAbsentVi.unmount();

  // 4. Reviewed pilot in EN
  const viewReviewedEn = mount('../src/screens/LocationScreen.tsx', {
    nodes: actualReviewedPilotEn.nodes,
    currentNodeId: actualReviewedPilotEn.nodes[0].id,
    onConfirmNode() {},
    collectionKind: 'reviewed',
  }, locationMocks('en'));
  const treeReviewedEn = viewReviewedEn.render();
  const pressablesEn = elements(treeReviewedEn, 'Pressable');
  const bachMaRowEn = pressablesEn.find((p) => p.props.accessibilityLabel === `Select ${actualReviewedPilotEn.nodes[0].name} manually`);
  assert.ok(bachMaRowEn, 'reviewed row in EN must have truthful non-simulated accessibilityLabel');
  const simulatedLabelsEn = pressablesEn
    .map((p) => p.props.accessibilityLabel)
    .filter((l) => typeof l === 'string' && l.includes('Select') && l.includes('simulated'));
  assert.equal(simulatedLabelsEn.length, 0, 'reviewed rows in EN must not claim simulated in accessibilityLabel');
  const textReviewedEn = JSON.stringify(treeReviewedEn);
  assert.ok(textReviewedEn.includes('Suggested visit: 10 min (unmeasured)'), 'reviewed row in EN shows suggested unmeasured visit time');
  assert.equal(textReviewedEn.includes('10 min simulated'), false, 'reviewed row in EN must not say 10 min simulated');
  assert.ok(textReviewedEn.includes('Coordinates in demo are simulated'), 'EN fixture disclaimer is preserved');
  viewReviewedEn.unmount();

  // 5. Simulated payload with SAME IDs in EN
  const viewSimulatedEn = mount('../src/screens/LocationScreen.tsx', {
    nodes: actualReviewedPilotEn.nodes,
    currentNodeId: actualReviewedPilotEn.nodes[0].id,
    onConfirmNode() {},
    collectionKind: 'simulated',
  }, locationMocks('en'));
  const treeSimulatedEn = viewSimulatedEn.render();
  const pressablesSimEn = elements(treeSimulatedEn, 'Pressable');
  const bachMaSimRowEn = pressablesSimEn.find((p) => p.props.accessibilityLabel === `Select ${actualReviewedPilotEn.nodes[0].name} manually, simulated`);
  assert.ok(bachMaSimRowEn, 'simulated row in EN must include simulated in accessibilityLabel');
  const textSimulatedEn = JSON.stringify(treeSimulatedEn);
  assert.ok(textSimulatedEn.includes('10 min simulated'), 'simulated row in EN shows 10 min simulated');
  viewSimulatedEn.unmount();
});

test('AlleySelectScreen translates filter chips to All and Food in EN while preserving internal filter logic and removes one-line limit from gpsLocationName', () => {
  const navigation = {
    navigate: () => {},
    goBack: () => {},
  };
  const mockCollections = [
    { id: 'fiction-letter', name: 'Letter from Hanoi', district: 'Hàng Buồm', theme: 'Old Stories', tagline: '', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
    { id: 'food-tour', name: 'Food Tour', district: 'Đồng Xuân', theme: 'Food', tagline: '', nodeCount: 4, coverPhoto: 1, kind: 'reviewed' },
  ];

  // 1. In English
  const viewEn = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'demo',
    nodeCount: 6,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
        setCollectionId: () => {},
      }),
    },
    '../data/collections': {
      isCollectionId: (v) => v === 'fiction-letter' || v === 'food-tour',
      getLocalizedCollections: () => mockCollections,
    },
  });
  const treeEn = viewEn.render();
  const pressablesEn = elements(treeEn, 'Pressable');

  // Verify chips in EN
  const filterChipsEn = pressablesEn.filter((p) => p.props.accessibilityState && 'selected' in p.props.accessibilityState);
  const filterLabelsEn = filterChipsEn.map((p) => p.props.accessibilityLabel);
  assert.deepEqual(filterLabelsEn, ['All', 'Hàng Buồm', 'Hàng Gai', 'Đồng Xuân', 'Food']);

  // Verify gpsLocationName has no numberOfLines constraint (props.numberOfLines is undefined)
  const allTextsEn = elements(treeEn, 'Text');
  const gpsLocationNameNode = allTextsEn.find((t) => [].concat(t.props.children).join('').includes('simulated content'));
  assert.ok(gpsLocationNameNode, 'gpsLocationName text element must exist');
  assert.equal(gpsLocationNameNode.props.numberOfLines, undefined, 'gpsLocationName must not restrict numberOfLines to 1 so full qualifier can wrap at font200');

  // Tap "Food" filter chip
  const foodChip = filterChipsEn.find((p) => p.props.accessibilityLabel === 'Food');
  assert.ok(foodChip, 'Food filter chip must exist in EN');
  foodChip.props.onPress();

  // Re-render to check filtered cards
  const treeAfterFilter = viewEn.render();
  const cardsAfterFilter = elements(treeAfterFilter, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Open'));
  assert.equal(cardsAfterFilter.length, 1, 'Only Food collection should remain after filtering by Food');
  assert.ok(cardsAfterFilter[0].props.accessibilityLabel.includes('Food Tour'));
  viewEn.unmount();

  // 2. In Vietnamese
  const viewVi = mount('../src/screens/AlleySelectScreen.tsx', {
    navigation,
    mode: 'demo',
    nodeCount: 6,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
        setCollectionId: () => {},
      }),
    },
    '../data/collections': {
      isCollectionId: (v) => v === 'fiction-letter' || v === 'food-tour',
      getLocalizedCollections: () => [
        { id: 'fiction-letter', name: 'Lá thư Hà Nội', district: 'Hàng Buồm', theme: 'Chuyện xưa', tagline: '', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
        { id: 'food-tour', name: 'Tour Ẩm Thực', district: 'Đồng Xuân', theme: 'Ẩm thực', tagline: '', nodeCount: 4, coverPhoto: 1, kind: 'reviewed' },
      ],
    },
  });
  const treeVi = viewVi.render();
  const pressablesVi = elements(treeVi, 'Pressable');
  const filterChipsVi = pressablesVi.filter((p) => p.props.accessibilityState && 'selected' in p.props.accessibilityState);
  const filterLabelsVi = filterChipsVi.map((p) => p.props.accessibilityLabel);
  assert.deepEqual(filterLabelsVi, ['Tất cả', 'Hàng Buồm', 'Hàng Gai', 'Đồng Xuân', 'Ẩm thực']);
  viewVi.unmount();
});

test('AlleyTrailView and PostcardCard branch visit time on collectionKind', () => {
  const actualReviewedPilotVi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
  const actualReviewedPilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));

  const trailMocks = (locale) => ({
    '../context/LocaleContext': {
      useLocale: () => ({
        locale,
        t: (key, params) => translator.t(locale, key, params),
      }),
    },
  });

  // 1. AlleyTrailView reviewed in EN
  const viewTrailReviewedEn = mount('../src/components/AlleyTrailView.tsx', {
    nodes: actualReviewedPilotEn.nodes,
    currentNodeId: actualReviewedPilotEn.nodes[0].id,
    onSelectNode() {},
    collectionKind: 'reviewed',
  }, trailMocks('en'));
  const treeTrailReviewedEn = viewTrailReviewedEn.render();
  const textTrailReviewedEn = JSON.stringify(treeTrailReviewedEn);
  assert.ok(textTrailReviewedEn.includes('Suggested visit: 10 min (unmeasured)'), 'reviewed trail in EN displays suggested unmeasured visit time');
  assert.equal(textTrailReviewedEn.includes('10 simulated min'), false, 'reviewed trail in EN must not say simulated min');
  const pressablesTrailEn = elements(treeTrailReviewedEn, 'Pressable');
  const cardPressableEn = pressablesTrailEn.find((p) => p.props.accessibilityLabel?.startsWith(actualReviewedPilotEn.nodes[0].name));
  assert.ok(cardPressableEn.props.accessibilityLabel.includes('Suggested visit: 10 min (unmeasured)'));
  viewTrailReviewedEn.unmount();

  // 2. AlleyTrailView reviewed in VI
  const viewTrailReviewedVi = mount('../src/components/AlleyTrailView.tsx', {
    nodes: actualReviewedPilotVi.nodes,
    currentNodeId: actualReviewedPilotVi.nodes[0].id,
    onSelectNode() {},
    collectionKind: 'reviewed',
  }, trailMocks('vi'));
  const treeTrailReviewedVi = viewTrailReviewedVi.render();
  const textTrailReviewedVi = JSON.stringify(treeTrailReviewedVi);
  assert.ok(textTrailReviewedVi.includes('Gợi ý tham quan: 10 phút (chưa đo)'), 'reviewed trail in VI displays suggested unmeasured visit time');
  assert.equal(textTrailReviewedVi.includes('phút mô phỏng'), false, 'reviewed trail in VI must not say phút mô phỏng');
  viewTrailReviewedVi.unmount();

  // 3. AlleyTrailView simulated / default absent in EN
  const viewTrailSimEn = mount('../src/components/AlleyTrailView.tsx', {
    nodes: actualReviewedPilotEn.nodes,
    currentNodeId: actualReviewedPilotEn.nodes[0].id,
    onSelectNode() {},
  }, trailMocks('en'));
  const treeTrailSimEn = viewTrailSimEn.render();
  const textTrailSimEn = JSON.stringify(treeTrailSimEn);
  assert.ok(textTrailSimEn.includes('10 simulated min'), 'simulated / default trail in EN displays simulated min');
  viewTrailSimEn.unmount();

  // 4. PostcardCard reviewed in EN
  const viewCardReviewed = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotEn.nodes[0],
    collectionKind: 'reviewed',
  }, trailMocks('en'));
  const treeCardReviewed = viewCardReviewed.render();
  const textCardReviewed = JSON.stringify(treeCardReviewed);
  assert.ok(textCardReviewed.includes('Suggested visit: 10 min (unmeasured)'), 'reviewed PostcardCard displays suggested visit time');
  assert.equal(textCardReviewed.includes('min simulated'), false);
  assert.ok(textCardReviewed.includes('Illustration photo · reviewed stops'), 'reviewed PostcardCard displays reviewed photo disclaimer');
  assert.equal(textCardReviewed.includes('simulated point'), false);
  viewCardReviewed.unmount();

  // 5. PostcardCard simulated in EN
  const viewCardSim = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotEn.nodes[0],
    collectionKind: 'simulated',
  }, trailMocks('en'));
  const treeCardSim = viewCardSim.render();
  const textCardSim = JSON.stringify(treeCardSim);
  assert.ok(textCardSim.includes('10 min simulated'), 'simulated PostcardCard displays simulated minutes');
  assert.ok(textCardSim.includes('Illustration photo · simulated point'), 'simulated PostcardCard displays simulated photo disclaimer');
  assert.equal(textCardSim.includes('reviewed stops'), false);
  viewCardSim.unmount();

  // 6. PostcardCard reviewed in VI
  const viewCardReviewedVi = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotVi.nodes[0],
    collectionKind: 'reviewed',
  }, trailMocks('vi'));
  const treeCardReviewedVi = viewCardReviewedVi.render();
  const textCardReviewedVi = JSON.stringify(treeCardReviewedVi);
  assert.ok(textCardReviewedVi.includes('Gợi ý tham quan: 10 phút (chưa đo)'));
  assert.ok(textCardReviewedVi.includes('Ảnh minh họa · điểm đã duyệt'));
  assert.equal(textCardReviewedVi.includes('điểm mô phỏng'), false);
  viewCardReviewedVi.unmount();

  // 7. PostcardCard simulated in VI
  const viewCardSimVi = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotVi.nodes[0],
    collectionKind: 'simulated',
  }, trailMocks('vi'));
  const treeCardSimVi = viewCardSimVi.render();
  const textCardSimVi = JSON.stringify(treeCardSimVi);
  assert.ok(textCardSimVi.includes('10 phút mô phỏng'));
  assert.ok(textCardSimVi.includes('Ảnh minh họa · điểm mô phỏng'));
  assert.equal(textCardSimVi.includes('điểm đã duyệt'), false);
  viewCardSimVi.unmount();

  // 8. PostcardCard simulated kind wins over selected new collection (old-quarter-three-lenses)
  const viewCardSimPrecedence = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotEn.nodes[0],
    collectionKind: 'simulated',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        collectionId: 'old-quarter-three-lenses',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const textCardSimPrecedence = JSON.stringify(viewCardSimPrecedence.render());
  assert.ok(textCardSimPrecedence.includes('10 min simulated'), 'simulated kind must win over old-quarter-three-lenses collection');
  assert.ok(textCardSimPrecedence.includes('Illustration photo · simulated point'), 'simulated photo disclaimer must display when collectionKind is simulated');
  assert.equal(textCardSimPrecedence.includes('Supplied photo'), false, 'supplied photo disclaimer must NOT display when collectionKind is simulated');
  assert.equal(textCardSimPrecedence.includes('Sourced · not officially approved'), false, 'sourced disclaimer must NOT display when collectionKind is simulated');
  viewCardSimPrecedence.unmount();
});

test('HomeScreen passes source dataset.kind precedence to AlleyTrailView (ready simulated never upgraded by reviewed metadata)', () => {
  const actualReviewedPilotVi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));

  // 1. Ready simulated payload on known pilot collection ('old-quarter-pilot' whose metadata is reviewed)
  const simulatedPilotDataset = {
    ...actualReviewedPilotVi,
    collectionId: 'old-quarter-pilot',
    kind: 'simulated',
  };
  const homeViewSim = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: { status: 'ready', dataset: simulatedPilotDataset },
    onModeChange() {},
    currentNodeId: simulatedPilotDataset.nodes[0].id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeSim = homeViewSim.render();
  const trailSim = elements(treeSim, 'AlleyTrailView')[0];
  assert.ok(trailSim, 'trail component rendered at fontScale 2');
  assert.equal(trailSim.props.collectionKind, 'simulated', 'dataset.kind simulated must take precedence over activeCollection.kind reviewed');
  const simTexts = elements(treeSim, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(simTexts.includes('DEMO · nội dung mô phỏng'), 'Home drawer shows simulated content tag in VI when dataset.kind is simulated');
  assert.equal(simTexts.includes('DEMO · di sản đã duyệt'), false, 'Home drawer must not upgrade simulated dataset to reviewed in VI');
  homeViewSim.unmount();

  // 2. Ready reviewed payload
  const reviewedPilotDataset = {
    ...actualReviewedPilotVi,
    collectionId: 'old-quarter-pilot',
    kind: 'reviewed',
  };
  const homeViewRev = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: { status: 'ready', dataset: reviewedPilotDataset },
    onModeChange() {},
    currentNodeId: reviewedPilotDataset.nodes[0].id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeRev = homeViewRev.render();
  const trailRev = elements(treeRev, 'AlleyTrailView')[0];
  assert.equal(trailRev.props.collectionKind, 'reviewed', 'dataset.kind reviewed is passed directly');
  const revTexts = elements(treeRev, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(revTexts.includes('DEMO · di sản đã duyệt'), 'Home drawer shows reviewed heritage tag in VI when dataset.kind is reviewed');
  assert.equal(revTexts.includes('DEMO · nội dung mô phỏng'), false);
  homeViewRev.unmount();

  // 3. Ready dataset with undefined kind defaults to simulated
  const undefinedKindDataset = {
    ...actualReviewedPilotVi,
    collectionId: 'old-quarter-pilot',
  };
  delete undefinedKindDataset.kind;
  const homeViewUndef = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: { status: 'ready', dataset: undefinedKindDataset },
    onModeChange() {},
    currentNodeId: undefinedKindDataset.nodes[0].id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeUndef = homeViewUndef.render();
  const trailUndef = elements(treeUndef, 'AlleyTrailView')[0];
  assert.equal(trailUndef.props.collectionKind, 'simulated', 'undefined dataset.kind defaults to simulated even on pilot collection');
  const undefTexts = elements(treeUndef, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(undefTexts.includes('DEMO · nội dung mô phỏng'), 'Home drawer defaults to simulated content in VI when dataset.kind is undefined');
  homeViewUndef.unmount();

  // 4. EN Demo reviewed payload
  const actualReviewedPilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));
  const reviewedPilotDatasetEn = {
    ...actualReviewedPilotEn,
    collectionId: 'old-quarter-pilot',
    kind: 'reviewed',
  };
  const homeViewRevEn = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: { status: 'ready', dataset: reviewedPilotDatasetEn },
    onModeChange() {},
    currentNodeId: reviewedPilotDatasetEn.nodes[0].id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeRevEn = homeViewRevEn.render();
  const revTextsEn = elements(treeRevEn, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(revTextsEn.includes('DEMO · reviewed heritage'), 'Home drawer shows reviewed heritage tag in EN when dataset.kind is reviewed');
  assert.equal(revTextsEn.includes('DEMO · simulated content'), false);
  homeViewRevEn.unmount();

  // 5. EN Demo simulated payload on pilot collection (strict precedence)
  const simulatedPilotDatasetEn = {
    ...actualReviewedPilotEn,
    collectionId: 'old-quarter-pilot',
    kind: 'simulated',
  };
  const homeViewSimEn = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: { status: 'ready', dataset: simulatedPilotDatasetEn },
    onModeChange() {},
    currentNodeId: simulatedPilotDatasetEn.nodes[0].id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    navigation: { goBack() {}, navigate() {} },
    route: { params: { alleyId: 'old-quarter-pilot' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeSimEn = homeViewSimEn.render();
  const simTextsEn = elements(treeSimEn, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(simTextsEn.includes('DEMO · simulated content'), 'Home drawer shows simulated content tag in EN when dataset.kind is simulated');
  assert.equal(simTextsEn.includes('DEMO · reviewed heritage'), false, 'Home drawer must not upgrade simulated dataset to reviewed in EN');
  homeViewSimEn.unmount();
});

test('NgoKeLogo renders NGÕ KỂ brand title and localized subtitle across locales', () => {
  // 1. VI locale default subtitle
  const viewVi = mount('../src/components/NgoKeLogo.tsx', {
    variant: 'horizontal',
    theme: 'light',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeVi = viewVi.render();
  const textsVi = elements(treeVi, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(textsVi.includes('NGÕ KỂ'), 'Brand title NGÕ KỂ rendered in VI');
  assert.ok(textsVi.includes('Sổ tay di sản phố ngõ'), 'Default VI subtitle rendered');
  viewVi.unmount();

  // 2. EN locale default subtitle
  const viewEn = mount('../src/components/NgoKeLogo.tsx', {
    variant: 'horizontal',
    theme: 'light',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeEn = viewEn.render();
  const textsEn = elements(treeEn, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(textsEn.includes('NGÕ KỂ'), 'Brand title NGÕ KỂ preserved unchanged in EN');
  assert.ok(textsEn.includes('Alley heritage notebook'), 'Localized EN subtitle rendered');
  viewEn.unmount();

  // 3. showSubtitle={false} hides subtitle
  const viewNoSub = mount('../src/components/NgoKeLogo.tsx', {
    variant: 'horizontal',
    showSubtitle: false,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });
  const treeNoSub = viewNoSub.render();
  const textsNoSub = elements(treeNoSub, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(textsNoSub.includes('NGÕ KỂ'));
  assert.equal(textsNoSub.includes('Sổ tay di sản phố ngõ'), false);
  viewNoSub.unmount();

  // 4. variant="iconOnly" does not render any text
  const viewIconOnly = mount('../src/components/NgoKeLogo.tsx', {
    variant: 'iconOnly',
  });
  const treeIconOnly = viewIconOnly.render();
  const textsIconOnly = elements(treeIconOnly, 'Text');
  assert.equal(textsIconOnly.length, 0, 'No text in iconOnly variant');
  viewIconOnly.unmount();
});

test('LandingScreen header layout policy wraps and stacks cleanly at fontScale 2 (preventing collision at 200%)', () => {
  // 1. Normal scale (fontScale: 1.0)
  const viewNormal = mount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 1.0 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        setCollectionId: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeNormal = viewNormal.render();
  const animViewsNormal = elements(treeNormal, 'Animated.View');
  const headerBarNormal = animViewsNormal[0];
  assert.ok(headerBarNormal, 'Header bar Animated.View rendered');
  // headerBar style is an array: [styles.headerBar, fontScale > 1.3 && styles.headerBarStacked, { opacity, transform }]
  const headerStylesNormal = [].concat(headerBarNormal.props.style).filter(Boolean);
  assert.equal(headerStylesNormal.some((s) => s.flexDirection === 'column'), false, 'Normal fontScale does not stack into column');
  assert.ok(headerStylesNormal.some((s) => s.flexDirection === 'row' && s.flexWrap === 'wrap'), 'Normal fontScale uses row with wrap');
  viewNormal.unmount();

  // 2. High scale (fontScale: 2.0 / 200%)
  const viewHigh = mount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2.0 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        setCollectionId: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeHigh = viewHigh.render();
  const animViewsHigh = elements(treeHigh, 'Animated.View');
  const headerBarHigh = animViewsHigh[0];
  assert.ok(headerBarHigh, 'Header bar Animated.View rendered at fontScale 2');
  const headerStylesHigh = [].concat(headerBarHigh.props.style).filter(Boolean);
  // Stacks into column with left alignment at fontScale > 1.3
  assert.ok(headerStylesHigh.some((s) => s.flexDirection === 'column' && s.alignItems === 'flex-start'), 'High fontScale stacks into column');
  
  // Verify NgoKeLogo is passed flexShrink style
  const logoInHeader = elements(headerBarHigh, 'NgoKeLogo')[0];
  assert.ok(logoInHeader, 'NgoKeLogo present in header');
  assert.equal(logoInHeader.props.style.flexShrink, 1, 'Logo wrapper has flexShrink: 1');

  // Verify controls container has flexWrap: 'wrap' and gap
  const controls = headerBarHigh.props.children[1];
  assert.ok(controls, 'Header controls present');
  assert.equal(controls.props.style.flexWrap, 'wrap');
  assert.equal(controls.props.style.flexDirection, 'row');
  assert.equal(controls.props.style.gap, 8);

  viewHigh.unmount();
});

test('PostcardCard header layout policy stacks cleanly at fontScale 2 (preventing title squeeze)', () => {
  const actualReviewedPilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));

  // 1. Normal scale (fontScale: 1.0)
  const viewNormal = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotEn.nodes[0],
    collectionKind: 'reviewed',
    onSelect: () => {},
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 1.0 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeNormal = viewNormal.render();
  const headerRowNormal = elements(treeNormal, 'View').find((v) => v.props.style && [].concat(v.props.style).some((s) => s?.justifyContent === 'space-between'));
  assert.ok(headerRowNormal, 'Header row rendered');
  const headerStylesNormal = [].concat(headerRowNormal.props.style).filter(Boolean);
  assert.equal(headerStylesNormal.some((s) => s.flexDirection === 'column'), false, 'Normal scale uses row');
  assert.ok(headerStylesNormal.some((s) => s.flexDirection === 'row' && s.flexWrap === 'wrap'), 'Normal scale has flexWrap wrap');
  viewNormal.unmount();

  // 2. High scale (fontScale: 2.0 / 200%)
  const viewHigh = mount('../src/components/PostcardCard.tsx', {
    node: actualReviewedPilotEn.nodes[0],
    collectionKind: 'reviewed',
    onSelect: () => {},
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2.0 },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });
  const treeHigh = viewHigh.render();
  const headerRowHigh = elements(treeHigh, 'View').find((v) => v.props.style && [].concat(v.props.style).some((s) => s?.justifyContent === 'space-between'));
  assert.ok(headerRowHigh, 'Header row rendered at fontScale 2');
  const headerStylesHigh = [].concat(headerRowHigh.props.style).filter(Boolean);
  assert.ok(headerStylesHigh.some((s) => s.flexDirection === 'column' && s.alignItems === 'flex-start'), 'High fontScale stacks header into column');

  // Verify node.name title is preserved without ellipsis
  const titleText = elements(headerRowHigh, 'Text').find((t) => t.props.accessibilityRole === 'header');
  assert.ok(titleText, 'Title text rendered');
  assert.equal(titleText.props.children, actualReviewedPilotEn.nodes[0].name, 'Full node name rendered');
  assert.equal(titleText.props.numberOfLines, undefined, 'Title has no numberOfLines cap');

  // Verify duration text is complete
  const durationText = elements(headerRowHigh, 'Text').find((t) => [].concat(t.props.children).join('').includes('Suggested visit'));
  assert.ok(durationText, 'Duration badge rendered');
  assert.ok([].concat(durationText.props.children).join('').includes('Suggested visit: 10 min (unmeasured)'));

  // Verify action button is present and accessible
  const actionButton = elements(treeHigh, 'Pressable')[0];
  assert.ok(actionButton, 'Action button rendered');
  assert.equal(actionButton.props.accessibilityRole, 'button');

  viewHigh.unmount();
});

test('PlanScreen localizes headlines and postcard reasons across all three topics in EN and VI', () => {
  const fictionEn = JSON.parse(readFileSync(new URL('../../data/localized/fiction.en.json', import.meta.url), 'utf8'));
  const fictionVi = fixture;

  const topicExpectations = [
    { topic: 'an thuc', enLabel: 'Alley food', viLabel: 'Ẩm thực ngõ', viLegacyLabel: 'ẩm thực' },
    { topic: 'chuyen xua', enLabel: 'Old stories & heritage', viLabel: 'Chuyện xưa hoài niệm', viLegacyLabel: 'chuyện xưa' },
    { topic: 'kham pha tu do', enLabel: 'Free exploration', viLabel: 'Khám phá tự do', viLegacyLabel: 'khám phá tự do' },
  ];

  for (const { topic, enLabel, viLabel, viLegacyLabel } of topicExpectations) {
    // 1. EN mode
    const viewEn = mount('../src/screens/PlanScreen.tsx', {
      mode: 'demo',
      nodes: fictionEn.nodes,
      draft: { topic, budgetMinutes: 45 },
      onDraftChange: () => {},
      onSelectNode: () => {},
      collectionKind: 'simulated',
    }, {
      '../context/LocaleContext': {
        useLocale: () => ({
          locale: 'en',
          t: (key, params) => translator.t('en', key, params),
        }),
      },
    }, 'PlanScreen');
    const treeEn = viewEn.render();
    const allTextsEn = elements(treeEn, 'Text').map((t) => [].concat(t.props?.children).join(''));
    const fullTextEn = allTextsEn.join(' ');

    // Headline check
    assert.ok(allTextsEn.some((t) => t.includes(`${enLabel} · 45 min`)), `EN headline displays ${enLabel} for topic ${topic}`);
    assert.equal(fullTextEn.includes(viLegacyLabel), false, `EN text must not leak raw Vietnamese topic ${viLegacyLabel}`);
    assert.equal(fullTextEn.includes('Hợp chủ đề'), false, `EN text must not leak raw Vietnamese "Hợp chủ đề"`);

    // PostcardCard subReason check
    const postcardsEn = elements(treeEn, 'PostcardCard');
    assert.ok(postcardsEn.length > 0, `Expected picks for topic ${topic}`);
    for (const card of postcardsEn) {
      assert.ok(card.props.subReason.startsWith(`Matches ${enLabel} · `), `subReason must match EN template: ${card.props.subReason}`);
      assert.ok(fictionEn.nodes.some((n) => card.props.subReason.includes(n.summary)), 'subReason must include English node summary');
    }

    viewEn.unmount();

    // 2. VI mode
    const viewVi = mount('../src/screens/PlanScreen.tsx', {
      mode: 'demo',
      nodes: fictionVi.nodes,
      draft: { topic, budgetMinutes: 45 },
      onDraftChange: () => {},
      onSelectNode: () => {},
      collectionKind: 'simulated',
    }, {
      '../context/LocaleContext': {
        useLocale: () => ({
          locale: 'vi',
          t: (key, params) => translator.t('vi', key, params),
        }),
      },
    }, 'PlanScreen');
    const treeVi = viewVi.render();
    const allTextsVi = elements(treeVi, 'Text').map((t) => [].concat(t.props?.children).join(''));
    assert.ok(allTextsVi.some((t) => t.includes(`${viLabel} · 45 phút`)), `VI headline displays ${viLabel} for topic ${topic}`);

    const postcardsVi = elements(treeVi, 'PostcardCard');
    assert.ok(postcardsVi.length > 0, `Expected picks for VI topic ${topic}`);
    for (const card of postcardsVi) {
      assert.ok(card.props.subReason.includes(`Hợp chủ đề`), 'VI subReason must contain "Hợp chủ đề"');
      assert.ok(fictionVi.nodes.some((n) => card.props.subReason.includes(n.summary)), 'VI subReason must include Vietnamese node summary');
    }

    viewVi.unmount();
  }

  // 3. Grammar check: 1 stop vs multiple stops in EN
  const viewSingleEn = mount('../src/screens/PlanScreen.tsx', {
    mode: 'demo',
    nodes: [fictionEn.nodes[0]],
    draft: { topic: 'kham pha tu do', budgetMinutes: 15 },
    onDraftChange: () => {},
    onSelectNode: () => {},
    collectionKind: 'simulated',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  }, 'PlanScreen');
  const treeSingleEn = viewSingleEn.render();
  const allTextsSingle = elements(treeSingleEn, 'Text').map((t) => [].concat(t.props?.children).join(''));
  assert.ok(allTextsSingle.some((t) => t.includes('Here is 1 stop selected for your journey:')), 'Singular grammar used when 1 stop selected');
  assert.equal(allTextsSingle.some((t) => t.includes('Here are 1 stops')), false, 'No plural "Here are 1 stops"');
  viewSingleEn.unmount();
});

test('QaScreen localizes inline voice pick reasons in EN without leaking raw Vietnamese', () => {
  const fictionEn = JSON.parse(readFileSync(new URL('../../data/localized/fiction.en.json', import.meta.url), 'utf8'));
  let transcript;
  let draft = {};
  const nodeId = fictionEn.nodes[0].id;
  const properties = () => ({
    dataset: fictionEn,
    mode: 'demo',
    datasetRevision: 'rev-en',
    currentNodeId: nodeId,
    onSelectNode: () => {},
    onReadNode() {},
    readNodeIds: new Set(),
    planDraft: draft,
    onPlanDraftChange: (next) => { draft = next; },
    onOpenNotebook: () => {},
  });
  const view = mount('../src/screens/QaScreen.tsx', properties(), {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        t: (key, params) => translator.t('en', key, params),
      }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: (options) => {
        transcript = options.onTranscript;
        return {
          stage: 'idle',
          error: null,
          recordingDurationMs: 0,
          metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 },
          activeTrackId: null,
          playbackError: null,
          startRecording() {},
          submitRecording() {},
          cancel() {},
          stopPlayback() {},
          playTrack() {},
          replayTrack() {},
        };
      },
    },
  });
  view.render();
  transcript('choose experience food for 30 minutes', { turnId: 'plan-1', scope: `demo:rev-en:${nodeId}`, nodeId, mode: 'demo', datasetRevision: 'rev-en' });
  const tree = view.render(properties());
  const allTexts = elements(tree, 'Text').map((t) => [].concat(t.props?.children).join(''));
  assert.ok(allTexts.some((t) => t.startsWith('Matches Alley food · ')), 'Voice pick reason is localized in EN');
  assert.equal(allTexts.some((t) => t.includes('Hợp chủ đề')), false, 'No raw Vietnamese "Hợp chủ đề" in EN QaScreen');
  const dockEn = elements(tree, 'VoiceInteractionDock')[0]?.props;
  assert.equal(dockEn?.quickActionLabel, 'Open alley notebook', 'QaScreen passes localized home.notebook_label as quickActionLabel in EN');
  view.unmount();

  // VI mode quick action label check
  const viewVi = mount('../src/screens/QaScreen.tsx', properties(), {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: () => ({
        stage: 'idle',
        error: null,
        recordingDurationMs: 0,
        metering: -60,
        playback: { playing: false, currentTime: 0, duration: 0 },
        activeTrackId: null,
        playbackError: null,
        startRecording() {},
        submitRecording() {},
        cancel() {},
        stopPlayback() {},
        playTrack() {},
        replayTrack() {},
      }),
    },
  });
  const treeVi = viewVi.render();
  const dockVi = elements(treeVi, 'VoiceInteractionDock')[0]?.props;
  assert.equal(dockVi?.quickActionLabel, 'Mở sổ tay ngõ phố', 'QaScreen passes localized home.notebook_label as quickActionLabel in VI');
  viewVi.unmount();
});

test('PrologueScreen triggers bilateral semicircular golden water ripple arcs radiating from button flanks and plays portal sound', () => {
  const replaceCalls = [];
  const audioEvents = [];
  const playerMock = {
    play: () => { audioEvents.push('play'); },
    pause: () => { audioEvents.push('pause'); },
  };

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
    'expo-audio': {
      useAudioPlayer: () => playerMock,
    },
  });

  let tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  assert.ok(startBtn, 'Start button found with accessible label');

  // Button layout measurement
  startBtn.props.onLayout({ nativeEvent: { layout: { width: 260, height: 60 } } });

  // 1. Tap with local coordinates (x: 100, y: 35)
  startBtn.props.onPress({ nativeEvent: { locationX: 100, locationY: 35 } });
  tree = view.render();

  // Verify audio played
  assert.deepEqual(audioEvents, ['play'], 'Portal discovery sound plays on tap');

  // Verify golden water ripple overlay is rendered with proper accessibility exclusion
  const rippleOverlay = elements(tree, 'View').find((item) => item.props.testID === 'prologue-ripple-overlay');
  assert.ok(rippleOverlay, 'Ripple overlay rendered with testID="prologue-ripple-overlay"');
  assert.equal(rippleOverlay.props.pointerEvents, 'none', 'Ripple overlay has pointerEvents="none"');
  assert.equal(rippleOverlay.props['aria-hidden'], true, 'Ripple overlay has aria-hidden=true');

  // Verify bilateral flanks exist outside button
  const leftFlank = elements(tree, 'View').find((item) => item.props.testID === 'prologue-ripple-left-flank');
  const rightFlank = elements(tree, 'View').find((item) => item.props.testID === 'prologue-ripple-right-flank');
  assert.ok(leftFlank && rightFlank, 'Bilateral flank ripple containers rendered');

  const leftFlankStyle = [].concat(leftFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  const rightFlankStyle = [].concat(rightFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(leftFlankStyle.position, 'absolute');
  assert.equal(leftFlankStyle.left, -28, 'Left flank positioned outside left button edge (bounded within 16-28dp)');
  assert.equal(rightFlankStyle.right, -28, 'Right flank positioned outside right button edge (bounded within 16-28dp)');

  // Verify 2 staggered wave arcs on each flank (bounded strictly to 16-28dp spread)
  const leftWave1 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-left-1');
  const leftWave2 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-left-2');
  const leftWave3 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-left-3');
  const rightWave1 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-right-1');
  const rightWave2 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-right-2');
  const rightWave3 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-right-3');
  assert.ok(leftWave1 && leftWave2 && rightWave1 && rightWave2, 'Bilateral semicircular ripple wave arcs rendered (2 per flank)');
  assert.equal(leftWave3, undefined, 'Third wave arc removed per approved 2-wave design');
  assert.equal(rightWave3, undefined, 'Third wave arc removed per approved 2-wave design');

  // 2. Rapid second press does not play sound again or navigate multiple times
  startBtn.props.onPress({ nativeEvent: { locationX: 120, locationY: 40 } });
  assert.equal(audioEvents.length, 1, 'Rapid press debounced: sound played only once');

  // 3. Navigation replaces to Landing
  assert.deepEqual(replaceCalls, ['Landing'], 'Navigation replaces to Landing');

  // 4. Unmount cleans up audio
  view.unmount();
  assert.ok(audioEvents.includes('pause'), 'Audio paused on unmount');
});

test('PrologueScreen accessibility activation falls back to button center and reduced motion navigates promptly without expanding ripple', () => {
  const replaceCalls = [];
  const viewReduced = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }),
    },
  });

  const tree = viewReduced.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // Screen reader / TalkBack activation with no location coordinates
  startBtn.props.onLayout({ nativeEvent: { layout: { width: 240, height: 56 } } });
  startBtn.props.onPress(); // No event / no locationX

  // Navigates promptly when reducedMotion is true
  assert.deepEqual(replaceCalls, ['Landing'], 'Reduced motion navigates promptly to Landing');

  // Ripple waves are skipped under reduced motion
  const treeAfter = viewReduced.render();
  const overlay = elements(treeAfter, 'View').find((item) => item.props.testID === 'prologue-ripple-overlay');
  assert.equal(overlay, undefined, 'No expanding ripple overlay under reduced motion');
  const wave1 = elements(treeAfter, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-left-1');
  assert.equal(wave1, undefined, 'No expanding ripple waves under reduced motion');
  viewReduced.unmount();
});

test('PrologueScreen audio play failure never blocks navigation', () => {
  const replaceCalls = [];
  const viewError = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }),
    },
    'expo-audio': {
      useAudioPlayer: () => ({
        play: () => { throw new Error('Hardware audio device busy'); },
        pause: () => {},
      }),
    },
  });

  const tree = viewError.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // Tap button when audio subsystem throws
  assert.doesNotThrow(() => {
    startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });
  }, 'Audio playback failure must not throw');

  assert.deepEqual(replaceCalls, ['Landing'], 'Navigation succeeds despite audio failure');
  viewError.unmount();
});

test('PrologueScreen anchors flank ripples symmetrically to button ends regardless of tap coordinates', () => {
  const replaceCalls = [];
  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  startBtn.props.onLayout({ nativeEvent: { layout: { width: 240, height: 56 } } });

  // Tap at exactly (0, 0)
  startBtn.props.onPress({ nativeEvent: { locationX: 0, locationY: 0 } });
  const treeAfter = view.render();
  const leftFlank = elements(treeAfter, 'View').find((item) => item.props.testID === 'prologue-ripple-left-flank');
  const rightFlank = elements(treeAfter, 'View').find((item) => item.props.testID === 'prologue-ripple-right-flank');
  assert.ok(leftFlank && rightFlank, 'Flanks rendered symmetrically when tapping at (0, 0)');

  const leftFlankStyle = [].concat(leftFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  const rightFlankStyle = [].concat(rightFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(leftFlankStyle.left, -28, 'Left flank anchored at -28 regardless of tap at 0');
  assert.equal(rightFlankStyle.right, -28, 'Right flank anchored at -28 regardless of tap at 0');

  const leftWave1 = elements(treeAfter, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-left-1');
  const rightWave1 = elements(treeAfter, 'Animated.View').find((item) => item.props.testID === 'prologue-ripple-wave-right-1');
  assert.ok(leftWave1 && rightWave1, 'Bilateral wave arcs present for tap coordinate 0');

  view.unmount();
});

test('PrologueScreen does not navigate if animation finishes with finished:false (cancelled callback and RN override merges StyleSheet)', () => {
  const replaceCalls = [];
  let animCallback = null;

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
    'react-native': {
      Animated: {
        timing: () => ({
          start: (cb) => { animCallback = cb; },
          stop: () => {},
        }),
      },
    },
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 20 } });

  assert.ok(animCallback, 'Animation was started');
  // Trigger callback with finished: false (e.g. stopped/cancelled)
  animCallback({ finished: false });

  assert.equal(replaceCalls.length, 0, 'No navigation when animation finishes with finished: false');
  view.unmount();
});

test('PrologueScreen early returns press when hidden and retries with new attempt token on foreground', () => {
  const replaceCalls = [];
  const audioEvents = [];
  let animCallback = null;
  let foregroundState = false; // Initially backgrounded

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: foregroundState, reducedMotion: false, foreground: foregroundState }),
    },
    'expo-audio': {
      useAudioPlayer: () => ({
        play: () => audioEvents.push('play'),
        pause: () => audioEvents.push('pause'),
      }),
    },
    __animatedTiming: () => ({
      start: (cb) => { animCallback = cb; },
      stop: () => {},
    }),
  });

  let tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // 1. Press while hidden -> early returns immediately
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 20 } });
  assert.equal(audioEvents.includes('play'), false, 'No play sound when hidden');
  assert.equal(animCallback, null, 'No animation started when hidden');
  assert.equal(replaceCalls.length, 0, 'No navigation when hidden');

  // 2. Return to foreground
  foregroundState = true;
  tree = view.render();
  const startBtnForeground = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // 3. Press now starts attempt with token
  startBtnForeground.props.onPress({ nativeEvent: { locationX: 50, locationY: 20 } });
  assert.ok(audioEvents.includes('play'), 'Sound played on foreground press');
  assert.ok(animCallback, 'Animation started on foreground press');

  // Complete animation with finished: true
  animCallback({ finished: true });
  assert.deepEqual(replaceCalls, ['Landing'], 'Navigation succeeds on valid foreground attempt');

  view.unmount();
});

test('PrologueScreen background or unmount mid-ripple cancels animation and prevents unmounted/hidden navigation', () => {
  const replaceCalls = [];
  const audioEvents = [];
  let animCallback = null;
  let foregroundState = true;

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: foregroundState }),
    },
    'expo-audio': {
      useAudioPlayer: () => ({
        play: () => audioEvents.push('play'),
        pause: () => audioEvents.push('pause'),
      }),
    },
    __animatedTiming: () => ({
      start: (cb) => { animCallback = cb; },
      stop: () => {},
    }),
    __onStopAnimation: () => audioEvents.push('stopAnimation'),
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  startBtn.props.onPress({ nativeEvent: { locationX: 60, locationY: 25 } });

  assert.deepEqual(audioEvents, ['play'], 'Audio started on initial tap');

  // App is backgrounded mid-ripple
  foregroundState = false;
  view.render();

  assert.ok(audioEvents.includes('pause'), 'Audio paused on backgrounding');
  assert.ok(audioEvents.includes('stopAnimation'), 'Animation stopped on backgrounding');

  // Late animation completion arriving after backgrounding must NOT navigate
  if (animCallback) {
    animCallback({ finished: true });
  }
  assert.equal(replaceCalls.length, 0, 'No navigation occurred while in background');

  // Unmount while un-navigated
  view.unmount();
  assert.equal(replaceCalls.length, 0, 'No navigation after unmount');
});

test('PrologueScreen deferred async seekTo resolution after cancellation or unmount never triggers late player.play', async () => {
  const replaceCalls = [];
  const audioEvents = [];
  let pendingResolves = [];
  let animCallback = null;
  let foregroundState = true;

  const playerMock = {
    play: () => audioEvents.push('play'),
    pause: () => audioEvents.push('pause'),
    seekTo: () => new Promise((resolve) => {
      pendingResolves.push(resolve);
    }),
  };

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: foregroundState }),
    },
    'expo-audio': {
      useAudioPlayer: () => playerMock,
    },
    __animatedTiming: () => ({
      start: (cb) => { animCallback = cb; },
      stop: () => {},
    }),
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // 1. Initial press: seekTo promise is deferred while ripple is active
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });
  assert.ok(animCallback, 'Animation timing started and captured');
  assert.equal(audioEvents.includes('play'), false, 'Play is held while seekTo is pending');

  // 2. Background the screen mid-ripple before seekTo resolves
  foregroundState = false;
  view.render();
  assert.ok(audioEvents.includes('pause'), 'Audio paused on backgrounding');

  // 3. Resolve deferred seekTo promises after background cancellation
  const toResolve1 = pendingResolves.slice();
  pendingResolves = [];
  toResolve1.forEach((res) => res());
  await setImmediate();

  assert.equal(audioEvents.includes('play'), false, 'No late player.play after background cancellation');
  assert.equal(replaceCalls.length, 0, 'No navigation while backgrounded');

  // 4. Return to foreground and press again
  foregroundState = true;
  view.render();
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });
  assert.equal(audioEvents.includes('play'), false, 'Play still held while second seekTo is pending');

  // 5. Unmount mid-ripple before second seekTo resolves
  view.unmount();

  // 6. Resolve deferred seekTo promises after unmount
  const toResolve2 = pendingResolves.slice();
  pendingResolves = [];
  toResolve2.forEach((res) => res());
  await setImmediate();

  assert.equal(audioEvents.includes('play'), false, 'No late player.play after unmount');
  assert.equal(replaceCalls.length, 0, 'No navigation after unmount');
});

test('PrologueScreen handles async seekTo rejection without unhandled rejection and navigates exactly once', async () => {
  const replaceCalls = [];
  const audioEvents = [];
  let animCallback = null;

  const playerMock = {
    play: () => audioEvents.push('play'),
    pause: () => audioEvents.push('pause'),
    seekTo: () => Promise.reject(new Error('Audio hardware device busy')),
  };

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
    'expo-audio': {
      useAudioPlayer: () => playerMock,
    },
    __animatedTiming: () => ({
      start: (cb) => { animCallback = cb; },
      stop: () => {},
    }),
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');

  // Tap button with rejecting seekTo
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });

  // Await microtasks to let seekTo rejection handler settle
  await setImmediate();

  // Verify animation was initiated despite seek rejection
  assert.ok(animCallback, 'Animation was started despite seekTo rejection');

  // Complete animation
  animCallback({ finished: true });

  assert.deepEqual(replaceCalls, ['Landing'], 'Navigation replaces to Landing exactly once despite seekTo rejection');
  view.unmount();
});

test('motion tokens obey Premium archetype hierarchy, bounded choreography budgets and enter/exit asymmetry', () => {
  const code = ts.transpileModule(readFileSync(new URL('../src/theme/motion.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const motionExports = {};
  runInNewContext('(function(require, exports){' + code + '\n})')((id) => {
    if (id === 'react-native') {
      return {
        Easing: {
          out: (fn) => fn,
          in: (fn) => fn,
          inOut: (fn) => fn,
          cubic: (t) => t,
          quad: (t) => t,
          linear: (t) => t,
        },
      };
    }
    throw new Error(`Unexpected import: ${id}`);
  }, motionExports);

  const { motionDurations, motionScales, motionSprings } = motionExports;

  // 1. Hierarchy: instant (120) < fast (180) < normal (240) < relaxed (320) < slow (380)
  assert.ok(motionDurations.instant < motionDurations.fast);
  assert.ok(motionDurations.fast < motionDurations.normal);
  assert.ok(motionDurations.normal < motionDurations.relaxed);
  assert.ok(motionDurations.relaxed < motionDurations.slow);
  assert.equal(motionDurations.instant, 120);
  assert.equal(motionDurations.fast, 180);
  assert.equal(motionDurations.normal, 240);
  assert.equal(motionDurations.relaxed, 320);
  assert.equal(motionDurations.slow, 380);
  assert.equal(motionDurations.ambientPulse, 2400);

  // 2. Restrained damping and halo scale
  assert.ok(motionScales.pulseHaloMax <= 1.15, 'Halo scale must not expand aggressively');
  assert.ok(motionSprings.tactilePress.friction >= 18, 'Tactile press requires high damping (friction >= 18)');

  // 3. useEntranceFadeSlide enforces 1/3 distance rule and bounded delay
  let recordedTiming = null;
  class Value {
    constructor(val) { this.val = val; }
    setValue(v) { this.val = v; }
    interpolate(cfg) { this.cfg = cfg; return this; }
  }
  const entrance = mount('../src/hooks/useMotion.ts', { delay: 600, duration: 800, offsetY: 50 }, {
    './MotionPreferences': { useMotionState: () => ({ active: true }) },
    '../theme/motion': motionExports,
    'react-native': {
      Animated: {
        Value,
        timing: (anim, cfg) => {
          recordedTiming = cfg;
          return { start: () => {}, stop: () => {} };
        },
      },
    },
  }, 'useEntranceFadeSlide');

  const rendered = entrance.render();
  // Bound checks: delay clamped to <= 450, duration clamped to <= 500, offsetY clamped to <= 24
  assert.ok(recordedTiming.delay <= 450, `Delay must be bounded to <= 450ms, got ${recordedTiming.delay}`);
  assert.ok(recordedTiming.duration <= 500, `Duration must be bounded to <= 500ms, got ${recordedTiming.duration}`);
  assert.ok(rendered.translateY.cfg.outputRange[0] <= 24, `OffsetY must be bounded within 24dp (1/3 distance rule)`);
  entrance.unmount();
});

test('useEntranceFadeSlide preserves legitimate staggered delays (40, 130, 220, 310ms) and slow duration (380ms) without collapsing to old 100ms/250ms clamps', () => {
  const code = ts.transpileModule(readFileSync(new URL('../src/theme/motion.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const motionExports = {};
  runInNewContext('(function(require, exports){' + code + '\n})')((id) => {
    if (id === 'react-native') {
      return {
        Easing: {
          out: (fn) => fn,
          in: (fn) => fn,
          inOut: (fn) => fn,
          cubic: (t) => t,
          quad: (t) => t,
          linear: (t) => t,
        },
      };
    }
    throw new Error(`Unexpected import: ${id}`);
  }, motionExports);

  const configs = [];
  class Value {
    constructor(val) { this.val = val; }
    setValue(v) { this.val = v; }
    interpolate(cfg) { this.cfg = cfg; return this; }
  }

  const requestedDelays = [40, 130, 220, 310];
  for (const requestedDelay of requestedDelays) {
    const entrance = mount('../src/hooks/useMotion.ts', { delay: requestedDelay, duration: 380 }, {
      './MotionPreferences': { useMotionState: () => ({ active: true }) },
      '../theme/motion': motionExports,
      'react-native': {
        Animated: {
          Value,
          timing: (anim, cfg) => {
            configs.push(cfg);
            return { start: () => {}, stop: () => {} };
          },
        },
      },
    }, 'useEntranceFadeSlide');
    entrance.render();
    entrance.unmount();
  }

  // 1. Durations must preserve 380ms (old bug clamped to 250ms)
  const durations = configs.map((c) => c.duration);
  assert.deepEqual(durations, [380, 380, 380, 380], 'Each section must preserve 380ms duration (cannot clamp to 250ms)');

  // 2. Delays must preserve distinct staggered start times (old bug collapsed delays > 100ms to 100ms -> [40, 100, 100, 100])
  const delays = configs.map((c) => c.delay);
  assert.deepEqual(delays, [40, 130, 220, 310], 'Delays must preserve distinct stagger schedule (cannot collapse 130/220/310ms to 100ms)');

  // 3. Delays must be strictly monotonic (progressively ascending stagger)
  assert.ok(delays[0] < delays[1] && delays[1] < delays[2] && delays[2] < delays[3], 'Stagger cascade must be strictly ascending');
});

test('LandingScreen layout prioritizes alley carousel ahead of compact quote and removes redundant fixed bottom CTA', () => {
  const navigatedRoutes = [];
  let chosenCollection = null;

  const view = mount('../src/screens/LandingScreen.tsx', {
    navigation: {
      navigate: (route, params) => navigatedRoutes.push({ route, params }),
      goBack() {},
      replace() {},
    },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        setCollectionId: (id) => { chosenCollection = id; },
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const tree = view.render();

  // 1. "Xem tất cả" link exists and navigates directly to AlleySelect
  const seeAllBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Xem tất cả con ngõ');
  assert.ok(seeAllBtn, 'See all link rendered with accessible label');
  seeAllBtn.props.onPress();
  assert.deepEqual(navigatedRoutes[0], { route: 'AlleySelect', params: undefined });

  // 2. Direct alley card tap selects collection and navigates to Home
  const firstCard = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel?.startsWith('Khám phá'));
  assert.ok(firstCard, 'Alley preview card rendered in carousel');
  firstCard.props.onPress();
  assert.equal(chosenCollection, 'fiction-letter');
  assert.equal(navigatedRoutes[1].route, 'Home');
  assert.equal(navigatedRoutes[1].params?.alleyId, 'fiction-letter');

  // 3. Compact quote is rendered with proper text
  const quoteMark = elements(tree, 'Text').find((t) => t.props.children === '“');
  assert.ok(quoteMark, 'Compact quote rendered below carousel');

  // 4. No duplicate bottom fixed CTA bar exists
  const oldCtaBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Khám phá ngõ Hà Nội');
  assert.equal(oldCtaBtn, undefined, 'Redundant bottom CTA button removed from LandingScreen');

  view.unmount();
});

test('HomeScreen positions compact selected node preview directly above bottom dock with single story CTA and no duplicate dock center circle', () => {
  const navigatedRoutes = [];
  const selectedNodes = [];

  const props = {
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: (id) => selectedNodes.push(id),
    readNodeIds: new Set(['demo-01']),
    onModeChange() {},
    navigation: {
      navigate: (route) => navigatedRoutes.push(route),
      goBack() {},
    },
    route: { params: {} },
  };

  const view = mount('../src/screens/HomeScreen.tsx', props, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  let tree = view.render();

  // 1. Compact selected node preview is rendered
  const preview = elements(tree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  assert.ok(preview, 'Compact preview card rendered with testID="home-selected-node-preview"');

  // 2. Preview displays selected node name, visit duration, and attribution
  const previewTexts = elements(preview, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(previewTexts.some((text) => text.includes('Cổng ngõ')), 'Preview shows node name');
  assert.ok(previewTexts.some((text) => text.includes('5 phút')), 'Preview shows visit minutes');
  assert.ok(previewTexts.some((text) => text.includes('mô phỏng')), 'Preview indicates simulated duration');
  assert.ok(previewTexts.some((text) => text.includes('Ảnh minh họa')), 'Preview retains photo credit attribution');

  const titleNode = elements(preview, 'Text').find((t) => [].concat(t.props.children).join('') === 'Cổng ngõ');
  assert.ok(titleNode, 'Title node exists');
  assert.equal(titleNode.props.numberOfLines, undefined, 'previewTitle must not restrict numberOfLines to 1 so title wraps at font200');

  // 3. Preview story CTA triggers navigation to Qa
  const storyCta = elements(preview, 'Pressable').find((item) => item.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn');
  assert.ok(storyCta, 'Story CTA rendered on preview card');
  storyCta.props.onPress();
  assert.deepEqual(navigatedRoutes, ['Qa'], 'Story CTA on preview navigates to Qa');

  // 4. Selecting another node updates preview
  tree = view.render({ ...props, currentNodeId: 'demo-02' });
  const preview2 = elements(tree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  const previewTexts2 = elements(preview2, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(previewTexts2.some((text) => text.includes('Hiên đồng hồ')), 'Preview updates to second node');
  assert.ok(previewTexts2.some((text) => text.includes('15 phút')), 'Preview shows updated visit minutes');

  // 5. Dock contains exactly 2 secondary buttons (GPS and Notebook), with NO duplicate center circle button
  const dockButtons = elements(tree, 'Pressable').filter((item) =>
    item.props.accessibilityLabel === 'Xác nhận điểm GPS' ||
    item.props.accessibilityLabel === 'Mở sổ tay ngõ phố'
  );
  assert.equal(dockButtons.length, 2, 'Bottom dock contains GPS and Notebook secondary buttons');

  const oldCenterCircle = elements(tree, 'Pressable').find((item) =>
    item.props.style && [].concat(item.props.style).some((s) => s?.backgroundColor === '#F5ECE0')
  );
  assert.equal(oldCenterCircle, undefined, 'Old duplicate dock center circle button removed');

  // 6. Large font scale (> 1.3) verifies column/stretch layout and omission of secondary metadata
  const largeFontView = mount('../src/screens/HomeScreen.tsx', props, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    __windowDimensions: { width: 400, height: 850, fontScale: 2.0 },
  });
  const largeTree = largeFontView.render();
  const largePreview = elements(largeTree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  assert.ok(largePreview, 'Large font preview rendered');

  const rawPreviewStyle = typeof largePreview.props.style === 'function' ? largePreview.props.style({ pressed: false }) : largePreview.props.style;
  const previewCardStyle = [].concat(rawPreviewStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(previewCardStyle.flexDirection, 'column', 'compactPreviewCardStacked enforces column layout');
  assert.equal(previewCardStyle.alignItems, 'stretch', 'compactPreviewCardStacked stretches children');

  // Verify thumbnail is hidden
  const thumb = elements(largePreview, 'CrossfadePhoto');
  assert.equal(thumb.length, 0, 'Thumbnail is hidden at large fontScale');

  // Verify summary and photo credit are omitted to preserve body scroll room
  const largePreviewTexts = elements(largePreview, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.equal(largePreviewTexts.some((text) => text.includes('Ảnh minh họa')), false, 'Photo credit omitted at large font');

  // Verify full title and CTA still present
  assert.ok(largePreviewTexts.some((text) => text.includes('Cổng ngõ')), 'Title remains visible');
  const largeStoryCta = elements(largePreview, 'Pressable').find((item) => item.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn');
  assert.ok(largeStoryCta, 'Single story CTA remains accessible at large font');

  largeFontView.unmount();
  view.unmount();
});

test('VoiceInteractionDock idle mic button uses subdued moss-green surface to preserve listen-first visual hierarchy', () => {
  let recordingStarted = false;

  const view = mount('../src/components/VoiceInteractionDock.tsx', {
    stage: 'idle',
    error: null,
    recordingDurationMs: 0,
    onStartRecording: () => { recordingStarted = true; },
    onSubmitRecording() {},
    onCancel() {},
    onOpenInput() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../voice/metering': {
      meteringToLevel: () => 0.5,
    },
  });

  const tree = view.render();
  const micBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu hỏi bằng giọng nói');
  assert.ok(micBtn, 'Idle mic button found');

  // Verify background is surface green (#31483A), not player gold (#F2C56B)
  const rawStyle = typeof micBtn.props.style === 'function' ? micBtn.props.style({ pressed: false }) : micBtn.props.style;
  const micStyles = [].concat(rawStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(micStyles.backgroundColor, '#31483A', 'Idle mic button has quiet #31483A surface');
  assert.notEqual(micStyles.backgroundColor, '#F2C56B', 'Idle mic button does not compete with gold listen button');

  // Verify tap starts recording
  micBtn.props.onPress();
  assert.equal(recordingStarted, true, 'Tapping mic button starts recording');

  view.unmount();
});

test('PrologueScreen clips wave flanks to 28dp and deferred seek after navigation never plays audio', async () => {
  const replaceCalls = [];
  const audioEvents = [];
  let animCallback = null;
  let seekResolves = [];

  const playerMock = {
    volume: 1,
    play: () => audioEvents.push('play'),
    pause: () => audioEvents.push('pause'),
    seekTo: () => new Promise((resolve) => seekResolves.push(resolve)),
  };

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
    'expo-audio': {
      useAudioPlayer: () => playerMock,
    },
    __animatedTiming: () => ({
      start: (cb) => { animCallback = cb; },
      stop: () => {},
    }),
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  startBtn.props.onLayout({ nativeEvent: { layout: { width: 240, height: 56 } } });

  // 1. Start Attempt A
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });
  const treeAttemptA = view.render();
  const leftFlank = elements(treeAttemptA, 'View').find((item) => item.props.testID === 'prologue-ripple-left-flank');
  const rightFlank = elements(treeAttemptA, 'View').find((item) => item.props.testID === 'prologue-ripple-right-flank');
  assert.ok(leftFlank && rightFlank, 'Flanks rendered');

  const leftFlankStyle = [].concat(leftFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  const rightFlankStyle = [].concat(rightFlank.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(leftFlankStyle.overflow, 'hidden', 'Left flank clips spread strictly to 28dp');
  assert.equal(rightFlankStyle.overflow, 'hidden', 'Right flank clips spread strictly to 28dp');
  assert.equal(leftFlankStyle.width, 28, 'Left flank width is bounded to 28dp');
  assert.equal(rightFlankStyle.width, 28, 'Right flank width is bounded to 28dp');

  // Complete attempt A animation
  animCallback({ finished: true });
  assert.deepEqual(replaceCalls, ['Landing'], 'Navigated to Landing');

  // 2. Late seekTo resolution after navigation must NEVER trigger player.play()
  const delayedSeeks = seekResolves.slice();
  seekResolves = [];
  delayedSeeks.forEach((r) => r());
  await setImmediate();

  assert.equal(audioEvents.filter((e) => e === 'play').length, 0, 'Late seekTo resolving after navigation never plays audio');

  view.unmount();
});

test('PrologueScreen handles stale interval callbacks without cancelling newer attempt and preserves volume during fade', async () => {
  let timerSeq = 1;
  const timeouts = new Map();
  const intervals = new Map();

  const fakeSetTimeout = (fn, ms) => {
    const id = timerSeq++;
    timeouts.set(id, { fn, ms });
    return id;
  };
  const fakeClearTimeout = (id) => {
    timeouts.delete(id);
  };
  const fakeSetInterval = (fn, ms) => {
    const id = timerSeq++;
    intervals.set(id, { fn, ms });
    return id;
  };
  const fakeClearInterval = (id) => {
    intervals.delete(id);
  };

  const replaceCalls = [];
  const audioEvents = [];
  let seekResolves = [];

  const playerMock = {
    volume: 1,
    play: () => audioEvents.push('play'),
    pause: () => audioEvents.push('pause'),
    seekTo: () => new Promise((resolve) => seekResolves.push(resolve)),
  };

  let motionState = { active: true, reducedMotion: false, foreground: true };

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace: (name) => replaceCalls.push(name) },
  }, {
    '../hooks/MotionPreferences': {
      useMotionState: () => motionState,
    },
    'expo-audio': {
      useAudioPlayer: () => playerMock,
    },
    __animatedTiming: () => ({
      start: () => {},
      stop: () => {},
    }),
    __globals: {
      setTimeout: fakeSetTimeout,
      clearTimeout: fakeClearTimeout,
      setInterval: fakeSetInterval,
      clearInterval: fakeClearInterval,
    },
  });

  const tree = view.render();
  const startBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  startBtn.props.onLayout({ nativeEvent: { layout: { width: 240, height: 56 } } });

  // 1. Start Attempt A and capture seekTo promise
  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });

  assert.equal(seekResolves.length, 1, 'Attempt A triggered seekTo');
  const seekResolvesA = seekResolves.slice();
  seekResolves = [];

  const timeout460EntryA = Array.from(timeouts.entries()).find(([, t]) => t.ms === 460);
  assert.ok(timeout460EntryA, 'Attempt A registered 460ms fade timeout');
  const [timeout460IdA, timeout460A] = timeout460EntryA;

  // Run fadeA
  timeouts.delete(timeout460IdA);
  timeout460A.fn();

  const interval35EntryA = Array.from(intervals.entries()).find(([, t]) => t.ms === 35);
  assert.ok(interval35EntryA, 'fadeA registered 35ms volume interval');
  const [intervalIdA, intervalA] = interval35EntryA;
  const oldCallbackA = intervalA.fn;

  // 2. Foreground false render to cancel Attempt A
  motionState = { active: true, reducedMotion: false, foreground: false };
  view.render();

  assert.equal(intervals.has(intervalIdA), false, 'Interval A cleared upon background cancel');
  seekResolves.forEach((resolve) => resolve());
  seekResolves = [];

  // 3. Foreground true, start Attempt B, run fadeB
  motionState = { active: true, reducedMotion: false, foreground: true };
  view.render();

  startBtn.props.onPress({ nativeEvent: { locationX: 50, locationY: 25 } });

  assert.equal(seekResolves.length, 1, 'Attempt B triggered seekTo');
  const seekResolvesB = seekResolves.slice();
  seekResolves = [];

  const timeout460EntryB = Array.from(timeouts.entries()).find(([, t]) => t.ms === 460);
  assert.ok(timeout460EntryB, 'Attempt B registered 460ms fade timeout');
  const [timeout460IdB, timeout460B] = timeout460EntryB;

  // Run fadeB
  timeouts.delete(timeout460IdB);
  timeout460B.fn();

  const interval35EntryB = Array.from(intervals.entries()).find(([, t]) => t.ms === 35);
  assert.ok(interval35EntryB, 'fadeB registered 35ms volume interval');
  const [intervalIdB, intervalB] = interval35EntryB;

  // 4. Invoke oldA callback => intervalB must remain registered
  oldCallbackA();
  assert.ok(intervals.has(intervalIdB), 'intervalB must remain registered after oldA callback fires');

  // 5. Run B tick => volume .75
  intervalB.fn();
  assert.equal(playerMock.volume, 0.75, 'volume decremented to 0.75 after first B tick');

  // 6. Resolve B deferred seek during fade => volume stays .75 (no reset1)
  seekResolvesB.forEach((resolve) => resolve());
  await setImmediate();
  assert.equal(playerMock.volume, 0.75, 'volume stays 0.75 without resetting to 1 when seek resolves');

  // 7. Navigate B deadline620, resolve old seek => no late play
  const timeout620EntryB = Array.from(timeouts.entries()).find(([, t]) => t.ms === 620);
  assert.ok(timeout620EntryB, 'Attempt B registered 620ms navigation timeout');
  const [timeout620IdB, timeout620B] = timeout620EntryB;

  timeouts.delete(timeout620IdB);
  timeout620B.fn();
  assert.deepEqual(replaceCalls, ['Landing'], 'Navigated to Landing on B deadline 620');

  const playCountAfterB = audioEvents.filter((e) => e === 'play').length;

  seekResolvesA.forEach((resolve) => resolve());
  await setImmediate();

  assert.equal(
    audioEvents.filter((e) => e === 'play').length,
    playCountAfterB,
    'Resolving old seek from Attempt A never triggers late play after navigation'
  );

  // 8. Unmount clears timer handles, no leaks
  view.unmount();
  assert.equal(timeouts.size, 0, 'all timeouts cleared on unmount');
  assert.equal(intervals.size, 0, 'all intervals cleared on unmount');
});

test('PrologueScreen locale switch updates selection, accessible labels, and localized text dynamically', () => {
  let currentLocale = 'vi';
  const setLocaleCalls = [];

  const view = mount('../src/screens/PrologueScreen.tsx', {
    navigation: { replace() {} },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: currentLocale,
        setLocale: (loc) => {
          setLocaleCalls.push(loc);
          currentLocale = loc;
        },
        t: (key, params) => translator.t(currentLocale, key, params),
      }),
    },
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),
    },
  });

  // 1. Initial VI state
  let tree = view.render();
  let langButtons = elements(tree, 'Pressable').filter((item) => item.props.testID === 'locale-switch');
  const viBtn = langButtons.find((b) => b.props.accessibilityLabel === 'Chọn Tiếng Việt');
  const enBtn = langButtons.find((b) => b.props.accessibilityLabel === 'Select English');
  assert.ok(viBtn && enBtn, 'Both language buttons present');
  assert.equal(viBtn.props.accessibilityState.selected, true, 'VI selected initially');
  assert.equal(enBtn.props.accessibilityState.selected, false, 'EN not selected initially');

  // Verify VI localized texts using translator.t
  const viEyebrow = elements(tree, 'Text').find((t) => t.props.children === translator.t('vi', 'prologue.eyebrow'));
  assert.ok(viEyebrow, 'VI eyebrow rendered matching translator.t');
  const viCtaText = elements(tree, 'Text').find((t) => t.props.children === translator.t('vi', 'prologue.start_button'));
  assert.ok(viCtaText, 'VI CTA text rendered matching translator.t');

  // 2. Switch to English
  enBtn.props.onPress();
  assert.deepEqual(setLocaleCalls, ['en'], 'setLocale called with en');

  tree = view.render();
  langButtons = elements(tree, 'Pressable').filter((item) => item.props.testID === 'locale-switch');
  const viBtnAfter = langButtons.find((b) => b.props.accessibilityLabel === 'Chọn Tiếng Việt');
  const enBtnAfter = langButtons.find((b) => b.props.accessibilityLabel === 'Select English');
  assert.equal(viBtnAfter.props.accessibilityState.selected, false, 'VI not selected after switch');
  assert.equal(enBtnAfter.props.accessibilityState.selected, true, 'EN selected after switch');

  // Verify EN localized texts using translator.t
  const enEyebrow = elements(tree, 'Text').find((t) => t.props.children === translator.t('en', 'prologue.eyebrow'));
  assert.ok(enEyebrow, 'EN eyebrow rendered matching translator.t');
  const enCtaText = elements(tree, 'Text').find((t) => t.props.children === translator.t('en', 'prologue.start_button'));
  assert.ok(enCtaText, 'EN CTA text rendered matching translator.t');
  const enCtaBtn = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === translator.t('en', 'prologue.start_label'));
  assert.ok(enCtaBtn, 'EN CTA button has localized accessibilityLabel matching translator.t');

  view.unmount();
});

test('QaScreen drawer uses short input placeholder while preserving rich contextual accessibility label and lighter reader toggle', () => {
  const qaProps = {
    currentNode: fixture.nodes[0],
    nodeQa: fixture.qa.filter((q) => q.nodeId === fixture.nodes[0].id),
    dataset: fixture,
    collectionId: 'fiction-letter',
    datasetRevision: 'rev-test',
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

  const view = mount('../src/screens/QaScreen.tsx', qaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'fiction-letter',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const tree = view.render();

  // 1. ExpandableInputDrawer receives short placeholder and contextual accessible title
  const drawer = elements(tree, 'ExpandableInputDrawer')[0];
  assert.ok(drawer, 'ExpandableInputDrawer rendered in QaScreen');
  assert.equal(drawer.props.placeholder, 'Gõ câu hỏi…', 'Placeholder is short single-line hint');
  assert.equal(drawer.props.title, 'Hỏi về Cổng ngõ…', 'Drawer title carries rich contextual stop name for accessibility');

  // 2. readerToggle uses light parchment styling rather than heavy solid dark block
  const readerToggle = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Xem lời kể bằng chữ');
  assert.ok(readerToggle, 'Reader toggle button found');
  const rawToggleStyle = typeof readerToggle.props.style === 'function' ? readerToggle.props.style({ pressed: false }) : readerToggle.props.style;
  const toggleStyle = [].concat(rawToggleStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(toggleStyle.backgroundColor, '#F7EFE1', 'Reader toggle has light parchment #F7EFE1 surface');
  assert.equal(toggleStyle.borderColor, '#DFD1BD', 'Reader toggle has subtle border');

  // 3. Question chips use lighter surface and border without heavy pill elevation
  const chips = elements(tree, 'Pressable').filter((item) => item.props.accessibilityLabel?.startsWith('Hỏi:'));
  assert.ok(chips.length > 0, 'Question chips rendered');
  const rawChipStyle = typeof chips[0].props.style === 'function' ? chips[0].props.style({ pressed: false }) : chips[0].props.style;
  const firstChipStyle = [].concat(rawChipStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.equal(firstChipStyle.backgroundColor, 'rgba(255, 253, 247, 0.94)', 'Chip has light editorial surface');
  assert.equal(firstChipStyle.borderRadius, 14, 'Chip has softened radius 14 instead of heavy pill');

  // 4. All readerToggle text icons use consistent deep green #2D5748
  const textIcons = elements(tree, 'AppIcon').filter((icon) => icon.props.name === 'text');
  assert.ok(textIcons.length >= 1, 'At least one text icon rendered');
  assert.ok(textIcons.every((icon) => icon.props.color === '#2D5748'), 'All readerToggle text icons use consistent deep green #2D5748');

  view.unmount();
});

test('QaScreen Three Lenses multi-chapter journey mounts chapter tabs, updates story/photo/QA on the same node, dispatches intro/story audio, and clears old playback and answers on chapter switch', () => {
  const threeLensesViCore = JSON.parse(readFileSync(new URL('../../data/localized/three-lenses.vi.json', import.meta.url), 'utf8'));
  const viRev = threeLensesModule.getThreeLensesDatasetRevision('vi');
  const dongXuanNode = threeLensesViCore.nodes.find((n) => n.id === 'oldquarter-dong-xuan');
  const dongXuanQa = threeLensesViCore.qa.filter((q) => q.nodeId === 'oldquarter-dong-xuan');

  let transcript;
  const playedTracks = [];
  let stoppedPlaybackCount = 0;
  const voiceSession = {
    stage: 'idle',
    error: null,
    recordingDurationMs: 0,
    metering: -60,
    playback: { playing: false, currentTime: 0, duration: 45 },
    activeTrackId: null,
    playbackError: null,
    startRecording() {},
    submitRecording() {},
    cancel() {},
    stopPlayback() {
      stoppedPlaybackCount++;
      voiceSession.playback.playing = false;
      voiceSession.activeTrackId = null;
    },
    playTrack(id, text, kind, nodeId) {
      playedTracks.push({ id, text, kind, nodeId, type: 'play' });
      voiceSession.activeTrackId = id;
    },
    replayTrack(id, text, kind, nodeId) {
      playedTracks.push({ id, text, kind, nodeId, type: 'replay' });
      voiceSession.activeTrackId = id;
    },
  };

  const sharedOverrides = {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-three-lenses',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../data/threeLensesCompanion': threeLensesModule,
    './src/data/threeLensesCompanion': threeLensesModule,
    '../voice/useVoiceSession': {
      useVoiceSession: (options) => {
        transcript = options?.onTranscript;
        return voiceSession;
      },
    },
    '../voice/localizedCatalog': {
      voiceCatalogueRevision: '32e1553d10078b5e6e3c0f4df21921c5fa624aef6d2671ae818a77a94413e117',
      lookupVoiceTrack: ({ contentId }) => ({
        id: contentId,
        kind: contentId === 'intro' ? 'intro' : 'story',
        source: 1,
        textHash: 'hash',
        durationSeconds: 30,
      }),
    },
    '../assets/photoMap': {
      getNodePhoto: (_nodeId, photoKey) => ({ uri: photoKey ?? 'default' }),
      getNodePhotographer: () => 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
      HERO_PHOTO: { uri: 'hero' },
    },
  };

  let selectedNodeId = dongXuanNode.id;
  const qaProps = {
    currentNodeId: dongXuanNode.id,
    currentNode: dongXuanNode,
    nodeQa: dongXuanQa,
    dataset: threeLensesViCore,
    collectionId: 'old-quarter-three-lenses',
    datasetRevision: viRev,
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode(id) { selectedNodeId = id; },
    onAskQuestion() {},
    onModeChange() {},
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  };

  const view = mount('../src/screens/QaScreen.tsx', qaProps, sharedOverrides);
  let tree = view.render();

  // 1. Verify 3 Đồng Xuân chapter buttons (tabs) are rendered with correct titles
  const chapterTabs = elements(tree, 'Pressable').filter((p) => p.props.accessibilityRole === 'tab');
  assert.equal(chapterTabs.length, 3, 'Must render 3 chapter buttons for Đồng Xuân node');
  assert.equal(chapterTabs[0].props.accessibilityLabel, 'Chợ Đồng Xuân: hơn một thế kỷ thay đổi');
  assert.equal(chapterTabs[1].props.accessibilityLabel, 'Ngọn lửa năm 1994');
  assert.equal(chapterTabs[2].props.accessibilityLabel, 'Nhịp sống bên hông chợ');
  assert.equal(chapterTabs[0].props.accessibilityState?.selected, true, 'Chapter 1 (Timeline) is selected initially');

  // Verify initial chapter (Timeline) text, photo, and QA chips
  const rootsPhoto = elements(tree, 'ImageBackground')[0].props.source;
  const initialChips = elements(tree, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Hỏi:'));
  assert.equal(initialChips.length, 3, 'Timeline chapter displays its 3 mapped QA chips');
  assert.ok(JSON.stringify(tree).includes('1890'), 'Timeline chapter contains 1890 foundation history');

  // 2. Click Chapter 2 (Ngọn lửa năm 1994): verify story text, photo, and QA update WITHOUT changing currentNode
  chapterTabs[1].props.onPress();
  tree = view.render();

  assert.equal(selectedNodeId, dongXuanNode.id, 'Node does NOT change when switching chapters');
  assert.equal(elements(tree, 'Pressable').filter((p) => p.props.accessibilityRole === 'tab')[1].props.accessibilityState?.selected, true);
  const firePhoto = elements(tree, 'ImageBackground')[0].props.source;
  assert.notEqual(firePhoto.uri, rootsPhoto.uri, 'Background photo updates to Fire chapter photo');
  assert.ok(JSON.stringify(tree).includes('1994'), 'Story updates to Fire chapter content');

  const fireChips = elements(tree, 'Pressable').filter((p) => p.props.accessibilityLabel?.startsWith('Hỏi:'));
  assert.equal(fireChips.length, 3, 'Fire chapter displays its 3 mapped QA chips');
  const fireQuestions = fireChips.map((c) => c.props.accessibilityLabel);
  assert.ok(fireQuestions.some((q) => q.includes('cháy')), 'Fire QA chips include fire question');

  // Play Fire chapter audio to establish lastTrack.current
  const playerBarFire = elements(tree, 'VoicePlayerBar')[0];
  assert.ok(playerBarFire, 'VoicePlayerBar is present for Fire chapter');
  playerBarFire.props.onPlay();
  const firePlay = playedTracks[playedTracks.length - 1];
  assert.equal(firePlay.id, 'oldquarter-dong-xuan-fire-story');

  // 3. Select a suggestion in Chapter 2, reveal answer, set playing = true, then switch to Chapter 3
  const fireQa = dongXuanQa.find((q) => q.id === 'dx-fire');
  assert.ok(fireQa, 'dx-fire question exists');
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion(fireQa.question);
  tree = view.render();

  // Reveal answer via reader toggle
  const showTextBtn = elements(tree, 'Pressable').find((p) =>
    elements(p, 'Text').some((t) => t.props.children === 'Xem lời kể bằng chữ')
  );
  showTextBtn?.props.onPress();
  tree = view.render();
  assert.ok(JSON.stringify(tree).includes(fireQa.answer), 'Fire answer is revealed');

  // Set playback playing
  voiceSession.playback.playing = true;
  stoppedPlaybackCount = 0;

  // Now switch to Chapter 3 (Nhịp sống bên hông chợ)
  const tabsRecheck = elements(tree, 'Pressable').filter((p) => p.props.accessibilityRole === 'tab');
  tabsRecheck[2].props.onPress();
  tree = view.render();

  assert.ok(stoppedPlaybackCount > 0, 'Switching chapter immediately cancels/stops active voice playback');
  assert.equal(JSON.stringify(tree).includes(fireQa.answer), false, 'Old answer from previous chapter is cleared');
  assert.equal(selectedNodeId, dongXuanNode.id, 'Node remains unchanged');
  assert.ok(JSON.stringify(tree).includes('bên hông chợ') || JSON.stringify(tree).includes('nhịp sống'), 'Story updates to street life chapter');

  // Issue replay intent after changing chapter on same node:
  // Since handleSelectChapter cleared lastTrack.current, replay plays the NEW chapter 3 story instead of old chapter 2 / answer
  assert.ok(typeof transcript === 'function', 'Voice transcript handler was registered');
  transcript('nghe lại', {
    turnId: 'turn-replay-dx',
    scope: `demo:${viRev}:${dongXuanNode.id}`,
    nodeId: dongXuanNode.id,
    mode: 'demo',
    datasetRevision: viRev,
  });
  tree = view.render();

  const replayPlay = playedTracks[playedTracks.length - 1];
  assert.equal(replayPlay.type, 'replay', 'Replay intent triggers replayTrack');
  assert.equal(replayPlay.id, 'oldquarter-dong-xuan-street-story', 'Replay receives new selected chapter contentId');
  assert.equal(replayPlay.nodeId, dongXuanNode.id, 'Replay preserves physical nodeId');
  const streetChapter = threeLensesModule.getThreeLensesCompanion('vi').chapters.find((c) => c.id === 'dong-xuan-street');
  assert.ok(streetChapter, 'Street life chapter exists in companion');
  assert.equal(replayPlay.text, streetChapter.text, 'Replay receives new selected chapter text');

  // 4. Test closing requesting kind: 'story' on final node
  const closingBtn = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Những câu chuyện vẫn tiếp diễn');
  assert.ok(closingBtn, 'Closing button is available');
  closingBtn.props.onPress();
  tree = view.render();

  const playerBarClosing = elements(tree, 'VoicePlayerBar')[0];
  assert.ok(playerBarClosing, 'VoicePlayerBar is present for closing');
  playerBarClosing.props.onPlay();
  const closingPlay = playedTracks[playedTracks.length - 1];
  assert.equal(closingPlay.id, 'oldquarter-dong-xuan-closing-story');
  assert.equal(closingPlay.kind, 'story', 'Closing audio play requests kind: story');

  // 5. Test opening play requesting kind: 'intro'
  const openingBtn = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Phần mở đầu');
  assert.ok(openingBtn, 'Opening narration button is available');
  openingBtn.props.onPress();
  tree = view.render();

  assert.ok(threeLensesViCore.intro?.text, 'Intro text exists in core dataset');
  assert.ok(elements(tree, 'Text').some((t) => t.props.children === threeLensesViCore.intro.text), 'Opening narration intro.text is displayed in story card');
  assert.equal(selectedNodeId, dongXuanNode.id, 'Physical node remains unchanged during opening narration');
  assert.equal(qaProps.currentNodeId, dongXuanNode.id, 'Props currentNodeId is unchanged');

  const playerBarOpening = elements(tree, 'VoicePlayerBar')[0];
  assert.ok(playerBarOpening, 'VoicePlayerBar rendered for opening intro');
  playerBarOpening.props.onPlay();
  const openingPlay = playedTracks[playedTracks.length - 1];
  assert.equal(openingPlay.id, 'intro');
  assert.equal(openingPlay.kind, 'intro', 'Opening audio play requests kind: intro');
  assert.equal(openingPlay.text, threeLensesViCore.intro.text, 'Opening audio play text matches core intro.text');
  assert.equal(openingPlay.nodeId, dongXuanNode.id, 'Opening audio play nodeId matches current physical node');

  view.unmount();

  // 6. Test transition play requesting kind: 'story' on Bach Ma node
  const bachMaNode = threeLensesViCore.nodes.find((n) => n.id === 'oldquarter-bach-ma');
  const viewBachMa = mount('../src/screens/QaScreen.tsx', {
    ...qaProps,
    currentNodeId: bachMaNode.id,
    currentNode: bachMaNode,
    nodeQa: threeLensesViCore.qa.filter((q) => q.nodeId === bachMaNode.id),
  }, sharedOverrides);
  let treeBachMa = viewBachMa.render();

  const transBtn = elements(treeBachMa, 'Pressable').find((p) => p.props.accessibilityLabel === 'Chuyển đoạn');
  assert.ok(transBtn, 'Transition button is available on Bach Ma stop');
  transBtn.props.onPress();
  treeBachMa = viewBachMa.render();

  const playerBarTrans = elements(treeBachMa, 'VoicePlayerBar')[0];
  assert.ok(playerBarTrans, 'VoicePlayerBar is present for transition');
  playerBarTrans.props.onPlay();
  const transPlay = playedTracks[playedTracks.length - 1];
  assert.equal(transPlay.id, 'oldquarter-bach-ma-transition-story');
  assert.equal(transPlay.kind, 'story', 'Transition audio play requests kind: story');

  viewBachMa.unmount();
});

test('switching chapters cancels a pending deferred automatic answer playback', async () => {
  const threeLensesViCore = JSON.parse(readFileSync(new URL('../../data/localized/three-lenses.vi.json', import.meta.url), 'utf8'));
  const viRev = threeLensesModule.getThreeLensesDatasetRevision('vi');
  const dongXuanNode = threeLensesViCore.nodes.find((n) => n.id === 'oldquarter-dong-xuan');
  const dongXuanQa = threeLensesViCore.qa.filter((q) => q.nodeId === 'oldquarter-dong-xuan');

  let transcript;
  let finishStop;
  const played = [];
  const playbackStopped = new Promise((resolve) => { finishStop = resolve; });

  const voiceSession = {
    stage: 'idle',
    error: null,
    recordingDurationMs: 0,
    metering: -60,
    playback: { playing: false, currentTime: 0, duration: 0 },
    activeTrackId: null,
    playbackError: null,
    startRecording() {},
    submitRecording() {},
    cancel() {},
    stopPlayback: () => playbackStopped,
    playTrack(...args) { played.push(args); },
    replayTrack() {},
  };

  const sharedOverrides = {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        collectionId: 'old-quarter-three-lenses',
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../data/threeLensesCompanion': threeLensesModule,
    './src/data/threeLensesCompanion': threeLensesModule,
    '../voice/useVoiceSession': {
      useVoiceSession: (options) => {
        transcript = options.onTranscript;
        return voiceSession;
      },
    },
    '../voice/localizedCatalog': {
      voiceCatalogueRevision: '32e1553d10078b5e6e3c0f4df21921c5fa624aef6d2671ae818a77a94413e117',
      lookupVoiceTrack: ({ contentId }) => ({
        id: contentId,
        kind: 'answer',
        source: 1,
        textHash: 'hash',
        durationSeconds: 15,
      }),
    },
    '../assets/photoMap': {
      getNodePhoto: (_nodeId, photoKey) => ({ uri: photoKey ?? 'default' }),
      getNodePhotographer: () => 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)',
      HERO_PHOTO: { uri: 'hero' },
    },
  };

  const view = mount('../src/screens/QaScreen.tsx', {
    currentNodeId: dongXuanNode.id,
    currentNode: dongXuanNode,
    nodeQa: dongXuanQa,
    dataset: threeLensesViCore,
    collectionId: 'old-quarter-three-lenses',
    datasetRevision: viRev,
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode() {},
    onAskQuestion() {},
    onModeChange() {},
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  }, sharedOverrides);

  let tree = view.render();
  const firstQa = dongXuanQa[0];
  assert.ok(firstQa, 'First Dong Xuan QA exists');

  // Trigger voice transcript for question while playback.playing is false, queueing answer playback behind playbackStopped promise
  transcript(firstQa.question, {
    turnId: 'turn-1',
    scope: `demo:${viRev}:${dongXuanNode.id}`,
    nodeId: dongXuanNode.id,
    mode: 'demo',
    datasetRevision: viRev,
  });

  // User selects Chapter 2 before the old stopPlayback promise resolves
  const chapterTabs = elements(tree, 'Pressable').filter((p) => p.props.accessibilityRole === 'tab');
  assert.equal(chapterTabs.length, 3, 'Must render 3 chapter tabs');
  chapterTabs[1].props.onPress();
  tree = view.render();
  assert.equal(elements(tree, 'Pressable').filter((p) => p.props.accessibilityRole === 'tab')[1].props.accessibilityState?.selected, true);

  // Now resolve the old pending stop promise
  finishStop(true);
  await Promise.resolve();

  // Assert that old answer playback was cancelled and never starts
  assert.equal(played.length, 0, 'Switching chapter cancels pending deferred automatic answer playback');
  view.unmount();
});
