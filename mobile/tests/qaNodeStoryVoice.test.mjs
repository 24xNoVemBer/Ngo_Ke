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
import { findAnswer } from '../src/qa/match.ts';
import * as voiceIntent from '../src/voice/intent.ts';

// 1. Load actual collections
const actualCollectionsCode = ts.transpileModule(readFileSync(new URL('../src/data/collections.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const actualCollectionsMod = { exports: {} };
runInNewContext('(function(require,module,exports){' + actualCollectionsCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
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
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Linking: { openSettings: async () => {} },
  };

  const rn = { ...rnDefaults, ...(overrides['react-native'] ?? {}) };
  const jsxRuntime = { jsx: element, jsxs: element };

  const voiceCalls = overrides.__voiceCalls ?? [];
  let currentLocale = overrides.__locale ?? 'vi';

  const mockVoiceSession = overrides.__mockVoiceSession ?? {
    stage: 'idle',
    error: null,
    recordingDurationMs: 0,
    metering: -60,
    playback: { playing: false, currentTime: 0, duration: 40 },
    activeTrackId: null,
    playbackError: null,
    startRecording() {},
    submitRecording() {},
    cancel() {},
    stopPlayback() { voiceCalls.push({ action: 'stop' }); return Promise.resolve(true); },
    playTrack(id, text, kind, nodeId) { voiceCalls.push({ action: 'play', id, text, kind, nodeId }); },
    replayTrack(id, text, kind, nodeId) { voiceCalls.push({ action: 'replay', id, text, kind, nodeId }); },
  };

  const modules = {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react/jsx-dev-runtime': jsxRuntime,
    'react-native': rn,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    },
    '../voice/useVoiceSession': {
      useVoiceSession: () => mockVoiceSession,
      ...(overrides['../voice/useVoiceSession'] ?? {}),
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack,
      ...(overrides['../voice/localizedCatalog'] ?? {}),
    },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: currentLocale,
        setLocale: (l) => { currentLocale = l; dirty = true; },
        collectionId: defaultProps.dataset?.collectionId ?? 'ngo-trung-yen',
        setCollectionId: () => {},
        t: (key, params) => translator.t(currentLocale, key, params),
      }),
      ...(overrides['../context/LocaleContext'] ?? {}),
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
    '../qa/match': { findAnswer },
    '../recommendation/pick': { pickPoints: () => [] },
    '../data/threeLensesCompanion': { getScopedCompanion: () => null, THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses' },
    '../voice/intent': { parseVoiceIntent: () => ({ type: 'none' }), resolveFirstOptionReference: () => ({ type: 'none' }) },
    '../voice/performance': { recordVoicePerformance: () => {}, voicePerformanceNow: () => 0 },
    '../components/VoicePlayerBar': { VoicePlayerBar: (props) => ({ type: 'VoicePlayerBar', props }) },
    '../components/VoiceInteractionDock': { VoiceInteractionDock: 'VoiceInteractionDock' },
    '../components/ExpandableInputDrawer': { ExpandableInputDrawer: 'ExpandableInputDrawer' },
    '../components/NotebookDrawerModal': { NotebookDrawerModal: 'NotebookDrawerModal' },
    '../utils/alleyGeometry': alleyGeometry,
    '../utils/imagePerformanceDiagnostics': {
      createImagePerfFirstLayoutReporter: () => () => {},
      recordImagePerfLoadEnd: () => {}, recordImagePerfLoadError: () => {}, recordImagePerfLoadStart: () => {},
      recordImagePerfLoadSuccess: () => {}, recordImagePerfNavigationTap: () => {}, recordImagePerfScreenFocus: () => {},
    },
    ...overrides,
  };

  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return id;
    if (/\/components\//.test(id) || id.startsWith('./') || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1).replace(/\.tsx?$/, '');
      return { [name]: name, default: name, AppIcon: 'AppIcon', UnavailableScreen: 'UnavailableScreen' };
    }
    throw new Error(`Unexpected import in test mount: ${id}`);
  }, screenMod, screenMod.exports);

  const component = screenMod.exports.QaScreen ?? Object.values(screenMod.exports)[0];

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
    voiceCalls,
    mockVoiceSession,
    setLocale(loc) {
      currentLocale = loc;
    },
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

const FIVE_COLLECTIONS = ['ngo-trung-yen', 'ngo-gach', 'ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc'];

for (const locale of ['vi', 'en']) {
  test(`story-first node keeps voice and typed controls with localized command copy (${locale})`, () => {
    const dataset = getBundledDataset('ngo-gach', locale);
    const node = dataset.nodes[0];
    let voiceOptions;
    const mount = createTestMount('../src/screens/QaScreen.tsx', {
      mode: 'demo', dataset, datasetRevision: getCollectionRevision('ngo-gach', locale),
      currentNodeId: node.id, readNodeIds: new Set(), onSelectNode() {}, onReadNode() {}, onOpenNotebook() {},
    }, {
      __locale: locale,
      '../voice/intent': voiceIntent,
      '../voice/useVoiceSession': {
        useVoiceSession(options) {
          voiceOptions = options;
          return mount.mockVoiceSession;
        },
      },
    });
    let tree = mount.render();
    assert.equal(dataset.qa.length, 0);
    const dock = elements(tree, 'VoiceInteractionDock')[0];
    assert.ok(dock, 'microphone dock remains mounted with no fixed Q&A');
    assert.equal(dock.props.idleTitle, translator.t(locale, 'qa.story_voice_title'));
    assert.equal(dock.props.idleSubtitle, translator.t(locale, 'qa.story_voice_subtitle'));
    assert.equal(typeof dock.props.onStartRecording, 'function');
    assert.equal(typeof dock.props.onOpenInput, 'function');

    let drawer = elements(tree, 'ExpandableInputDrawer')[0];
    assert.equal(drawer.props.placeholder, translator.t(locale, 'drawer.command_placeholder'));
    assert.deepEqual(drawer.props.suggestedQuestions, []);
    drawer.props.onChangeText('An unlisted content question');
    tree = mount.render();
    drawer = elements(tree, 'ExpandableInputDrawer')[0];
    drawer.props.onSubmit();
    tree = mount.render();
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_title')));
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_body')));

    voiceOptions.onTranscript('An unlisted content question', {
      turnId: 'story-mode-test', scope: voiceOptions.scope, nodeId: voiceOptions.nodeId,
      mode: voiceOptions.mode, datasetRevision: voiceOptions.datasetRevision,
    });
    tree = mount.render();
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_body')));
    mount.unmount();
  });

  test(`all 17 intentional no-QA nodes omit notice while retaining story controls (${locale})`, () => {
    let count = 0;
    for (const collectionId of FIVE_COLLECTIONS) {
      const dataset = getBundledDataset(collectionId, locale);
      for (const node of dataset.nodes) {
        const mount = createTestMount('../src/screens/QaScreen.tsx', {
          mode: 'demo', dataset, datasetRevision: getCollectionRevision(collectionId, locale),
          currentNodeId: node.id, readNodeIds: new Set(), onSelectNode() {}, onReadNode() {}, onOpenNotebook() {},
        }, { __locale: locale });
        const tree = mount.render();
        assert.equal(dataset.qa.length, 0);
        assert.ok(!JSON.stringify(tree).includes(translator.t(locale, 'qa.no_questions_for_node')));
        assert.equal(elements(tree, 'VoicePlayerBar').length, 1);
        assert.equal(elements(tree, 'VoiceInteractionDock').length, 1);
        assert.ok(elements(tree, 'Pressable').length > 0);
        count++;
        mount.unmount();
      }
    }
    assert.equal(count, 17);
  });

  test(`unknown typed/voice questions remain visible after removing empty notice (${locale})`, () => {
    const dataset = getBundledDataset('ngo-trung-yen', locale);
    let voiceOptions;
    const mount = createTestMount('../src/screens/QaScreen.tsx', {
      dataset, datasetRevision: getCollectionRevision('ngo-trung-yen', locale),
      currentNodeId: dataset.nodes[0].id, readNodeIds: new Set(), onSelectNode() {}, onReadNode() {}, onOpenNotebook() {},
    }, { __locale: locale, '../voice/intent': voiceIntent,
      '../voice/useVoiceSession': { useVoiceSession(options) { voiceOptions = options; return mount.mockVoiceSession; } } });
    let tree = mount.render();
    elements(tree, 'ExpandableInputDrawer')[0].props.onChangeText('unlisted question 9876?');
    tree = mount.render();
    elements(tree, 'ExpandableInputDrawer')[0].props.onSubmit();
    tree = mount.render();
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_title')));
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_body')));
    voiceOptions.onTranscript('unlisted question 9876?', {
      turnId: 'test', scope: voiceOptions.scope, nodeId: voiceOptions.nodeId,
      mode: voiceOptions.mode, datasetRevision: voiceOptions.datasetRevision,
    });
    tree = mount.render();
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_title')));
    assert.ok(JSON.stringify(tree).includes(translator.t(locale, 'qa.story_no_match_body')));
    mount.setLocale(locale === 'vi' ? 'en' : 'vi');
    tree = mount.render();
    assert.ok(!JSON.stringify(tree).includes(translator.t(locale, 'qa.no_questions_for_node')));
    mount.unmount();
  });
}

test('QaScreen resolves <nodeId>-story and renders visible VoicePlayerBar for all 17 VI nodes', () => {
  let totalChecked = 0;
  for (const collectionId of FIVE_COLLECTIONS) {
    const dataset = getBundledDataset(collectionId, 'vi');
    const revision = getCollectionRevision(collectionId, 'vi');
    for (const node of dataset.nodes) {
      totalChecked++;
      const voiceCalls = [];
      const mount = createTestMount('../src/screens/QaScreen.tsx', {
        mode: 'demo',
        dataset,
        datasetRevision: revision,
        currentNodeId: node.id,
        readNodeIds: new Set(),
        onSelectNode: () => {},
        onReadNode: () => {},
        onOpenNotebook: () => {},
      }, {
        __locale: 'vi',
        __voiceCalls: voiceCalls,
      });

      const tree = mount.render();
      const playerBars = elements(tree, 'VoicePlayerBar');
      assert.equal(playerBars.length, 1, `Expected 1 VoicePlayerBar for ${collectionId}:${node.id}`);

      const player = playerBars[0].props;
      assert.ok(player.label.startsWith('Lời kể · '), `Label should start with 'Lời kể · ': ${player.label}`);
      assert.ok(player.label.includes(node.name), `Label should include node name '${node.name}': ${player.label}`);
      assert.ok(player.measuredDuration > 0, `measuredDuration must be > 0: ${player.measuredDuration}`);
      assert.equal(player.active, false, 'Player should be inactive initially');
      assert.equal(player.playing, false, 'Player should not be playing initially');

      // Test onPlay callback
      player.onPlay();
      assert.equal(voiceCalls.length, 1);
      assert.deepEqual(voiceCalls[0], {
        action: 'play',
        id: `${node.id}-story`,
        text: node.story,
        kind: 'story',
        nodeId: node.id,
      });

      // Test onReplay callback
      player.onReplay();
      assert.equal(voiceCalls.length, 2);
      assert.deepEqual(voiceCalls[1], {
        action: 'replay',
        id: `${node.id}-story`,
        text: node.story,
        kind: 'story',
        nodeId: node.id,
      });

      // Test onStop callback
      player.onStop();
      assert.equal(voiceCalls.length, 3);
      assert.equal(voiceCalls[2].action, 'stop');

      mount.unmount();
    }
  }
  assert.equal(totalChecked, 17, 'All 17 VI nodes verified');
});

test('QaScreen resolves <nodeId>-story and renders visible VoicePlayerBar for all 17 EN nodes', () => {
  let totalChecked = 0;
  for (const collectionId of FIVE_COLLECTIONS) {
    const dataset = getBundledDataset(collectionId, 'en');
    const revision = getCollectionRevision(collectionId, 'en');
    for (const node of dataset.nodes) {
      totalChecked++;
      const voiceCalls = [];
      const mount = createTestMount('../src/screens/QaScreen.tsx', {
        mode: 'demo',
        dataset,
        datasetRevision: revision,
        currentNodeId: node.id,
        readNodeIds: new Set(),
        onSelectNode: () => {},
        onReadNode: () => {},
        onOpenNotebook: () => {},
      }, {
        __locale: 'en',
        __voiceCalls: voiceCalls,
      });

      const tree = mount.render();
      const playerBars = elements(tree, 'VoicePlayerBar');
      assert.equal(playerBars.length, 1, `Expected 1 VoicePlayerBar for EN ${collectionId}:${node.id}`);

      const player = playerBars[0].props;
      assert.ok(player.label.startsWith('Story · '), `Label should start with 'Story · ': ${player.label}`);
      assert.ok(player.label.includes(node.name), `Label should include node name '${node.name}': ${player.label}`);
      assert.ok(player.measuredDuration > 0, `measuredDuration must be > 0: ${player.measuredDuration}`);

      // Test onPlay callback
      player.onPlay();
      assert.equal(voiceCalls.length, 1);
      assert.deepEqual(voiceCalls[0], {
        action: 'play',
        id: `${node.id}-story`,
        text: node.story,
        kind: 'story',
        nodeId: node.id,
      });

      mount.unmount();
    }
  }
  assert.equal(totalChecked, 17, 'All 17 EN nodes verified');
});

test('QaScreen gracefully hides player bar when dataset revision is mismatched or track is missing', () => {
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const mount = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset,
    datasetRevision: 'invalid-revision-hash-0000000',
    currentNodeId: dataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
  });

  const tree = mount.render();
  const playerBars = elements(tree, 'VoicePlayerBar');
  assert.equal(playerBars.length, 0, 'No VoicePlayerBar when revision does not match');

  // Reader toggle remains available to read story text
  const readerToggles = elements(tree, 'Pressable').filter((p) => p.props.accessibilityLabel === 'Xem lời kể bằng chữ');
  assert.ok(readerToggles.length > 0, 'Reader toggle remains visible');

  mount.unmount();
});

test('QaScreen node switching updates story track, label, and duration dynamically', () => {
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const revision = getCollectionRevision('ngo-trung-yen', 'vi');
  const node0 = dataset.nodes[0];
  const node1 = dataset.nodes[1];

  let selectedId = node0.id;
  const mount = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset,
    datasetRevision: revision,
    currentNodeId: selectedId,
    readNodeIds: new Set(),
    onSelectNode: (id) => { selectedId = id; },
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
  });

  const tree0 = mount.render();
  const player0 = elements(tree0, 'VoicePlayerBar')[0].props;
  assert.ok(player0.label.includes(node0.name));
  assert.equal(player0.measuredDuration, 24.96);

  // Switch to node1
  const tree1 = mount.render({ currentNodeId: node1.id });
  const player1 = elements(tree1, 'VoicePlayerBar')[0].props;
  assert.ok(player1.label.includes(node1.name));
  assert.equal(player1.measuredDuration, 24.72);

  mount.unmount();
});

test('QaScreen intro narration behavior remains unaffected on both intro-enabled and intro-free alleys', () => {
  // 1. ngo-trung-yen has intro
  const tyDataset = getBundledDataset('ngo-trung-yen', 'vi');
  const tyRevision = getCollectionRevision('ngo-trung-yen', 'vi');
  const tyVoiceCalls = [];

  const mountTy = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: tyDataset,
    datasetRevision: tyRevision,
    currentNodeId: tyDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
    __voiceCalls: tyVoiceCalls,
  });

  const treeTy = mountTy.render();
  const openingBtn = elements(treeTy, 'Pressable').find((p) => p.props.accessibilityLabel === 'Phần mở đầu');
  assert.ok(openingBtn, 'Opening button is rendered for ngo-trung-yen');

  // Switch to opening narration
  openingBtn.props.onPress();
  const introTree = mountTy.render();
  const introPlayer = elements(introTree, 'VoicePlayerBar')[0].props;
  assert.ok(introPlayer.label.includes('Phần mở đầu'));

  introPlayer.onPlay();
  // Expect stop (from switching segment) followed by play
  assert.ok(tyVoiceCalls.some((c) => c.action === 'stop'), 'Segment switch requested stop');
  const playIntroCall = tyVoiceCalls.find((c) => c.action === 'play');
  assert.ok(playIntroCall, 'Play call occurred');
  assert.equal(playIntroCall.id, 'intro');
  assert.equal(playIntroCall.kind, 'intro');

  // Back to chapter story
  const backBtn = elements(introTree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Quay lại câu chuyện chính');
  assert.ok(backBtn, 'Back to story button is rendered');
  backBtn.props.onPress();

  const restoredTree = mountTy.render();
  const restoredPlayer = elements(restoredTree, 'VoicePlayerBar')[0].props;
  assert.ok(restoredPlayer.label.includes(tyDataset.nodes[0].name));
  mountTy.unmount();

  // 2. ngo-gach has NO intro -> intro button is absent, node story player is present
  const gachDataset = getBundledDataset('ngo-gach', 'vi');
  const gachRevision = getCollectionRevision('ngo-gach', 'vi');

  const mountGach = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: gachDataset,
    datasetRevision: gachRevision,
    currentNodeId: gachDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
  });

  const gachTree = mountGach.render();
  const gachOpeningBtn = elements(gachTree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Phần mở đầu');
  assert.equal(gachOpeningBtn, undefined, 'Opening button must NOT be rendered for ngo-gach');

  const gachPlayer = elements(gachTree, 'VoicePlayerBar')[0].props;
  assert.ok(gachPlayer.label.includes(gachDataset.nodes[0].name), 'Node story player is present for ngo-gach');
  mountGach.unmount();
});

test('QaScreen hides intentional empty notice and preserves valid Q&A and follow-ups', () => {
  // Case A: intentional qa=[] omits the notice while the story remains active.
  const tyDataset = getBundledDataset('ngo-trung-yen', 'vi');
  const tyRevision = getCollectionRevision('ngo-trung-yen', 'vi');
  const mountEmpty = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: tyDataset,
    datasetRevision: tyRevision,
    currentNodeId: tyDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
  });

  const treeEmpty = mountEmpty.render();
  assert.equal(elements(treeEmpty, 'VoicePlayerBar').length, 1, 'Story player visible on node');
  const texts = elements(treeEmpty, 'Text').map((t) => (typeof t.props?.children === 'string' ? t.props.children : '')).join(' ');
  assert.ok(!texts.includes('Chưa có câu hỏi cho điểm này'), 'Intentional empty notice is absent');
  mountEmpty.unmount();

  // Case B: dataset with QA entries -> matching question, answer card, follow-ups do not break story player
  const sampleQaDataset = {
    ...tyDataset,
    qa: [
      {
        id: 'ty-q1',
        nodeId: tyDataset.nodes[0].id,
        question: 'Phở Sướng có từ bao giờ?',
        answer: 'Phở Sướng có từ những năm 1930.',
        aliases: ['nguồn gốc phở sướng'],
        evidence: ['Nguồn tư liệu'],
        followUps: ['ty-q2'],
        tags: [],
      },
      {
        id: 'ty-q2',
        nodeId: tyDataset.nodes[0].id,
        question: 'Tại sao lại gọi là Phở Sướng?',
        answer: 'Tên gọi mang ý nghĩa ăn vào thấy sung sướng.',
        aliases: [],
        evidence: ['Nguồn tư liệu'],
        followUps: [],
        tags: [],
      },
    ],
  };

  const mountQa = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: sampleQaDataset,
    datasetRevision: tyRevision,
    currentNodeId: tyDataset.nodes[0].id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
  });

  const initialQaTree = mountQa.render();
  assert.equal(elements(initialQaTree, 'VoicePlayerBar').length, 1, 'Story player visible before QA');

  // Suggested questions are present
  const suggestedPill = elements(initialQaTree, 'Pressable').find(
    (p) => typeof p.props.accessibilityLabel === 'string' && p.props.accessibilityLabel.includes('Phở Sướng có từ bao giờ?')
  );
  assert.ok(suggestedPill, 'Suggested question chip rendered');

  // Trigger ask
  suggestedPill.props.onPress();
  const answeredTree = mountQa.render();

  // Story player remains visible above answered card
  assert.equal(elements(answeredTree, 'VoicePlayerBar').length, 1, 'Story player stays visible during QA');

  // Reset button present
  const resetBtn = elements(answeredTree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Đặt câu hỏi khác');
  assert.ok(resetBtn, 'Reset button present after question answered');

  // Follow-up chip present
  const followUpPill = elements(answeredTree, 'Pressable').find(
    (p) => typeof p.props.accessibilityLabel === 'string' && p.props.accessibilityLabel.includes('Tại sao lại gọi là Phở Sướng?')
  );
  assert.ok(followUpPill, 'Follow-up question chip rendered');

  resetBtn.props.onPress();
  const resetTree = mountQa.render();
  assert.equal(elements(resetTree, 'VoicePlayerBar').length, 1, 'Story player stays visible after reset');

  mountQa.unmount();
});

test('QaScreen accessibility and fontScale 1.3 / 2.0 remain correct', () => {
  const dataset = getBundledDataset('ngo-trung-yen', 'vi');
  const revision = getCollectionRevision('ngo-trung-yen', 'vi');

  for (const fontScale of [1.3, 2.0]) {
    const mount = createTestMount('../src/screens/QaScreen.tsx', {
      mode: 'demo',
      dataset,
      datasetRevision: revision,
      currentNodeId: dataset.nodes[1].id, // middle node
      readNodeIds: new Set(),
      onSelectNode: () => {},
      onReadNode: () => {},
      onOpenNotebook: () => {},
    }, {
      __locale: 'vi',
      __windowDimensions: { width: 390, height: 844, fontScale },
    });

    const tree = mount.render();
    const playerBars = elements(tree, 'VoicePlayerBar');
    assert.equal(playerBars.length, 1, `VoicePlayerBar renders at fontScale ${fontScale}`);

    const player = playerBars[0].props;
    assert.ok(player.label.length > 0);
    assert.ok(player.measuredDuration > 0);

    // Verify touch targets for navigation buttons
    const prevBtn = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Điểm trước đó');
    const nextBtn = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Điểm tiếp theo');
    assert.ok(prevBtn, `Prev stop button present at fontScale ${fontScale}`);
    assert.ok(nextBtn, `Next stop button present at fontScale ${fontScale}`);

    // Reader toggle is present
    const readerToggle = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Xem lời kể bằng chữ');
    assert.ok(readerToggle, `Reader toggle present at fontScale ${fontScale}`);

    mount.unmount();
  }
});

test('QaScreen locale switch dynamically updates story track, labels, and duration', () => {
  const viDataset = getBundledDataset('ngo-trung-yen', 'vi');
  const viRevision = getCollectionRevision('ngo-trung-yen', 'vi');
  const enDataset = getBundledDataset('ngo-trung-yen', 'en');
  const enRevision = getCollectionRevision('ngo-trung-yen', 'en');
  const node = viDataset.nodes[0];
  const voiceCalls = [];

  const mount = createTestMount('../src/screens/QaScreen.tsx', {
    mode: 'demo',
    dataset: viDataset,
    datasetRevision: viRevision,
    currentNodeId: node.id,
    readNodeIds: new Set(),
    onSelectNode: () => {},
    onReadNode: () => {},
    onOpenNotebook: () => {},
  }, {
    __locale: 'vi',
    __voiceCalls: voiceCalls,
  });

  const viTree = mount.render();
  const viPlayer = elements(viTree, 'VoicePlayerBar')[0].props;
  assert.ok(viPlayer.label.startsWith('Lời kể · '));
  assert.equal(viPlayer.measuredDuration, 24.96);

  // Switch to English
  mount.setLocale('en');
  const enTree = mount.render({
    dataset: enDataset,
    datasetRevision: enRevision,
  });
  const enPlayer = elements(enTree, 'VoicePlayerBar')[0].props;
  assert.ok(enPlayer.label.startsWith('Story · '));
  assert.equal(enPlayer.measuredDuration, 22.8);

  enPlayer.onPlay();
  const lastCall = voiceCalls.at(-1);
  assert.deepEqual(lastCall, {
    action: 'play',
    id: `${node.id}-story`,
    text: enDataset.nodes[0].story,
    kind: 'story',
    nodeId: node.id,
  });

  mount.unmount();
});
