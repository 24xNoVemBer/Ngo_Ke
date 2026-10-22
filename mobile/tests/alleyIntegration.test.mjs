import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';

import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';
import { parseDataset, parseDatasetV2, validateDatasetV2Pair, getSourceState } from '../src/data/sourceState.ts';
import { t } from '../src/i18n/translator.ts';
import { computeAlleyLayout, buildSmoothPath } from '../src/utils/alleyGeometry.ts';
import { readAlleyStory, readAlleyGuide } from '../src/data/alleyGuide.ts';

function loadTsModule(relPath, extraMocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL(relPath, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  runInNewContext('(function(require,module,exports){\n' + code + '\n})', {
    process: { env: {} },
    setTimeout,
    clearTimeout,
  })((id) => {
    if (extraMocks[id]) return extraMocks[id];
    if (id === 'react-native') return { StyleSheet: { create: (s) => s } };
    if (id === './locale' || id === '../data/locale') return { isLocale: (v) => v === 'vi' || v === 'en' };
    if (id === './alleyGuide' || id === '../data/alleyGuide') return { readAlleyStory, readAlleyGuide };
    if (id === './sourceState' || id === '../data/sourceState') {
      return { parseDataset, parseDatasetV2, validateDatasetV2Pair, getSourceState };
    }
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
      return { HERO_PHOTO: 1 };
    }
    throw new Error('Unexpected import in test loader: ' + id);
  }, mod, mod.exports);
  return mod.exports;
}

const photoMap = loadTsModule('../src/assets/photoMap.ts');
const collections = loadTsModule('../src/data/collections.ts', {
  '../assets/photoMap': photoMap,
});

// Test mount harness for React components (reusing uiFlows harness pattern)
function mount(file, props, overrides = {}) {
  let dirty = true;
  let cursor = 0;
  let pending = [];
  const slots = [];
  let tree = null;

  const mockReact = {
    useState(init) {
      const idx = cursor++;
      if (slots[idx] === undefined) {
        slots[idx] = typeof init === 'function' ? init() : init;
      }
      return [
        slots[idx],
        (next) => {
          const val = typeof next === 'function' ? next(slots[idx]) : next;
          if (val !== slots[idx]) {
            slots[idx] = val;
            dirty = true;
          }
        },
      ];
    },
    useRef(init) {
      const idx = cursor++;
      if (slots[idx] === undefined) slots[idx] = { current: init };
      return slots[idx];
    },
    useEffect(effect, deps) {
      const idx = cursor++;
      const prev = slots[idx];
      let changed = !prev;
      if (prev && deps) {
        changed = deps.some((d, i) => d !== prev.deps[i]);
      }
      slots[idx] = { deps };
      if (changed) pending.push(effect);
    },
    useCallback(fn) {
      return fn;
    },
    createElement(type, elemProps, ...children) {
      const flat = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
      const p = { ...(elemProps || {}) };
      if (flat.length === 1) p.children = flat[0];
      else if (flat.length > 1) p.children = flat;
      return { type: typeof type === 'function' ? type.name || 'Component' : type, props: p };
    },
    Fragment: ({ children }) => children,
  };

  const windowDimensions = overrides.__windowDimensions ?? { width: 390, height: 844, fontScale: 1.0 };

  const rnMock = {
    StyleSheet: { create: (s) => s, absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } },
    Animated: {
      Value: class {
        constructor(v) { this.v = v; }
        interpolate() { return this; }
        stopAnimation() {}
        setValue(v) { this.v = v; }
      },
      View: 'Animated.View',
      timing: () => ({ start: () => {}, stop: () => {} }),
      spring: () => ({ start: () => {}, stop: () => {} }),
    },
    View: 'View',
    Text: 'Text',
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    Image: 'Image',
    ImageBackground: 'ImageBackground',
    useWindowDimensions: () => windowDimensions,
  };

  const modules = {
    react: mockReact,
    'react/jsx-runtime': {
      jsx: (type, p) => ({ type: typeof type === 'function' ? type.name || 'Component' : type, props: p }),
      jsxs: (type, p) => ({ type: typeof type === 'function' ? type.name || 'Component' : type, props: p }),
    },
    'react-native': rnMock,
    'react-native-safe-area-context': {
      useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    },
    'react-native-svg': {
      default: 'Svg',
      Svg: 'Svg',
      Path: 'Path',
    },
    '../context/LocaleContext': {
      useLocale: () => ({
        locale: 'vi',
        setLocale: () => {},
        t: (k, params) => t('vi', k, params),
      }),
    },
    '../hooks/MotionPreferences': {
      useMotionState: () => ({ active: true, reducedMotion: false }),
    },
    '../hooks/useMotion': {
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
    },
    '../components/CrossfadePhoto': { CrossfadePhoto: 'CrossfadePhoto' },
    '../components/AlleyTrailView': { AlleyTrailView: 'AlleyTrailView' },
    '../components/AppIcon': { AppIcon: 'AppIcon' },
    '../components/NotebookDrawerModal': { NotebookDrawerModal: 'NotebookDrawerModal' },
    '../components/AlleyStoryCard': { AlleyStoryCard: 'AlleyStoryCard' },
    '../components/AlleyGuideSection': { AlleyGuideSection: 'AlleyGuideSection' },
    './UnavailableScreen': { UnavailableScreen: 'UnavailableScreen' },
    '../assets/photoMap': photoMap,
    '../data/collections': collections,
    '../data/alleyGuide': { readAlleyStory, readAlleyGuide },
    '../theme': { colors: {}, radius: {}, spacing: {}, typography: {} },
    '../theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380 },
      motionSprings: {
        tactilePress: { tension: 260, friction: 20, useNativeDriver: true },
      },
      motionEasings: { standard: () => {} },
    },
    '../utils/alleyGeometry': {
      buildSmoothPath,
      computeAlleyLayout,
    },
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
    if (modules[id]) return modules[id];
    if (/\.(png|jpe?g|gif|webp|wav|mp3)$/i.test(id)) return 1;
    throw new Error(`Unexpected import in test mount: ${id}`);
  }, mod, mod.exports);

  const Component = mod.exports.HomeScreen ?? mod.exports.default ?? mod.exports[Object.keys(mod.exports)[0]];

  return {
    render(nextProps = props) {
      props = nextProps;
      dirty = true;
      let passes = 0;
      while (dirty) {
        if (passes++ > 20) throw new Error('Render loop exceeded');
        dirty = false;
        cursor = 0;
        pending = [];
        tree = Component(props);
        pending.forEach((effect) => effect());
      }
      return tree;
    },
  };
}

function findElements(node, typeName) {
  const result = [];
  function walk(n) {
    if (!n) return;
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (n.type === typeName) result.push(n);
    if (n.props?.children) {
      if (Array.isArray(n.props.children)) {
        n.props.children.forEach(walk);
      } else {
        walk(n.props.children);
      }
    }
  }
  walk(node);
  return result;
}

// ---------------------------------------------------------------------------
// SUITE (a): Hai collection đăng ký đúng và dataset VI/EN hợp lệ
// ---------------------------------------------------------------------------

test('(a) Collection registry - ngo-gach and ngo-trung-yen registered with simulated status and complete metadata', () => {
  assert.equal(collections.isCollectionId('ngo-gach'), true);
  assert.equal(collections.isCollectionId('ngo-trung-yen'), true);
  assert.equal(collections.isCollectionId('unknown-alley'), false);

  const gachMeta = collections.AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-gach');
  assert.ok(gachMeta, 'ngo-gach must be in AVAILABLE_COLLECTIONS');
  assert.equal(gachMeta.kind, 'simulated');
  assert.equal(gachMeta.nodeCount, 5);
  assert.ok(gachMeta.coverPhoto, 'Cover photo must be present');

  const tyMeta = collections.AVAILABLE_COLLECTIONS.find((c) => c.id === 'ngo-trung-yen');
  assert.ok(tyMeta, 'ngo-trung-yen must be in AVAILABLE_COLLECTIONS');
  assert.equal(tyMeta.kind, 'simulated');
  assert.equal(tyMeta.nodeCount, 5);
  assert.ok(tyMeta.coverPhoto, 'Cover photo must be present');

  // Localized collections format correctly for UI
  const viCols = collections.getLocalizedCollections('vi');
  const enCols = collections.getLocalizedCollections('en');
  assert.equal(viCols.length, collections.AVAILABLE_COLLECTIONS.length);
  assert.equal(enCols.length, collections.AVAILABLE_COLLECTIONS.length - 3, '3 new VI-only collections hidden in EN');
  assert.ok(!enCols.some((c) => ['ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc'].includes(c.id)));

  const viGach = viCols.find((c) => c.id === 'ngo-gach');
  const enGach = enCols.find((c) => c.id === 'ngo-gach');
  assert.equal(viGach.name, 'Ngõ Gạch');
  assert.equal(enGach.name, 'Gach Alley');
  assert.equal(viGach.theme, 'Di sản');
  assert.equal(enGach.theme, 'Heritage');

  const viTy = viCols.find((c) => c.id === 'ngo-trung-yen');
  const enTy = enCols.find((c) => c.id === 'ngo-trung-yen');
  assert.equal(viTy.name, 'Ngõ Trung Yên');
  assert.equal(enTy.name, 'Trung Yen Alley');
  assert.equal(viTy.theme, 'Ẩm thực');
  assert.equal(enTy.theme, 'Culinary');
});

test('(a) Dataset validation - ngo-gach VI/EN datasets conform to V2 schema and pair validation', () => {
  const gachVi = collections.getBundledDataset('ngo-gach', 'vi');
  const gachEn = collections.getBundledDataset('ngo-gach', 'en');

  assert.equal(gachVi.schemaVersion, 2);
  assert.equal(gachEn.schemaVersion, 2);
  assert.equal(gachVi.collectionId, 'ngo-gach');
  assert.equal(gachEn.collectionId, 'ngo-gach');
  assert.equal(gachVi.kind, 'simulated');
  assert.equal(gachEn.kind, 'simulated');
  assert.equal(gachVi.nodes.length, 5);
  assert.equal(gachEn.nodes.length, 5);
  assert.equal(gachVi.qa.length, 0, 'QA must be empty array per spec');
  assert.equal(gachEn.qa.length, 0, 'QA must be empty array per spec');

  assert.ok(gachVi.disclaimer.includes('chưa qua khảo sát thực địa'), 'Disclaimer must mention unverified field survey');
  assert.ok(gachEn.disclaimer.includes('not verified by on-site field survey'), 'Disclaimer must mention unverified status');

  const parsedVi = parseDatasetV2(gachVi, { mode: 'demo', expectedLocale: 'vi' });
  const parsedEn = parseDatasetV2(gachEn, { mode: 'demo', expectedLocale: 'en' });
  assert.ok(parsedVi, 'parseDatasetV2 accepts ngo-gach VI');
  assert.ok(parsedEn, 'parseDatasetV2 accepts ngo-gach EN');

  const pairResult = validateDatasetV2Pair(parsedVi, parsedEn);
  assert.deepEqual(pairResult, { ok: true });

  const revVi = createHash('sha256').update(canonicalDatasetJson(gachVi), 'utf8').digest('hex');
  const revEn = createHash('sha256').update(canonicalDatasetJson(gachEn), 'utf8').digest('hex');
  assert.equal(collections.getCollectionRevision('ngo-gach', 'vi'), revVi, 'COLLECTION_REVISIONS matches SHA-256 for VI');
  assert.equal(collections.getCollectionRevision('ngo-gach', 'en'), revEn, 'COLLECTION_REVISIONS matches SHA-256 for EN');
});

test('(a) Dataset validation - ngo-trung-yen VI/EN datasets conform to V2 schema and pair validation', () => {
  const tyVi = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const tyEn = collections.getBundledDataset('ngo-trung-yen', 'en');

  assert.equal(tyVi.schemaVersion, 2);
  assert.equal(tyEn.schemaVersion, 2);
  assert.equal(tyVi.collectionId, 'ngo-trung-yen');
  assert.equal(tyEn.collectionId, 'ngo-trung-yen');
  assert.equal(tyVi.kind, 'simulated');
  assert.equal(tyEn.kind, 'simulated');
  assert.equal(tyVi.nodes.length, 5);
  assert.equal(tyEn.nodes.length, 5);
  assert.equal(tyVi.qa.length, 0);
  assert.equal(tyEn.qa.length, 0);

  const parsedVi = parseDatasetV2(tyVi, { mode: 'demo', expectedLocale: 'vi' });
  const parsedEn = parseDatasetV2(tyEn, { mode: 'demo', expectedLocale: 'en' });
  assert.ok(parsedVi, 'parseDatasetV2 accepts ngo-trung-yen VI');
  assert.ok(parsedEn, 'parseDatasetV2 accepts ngo-trung-yen EN');

  const pairResult = validateDatasetV2Pair(parsedVi, parsedEn);
  assert.deepEqual(pairResult, { ok: true });

  const revVi = createHash('sha256').update(canonicalDatasetJson(tyVi), 'utf8').digest('hex');
  const revEn = createHash('sha256').update(canonicalDatasetJson(tyEn), 'utf8').digest('hex');
  assert.equal(collections.getCollectionRevision('ngo-trung-yen', 'vi'), revVi, 'COLLECTION_REVISIONS matches SHA-256 for VI');
  assert.equal(collections.getCollectionRevision('ngo-trung-yen', 'en'), revEn, 'COLLECTION_REVISIONS matches SHA-256 for EN');
});

test('(a) Photo mapping - all 10 nodes have defined photos and honest photographer credit', () => {
  const gachNodes = collections.getBundledDataset('ngo-gach', 'vi').nodes;
  const tyNodes = collections.getBundledDataset('ngo-trung-yen', 'vi').nodes;

  for (const node of [...gachNodes, ...tyNodes]) {
    const photo = photoMap.getNodePhoto(node.id);
    assert.ok(photo, `Node ${node.id} must resolve to a valid photo asset`);

    const photographerVi = photoMap.getNodePhotographer(node.id, undefined, undefined, 'vi');
    assert.ok(photographerVi && photographerVi.length > 0, `Node ${node.id} photographer credit must not be empty`);
  }

  // Exact draft photo credit for Google Maps contributor photos
  assert.equal(photoMap.NODE_PHOTO_MAP['ngo-gach-dinh-thanh-ha'].photographer, 'Google Maps contributor (name not recorded · demo)');
  assert.equal(photoMap.NODE_PHOTO_MAP['ngo-gach-chua-cau-dong'].photographer, 'Google Maps contributor (name not recorded · demo)');
  assert.equal(photoMap.NODE_PHOTO_MAP['trung-yen-pho-suong'].photographer, 'Google Maps contributor (name not recorded · demo)');
  assert.equal(photoMap.NODE_PHOTO_MAP['trung-yen-bun-ca-sam-cay-si'].photographer, 'Google Maps contributor (name not recorded · demo)');

  // Points without demo photos use fallback with minh hoạ label
  assert.ok(photoMap.NODE_PHOTO_MAP['ngo-gach-ca-phe-no1'].photographer.includes('minh họa'));
  assert.ok(photoMap.NODE_PHOTO_MAP['trung-yen-pho-vui'].photographer.includes('minh họa'));
});

// ---------------------------------------------------------------------------
// SUITE (a.2): Schema boundary validation & malformed V2 regressions
// ---------------------------------------------------------------------------

test('(a.2) Schema boundary validation - rejects malformed polyline, length, order, alongAlleyMeters, pendingCheck', () => {
  const valid = collections.getBundledDataset('ngo-gach', 'vi');

  // 1. Malformed polyline
  assert.equal(parseDatasetV2({ ...valid, polyline: 'not-an-array' }), undefined, 'Rejects string polyline');
  assert.equal(parseDatasetV2({ ...valid, polyline: [[21.0, 105.0]] }), undefined, 'Rejects polyline with < 2 points');
  assert.equal(parseDatasetV2({ ...valid, polyline: [[999, 105.0], [21.0, 105.0]] }), undefined, 'Rejects polyline with out-of-bounds latitude');
  assert.equal(parseDatasetV2({ ...valid, polyline: [['bad', 105.0], [21.0, 105.0]] }), undefined, 'Rejects non-numeric coordinate');

  // 2. Malformed lengthMeters
  assert.equal(parseDatasetV2({ ...valid, lengthMeters: 0 }), undefined, 'Rejects 0 lengthMeters');
  assert.equal(parseDatasetV2({ ...valid, lengthMeters: -50 }), undefined, 'Rejects negative lengthMeters');
  assert.equal(parseDatasetV2({ ...valid, lengthMeters: NaN }), undefined, 'Rejects NaN lengthMeters');
  assert.equal(parseDatasetV2({ ...valid, lengthMeters: '128' }), undefined, 'Rejects string lengthMeters');

  // 3. Malformed node order
  const badOrderNodes = valid.nodes.map((n, i) => i === 0 ? { ...n, order: 0 } : n);
  assert.equal(parseDatasetV2({ ...valid, nodes: badOrderNodes }), undefined, 'Rejects order < 1');

  const floatOrderNodes = valid.nodes.map((n, i) => i === 0 ? { ...n, order: 1.5 } : n);
  assert.equal(parseDatasetV2({ ...valid, nodes: floatOrderNodes }), undefined, 'Rejects float order');

  // 4. Malformed alongAlleyMeters
  const negDistanceNodes = valid.nodes.map((n, i) => i === 0 ? { ...n, alongAlleyMeters: -10 } : n);
  assert.equal(parseDatasetV2({ ...valid, nodes: negDistanceNodes }), undefined, 'Rejects negative alongAlleyMeters');

  // 5. Malformed pendingCheck
  const longPendingNodes = valid.nodes.map((n, i) => i === 0 ? { ...n, pendingCheck: 'x'.repeat(600) } : n);
  assert.equal(parseDatasetV2({ ...valid, nodes: longPendingNodes }), undefined, 'Rejects pendingCheck > 500 chars');

  // 6. Schema 1 and reviewed V2 do NOT accept story: null accidentally
  const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
  const schema1NullStory = {
    ...fixture,
    nodes: fixture.nodes.map((n, i) => i === 0 ? { ...n, story: null } : n),
  };
  assert.equal(parseDataset(schema1NullStory), undefined, 'Schema 1 rejects story: null');

  const reviewedNullStory = {
    ...valid,
    kind: 'reviewed',
    reviewStatus: 'approved',
    updatedAt: '2026-10-22T00:00:00Z',
    nodes: valid.nodes.map((n, i) => i === 0 ? { ...n, story: null, reviewStatus: 'approved', updatedAt: '2026-10-22T00:00:00Z' } : { ...n, reviewStatus: 'approved', updatedAt: '2026-10-22T00:00:00Z' }),
  };
  assert.equal(parseDatasetV2(reviewedNullStory), undefined, 'Reviewed V2 dataset rejects story: null');
});

// ---------------------------------------------------------------------------
// SUITE (b): Home với dataset có polyline dựng đường và pin theo đúng thứ tự order
// ---------------------------------------------------------------------------

test('(b) Alley polyline geometry - Ngõ Gạch computes vertical progression and monotonically increasing Y positions', () => {
  const dataset = collections.getBundledDataset('ngo-gach', 'vi');
  const layout = computeAlleyLayout(dataset.polyline, dataset.nodes, 390, 560, dataset.lengthMeters);

  assert.equal(layout.pins.length, 5);
  assert.ok(layout.canvasPolyline.length >= dataset.polyline.length);

  // Pins must be ordered by order 1..5
  const orders = layout.pins.map((p) => p.order);
  assert.deepEqual(orders, [1, 2, 3, 4, 5]);

  // Y coordinates must increase monotonically down the screen
  for (let i = 0; i < layout.pins.length - 1; i++) {
    const currentPin = layout.pins[i];
    const nextPin = layout.pins[i + 1];
    assert.ok(
      nextPin.y > currentPin.y,
      `Pin ${nextPin.id} (y=${nextPin.y}) must be below pin ${currentPin.id} (y=${currentPin.y})`,
    );
    assert.ok(
      nextPin.alongAlleyMeters > currentPin.alongAlleyMeters,
      `Pin ${nextPin.id} meters (${nextPin.alongAlleyMeters}) must exceed ${currentPin.alongAlleyMeters}`,
    );
  }

  // Spline points include lead-in at y=0 and lead-out at y=560
  assert.equal(layout.splinePoints[0].y, 0);
  assert.equal(layout.splinePoints[layout.splinePoints.length - 1].y, 560);

  const pathStr = buildSmoothPath(layout.splinePoints);
  assert.ok(pathStr.startsWith('M '), 'Smooth SVG path generated');
  assert.ok(pathStr.includes('C '), 'Smooth Bezier curves present in path');
});

test('(b) Alley polyline geometry - Ngõ Trung Yên correctly interpolates unanchored points between known coordinates', () => {
  const dataset = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const layout = computeAlleyLayout(dataset.polyline, dataset.nodes, 390, 560, dataset.lengthMeters);

  assert.equal(layout.pins.length, 5);

  const pin1 = layout.pins.find((p) => p.id === 'trung-yen-pho-suong'); // 17m
  const pin2 = layout.pins.find((p) => p.id === 'trung-yen-dinh-trung-yen'); // null in draft -> interpolated
  const pin3 = layout.pins.find((p) => p.id === 'trung-yen-bun-ca-sam-cay-si'); // 80m
  const pin4 = layout.pins.find((p) => p.id === 'trung-yen-bun-ngan-nhan'); // null in draft -> interpolated
  const pin5 = layout.pins.find((p) => p.id === 'trung-yen-pho-ga-huong-tra'); // null in draft -> interpolated

  assert.ok(pin1 && pin2 && pin3 && pin4 && pin5);

  // Pin 2 (Đình Trung Yên) must be interpolated between Pin 1 and Pin 3
  assert.ok(
    pin2.alongAlleyMeters > pin1.alongAlleyMeters && pin2.alongAlleyMeters < pin3.alongAlleyMeters,
    `Unanchored Pin 2 meters (${pin2.alongAlleyMeters}) must lie between Pin 1 (${pin1.alongAlleyMeters}) and Pin 3 (${pin3.alongAlleyMeters})`,
  );
  assert.ok(
    pin2.y > pin1.y && pin2.y < pin3.y,
    `Unanchored Pin 2 y (${pin2.y}) must lie between Pin 1 (${pin1.y}) and Pin 3 (${pin3.y})`,
  );

  // Pin 4 (Bún ngan Nhàn) must be interpolated after Pin 3
  assert.ok(
    pin4.alongAlleyMeters > pin3.alongAlleyMeters,
    `Unanchored Pin 4 meters (${pin4.alongAlleyMeters}) must lie after Pin 3 (${pin3.alongAlleyMeters})`,
  );
  assert.ok(
    pin4.y > pin3.y,
    `Unanchored Pin 4 y (${pin4.y}) must lie below Pin 3 (${pin3.y})`,
  );

  // Pin 5 (Phở gà Hương Trà) must be interpolated after Pin 4
  assert.ok(
    pin5.alongAlleyMeters > pin4.alongAlleyMeters,
    `Unanchored Pin 5 meters (${pin5.alongAlleyMeters}) must lie after Pin 4 (${pin4.alongAlleyMeters})`,
  );
  assert.ok(
    pin5.y > pin4.y,
    `Unanchored Pin 5 y (${pin5.y}) must lie below Pin 4 (${pin4.y})`,
  );
});

test('(b) Mounted Home wiring - Ngõ Gạch renders SVG Path matching geometry and pins at computed positions with monotonic order', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  const view = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-ca-phe-no1',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  });

  const tree = view.render();

  // 1. Verify SVG Path wiring
  const paths = findElements(tree, 'Path');
  assert.ok(paths.length >= 3, 'SVG renders multiple ribbon and guide paths');
  const expectedLayout = computeAlleyLayout(gachDataset.polyline, gachDataset.nodes, 390, 560, gachDataset.lengthMeters);
  const expectedD = buildSmoothPath(expectedLayout.splinePoints);
  assert.equal(paths[0].props.d, expectedD, 'Rendered SVG main Path.d matches buildSmoothPath of computed alley splinePoints');

  // 2. Verify rendered pin wiring, positions and order
  const pinButtons = findElements(tree, 'Pressable').filter((p) => p.props.accessibilityState?.selected !== undefined);
  assert.equal(pinButtons.length, 5, 'Renders exactly 5 pins for Ngõ Gạch');

  for (let i = 0; i < expectedLayout.pins.length; i++) {
    const expectedPin = expectedLayout.pins[i];
    const button = pinButtons[i];
    const rawStyle = typeof button.props.style === 'function' ? button.props.style({ pressed: false }) : button.props.style;
    const computedStyle = [].concat(rawStyle).reduce((acc, s) => ({ ...acc, ...s }), {});

    const isSelected = expectedPin.id === 'ngo-gach-ca-phe-no1';
    const offset = isSelected ? 22 : 19;
    assert.equal(Math.round(computedStyle.left), Math.round(expectedPin.x - offset), `Pin ${expectedPin.id} left position matches computed geometry`);
    assert.equal(Math.round(computedStyle.top), Math.round(expectedPin.y - offset), `Pin ${expectedPin.id} top position matches computed geometry`);
  }

  // 3. Verify monotonic top progression in rendered pins
  for (let i = 0; i < pinButtons.length - 1; i++) {
    const raw1 = typeof pinButtons[i].props.style === 'function' ? pinButtons[i].props.style({ pressed: false }) : pinButtons[i].props.style;
    const style1 = [].concat(raw1).reduce((acc, s) => ({ ...acc, ...s }), {});
    const raw2 = typeof pinButtons[i + 1].props.style === 'function' ? pinButtons[i + 1].props.style({ pressed: false }) : pinButtons[i + 1].props.style;
    const style2 = [].concat(raw2).reduce((acc, s) => ({ ...acc, ...s }), {});
    assert.ok(style2.top > style1.top, `Mounted pin ${i + 1} top must be below mounted pin ${i}`);
  }

  // 4. Honest accessibility labels on mounted pins
  assert.equal(pinButtons[0].props.accessibilityLabel, 'Cà Phê No.1', 'story:null pin uses honest node name label');
  assert.equal(pinButtons[2].props.accessibilityLabel, 'Xem Đình Thanh Hà', 'Node with available story uses open_story label');
});

test('(b) Mounted Home wiring - Ngõ Trung Yên renders SVG Path and pins matching geometry', () => {
  const tyDataset = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const tySource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Trung Yên',
    detail: 'Demo dataset',
    dataset: tyDataset,
  };

  const view = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: tySource,
    currentNodeId: 'trung-yen-pho-suong',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-trung-yen' } },
  });

  const tree = view.render();

  const paths = findElements(tree, 'Path');
  const expectedLayout = computeAlleyLayout(tyDataset.polyline, tyDataset.nodes, 390, 560, tyDataset.lengthMeters);
  const expectedD = buildSmoothPath(expectedLayout.splinePoints);
  assert.equal(paths[0].props.d, expectedD, 'Rendered SVG main Path.d matches buildSmoothPath of Ngõ Trung Yên splinePoints');

  const pinButtons = findElements(tree, 'Pressable').filter((p) => p.props.accessibilityState?.selected !== undefined);
  assert.equal(pinButtons.length, 5, 'Renders exactly 5 pins for Ngõ Trung Yên');
  assert.equal(pinButtons[0].props.accessibilityLabel, 'Xem Phở Sướng', 'pin with story uses open_story label');
  assert.equal(pinButtons[1].props.accessibilityLabel, 'Đình Trung Yên', 'story:null pin uses honest node name label');
});

test('(b) Dataset cũ không đổi hành vi - fiction-letter preserves exact fixed PIN_CONFIG pins without polyline', () => {
  const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
  const fictionSource = getSourceState('demo', fixture);
  const view = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: fictionSource,
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
  });

  const tree = view.render();
  const pins = findElements(tree, 'Pressable').filter((p) => p.props.accessibilityState?.selected !== undefined);

  // 6 pins rendered from PIN_CONFIG
  assert.equal(pins.length, 6, 'Legacy dataset without polyline renders exactly 6 PIN_CONFIG pins');
});

// ---------------------------------------------------------------------------
// SUITE (c): Nhãn trung thực - Điểm không có story không có nút kể giả
// ---------------------------------------------------------------------------

test('(c) Honest labels - stop with story:null shows summary only, honest pin label, and has NO read story button', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  // Node 1: Cà Phê No.1 has story: null
  const viewNullStory = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-ca-phe-no1',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  });

  const treeNullStory = viewNullStory.render();
  const previewNull = findElements(treeNullStory, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  assert.ok(previewNull, 'Preview card is rendered');

  const previewTexts = findElements(previewNull, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(previewTexts.some((text) => text.includes('Cà Phê No.1')), 'Preview card displays stop name');
  assert.ok(previewTexts.some((text) => text.includes('Quán cà phê ở số 1')), 'Preview displays summary text');

  // Verify that the "Đọc lời kể" button is NOT rendered for story: null
  const readStoryBtnNull = findElements(previewNull, 'Pressable').find((p) => p.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn');
  assert.equal(readStoryBtnNull, undefined, 'Stop with story:null must NOT render a fake "Đọc lời kể" button');

  // Verify honest pin label
  const pin1 = findElements(treeNullStory, 'Pressable').find((p) => p.props.accessibilityLabel === 'Cà Phê No.1');
  assert.ok(pin1, 'Pin renders honest node name without promising open_story');
});

test('(c) Honest labels - stop with available draft story DOES render read story button and open_story pin label', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  // Node 3: Đình Thanh Hà has available draft story
  const viewWithStory = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-dinh-thanh-ha',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  });

  const treeWithStory = viewWithStory.render();
  const preview = findElements(treeWithStory, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  assert.ok(preview, 'Preview card rendered for Đình Thanh Hà');

  const readStoryBtn = findElements(preview, 'Pressable').find((p) => p.props.accessibilityLabel === 'Đọc lời kể điểm đang chọn');
  assert.ok(readStoryBtn, 'Stop with valid story DOES render "Đọc lời kể" CTA button');

  const pin3 = findElements(treeWithStory, 'Pressable').find((p) => p.props.accessibilityLabel === 'Xem Đình Thanh Hà');
  assert.ok(pin3, 'Pin with available story renders open_story label');
});

test('(c) Honest labels - stop with pendingCheck renders warning and does not assert facts', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  // Node 3: Đình Thanh Hà has pendingCheck ("Tu bổ khởi công 1/3/2024...")
  const view = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-dinh-thanh-ha',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  });

  const tree = view.render();
  const preview = findElements(tree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  const texts = findElements(preview, 'Text').map((t) => [].concat(t.props.children).join(''));

  assert.ok(
    texts.some((text) => text.includes('Tu bổ khởi công') && text.includes('⚠️')),
    'Pending check is prominently displayed with warning symbol',
  );
});

test('(c) Accessibility - summary & pendingCheck remain visible at fontScale > 1.3 for polyline dataset while legacy omits summary and credit', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  // 1. New polyline dataset at fontScale > 1.3 keeps summary and pendingCheck visible
  const largeView = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-dinh-thanh-ha',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2.0 },
  });

  const tree = largeView.render();
  const preview = findElements(tree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  assert.ok(preview, 'Large preview rendered');

  // accessibilityHint contains photo credit
  assert.ok(
    preview.props.accessibilityHint && preview.props.accessibilityHint.includes('Google Maps contributor'),
    'Photo credit is accessible via accessibilityHint at large font scale',
  );

  const texts = findElements(preview, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(texts.some((text) => text.includes('Đình Thanh Hà')), 'Title is rendered at large font');
  assert.ok(texts.some((text) => text.includes('⚠️ Tu bổ khởi công')), 'PendingCheck warning remains rendered at large font');
  assert.ok(texts.some((text) => text.includes('Đình thờ Trần Lựu')), 'Summary remains rendered for new alley dataset');

  // 2. Legacy dataset at fontScale > 1.3 omits summary to preserve body room
  const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
  const legacyLargeView = mount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: getSourceState('demo', fixture),
    currentNodeId: 'demo-01',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: {} },
  }, {
    __windowDimensions: { width: 400, height: 850, fontScale: 2.0 },
  });

  const legacyTree = legacyLargeView.render();
  const legacyPreview = findElements(legacyTree, 'Animated.View').find((item) => item.props.testID === 'home-selected-node-preview');
  const legacyTexts = findElements(legacyPreview, 'Text').map((t) => [].concat(t.props.children).join(''));
  assert.ok(legacyTexts.some((text) => text.includes('Cổng ngõ')), 'Title remains visible in legacy large font');
  assert.equal(
    legacyTexts.some((text) => text.includes('Con ngõ hẹp lát gạch nghiêng')),
    false,
    'Legacy dataset omits summary at fontScale > 1.3 to preserve body room',
  );
  assert.equal(
    legacyTexts.some((text) => text.includes('Ảnh minh họa')),
    false,
    'Legacy dataset omits photo credit text at fontScale > 1.3',
  );
});
