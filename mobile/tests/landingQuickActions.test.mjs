import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';
import * as translator from '../src/i18n/translator.ts';
import * as sources from '../src/data/sourceState.ts';

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

// Transpile NotebookDrawerModal
const drawerCode = ts.transpileModule(readFileSync(new URL('../src/components/NotebookDrawerModal.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

// Transpile ToolDock
const toolDockCode = ts.transpileModule(readFileSync(new URL('../src/components/ToolDock.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

function createTestMount(file, defaultProps = {}, overrides = {}) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pending = [];
  let tree;
  let permissionRequestsCount = 0;

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
    },
    '../data/collections': {
      getLocalizedCollections: (loc = 'vi') => [
        { id: 'old-quarter-pilot', name: loc === 'en' ? 'Old Quarter Pilot' : 'Thử nghiệm Phố Cổ', tagline: 'Di sản', theme: 'Lịch sử', district: 'Hoàn Kiếm', coverPhoto: 1, kind: 'reviewed', nodeCount: 3 },
        { id: 'fiction-letter', name: loc === 'en' ? 'Hanoi Letters' : 'Thư Hà Nội', tagline: 'Kể chuyện', theme: 'Văn hóa', district: 'Hoàn Kiếm', coverPhoto: 1, kind: 'simulated', nodeCount: 6 },
      ],
      getBundledDataset: () => fixture,
    },
    '../data/sourceState': sources,
    '../assets/photoMap': {
      HERO_PHOTO: 1,
    },
    '../theme': {
      colors: { primary: '#2D5748', terracotta: '#C85A32', text: '#2C221E' },
      radius: { sm: 4, md: 8, lg: 16, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24 },
    },
    'expo-location': {
      requestForegroundPermissionsAsync: async () => {
        permissionRequestsCount++;
        return { status: 'granted' };
      },
      getCurrentPositionAsync: async () => {
        permissionRequestsCount++;
        return { coords: { latitude: 21.03, longitude: 105.85 } };
      },
    },
    ...overrides,
  };

  // Build ToolDock module
  const toolDockMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + toolDockCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon') {
      return { AppIcon: 'AppIcon' };
    }
    throw new Error(`Unexpected import in toolDock: ${id}`);
  }, toolDockMod, toolDockMod.exports);

  modules['../components/ToolDock'] = toolDockMod.exports;

  // Build Drawer module
  const drawerMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + drawerCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon' || /\/components\//.test(id) || id.includes('AlleyGuideSection')) {
      return { AppIcon: 'AppIcon', AlleyGuideSection: 'AlleyGuideSection' };
    }
    if (id.includes('alleyGuide')) {
      return { readAlleyStory: () => null, readAlleyGuide: () => null };
    }
    throw new Error(`Unexpected import in drawer: ${id}`);
  }, drawerMod, drawerMod.exports);

  modules['../components/NotebookDrawerModal'] = drawerMod.exports;

  // Build target screen module
  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (id === './AppIcon' || id === '../components/AppIcon' || id === '../components/NgoKeLogo' || id.includes('NgoKeLogo') || id === '../components/AlleyPassportModal' || id.includes('AlleyPassportModal') || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1);
      return { [name]: name, AppIcon: 'AppIcon', NgoKeLogo: 'NgoKeLogo', AlleyPassportModal: 'AlleyPassportModal', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection' };
    }
    if (id.includes('alleyGuide')) {
      return { readAlleyStory: () => null, readAlleyGuide: () => null };
    }
    throw new Error(`Unexpected import in screen: ${id}`);
  }, screenMod, screenMod.exports);

  const component = screenMod.exports.LandingScreen ?? screenMod.exports.NotebookDrawerModal ?? Object.values(screenMod.exports)[0];

  let currentProps = { ...defaultProps };

  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      dirty = true;
      let passes = 0;
      while (dirty) {
        if (++passes > 10) throw new Error('Too many re-renders in test mount');
        dirty = false;
        cursor = 0;
        tree = component(currentProps);
        pending.forEach((e) => e());
      }
      return tree;
    },
    getPermissionRequestsCount() {
      return permissionRequestsCount;
    },
    unmount() {
      slots.forEach((s) => s?.cleanup?.());
    },
  };
}

function elements(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((c) => elements(c, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}

test('LandingScreen renders direct GPS and Sổ tay quick actions with accessible roles and labels (VI)', () => {
  const navigatedRoutes = [];
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: {
      navigate: (route) => navigatedRoutes.push(route),
      goBack() {},
      replace() {},
    },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();

  // 1. ToolDock is rendered with testID="landing-tool-dock"
  const dock = elements(tree, 'View').find((item) => item.props.testID === 'landing-tool-dock');
  assert.ok(dock, 'ToolDock is rendered');

  // 2. GPS Button
  const gpsBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-gps');
  assert.ok(gpsBtn, 'GPS button is rendered');
  assert.equal(gpsBtn.props.accessibilityRole, 'button');
  assert.equal(gpsBtn.props.accessibilityLabel, 'Vị trí GPS');

  // 3. QR Button (prominent center)
  const qrBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-qr');
  assert.ok(qrBtn, 'QR button is rendered');
  assert.equal(qrBtn.props.accessibilityRole, 'button');
  assert.equal(qrBtn.props.accessibilityLabel, 'Quét mã QR');

  // 4. Sổ tay Button (exactly one Notebook testID on Landing: landing-notebook)
  const notebookBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-notebook');
  assert.ok(notebookBtn, 'Sổ tay button is rendered');
  assert.equal(notebookBtn.props.accessibilityRole, 'button');
  assert.equal(notebookBtn.props.accessibilityLabel, translator.t('vi', 'home.notebook_label'));

  // 5. Mounting LandingScreen does not request location permissions
  assert.equal(mountObj.getPermissionRequestsCount(), 0, 'No location permission requested on Landing mount');

  mountObj.unmount();
});

test('LandingScreen GPS button navigates directly to Location route', () => {
  const navigatedRoutes = [];
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: {
      navigate: (route) => navigatedRoutes.push(route),
      goBack() {},
      replace() {},
    },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();
  const gpsBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-gps');
  assert.ok(gpsBtn, 'GPS button present');

  gpsBtn.props.onPress();
  assert.deepEqual(navigatedRoutes, ['Location'], 'GPS tap navigates directly to Location screen');

  mountObj.unmount();
});

test('LandingScreen QR button navigates directly to Camera route', () => {
  const navigatedRoutes = [];
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: {
      navigate: (route) => navigatedRoutes.push(route),
      goBack() {},
      replace() {},
    },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();
  const qrBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-qr');
  assert.ok(qrBtn, 'QR button present');

  qrBtn.props.onPress();
  assert.deepEqual(navigatedRoutes, ['Camera'], 'QR tap navigates directly to Camera screen');

  mountObj.unmount();
});

test('LandingScreen Sổ tay button opens NotebookDrawerModal in a single tap, with Plan/Camera/GPS tools and close dismiss', () => {
  const navigatedRoutes = [];
  let currentMode = 'demo';
  const modeChanges = [];

  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: {
      navigate: (route) => navigatedRoutes.push(route),
      goBack() {},
      replace() {},
    },
    route: { params: {} },
    nodeCount: 6,
    mode: currentMode,
    onModeChange: (next) => {
      modeChanges.push(next);
      currentMode = next;
    },
  });

  let tree = mountObj.render();

  // Initially drawer modal is not visible
  let drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, false, 'Drawer modal is closed initially');

  // 1. One tap on Sổ tay in ToolDock opens the modal
  const notebookBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-notebook');
  notebookBtn.props.onPress();

  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, true, 'Drawer modal is visible after pressing Sổ tay');

  // Header verifies it is the Journey & Tools (Hành trình & Công cụ) drawer
  const drawerTexts = elements(drawerModal, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(drawerTexts.some((t) => t.includes(translator.t('vi', 'home.notebook_title'))), 'Hành trình & Công cụ title rendered in drawer');

  // 2. Tool Plan tap closes drawer and navigates to Plan
  const planTool = elements(drawerModal, 'Pressable').find((item) => item.props.testID === 'notebook-tool-plan');
  assert.ok(planTool, 'Plan tool is present in drawer');
  planTool.props.onPress();

  assert.equal(navigatedRoutes.includes('Plan'), true, 'Plan navigation called');
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, false, 'Drawer closes when Plan is selected');

  // 3. Re-open and verify Camera tool
  notebookBtn.props.onPress();
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  const cameraTool = elements(drawerModal, 'Pressable').find((item) => item.props.testID === 'notebook-tool-camera');
  assert.ok(cameraTool, 'Camera tool is present in drawer');
  cameraTool.props.onPress();

  assert.equal(navigatedRoutes.includes('Camera'), true, 'Camera navigation called');
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, false, 'Drawer closes when Camera is selected');

  // 4. Re-open and verify Location tool
  notebookBtn.props.onPress();
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  const locationTool = elements(drawerModal, 'Pressable').find((item) => item.props.testID === 'notebook-tool-gps');
  assert.ok(locationTool, 'Location tool is present in drawer');
  locationTool.props.onPress();

  assert.equal(navigatedRoutes.filter((r) => r === 'Location').length >= 1, true, 'Location navigation called');

  // 5. Re-open and dismiss via close button
  notebookBtn.props.onPress();
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  const closeBtn = elements(drawerModal, 'Pressable').find((item) => item.props.testID === 'notebook-drawer-close-btn');
  assert.ok(closeBtn, 'Close button present in drawer');
  closeBtn.props.onPress();

  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, false, 'Drawer dismissed via close button');

  // 6. Re-open and dismiss via backdrop
  notebookBtn.props.onPress();
  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  const backdrop = elements(drawerModal, 'Pressable').find((item) => item.props.testID === 'notebook-drawer-backdrop');
  assert.ok(backdrop, 'Backdrop present in drawer');
  backdrop.props.onPress();

  tree = mountObj.render();
  drawerModal = elements(tree, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.equal(drawerModal.props.visible, false, 'Drawer dismissed via backdrop');

  mountObj.unmount();
});

test('NotebookDrawerModal component mounted directly: verifies onClose called before navigate, Demo/Live toggle, and Live empty/error states', () => {
  const callSequence = [];
  const modeChanges = [];
  let retryCalls = 0;

  const drawerMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => callSequence.push('onClose'),
    navigation: {
      navigate: (screen) => callSequence.push(`navigate:${screen}`),
    },
    mode: 'demo',
    onModeChange: (next) => modeChanges.push(next),
    source: sources.getSourceState('demo', fixture, 'vi'),
    onRetryLive: () => retryCalls++,
  });

  const tree = drawerMount.render();

  // 1. Verify Plan tool sequence: onClose called BEFORE navigate
  const planTool = elements(tree, 'Pressable').find((item) => item.props.testID === 'notebook-tool-plan');
  assert.ok(planTool, 'Plan tool present');
  planTool.props.onPress();
  assert.deepEqual(callSequence, ['onClose', 'navigate:Plan'], 'onClose must execute before navigation to avoid stacking modal');

  // 2. Verify Camera tool sequence
  callSequence.length = 0;
  const cameraTool = elements(tree, 'Pressable').find((item) => item.props.testID === 'notebook-tool-camera');
  cameraTool.props.onPress();
  assert.deepEqual(callSequence, ['onClose', 'navigate:Camera'], 'onClose must execute before navigation to Camera');

  // 3. Verify GPS tool sequence
  callSequence.length = 0;
  const gpsTool = elements(tree, 'Pressable').find((item) => item.props.testID === 'notebook-tool-gps');
  gpsTool.props.onPress();
  assert.deepEqual(callSequence, ['onClose', 'navigate:Location'], 'onClose must execute before navigation to Location');

  // 4. Verify Demo/Live mode toggle
  const liveOption = elements(tree, 'Pressable').find((item) => item.props.testID === 'notebook-mode-live');
  liveOption.props.onPress();
  assert.deepEqual(modeChanges, ['live'], 'Mode change triggered with live');

  // 5. Test Live empty state isolation
  const liveEmptyMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    onModeChange() {},
    source: sources.getSourceState('live', undefined, 'vi'),
    onRetryLive: () => retryCalls++,
  });

  const liveEmptyTree = liveEmptyMount.render();
  const liveEmptyTexts = elements(liveEmptyTree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(liveEmptyTexts.some((t) => t.includes('chưa được cấu hình') || t.includes('chưa có dữ liệu')), 'Live unready state displays meaningful empty feedback');
  assert.equal(liveEmptyTexts.some((t) => t.includes('DEMO')), false, 'Live state does not display DEMO tag');

  // 6. Test Live error state isolation
  const errorDetail = 'Lỗi kết nối máy chủ API';
  const liveErrorMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'live',
    onModeChange() {},
    source: { status: 'error', mode: 'live', detail: errorDetail, title: 'Lỗi Live' },
    onRetryLive: () => retryCalls++,
  });

  const liveErrorTree = liveErrorMount.render();
  const liveErrorTexts = elements(liveErrorTree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(liveErrorTexts.some((t) => t.includes(errorDetail)), 'Live error state displays error detail string');

  // Retry live button
  const retryBtn = elements(liveErrorTree, 'Pressable').find((item) => item.props.testID === 'notebook-retry-live-btn');
  assert.ok(retryBtn, 'Retry live button rendered in live error mode');
  retryBtn.props.onPress();
  assert.equal(retryCalls, 1, 'Retry live callback triggered on error retry');

  drawerMount.unmount();
  liveEmptyMount.unmount();
  liveErrorMount.unmount();
});

test('LandingScreen quick-actions render accurately in English locale', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
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

  const tree = mountObj.render();
  const dock = elements(tree, 'View').find((item) => item.props.testID === 'landing-tool-dock');
  assert.ok(dock, 'ToolDock rendered in EN');

  const gpsBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-gps');
  assert.equal(gpsBtn.props.accessibilityLabel, 'GPS Location');

  const qrBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-dock-qr');
  assert.equal(qrBtn.props.accessibilityLabel, 'Scan QR Code');

  const notebookBtn = elements(tree, 'Pressable').find((item) => item.props.testID === 'landing-notebook');
  assert.equal(notebookBtn.props.accessibilityLabel, translator.t('en', 'home.notebook_label'));

  mountObj.unmount();
});
