import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';
import * as translator from '../src/i18n/translator.ts';
import * as sources from '../src/data/sourceState.ts';
import * as live from '../src/data/live.ts';
import * as alleyGeometry from '../src/utils/alleyGeometry.ts';

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
const reviewedPilotVi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
const reviewedPilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));

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
    useMemo(factory, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) {
        slots[i] = { deps, value: factory() };
      }
      return slots[i].value;
    },
  };

  const rnDefaults = {
    StyleSheet: { create: (s) => s, absoluteFill: {} },
    Platform: { OS: 'android' },
    useWindowDimensions: () => overrides.__windowDimensions ?? { width: 400, height: 850, fontScale: 1.0 },
    Animated: {
      View: 'Animated.View',
      Image: 'Animated.Image',
      Value: class {
        constructor(v) { this.val = v; }
        interpolate() { return this; }
        setValue(v) { this.val = v; }
        stopAnimation() {}
      },
      timing(v, cfg) {
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
    TextInput: 'TextInput',
  };

  const rn = { ...rnDefaults, ...(overrides['react-native'] ?? {}) };

  const jsxRuntime = {
    jsx: element,
    jsxs: element,
  };

  const modules = {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react/jsx-dev-runtime': jsxRuntime,
    'react-native': rn,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    },
    '../context/LocaleContext': overrides['../context/LocaleContext'] ?? {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ foreground: true, reducedMotion: false, active: true }),
      useMotionPreferences: () => ({ reducedMotion: false }),
    },
    '../hooks/useMotion': {
      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn: () => {}, handlePressOut: () => {} }),
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      useScrollProgress: () => ({ scrollY: { interpolate: () => 0 }, handleScroll: () => {} }),
      useLaserScanner: () => ({ translateYPct: { interpolate: () => 0 }, beamOpacity: 1 }),
    },
    '../data/collections': {
      getLocalizedCollections: (loc = 'vi') => [
        { id: 'old-quarter-pilot', name: loc === 'en' ? 'Old Quarter Pilot' : 'Thử nghiệm Phố Cổ', tagline: 'Di sản', theme: 'Lịch sử', district: 'Hoàn Kiếm', coverPhoto: 1, kind: 'reviewed', nodeCount: 3 },
        { id: 'fiction-letter', name: loc === 'en' ? 'Hanoi Letters' : 'Thư Hà Nội', tagline: 'Kể chuyện', theme: 'Văn hóa', district: 'Hoàn Kiếm', coverPhoto: 1, kind: 'simulated', nodeCount: 6 },
      ],
      AVAILABLE_COLLECTIONS: [
        { id: 'old-quarter-pilot', nameKey: 'collection.old_quarter_pilot.name', taglineKey: 'collection.old_quarter_pilot.tagline', themeKey: 'collection.old_quarter_pilot.theme', districtKey: 'collection.old_quarter_pilot.district', nodeCount: 3, coverPhoto: 1, kind: 'reviewed' },
        { id: 'fiction-letter', nameKey: 'collection.fiction_letter.name', taglineKey: 'collection.fiction_letter.tagline', themeKey: 'collection.fiction_letter.theme', districtKey: 'collection.fiction_letter.district', nodeCount: 6, coverPhoto: 1, kind: 'simulated' },
      ],
      isCollectionId: (id) => id === 'old-quarter-pilot' || id === 'fiction-letter',
      getBundledDataset: () => fixture,
      DEFAULT_COLLECTION_ID: 'fiction-letter',
    },
    '../data/sourceState': sources,
    '../assets/photoMap': {
      HERO_PHOTO: 1,
      getNodePhoto: () => 1,
      getNodePhotographer: () => 'Nguyễn Văn A',
      getAlleyMeta: () => ({ name: 'Phố Cổ', coverPhoto: 1, photographer: 'Nguyễn Văn A' }),
    },
    '../theme': {
      colors: { primary: '#2D5748', terracotta: '#C85A32', text: '#2C221E' },
      radius: { sm: 4, md: 8, lg: 16, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24 },
      typography: { titleLarge: {}, body: {} },
    },
    '../theme/motion': {
      motionDurations: { ambientPulse: 3000, normal: 300 },
      motionEasings: { gentleOut: () => {} },
    },
    '@react-navigation/native': {
      useIsFocused: () => true,
      useNavigation: () => ({ navigate() {}, goBack() {} }),
    },
    '../utils/imagePerformanceDiagnostics': {
      createImagePerfFirstLayoutReporter: () => () => {},
      recordImagePerfLoadEnd: () => {}, recordImagePerfLoadError: () => {}, recordImagePerfLoadStart: () => {},
      recordImagePerfLoadSuccess: () => {}, recordImagePerfNavigationTap: () => {}, recordImagePerfScreenFocus: () => {},
    },
    '../recommendation/pick': {
      pickRecommendations: () => [],
      pickPoints: () => [],
    },
    '../location/nearest': {
      pickCandidate: () => undefined,
      formatDistance: () => '10m',
    },
    '../qr/confirmPoint': {
      parseQrPayload: () => ({ valid: true, id: '1' }),
      confirmPoint: () => true,
      selectManually: (nodes, id) => nodes.find((n) => n.id === id),
    },
    '../qa/match': {
      matchQuestion: () => ({ status: 'matched', entry: null }),
      normalizeQuestion: (t) => (typeof t === 'string' ? t.toLowerCase().trim() : ''),
    },
    'expo-location': {
      requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
      getCurrentPositionAsync: async () => ({ coords: { latitude: 21.03, longitude: 105.85 } }),
    },
    'expo-camera': {
      CameraView: 'CameraView',
      useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })],
    },
    'react-native-svg': { default: 'Svg', Svg: 'Svg', Path: 'Path' },
    'expo-audio': {
      setAudioModeAsync: async () => {},
      useAudioPlayer: () => ({ loop: false, pause() {}, play() {}, replace() {} }),
      useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
    },
    ...overrides,
  };

  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (id === './AppIcon' || id === '../components/AppIcon' || /\/components\//.test(id) || /\/screens\//.test(id) || id.includes('AlleyGuideSection') || id.includes('AlleyStoryCard') || id.includes('UnavailableScreen')) {
      const name = id.split('/').at(-1);
      return { [name]: name, AppIcon: 'AppIcon', CrossfadePhoto: 'CrossfadePhoto', VoicePlayerBar: 'VoicePlayerBar', VoiceInteractionDock: 'VoiceInteractionDock', UnavailableScreen: 'UnavailableScreen', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection' };
    }
    if (id.includes('alleyGuide')) {
      return { readAlleyStory: () => null, readAlleyGuide: () => null };
    }
    if (id.includes('alleyGeometry')) {
      return alleyGeometry;
    }
    if (/\/voice\//.test(id)) {
      return { lookupVoiceTrack: () => null, useVoiceSession: () => ({ activeTrackId: null, playback: { playing: false, currentTime: 0, duration: 0 }, stopPlayback() {} }) };
    }
    if (/\/location\//.test(id)) {
      return { pickCandidate: () => undefined, formatDistance: () => '10m' };
    }
    if (/\/data\/threeLensesCompanion/.test(id)) {
      return { getScopedCompanion: () => null, THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses' };
    }
    if (id.includes('imagePerformanceDiagnostics')) {
      return {
        createImagePerfFirstLayoutReporter: () => () => {},
        recordImagePerfLoadEnd: () => {}, recordImagePerfLoadError: () => {}, recordImagePerfLoadStart: () => {},
        recordImagePerfLoadSuccess: () => {}, recordImagePerfNavigationTap: () => {}, recordImagePerfScreenFocus: () => {},
      };
    }
    throw new Error(`Unexpected import in ${file}: ${id}`);
  }, screenMod, screenMod.exports);

  const component = Object.values(screenMod.exports).find((exp) => typeof exp === 'function') ?? screenMod.exports.default;

  let currentProps = { ...defaultProps };

  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      dirty = true;
      let passes = 0;
      while (dirty) {
        assert.ok(passes++ < 20, 'state/effect loop in mount');
        dirty = false;
        cursor = 0;
        pending = [];
        tree = component(currentProps);
        pending.forEach((e) => e());
      }
      return tree;
    },
    unmount() {
      slots.forEach((s) => s?.cleanup?.());
    },
  };
}

function elements(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((c) => elements(c, type));
  const res = [];
  if (tree.type === type || (typeof type === 'string' && tree.type && tree.type.name === type)) {
    res.push(tree);
  }
  if (tree.props && tree.props.children) {
    res.push(...elements(tree.props.children, type));
  }
  return res;
}

test('LandingScreen P2-1: mode_status renders truthful format + mode without simulated label (Live + reviewed collection, VI and EN)', () => {
  // 1. VI locale, Live mode, reviewed collection
  const liveReviewedSource = {
    status: 'ready',
    mode: 'live',
    dataset: reviewedPilotVi,
    title: 'Máy chủ Hà Nội',
    detail: 'Dữ liệu đã duyệt',
  };

  const viewVi = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {} },
    mode: 'live',
    source: liveReviewedSource,
    onModeChange() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const treeVi = viewVi.render();
  const textVi = JSON.stringify(treeVi);
  assert.ok(textVi.includes('Chọn một con ngõ để bắt đầu câu chuyện.'), 'VI mode_status renders static truthful copy');
  assert.equal(textVi.includes('mô phỏng'), false, 'VI mode_status must not include mô phỏng');
  assert.equal(textVi.includes('simulated'), false, 'VI mode_status must not include simulated');
  viewVi.unmount();

  // 2. EN locale, Live mode, reviewed collection
  const viewEn = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {} },
    mode: 'live',
    source: liveReviewedSource,
    onModeChange() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });

  const treeEn = viewEn.render();
  const textEn = JSON.stringify(treeEn);
  assert.ok(textEn.includes('Choose an alley to begin its story.'), 'EN mode_status renders static truthful copy');
  assert.equal(textEn.includes('simulated'), false, 'EN mode_status must not include simulated');
  assert.equal(textEn.includes('mô phỏng'), false, 'EN mode_status must not include mô phỏng');
  viewEn.unmount();

  // 3. VI locale, Demo mode
  const demoSource = {
    status: 'ready',
    mode: 'demo',
    dataset: reviewedPilotVi,
    title: 'Demo',
    detail: 'Sẵn sàng',
  };

  const viewDemoVi = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {} },
    mode: 'demo',
    source: demoSource,
    onModeChange() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const treeDemoVi = viewDemoVi.render();
  const textDemoVi = JSON.stringify(treeDemoVi);
  assert.ok(textDemoVi.includes('Chọn một con ngõ để bắt đầu câu chuyện.'), 'VI Demo mode_status renders static truthful copy');
  assert.equal(textDemoVi.includes('mô phỏng'), false, 'VI Demo mode_status must not claim mô phỏng');
  viewDemoVi.unmount();

  // 4. EN locale, Demo mode
  const viewDemoEn = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {} },
    mode: 'demo',
    source: demoSource,
    onModeChange() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });

  const treeDemoEn = viewDemoEn.render();
  const textDemoEn = JSON.stringify(treeDemoEn);
  assert.ok(textDemoEn.includes('Choose an alley to begin its story.'), 'EN Demo mode_status renders static truthful copy');
  assert.equal(textDemoEn.includes('simulated'), false, 'EN Demo mode_status must not claim simulated');
  viewDemoEn.unmount();
});

test('NotebookDrawerModal removes sourceStateTag and disclaimerNote while preserving mode radio controls', () => {
  const liveReviewedSource = {
    status: 'ready',
    mode: 'live',
    dataset: reviewedPilotVi,
    title: 'Máy chủ Hà Nội',
    detail: 'Dữ liệu trực tiếp',
  };

  const view = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: liveReviewedSource,
    onModeChange() {},
    liveBusy: false,
    collectionId: 'old-quarter-pilot',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const tree = view.render();
  const text = JSON.stringify(tree);

  // Provenance badges and disclaimers removed
  assert.equal(text.includes('LIVE · dữ liệu đã duyệt'), false, 'sourceStateTag removed');
  assert.equal(text.includes('LIVE · dữ liệu mô phỏng'), false, 'simulated tag removed');
  assert.equal(text.includes('Dữ liệu mô phỏng nhằm mục đích'), false, 'disclaimer note removed');

  // Mode radio controls preserved
  const demoRadio = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-demo');
  const liveRadio = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-live');
  assert.ok(demoRadio, 'notebook-mode-demo radio button preserved');
  assert.ok(liveRadio, 'notebook-mode-live radio button preserved');
  assert.equal(liveRadio.props.accessibilityState?.checked, true, 'Live radio button checked');

  // Redundant status block omitted when ready and not busy
  assert.equal(text.includes('Máy chủ Hà Nội'), false, 'redundant source title omitted when ready and not busy');
  assert.equal(text.includes('Dữ liệu trực tiếp'), false, 'redundant source detail omitted when ready and not busy');
  view.unmount();
});

test('PostcardCard removes photo disclaimer badge while preserving photo credit and unmeasured duration', () => {
  const viewReviewed = createTestMount('../src/components/PostcardCard.tsx', {
    node: reviewedPilotVi.nodes[0],
    collectionKind: 'reviewed',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const textReviewed = JSON.stringify(viewReviewed.render());
  assert.equal(textReviewed.includes('Ảnh minh họa · điểm đã duyệt'), false, 'disclaimerBadge removed');
  assert.equal(textReviewed.includes('Ảnh minh họa · điểm mô phỏng'), false, 'simulated disclaimerBadge removed');
  assert.ok(textReviewed.includes('Tác giả: Nguyễn Văn A'), 'photo author credit preserved');
  assert.ok(textReviewed.includes('Gợi ý tham quan: 10 phút (chưa đo)'), 'unmeasured visit minutes preserved');
  viewReviewed.unmount();
});

test('CameraScreen removes bottom disclaimerBox and photo disclaimer badge while preserving credit and stop title', () => {
  const view = createTestMount('../src/screens/CameraScreen.tsx', {
    nodes: reviewedPilotVi.nodes,
    onConfirmNode() {},
    collectionKind: 'simulated',
    collectionId: 'fiction-letter',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const tree = view.render();
  const text = JSON.stringify(tree);

  // Bottom disclaimer box removed
  assert.equal(text.includes('nội dung mô phỏng'), false, 'bottom disclaimerBox removed');
  assert.equal(text.includes('Ảnh minh họa · điểm mô phỏng'), false, 'photo disclaimerBadge removed');

  // Manual list item has unmeasured duration and no simulated clutter
  assert.ok(text.includes('Gợi ý tham quan: 10 phút (chưa đo)'), 'manual list shows suggested duration');
  assert.equal(text.includes('10 phút mô phỏng'), false, 'no simulated duration in manual list');

  // Trigger manual selection to activate stop and verify photo credit without disclaimer badge
  const pressables = elements(tree, 'Pressable');
  const manualItem = pressables.find((p) => p.props.accessibilityLabel?.includes(reviewedPilotVi.nodes[0].name));
  assert.ok(manualItem, 'manual list item exists');
  manualItem.props.onPress();

  const treeWithActive = view.render();
  const textWithActive = JSON.stringify(treeWithActive);
  assert.ok(textWithActive.includes('Tác giả: Nguyễn Văn A'), 'photo credit retained on active stop');
  assert.equal(textWithActive.includes('Ảnh minh họa · điểm mô phỏng'), false, 'active photo disclaimerBadge removed');
  assert.ok(textWithActive.includes(reviewedPilotVi.nodes[0].name), 'stop name retained');
  view.unmount();
});

test('LocationScreen manual accessibility label has no simulated clutter and safety notice is concise', () => {
  const viewEn = createTestMount('../src/screens/LocationScreen.tsx', {
    nodes: reviewedPilotEn.nodes,
    currentNodeId: reviewedPilotEn.nodes[0].id,
    onConfirmNode() {},
    collectionKind: 'simulated',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (key, params) => translator.t('en', key, params),
      }),
    },
  });

  const treeEn = viewEn.render();
  const textEn = JSON.stringify(treeEn);

  // Manual button accessibilityLabel has no 'simulated'
  const pressables = elements(treeEn, 'Pressable');
  const manualRow = pressables.find((p) => p.props.accessibilityLabel === `Select ${reviewedPilotEn.nodes[0].name} manually`);
  assert.ok(manualRow, 'manual row has clean accessibilityLabel without simulated suffix');

  // Concise operational safety disclaimer without coordinate claims
  assert.ok(textEn.includes('App does not provide turn-by-turn directions or track background location'), 'concise operational limitation preserved');
  assert.equal(textEn.includes('Coordinates in demo are simulated'), false, 'simulated coordinates clutter removed');
  viewEn.unmount();
});

test('PlanScreen retains concise operational limitation without coordinate clutter', () => {
  const view = createTestMount('../src/screens/PlanScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    nodes: reviewedPilotVi.nodes,
    onConfirmPlan() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const text = JSON.stringify(view.render());
  assert.ok(text.includes('App không chỉ đường từng bước'), 'concise operational limitation preserved');
  assert.equal(text.includes('Tọa độ các điểm trong bản demo là mô phỏng'), false, 'simulated coordinates clutter removed');
  view.unmount();
});

test('QaScreen removes waveform provenance badge, source pill, and verified tag while keeping story and QA', () => {
  const qaProps = {
    currentNode: reviewedPilotVi.nodes[0],
    nodeQa: reviewedPilotVi.qa.slice(0, 2),
    dataset: reviewedPilotVi,
    collectionId: 'old-quarter-pilot',
    datasetRevision: 'rev-pilot',
    mode: 'demo',
    isFocused: true,
    navigation: { navigate() {}, goBack() {} },
    onSelectNode() {},
    onAskQuestion() {},
    onModeChange() {},
    match: { status: 'matched', entry: reviewedPilotVi.qa[0] },
    locale: 'vi',
    readNodeIds: new Set(),
    onReadNode() {},
  };

  const view = createTestMount('../src/screens/QaScreen.tsx', qaProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t('vi', key, params),
      }),
    },
  });

  const tree = view.render();
  const text = JSON.stringify(tree);

  // Provenance / simulated clutter removed
  assert.equal(text.includes('DEMO · DI SẢN ĐÃ DUYỆT'), false, 'waveform note removed');
  assert.equal(text.includes('NỘI DUNG CÓ NGUỒN'), false, 'verifiedTag removed');
  assert.equal(text.includes('điểm đã duyệt · nguồn Demo'), false, 'disclaimerPill removed');
  assert.equal(text.includes('Truyện hư cấu'), false, 'fiction disclaimer removed');

  // Narrative title and questions retained
  assert.ok(text.includes(reviewedPilotVi.nodes[0].name), 'node title retained');
  assert.ok(text.includes(reviewedPilotVi.qa[0].question), 'question text retained');

  // Phase C: Photo credit and ClickableSources removed from QaScreen
  assert.equal(text.includes('creditPillText'), false, 'creditPillText style absent');
  assert.equal(text.includes('Nguyễn Văn A'), false, 'photographer name removed from QaScreen');
  assert.equal(text.includes('ClickableSources'), false, 'ClickableSources absent from QaScreen');
  view.unmount();
});

function makeReviewedPayload(fixtureData) {
  const ts = '2026-10-16T02:00:00.000Z';
  return {
    schemaVersion: 1,
    kind: 'reviewed',
    reviewStatus: 'approved',
    updatedAt: ts,
    disclaimer: 'Dữ liệu đã duyệt theo quy trình.',
    intro: {
      text: 'Lời giới thiệu đã được duyệt.',
      evidence: ['Nguồn lưu trữ số 12'],
      reviewStatus: 'approved',
      updatedAt: ts,
    },
    startNodeId: 'demo-01',
    nodes: fixtureData.nodes.map((node) => ({
      ...node,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
    qa: fixtureData.qa.map((qa) => ({
      ...qa,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
  };
}

function makeSimulatedPayload(fixtureData) {
  return {
    schemaVersion: 1,
    kind: 'simulated',
    disclaimer: 'Dữ liệu mô phỏng.',
    intro: {
      text: 'Lời giới thiệu mô phỏng.',
      evidence: ['Nguồn mô phỏng'],
    },
    startNodeId: 'demo-01',
    nodes: fixtureData.nodes.map((node) => ({ ...node })),
    qa: fixtureData.qa.map((qa) => ({ ...qa })),
  };
}

test('P2-1: NotebookDrawerModal with real getSourceState demo in VI and EN omits redundant status while preserving mode controls', () => {
  // 1. VI locale with real getSourceState demo
  const realDemoVi = sources.getSourceState('demo', fixture, 'vi');
  assert.equal(realDemoVi.title, 'Đã nạp 6 điểm mô phỏng');
  assert.ok(realDemoVi.detail.includes('Nguồn: data/demo.json trong bundle'));

  let switchedModeVi = null;
  const viewVi = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'demo',
    source: realDemoVi,
    onModeChange(m) { switchedModeVi = m; },
    liveBusy: false,
    collectionId: 'fiction-letter',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeVi = viewVi.render();
  const visibleTextsVi = elements(treeVi, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textVi = visibleTextsVi.join(' ');

  // Redundant status block completely omitted from visible text
  assert.equal(textVi.includes('Đã nạp 6 điểm mô phỏng'), false, 'real demo title omitted from visible text');
  assert.equal(textVi.includes('mô phỏng'), false, 'no simulated label in visible text');
  assert.equal(textVi.includes('Nguồn:'), false, 'no source label in visible text');
  assert.equal(textVi.includes('đã duyệt'), false, 'no reviewed label in visible text');

  // Mode radio controls present and interactive
  const demoRadioVi = elements(treeVi, 'Pressable').find((p) => p.props.testID === 'notebook-mode-demo');
  const liveRadioVi = elements(treeVi, 'Pressable').find((p) => p.props.testID === 'notebook-mode-live');
  assert.ok(demoRadioVi && liveRadioVi, 'mode radio controls preserved');
  assert.equal(demoRadioVi.props.accessibilityState?.checked, true, 'demo radio checked');
  assert.equal(liveRadioVi.props.accessibilityState?.checked, false, 'live radio unchecked');
  liveRadioVi.props.onPress();
  assert.equal(switchedModeVi, 'live', 'mode switch callback functional');
  viewVi.unmount();

  // 2. EN locale with real getSourceState demo
  const realDemoEn = sources.getSourceState('demo', fixture, 'en');
  assert.equal(realDemoEn.title, 'Loaded 6 simulated points');
  assert.ok(realDemoEn.detail.includes('Source: bundled fixture'));

  const viewEn = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'demo',
    source: realDemoEn,
    onModeChange() {},
    liveBusy: false,
    collectionId: 'fiction-letter',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (k, p) => translator.t('en', k, p),
      }),
    },
  });

  const treeEn = viewEn.render();
  const visibleTextsEn = elements(treeEn, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textEn = visibleTextsEn.join(' ');

  assert.equal(textEn.includes('Loaded 6 simulated points'), false, 'real demo title omitted from EN visible text');
  assert.equal(textEn.includes('simulated'), false, 'no simulated label in EN visible text');
  assert.equal(textEn.includes('Source:'), false, 'no source label in EN visible text');
  assert.equal(textEn.includes('reviewed'), false, 'no reviewed label in EN visible text');
  viewEn.unmount();
});

test('P2-1: NotebookDrawerModal with real loadLiveSource reviewed and simulated payloads in VI and EN', async () => {
  // 1. Real reviewed response in VI
  const liveReviewedVi = await live.loadLiveSource({
    baseUrl: 'http://127.0.0.1:8080',
    fetchImpl: async () => new Response(JSON.stringify(makeReviewedPayload(fixture)), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });
  assert.equal(liveReviewedVi.status, 'ready');
  assert.equal(liveReviewedVi.title, 'Live · 6 điểm đã duyệt');
  assert.ok(liveReviewedVi.detail.includes('Nguồn: http://127.0.0.1:8080'));

  let retryCount = 0;
  const viewReviewedVi = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: liveReviewedVi,
    onModeChange() {},
    liveBusy: false,
    onRetryLive: () => { retryCount++; },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeReviewedVi = viewReviewedVi.render();
  const visibleReviewedVi = elements(treeReviewedVi, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textReviewedVi = visibleReviewedVi.join(' ');

  assert.equal(textReviewedVi.includes('Live · 6 điểm đã duyệt'), false, 'real reviewed title omitted from visible text');
  assert.equal(textReviewedVi.includes('đã duyệt'), false, 'no reviewed label in visible text');
  assert.equal(textReviewedVi.includes('Nguồn:'), false, 'no source label in visible text');
  assert.equal(textReviewedVi.includes('mô phỏng'), false, 'no simulated label in visible text');

  // Retry button is available in live ready
  const retryBtnVi = elements(treeReviewedVi, 'Pressable').find((p) => p.props.testID === 'notebook-retry-live-btn');
  assert.ok(retryBtnVi, 'retry button available in live mode');
  retryBtnVi.props.onPress();
  assert.equal(retryCount, 1, 'retry callback triggered');
  viewReviewedVi.unmount();

  // 2. Real simulated response in VI
  const liveSimulatedVi = await live.loadLiveSource({
    baseUrl: 'http://127.0.0.1:8080',
    fetchImpl: async () => new Response(JSON.stringify(makeSimulatedPayload(fixture)), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });
  assert.equal(liveSimulatedVi.status, 'ready');
  assert.equal(liveSimulatedVi.title, 'Live · 6 điểm mô phỏng (chưa xác minh)');

  const viewSimulatedVi = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: liveSimulatedVi,
    onModeChange() {},
    liveBusy: false,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeSimulatedVi = viewSimulatedVi.render();
  const visibleSimulatedVi = elements(treeSimulatedVi, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textSimulatedVi = visibleSimulatedVi.join(' ');

  assert.equal(textSimulatedVi.includes('Live · 6 điểm mô phỏng (chưa xác minh)'), false, 'real simulated title omitted from visible text');
  assert.equal(textSimulatedVi.includes('mô phỏng'), false, 'no simulated label in visible text');
  assert.equal(textSimulatedVi.includes('chưa xác minh'), false, 'no unverified label in visible text');
  assert.equal(textSimulatedVi.includes('Nguồn:'), false, 'no source label in visible text');
  viewSimulatedVi.unmount();
});

test('P2-1: NotebookDrawerModal loading/busy, empty and error functionality', () => {
  // 1. Loading / busy state
  const viewBusy = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: sources.liveEmpty('no-config', 'vi'),
    onModeChange() {},
    liveBusy: true,
    onRetryLive() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeBusy = viewBusy.render();
  const visibleBusy = elements(treeBusy, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textBusy = visibleBusy.join(' ');
  assert.ok(textBusy.includes('Đang lấy dữ liệu live…'), 'shows live loading title');
  assert.ok(textBusy.includes('Đang kết nối để tải dữ liệu trực tiếp…'), 'shows live loading body');
  const retryBtn = elements(treeBusy, 'Pressable').find((p) => p.props.testID === 'notebook-retry-live-btn');
  assert.equal(retryBtn.props.disabled, true, 'retry button disabled when busy');
  viewBusy.unmount();

  // 2. Empty state (no-config)
  const viewEmpty = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: sources.liveEmpty('no-config', 'vi'),
    onModeChange() {},
    liveBusy: false,
    onRetryLive() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeEmpty = viewEmpty.render();
  const visibleEmpty = elements(treeEmpty, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textEmpty = visibleEmpty.join(' ');
  assert.ok(textEmpty.includes('Live chưa được cấu hình'), 'shows empty state operational title');
  assert.ok(textEmpty.includes('Chưa có URL backend'), 'shows empty state guidance');
  viewEmpty.unmount();

  // 3. Error state
  const viewError = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    source: {
      mode: 'live',
      status: 'error',
      title: 'Máy chủ live trả lỗi',
      detail: 'Máy chủ không trả về dữ liệu hợp lệ.',
    },
    onModeChange() {},
    liveBusy: false,
    onRetryLive() {},
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeError = viewError.render();
  const visibleError = elements(treeError, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textError = visibleError.join(' ');
  assert.ok(textError.includes('Máy chủ live trả lỗi'), 'shows error operational title');
  assert.ok(textError.includes('Máy chủ không trả về dữ liệu hợp lệ.'), 'shows error detail');
  viewError.unmount();
});

test('P2-2: AlleySelectScreen removes source badges, Bia minh hoa, and unclutters hint and meta info', async () => {
  // 1. Demo mode in VI
  const viewDemoVi = createTestMount('../src/screens/AlleySelectScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    mode: 'demo',
    nodeCount: 6,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeDemoVi = viewDemoVi.render();
  const visibleDemoVi = elements(treeDemoVi, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textDemoVi = visibleDemoVi.join(' ');

  // Card meta info contains point count without mode suffix or "Bìa minh họa"
  assert.ok(textDemoVi.includes('6 điểm'), 'card meta renders count');
  assert.equal(textDemoVi.includes('Demo'), false, 'Demo removed from meta');
  assert.equal(textDemoVi.includes('DEMO'), false, 'DEMO removed from header/card');
  assert.equal(textDemoVi.includes('Bìa minh họa'), false, 'Bìa minh họa removed from meta');
  assert.equal(textDemoVi.includes('Cover photo'), false, 'Cover photo removed');
  assert.equal(textDemoVi.includes('từ nguồn'), false, 'từ nguồn removed from hint');
  assert.ok(textDemoVi.includes('Chọn con ngõ bên dưới để mở các điểm khám phá'), 'clean hint rendered without mode suffix');

  // GPS area has bare area status and location name
  assert.ok(textDemoVi.includes('KHU VỰC KHÁM PHÁ'), 'mode-neutral area label present');
  assert.equal(textDemoVi.includes('KHU VỰC DEMO'), false, 'demo area label removed');
  assert.ok(textDemoVi.includes('Phố cổ Hà Nội'), 'demo location name present');
  assert.equal(textDemoVi.includes('mô phỏng'), false, 'no simulated qualifier in location name');
  viewDemoVi.unmount();

  // 2. Demo mode in EN
  const viewDemoEn = createTestMount('../src/screens/AlleySelectScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    mode: 'demo',
    nodeCount: 6,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (k, p) => translator.t('en', k, p),
      }),
    },
  });

  const treeDemoEn = viewDemoEn.render();
  const visibleDemoEn = elements(treeDemoEn, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textDemoEn = visibleDemoEn.join(' ');

  assert.ok(textDemoEn.includes('6 stops'), 'EN card meta renders stops without mode');
  assert.equal(textDemoEn.includes('Demo'), false, 'Demo removed in EN');
  assert.equal(textDemoEn.includes('DEMO'), false, 'DEMO removed from header/card in EN');
  assert.equal(textDemoEn.includes('Cover photo'), false, 'Cover photo removed in EN');
  assert.equal(textDemoEn.includes('from Demo source'), false, 'from source removed from EN hint');
  assert.ok(textDemoEn.includes('EXPLORATION AREA'), 'EN mode-neutral area label present');
  assert.equal(textDemoEn.includes('DEMO AREA'), false, 'EN demo area label removed');
  assert.ok(textDemoEn.includes('Hanoi Old Quarter'), 'EN demo location name present');
  assert.equal(textDemoEn.includes('simulated'), false, 'no simulated label in EN');
  viewDemoEn.unmount();

  // 3. Live ready mode with actual reviewed live source
  const liveReviewedVi = await live.loadLiveSource({
    baseUrl: 'http://127.0.0.1:8080',
    fetchImpl: async () => new Response(JSON.stringify(makeReviewedPayload(fixture)), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });
  assert.equal(liveReviewedVi.status, 'ready');

  const viewLiveVi = createTestMount('../src/screens/AlleySelectScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    mode: 'live',
    nodeCount: 6,
    liveSource: liveReviewedVi,
    liveBusy: false,
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeLiveVi = viewLiveVi.render();
  const visibleLiveVi = elements(treeLiveVi, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textLiveVi = visibleLiveVi.join(' ');

  assert.ok(textLiveVi.includes('6 điểm'), 'card meta renders count without Live');
  assert.equal(textLiveVi.includes('Live'), false, 'Live label removed');
  assert.equal(textLiveVi.includes('LIVE'), false, 'LIVE badge removed');
  assert.equal(textLiveVi.includes('Nguồn máy chủ Live'), false, 'Nguồn máy chủ Live badge removed');
  assert.equal(textLiveVi.includes('Bìa minh họa'), false, 'Bìa minh họa removed');
  assert.equal(textLiveVi.includes('đã duyệt'), false, 'no reviewed provenance label');
  assert.equal(textLiveVi.includes('mô phỏng'), false, 'no simulated label');
  viewLiveVi.unmount();

  // 4. Live error and retry state
  let retryTriggered = false;
  const viewLiveError = createTestMount('../src/screens/AlleySelectScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    mode: 'live',
    nodeCount: 0,
    liveSource: {
      mode: 'live',
      status: 'error',
      title: 'Lỗi kết nối máy chủ',
      detail: 'Không thể kết nối tới backend.',
    },
    liveBusy: false,
    onRetryLive: () => { retryTriggered = true; },
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const treeLiveError = viewLiveError.render();
  const visibleLiveError = elements(treeLiveError, 'Text').map((t) => [].concat(t.props?.children ?? []).join('')).filter(Boolean);
  const textLiveError = visibleLiveError.join(' ');
  assert.ok(textLiveError.includes('Lỗi kết nối máy chủ'), 'operational error title visible');
  assert.ok(textLiveError.includes('Không thể kết nối tới backend.'), 'operational error detail visible');

  const retryBtn = elements(treeLiveError, 'Pressable').find((p) => p.props.testID === 'alley-retry-live-btn');
  assert.ok(retryBtn, 'retry button available on live error');
  retryBtn.props.onPress();
  assert.equal(retryTriggered, true, 'retry handler invoked');
  viewLiveError.unmount();
});

test('P2-3 and P3-c: i18n copy rewrites for voice plan, voice gps, and photo credit in VI and EN', () => {
  // P2-3: voice_plan_empty
  const planEmptyVi = translator.translate('vi', 'qa.voice_plan_empty');
  const planEmptyEn = translator.translate('en', 'qa.voice_plan_empty');
  assert.equal(planEmptyVi, 'Chưa có điểm phù hợp. Anh có thể đổi chủ đề hoặc thời gian.');
  assert.equal(planEmptyEn, 'No matching stops found. You can change topic or duration.');
  assert.equal(planEmptyVi.includes('mô phỏng'), false, 'voice_plan_empty VI has no mô phỏng');
  assert.equal(planEmptyEn.includes('demo dataset'), false, 'voice_plan_empty EN has no demo dataset');

  // P2-3: voice_gps_body
  const gpsBodyVi = translator.translate('vi', 'qa.voice_gps_body');
  const gpsBodyEn = translator.translate('en', 'qa.voice_gps_body');
  assert.equal(gpsBodyVi, 'Vị trí chỉ được đọc một lần sau khi anh chạm nút Dùng GPS.');
  assert.equal(gpsBodyEn, 'Location is read only once after tapping Use GPS.');
  assert.equal(gpsBodyVi.includes('mô phỏng'), false, 'voice_gps_body VI has no mô phỏng clause');
  assert.equal(gpsBodyEn.includes('Simulated'), false, 'voice_gps_body EN has no simulated clause');

  // P3-c: photo_credit and home.photo_credit
  assert.equal(translator.translate('vi', 'qa.photo_credit'), 'Ảnh');
  assert.equal(translator.translate('en', 'qa.photo_credit'), 'Photo');
  assert.equal(translator.translate('vi', 'home.photo_credit'), 'Ảnh');
  assert.equal(translator.translate('en', 'home.photo_credit'), 'Photo');
});

test('Phase C: Home and Q&A label cleanup - no Demo/Live in progress line, no photo credits, no ClickableSources, no About Content/Source section', () => {
  // 1. HomeScreen in VI removes Demo/Live from stories_opened progress line and photo credit from preview
  const homeProps = {
    mode: 'demo',
    source: {
      mode: 'demo',
      status: 'ready',
      title: 'Demo',
      detail: 'Sẵn sàng',
      dataset: reviewedPilotVi,
    },
    currentNodeId: reviewedPilotVi.nodes[0].id,
    onSelectNode() {},
    readNodeIds: new Set([reviewedPilotVi.nodes[0].id]),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
  };

  const homeViewVi = createTestMount('../src/screens/HomeScreen.tsx', homeProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });

  const homeTreeVi = homeViewVi.render();
  const homeTextVi = JSON.stringify(homeTreeVi);
  // Progress line has no Demo or Live
  assert.ok(homeTextVi.includes('Đã mở 1/3 câu chuyện'), 'progress title renders clean count without mode');
  assert.equal(homeTextVi.includes('Đã mở 1/3 câu chuyện · Demo'), false, 'no Demo suffix in progress title');
  assert.equal(homeTextVi.includes('Đã mở 1/3 câu chuyện · Live'), false, 'no Live suffix in progress title');
  // Preview has no photo credit text or accessibilityHint with photo credit
  const preview = elements(homeTreeVi, 'Animated.View').find((v) => v.props.testID === 'home-selected-node-preview');
  assert.ok(preview, 'Home preview card present');
  assert.equal(Boolean(preview.props.accessibilityHint && preview.props.accessibilityHint.includes('Ảnh:')), false, 'no photo credit in accessibilityHint');
  assert.equal(homeTextVi.includes('previewCreditText'), false, 'previewCreditText style absent from Home');
  homeViewVi.unmount();

  // 2. HomeScreen in EN
  const homeViewEn = createTestMount('../src/screens/HomeScreen.tsx', homeProps, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'en',
        setLocale: () => {},
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (k, p) => translator.t('en', k, p),
      }),
    },
  });
  const homeTreeEn = homeViewEn.render();
  const homeTextEn = JSON.stringify(homeTreeEn);
  assert.ok(homeTextEn.includes('Opened 1/3 stories'), 'EN progress title renders clean count without mode');
  assert.equal(homeTextEn.includes('Opened 1/3 stories · Demo'), false, 'no Demo in EN progress');
  homeViewEn.unmount();

  // 3. NotebookDrawerModal preserves functional mode selector and has NO "Về nội dung và nguồn" section
  const notebookView = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture, 'vi'),
    onModeChange() {},
    collectionId: 'fiction-letter',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'fiction-letter',
        setCollectionId: () => {},
        t: (k, p) => translator.t('vi', k, p),
      }),
    },
  });
  const notebookTree = notebookView.render();
  const notebookText = JSON.stringify(notebookTree);
  assert.equal(notebookText.includes('Về nội dung và nguồn'), false, 'no About content-source section');
  assert.equal(notebookText.includes('About content and sources'), false, 'no EN about content-source');
  // Functional mode selector preserved
  const demoRadio = elements(notebookTree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-demo');
  const liveRadio = elements(notebookTree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-live');
  assert.ok(demoRadio, 'demo radio preserved');
  assert.ok(liveRadio, 'live radio preserved');
  notebookView.unmount();
});
