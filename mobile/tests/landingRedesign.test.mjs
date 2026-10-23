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

// Transpile AlleyPassportModal
const passportCode = ts.transpileModule(readFileSync(new URL('../src/components/AlleyPassportModal.tsx', import.meta.url), 'utf8'), {
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
    StyleSheet: { create: (s) => s, absoluteFill: {} },
    Platform: { OS: 'ios' },
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

  // Build AlleyPassportModal module
  const passportMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + passportCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (id === './AppIcon' || id === '../components/AppIcon') {
      return { AppIcon: 'AppIcon' };
    }
    throw new Error(`Unexpected import in passport: ${id}`);
  }, passportMod, passportMod.exports);
  modules['../components/AlleyPassportModal'] = passportMod.exports;

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

  const screenCode = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const screenMod = { exports: {} };
  runInNewContext('(function(require,module,exports){' + screenCode + '\n})', { process: { env: {} }, setTimeout, clearTimeout })((id) => {
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (id === './AppIcon' || id === '../components/AppIcon' || id === '../components/NgoKeLogo' || id.includes('NgoKeLogo') || /\/components\//.test(id) || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1);
      return { [name]: name, AppIcon: 'AppIcon', NgoKeLogo: 'NgoKeLogo', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection' };
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
      if (nextProps) {
        currentProps = { ...currentProps, ...nextProps };
      }
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

// =============================================================================
// ACCEPTANCE GROUP (a): Landing không còn quote/banner/pill DEMO dạng nút
// =============================================================================
test('Redesign (a): LandingScreen drops quote card, soundscape green banner, and button-style DEMO pill', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();
  const allTexts = elements(tree, 'Text').map((t) => [].concat(t.props.children).join(''));
  const allPressables = elements(tree, 'Pressable');

  // 1. Compact quote completely removed
  const quoteMark = elements(tree, 'Text').find((t) => t.props.children === '“');
  assert.equal(quoteMark, undefined, 'Quote quotation mark “ is not rendered');
  assert.equal(allTexts.some((t) => t.includes(translator.t('vi', 'landing.quote_text'))), false, 'Quote text is removed');
  assert.equal(allTexts.some((t) => t.includes(translator.t('vi', 'landing.quote_author'))), false, 'Quote author is removed');

  // 2. Green soundscape banner removed; replaced with plain text status line (B1: blur~6, scrim a>=0.62)
  const bg = elements(tree, 'ImageBackground')[0];
  assert.ok(bg, 'ImageBackground rendered');
  assert.equal(bg.props.blurRadius, 6, 'Hero image background blurRadius is 6');

  // Status line text is static (B7)
  const expectedStatus = translator.t('vi', 'landing.mode_status');
  assert.ok(allTexts.some((t) => t.includes(expectedStatus)), `Status line rendered with: ${expectedStatus}`);

  // 3. Header button-style DEMO pill removed
  const demoButtons = allPressables.filter((p) => {
    const textChildren = elements(p, 'Text').map((t) => [].concat(t.props.children).join(''));
    return textChildren.includes('DEMO') || textChildren.includes('LIVE');
  });
  assert.equal(demoButtons.length, 0, 'No header button with literal DEMO or LIVE label');

  // 4. Card meta does NOT append redundant "· Demo" or "· Live"
  const metaTexts = allTexts.filter((t) => t.includes('điểm') || t.includes('stops'));
  for (const text of metaTexts) {
    assert.equal(text.includes('· Demo'), false, `Card stop count meta does not append · Demo: "${text}"`);
    assert.equal(text.includes('· Live'), false, `Card stop count meta does not append · Live: "${text}"`);
  }

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (b): Có nút ngôn ngữ phân đoạn và nút Hộ chiếu trên Header
// =============================================================================
test('Redesign (b): Header renders segmented VI|EN control and Passport icon button', () => {
  let selectedLocale = 'vi';
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: selectedLocale,
        setLocale: (next) => { selectedLocale = next; },
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t(selectedLocale, key, params),
      }),
    },
  });

  const tree = mountObj.render();

  // 1. Segmented control exists and retains testID="locale-switch"
  const segmentedControl = elements(tree, 'View').find((v) => v.props.testID === 'locale-switch');
  assert.ok(segmentedControl, 'Segmented control container with testID="locale-switch" is present');
  assert.equal(segmentedControl.props.accessibilityRole, 'radiogroup');

  // 2. Both segment options present with correct selected state
  const viSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-vi');
  const enSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-en');
  assert.ok(viSegment, 'VI segment option rendered');
  assert.ok(enSegment, 'EN segment option rendered');
  assert.equal(viSegment.props.accessibilityState?.selected, true, 'VI segment selected by default');
  assert.equal(enSegment.props.accessibilityState?.selected, false, 'EN segment not selected by default');

  // 3. Header Passport button exists with icon only, touch target >= 44
  const headerPassportBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-header-passport');
  assert.ok(headerPassportBtn, 'Header Passport button is present');
  assert.equal(headerPassportBtn.props.accessibilityRole, 'button');
  assert.equal(headerPassportBtn.props.accessibilityLabel, 'Hộ chiếu ngõ phố');

  // Icon only across all font scales (no visible text children in header passport button)
  const headerPassportTexts = elements(headerPassportBtn, 'Text');
  assert.equal(headerPassportTexts.length, 0, 'Header passport button is icon only with no text children');

  // 4. Pressing header Passport opens AlleyPassportModal
  headerPassportBtn.props.onPress();
  const treeAfterOpen = mountObj.render();
  const passportModal = elements(treeAfterOpen, 'Modal').find((m) => m.props.testID === 'alley-passport-modal');
  assert.ok(passportModal, 'AlleyPassportModal found');
  assert.equal(passportModal.props.visible, true, 'AlleyPassportModal is visible after tapping header passport button');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (c): Passport mở từ Landing header và không nằm trong Notebook
// =============================================================================
test('Redesign (c): Alley Passport is accessible via Landing header and removed from NotebookDrawerModal', () => {
  const drawerMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  const drawerTree = drawerMount.render();

  // 1. Passport tool button is removed from NotebookDrawerModal
  const passportTool = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-tool-passport');
  assert.equal(passportTool, undefined, 'Passport tool is removed from Notebook drawer');

  // 2. AlleyPassportModal rendered standalone
  const passportMount = createTestMount('../src/components/AlleyPassportModal.tsx', {
    visible: true,
    onClose: () => {},
  });

  const pTree = passportMount.render();
  const allModals = elements(pTree, 'Modal');
  assert.equal(allModals.length, 1, 'Single modal presentation, no stacked modals');

  const passportTexts = elements(pTree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(passportTexts.includes(translator.t('vi', 'landing.passport_title')), 'Passport title rendered in header');
  assert.ok(passportTexts.includes(translator.t('vi', 'landing.passport_phase')), 'Passport phase rendered');
  assert.ok(passportTexts.some((t) => t.includes(translator.t('vi', 'landing.passport_guide'))), 'Passport guide text rendered');

  drawerMount.unmount();
  passportMount.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (d): Chuyển Demo/Live trong NotebookDrawerModal
// =============================================================================
test('Redesign (d): Demo/Live mode toggle is fully functional in NotebookDrawerModal', () => {
  const modeChanges = [];
  const mountObj = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose() {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: (next) => modeChanges.push(next),
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  const tree = mountObj.render();
  const demoOption = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-demo');
  const liveOption = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-live');

  assert.ok(demoOption, 'Demo mode option present');
  assert.ok(liveOption, 'Live mode option present');

  liveOption.props.onPress();
  assert.deepEqual(modeChanges, ['live'], 'Tapping Live switches mode to live');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (e): ToolDock có đúng 3 items với nhãn và kích thước chuẩn
// =============================================================================
test('Redesign (e): Shared ToolDock renders exactly 3 items with text labels and safe geometry', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();

  const dock = elements(tree, 'View').find((v) => v.props.testID === 'landing-tool-dock');
  assert.ok(dock, 'ToolDock present on Landing');

  const gpsBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-dock-gps');
  const qrBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-dock-qr');
  const notebookBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-notebook');

  assert.ok(gpsBtn, 'landing-dock-gps present');
  assert.ok(qrBtn, 'landing-dock-qr present');
  assert.ok(notebookBtn, 'landing-notebook present');

  // All 3 items render text labels
  const gpsTexts = elements(gpsBtn, 'Text').map((t) => [].concat(t.props.children).join(''));
  const qrTexts = elements(qrBtn, 'Text').map((t) => [].concat(t.props.children).join(''));
  const notebookTexts = elements(notebookBtn, 'Text').map((t) => [].concat(t.props.children).join(''));

  assert.ok(gpsTexts.includes('Vị trí'), 'GPS button has visible label "Vị trí"');
  assert.ok(qrTexts.includes('Quét QR'), 'QR button has visible label "Quét QR"');
  assert.ok(notebookTexts.includes('Sổ tay'), 'Notebook button has visible label "Sổ tay"');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (f): Vùng chạm 44 pt của các nút
// =============================================================================
test('Redesign (f): Interactive controls enforce minimum 44pt touch targets', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();

  // 1. See all link
  const seeAll = elements(tree, 'Pressable').find((p) => p.props.accessibilityLabel === translator.t('vi', 'landing.see_all_label'));
  assert.ok(seeAll, 'See all link present');
  const seeAllStyle = resolveStyle(seeAll.props.style);
  assert.ok(seeAllStyle.some((s) => s.minHeight >= 44), 'See all has minHeight >= 44');

  // 2. Segmented control buttons
  const viSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-vi');
  const enSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-en');
  const viStyle = resolveStyle(viSegment.props.style);
  const enStyle = resolveStyle(enSegment.props.style);
  assert.ok(viStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'VI segment has minHeight and minWidth >= 44');
  assert.ok(enStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'EN segment has minHeight and minWidth >= 44');

  // 3. Header Passport button
  const headerPassport = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-header-passport');
  const headerPassportStyle = resolveStyle(headerPassport.props.style);
  assert.ok(headerPassportStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'Header passport has minHeight and minWidth >= 44');

  // 4. Modal close in NotebookDrawerModal
  const drawerMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  const drawerTree = drawerMount.render();
  const drawerCloseBtn = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-drawer-close-btn');
  const drawerCloseStyle = [].concat(drawerCloseBtn.props.style).filter(Boolean);
  assert.ok(drawerCloseStyle.some((s) => s.width >= 44 && s.height >= 44), 'Drawer close button is at least 44x44');

  // 5. Passport modal close button
  const passportMount = createTestMount('../src/components/AlleyPassportModal.tsx', {
    visible: true,
    onClose: () => {},
  });
  const passportTree = passportMount.render();
  const passportCloseBtn = elements(passportTree, 'Pressable').find((p) => p.props.testID === 'passport-modal-close-btn');
  const passportCloseStyle = [].concat(passportCloseBtn.props.style).filter(Boolean);
  assert.ok(passportCloseStyle.some((s) => s.width >= 44 && s.height >= 44), 'Passport close button is at least 44x44');

  mountObj.unmount();
  drawerMount.unmount();
  passportMount.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (g): VI/EN hiển thị đúng
// =============================================================================
test('Redesign (g): Complete locale switching and translations rendered faithfully in VI and EN', () => {
  let localeState = 'vi';
  const setLocaleCalls = [];

  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  }, {
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: localeState,
        setLocale: (next) => {
          setLocaleCalls.push(next);
          localeState = next;
        },
        collectionId: 'old-quarter-pilot',
        setCollectionId: () => {},
        t: (key, params) => translator.t(localeState, key, params),
      }),
    },
  });

  // 1. VI locale check
  let tree = mountObj.render();
  let allTexts = elements(tree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(allTexts.includes(translator.t('vi', 'landing.featured_section_title')), 'VI section title rendered');

  const gpsBtnVi = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-dock-gps');
  assert.equal(gpsBtnVi.props.accessibilityLabel, 'Vị trí GPS');

  const viStatus = translator.t('vi', 'landing.mode_status');
  assert.ok(allTexts.some((t) => t.includes(viStatus)), `VI status line rendered: "${viStatus}"`);

  // 2. Switch to EN via segment button
  const enSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-en');
  enSegment.props.onPress();
  assert.deepEqual(setLocaleCalls, ['en'], 'setLocale called with "en"');

  // 3. EN locale check
  tree = mountObj.render();
  allTexts = elements(tree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(allTexts.includes(translator.t('en', 'landing.featured_section_title')), 'EN section title rendered');

  const gpsBtnEn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-dock-gps');
  assert.equal(gpsBtnEn.props.accessibilityLabel, 'GPS Location');

  const enStatus = translator.t('en', 'landing.mode_status');
  assert.ok(allTexts.some((t) => t.includes(enStatus)), `EN status line rendered: "${enStatus}"`);

  mountObj.unmount();
});
