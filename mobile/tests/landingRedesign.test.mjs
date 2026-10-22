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
        { id: 'fiction-letter', name: loc === 'en' ? 'Hanoi Letters' : 'Thư Hà Nội', tagline: 'Kể chuyện', theme: 'Văn hóa', district: 'Hoàn Kiếm', coverPhoto: 2, kind: 'simulated', nodeCount: 6 },
        { id: 'ngo-gach', name: loc === 'en' ? 'Gach Alley' : 'Ngõ Gạch', tagline: 'Ngõ cổ', theme: 'Đời sống', district: 'Đồng Xuân', coverPhoto: 3, kind: 'simulated', nodeCount: 5 },
      ],
      getBundledDataset: () => fixture,
      isCollectionId: (id) => ['old-quarter-pilot', 'fiction-letter', 'ngo-gach'].includes(id),
    },
    '../data/sourceState': sources,
    '../assets/photoMap': {
      HERO_PHOTO: { testUri: 'pexels_demo_06.jpg' },
    },
    '../theme': {
      colors: { primary: '#2D5748', terracotta: '#C85A32', text: '#2C221E' },
      radius: { sm: 4, md: 8, lg: 16, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24 },
    },
    ...overrides,
  };

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
    if (id === './AppIcon' || id === '../components/AppIcon' || /\/components\//.test(id) || id.includes('AlleyStoryCard') || id.includes('AlleyGuideSection')) {
      const name = id.split('/').at(-1);
      return { [name]: name, AppIcon: 'AppIcon', AlleyStoryCard: 'AlleyStoryCard', AlleyGuideSection: 'AlleyGuideSection' };
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

  // 2. Green soundscape banner removed; replaced with plain text status line
  const bg = elements(tree, 'ImageBackground')[0];
  assert.ok(bg, 'ImageBackground rendered');
  assert.equal(bg.props.blurRadius, 14, 'Hero image background blurRadius is 14');

  // Status line text is present
  const expectedStatus = translator.t('vi', 'landing.mode_status', { mode: translator.t('vi', 'common.demo') });
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
// ACCEPTANCE GROUP (b): Có nút ngôn ngữ phân đoạn và nút Sổ tay
// =============================================================================
test('Redesign (b): Header renders segmented VI|EN control and Sổ tay notebook button', () => {
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

  // 3. Header Sổ tay button exists with icon and label
  const headerNotebookBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-header-notebook');
  assert.ok(headerNotebookBtn, 'Header Sổ tay button is present');
  assert.equal(headerNotebookBtn.props.accessibilityRole, 'button');
  assert.equal(headerNotebookBtn.props.accessibilityLabel, translator.t('vi', 'landing.header_notebook_label'));

  const headerNotebookTexts = elements(headerNotebookBtn, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(headerNotebookTexts.includes(translator.t('vi', 'landing.header_notebook')), 'Header notebook text Sổ tay rendered');

  // 4. Pressing header Sổ tay opens NotebookDrawerModal
  headerNotebookBtn.props.onPress();
  const treeAfterOpen = mountObj.render();
  const drawerModal = elements(treeAfterOpen, 'Modal').find((m) => m.props.testID === 'notebook-drawer-modal');
  assert.ok(drawerModal, 'NotebookDrawerModal found');
  assert.equal(drawerModal.props.visible, true, 'NotebookDrawerModal is visible after tapping header notebook button');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (c): Passport mở được từ trong Sổ tay (không bị stacked modal)
// =============================================================================
test('Redesign (c): Alley Passport is accessible inside NotebookDrawerModal without stacked modals', () => {
  let drawerClosed = false;

  const mountObj = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => { drawerClosed = true; },
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  let tree = mountObj.render();

  // 1. Passport tool button is present in the main tools grid
  const passportTool = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-tool-passport');
  assert.ok(passportTool, 'Passport tool button present in Notebook tools grid');
  assert.equal(passportTool.props.accessibilityRole, 'button');

  // 2. Pressing Passport tool opens Passport subview within the same modal
  passportTool.props.onPress();
  tree = mountObj.render();

  // Verify only 1 Modal is rendered (no stacked RN Modal that blocks iOS presentation)
  const allModals = elements(tree, 'Modal');
  assert.equal(allModals.length, 1, 'Single modal presentation, no stacked modals');

  // Verify Passport subview header and guide text
  const passportTexts = elements(tree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(passportTexts.includes(translator.t('vi', 'landing.passport_title')), 'Passport title rendered in header');
  assert.ok(passportTexts.includes(translator.t('vi', 'landing.passport_phase')), 'Passport phase rendered');
  assert.ok(passportTexts.some((t) => t.includes(translator.t('vi', 'landing.passport_guide'))), 'Passport guide text rendered');

  // Stamp slots present
  const stampLabels = passportTexts.filter((t) => t.includes(translator.t('vi', 'home.stop_prefix')));
  assert.ok(stampLabels.length >= 3, 'Heritage collection stamp slots rendered');

  // 3. Back button returns to main Notebook menu
  const backBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-passport-back-btn');
  assert.ok(backBtn, 'Passport back button rendered');
  backBtn.props.onPress();
  tree = mountObj.render();

  // Now back to tools grid
  const planTool = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-tool-plan');
  assert.ok(planTool, 'Returned to main Notebook tools grid');

  // 4. Re-enter Passport and close via passport close button
  const passportTool2 = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-tool-passport');
  passportTool2.props.onPress();
  tree = mountObj.render();

  const closeBtn = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-passport-close-btn');
  assert.ok(closeBtn, 'Passport close button rendered');
  closeBtn.props.onPress();
  assert.equal(drawerClosed, true, 'onClose triggered when closing from passport view');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (d): Đổi chế độ Demo/Live vẫn tới được từ Sổ tay
// =============================================================================
test('Redesign (d): Demo/Live mode toggle is fully functional in NotebookDrawerModal', () => {
  let currentMode = 'demo';
  const modeChanges = [];

  const mountObj = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: currentMode,
    onModeChange: (next) => {
      modeChanges.push(next);
      currentMode = next;
    },
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  const tree = mountObj.render();

  const demoOption = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-demo');
  const liveOption = elements(tree, 'Pressable').find((p) => p.props.testID === 'notebook-mode-live');
  assert.ok(demoOption, 'notebook-mode-demo is present');
  assert.ok(liveOption, 'notebook-mode-live is present');

  assert.equal(demoOption.props.accessibilityState?.checked, true, 'demo is initially checked');
  assert.equal(liveOption.props.accessibilityState?.checked, false, 'live is initially unchecked');

  // Toggle to live
  liveOption.props.onPress();
  assert.deepEqual(modeChanges, ['live'], 'onModeChange triggered with "live"');

  mountObj.unmount();
});

// =============================================================================
// ACCEPTANCE GROUP (e): Hai ô công cụ cùng minHeight và mô tả numberOfLines
// =============================================================================
test('Redesign (e): Two quick action cards share minHeight 72 and strict numberOfLines bounds', () => {
  const mountObj = createTestMount('../src/screens/LandingScreen.tsx', {
    navigation: { navigate() {}, goBack() {}, replace() {} },
    route: { params: {} },
    nodeCount: 6,
    mode: 'demo',
  });

  const tree = mountObj.render();

  const gpsCard = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-quick-gps');
  const notebookCard = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-quick-notebook');
  assert.ok(gpsCard, 'landing-quick-gps card present');
  assert.ok(notebookCard, 'landing-quick-notebook card present');

  // Both cards have minHeight 72
  const gpsStyle = resolveStyle(gpsCard.props.style);
  const notebookStyle = resolveStyle(notebookCard.props.style);
  assert.ok(gpsStyle.some((s) => s.minHeight === 72), 'GPS card has minHeight: 72');
  assert.ok(notebookStyle.some((s) => s.minHeight === 72), 'Notebook card has minHeight: 72');

  // Both titles have numberOfLines={1}
  const gpsTitle = elements(gpsCard, 'Text').find((t) => t.props.numberOfLines === 1);
  const notebookTitle = elements(notebookCard, 'Text').find((t) => t.props.numberOfLines === 1);
  assert.ok(gpsTitle, 'GPS card title has numberOfLines={1}');
  assert.ok(notebookTitle, 'Notebook card title has numberOfLines={1}');

  // Both descriptions have numberOfLines={2}
  const gpsDesc = elements(gpsCard, 'Text').find((t) => t.props.numberOfLines === 2);
  const notebookDesc = elements(notebookCard, 'Text').find((t) => t.props.numberOfLines === 2);
  assert.ok(gpsDesc, 'GPS card desc has numberOfLines={2}');
  assert.ok(notebookDesc, 'Notebook card desc has numberOfLines={2}');

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
  const seeAllStyle = [].concat(seeAll.props.style).filter(Boolean);
  assert.ok(seeAllStyle.some((s) => s.minHeight >= 44), 'See all has minHeight >= 44');

  // 2. Segmented control buttons
  const viSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-vi');
  const enSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-en');
  const viStyle = [].concat(viSegment.props.style).filter(Boolean);
  const enStyle = [].concat(enSegment.props.style).filter(Boolean);
  assert.ok(viStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'VI segment has minHeight and minWidth >= 44');
  assert.ok(enStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'EN segment has minHeight and minWidth >= 44');

  // 3. Header notebook button
  const headerNotebook = elements(tree, 'Pressable').find((p) => p.props.testID === 'landing-header-notebook');
  const headerNotebookStyle = [].concat(headerNotebook.props.style).filter(Boolean);
  assert.ok(headerNotebookStyle.some((s) => s.minHeight >= 44 && s.minWidth >= 44), 'Header notebook has minHeight and minWidth >= 44');

  // 4. Modal close & back buttons in NotebookDrawerModal
  const drawerMount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: sources.getSourceState('demo', fixture, 'vi'),
  });

  let drawerTree = drawerMount.render();
  const drawerCloseBtn = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-drawer-close-btn');
  const drawerCloseStyle = [].concat(drawerCloseBtn.props.style).filter(Boolean);
  assert.ok(drawerCloseStyle.some((s) => s.width >= 44 && s.height >= 44), 'Drawer close button is at least 44x44');

  // In passport subview
  const passportTool = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-tool-passport');
  passportTool.props.onPress();
  drawerTree = drawerMount.render();

  const passportBackBtn = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-passport-back-btn');
  const passportBackStyle = [].concat(passportBackBtn.props.style).filter(Boolean);
  assert.ok(passportBackStyle.some((s) => s.width >= 44 && s.height >= 44), 'Passport back button is at least 44x44');

  const passportCloseBtn = elements(drawerTree, 'Pressable').find((p) => p.props.testID === 'notebook-passport-close-btn');
  const passportCloseStyle = [].concat(passportCloseBtn.props.style).filter(Boolean);
  assert.ok(passportCloseStyle.some((s) => s.width >= 44 && s.height >= 44), 'Passport close button is at least 44x44');

  mountObj.unmount();
  drawerMount.unmount();
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
  assert.ok(allTexts.includes(translator.t('vi', 'landing.quick_section_title')), 'VI quick section title rendered');
  assert.ok(allTexts.includes(translator.t('vi', 'landing.header_notebook')), 'VI header notebook label rendered');
  assert.ok(allTexts.includes(translator.t('vi', 'landing.quick_gps_desc')), 'VI shortened GPS description rendered');
  assert.ok(allTexts.includes(translator.t('vi', 'landing.quick_notebook_desc')), 'VI shortened Notebook description rendered');

  // 2. Switch to EN via segment button
  const enSegment = elements(tree, 'Pressable').find((p) => p.props.testID === 'locale-option-en');
  enSegment.props.onPress();
  assert.deepEqual(setLocaleCalls, ['en'], 'setLocale called with "en"');

  // 3. EN locale check
  tree = mountObj.render();
  allTexts = elements(tree, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(allTexts.includes(translator.t('en', 'landing.featured_section_title')), 'EN section title rendered');
  assert.ok(allTexts.includes(translator.t('en', 'landing.quick_section_title')), 'EN quick section title rendered');
  assert.ok(allTexts.includes(translator.t('en', 'landing.header_notebook')), 'EN header notebook label rendered');
  assert.ok(allTexts.includes(translator.t('en', 'landing.quick_gps_desc')), 'EN shortened GPS description rendered');
  assert.ok(allTexts.includes(translator.t('en', 'landing.quick_notebook_desc')), 'EN shortened Notebook description rendered');

  const enStatus = translator.t('en', 'landing.mode_status', { mode: translator.t('en', 'common.demo') });
  assert.ok(allTexts.some((t) => t.includes(enStatus)), `EN status line rendered: "${enStatus}"`);

  mountObj.unmount();
});
