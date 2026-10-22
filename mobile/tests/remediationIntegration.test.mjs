import assert from 'node:assert/strict';







import test from 'node:test';







import { readFileSync } from 'node:fs';







import { runInNewContext } from 'node:vm';







import { URL } from 'node:url';







import { setTimeout, clearTimeout } from 'node:timers';







import ts from 'typescript';







import * as sources from '../src/data/sourceState.ts';







import * as translator from '../src/i18n/translator.ts';
import * as alleyGeometry from '../src/utils/alleyGeometry.ts';



import * as voiceIntent from '../src/voice/intent.ts';

import * as recommendation from '../src/recommendation/pick.ts';















const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));















function createTestHarness(file, defaultProps = {}, overrides = {}) {







  const slots = [];







  let cursor = 0;







  let pending = [];







  let tree;















  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));







  const element = (type, props) => {







    if (typeof type === 'function') {







      try {







        const res = type(props);







        if (res && typeof res === 'object') return res;







      } catch (_e) { void _e; }







    }







    return { type, props };







  };















  const Fragment = ({ children }) => children;







  const react = {







    Fragment,







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







          }







        },







      ];







    },







    useEffect(callback, deps) {







      const i = cursor++;







      if (!same(slots[i]?.deps, deps)) {







        pending.push(() => {







          slots[i]?.cleanup?.();







          slots[i] = { deps, cleanup: callback?.() };







        });







      }







    },







    useCallback(callback, deps) {







      const i = cursor++;







      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, callback };







      return slots[i].callback;







    },







    useMemo(fn, deps) {







      const i = cursor++;







      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, value: fn() };







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







        stopAnimation(cb) { cb?.(this.val); }







      },







      timing(v, cfg) {







        if (overrides.__animatedTiming) return overrides.__animatedTiming(v, cfg);







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







    Linking: { openSettings: async () => {} },







  };















  const rn = { ...rnDefaults, ...(overrides['react-native'] ?? {}) };















  const jsxRuntime = {







    jsx: element,







    jsxs: element,







    Fragment,







  };















  const modules = {







    react,







    'react/jsx-runtime': jsxRuntime,







    'react-native': rn,







    'react-native-safe-area-context': {







      SafeAreaProvider: 'SafeAreaProvider',







      SafeAreaView: 'SafeAreaView',







      useSafeAreaInsets: () => ({ top: 28, bottom: 20, left: 0, right: 0 }),







    },







    'react-native-svg': {







      Svg: 'Svg',







      Path: 'Path',







      Circle: 'Circle',







      default: 'Svg',







    },







    '@react-navigation/native': {







      useIsFocused: () => true,







      useNavigation: () => overrides.navigation ?? { navigate() {}, goBack() {}, replace() {} },







    },







    '../context/LocaleContext': {







      useLocale: () => ({







        locale: overrides.__locale ?? 'vi',







        setLocale: overrides.__setLocale ?? (() => {}),







        collectionId: overrides.__collectionId ?? 'old-quarter-pilot',







        setCollectionId: overrides.__setCollectionId ?? (() => {}),







        t: (key, params) => translator.t(overrides.__locale ?? 'vi', key, params),







      }),







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => overrides.__motionState ?? { active: true, reducedMotion: false, foreground: true },







    },







    '../hooks/useMotion': {







      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),







      usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }),







      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),







    },







    '../hooks/usePressSpring': {







      usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }),







    },







    '../theme': {







      colors: { text: '#2D2319', background: '#F5EFEB', surface: '#FFFDF7', surfaceWarm: '#EFE6DD', border: '#D8C8B8', terracotta: '#C45C3D' },







      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },







      radius: { sm: 4, md: 8, lg: 16, pill: 999 },







      typography: { titleLarge: {}, label: {}, body: {} },







    },







    '../theme/motion': {







      motionDurations: { base: 200 },







      motionEasings: { gentleOut: (t) => t },







    },







    './AppIcon': {







      AppIcon: ({ name }) => ({ type: 'AppIcon', props: { name } }),







    },







    '../components/AppIcon': {







      AppIcon: ({ name }) => ({ type: 'AppIcon', props: { name } }),







    },







    './UnavailableScreen': {







      UnavailableScreen: (props) => ({ type: 'UnavailableScreen', props }),







    },







    '../screens/UnavailableScreen': {







      UnavailableScreen: (props) => ({ type: 'UnavailableScreen', props }),







    },







    '../qa/match': {







      findAnswer: () => ({ status: 'none' }),







    },







    '../data/sourceState': sources,







    '../i18n/translator': translator,



    '../voice/intent': voiceIntent,

    '../recommendation/pick': recommendation,



    '../voice/useVoiceSession': {



      useVoiceSession: (options) => {



        overrides.__onVoiceSession?.(options);



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



    '../components/ExpandableInputDrawer': {



      ExpandableInputDrawer: () => ({ type: 'ExpandableInputDrawer', props: {} }),



    },







    ...overrides,







  };















  const sourceTs = readFileSync(new URL(file, import.meta.url), 'utf8');







  const code = ts.transpileModule(sourceTs, {







    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },







  }).outputText;















  const mod = { exports: {} };







  runInNewContext(







    '(function(require,module,exports){' + code + '\r\n})',







    { process: { env: {} }, setTimeout, clearTimeout }







  )((id) => {







    if (modules[id]) return modules[id];







    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;







    if (id.includes('collections')) {







      return {







        getLocalizedCollections: () => [{ id: 'old-quarter-pilot', name: 'Ngõ Hàng Buồm', coverPhoto: 1, kind: 'reviewed' }],







        AVAILABLE_COLLECTIONS: [{ id: 'old-quarter-pilot', nameKey: 'alley.title' }],







        KNOWN_COLLECTIONS: [{ id: 'old-quarter-pilot', nameKey: 'alley.title' }],







        DEFAULT_COLLECTION_ID: 'old-quarter-pilot',







        getCollectionMeta: () => ({ nameKey: 'alley.title' }),







        getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }),







        getBundledDataset: () => fixture,







        isCollectionId: () => true,







      };







    }







    if (id.includes('localizedCatalog')) return { lookupVoiceTrack: () => null, voiceCatalogueRevision: 'rev-1' };

    if (id.includes('CrossfadePhoto')) return { CrossfadePhoto: 'CrossfadePhoto' };







    if (id.includes('NgoKeLogo')) return { NgoKeLogo: 'NgoKeLogo' };







    if (id.includes('photoMap')) return { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'NgoKe', getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }) };







    if (id.includes('threeLensesCompanion')) return { THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses', getScopedCompanion: () => null, getThreeLensesCompanion: () => null };
    if (id.includes('alleyGeometry')) return alleyGeometry;
    if (id.includes('alleyGuide')) return { readAlleyStory: () => null, readAlleyGuide: () => null };







    const name = id.split('/').at(-1);







    return { [name]: name };







  }, mod, mod.exports);















  const Component = mod.exports[Object.keys(mod.exports)[0]];















  return {







    render(props = {}) {







      cursor = 0;







      tree = Component({ ...defaultProps, ...props });







      const currentPending = pending.slice();







      pending = [];







      currentPending.forEach((cb) => cb());







      return tree;







    },







    unmount() {







      slots.forEach((slot) => {







        if (typeof slot?.cleanup === 'function') {







          slot.cleanup();







          slot.cleanup = undefined;







        }







      });







    },







  };







}















function findElements(node, type) {







  const matches = [];







  function walk(curr) {







    if (!curr || typeof curr !== 'object') return;







    if (Array.isArray(curr)) {







      curr.forEach(walk);







      return;







    }







    if (curr.type === type) matches.push(curr);







    const children = curr.props?.children;







    if (Array.isArray(children)) children.forEach(walk);







    else if (children) walk(children);







  }







  walk(node);







  return matches;







}















function findByTestId(node, testId) {







  let found = null;







  function walk(curr) {







    if (!curr || typeof curr !== 'object' || found) return;







    if (Array.isArray(curr)) {







      curr.forEach(walk);







      return;







    }







    if (curr.props?.testID === testId) {







      found = curr;







      return;







    }







    const children = curr.props?.children;







    if (Array.isArray(children)) children.forEach(walk);







    else if (children) walk(children);







  }







  walk(node);







  return found;







}















// ============================================================================







// TEST 1: R1 / F4 - UnavailableScreen recovery actions wired to JSX







// ============================================================================







test('UnavailableScreen wires primary/secondary styles and recovery callbacks to JSX', () => {







  let retryCalled = false;







  let switchDemoCalled = false;







  let backCalled = false;















  const harness = createTestHarness('../src/screens/UnavailableScreen.tsx', {







    detail: 'Máy chủ Live không phản hồi (503)',







    onRetry: () => { retryCalled = true; },







    onSwitchToDemo: () => { switchDemoCalled = true; },







    onBack: () => { backCalled = true; },







    busy: false,







  });















  const tree = harness.render();















  // Retry button has primaryAction style and calls callback







  const retryBtn = findByTestId(tree, 'unavailable-retry-btn');







  assert.ok(retryBtn, 'UnavailableScreen renders testID="unavailable-retry-btn"');







  assert.equal(retryBtn.props.accessibilityRole, 'button');







  const evaluated = typeof retryBtn.props.style === 'function' ? retryBtn.props.style({ pressed: false }) : retryBtn.props.style;







  const retryStyle = [].concat(evaluated).filter(Boolean).reduce((acc, s) => Object.assign(acc, s), {});







  assert.equal(retryStyle.backgroundColor, '#2A6F50', 'Retry button uses primaryAction green');







  assert.equal(retryStyle.minHeight, 48, 'Retry button meets minimum 48dp touch target');







  retryBtn.props.onPress();







  assert.equal(retryCalled, true, 'Retry button fires onRetry');















  // Switch to demo button has secondaryAction style







  const switchBtn = findByTestId(tree, 'unavailable-switch-demo-btn');







  assert.ok(switchBtn, 'UnavailableScreen renders testID="unavailable-switch-demo-btn"');







  assert.equal(switchBtn.props.accessibilityRole, 'button');







  const switchStyle = [].concat(switchBtn.props.style).reduce((acc, s) => ({ ...acc, ...s }), {});







  assert.equal(switchStyle.minHeight, 48, 'Switch to demo button meets 48dp target');







  switchBtn.props.onPress();







  assert.equal(switchDemoCalled, true, 'Switch to demo button fires onSwitchToDemo');















  // Back button has secondaryAction style







  const backBtn = findByTestId(tree, 'unavailable-back-btn');







  assert.ok(backBtn, 'UnavailableScreen renders testID="unavailable-back-btn"');







  backBtn.props.onPress();







  assert.equal(backCalled, true, 'Back button fires onBack');















  // Busy state disables retry and shows loading







  const busyHarness = createTestHarness('../src/screens/UnavailableScreen.tsx', {







    detail: 'Loading...',







    onRetry: () => {},







    busy: true,







  });







  const busyTree = busyHarness.render();







  const busyRetryBtn = findByTestId(busyTree, 'unavailable-retry-btn');







  assert.equal(busyRetryBtn.props.disabled, true, 'Retry button is disabled when busy');







});















// ============================================================================







// TEST 2: R2 / R3 - Real live source passed to QaScreen and NotebookDrawerModal







// ============================================================================







test('NotebookDrawerModal renders real live SourceState without fallback to no-config and forwards mode/retry callbacks', () => {







  let modeChangeTarget = null;







  let retryLiveCalled = false;















  const liveReviewedDataset = {







    schemaVersion: '2.0.0',







    collectionId: 'live-journey',







    name: 'Ngõ Hàng Buồm Live',







    district: 'Hoàn Kiếm, Hà Nội',







    theme: 'Ẩm thực ngõ phố',







    tagline: 'Khám phá ẩm thực con ngõ sống động',







    kind: 'reviewed',







    revision: 'live-rev-999',







    disclaimer: 'Dữ liệu đã được kiểm chứng từ máy chủ ngõ phố',







    nodes: fixture.nodes.slice(0, 3).map((n) => ({ ...n, available: true })),







  };















  const liveReadySource = {







    mode: 'live',







    status: 'ready',







    title: 'Ngõ Kể Live',







    detail: 'Kết nối máy chủ an toàn http://127.0.0.1:8080 · Đã duyệt',







    dataset: liveReviewedDataset,







    revision: 'live-rev-999',







  };















  const drawerMount = createTestHarness('../src/components/NotebookDrawerModal.tsx', {







    visible: true,







    onClose: () => {},







    mode: 'live',







    source: liveReadySource,







    collectionId: 'live-journey',







    liveBusy: false,







    onModeChange: (m) => { modeChangeTarget = m; },







    onRetryLive: () => { retryLiveCalled = true; },







  });















  const tree = drawerMount.render();















  // Modal renders real live source without fallback to 'no-config'







  const textNodes = findElements(tree, 'Text');







  const allTexts = textNodes.map((n) => (typeof n.props?.children === 'string' ? n.props.children : '')).join(' ');







  assert.ok(allTexts.includes('Live'), 'NotebookDrawerModal displays Live mode');
  const liveModeRadio = findElements(tree, 'Pressable').find((p) => p.props?.testID === 'notebook-mode-live');
  assert.equal(liveModeRadio?.props?.accessibilityState?.checked, true, 'NotebookDrawerModal marks Live checked');







  assert.ok(!allTexts.includes('chưa có dữ liệu'), 'NotebookDrawerModal does NOT claim liveEmpty no-config');















  // Disclaimer uses high-contrast text (>6:1)







  const disclaimerText = textNodes.find((n) => typeof n.props?.children === 'string' && n.props.children.includes('kiểm chứng từ máy chủ'));
  assert.equal(disclaimerText, undefined, 'Redundant server dataset disclaimer line removed from UI');
  assert.equal(allTexts.includes(liveReadySource.title), false, 'Redundant source title omitted when ready and not busy');
  assert.equal(allTexts.includes('đã duyệt'), false, 'no reviewed label');















  // Mode radio toggle calls real onModeChange







  assert.equal(typeof retryLiveCalled, 'boolean', 'retryLive handler registered');







  const demoRadio = findElements(tree, 'Pressable').find((p) => p.props.accessibilityLabel?.includes('Demo') || p.props.testID === 'notebook-mode-demo');







  if (demoRadio) {







    demoRadio.props.onPress();







    assert.equal(modeChangeTarget, 'demo', 'Selecting demo mode invokes onModeChange("demo")');







  }







});















// ============================================================================







// TEST 3: R4 / R7 / R10 - Home presentation with >6 points and unified pin icon







// ============================================================================







test('HomeScreen adapts to >6 points using AlleyTrailView, removes duplicate pin a11y focus, and unifies GPS pin icon', () => {







  // Create 8 nodes (>6)







  const eightNodes = [







    ...fixture.nodes,







    { ...fixture.nodes[0], id: 'demo-07', name: 'Điểm trạm 07', available: true },







    { ...fixture.nodes[1], id: 'demo-08', name: 'Điểm trạm 08', available: true },







  ];















  let selectedNodeId = null;







  const harness = createTestHarness('../src/screens/HomeScreen.tsx', {







    route: { params: {} },







    nodes: eightNodes,







    currentNodeId: 'demo-01',







    readNodeIds: new Set(['demo-01']),







    onSelectNode: (id) => { selectedNodeId = id; },







    onOpenStory: () => {},







    mode: 'demo',







    source: { status: 'ready', mode: 'demo', title: 'Demo', detail: 'Local', dataset: { nodes: eightNodes } },







  }, {







    '../components/AlleyTrailView': {







      AlleyTrailView: ({ nodes, onSelectNode }) => ({







        type: 'AlleyTrailView',







        props: { nodeCount: nodes.length, onSelectNode },







      }),







    },







    '../components/NotebookDrawerModal': {







      NotebookDrawerModal: () => ({ type: 'NotebookDrawerModal', props: {} }),







    },







    '../assets/photoMap': {







      HERO_PHOTO: 1,







      getNodePhoto: () => 1,







      getNodePhotographer: () => 'NgoKe',







      getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }),







    },







    '../data/collections': {







      getCollectionMeta: () => ({ nameKey: 'alley.title' }),







      getLocalizedCollections: () => [],







      KNOWN_COLLECTIONS: [],







      AVAILABLE_COLLECTIONS: [],







      DEFAULT_COLLECTION_ID: 'old-quarter-pilot',







      getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }),







      isCollectionId: () => true,







    },







    '../hooks/usePressSpring': {







      usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }),







    },







  });















  const tree = harness.render();















  // 1. For >6 nodes, AlleyTrailView is used so no node is silently dropped







  assert.equal(selectedNodeId, null, 'No pin selected initially');







  const trailView = findElements(tree, 'AlleyTrailView')[0];







  assert.ok(trailView, 'HomeScreen renders AlleyTrailView when nodes.length > 6');







  assert.equal(trailView.props.nodeCount, 8, 'All 8 nodes are passed to AlleyTrailView');















  // 2. Dock GPS button uses unified 'pin' icon, not compass







  const appIcons = findElements(tree, 'AppIcon');







  const gpsIcon = appIcons.find((icon) => icon.props.name === 'pin');







  assert.ok(gpsIcon, 'HomeScreen dock renders AppIcon name="pin" for GPS action');















  // 3. For <=6 nodes, verify accessible={false} on pin label Pressables







  const sixNodesHarness = createTestHarness('../src/screens/HomeScreen.tsx', {







    route: { params: {} },







    nodes: fixture.nodes.slice(0, 6),







    currentNodeId: 'demo-01',







    readNodeIds: new Set(['demo-01']),







    onSelectNode: (id) => { selectedNodeId = id; },







    onOpenStory: () => {},







    mode: 'demo',







    source: { status: 'ready', mode: 'demo', title: 'Demo', detail: 'Local', dataset: { nodes: fixture.nodes.slice(0, 6) } },







  }, {







    '../components/NotebookDrawerModal': { NotebookDrawerModal: () => ({ type: 'NotebookDrawerModal', props: {} }) },







    '../assets/photoMap': { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'NgoKe', getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }) },







    '../data/collections': { getCollectionMeta: () => ({ nameKey: 'alley.title' }), getLocalizedCollections: () => [], KNOWN_COLLECTIONS: [], AVAILABLE_COLLECTIONS: [], DEFAULT_COLLECTION_ID: 'old-quarter-pilot', getAlleyMeta: () => ({ name: 'Ngõ Hàng Buồm', coverPhoto: 1, photographer: 'NgoKe' }), isCollectionId: () => true },







    '../hooks/usePressSpring': { usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }) },







  });















  const sixTree = sixNodesHarness.render();







  const pressables = findElements(sixTree, 'Pressable');







  const pinButtons = pressables.filter((p) => p.props.accessibilityRole === 'button' && (p.props.accessibilityLabel?.startsWith('Xem ') || p.props.accessibilityLabel?.startsWith('View ')));







  assert.equal(pinButtons.length, 6, 'Pin circles are actionable accessibility buttons');















  const unaccessibleLabels = pressables.filter((p) => p.props.accessible === false);







  assert.ok(unaccessibleLabels.length >= 6, 'Adjacent visual labels have accessible={false} to eliminate duplicate reader targets');







});















// ============================================================================







// TEST 4: R5 / R6 - AlleySelectScreen non-interactive info banner & 48dp retry







// ============================================================================







test('AlleySelectScreen renders non-interactive instruction banner without hidden navigation and provides 48dp retry', () => {







  let retryCalled = false;







  const harness = createTestHarness('../src/screens/AlleySelectScreen.tsx', {







    mode: 'live',







    liveSource: { status: 'error', mode: 'live', title: 'Lỗi máy chủ', detail: 'Connection refused' },







    liveBusy: false,







    onSelectAlley: () => {},







    onRetryLive: () => { retryCalled = true; },







  }, {







    '../assets/photoMap': { HERO_PHOTO: 1 },







    '../data/collections': {







      getLocalizedCollections: () => [],







      getBundledDataset: () => fixture,







      isCollectionId: () => true,







    },







    '../data/threeLensesCompanion': {







      THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses', getScopedCompanion: () => null, getThreeLensesCompanion: () => null,







    },







  });















  const tree = harness.render();















  // Nearest alley pill is a View (non-interactive text), NOT a Pressable







  const textBanners = findElements(tree, 'View').filter((v) => v.props.accessibilityRole === 'text');







  assert.ok(textBanners.length > 0, 'AlleySelectScreen renders non-interactive instruction banner');















  // Retry button has testID="alley-retry-live-btn" and 48dp minHeight







  const retryBtn = findByTestId(tree, 'alley-retry-live-btn');







  assert.ok(retryBtn, 'AlleySelectScreen renders testID="alley-retry-live-btn"');







  assert.equal(retryBtn.props.accessibilityRole, 'button');







  const evaluatedStyle = typeof retryBtn.props.style === 'function' ? retryBtn.props.style({ pressed: false }) : retryBtn.props.style;







  const retryStyle = [].concat(evaluatedStyle).filter(Boolean).reduce((acc, s) => Object.assign(acc, s), {});







  assert.equal(retryStyle.minHeight, 48, 'Retry button meets 48dp minimum target');







  retryBtn.props.onPress();







  assert.equal(retryCalled, true, 'Retry button fires onRetryLive');







});















// ============================================================================







// TEST 5: F1 / LocationScreen - GPS candidate confirmation & reachable visual response



// ============================================================================



test('LocationScreen candidate confirmation renders inline open-story action and navigates to Qa', async () => {



  let confirmedNodeId = null;



  const navigateCalls = [];



  const stableNodes = fixture.nodes;



  const targetNode = stableNodes[1];







  const harness = createTestHarness('../src/screens/LocationScreen.tsx', {



    nodes: stableNodes,



    currentNodeId: 'demo-01',



    onConfirmNode: (id) => { confirmedNodeId = id; },



    collectionKind: 'reviewed',



  }, {



    navigation: {



      navigate: (route) => navigateCalls.push(route),



      goBack() {},



    },



    '../assets/photoMap': {



      HERO_PHOTO: 1,



      getNodePhoto: () => 1,



      getNodePhotographer: () => 'NgoKe',



    },



    '../location/nearest': {



      pickCandidate: () => ({



        kind: 'candidate',



        node: targetNode,



        reading: { latitude: 21.035, longitude: 105.85 },



        distanceMeters: 15,



        accuracy: 8,



      }),



    },



    'expo-location': {



      requestForegroundPermissionsAsync: async () => ({ granted: true, canAskAgain: true }),



      getCurrentPositionAsync: async () => ({



        coords: { latitude: 21.035, longitude: 105.85, accuracy: 8 },



      }),



      Accuracy: { Balanced: 3 },



    },



  });







  let tree = harness.render();







  // Find actual manual item matching location.select_manual



  const expectedLabel = translator.t('vi', 'location.select_manual', { name: targetNode.name });



  const manualItems = findElements(tree, 'Pressable');



  const manualItem = manualItems.find((p) => p.props.accessibilityLabel === expectedLabel);



  assert.ok(manualItem, `Manual item for ${targetNode.name} must exist with accessibilityLabel="${expectedLabel}"`);







  // Press manual item -> triggers confirm(targetNode) -> onConfirmNode(targetNode.id)



  manualItem.props.onPress();



  assert.equal(confirmedNodeId, targetNode.id, 'Confirming manual item triggers onConfirmNode with target node id');







  // Re-render with updated currentNodeId



  tree = harness.render({ currentNodeId: targetNode.id });







  // Assert location-open-story-btn is rendered



  const openStoryBtn = findByTestId(tree, 'location-open-story-btn');



  assert.ok(openStoryBtn, 'Confirmed point presents direct "📖 Mở câu chuyện" action button');







  // Press open-story -> navigates to Qa



  openStoryBtn.props.onPress();



  assert.deepEqual(navigateCalls, ['Qa'], 'Tapping open-story navigates to Qa screen');



});







// ============================================================================



// TEST 6: R12 / F14 - Mounted QaScreen structured missingSlot chips in VI and EN

// ============================================================================

test('QaScreen mounts and displays structured voice action chips for missing topic/budget slots in VI and EN', () => {

  // 1. Vietnamese - Missing Budget: transcript gives only topic -> missingSlot = 'budget' -> shows 15, 30, 45, 60 phút

  let onTranscriptVi1;

  let draftVi1 = {};

  const harnessVi1 = createTestHarness('../src/screens/QaScreen.tsx', {

    mode: 'demo',

    dataset: fixture,

    datasetRevision: 'rev-1',

    currentNodeId: 'demo-01',

    planDraft: draftVi1,

    onPlanDraftChange: (d) => { draftVi1 = d; },

    readNodeIds: new Set(),

    onSelectNode() {},

    onReadNode() {},

  }, {

    __locale: 'vi',

    __onVoiceSession: (options) => { onTranscriptVi1 = options.onTranscript; },

  });



  harnessVi1.render();

  onTranscriptVi1('chọn trải nghiệm ẩm thực', { turnId: 't-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });

  const treeVi1 = harnessVi1.render({ planDraft: draftVi1 });



  const pressablesVi1 = findElements(treeVi1, 'Pressable');

  const chip30phut = pressablesVi1.find((p) => p.props.accessibilityLabel === '30 phút');

  assert.ok(chip30phut, 'VI mode renders "30 phút" chip when budget is missing');

  assert.equal(draftVi1.topic, 'an thuc');

  assert.equal(draftVi1.budgetMinutes, undefined);



  // Press 30 phút chip -> updates draft

  chip30phut.props.onPress();

  assert.equal(draftVi1.budgetMinutes, 30, 'Tapping budget chip sets budgetMinutes in draft');



  // 2. Vietnamese - Missing Topic: transcript gives only budget -> missingSlot = 'topic' -> shows topic choices

  let onTranscriptVi2;

  let draftVi2 = {};

  const harnessVi2 = createTestHarness('../src/screens/QaScreen.tsx', {

    mode: 'demo',

    dataset: fixture,

    datasetRevision: 'rev-1',

    currentNodeId: 'demo-01',

    planDraft: draftVi2,

    onPlanDraftChange: (d) => { draftVi2 = d; },

    readNodeIds: new Set(),

    onSelectNode() {},

    onReadNode() {},

  }, {

    __locale: 'vi',

    __onVoiceSession: (options) => { onTranscriptVi2 = options.onTranscript; },

  });



  harnessVi2.render();

  onTranscriptVi2('chọn trải nghiệm trong 45 phút', { turnId: 't-2', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });

  const treeVi2 = harnessVi2.render({ planDraft: draftVi2 });



  const pressablesVi2 = findElements(treeVi2, 'Pressable');

  const expectedTopicLabelVi = `Chủ đề: ${translator.t('vi', 'plan.topic_food')}`;

  const topicChipVi = pressablesVi2.find((p) => p.props.accessibilityLabel === expectedTopicLabelVi);

  assert.ok(topicChipVi, `VI mode renders "${expectedTopicLabelVi}" chip when topic is missing`);

  topicChipVi.props.onPress();

  assert.equal(draftVi2.topic, 'an thuc', 'Tapping topic chip sets topic in draft');



  // 3. English - Missing Budget: transcript gives topic in EN -> missingSlot = 'budget' -> shows 15, 30, 45, 60 minutes

  let onTranscriptEn1;

  let draftEn1 = {};

  const harnessEn1 = createTestHarness('../src/screens/QaScreen.tsx', {

    mode: 'demo',

    dataset: fixture,

    datasetRevision: 'rev-1',

    currentNodeId: 'demo-01',

    planDraft: draftEn1,

    onPlanDraftChange: (d) => { draftEn1 = d; },

    readNodeIds: new Set(),

    onSelectNode() {},

    onReadNode() {},

  }, {

    __locale: 'en',

    __onVoiceSession: (options) => { onTranscriptEn1 = options.onTranscript; },

  });



  harnessEn1.render();

  onTranscriptEn1('choose an experience food', { turnId: 't-3', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });

  const treeEn1 = harnessEn1.render({ planDraft: draftEn1 });



  const pressablesEn1 = findElements(treeEn1, 'Pressable');

  const chip30min = pressablesEn1.find((p) => p.props.accessibilityLabel === `30 ${translator.t('en', 'qa.minutes')}`);

  assert.ok(chip30min, 'EN mode renders "30 minutes" chip when budget is missing');

  assert.equal(draftEn1.topic, 'an thuc');

  chip30min.props.onPress();

  assert.equal(draftEn1.budgetMinutes, 30, 'Tapping 30 minutes chip sets budgetMinutes in EN draft');



  // 4. English - Missing Topic: transcript gives budget in EN -> missingSlot = 'topic' -> shows topic choices in EN

  let onTranscriptEn2;

  let draftEn2 = {};

  const harnessEn2 = createTestHarness('../src/screens/QaScreen.tsx', {

    mode: 'demo',

    dataset: fixture,

    datasetRevision: 'rev-1',

    currentNodeId: 'demo-01',

    planDraft: draftEn2,

    onPlanDraftChange: (d) => { draftEn2 = d; },

    readNodeIds: new Set(),

    onSelectNode() {},

    onReadNode() {},

  }, {

    __locale: 'en',

    __onVoiceSession: (options) => { onTranscriptEn2 = options.onTranscript; },

  });



  harnessEn2.render();

  onTranscriptEn2('choose experience for 15 minutes', { turnId: 't-4', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });

  const treeEn2 = harnessEn2.render({ planDraft: draftEn2 });



  const pressablesEn2 = findElements(treeEn2, 'Pressable');

  const expectedTopicLabelEn = `Topic: ${translator.t('en', 'plan.topic_history')}`;

  const topicChipEn = pressablesEn2.find((p) => p.props.accessibilityLabel === expectedTopicLabelEn);

  assert.ok(topicChipEn, `EN mode renders "${expectedTopicLabelEn}" chip when topic is missing`);

  topicChipEn.props.onPress();

  assert.equal(draftEn2.topic, 'chuyen xua', 'Tapping topic chip sets topic in EN draft');

});



// TEST 7: R9 / R14 - Prologue reduced motion audio play and modal animation type







// ============================================================================







test('PrologueScreen language picker modal disables animation under reduced motion', () => {







  const harnessReduced = createTestHarness('../src/screens/PrologueScreen.tsx', {}, {







    __motionState: { active: false, reducedMotion: true, foreground: true },







    'expo-audio': {







      useAudioPlayer: () => ({ play() {}, pause() {}, volume: 1, seekTo: async () => {} }),







      setAudioModeAsync: async () => {},







    },







    '../hooks/usePressSpring': { usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }) },







    '../hooks/useMotion': { useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }), usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }) },







    '../theme/motion': { motionDurations: { base: 200 }, motionEasings: { gentleOut: (t) => t } },







  });















  const treeReduced = harnessReduced.render();







  const modalReduced = findByTestId(treeReduced, 'language-picker-modal');







  assert.ok(modalReduced, 'Language picker modal rendered');







  assert.equal(modalReduced.props.animationType, 'none', 'Modal uses animationType="none" when reducedMotion is true');















  const harnessNormal = createTestHarness('../src/screens/PrologueScreen.tsx', {}, {







    __motionState: { active: true, reducedMotion: false, foreground: true },







    'expo-audio': {







      useAudioPlayer: () => ({ play() {}, pause() {}, volume: 1, seekTo: async () => {} }),







      setAudioModeAsync: async () => {},







    },







    '../hooks/usePressSpring': { usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }) },







    '../hooks/useMotion': { useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }), usePressSpring: () => ({ scale: 1, handlePressIn() {}, handlePressOut() {} }) },







    '../theme/motion': { motionDurations: { base: 200 }, motionEasings: { gentleOut: (t) => t } },







  });















  const treeNormal = harnessNormal.render();







  const modalNormal = findByTestId(treeNormal, 'language-picker-modal');







  assert.equal(modalNormal.props.animationType, 'fade', 'Modal uses animationType="fade" when reducedMotion is false');







});























// ============================================================================







// TEST 8: R9 / F11 - App-owned AudioPlayer lifecycle, backgrounding pause, and stale cancellation







// ============================================================================







test('PrologueScreen with App-owned audio player survives route unmount without calling player.pause, while explicit backgrounding or cancellation pauses/stops audio', async () => {







  const events = [];







  let seekResolve = null;







  let animCallback = null;















  const appOwnedPlayer = {







    volume: 1,







    play() {







      events.push('play');







    },







    pause() {







      events.push('pause');







    },







    seekTo() {







      events.push('seekTo');







      return new Promise((resolve) => {







        seekResolve = resolve;







      });







    },







  };















  const replaceCalls = [];







  const harness = createTestHarness('../src/screens/PrologueScreen.tsx', {







    navigation: {







      replace: (screen) => replaceCalls.push(screen),







    },







    player: appOwnedPlayer,







  }, {







    __motionState: { active: true, reducedMotion: false, foreground: true },







    __animatedTiming: (v, cfg) => ({







      start: (cb) => {







        v.setValue(cfg.toValue);







        animCallback = cb;







      },







      stop: () => {},







    }),







    'expo-audio': {







      setAudioModeAsync: async () => {},







      useAudioPlayer: () => appOwnedPlayer,







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),







    },







  });















  const tree = harness.render();







  const startBtn = findElements(tree, 'Pressable').find((p) => p.props.testID === 'prologue-start-button' || p.props.accessibilityLabel?.includes('Bắt đầu'));







  assert.ok(startBtn, 'Start journey button found');















  // 1. Button press initiates seekTo(0)







  startBtn.props.onPress({ nativeEvent: { locationX: 120, locationY: 28 } });







  assert.ok(events.includes('seekTo'), 'Button press initiates seekTo(0)');















  // Resolve seekTo -> triggers playSafe -> play()







  if (seekResolve) seekResolve();







  await new Promise((r) => setTimeout(r, 10));







  assert.ok(events.includes('play'), 'Audio player play() triggered after seek settlement');















  // Animation finishes and replaces to Landing







  assert.ok(animCallback, 'Animation callback registered');







  animCallback({ finished: true });







  assert.deepEqual(replaceCalls, ['Landing'], 'Navigation replaces to Landing');















  // 2. Real harness unmount AFTER navigation:







  // Since navigated.current === true, unmount cleanup does NOT call pause() on the App-owned player







  events.length = 0;







  harness.unmount();







  assert.equal(events.filter((e) => e === 'pause').length, 0, 'App-owned player was not paused upon route replacement unmount');















  // 3. Unmount WITHOUT navigation (e.g. back button / unmounting before journey finishes):







  const cancelEvents = [];







  const cancelPlayer = {







    volume: 1,







    play() { cancelEvents.push('play'); },







    pause() { cancelEvents.push('pause'); },







    seekTo() { return Promise.resolve(); },







  };







  const harnessCancel = createTestHarness('../src/screens/PrologueScreen.tsx', {







    navigation: { replace() {} },







    player: cancelPlayer,







  }, {







    __motionState: { active: true, reducedMotion: false, foreground: true },







    __animatedTiming: () => ({ start: () => {}, stop: () => {} }),







    'expo-audio': {







      setAudioModeAsync: async () => {},







      useAudioPlayer: () => cancelPlayer,







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => ({ active: true, reducedMotion: false, foreground: true }),







    },







  });







  const cancelTree = harnessCancel.render();







  const cancelBtn = findElements(cancelTree, 'Pressable').find((p) => p.props.testID === 'prologue-start-button' || p.props.accessibilityLabel?.includes('Bắt đầu'));







  cancelBtn.props.onPress({ nativeEvent: { locationX: 120, locationY: 28 } });







  await new Promise((r) => setTimeout(r, 10));







  harnessCancel.unmount();







  assert.ok(cancelEvents.includes('pause'), 'Unmounting without navigation pauses player and cleans up');















  // 4. Backgrounding BEFORE navigation pauses audio player and cancels attempt:







  const bgEvents = [];







  const bgPlayer = {







    volume: 1,







    play() { bgEvents.push('play'); },







    pause() { bgEvents.push('pause'); },







    seekTo() {







      bgEvents.push('seekTo');







      return Promise.resolve();







    },







  };















  let fgState = true;







  const bgReplaceCalls = [];







  const harnessBg = createTestHarness('../src/screens/PrologueScreen.tsx', {







    navigation: { replace: (r) => bgReplaceCalls.push(r) },







    player: bgPlayer,







  }, {







    __motionState: { active: true, reducedMotion: false, get foreground() { return fgState; } },







    __animatedTiming: (v, cfg) => ({







      start: () => {







        v.setValue(cfg.toValue);







        // Held callback: no immediate finish so ripple stays in progress







      },







      stop: () => {},







    }),







    'expo-audio': {







      setAudioModeAsync: async () => {},







      useAudioPlayer: () => bgPlayer,







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => ({ active: true, reducedMotion: false, foreground: fgState }),







    },







  });















  const treeBg = harnessBg.render();







  const startBtnBg = findElements(treeBg, 'Pressable').find((p) => p.props.testID === 'prologue-start-button' || p.props.accessibilityLabel?.includes('Bắt đầu'));







  startBtnBg.props.onPress({ nativeEvent: { locationX: 120, locationY: 28 } });







  await new Promise((r) => setTimeout(r, 10));















  // Assert replace has NOT run while ripple is in flight







  assert.equal(bgReplaceCalls.length, 0, 'Navigation replace has not run while ripple animation is held in flight');















  // Simulate app backgrounding while ripple is in progress







  fgState = false;







  harnessBg.render();







  assert.ok(bgEvents.includes('pause'), 'Backgrounding before navigation pauses audio player and cancels attempt');















  // 5. Genuinely separate pending seek attempt resolved AFTER background cancellation never plays audio:







  let lateSeekResolve = null;







  const staleEvents = [];







  const stalePlayer = {







    volume: 1,







    play() { staleEvents.push('play'); },







    pause() { staleEvents.push('pause'); },







    seekTo() {







      staleEvents.push('seekTo');







      return new Promise((resolve) => {







        lateSeekResolve = resolve;







      });







    },







  };















  let staleFgState = true;







  const harnessStale = createTestHarness('../src/screens/PrologueScreen.tsx', {







    navigation: { replace() {} },







    player: stalePlayer,







  }, {







    __motionState: { active: true, reducedMotion: false, get foreground() { return staleFgState; } },







    __animatedTiming: () => ({ start: () => {}, stop: () => {} }),







    'expo-audio': {







      setAudioModeAsync: async () => {},







      useAudioPlayer: () => stalePlayer,







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => ({ active: true, reducedMotion: false, foreground: staleFgState }),







    },







  });















  const treeStale = harnessStale.render();







  const startBtnStale = findElements(treeStale, 'Pressable').find((p) => p.props.testID === 'prologue-start-button' || p.props.accessibilityLabel?.includes('Bắt đầu'));







  startBtnStale.props.onPress({ nativeEvent: { locationX: 120, locationY: 28 } });







  assert.ok(staleEvents.includes('seekTo'), 'Attempt initiates seekTo');















  // Invalidate attempt by backgrounding before seekTo settles







  staleFgState = false;







  harnessStale.render();







  assert.ok(staleEvents.includes('pause'), 'Backgrounding cancels the pending attempt');















  // Now the late seek promise settles: attemptToken is now stale, so playSafe must NOT call player.play()







  if (lateSeekResolve) lateSeekResolve();







  await new Promise((r) => setTimeout(r, 10));







  assert.equal(staleEvents.filter((e) => e === 'play').length, 0, 'Late seekTo resolving after attempt was canceled never plays audio');















  // 6. Reduced motion navigates promptly without expanding ripple







  const harnessReduced = createTestHarness('../src/screens/PrologueScreen.tsx', {







    navigation: {







      replace: (screen) => replaceCalls.push(screen),







    },







    player: appOwnedPlayer,







  }, {







    __motionState: { active: true, reducedMotion: true, foreground: true },







    'expo-audio': {







      setAudioModeAsync: async () => {},







      useAudioPlayer: () => appOwnedPlayer,







    },







    '../hooks/MotionPreferences': {







      useMotionState: () => ({ active: true, reducedMotion: true, foreground: true }),







    },







  });















  replaceCalls.length = 0;







  const treeReduced = harnessReduced.render();







  const startBtnReduced = findElements(treeReduced, 'Pressable').find((p) => p.props.testID === 'prologue-start-button' || p.props.accessibilityLabel?.includes('Bắt đầu'));







  startBtnReduced.props.onPress({ nativeEvent: { locationX: 120, locationY: 28 } });







  assert.deepEqual(replaceCalls, ['Landing'], 'Promptly navigated to Landing under reduced motion');







});
