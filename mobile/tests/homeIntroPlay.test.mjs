import { nodeVisualModule, visualComponentStubs } from './helpers/nodeVisualModules.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';
import * as translator from '../src/i18n/translator.ts';
import * as sources from '../src/data/sourceState.ts';
import * as alleyGeometry from '../src/utils/alleyGeometry.ts';

// 1. Load actual collections
const actualCollectionsCode = ts.transpileModule(readFileSync(new URL('../src/data/collections.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const actualCollectionsMod = { exports: {} };
runInNewContext('(function(require,module,exports){' + actualCollectionsCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (id === '../assets/nodeVisual') return nodeVisualModule;
    if (id.endsWith('/HeritageSketchPlaceholder')) return visualComponentStubs;
  if (id === 'react-native') return {};
  if (id === './locale') return { isLocale: (v) => v === 'vi' || v === 'en' };
  if (id === './threeLensesCompanion.ts' || id === './threeLensesCompanion') return { getThreeLensesDatasetRevision: () => 'three-lenses-rev', THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses' };
  if (id === './sourceState') return sources;
  if (id === '../assets/photoMap') return { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'Demo' };
  if (id === '../i18n/translator' || id === './src/i18n/translator') return translator;
  if (id.endsWith('.json')) {
    const fileUrl = new URL(id, new URL('../src/data/collections.ts', import.meta.url));
    return JSON.parse(readFileSync(fileUrl, 'utf8'));
  }
  if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return id;
  throw new Error('Unexpected import in collections.ts: ' + id);
}, actualCollectionsMod, actualCollectionsMod.exports);

const { AVAILABLE_COLLECTIONS, getLocalizedCollections, getBundledDataset, getCollectionRevision } = actualCollectionsMod.exports;

// 2. Load actual voice catalog & localizedCatalog
globalThis.require = (path) => path;
const { lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts');

function createTestMount(file, defaultProps = {}, overrides = {}) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pending = [];
  let tree;

  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const element = (type, props) => (typeof type === 'function' ? type(props) : { type, props });

  const react = {
    createContext: (value) => ({ value, Provider: 'LocaleProvider' }),
    useContext: (ctx) => ctx.value,
    useRef(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: { current: initial } };
      return slots[i].value;
    },
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [
        slots[i].value,
        (next) => {
          const value = typeof next === 'function' ? next(slots[i].value) : next;
          if (!Object.is(value, slots[i].value)) {
            slots[i].value = value;
            dirty = true;
          }
        },
      ];
    },
    useEffect(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) {
        pending.push(() => {
          slots[i]?.cleanup?.();
          slots[i] = { deps, cleanup: callback() };
        });
      }
    },
    useCallback(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, callback };
      return slots[i].callback;
    },
  };

  const rnDefaults = {
    StyleSheet: { create: (s) => s, absoluteFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } },
    Platform: { OS: 'android' },
    useWindowDimensions: () => overrides.__windowDimensions ?? { width: 400, height: 850, fontScale: 1.0 },
    Animated: {
      View: 'Animated.View',
      Image: 'Animated.Image',
      Value: class {
        constructor(v) { this.val = v; }
        interpolate() { return this; }
        setValue(v) { this.val = v; }
        stopAnimation(cb) { cb?.(this.val); }
      },
      timing(v, cfg) {
        return { start: (cb) => { v.setValue(cfg.toValue); cb?.({ finished: true }); }, stop() {} };
      },
      spring(v, cfg) {
        return { start: (cb) => { v.setValue(cfg.toValue); cb?.({ finished: true }); }, stop() {} };
      },
    },
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    View: 'View',
    Text: 'Text',
    Modal: 'Modal',
    Image: 'Image',
    ImageBackground: 'ImageBackground',
  };

  const rn = { ...rnDefaults, ...(overrides['react-native'] ?? {}) };
  const jsxRuntime = { jsx: element, jsxs: element };

  const audioEvents = overrides.__audioEvents ?? [];
  let playingState = overrides.__initialPlaying ?? false;
  const mockPlayer = overrides.__mockPlayer ?? {
    loop: false,
    playing: playingState,
    play() { playingState = true; audioEvents.push('play'); },
    pause() { playingState = false; audioEvents.push('pause'); },
    replace(src) { audioEvents.push({ replace: src }); },
  };

  const modules = {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react/jsx-dev-runtime': jsxRuntime,
    'react-native': rn,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    },
    'expo-audio': {
      setAudioModeAsync: async (mode) => { audioEvents.push({ audioMode: mode }); },
      useAudioPlayer: () => mockPlayer,
      useAudioPlayerStatus: () => ({ playing: playingState, currentTime: 0, duration: 40 }),
      ...(overrides['expo-audio'] ?? {}),
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack,
      ...(overrides['../voice/localizedCatalog'] ?? {}),
    },
    '../context/LocaleContext': overrides['../context/LocaleContext'] ?? {
      useLocale: () => ({
        locale: overrides.__locale ?? 'vi',
        setLocale: () => {},
        collectionId: defaultProps.route?.params?.alleyId ?? 'ngo-trung-yen',
        setCollectionId: () => {},
        t: (key, params) => translator.t(overrides.__locale ?? 'vi', key, params),
      }),
    },
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ foreground: true, reducedMotion: false, active: true }),
      useMotionPreferences: () => ({ reducedMotion: false }),
    },
    '../hooks/useMotion': {
      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
    },
    '../data/collections': {
      AVAILABLE_COLLECTIONS,
      getLocalizedCollections,
      getBundledDataset,
      getCollectionRevision,
      DEFAULT_COLLECTION_ID: 'ngo-trung-yen',
      isCollectionId: (id) => AVAILABLE_COLLECTIONS.some((c) => c.id === id),
    },
    '../data/sourceState': sources,
    '../assets/photoMap': {
      HERO_PHOTO: 1,
      getNodePhoto: () => 1,
      getNodePhotographer: () => 'Nhiếp ảnh gia',
      getAlleyMeta: (id) => ({ name: id ?? 'Ngõ Trung Yên', coverPhoto: 1, photographer: 'Nhiếp ảnh gia' }),
    },
    '../theme': {
      colors: { primary: '#2D5748', terracotta: '#C85A32', text: '#2C221E' },
      radius: { sm: 4, md: 8, lg: 16, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24 },
      typography: { micro: {}, titleLarge: {}, body: {} },
    },
    '../theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380 },
      motionSprings: { tactilePress: {}, gentleSlide: {} },
      motionEasings: { gentleOut: (t) => t, accelerate: (t) => t },
      motionScales: { pressedButton: 0.97, pressedCard: 0.975 },
    },
    '../components/AppIcon': { AppIcon: 'AppIcon' },
    '@react-navigation/native': {
      useIsFocused: () => true,
      useNavigation: () => ({ navigate: () => {}, goBack: () => {} }),
    },
    'react-native-svg': { default: 'Svg', Path: 'Path', Defs: 'Defs', LinearGradient: 'LinearGradient', Stop: 'Stop', __esModule: true },
    '../qa/match': { findAnswer: () => ({ status: 'none' }) },
    '../recommendation/pick': { pickPoints: () => [] },
    '../data/threeLensesCompanion': { getScopedCompanion: () => null, THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses' },
    '../voice/intent': { parseVoiceIntent: () => ({ type: 'none' }), resolveFirstOptionReference: () => ({ type: 'none' }) },
    '../voice/performance': { recordVoicePerformance: () => {}, voicePerformanceNow: () => 0 },
    '../utils/imagePerformanceDiagnostics': {
      createImagePerfFirstLayoutReporter: () => () => {},
      recordImagePerfLoadEnd: () => {}, recordImagePerfLoadError: () => {}, recordImagePerfLoadStart: () => {},
      recordImagePerfLoadSuccess: () => {}, recordImagePerfNavigationTap: () => {}, recordImagePerfScreenFocus: () => {},
    },
    '../components/VoicePlayerBar': { VoicePlayerBar: (props) => ({ type: 'VoicePlayerBar', props }) },
    '../components/VoiceInteractionDock': { VoiceInteractionDock: 'VoiceInteractionDock' },
    '../components/ExpandableInputDrawer': { ExpandableInputDrawer: 'ExpandableInputDrawer' },
    '../utils/alleyGeometry': alleyGeometry,
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== 'expo-audio')),
  };

  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (id === '../assets/nodeVisual') return nodeVisualModule;
    if (id.endsWith('/HeritageSketchPlaceholder')) return visualComponentStubs;
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return id;
    if (/\/components\//.test(id) || id.startsWith('./') || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1).replace(/\.tsx?$/, '');
      return { [name]: name, default: name, AppIcon: 'AppIcon', UnavailableScreen: 'UnavailableScreen', CrossfadePhoto: 'CrossfadePhoto', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection', AlleyTrailView: 'AlleyTrailView' };
    }
    if (id.includes('alleyGuide')) {
      const dataset = defaultProps.source?.dataset ?? getBundledDataset(defaultProps.route?.params?.alleyId ?? 'ngo-trung-yen', overrides.__locale ?? 'vi');
      return {
        readAlleyStory: () => dataset?.intro ? { title: 'Về con ngõ', paragraphs: [dataset.intro.text] } : null,
        readAlleyGuide: () => null,
      };
    }
    throw new Error(`Unexpected import in test mount: ${id}`);
  }, screenMod, screenMod.exports);

  const component = screenMod.exports.HomeScreen ?? screenMod.exports.QaScreen ?? Object.values(screenMod.exports)[0];

  let currentProps = { ...defaultProps };
  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      dirty = true;
      let iterations = 0;
      while (dirty && iterations < 20) {
        dirty = false;
        cursor = 0;
        pending = [];
        tree = component(currentProps);
        for (const effect of pending) effect();
        iterations++;
      }
      return tree;
    },
    unmount() {
      slots.forEach((s) => s?.cleanup?.());
    },
    audioEvents,
    mockPlayer,
  };
}

function elements(node, type) {
  const result = [];
  if (!node) return result;
  if (Array.isArray(node)) {
    for (const item of node) result.push(...elements(item, type));
    return result;
  }
  if (node.type === type) result.push(node);
  if (Array.isArray(node.props?.children)) {
    for (const child of node.props.children) result.push(...elements(child, type));
  } else if (node.props?.children) {
    result.push(...elements(node.props.children, type));
  }
  return result;
}

// ------------------- TESTS -------------------

const VI_VOICE_ALLEYS = ['ngo-trung-yen', 'ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc'];

for (const change of ['blur', 'unmount', 'locale', 'collection', 'mode', 'background']) {
  test(`pending Home intro is invalidated by ${change} and can play after reentry`, async () => {
    let resolveMode;
    const prepared = new Promise((resolve) => { resolveMode = resolve; });
    let locale = 'vi';
    let foreground = true;
    const listeners = new Map();
    const events = [];
    const dataset = getBundledDataset('ngo-trung-yen', 'vi');
    const mount = createTestMount('../src/screens/HomeScreen.tsx', {
      mode: 'demo', source: sources.getSourceState('demo', dataset, 'vi'),
      route: { params: { alleyId: 'ngo-trung-yen' } }, currentNodeId: dataset.startNodeId,
      readNodeIds: new Set(), onSelectNode() {}, onModeChange() {},
      navigation: { navigate() {}, goBack() {}, addListener(event, cb) {
        listeners.set(event, cb); return () => listeners.delete(event);
      } },
    }, {
      __audioEvents: events,
      'expo-audio': { setAudioModeAsync: () => prepared },
      '../context/LocaleContext': { useLocale: () => ({ locale, setLocale() {}, t: (key, params) => translator.t(locale, key, params) }) },
      '../hooks/MotionPreferences': { useMotionState: () => ({ foreground, active: foreground, reducedMotion: false }) },
    });
    const play = (tree) => elements(tree, 'Pressable').find((p) => p.props.testID === 'home-intro-play');
    const initial = mount.render();
    const pendingPlay = play(initial).props.onPress();
    // Duplicate input while preparation is pending must not launch another play.
    await play(initial).props.onPress();
    if (change === 'blur') listeners.get('blur')();
    if (change === 'unmount') mount.unmount();
    if (change === 'locale') { locale = 'en'; mount.render(); }
    if (change === 'collection') mount.render({ route: { params: { alleyId: 'ngo-tam-thuong' } } });
    if (change === 'mode') mount.render({ mode: 'live' });
    if (change === 'background') { foreground = false; mount.render(); }
    resolveMode();
    await pendingPlay;
    assert.equal(events.filter((e) => e === 'play').length, 0);
    assert.equal(events.filter((e) => typeof e === 'object' && 'replace' in e).length, 0);
    if (change === 'unmount') {
      assert.equal(listeners.size, 0, 'both listeners removed');
      return;
    }
    if (change === 'blur') listeners.get('focus')();
    foreground = true;
    const tree = mount.render();
    assert.equal(events.filter((e) => e === 'play').length, 0, 'return never autoplays');
    await play(tree).props.onPress();
    assert.equal(events.filter((e) => e === 'play').length, 1, 'explicit new Play works');
    mount.unmount();
    assert.equal(listeners.size, 0);
  });
}

test('Home coalesces double Play during preparation and reduced motion permits audio', async () => {
  let resolveMode;
  const prepared = new Promise((resolve) => { resolveMode = resolve; });
  const events = [];
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    mode: 'demo', source: sources.getSourceState('demo', dataset), route: { params: { alleyId: 'ngo-trung-yen' } },
    navigation: { navigate() {}, goBack() {} }, readNodeIds: new Set(), onSelectNode() {}, onModeChange() {},
  }, { __audioEvents: events, 'expo-audio': { setAudioModeAsync: () => prepared },
    '../hooks/MotionPreferences': { useMotionState: () => ({ foreground: true, active: false, reducedMotion: true }) } });
  const button = elements(mount.render(), 'Pressable').find((p) => p.props.testID === 'home-intro-play');
  const first = button.props.onPress();
  await button.props.onPress();
  resolveMode(); await first;
  assert.equal(events.filter((e) => e === 'play').length, 1);
  mount.unmount();
});

test('a stale Home preparation cannot clear a newer pending Play', async () => {
  const resolvers = [];
  const listeners = new Map();
  const events = [];
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    mode: 'demo', source: sources.getSourceState('demo', dataset), route: { params: { alleyId: 'ngo-trung-yen' } },
    navigation: { navigate() {}, addListener(event, cb) { listeners.set(event, cb); return () => listeners.delete(event); } },
    readNodeIds: new Set(), onSelectNode() {}, onModeChange() {},
  }, { __audioEvents: events, 'expo-audio': { setAudioModeAsync: () => new Promise((resolve) => resolvers.push(resolve)) } });
  const button = elements(mount.render(), 'Pressable').find((p) => p.props.testID === 'home-intro-play');
  const oldPlay = button.props.onPress();
  listeners.get('blur')(); listeners.get('focus')();
  const newPlay = button.props.onPress();
  resolvers[0](); await oldPlay;
  await button.props.onPress();
  assert.equal(resolvers.length, 2, 'new request is still pending after stale completion');
  resolvers[1](); await newPlay;
  assert.equal(events.filter((e) => e === 'play').length, 1);
  mount.unmount();
});

test('HomeScreen: intro play button is present for all 4 VI voice alleys with touch target >= 44', () => {
  for (const alleyId of VI_VOICE_ALLEYS) {
    const dataset = getBundledDataset(alleyId, 'vi');
    const source = sources.getSourceState('demo', dataset, 'vi');

    const mount = createTestMount('../src/screens/HomeScreen.tsx', {
      navigation: { navigate: () => {}, goBack: () => {}, addListener: () => () => {} },
      route: { params: { alleyId } },
      mode: 'demo',
      source,
      currentNodeId: dataset.startNodeId ?? dataset.nodes[0]?.id,
      onSelectNode: () => {},
      readNodeIds: new Set(),
      onModeChange: () => {},
    }, { __locale: 'vi' });

    const tree = mount.render();
    const playBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'home-intro-play');
    assert.ok(playBtn, `home-intro-play button is present for ${alleyId}`);
    assert.equal(playBtn.props.accessibilityRole, 'button');
    assert.equal(playBtn.props.accessibilityLabel, 'Nghe giới thiệu ngõ');

    const resolvedStyle = typeof playBtn.props.style === 'function' ? playBtn.props.style({ pressed: false }) : playBtn.props.style;
    const style = Array.isArray(resolvedStyle) ? Object.assign({}, ...resolvedStyle) : resolvedStyle;
    assert.ok(style.minHeight >= 44, `minHeight >= 44 for ${alleyId}`);
    assert.ok(style.minWidth >= 44, `minWidth >= 44 for ${alleyId}`);

    mount.unmount();
  }
});

test('HomeScreen: intro play button is ABSENT for ngo-gach which has no voice track (fallback: text stays)', () => {
  const dataset = getBundledDataset('ngo-gach', 'vi');
  const source = sources.getSourceState('demo', dataset, 'vi');

  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate: () => {}, goBack: () => {}, addListener: () => () => {} },
    route: { params: { alleyId: 'ngo-gach' } },
    mode: 'demo',
    source,
    currentNodeId: dataset.startNodeId ?? dataset.nodes[0]?.id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, { __locale: 'vi' });

  const tree = mount.render();
  const playBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'home-intro-play');
  assert.equal(playBtn, undefined, 'home-intro-play button is absent for ngo-gach');

  const alleyStoryBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'home-alley-story');
  assert.ok(alleyStoryBtn, 'home-alley-story button remains visible as fallback');

  mount.unmount();
});

test('HomeScreen EN: localized accessibilityLabel, button label, and EN audio track loaded', async () => {
  const audioEvents = [];
  const dataset = getBundledDataset('ngo-trung-yen', 'en');
  const source = sources.getSourceState('demo', dataset, 'en');

  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate: () => {}, goBack: () => {}, addListener: () => () => {} },
    route: { params: { alleyId: 'ngo-trung-yen' } },
    mode: 'demo',
    source,
    currentNodeId: dataset.startNodeId ?? dataset.nodes[0]?.id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __locale: 'en',
    __audioEvents: audioEvents,
  });

  const tree = mount.render();
  const playBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'home-intro-play');
  assert.ok(playBtn, 'home-intro-play present in EN');
  assert.equal(playBtn.props.accessibilityRole, 'button');
  assert.equal(playBtn.props.accessibilityLabel, 'Play alley intro');

  // Press play
  await playBtn.props.onPress();

  // Verify English audio source was loaded
  const replaceEvent = audioEvents.find((e) => typeof e === 'object' && e !== null && 'replace' in e);
  assert.ok(replaceEvent, 'Audio replace event dispatched');
  assert.ok(String(replaceEvent.replace).includes('demo-migration-v1/ngo-trung-yen/en/intro.mp3'), `Loaded EN mp3 asset, got: ${replaceEvent.replace}`);

  mount.unmount();
});

test('HomeScreen audio lifecycle: stops on unmount, on blur, and on alley switch', () => {
  const audioEvents = [];
  const blurListeners = [];
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const source = sources.getSourceState('demo', dataset, 'vi');

  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: {
      navigate: () => {},
      goBack: () => {},
      addListener: (event, handler) => {
        if (event === 'blur') blurListeners.push(handler);
        return () => {};
      },
    },
    route: { params: { alleyId: 'ngo-trung-yen' } },
    mode: 'demo',
    source,
    currentNodeId: dataset.startNodeId ?? dataset.nodes[0]?.id,
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __locale: 'vi',
    __audioEvents: audioEvents,
    __initialPlaying: true,
  });

  mount.render();

  // 1. Test blur listener stops audio
  assert.ok(blurListeners.length > 0, 'Registered blur listener');
  blurListeners.forEach((h) => h());
  assert.ok(audioEvents.includes('pause'), 'Audio pause called on blur');

  // 2. Test alley switch stops audio
  audioEvents.length = 0;
  mount.render({ route: { params: { alleyId: 'ngo-tam-thuong' } } });
  assert.ok(audioEvents.includes('pause'), 'Audio pause called when switching alley');

  // 3. Test unmount stops audio
  audioEvents.length = 0;
  mount.unmount();
  assert.ok(audioEvents.includes('pause'), 'Audio pause called on unmount');
});

test('QaScreen root cause fix: opening intro button is unlocked for new alleys (ngo-trung-yen) and absent for ngo-gach', () => {
  // ngo-trung-yen
  const tyDataset = getBundledDataset('ngo-trung-yen', 'vi');
  const tySource = sources.getSourceState('demo', tyDataset, 'vi');
  const qaMountTy = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    source: tySource,
    dataset: tyDataset,
    datasetRevision: getCollectionRevision('ngo-trung-yen', 'vi'),
    currentNodeId: tyDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
    '../voice/useVoiceSession': {
      useVoiceSession: () => ({
        stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
        playback: { playing: false, currentTime: 0, duration: 40 },
        activeTrackId: null, playbackError: null,
        startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
      }),
    },
  });

  const tyTree = qaMountTy.render();
  const tyOpeningBtn = elements(tyTree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Phần mở đầu');
  assert.ok(tyOpeningBtn, 'QaScreen renders "Phần mở đầu" button for ngo-trung-yen');

  // Switch to intro segment
  tyOpeningBtn.props.onPress();
  const tyIntroTree = qaMountTy.render();
  const voicePlayerBar = elements(tyIntroTree, 'VoicePlayerBar')[0];
  assert.ok(voicePlayerBar, 'VoicePlayerBar is rendered for ngo-trung-yen intro segment');
  qaMountTy.unmount();

  // ngo-gach has no voice track -> no opening button
  const gachDataset = getBundledDataset('ngo-gach', 'vi');
  const gachSource = sources.getSourceState('demo', gachDataset, 'vi');
  const qaMountGach = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    dataset: gachDataset,
    datasetRevision: getCollectionRevision('ngo-gach', 'vi'),
    currentNodeId: gachDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
    '../voice/useVoiceSession': {
      useVoiceSession: () => ({
        stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
        playback: { playing: false, currentTime: 0, duration: 0 },
        activeTrackId: null, playbackError: null,
        startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
      }),
    },
  });

  const gachTree = qaMountGach.render();
  const gachOpeningBtn = elements(gachTree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Phần mở đầu');
  assert.equal(gachOpeningBtn, undefined, 'QaScreen does NOT render "Phần mở đầu" button for ngo-gach');
  qaMountGach.unmount();
});
