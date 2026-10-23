import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import ts from 'typescript';

import { t } from '../src/i18n/translator.ts';
import { readAlleyStory } from '../src/data/alleyGuide.ts';

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
      return { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'NgoKe', getAlleyMeta: () => ({ name: 'Ngõ Trung Yên', coverPhoto: 1, photographer: 'NgoKe' }) };
    }
    throw new Error('Unexpected import in test loader: ' + id);
  }, mod, mod.exports);
  return mod.exports;
}

const collections = loadTsModule('../src/data/collections.ts');

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
    'react-native-svg': {
      default: 'Svg',
      Path: 'Path',
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
    '../assets/photoMap': {
      HERO_PHOTO: 1,
      getNodePhoto: () => 1,
      getNodePhotographer: () => 'NgoKe',
      getAlleyMeta: () => ({ name: 'Ngõ Trung Yên', coverPhoto: 1, photographer: 'NgoKe' }),
    },
    '../data/collections': collections,
    '../data/alleyGuide': { readAlleyStory, readAlleyGuide: () => null },
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
    '../theme/motion': {
      motionDurations: { instant: 120, fast: 180, normal: 240, relaxed: 320, slow: 380 },
      motionSprings: { tactilePress: { tension: 260, friction: 20, useNativeDriver: true } },
      motionEasings: { standard: () => {} },
    },
    '../utils/alleyGeometry': {
      buildSmoothPath: () => 'M 0 0',
      computeAlleyLayout: () => ({
        pins: [],
        splinePoints: [],
      }),
    },
    './UnavailableScreen': { UnavailableScreen: 'UnavailableScreen' },
    '../components/CrossfadePhoto': { CrossfadePhoto: 'CrossfadePhoto' },
    '../components/AlleyTrailView': { AlleyTrailView: 'AlleyTrailView' },
    '../components/AppIcon': { AppIcon: 'AppIcon' },
    '../components/NotebookDrawerModal': { NotebookDrawerModal: 'NotebookDrawerModal' },
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
    if (id === './AlleyStoryCard' || id === '../components/AlleyStoryCard') {
      const cardCode = ts.transpileModule(readFileSync(new URL('../src/components/AlleyStoryCard.tsx', import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      }).outputText;
      const cardMod = { exports: {} };
      runInNewContext('(function(require,module,exports){\n' + cardCode + '\n})', {
        process: { env: {} },
        setTimeout,
        clearTimeout,
      })((cid) => modules[cid] || { [cid]: cid }, cardMod, cardMod.exports);
      return cardMod.exports;
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

test('AlleyStoryCard renders title and all paragraphs; enforces minimum 44pt touch targets; never displays APA evidence', () => {
  const dataset = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const story = readAlleyStory(dataset);
  assert.ok(story, 'ngo-trung-yen must contain an alleyStory');

  let closed = false;
  const mount = createTestMount('../src/components/AlleyStoryCard.tsx', {
    story,
    onClose: () => { closed = true; },
    visible: true,
  });

  const tree = mount.render();
  const texts = findElements(tree, 'Text').map((t) => [].concat(t.props?.children).join(''));

  // Title displayed
  assert.ok(texts.includes(story.title), `Story title "${story.title}" must be displayed`);

  // All paragraphs displayed
  for (const para of story.paragraphs) {
    assert.ok(texts.includes(para), 'Every story paragraph must be rendered');
  }

  // APA evidence metadata MUST NOT be displayed
  for (const ev of story.evidence) {
    assert.ok(!texts.some((t) => t.includes(ev)), `Evidence citation "${ev}" must NOT be rendered on UI`);
  }

  // Close button touch target >= 44 pt
  const pressables = findElements(tree, 'Pressable');
  const closeBtn = pressables.find((p) => p.props?.testID === 'alley-story-close');
  assert.ok(closeBtn, 'Close button testID alley-story-close must exist');
  const rawStyle = typeof closeBtn.props?.style === 'function' ? closeBtn.props.style({ pressed: false }) : closeBtn.props?.style;
  const computed = [].concat(rawStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.ok(computed.minHeight >= 44 && computed.minWidth >= 44, 'Close button enforces >= 44pt touch area');

  // Backdrop dismiss
  const backdrop = pressables.find((p) => p.props?.testID === 'alley-story-backdrop');
  assert.ok(backdrop, 'Backdrop pressable exists');

  // Trigger close
  closeBtn.props.onPress();
  assert.equal(closed, true, 'Pressing close button fires onClose');
});

test('AlleyStoryCard supports fontScale 2.0 without crash and wraps text in scrollable reader', () => {
  const dataset = collections.getBundledDataset('ngo-tam-thuong', 'vi');
  const story = readAlleyStory(dataset);
  assert.ok(story);

  const mount = createTestMount('../src/components/AlleyStoryCard.tsx', {
    story,
    onClose: () => {},
    visible: true,
  }, { __fontScale: 2.0 });

  const tree = mount.render();
  const scrollViews = findElements(tree, 'ScrollView');
  assert.equal(scrollViews.length, 1, 'Scrollable reader ScrollView must be present');
  assert.equal(scrollViews[0].props.testID, 'alley-story-scroll');

  const texts = findElements(tree, 'Text');
  assert.ok(texts.length >= story.paragraphs.length + 1, 'All text nodes rendered under fontScale 2.0');
});

test('HomeScreen with dataset having alleyStory shows "Câu chuyện ngõ" button (testID: home-alley-story) and opens reader', () => {
  const tyDataset = collections.getBundledDataset('ngo-trung-yen', 'vi');
  const tySource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Trung Yên',
    detail: 'Demo dataset',
    dataset: tyDataset,
  };

  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: tySource,
    currentNodeId: 'trung-yen-pho-suong',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-trung-yen' } },
  });

  const tree = mount.render();

  // Button exists with testID home-alley-story
  const pressables = findElements(tree, 'Pressable');
  const storyBtn = pressables.find((p) => p.props?.testID === 'home-alley-story');
  assert.ok(storyBtn, 'Home must render button with testID home-alley-story for dataset with alleyStory');

  // Touch target >= 44
  const rawStyle = typeof storyBtn.props?.style === 'function' ? storyBtn.props.style({ pressed: false }) : storyBtn.props?.style;
  const computed = [].concat(rawStyle).reduce((acc, s) => ({ ...acc, ...s }), {});
  assert.ok(computed.minHeight >= 44 && computed.minWidth >= 44, 'home-alley-story button enforces >= 44pt touch target');

  // Story modal initially closed
  let storyModal = findElements(tree, 'Modal').find((m) => m.props?.testID === 'alley-story-modal');
  assert.equal(storyModal, undefined, 'Story modal not mounted when closed');

  // Tap button opens story modal
  storyBtn.props.onPress();
  const openedTree = mount.render();
  storyModal = findElements(openedTree, 'Modal').find((m) => m.props?.testID === 'alley-story-modal');
  assert.ok(storyModal, 'Story modal mounted and visible after tapping button');
  assert.equal(storyModal.props?.visible, true);

  // Modal content contains story paragraphs
  const modalTexts = findElements(storyModal, 'Text').map((t) => [].concat(t.props?.children).join(''));
  for (const para of tyDataset.alleyStory.paragraphs) {
    assert.ok(modalTexts.includes(para), `Opened reader renders paragraph: "${para.slice(0, 30)}..."`);
  }

  // Close story modal
  const closeBtn = findElements(storyModal, 'Pressable').find((p) => p.props?.testID === 'alley-story-close');
  assert.ok(closeBtn);
  closeBtn.props.onPress();

  const closedTree = mount.render();
  storyModal = findElements(closedTree, 'Modal').find((m) => m.props?.testID === 'alley-story-modal');
  assert.equal(storyModal, undefined, 'Story modal dismissed after close button tap');
});

test('HomeScreen with legacy dataset without alleyStory does NOT render home-alley-story button', () => {
  const gachDataset = collections.getBundledDataset('ngo-gach', 'vi');
  assert.equal(gachDataset.alleyStory, undefined, 'Ngõ Gạch has no alleyStory');

  const gachSource = {
    mode: 'demo',
    status: 'ready',
    title: 'Ngõ Gạch',
    detail: 'Demo dataset',
    dataset: gachDataset,
  };

  const mount = createTestMount('../src/screens/HomeScreen.tsx', {
    mode: 'demo',
    source: gachSource,
    currentNodeId: 'ngo-gach-ca-phe-no1',
    onSelectNode() {},
    readNodeIds: new Set(),
    onModeChange() {},
    navigation: { navigate() {}, goBack() {} },
    route: { params: { alleyId: 'ngo-gach' } },
  });

  const tree = mount.render();
  const storyBtn = findElements(tree, 'Pressable').find((p) => p.props?.testID === 'home-alley-story');
  assert.equal(storyBtn, undefined, 'Dataset without alleyStory must NOT render home-alley-story button');
});
