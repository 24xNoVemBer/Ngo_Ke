import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { URL } from 'node:url';
import ts from 'typescript';
import * as translator from '../src/i18n/translator.ts';
import * as recommendation from '../src/recommendation/pick.ts';
import * as theme from '../src/theme.ts';

const screenCode = ts.transpileModule(
  readFileSync(new URL('../src/screens/PlanScreen.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } },
).outputText;

function makeNode(overrides = {}) {
  return {
    id: 'stop-1',
    name: 'Test stop',
    summary: 'Existing fixture summary',
    tags: ['an thuc'],
    visitMinutes: 10,
    available: true,
    visited: false,
    story: null,
    caption: '',
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

function mountPlanScreen({ locale = 'vi', nodes, draft, translationCalls = [] }) {
  const state = [];
  let cursor = 0;
  let currentProps = {
    nodes,
    draft,
    onDraftChange: () => {},
    onSelectNode: () => {},
  };

  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], (next) => {
        state[index] = typeof next === 'function' ? next(state[index]) : next;
      }];
    },
  };
  const element = (type, props) => ({ type: typeof type === 'function' ? type.name : type, props });
  const jsxRuntime = { jsx: element, jsxs: element };
  const modules = {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react-native': {
      KeyboardAvoidingView: 'KeyboardAvoidingView',
      Platform: { OS: 'android' },
      Pressable: 'Pressable',
      ScrollView: 'ScrollView',
      StyleSheet: { create: (styles) => styles },
      Text: 'Text',
      TextInput: 'TextInput',
      View: 'View',
    },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '../recommendation/pick': recommendation,
    '../components/AppIcon': { AppIcon: 'AppIcon' },
    '../components/PostcardCard': { PostcardCard: 'PostcardCard' },
    '../theme': theme,
    '../context/LocaleContext': {
      useLocale: () => ({ locale, t: (key, params) => {
        translationCalls.push(key);
        return translator.t(locale, key, params);
      } }),
    },
  };

  const screenModule = { exports: {} };
  runInNewContext(`(function(require,module,exports){${screenCode}\n})`, {})((id) => {
    assert.ok(id in modules, `Unexpected PlanScreen import: ${id}`);
    return modules[id];
  }, screenModule, screenModule.exports);
  const PlanScreen = screenModule.exports.PlanScreen;

  return {
    render(nextProps) {
      if (nextProps) currentProps = { ...currentProps, ...nextProps };
      cursor = 0;
      return PlanScreen(currentProps);
    },
  };
}

function findElement(tree, type, testID) {
  if (!tree) return undefined;
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = findElement(child, type, testID);
      if (found) return found;
    }
    return undefined;
  }
  if (tree.type === type && tree.props?.testID === testID) return tree;
  return findElement(tree.props?.children, type, testID);
}

test('missing-topic state is localized and offers only a user-selected eligible history alternative', () => {
  for (const locale of ['vi', 'en']) {
    let draft = { topic: 'an thuc', budgetMinutes: 30 };
    const nodes = [makeNode({ id: `history-${locale}`, tags: ['chuyen xua'] })];
    const view = mountPlanScreen({ locale, nodes, draft });
    const props = {
      nodes,
      draft,
      onDraftChange: (next) => { draft = next; },
      onSelectNode: () => {},
    };
    let tree = view.render(props);

    const message = findElement(tree, 'Text', 'plan-empty-message');
    assert.equal(message?.props.children, translator.t(locale, 'plan.empty.missing_topic', {
      topic: translator.t(locale, 'plan.topic_food'),
    }));
    const recovery = findElement(tree, 'Pressable', 'plan-empty-history-recovery');
    assert.ok(recovery, `Eligible history recovery is present in ${locale}`);
    assert.deepEqual(draft, { topic: 'an thuc', budgetMinutes: 30 }, 'No topic changes before a tap');

    recovery.props.onPress();
    assert.equal(draft.topic, 'chuyen xua');
    assert.equal(draft.budgetMinutes, 30, 'The explicit action preserves the budget');
    tree = view.render({ ...props, draft });
    assert.equal(findElement(tree, 'Text', 'plan-empty-message'), undefined, 'The current picker now returns its existing recommendation state');
  }
});

test('visited, unavailable, and insufficient-budget cases use distinct evidence-based copy', () => {
  const cases = [
    {
      id: 'visited',
      node: makeNode({ visited: true }),
      budgetMinutes: 30,
      key: 'plan.empty.all_visited',
    },
    {
      id: 'unavailable',
      node: makeNode({ available: false }),
      budgetMinutes: 30,
      key: 'plan.empty.unavailable',
    },
  ];

  for (const locale of ['vi', 'en']) {
    for (const scenario of cases) {
      const view = mountPlanScreen({
        locale,
        nodes: [scenario.node],
        draft: { topic: 'an thuc', budgetMinutes: scenario.budgetMinutes },
      });
      const tree = view.render();
      const message = findElement(tree, 'Text', 'plan-empty-message');
      assert.equal(message?.props.children, translator.t(locale, scenario.key, {
        topic: translator.t(locale, 'plan.topic_food'),
      }));
      assert.equal(findElement(tree, 'Pressable', 'plan-empty-history-recovery'), undefined);
    }
  }

  let draft = { topic: 'an thuc', budgetMinutes: 15 };
  const nodes = [makeNode({ id: 'long-food-stop', visitMinutes: 25 })];
  const view = mountPlanScreen({ nodes, draft });
  const props = { nodes, draft, onDraftChange: (next) => { draft = next; }, onSelectNode: () => {} };
  const tree = view.render(props);
  const message = findElement(tree, 'Text', 'plan-empty-message');
  assert.equal(message?.props.children, translator.t('vi', 'plan.empty.insufficient_budget', {
    topic: translator.t('vi', 'plan.topic_food'),
    minutes: 15,
    minimumMinutes: 25,
  }));

  const increase = findElement(tree, 'Pressable', 'plan-empty-budget-recovery');
  assert.ok(increase, 'The duration recovery is available when an eligible node exceeds the current budget');
  increase.props.onPress();
  assert.equal(draft.topic, 'an thuc');
  assert.equal(draft.budgetMinutes, 25);

  const enBudgetView = mountPlanScreen({
    locale: 'en',
    nodes,
    draft: { topic: 'an thuc', budgetMinutes: 15 },
  });
  const enTree = enBudgetView.render();
  assert.equal(findElement(enTree, 'Text', 'plan-empty-message')?.props.children,
    translator.t('en', 'plan.empty.insufficient_budget', {
      topic: translator.t('en', 'plan.topic_food'),
      minutes: 15,
      minimumMinutes: 25,
    }));
});

test('missing-topic message does not suggest history if no eligible history stop fits the budget', () => {
  const view = mountPlanScreen({
    nodes: [makeNode({ id: 'long-history-stop', tags: ['chuyen xua'], visitMinutes: 45 })],
    draft: { topic: 'an thuc', budgetMinutes: 30 },
  });
  const tree = view.render();

  assert.equal(findElement(tree, 'Text', 'plan-empty-message')?.props.children,
    translator.t('vi', 'plan.empty.missing_topic', { topic: translator.t('vi', 'plan.topic_food') }));
  assert.equal(findElement(tree, 'Pressable', 'plan-empty-history-recovery'), undefined);
});

for (const [locale, expectedLabel] of [['vi', 'Đổi lựa chọn'], ['en', 'Change selection']]) {
  test(`FIX-02: ${locale} change-selection uses the dictionary and preserves tap-only draft reset`, () => {
    const key = 'plan.empty.change_selection';
    assert.equal(translator.t(locale, key), expectedLabel);
    let draft = { topic: 'an thuc', budgetMinutes: 30 };
    const translationCalls = [];
    const changes = [];
    const selected = [];
    const nodes = [makeNode({ tags: ['chuyen xua'] })];
    const view = mountPlanScreen({ locale, nodes, draft, translationCalls });
    const props = {
      nodes, draft,
      onDraftChange: (next) => { changes.push(next); draft = next; },
      onSelectNode: (id) => selected.push(id),
    };
    let tree = view.render(props);
    const change = findElement(tree, 'Pressable', 'plan-empty-change-selection');
    assert.ok(change);
    assert.equal(change.props.children.props.children, expectedLabel);
    assert.ok(translationCalls.includes(key), 'The screen actually calls the central translation key');
    assert.equal(changes.length, 0, 'Rendering must not change the draft');
    assert.equal(selected.length, 0, 'Rendering must not select a node');
    assert.ok(findElement(tree, 'Pressable', 'plan-empty-history-recovery'));

    change.props.onPress();
    assert.equal(changes.length, 1);
    assert.equal(draft.budgetMinutes, 30, 'The existing CTA keeps the budget');
    assert.equal(draft.topic, undefined, 'Only the existing topic reset occurs');
    assert.equal(selected.length, 0, 'Changing selection does not navigate to a recommendation');
    tree = view.render({ ...props, draft });
    assert.equal(findElement(tree, 'Text', 'plan-empty-message'), undefined);
    assert.equal(findElement(tree, 'Pressable', 'plan-empty-change-selection'), undefined);
  });
}
