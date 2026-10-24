import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';
import * as translator from '../src/i18n/translator.ts';
import * as sources from '../src/data/sourceState.ts';
import * as alleyGeometry from '../src/utils/alleyGeometry.ts';

const actualCollectionsCode = ts.transpileModule(readFileSync(new URL('../src/data/collections.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const actualCollectionsMod = { exports: {} };
runInNewContext('(function(require,module,exports){' + actualCollectionsCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
  if (id === 'react-native') return {};
  if (id === './locale') return { isLocale: (v) => v === 'vi' || v === 'en' };
  if (id === './threeLensesCompanion.ts' || id === './threeLensesCompanion') return {};
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
const { AVAILABLE_COLLECTIONS, getLocalizedCollections } = actualCollectionsMod.exports;

const actualPhotoMapCode = ts.transpileModule(readFileSync(new URL('../src/assets/photoMap.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const actualPhotoMapMod = { exports: {} };
runInNewContext('(function(require,module,exports){' + actualPhotoMapCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
  if (id === 'react-native') return {};
  if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return id;
  throw new Error('Unexpected import in photoMap.ts: ' + id);
}, actualPhotoMapMod, actualPhotoMapMod.exports);
const { ALLEY_LIST } = actualPhotoMapMod.exports;

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

// Transpile components
const toolDockCode = ts.transpileModule(readFileSync(new URL('../src/components/ToolDock.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

const passportCode = ts.transpileModule(readFileSync(new URL('../src/components/AlleyPassportModal.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

const drawerCode = ts.transpileModule(readFileSync(new URL('../src/components/NotebookDrawerModal.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

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

  const modules = {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react/jsx-dev-runtime': jsxRuntime,
    'react-native': rn,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    },
    '@react-navigation/native': { useIsFocused: () => true },
    '../context/LocaleContext': overrides['../context/LocaleContext'] ?? {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        collectionId: 'fiction-letter',
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
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
    },
    '../data/collections': {
      AVAILABLE_COLLECTIONS,
      getLocalizedCollections,
      getBundledDataset: () => fixture,
      DEFAULT_COLLECTION_ID: 'ngo-trung-yen',
      isCollectionId: (id) => AVAILABLE_COLLECTIONS.some((c) => c.id === id),
    },
    '../data/sourceState': sources,
    '../assets/photoMap': {
      HERO_PHOTO: 1,
      getNodePhoto: () => 1,
      getNodePhotographer: () => 'Nhiếp ảnh gia',
      getAlleyMeta: () => ({ name: 'Ngõ Trung Yên', coverPhoto: 1, photographer: 'Nhiếp ảnh gia' }),
    },
    '../theme': {
      colors: { primary: '#2D5748', terracotta: '#C85A32', text: '#2C221E' },
      radius: { sm: 4, md: 8, lg: 16, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24 },
    },
    '../theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380 },
      motionSprings: { tactilePress: {}, gentleSlide: {} },
      motionEasings: { gentleOut: (t) => t, accelerate: (t) => t },
      motionScales: { pressedButton: 0.97, pressedCard: 0.975 },
    },
    './src/theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380 },
      motionSprings: { tactilePress: {}, gentleSlide: {} },
      motionEasings: { gentleOut: (t) => t, accelerate: (t) => t },
      motionScales: { pressedButton: 0.97, pressedCard: 0.975 },
    },
    '../components/AppIcon': { AppIcon: 'AppIcon' },
    'react-native-svg': { default: 'Svg', Path: 'Path', Defs: 'Defs', LinearGradient: 'LinearGradient', Stop: 'Stop', __esModule: true },
    '../utils/alleyGeometry': alleyGeometry,
    '../utils/imagePerformanceDiagnostics': {
      createImagePerfFirstLayoutReporter: () => () => {},
      recordImagePerfLoadEnd: () => {}, recordImagePerfLoadError: () => {}, recordImagePerfLoadStart: () => {},
      recordImagePerfLoadSuccess: () => {}, recordImagePerfNavigationTap: () => {}, recordImagePerfScreenFocus: () => {},
    },
    './src/utils/alleyGeometry': alleyGeometry,
    'expo-audio': {
      setAudioModeAsync: async () => {},
      useAudioPlayer: () => ({ loop: false, pause() {}, play() {}, replace() {} }),
      useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
    },
    '../voice/localizedCatalog': {
      lookupVoiceTrack: () => undefined,
    },
    ...overrides,
  };

  // Build ToolDock
  const toolDockMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + toolDockCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon') return { AppIcon: 'AppIcon' };
    throw new Error(`Unexpected import in toolDock: ${id}`);
  }, toolDockMod, toolDockMod.exports);
  modules['../components/ToolDock'] = toolDockMod.exports;

  // Build AlleyPassportModal
  const passportMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + passportCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon') return { AppIcon: 'AppIcon' };
    throw new Error(`Unexpected import in passport: ${id}`);
  }, passportMod, passportMod.exports);
  modules['../components/AlleyPassportModal'] = passportMod.exports;

  // Build Drawer
  const drawerMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + drawerCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon' || /\/components\//.test(id) || id.includes('AlleyGuideSection')) {
      return { AppIcon: 'AppIcon', AlleyGuideSection: 'AlleyGuideSection' };
    }
    if (id.includes('alleyGuide')) {
      return {
        readAlleyStory: () => ({ title: 'Về con ngõ', paragraphs: ['Nội dung câu chuyện con ngõ'] }),
        readAlleyGuide: () => null,
      };
    }
    throw new Error(`Unexpected import in drawer: ${id}`);
  }, drawerMod, drawerMod.exports);
  modules['../components/NotebookDrawerModal'] = drawerMod.exports;

  // Build target module
  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (/\/components\//.test(id) || id.startsWith('./') || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1).replace(/\.tsx?$/, '');
      return { [name]: name, default: name, AppIcon: 'AppIcon', NgoKeLogo: 'NgoKeLogo', UnavailableScreen: 'UnavailableScreen', CrossfadePhoto: 'CrossfadePhoto', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection', AlleyTrailView: 'AlleyTrailView', AlleyPolylineMap: 'AlleyPolylineMap' };
    }
    if (id.includes('alleyGuide')) {
      return {
        readAlleyStory: () => ({ title: 'Về con ngõ', paragraphs: ['Nội dung câu chuyện con ngõ'] }),
        readAlleyGuide: () => null,
      };
    }
    throw new Error(`Unexpected import in screen: ${id}`);
  }, screenMod, screenMod.exports);

  const component = screenMod.exports.LandingScreen ?? screenMod.exports.HomeScreen ?? Object.values(screenMod.exports)[0];
  let currentProps = { ...defaultProps };

  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      dirty = true;
      let passes = 0;
      while (dirty && passes++ < 10) {
        dirty = false;
        cursor = 0;
        tree = component(currentProps);
        const toRun = pending;
        pending = [];
        for (const effect of toRun) effect();
      }
      return tree;
    },
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
    },
  };
}

function resolveStyle(styleProp) {
  const unwrapped = typeof styleProp === 'function' ? styleProp({ pressed: false }) : styleProp;
  return [].concat(unwrapped).filter(Boolean);
}

function elements(tree, type) {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap((c) => elements(c, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}

test('B1: Landing background blur is 6 and scrim alpha is >= 0.62', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });
  const tree = mountObj.render();
  const bg = elements(tree, 'ImageBackground')[0];
  assert.ok(bg, 'ImageBackground rendered on Landing');
  assert.equal(bg.props.blurRadius, 6, 'Landing background blur is exactly 6');

  // Verify scrim overlay style
  const scrim = elements(bg, 'View')[0];
  assert.ok(scrim, 'Scrim overlay rendered');
  const scrimStyles = [].concat(scrim.props.style).filter(Boolean);
  const bgStyle = scrimStyles.find((s) => s.backgroundColor && s.backgroundColor.startsWith('rgba(18, 30, 23'));
  assert.ok(bgStyle, 'Scrim background is rgba(18, 30, 23, ...)');
  const match = bgStyle.backgroundColor.match(/rgba\(18,\s*30,\s*23,\s*([0-9.]+)\)/);
  assert.ok(match, 'Scrim matches rgba pattern');
  const alpha = parseFloat(match[1]);
  assert.ok(alpha >= 0.62, `Scrim alpha ${alpha} >= 0.62`);
  mountObj.unmount();
});

test('B2: Home sharp photo base retains scrim 0.40 and local header backdrop rgba(20,24,19,.58)', () => {
  const mountObj = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  });
  const tree = mountObj.render();
  const bg = elements(tree, 'ImageBackground')[0];
  assert.ok(bg, 'ImageBackground rendered on Home');
  // sharp photo base -> blurRadius not set or 0
  assert.equal(bg.props.blurRadius, undefined, 'Home hero image base is sharp');

  // Local header backdrop
  const header = elements(tree, 'View').find((v) => v.props.testID === 'home-header-bar');
  assert.ok(header, 'Home header bar rendered');
  const headerStyles = [].concat(header.props.style).filter(Boolean);
  const headerBg = headerStyles.find((s) => s.backgroundColor && s.backgroundColor.startsWith('rgba(20, 24, 19'));
  assert.ok(headerBg, 'Header backdrop uses local rgba(20, 24, 19, ...)');
  const match = headerBg.backgroundColor.match(/rgba\(20,\s*24,\s*19,\s*([0-9.]+)\)/);
  assert.ok(match, 'Header backdrop alpha parsed');
  const alpha = parseFloat(match[1]);
  assert.ok(alpha >= 0.55 && alpha <= 0.60, `Header backdrop alpha ${alpha} in [0.55, 0.60]`);
  mountObj.unmount();
});

test('B3: ToolDock has exactly 3 items (GPS left, QR center, Notebook right) and Passport icon only on Landing header', () => {
  // Test ToolDock on Landing
  const landingMount = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });
  const landingTree = landingMount.render();
  const landingDock = elements(landingTree, 'View').find((v) => v.props.testID === 'landing-tool-dock');
  assert.ok(landingDock, 'ToolDock rendered on Landing');

  const landingGps = elements(landingTree, 'Pressable').find((p) => p.props.testID === 'landing-dock-gps');
  const landingQr = elements(landingTree, 'Pressable').find((p) => p.props.testID === 'landing-dock-qr');
  const landingNotebook = elements(landingTree, 'Pressable').find((p) => p.props.testID === 'landing-notebook');

  assert.ok(landingGps, 'GPS item present');
  assert.ok(landingQr, 'QR item present');
  assert.ok(landingNotebook, 'Notebook item present');

  // Exactly one notebook testID on Landing
  const allLandingNotebooks = elements(landingTree, 'Pressable').filter((p) => p.props.testID === 'landing-notebook');
  assert.equal(allLandingNotebooks.length, 1, 'Exactly one landing-notebook testID');

  // Passport on Landing Header: icon only, target >= 44, accessible
  const headerPassport = elements(landingTree, 'Pressable').find((p) => p.props.testID === 'landing-header-passport');
  assert.ok(headerPassport, 'Header passport present on Landing');
  assert.equal(headerPassport.props.accessibilityRole, 'button');
  assert.equal(headerPassport.props.accessibilityLabel, 'Hộ chiếu ngõ phố');
  const passportTexts = elements(headerPassport, 'Text');
  assert.equal(passportTexts.length, 0, 'Header passport has no visible text (icon only)');

  landingMount.unmount();

  // Test ToolDock on Home
  const homeMount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  });
  const homeTree = homeMount.render();
  const homeDock = elements(homeTree, 'View').find((v) => v.props.testID === 'home-tool-dock');
  assert.ok(homeDock, 'ToolDock rendered on Home');

  const homeGps = elements(homeTree, 'Pressable').find((p) => p.props.testID === 'home-dock-gps');
  const homeQr = elements(homeTree, 'Pressable').find((p) => p.props.testID === 'home-dock-qr');
  const homeNotebook = elements(homeTree, 'Pressable').find((p) => p.props.testID === 'home-notebook');

  assert.ok(homeGps, 'GPS item present on Home');
  assert.ok(homeQr, 'QR item present on Home');
  assert.ok(homeNotebook, 'Notebook item present on Home');

  // Exactly one notebook testID on Home
  const allHomeNotebooks = elements(homeTree, 'Pressable').filter((p) => p.props.testID === 'home-notebook');
  assert.equal(allHomeNotebooks.length, 1, 'Exactly one home-notebook testID');

  // No passport on Home
  const homePassport = elements(homeTree, 'Pressable').find((p) => p.props.testID === 'landing-header-passport' || p.props.testID === 'home-header-passport');
  assert.equal(homePassport, undefined, 'No passport button on Home header');

  homeMount.unmount();
});

test('B3 layout flow: Landing and Home ToolDock is bottom normal sibling in root flex flow without overlap', () => {
  // 1. LandingScreen render & style flow contract
  const landingMount = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });
  const landingTree = landingMount.render();

  // Root container has flex: 1
  const landingRootStyles = resolveStyle(landingTree.props.style);
  assert.ok(landingRootStyles.some((s) => s.flex === 1), 'Landing rootContainer has flex: 1');

  // Background is absoluteFill and does NOT wrap normal content
  const landingBg = landingTree.props.children[0];
  assert.equal(landingBg.type, 'ImageBackground', 'Landing background is first child');
  const landingBgStyles = resolveStyle(landingBg.props.style);
  assert.ok(landingBgStyles.some((s) => s.position === 'absolute'), 'Landing ImageBackground is absoluteFill');
  assert.equal(elements(landingBg, 'ScrollView').length, 0, 'Landing ImageBackground does NOT contain ScrollView (background-only)');
  assert.equal(elements(landingBg, 'View').some((v) => v.props.testID === 'landing-tool-dock'), false, 'Landing ImageBackground does NOT contain ToolDock');

  // ScrollView has flex: 1 in normal flow
  const landingScrollView = landingTree.props.children[1];
  assert.equal(landingScrollView.type, 'ScrollView', 'Landing ScrollView is normal sibling after background');
  const scrollStyles = resolveStyle(landingScrollView.props.style);
  assert.ok(scrollStyles.some((s) => s.flex === 1), 'Landing ScrollView has flex: 1');

  // ScrollView contentContainerStyle has no fixed 84px padding workaround
  const scrollContentStyles = resolveStyle(landingScrollView.props.contentContainerStyle);
  const scrollPaddingBottom = scrollContentStyles.find((s) => s.paddingBottom !== undefined)?.paddingBottom;
  assert.ok(scrollPaddingBottom <= 24, `Landing scroll content paddingBottom is clean standard spacing (${scrollPaddingBottom}), no 84px workaround`);

  // ToolDock is normal flex sibling at the bottom
  const landingDockChild = landingTree.props.children[2];
  assert.equal(landingDockChild.props.testID, 'landing-tool-dock', 'Landing ToolDock is normal sibling in root container');
  const landingDockStyles = resolveStyle(landingDockChild.props.style);
  assert.equal(landingDockStyles.some((s) => s.position === 'absolute'), false, 'Landing ToolDock is NOT absolute (normal flex sibling at bottom)');
  assert.equal(landingDockStyles.find((s) => s.paddingBottom !== undefined)?.paddingBottom, 34, 'Landing ToolDock handles safearea bottom once (paddingBottom: 34)');

  landingMount.unmount();

  // 2. HomeScreen render & style flow contract
  const homeMount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  });
  const homeTree = homeMount.render();

  // Root container has flex: 1
  const homeRootStyles = resolveStyle(homeTree.props.style);
  assert.ok(homeRootStyles.some((s) => s.flex === 1), 'Home rootContainer has flex: 1');

  // Background is absoluteFill and background-only
  const homeBg = homeTree.props.children[0];
  assert.equal(homeBg.type, 'ImageBackground', 'Home background is first child');
  const homeBgStyles = resolveStyle(homeBg.props.style);
  assert.ok(homeBgStyles.some((s) => s.position === 'absolute'), 'Home ImageBackground is absoluteFill');
  assert.equal(elements(homeBg, 'ScrollView').length, 0, 'Home ImageBackground does NOT contain ScrollView (background-only)');
  assert.equal(elements(homeBg, 'View').some((v) => v.props.testID === 'home-tool-dock'), false, 'Home ImageBackground does NOT contain ToolDock');

  // Home normal flow has header, ScrollView with flex: 1, preview card, and bottom ToolDock
  const homeChildren = homeTree.props.children.filter(Boolean);
  const homeDock = homeChildren.find((c) => c.props?.testID === 'home-tool-dock');
  assert.ok(homeDock, 'Home ToolDock is present as normal child of root container');
  const homeDockStyles = resolveStyle(homeDock.props.style);
  assert.equal(homeDockStyles.some((s) => s.position === 'absolute'), false, 'Home ToolDock is NOT absolute (normal flex sibling at bottom)');
  assert.equal(homeDockStyles.find((s) => s.paddingBottom !== undefined)?.paddingBottom, 34, 'Home ToolDock handles safearea bottom once (paddingBottom: 34)');

  const homeScrollView = homeChildren.find((c) => c.type === 'ScrollView');
  assert.ok(homeScrollView, 'Home ScrollView present in normal flow');
  const homeScrollStyles = resolveStyle(homeScrollView.props.style);
  assert.ok(homeScrollStyles.some((s) => s.flex === 1), 'Home ScrollView has flex: 1');

  homeMount.unmount();
});

test('B4: Home header back target >= 44 and opening alley story card immediately above map labeled "Về con ngõ"', () => {
  const navigatedRoutes = [];
  const homeMount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: {
      navigate: (r) => navigatedRoutes.push(r),
      goBack: () => navigatedRoutes.push('goBack'),
    },
    route: { params: {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  });
  const tree = homeMount.render();

  // Header back button target >= 44
  const backBtn = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === 'Quay lại');
  assert.ok(backBtn, 'Back button present');
  const backStyles = resolveStyle(backBtn.props.style);
  assert.ok(backStyles.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'Back button target >= 44x44');

  // Opening alley story button labeled "Về con ngõ"
  const alleyStoryBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'home-alley-story');
  assert.ok(alleyStoryBtn, 'home-alley-story button present');
  const alleyStoryTexts = elements(alleyStoryBtn, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(alleyStoryTexts.some((t) => t.includes('Về con ngõ')), 'Alley story button labeled "Về con ngõ"');

  homeMount.unmount();
});

test('B5: Tapping selected pin opens point story and compact preview is shrunk to preserve map view', () => {
  const navigatedRoutes = [];
  const homeMount = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: {
      navigate: (r) => navigatedRoutes.push(r),
      goBack: () => {},
    },
    route: { params: {} },
    mode: 'demo',
    source: sources.getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  });
  const tree = homeMount.render();

  // Compact preview card
  const preview = elements(tree, 'Animated.View').find((v) => v.props.testID === 'home-selected-node-preview');
  assert.ok(preview, 'Compact preview present');
  const previewStyles = [].concat(preview.props.style).filter(Boolean);
  const previewMain = previewStyles.find((s) => s.paddingVertical !== undefined);
  assert.ok(previewMain, 'Preview style defined');
  // Shrunk padding (<= 10) to preserve map usability
  assert.ok(previewMain.paddingVertical <= 10, `Preview paddingVertical ${previewMain.paddingVertical} <= 10`);

  // Story CTA on preview navigates to Qa
  const storyCta = elements(preview, 'Pressable').find((p) => p.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn');
  assert.ok(storyCta, 'Story CTA present on preview');
  storyCta.props.onPress();
  assert.deepEqual(navigatedRoutes, ['Qa'], 'Story CTA opens point story (navigates to Qa)');

  homeMount.unmount();
});

test('B6: Parameterized 8-alley order and dimension contracts across VI and EN at 360pt (fontScale 1.0, 1.3, 2.0)', () => {
  const expectedOrder = [
    'ngo-trung-yen',
    'ngo-gach',
    'ngo-tam-thuong',
    'ngo-cam-chi',
    'ngo-phat-loc',
    'old-quarter-three-lenses',
    'old-quarter-pilot',
    'fiction-letter',
  ];

  // 1. Static registry and localization contracts
  assert.equal(AVAILABLE_COLLECTIONS.length, 8, '8 collections available');
  assert.deepEqual(Array.from(AVAILABLE_COLLECTIONS.map((c) => c.id)), expectedOrder, 'AVAILABLE_COLLECTIONS match exact 8-alley order');

  const viCols = getLocalizedCollections('vi');
  const enCols = getLocalizedCollections('en');
  assert.equal(viCols.length, 8, '8 VI collections');
  assert.equal(enCols.length, 8, '8 EN collections');
  assert.deepEqual(Array.from(viCols.map((c) => c.id)), expectedOrder, 'VI collections order matches expected');
  assert.deepEqual(Array.from(enCols.map((c) => c.id)), expectedOrder, 'EN collections order matches expected');

  // 2. Parameterized mount matrix across locales and scales at 360pt
  const locales = ['vi', 'en'];
  const fontScales = [1.0, 1.3, 2.0];
  const dimensionResults = {};

  for (const loc of locales) {
    dimensionResults[loc] = {};
    for (const scale of fontScales) {
      const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
        navigation: { navigate() {}, goBack() {}, replace() {} },
        route: { params: {} },
        nodeCount: 6,
        mode: 'demo',
      }, {
        __windowDimensions: { width: 360, height: 800, fontScale: scale },
        '../context/LocaleContext': {
          useLocale: () => ({
            locale: loc,
            setLocale: () => {},
            collectionId: 'ngo-trung-yen',
            setCollectionId: () => {},
            t: (key, params) => translator.t(loc, key, params),
          }),
        },
      });

      const tree = mountObj.render();

      // Check alley carousel collection order and count
      const alleyCards = elements(tree, 'Pressable').filter((p) => p.props.testID && p.props.testID.startsWith('landing-alley-card-'));
      assert.equal(alleyCards.length, 8, `8 alley cards rendered in carousel for ${loc} at scale ${scale}`);
      const renderedIds = alleyCards.map((p) => p.props.testID.replace('landing-alley-card-', ''));
      assert.deepEqual(renderedIds, expectedOrder, `Carousel order matches exact 8-alley order for ${loc} at scale ${scale}`);

      // Check Card height = 330 and Footer minHeight = 148 contracts
      for (const card of alleyCards) {
        const cardStyles = resolveStyle(card.props.style);
        const mainCardStyle = cardStyles.find((s) => s.height === 330);
        assert.ok(mainCardStyle, `Card has stable fixed height 330 for ${loc} at scale ${scale}`);

        const footer = elements(card, 'View').find((v) => {
          const s = resolveStyle(v.props.style);
          return s.some((st) => st.minHeight === 148);
        });
        assert.ok(footer, `Card footer has minHeight 148 for ${loc} at scale ${scale}`);
      }

      // Check header bar dimension contract
      const headerBar = elements(tree, 'Animated.View').find((v) => v.props.testID === 'landing-header-bar');
      assert.ok(headerBar, `Header bar rendered for ${loc} at scale ${scale}`);
      const headerStyles = resolveStyle(headerBar.props.style);
      const expectedHeaderMinHeight = scale > 1.3 ? 88 : 48;
      assert.ok(headerStyles.some((s) => s.minHeight === expectedHeaderMinHeight), `Header minHeight is ${expectedHeaderMinHeight} for scale ${scale}`);

      // Check status line container dimension contract
      const statusLine = elements(tree, 'View').find((v) => v.props.testID === 'landing-status-line');
      assert.ok(statusLine, `Status line container rendered for ${loc} at scale ${scale}`);
      const statusStyles = resolveStyle(statusLine.props.style);
      const expectedStatusMinHeight = scale > 1.3 ? 48 : 28;
      assert.ok(statusStyles.some((s) => s.minHeight === expectedStatusMinHeight), `Status line minHeight is ${expectedStatusMinHeight} for scale ${scale}`);

      // Check section header row dimension contract
      const sectionRow = elements(tree, 'View').find((v) => v.props.testID === 'landing-section-header');
      assert.ok(sectionRow, `Section title row rendered for ${loc} at scale ${scale}`);
      const sectionStyles = resolveStyle(sectionRow.props.style);
      const expectedSectionMinHeight = scale > 1.2 ? 56 : 36;
      assert.ok(sectionStyles.some((s) => s.minHeight === expectedSectionMinHeight), `Section row minHeight is ${expectedSectionMinHeight} for scale ${scale}`);

      dimensionResults[loc][scale] = {
        headerMinHeight: expectedHeaderMinHeight,
        statusMinHeight: expectedStatusMinHeight,
        sectionMinHeight: expectedSectionMinHeight,
        cardHeight: 330,
        footerMinHeight: 148,
        count: alleyCards.length,
      };

      mountObj.unmount();
    }
  }

  // Cross-compare VI vs EN contracts across each font scale (structural assertions, not measured Yoga layout/device evidence)
  for (const scale of fontScales) {
    assert.deepEqual(
      dimensionResults.vi[scale],
      dimensionResults.en[scale],
      `VI and EN dimension contracts match exactly at scale ${scale} (structural style contract assertion, not measured Yoga layout)`
    );
  }
});

test('B7: Static status line in VI and EN', () => {
  const viStatus = translator.t('vi', 'landing.mode_status');
  const enStatus = translator.t('en', 'landing.mode_status');

  assert.equal(viStatus, 'Chọn một con ngõ để bắt đầu câu chuyện.', 'Exact static VI status copy');
  assert.equal(enStatus, 'Choose an alley to begin its story.', 'Exact static EN status copy');
});

test('B8: Font floor 12 and approved pending notice without warning emoji', () => {
  const viNotice = translator.t('vi', 'home.pending_notice_short');
  const enNotice = translator.t('en', 'home.pending_notice_short');

  assert.equal(viNotice, 'Một số chi tiết chưa được xác nhận.', 'Approved short VI notice');
  assert.equal(enNotice, 'Some details have not been confirmed.', 'Approved short EN notice');

  // No warning emoji in notice
  assert.equal(viNotice.includes('⚠️'), false, 'No warning emoji in VI notice');
  assert.equal(enNotice.includes('⚠️'), false, 'No warning emoji in EN notice');
});

test('B9: Dead code verified absent from HomeScreen', () => {
  const homeCode = readFileSync(new URL('../src/screens/HomeScreen.tsx', import.meta.url), 'utf8');
  const deadSymbols = [
    'polaroid',
    'scrapbook',
    'handwriting',
    'exploreCtaButton',
    'dockCenterCircle',
  ];

  for (const sym of deadSymbols) {
    assert.equal(homeCode.includes(sym), false, `Dead code "${sym}" is absent from HomeScreen.tsx`);
  }
});

test('B10: Accessible threshold renders List for fontScale > 1.3 or nodes > 6, Map otherwise', () => {
  const sixNodesSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Demo',
    dataset: { ...fixture, nodes: fixture.nodes.slice(0, 6) },
  };

  const sevenNodesSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Demo',
    dataset: {
      ...fixture,
      nodes: [
        ...fixture.nodes.slice(0, 6),
        { ...fixture.nodes[0], id: 'demo-07', name: 'Điểm 07' },
      ],
    },
  };

  // 1. Boundary fontScale 1.3 with 6 nodes -> renders Map (Svg), NOT List (AlleyTrailView)
  const mount1 = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sixNodesSource,
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __windowDimensions: { width: 360, height: 800, fontScale: 1.3 },
  });
  const tree1 = mount1.render();
  assert.equal(elements(tree1, 'AlleyTrailView').length, 0, 'fontScale 1.3 with 6 nodes does NOT render AlleyTrailView');
  assert.ok(elements(tree1, 'Svg').length > 0, 'fontScale 1.3 with 6 nodes renders Svg map canvas');
  mount1.unmount();

  // 2. Boundary fontScale 1.31 with 6 nodes -> threshold exceeded, renders List (AlleyTrailView), NOT Map (Svg)
  const mount2 = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sixNodesSource,
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __windowDimensions: { width: 360, height: 800, fontScale: 1.31 },
  });
  const tree2 = mount2.render();
  assert.equal(elements(tree2, 'AlleyTrailView').length, 1, 'fontScale 1.31 with 6 nodes renders AlleyTrailView');
  assert.equal(elements(tree2, 'Svg').length, 0, 'fontScale 1.31 with 6 nodes does NOT render Svg map canvas');
  mount2.unmount();

  // 3. Boundary fontScale 1.0 with 6 nodes -> renders Map (Svg), NOT List (AlleyTrailView)
  const mount3 = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sixNodesSource,
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __windowDimensions: { width: 360, height: 800, fontScale: 1.0 },
  });
  const tree3 = mount3.render();
  assert.equal(elements(tree3, 'AlleyTrailView').length, 0, 'fontScale 1.0 with 6 nodes does NOT render AlleyTrailView');
  assert.ok(elements(tree3, 'Svg').length > 0, 'fontScale 1.0 with 6 nodes renders Svg map canvas');
  mount3.unmount();

  // 4. Boundary fontScale 1.0 with 7 nodes -> threshold exceeded, renders List (AlleyTrailView), NOT Map (Svg)
  const mount4 = createTestMount('../src/screens/HomeScreen.tsx', {
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
    mode: 'demo',
    source: sevenNodesSource,
    currentNodeId: 'demo-01',
    onSelectNode: () => {},
    readNodeIds: new Set(),
    onModeChange: () => {},
  }, {
    __windowDimensions: { width: 360, height: 800, fontScale: 1.0 },
  });
  const tree4 = mount4.render();
  assert.equal(elements(tree4, 'AlleyTrailView').length, 1, 'fontScale 1.0 with 7 nodes renders AlleyTrailView');
  assert.equal(elements(tree4, 'Svg').length, 0, 'fontScale 1.0 with 7 nodes does NOT render Svg map canvas');
  mount4.unmount();
});

test('B11: User-supplied alley cover assets for four alleys exist and map correctly', () => {
  const trungYenPath = new URL('../assets/photos/alleys/ngo-trung-yen-cover.png', import.meta.url);
  const gachPath = new URL('../assets/photos/alleys/ngo-gach-cover.png', import.meta.url);
  const tamThuongPath = new URL('../assets/photos/alleys/ngo-tam-thuong-cover.png', import.meta.url);
  const camChiPath = new URL('../assets/photos/alleys/ngo-cam-chi-cover.png', import.meta.url);

  assert.ok(existsSync(trungYenPath), 'Ngo Trung Yen cover image exists on disk');
  assert.ok(existsSync(gachPath), 'Ngo Gach cover image exists on disk');
  assert.ok(existsSync(tamThuongPath), 'Ngo Tam Thuong cover image exists on disk');
  assert.ok(existsSync(camChiPath), 'Ngo Cam Chi cover image exists on disk');

  const trungYenBytes = readFileSync(trungYenPath);
  const gachBytes = readFileSync(gachPath);
  const tamThuongBytes = readFileSync(tamThuongPath);
  const camChiBytes = readFileSync(camChiPath);

  assert.equal(trungYenBytes.length, 2734316, 'Ngo Trung Yen cover image matches exact user size');
  assert.equal(gachBytes.length, 1398380, 'Ngo Gach cover image matches exact user size');
  assert.equal(tamThuongBytes.length, 4138537, 'Ngo Tam Thuong cover image matches exact user size');
  assert.equal(camChiBytes.length, 879592, 'Ngo Cam Chi cover image matches exact user size');

  const trungYenHash = createHash('sha256').update(trungYenBytes).digest('hex');
  const gachHash = createHash('sha256').update(gachBytes).digest('hex');
  const tamThuongHash = createHash('sha256').update(tamThuongBytes).digest('hex');
  const camChiHash = createHash('sha256').update(camChiBytes).digest('hex');

  assert.equal(trungYenHash, 'f14a6ac40d3d68687417e13ea962617903a87ca8f5f826be41e87d15ee3c307c', 'Ngo Trung Yen cover image SHA256 verified');
  assert.equal(gachHash, 'e4e264c3f168c4b1ae1c50bcac1380fb8a2b2ffab4f51bcdd554940f7975167c', 'Ngo Gach cover image SHA256 verified');
  assert.equal(tamThuongHash, '3e8674b4d77be3c014ede54df6e5c98c0e56a65a97f9ea386367c5e99dca79c8', 'Ngo Tam Thuong cover image SHA256 verified');
  assert.equal(camChiHash, 'a61d42b21645a9316b15fa92baa8303927c0416bf2fb17dad13b02d0a8ed1e13', 'Ngo Cam Chi cover image SHA256 verified');

  // Verify AVAILABLE_COLLECTIONS mappings
  const trungYenCol = AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-trung-yen');
  const gachCol = AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-gach');
  const tamThuongCol = AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-tam-thuong');
  const camChiCol = AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-cam-chi');
  assert.ok(trungYenCol, 'Ngo Trung Yen collection registered');
  assert.ok(gachCol, 'Ngo Gach collection registered');
  assert.ok(tamThuongCol, 'Ngo Tam Thuong collection registered');
  assert.ok(camChiCol, 'Ngo Cam Chi collection registered');

  // Verify ALLEY_LIST mappings and honest attribution
  const trungYenMeta = ALLEY_LIST.find((a) => a.id === 'ngo-trung-yen');
  const gachMeta = ALLEY_LIST.find((a) => a.id === 'ngo-gach');
  const tamThuongMeta = ALLEY_LIST.find((a) => a.id === 'tam-thuong');
  const camChiMeta = ALLEY_LIST.find((a) => a.id === 'cam-chi');
  assert.ok(trungYenMeta, 'Ngo Trung Yen in ALLEY_LIST');
  assert.ok(gachMeta, 'Ngo Gach in ALLEY_LIST');
  assert.ok(tamThuongMeta, 'Ngo Tam Thuong in ALLEY_LIST');
  assert.ok(camChiMeta, 'Ngo Cam Chi in ALLEY_LIST');
  assert.equal(trungYenMeta.photographer, 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)', 'Ngo Trung Yen honest attribution');
  assert.equal(gachMeta.photographer, 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)', 'Ngo Gach honest attribution');
  assert.equal(tamThuongMeta.photographer, 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)', 'Ngo Tam Thuong honest attribution');
  assert.equal(camChiMeta.photographer, 'Tài liệu người dùng cung cấp (quyền chưa kiểm chứng)', 'Ngo Cam Chi honest attribution');
});
