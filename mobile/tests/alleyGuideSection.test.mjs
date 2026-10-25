import { nodeVisualModule, visualComponentStubs } from './helpers/nodeVisualModules.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';

import { t } from '../src/i18n/translator.ts';
import { readAlleyGuide } from '../src/data/alleyGuide.ts';

function loadTsModule(relPath, extraMocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL(relPath, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const mod = { exports: {} };
  runInNewContext('(function(require,module,exports){\n' + code + '\n})', {
    process: { env: {} },
    setTimeout,
    clearTimeout,
  })((id) => {
    if (id === '../assets/nodeVisual') return nodeVisualModule;
    if (id.endsWith('/HeritageSketchPlaceholder')) return visualComponentStubs;
    if (extraMocks[id]) return extraMocks[id];
    if (id === 'react-native') return { StyleSheet: { create: (s) => s } };
    if (id === './locale' || id === '../data/locale') return { isLocale: (v) => v === 'vi' || v === 'en' };
    if (id === '../i18n/translator' || id === './src/i18n/translator') return { t };
    if (id.includes('threeLensesCompanion')) {
      return {
        getThreeLensesDatasetRevision: () => 'rev',
        THREE_LENSES_COLLECTION_ID: 'old-quarter-three-lenses',
      };
    }
    if (id.endsWith('.json')) {
      const fileUrl = new URL(id, new URL(relPath, import.meta.url));
      return JSON.parse(readFileSync(fileUrl, 'utf8'));
    }
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (id === '../assets/photoMap' || id === './src/assets/photoMap') {
      return { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'NgoKe', getAlleyMeta: () => ({ name: 'Ngõ', coverPhoto: 1, photographer: 'NgoKe' }) };
    }
    throw new Error('Unexpected import in test loader: ' + id);
  }, mod, mod.exports);
  return mod.exports;
}

const collections = loadTsModule('../src/data/collections.ts');

for (const locale of ['vi', 'en']) {
  test(`Notebook source isolation and open-drawer mode/retry transitions (${locale})`, () => {
    const dataset = collections.getBundledDataset('ngo-trung-yen', locale);
    const serverDataset = structuredClone(dataset);
    serverDataset.guide.eat[0].name = 'SERVER ONLY GUIDE';
    let retries = 0;
    const mount = createTestMount('../src/components/NotebookDrawerModal.tsx', {
      visible: true, onClose() {}, navigation: { navigate() {} },
      mode: 'demo', onModeChange() {}, collectionId: 'ngo-trung-yen',
      source: { mode: 'demo', status: 'ready', dataset }, onRetryLive() { retries++; },
    }, { __locale: locale });
    const guide = (tree) => findElements(tree, 'View').filter((v) => v.props.testID === 'alley-guide-section');
    assert.equal(guide(mount.render()).length, 1);
    for (const [status, liveBusy, reason] of [['empty', false, 'no-config'], ['empty', false, 'no-data'], ['error', false, undefined], ['empty', true, 'no-data']]) {
      const tree = mount.render({ mode: 'live', source: { mode: 'live', status, reason, title: 'Live', detail: 'unavailable' }, liveBusy });
      assert.equal(guide(tree).length, 0, `${status}/busy=${liveBusy} must not show bundle guide`);
      assert.ok(findElements(tree, 'Pressable').length > 0, 'tools remain available');
    }
    const ready = { mode: 'live', status: 'ready', dataset: serverDataset };
    let tree = mount.render({ source: ready, liveBusy: false });
    assert.equal(guide(tree).length, 1);
    assert.ok(findElements(tree, 'Text').some((v) => v.props.children === 'SERVER ONLY GUIDE'));
    const noGuide = { ...serverDataset, guide: undefined };
    assert.equal(guide(mount.render({ source: { ...ready, dataset: noGuide } })).length, 0);
    // A late Live result while Demo is selected must never replace its bundle.
    tree = mount.render({ mode: 'demo', source: ready });
    assert.equal(guide(tree).length, 1);
    assert.ok(!findElements(tree, 'Text').some((v) => v.props.children === 'SERVER ONLY GUIDE'));
    // Conversely a stale Demo result during a Live retry is not a Live guide.
    tree = mount.render({ mode: 'live', source: { mode: 'demo', status: 'ready', dataset } });
    assert.equal(guide(tree).length, 0);
    tree = mount.render({ source: { mode: 'live', status: 'error', title: 'Live', detail: 'failed' } });
    const retry = findElements(tree, 'Pressable').find((v) => v.props.testID === 'notebook-retry-live-btn');
    assert.ok(retry);
    retry.props.onPress();
    tree = mount.render({ liveBusy: true, source: { mode: 'live', status: 'empty', reason: 'no-data' } });
    assert.equal(guide(tree).length, 0);
    assert.equal(guide(mount.render({ source: ready, liveBusy: false })).length, 1);
    assert.equal(retries, 1);
  });
}

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
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, value: factory() };
      return slots[i].value;
    },
  };

  const reactJsx = {
    jsx: (type, props) => element(type, props),
    jsxs: (type, props) => element(type, props),
  };

  const rn = {
    StyleSheet: { create: (s) => s, absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } },
    View: 'View',
    Text: 'Text',
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    Modal: 'Modal',
    Image: 'Image',
    ImageBackground: 'ImageBackground',
    Animated: {
      Value: class {
        constructor(v) { this.v = v; }
        interpolate() { return this; }
        stopAnimation() {}
        setValue(v) { this.v = v; }
      },
      View: 'Animated.View',
      timing: () => ({ start: (cb) => cb?.(), stop: () => {} }),
      spring: () => ({ start: (cb) => cb?.(), stop: () => {} }),
    },
    useWindowDimensions: () => ({ width: 390, height: 844, fontScale: overrides.__fontScale ?? 1 }),
  };

  const modules = {
    react,
    'react/jsx-runtime': reactJsx,
    'react-native': rn,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
    },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: overrides.__locale ?? 'vi',
        setLocale: () => {},
        t: (k, params) => t(overrides.__locale ?? 'vi', k, params),
      }),
    },
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false }),
    },
    '../hooks/useMotion': {
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),
    },
    '../data/collections': collections,
    '../data/alleyGuide': { readAlleyGuide, readAlleyStory: () => null },
    '../theme': {
      colors: {
        surface: '#FFFDF7',
        surfaceWarm: '#F1EAD8',
        background: '#F7F2E8',
        text: '#2E3028',
        muted: '#626559',
        accent: '#2D5748',
        border: '#E2DDD3',
        borderStrong: '#C5BEAF',
        terracotta: '#9C4F36',
      },
      radius: { sm: 6, md: 12, lg: 18, pill: 999 },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    },
    './AppIcon': { AppIcon: 'AppIcon' },
    ...overrides,
  };

  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;

  const mod = { exports: {} };
  runInNewContext('(function(require,module,exports){\n' + code + '\n})', {
    process: { env: {} },
    setTimeout,
    clearTimeout,
  })((id) => {
    if (id === '../assets/nodeVisual') return nodeVisualModule;
    if (id.endsWith('/HeritageSketchPlaceholder')) return visualComponentStubs;
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    if (id === './AlleyGuideSection' || id === '../components/AlleyGuideSection') {
      const guideCode = ts.transpileModule(readFileSync(new URL('../src/components/AlleyGuideSection.tsx', import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      }).outputText;
      const guideMod = { exports: {} };
      runInNewContext('(function(require,module,exports){\n' + guideCode + '\n})', {
        process: { env: {} },
        setTimeout,
        clearTimeout,
      })((gid) => modules[gid] || { [gid]: gid }, guideMod, guideMod.exports);
      return guideMod.exports;
    }
    if (/\/components\//.test(id) || /\/screens\//.test(id)) {
      const name = id.split('/').at(-1);
      return { [name]: name };
    }
    throw new Error(`Unexpected import: ${id}`);
  }, mod, mod.exports);

  const Component = mod.exports[Object.keys(mod.exports)[0]];

  let currentProps = { ...defaultProps };
  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      dirty = true;
      let iterations = 0;
      while (dirty && iterations < 15) {
        dirty = false;
        cursor = 0;
        pending = [];
        tree = Component(currentProps);
        for (const effect of pending) effect();
        iterations++;
      }
      return tree;
    },
  };
}

function findElements(node, type) {
  const result = [];
  if (!node) return result;
  if (Array.isArray(node)) {
    for (const item of node) result.push(...findElements(item, type));
    return result;
  }
  if (node.type === type) result.push(node);
  if (Array.isArray(node.props?.children)) {
    for (const child of node.props.children) result.push(...findElements(child, type));
  } else if (node.props?.children) {
    result.push(...findElements(node.props.children, type));
  }
  return result;
}

test('AlleyGuideSection renders 3 groups (Quán nên thử, Nên ghé thăm, Hành trình đề xuất) and caveats', () => {
  const dataset = collections.getBundledDataset('ngo-tam-thuong', 'vi');
  const guide = readAlleyGuide(dataset);
  assert.ok(guide, 'ngo-tam-thuong must have a guide');

  const mount = createTestMount('../src/components/AlleyGuideSection.tsx', { guide });
  const tree = mount.render();

  const section = findElements(tree, 'View').find((v) => v.props?.testID === 'alley-guide-section');
  assert.ok(section, 'Section root testID alley-guide-section must exist');

  const texts = findElements(tree, 'Text').map((t) => [].concat(t.props?.children).join(''));

  // 1. Quán nên thử (Eat group)
  assert.ok(texts.includes('Quán nên thử'), 'Group title "Quán nên thử" displayed');
  for (const item of guide.eat) {
    assert.ok(texts.includes(item.name), `Eat item "${item.name}" displayed`);
    assert.ok(texts.includes(item.dishes), `Dishes for "${item.name}" displayed`);
  }

  // 2. Nên ghé thăm (Visit group)
  assert.ok(texts.includes('Nên ghé thăm'), 'Group title "Nên ghé thăm" displayed');
  for (const item of guide.visit) {
    assert.ok(texts.includes(item.name), `Visit item "${item.name}" displayed`);
    for (const note of item.notes) {
      assert.ok(texts.some((t) => t.includes(note)), `Visit note "${note.slice(0, 25)}..." displayed`);
    }
  }

  // 3. Hành trình đề xuất (Route group)
  assert.ok(texts.includes('Hành trình đề xuất'), 'Group title "Hành trình đề xuất" displayed');
  for (const step of guide.route) {
    assert.ok(texts.includes(step), `Route step "${step}" displayed`);
  }

  // 4. Caveats (Lưu ý trải nghiệm)
  if (guide.caveats.length > 0) {
    assert.ok(texts.includes('⚠️ Lưu ý trải nghiệm'), 'Caveats header displayed');
    for (const caveat of guide.caveats) {
      assert.ok(texts.some((t) => t.includes(caveat)), `Caveat "${caveat.slice(0, 25)}..." displayed`);
    }
  }

  // APA evidence bibliography MUST NOT be displayed
  for (const ev of guide.evidence) {
    assert.ok(!texts.some((t) => t.includes(ev)), `Evidence citation "${ev}" must NOT be rendered on UI`);
  }

  // No external action buttons (call/reserve/map)
  const pressables = findElements(tree, 'Pressable');
  assert.equal(pressables.length, 0, 'AlleyGuideSection has NO external action buttons');
});

test('AlleyGuideSection handles null hours with "Chưa xác minh giờ" and displays address when available', () => {
  const guideWithNullHours = {
    eat: [
      { name: 'Quán A', address: '12 Ngõ', dishes: 'Món đặc biệt', hours: null, note: 'Ghi chú' },
      { name: 'Quán B', address: null, dishes: 'Món quen', hours: '08:00–12:00', note: null },
    ],
    visit: [{ name: 'Di tích X', address: '46 hoặc 48 Ngõ Phất Lộc', notes: ['Chưa xác minh giờ mở cửa.'] }],
    route: ['Điểm 1', 'Điểm 2'],
    caveats: ['Đánh giá chất lượng là ý kiến người viết, không phải kết quả đánh giá độc lập.'],
    evidence: ['https://example.com/source'],
  };

  const mount = createTestMount('../src/components/AlleyGuideSection.tsx', { guide: guideWithNullHours });
  const tree = mount.render();
  const texts = findElements(tree, 'Text').map((t) => [].concat(t.props?.children).join(''));

  // Null hours displays "Chưa xác minh giờ"
  assert.ok(texts.some((t) => t.includes('Chưa xác minh giờ')), 'Null hours must display "Chưa xác minh giờ"');
  // Specified hours displays specified hours
  assert.ok(texts.some((t) => t.includes('08:00–12:00')), 'Specified hours must be displayed');
  // Address ambiguity preserved
  assert.ok(texts.some((t) => t.includes('46 hoặc 48')), 'Address ambiguity "46 hoặc 48" preserved faithfully');
  // Caveat preserved
  assert.ok(texts.some((t) => t.includes('Đánh giá chất lượng là ý kiến người viết')), 'Author opinion caveat preserved');
});

test('NotebookDrawerModal renders AlleyGuideSection when active collection has a guide; renders NO empty wrapper when collection has NO guide', () => {
  const tyDataset = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const tySource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Trung Yên',
    detail: 'Demo dataset',
    dataset: tyDataset,
  };

  // Case 1: Collection WITH guide (ngo-trung-yen)
  const mountWithGuide = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: tySource,
    collectionId: 'ngo-trung-yen',
  });

  const treeWithGuide = mountWithGuide.render();
  const guideSection = findElements(treeWithGuide, 'View').find((v) => v.props?.testID === 'alley-guide-section');
  assert.ok(guideSection, 'NotebookDrawerModal renders alley-guide-section when collection has a guide');

  const guideTexts = findElements(guideSection, 'Text').map((t) => [].concat(t.props?.children).join(''));
  assert.ok(guideTexts.includes('Khám phá thêm'), 'Section title "Khám phá thêm" rendered in Notebook');
  assert.ok(guideTexts.includes('Quán nên thử'), 'Eat group rendered in Notebook');
  assert.ok(guideTexts.includes('Nên ghé thăm'), 'Visit group rendered in Notebook');
  assert.ok(guideTexts.includes('Hành trình đề xuất'), 'Route group rendered in Notebook');

  // Case 2: Collection WITHOUT guide (ngo-gach)
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  const mountWithoutGuide = createTestMount('../src/components/NotebookDrawerModal.tsx', {
    visible: true,
    onClose: () => {},
    navigation: { navigate() {} },
    mode: 'demo',
    onModeChange: () => {},
    source: gachSource,
    collectionId: 'ngo-gach',
  });

  const treeWithoutGuide = mountWithoutGuide.render();
  const emptySection = findElements(treeWithoutGuide, 'View').find((v) => v.props?.testID === 'alley-guide-section');
  assert.equal(emptySection, undefined, 'Collection without guide has NO alley-guide-section and NO empty wrapper');
});

test('3 newly localized collections are available from the EN UI and bundled datasets', () => {
  const viCols = collections.getLocalizedCollections('vi');
  const enCols = collections.getLocalizedCollections('en');

  const newIds = ['ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc'];

  // All 3 present in VI
  for (const id of newIds) {
    assert.ok(viCols.some((c) => c.id === id), `${id} must be in getLocalizedCollections('vi')`);
  }

  // All 3 are listed and load their own English datasets.
  for (const id of newIds) {
    assert.ok(enCols.some((c) => c.id === id), `${id} must be listed in getLocalizedCollections('en')`);
    const enDataset = collections.getBundledDataset(id, 'en');
    assert.equal(enDataset.collectionId, id, `${id} in EN must not fall back to another collection`);
    assert.equal(enDataset.locale, 'en');
    assert.ok(enDataset.alleyStory && enDataset.guide);
  }
});
