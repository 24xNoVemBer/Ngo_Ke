import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import { setTimeout, clearTimeout } from 'node:timers';
import { setImmediate } from 'node:timers/promises';
import ts from 'typescript';
import { StackRouter, CommonActions, StackActions } from '@react-navigation/routers';
import * as sources from '../src/data/sourceState.ts';
import * as qa from '../src/qa/match.ts';
import * as confirmation from '../src/qr/confirmPoint.ts';
import * as recommendation from '../src/recommendation/pick.ts';
import * as voiceIntent from '../src/voice/intent.ts';

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

// Execute screen handlers and state transitions without a native renderer.
// Native layout, permissions and hardware are checked separately on devices.
function mount(file, props = {}, overrides = {}, exportName) {
  const slots = [];
  let cursor = 0;
  let dirty = true;
  let pending = [];
  let tree;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const element = (type, properties) => ({ type, props: properties });
  const react = {
    createContext: (value) => ({ value, Provider: 'MotionProvider' }),
    useContext: (context) => context.value,
    useRef(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: { current: initial } };
      return slots[i].value;
    },
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (next) => {
        const value = typeof next === 'function' ? next(slots[i].value) : next;
        if (!Object.is(value, slots[i].value)) { slots[i].value = value; dirty = true; }
      }];
    },
    useEffect(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) {
        pending.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: callback() }; });
      }
    },
    useCallback(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, callback };
      return slots[i].callback;
    },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx: element, jsxs: element },
    'react-native': new Proxy({
      StyleSheet: { create: (styles) => styles, absoluteFill: {} },
      Platform: { OS: 'android' },
      Keyboard: { dismiss() {} },
      useWindowDimensions: () => ({ width: 400, height: 850 }),
      Animated: {
        View: 'Animated.View',
        Image: 'Animated.Image',
        Value: class {
          constructor(val) {
            this.val = val;
          }
          interpolate() {
            return this;
          }
          setValue(value) { this.val = value; }
          stopAnimation() { this.animation?.stop(); }
        },
        timing(value, config) {
          return { start: (cb) => { value.setValue(config.toValue); cb?.({ finished: true }); }, stop() {} };
        },
        spring(value, config) {
          return { start: (cb) => { value.setValue(config.toValue); cb?.({ finished: true }); }, stop() {} };
        },
        loop() {
          return { start: () => {}, stop: () => {} };
        },
        sequence() {
          return { start: (cb) => cb?.({ finished: true }), stop() {} };
        },
      },
    }, { get: (object, key) => object[key] ?? key }),
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeAreaProvider', useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
    '@react-navigation/native': { DefaultTheme: { colors: {} }, NavigationContainer: 'NavigationContainer', useIsFocused: () => true },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }) },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-svg': { default: 'Svg', Path: 'Path', __esModule: true },
    './app.json': { expo: { extra: {} } },
    '../data/demo.json': fixture,
    '../data/sourceState': sources,
    '../recommendation/pick': recommendation,
    '../voice/intent': voiceIntent,
    './src/voice/config': { readVoiceApiBaseUrl: () => '' },
    './src/voice/catalog': { voiceCatalogueRevision: 'fixture-revision', voiceTracks: {} },
    '../voice/catalog': { voiceCatalogueRevision: 'fixture-revision', voiceTracks: {} },
    '../voice/useVoiceSession': { useVoiceSession: () => ({
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }) },
    './src/data/sourceState': sources,
    '../qa/match': qa,
    '../qr/confirmPoint': confirmation,
    './src/data/live': { readLiveConfig: () => undefined, loadLiveSource: async () => sources.liveEmpty('no-config') },
    './src/navigation': { areas: {} },
    '../assets/photoMap': { HERO_PHOTO: 1, getNodePhoto: () => 1, getNodePhotographer: () => 'Demo', getAlleyMeta: () => ({ name: 'Ngõ demo', coverPhoto: 1, photographer: 'Demo' }) },
    '../theme': { colors: {}, radius: {}, spacing: {}, typography: {} },
    './src/theme': { colors: {} },
    './src/hooks/MotionPreferences': { MotionProvider: 'MotionProvider', useMotionPreferences: () => ({ reducedMotion: false, foreground: true }) },
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground: true }) },
    './MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true }) },
    '../theme/motion': { motionDurations: { fast: 220, ambientPulse: 2400 }, motionEasings: {}, motionScales: {}, motionSprings: { tactilePress: {} } },
    './AppIcon': { AppIcon: 'AppIcon' },
    '../hooks/useMotion': {
      usePulseLoop: () => ({ scaleAnim: 1, opacityAnim: 1 }),
      usePressSpring: () => ({ scaleAnim: 1, handlePressIn() {}, handlePressOut() {} }),
      useEntranceFadeSlide: () => ({ opacity: 1, translateY: 0 }),
      useWaveformLoop: () => [1, 1, 1, 1, 1, 1, 1],
      useLaserScanner: () => ({ scanProgress: 0, translateYPct: { interpolate: () => 0 }, beamOpacity: 1 }),
    },
    ...overrides,
  };
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext('(function(require,module,exports){' + code + '\n})', { process: { env: {} }, setTimeout, clearTimeout, ...overrides.__globals })((id) => {
    if (modules[id]) return modules[id];
    if (/\/screens\//.test(id) || /\/components\//.test(id) || id === './UnavailableScreen') {
      const name = id.split('/').at(-1);
      return { [name]: name };
    }
    throw new Error(`Unexpected import: ${id}`);
  }, module, module.exports);
  const component = exportName ? module.exports[exportName] : module.exports.default ?? Object.values(module.exports)[0];
  return {
    render(nextProps = props) {
      props = nextProps;
      dirty = true;
      let passes = 0;
      while (dirty) {
        assert.ok(passes++ < 20, 'state/effect loop');
        dirty = false; cursor = 0; pending = [];
        tree = component(props);
        pending.forEach((effect) => effect());
      }
      return tree;
    },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function elements(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => elements(child, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}
function screen(tree, name, navigation = { goBack() {}, navigate() {}, replace() {}, popTo() {} }, params) {
  return elements(tree, 'Screen').find((item) => item.props.name === name).props.children({ navigation, route: { params } }).props;
}

test('status bar follows navigation and unavailable pages without iOS native-stack overrides', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  const style = () => elements(tree, 'StatusBar')[0].props.barStyle;
  const navigate = (name) => {
    elements(tree, 'NavigationContainer')[0].props.onStateChange({ index: 0, routes: [{ name }] });
    tree = app.render();
  };
  assert.equal(style(), 'light-content');
  assert.equal(elements(tree, 'Navigator')[0].props.screenOptions.statusBarStyle, undefined);
  for (const item of elements(tree, 'Screen')) {
    if (typeof item.props.options === 'object') assert.equal(item.props.options.statusBarStyle, undefined);
  }
  navigate('Plan');
  assert.equal(style(), 'dark-content');
  navigate('Home');
  assert.equal(style(), 'light-content');
  screen(tree, 'Home').onModeChange('live');
  tree = app.render();
  assert.equal(style(), 'dark-content');
  navigate('Qa');
  assert.equal(style(), 'dark-content');
  screen(tree, 'Home').onModeChange('demo');
  tree = app.render();
  assert.equal(style(), 'light-content');
  navigate('Location');
  assert.equal(style(), 'dark-content');
  navigate('Landing');
  assert.equal(style(), 'light-content');
});

test('viewing, confirming, reading and planning share state without confirming a preview', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  screen(tree, 'Home').onSelectNode('demo-02');
  tree = app.render();
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-02');
  assert.equal(screen(tree, 'Location').currentNodeId, undefined);
  screen(tree, 'Camera').onConfirmNode('demo-03');
  tree = app.render();
  assert.equal(screen(tree, 'Home').currentNodeId, 'demo-03');
  assert.equal(screen(tree, 'Location').currentNodeId, 'demo-03');
  screen(tree, 'Plan').onSelectNode('demo-05');
  tree = app.render();
  assert.equal(screen(tree, 'Qa').currentNodeId, 'demo-05');
  assert.equal(screen(tree, 'Location').currentNodeId, 'demo-03');
  screen(tree, 'Qa').onReadNode('demo-05');
  screen(tree, 'Qa').onReadNode('demo-05');
  tree = app.render();
  assert.equal(screen(tree, 'Home').readNodeIds.size, 1);
  screen(tree, 'Home').onSelectNode('unknown');
  assert.equal(screen(app.render(), 'Home').currentNodeId, 'demo-05');
});

test('Live retry makes a new request and late results cannot replace Demo', async () => {
  const requests = [];
  const app = mount('../App.tsx', {}, {
    './src/data/live': { readLiveConfig: () => undefined, loadLiveSource: () => new Promise((resolve) => requests.push(resolve)) },
  });
  let tree = app.render();
  screen(tree, 'Home').onModeChange('live');
  tree = app.render();
  assert.equal(requests.length, 1);
  screen(tree, 'Home').onRetryLive();
  app.render();
  assert.equal(requests.length, 1, 'busy retry is blocked');
  requests[0](sources.liveError('network'));
  await Promise.resolve();
  tree = app.render();
  assert.equal(screen(tree, 'Home').source.status, 'error');
  screen(tree, 'Home').onRetryLive();
  tree = app.render();
  assert.equal(requests.length, 2);
  screen(tree, 'Home').onModeChange('demo');
  app.render();
  requests[1](sources.liveEmpty('no-data'));
  await Promise.resolve();
  tree = app.render();
  assert.equal(screen(tree, 'Home').source.mode, 'demo');
  assert.equal(screen(tree, 'Home').source.status, 'ready');
});

test('Q&A uses only the selected point, clears the previous answer and offers real actions', () => {
  let selected = 'demo-01';
  const read = new Set();
  let answerPlays = 0;
  const voiceSession = {
    stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
    playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
    startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
    playTrack() { answerPlays++; }, replayTrack() {},
  };
  const props = () => ({ dataset: fixture, currentNodeId: selected, onSelectNode: (id) => { selected = id; }, onReadNode: (id) => read.add(id), readNodeIds: read, onOpenNotebook() {} });
  const view = mount('../src/screens/QaScreen.tsx', props(), { '../voice/useVoiceSession': { useVoiceSession: () => voiceSession } });
  let tree = view.render();
  assert.ok(elements(tree, 'Pressable').some((item) => item.props.accessibilityLabel === 'Xem lời kể bằng chữ'));
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Đây là điểm nào?');
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'answer stays hidden until the reader is opened');
  assert.equal(answerPlays, 0, 'text suggestions do not start audio');
  const showText = () => elements(tree, 'Pressable').find((item) => elements(item, 'Text').some((text) => text.props.children === 'Xem lời kể bằng chữ'));
  showText().props.onPress();
  tree = view.render(props());
  assert.ok(JSON.stringify(tree).includes(fixture.qa[0].answer));
  const labels = elements(tree, 'Pressable').map((item) => item.props.accessibilityLabel);
  assert.ok(labels.includes('Thu gọn lời kể'));
  assert.ok(labels.includes('Thu gọn câu trả lời'));
  assert.ok(labels.includes('Đặt câu hỏi khác'));
  assert.ok(labels.includes(`Hỏi tiếp: ${fixture.qa.find((item) => item.id === 'qa-02').question}`));
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Điểm tiếp theo').props.onPress();
  tree = view.render(props());
  assert.equal(selected, 'demo-02');
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false);
  const nodeQuestions = fixture.qa.filter((item) => item.nodeId === 'demo-02').map((item) => item.question);
  assert.deepEqual(Array.from(elements(tree, 'ExpandableInputDrawer')[0].props.suggestedQuestions), nodeQuestions);
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion(nodeQuestions[0]);
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa.find((item) => item.nodeId === 'demo-02').answer), false);
  const dock = elements(tree, 'VoiceInteractionDock')[0].props;
  assert.equal(typeof dock.onStartRecording, 'function');
  assert.equal(typeof dock.onSubmitRecording, 'function');
  assert.equal(typeof dock.onCancel, 'function');
  assert.equal(typeof dock.onOpenInput, 'function');
  assert.equal(typeof dock.onQuickAction, 'function');
  assert.equal(answerPlays, 0, 'question chips do not start audio');
  assert.equal(read.size, 2);

  selected = 'demo-01';
  tree = view.render(props());
  elements(tree, 'ExpandableInputDrawer')[0].props.onSelectSuggestion('Đây là điểm nào?');
  tree = view.render(props());
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'changing back keeps the answer hidden');
  showText().props.onPress();
  tree = view.render(props());
  assert.ok(JSON.stringify(tree).includes(fixture.qa[0].answer));
  tree = view.render({ ...props(), dataset: { ...fixture, qa: [] } });
  assert.equal(JSON.stringify(tree).includes(fixture.qa[0].answer), false, 'dataset refresh clears the old answer');
  assert.deepEqual(Array.from(elements(tree, 'ExpandableInputDrawer')[0].props.suggestedQuestions), []);
  assert.ok(JSON.stringify(tree).includes('Chưa có câu hỏi cho điểm này'), 'missing Q&A still has an explicit fallback');
});

test('voice answers play catalogue audio only in Demo and explain the Live text fallback', () => {
  function run(mode) {
    let transcript;
    const played = [];
    const props = { dataset: fixture, mode, datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {} };
    const view = mount('../src/screens/QaScreen.tsx', props, {
      '../voice/useVoiceSession': { useVoiceSession: (options) => {
        transcript = options.onTranscript;
        return {
          stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
          playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
          startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {},
          playTrack(...args) { played.push(args); }, replayTrack() {},
        };
      } },
    });
    view.render();
    const context = { turnId: 'turn-1', scope: `${mode}:rev-1:demo-01`, nodeId: 'demo-01', mode, datasetRevision: 'rev-1' };
    transcript(fixture.qa[0].question, context);
    return { view, tree: view.render(), transcript, context, played };
  }

  const demo = run('demo');
  assert.equal(demo.played.length, 1);
  assert.equal(demo.played[0][0], `${fixture.qa[0].id}-answer`);

  const live = run('live');
  assert.equal(live.played.length, 0);
  assert.ok(JSON.stringify(live.tree).includes('Bản đọc chưa có trong chế độ Live'));
  assert.equal(JSON.stringify(live.tree).includes(fixture.qa[0].answer), false, 'the Live answer remains collapsed until opened');
  live.transcript('Nghe lại', live.context);
  const replayTree = live.view.render();
  assert.equal(live.played.length, 0, 'replay never falls back to Demo audio in Live');
  assert.ok(JSON.stringify(replayTree).includes('Chế độ Live chưa có bản đọc'));
  demo.view.unmount();
  live.view.unmount();
});

test('voice action cards wait for an explicit tap before opening QR or GPS', () => {
  let transcript;
  const opened = [];
  const properties = { dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode() {}, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {}, onOpenCamera: () => opened.push('qr'), onOpenLocation: () => opened.push('gps') };
  const view = mount('../src/screens/QaScreen.tsx', properties, {
    '../voice/useVoiceSession': { useVoiceSession: (options) => { transcript = options.onTranscript; return {
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }; } },
  });
  view.render();
  const send = (text) => transcript(text, { turnId: 'turn-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  send('Mở QR');
  let tree = view.render();
  assert.ok(JSON.stringify(tree).includes('Xác định điểm bằng mã QR'));
  assert.deepEqual(opened, [], 'voice reveals the QR card without starting the camera');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở thẻ quét QR').props.onPress();
  assert.deepEqual(opened, ['qr']);
  send('Mở thẻ GPS');
  tree = view.render();
  assert.deepEqual(opened, ['qr'], 'GPS card does not request or navigate until tapped');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở thẻ GPS').props.onPress();
  assert.deepEqual(opened, ['qr', 'gps']);
});

test('voice plan recommendations stay inline and preserve their draft when opening Plan', () => {
  let transcript;
  let draft = {};
  let openedDraft;
  let selected;
  const properties = () => ({ dataset: fixture, mode: 'demo', datasetRevision: 'rev-1', currentNodeId: 'demo-01', onSelectNode: (id) => { selected = id; }, onReadNode() {}, readNodeIds: new Set(), planDraft: draft, onPlanDraftChange: (next) => { draft = next; }, onOpenNotebook: (next) => { openedDraft = next; } });
  const view = mount('../src/screens/QaScreen.tsx', properties(), {
    '../voice/useVoiceSession': { useVoiceSession: (options) => { transcript = options.onTranscript; return {
      stage: 'idle', error: null, recordingDurationMs: 0, metering: -60,
      playback: { playing: false, currentTime: 0, duration: 0 }, activeTrackId: null, playbackError: null,
      startRecording() {}, submitRecording() {}, cancel() {}, stopPlayback() {}, playTrack() {}, replayTrack() {},
    }; } },
  });
  view.render();
  transcript('Chọn trải nghiệm ẩm thực trong 30 phút', { turnId: 'plan-1', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  let tree = view.render(properties());
  assert.deepEqual(draft, { topic: 'an thuc', budgetMinutes: 30 });
  assert.ok(elements(tree, 'Pressable').some((item) => item.props.accessibilityLabel?.startsWith('Mở chương ')), 'picks come from the recommendation core');
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel?.startsWith('Mở chương ')).props.onPress();
  assert.ok(selected, 'opening an inline pick selects a chapter without GPS confirmation');

  transcript('Chọn trải nghiệm chuyện xưa trong mười lăm phút', { turnId: 'plan-2', scope: 'demo:rev-1:demo-01', nodeId: 'demo-01', mode: 'demo', datasetRevision: 'rev-1' });
  tree = view.render(properties());
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Mở bảng chọn trải nghiệm').props.onPress();
  assert.deepEqual(openedDraft, { topic: 'chuyen xua', budgetMinutes: 15 });
});

test('Plan draft is owned by App and survives the notebook route', () => {
  const app = mount('../App.tsx');
  let tree = app.render();
  const firstDraft = { topic: 'an thuc', budgetMinutes: 30 };
  screen(tree, 'Qa').onPlanDraftChange(firstDraft);
  tree = app.render();
  screen(tree, 'Qa').onOpenNotebook();
  tree = app.render();
  assert.deepEqual(screen(tree, 'Plan').draft, firstDraft);
  screen(tree, 'Plan').onDraftChange({ ...firstDraft, budgetMinutes: 45 });
  tree = app.render();
  assert.deepEqual(screen(tree, 'Qa').planDraft, { ...firstDraft, budgetMinutes: 45 });
});

test('Home pins match ids after reordering and empty sources have working escape actions', () => {
  const nodes = [...fixture.nodes].reverse();
  let selected;
  const props = { mode: 'demo', source: { ...sources.getSourceState('demo', fixture), dataset: { ...fixture, nodes } }, currentNodeId: 'demo-03', onSelectNode: (id) => { selected = id; }, readNodeIds: new Set(), onModeChange() {}, navigation: { goBack() {}, navigate() {} }, route: {} };
  const view = mount('../src/screens/HomeScreen.tsx', props);
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === `Xem ${fixture.nodes[1].name}`).props.onPress();
  assert.equal(selected, 'demo-02');
  assert.ok(elements(tree, 'Text').some((item) => [].concat(item.props.children).join('') === 'Đã mở 0/6 câu chuyện · Demo'));
  const renamed = nodes.map((node) => ({ ...node, id: 'live-' + node.id }));
  tree = view.render({ ...props, currentNodeId: 'live-demo-03', source: { ...props.source, dataset: { ...fixture, nodes: renamed } } });
  const pins = elements(tree, 'Pressable').filter((item) => item.props.accessibilityLabel?.startsWith('Xem '));
  assert.equal(pins.length, 6, 'Live ids do not depend on hardcoded demo ids');
  pins.find((item) => item.props.accessibilityLabel === `Xem ${fixture.nodes[1].name}`).props.onPress();
  assert.equal(selected, 'live-demo-02');
  tree = view.render({ ...props, mode: 'live', source: sources.liveEmpty('no-config'), onRetryLive() {} });
  assert.equal(elements(tree, 'Path').length, 0);
  const empty = elements(tree, 'UnavailableScreen')[0].props;
  assert.equal(typeof empty.onBack, 'function');
  assert.equal(typeof empty.onSwitchToDemo, 'function');
  assert.equal(typeof empty.onRetry, 'function');
});

test('leaving Camera closes it and ignores permission results from the old screen', async () => {
  let focused = true;
  let grant;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/CameraScreen.tsx', props, {
    '@react-navigation/native': { useIsFocused: () => focused },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [null, () => new Promise((resolve) => { grant = resolve; })] },
  });
  let tree = view.render();
  const button = () => elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bật camera và quét QR');
  button().props.onPress();
  focused = false;
  tree = view.render();
  grant({ granted: true });
  await setImmediate();
  focused = true;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0, 'a late grant cannot reopen Camera');
  button().props.onPress();
  grant({ granted: true });
  await setImmediate();
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 1);
  focused = false;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0);
});


test('Prologue replaces itself once and never fades the whole screen to zero', () => {
  const calls = [];
  const view = mount('../src/screens/PrologueScreen.tsx', { navigation: { replace: (name) => calls.push(name) } });
  const tree = view.render();
  const start = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bắt đầu dạo ngõ Hà Nội');
  start.props.onPress();
  start.props.onPress();
  assert.deepEqual(calls, ['Landing']);
  assert.equal(elements(tree, 'ImageBackground').length, 1);
});

test('real stack stays bounded across notebook selections and Back returns Home', () => {
  const options = { routeNames: ['Prologue', 'Landing', 'Home', 'Qa', 'Plan'], routeParamList: {}, routeGetIdList: {} };
  const router = StackRouter({ initialRouteName: 'Landing' });
  let state = router.getInitialState(options);
  const dispatch = (action) => { state = router.getStateForAction(state, action, options); assert.ok(state); };
  const navigation = {
    navigate: (name, params) => dispatch(CommonActions.navigate(name, params)),
    replace: (name) => dispatch(StackActions.replace(name)),
    popTo: (name) => dispatch(StackActions.popTo(name)),
  };
  dispatch(CommonActions.navigate('Home'));
  dispatch(CommonActions.navigate('Qa'));
  const app = mount('../App.tsx');
  for (let i = 0; i < 5; i++) {
    let tree = app.render();
    screen(tree, 'Qa', navigation).onOpenNotebook();
    assert.equal(state.routes.at(-1).params.fromQa, true);
    screen(tree, 'Plan', navigation, state.routes.at(-1).params).onSelectNode('demo-05');
    assert.deepEqual(state.routes.map((r) => r.name), ['Landing', 'Home', 'Qa']);
  }
  dispatch(StackActions.pop());
  assert.equal(state.routes.at(-1).name, 'Home');
  dispatch(CommonActions.navigate('Plan'));
  screen(app.render(), 'Plan', navigation).onSelectNode('demo-03');
  assert.deepEqual(state.routes.map((r) => r.name), ['Landing', 'Home', 'Qa']);
});

test('Q&A Previous/Next skip closed neighbours and correctly disable at boundaries', () => {
  const dataset = { ...fixture, nodes: fixture.nodes.map((node, i) => ({ ...node, available: i === 0 || i === 2 })) };
  let selected = 'demo-01';
  const props = () => ({ dataset, currentNodeId: selected, onSelectNode: (id) => { selected = id; }, onReadNode() {}, readNodeIds: new Set(), onOpenNotebook() {} });
  const view = mount('../src/screens/QaScreen.tsx', props());
  const button = (tree, label) => elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === label);
  let tree = view.render();
  assert.equal(button(tree, 'Điểm trước đó').props.disabled, true);
  button(tree, 'Điểm tiếp theo').props.onPress();
  assert.equal(selected, 'demo-03');
  tree = view.render(props());
  assert.equal(button(tree, 'Điểm tiếp theo').props.disabled, true);
  button(tree, 'Điểm trước đó').props.onPress();
  assert.equal(selected, 'demo-01');
});

test('ready Live passes its mode to Q&A/Plan and Home does not label it Demo', async () => {
  const app = mount('../App.tsx', {}, { './src/data/live': { readLiveConfig() {}, loadLiveSource: async () => ({ status: 'ready', mode: 'live', dataset: fixture }) } });
  screen(app.render(), 'Home').onModeChange('live');
  app.render();
  await setImmediate();
  const tree = app.render();
  assert.equal(screen(tree, 'Qa').mode, 'live');
  assert.equal(screen(tree, 'Plan').mode, 'live');
  const home = mount('../src/screens/HomeScreen.tsx', { ...screen(tree, 'Home'), navigation: { goBack() {}, navigate() {} }, route: {} });
  assert.ok(elements(home.render(), 'Text').some((item) => [].concat(item.props.children).join('') === 'Đã mở 0/6 câu chuyện · Live'));
});

test('motion loops stop/reset when hidden and reduced motion keeps entrances visible', () => {
  let active = true;
  let started = 0;
  let stopped = 0;
  class Value {
    constructor(value) { this.val = value; }
    setValue(value) { this.val = value; }
    interpolate() { return this; }
  }
  const view = mount('../src/hooks/useMotion.ts', { active: true }, {
    './MotionPreferences': { useMotionState: () => ({ active }) },
    'react-native': { Animated: { Value, timing: () => ({}), sequence: () => ({}),
      loop: () => ({ start: () => started++, stop: () => stopped++ }) } },
  }, 'usePulseLoop');
  view.render();
  assert.equal(started, 1);
  active = false;
  const result = view.render();
  assert.equal(stopped, 1);
  assert.equal(result.scaleAnim.val, 0);
  view.unmount();
  const entrance = mount('../src/hooks/useMotion.ts', {}, { './MotionPreferences': { useMotionState: () => ({ active: false }) } }, 'useEntranceFadeSlide');
  assert.equal(entrance.render().opacity.val, 1);
});

test('OS motion preference handles late reads and removes both listeners', async () => {
  let resolve;
  let preference;
  let appState;
  let removed = 0;
  const view = mount('../src/hooks/MotionPreferences.tsx', {}, {
    'react-native': {
      AppState: { currentState: 'active', addEventListener: (_, cb) => { appState = cb; return { remove: () => removed++ }; } },
      AccessibilityInfo: { isReduceMotionEnabled: () => new Promise((r) => { resolve = r; }),
        addEventListener: (_, cb) => { preference = cb; return { remove: () => removed++ }; } },
    },
  }, 'useMotionPreferences');
  assert.equal(view.render().reducedMotion, true);
  preference(true);
  resolve(false);
  await setImmediate();
  assert.equal(view.render().reducedMotion, true, 'late initial query cannot overwrite a newer OS change');
  appState('background');
  assert.equal(view.render().foreground, false);
  preference(false);
  appState('active');
  assert.deepEqual(JSON.parse(JSON.stringify(view.render())), { reducedMotion: false, foreground: true });
  view.unmount();
  assert.equal(removed, 2);
});

test('drawer remains mounted for exit and stale interrupted exits cannot hide a reopened drawer', () => {
  const animations = [];
  const frames = [];
  let focused = 0;
  class Value {
    constructor(value) { this.val = value; }
    stopAnimation() {}
    interpolate() { return this; }
  }
  const props = { visible: true, value: '', onChangeText() {}, onSubmit() {}, onClose() {} };
  const view = mount('../src/components/ExpandableInputDrawer.tsx', props, {
    __globals: { requestAnimationFrame: (cb) => frames.push(cb) },
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: true }) },
    'react-native': new Proxy({
      StyleSheet: { create: (s) => s }, Platform: { OS: 'android' }, Keyboard: { dismiss() {} },
      useWindowDimensions: () => ({ height: 850 }),
      Animated: { View: 'Animated.View', Value, timing: () => {
        const item = { start(cb) { this.cb = cb; }, stop() { this.cb?.({ finished: false }); } };
        animations.push(item); return item;
      } },
    }, { get: (o, k) => o[k] ?? k }),
  });
  let opened = view.render();
  assert.equal(elements(opened, 'KeyboardAvoidingView')[0].props.behavior, 'height');
  elements(opened, 'TextInput')[0].props.ref.current = { focus: () => focused++ };
  elements(opened, 'Modal')[0].props.onShow();
  frames.shift()();
  assert.equal(focused, 1, 'focus follows native modal presentation');
  elements(opened, 'Modal')[0].props.onShow();
  let tree = view.render({ ...props, visible: false });
  frames.shift()();
  assert.equal(focused, 1, 'closing cancels a queued keyboard focus');
  const closing = animations.at(-1);
  assert.equal(elements(tree, 'Modal').length, 1, 'exit has time to run');
  view.render(props);
  closing.cb({ finished: true });
  assert.equal(elements(view.render(), 'Modal').length, 1, 'old close cannot unmount the reopened drawer');
  view.render({ ...props, visible: false });
  animations.at(-1).cb({ finished: true });
  assert.equal(elements(view.render(), 'Modal').length, 0);
  view.unmount();
});

test('photo retains previous image until load and ignores stale image callbacks', () => {
  const view = mount('../src/components/CrossfadePhoto.tsx', { source: 1 });
  view.render();
  let tree = view.render({ source: 2 });
  const oldLoad = elements(tree, 'Animated.Image')[0].props.onLoad;
  assert.equal(elements(tree, 'Image')[0].props.source, 1);
  tree = view.render({ source: 3 });
  oldLoad();
  assert.equal(elements(view.render(), 'Image')[0].props.source, 1);
  elements(tree, 'Animated.Image')[0].props.onLoad();
  assert.equal(elements(view.render(), 'Image')[0].props.source, 3);
});


test('GPS permission arriving after Back is ignored before reading coordinates', async () => {
  let focused = true;
  let grant;
  let positionReads = 0;
  const view = mount('../src/screens/LocationScreen.tsx', { nodes: fixture.nodes, onConfirmNode() {} }, {
    '@react-navigation/native': { useIsFocused: () => focused },
    '../location/nearest': { pickCandidate() { throw new Error('must not run'); } },
    'expo-location': { requestForegroundPermissionsAsync: () => new Promise((r) => { grant = r; }),
      getCurrentPositionAsync: () => { positionReads++; }, Accuracy: { Balanced: 1 } },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Lấy vị trí của tôi').props.onPress();
  focused = false;
  view.render();
  grant({ granted: true });
  await setImmediate();
  assert.equal(positionReads, 0);
  view.unmount();
});

test('cancelled GPS result cannot replace a manual confirmation', async () => {
  let position;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/LocationScreen.tsx', props, {
    '../location/nearest': { pickCandidate: () => ({ kind: 'candidate', node: fixture.nodes[0], distanceMeters: 10, accuracy: 10 }) },
    'expo-location': { requestForegroundPermissionsAsync: async () => ({ granted: true }),
      getCurrentPositionAsync: () => new Promise((r) => { position = r; }), Accuracy: { Balanced: 1 } },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Lấy vị trí của tôi').props.onPress();
  await setImmediate();
  tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Dừng chờ GPS').props.onPress();
  tree = view.render();
  const manual = elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel?.includes(fixture.nodes[1].name));
  assert.ok(manual);
  manual.props.onPress();
  position({ coords: { latitude: 0, longitude: 0, accuracy: 10 } });
  await setImmediate();
  tree = view.render();
  assert.deepEqual(confirmed, ['demo-02']);
  assert.equal(elements(tree, 'Text').some((item) => item.props.children === 'GỢI Ý TỪ GPS'), false);
});

test('Camera latches the first QR callback and closes when app backgrounds', async () => {
  let foreground = true;
  const confirmed = [];
  const props = { nodes: fixture.nodes, onConfirmNode: (id) => confirmed.push(id) };
  const view = mount('../src/screens/CameraScreen.tsx', props, {
    '../hooks/MotionPreferences': { useMotionState: () => ({ active: false, reducedMotion: true, foreground }) },
    'expo-camera': { CameraView: 'CameraView', useCameraPermissions: () => [{ granted: true }, async () => ({ granted: true })] },
  });
  let tree = view.render();
  elements(tree, 'Pressable').find((item) => item.props.accessibilityLabel === 'Bật camera và quét QR').props.onPress();
  await setImmediate();
  tree = view.render();
  const scan = elements(tree, 'CameraView')[0].props.onBarcodeScanned;
  scan({ data: 'ngo-ke://node/demo-01' });
  scan({ data: 'ngo-ke://node/demo-02' });
  tree = view.render();
  assert.equal(elements(tree, 'CameraView')[0].props.onBarcodeScanned, undefined);
  elements(tree, 'Pressable').find((item) => JSON.stringify(item.props.children).includes('Xác nhận điểm này')).props.onPress();
  view.render();
  assert.deepEqual(confirmed, ['demo-01']);
  foreground = false;
  tree = view.render();
  assert.equal(elements(tree, 'CameraView').length, 0);
});
