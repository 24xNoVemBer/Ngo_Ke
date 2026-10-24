import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { URL } from 'node:url';
import {
  createImagePerfFirstLayoutReporter,
  recordImagePerfLoadEnd,
  recordImagePerfLoadError,
  recordImagePerfLoadStart,
  recordImagePerfLoadSuccess,
  recordImagePerfNavigationTap,
  recordImagePerfScreenFocus,
} from '../src/utils/imagePerformanceDiagnostics.ts';

test('Landing, Home, and Qa wire local image lifecycle diagnostics to the expected assets and taps', () => {
  const source = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  const landing = source('../src/screens/LandingScreen.tsx');
  const home = source('../src/screens/HomeScreen.tsx');
  const qa = source('../src/screens/QaScreen.tsx');
  const alleySelect = source('../src/screens/AlleySelectScreen.tsx');

  assert.match(landing, /recordImagePerfLoadStart\('landing', 'hero'\)/);
  assert.match(landing, /recordImagePerfLoadStart\('landing', `cover:\$\{col\.id\}`\)/);
  assert.match(landing, /recordImagePerfNavigationTap\('landing', 'home', col\.id\)/);
  assert.match(alleySelect, /recordImagePerfNavigationTap\('alley-select', 'home', collectionId\)/);
  assert.match(home, /recordImagePerfLoadStart\('home', `cover:\$\{activeCollectionId\}`\)/);
  assert.match(home, /recordImagePerfNavigationTap\('home', 'qa', currentNode\.id\)/);
  assert.match(qa, /recordImagePerfLoadStart\('qa', `background:\$\{currentNode\?\.id \?\? 'intro'\}`\)/);
  for (const screen of [landing, home, qa]) {
    assert.match(screen, /onLoadStart=\{/);
    assert.match(screen, /onLoadEnd=\{/);
    assert.match(screen, /onError=\{/);
  }
});

test('image diagnostics stay quiet by default, including in development', () => {
  const oldDev = globalThis.__DEV__;
  const oldInfo = globalThis.console.info;
  const oldOptIn = globalThis.process.env.EXPO_PUBLIC_NGOKE_PERF01;
  const logs = [];
  globalThis.__DEV__ = true;
  delete globalThis.process.env.EXPO_PUBLIC_NGOKE_PERF01;
  globalThis.console.info = (message) => logs.push(message);

  try {
    recordImagePerfNavigationTap('landing', 'home', 'ngo-gach');
    recordImagePerfScreenFocus('home');
    const reportFirstLayout = createImagePerfFirstLayoutReporter('home');
    reportFirstLayout();
    recordImagePerfLoadStart('home', 'cover:ngo-gach');
    recordImagePerfLoadSuccess('home', 'cover:ngo-gach');
    recordImagePerfLoadEnd('home', 'cover:ngo-gach');
    recordImagePerfLoadStart('qa', 'background:node-1');
    recordImagePerfLoadError('qa', 'background:node-1');
    recordImagePerfLoadEnd('qa', 'background:node-1');
    assert.equal(logs.length, 0);

    globalThis.process.env.EXPO_PUBLIC_NGOKE_PERF01 = '1';
    recordImagePerfNavigationTap('landing', 'home', 'ngo-gach');
    recordImagePerfScreenFocus('home');
    const reportOptInLayout = createImagePerfFirstLayoutReporter('home');
    reportOptInLayout();
    reportOptInLayout();
    recordImagePerfLoadStart('home', 'cover:ngo-gach');
    recordImagePerfLoadSuccess('home', 'cover:ngo-gach');
    recordImagePerfLoadEnd('home', 'cover:ngo-gach');
    recordImagePerfLoadStart('qa', 'background:node-1');
    recordImagePerfLoadError('qa', 'background:node-1');
    recordImagePerfLoadEnd('qa', 'background:node-1');
    const events = logs.map((line) => JSON.parse(line.slice('[NGOKE_PERF01] '.length)));
    assert.deepEqual(events.map((event) => event.event), [
      'navigation_tap',
      'navigation_focus',
      'first_layout',
      'image_load_start',
      'image_load_end',
      'image_load_start',
      'image_load_error',
      'image_load_end',
    ]);
    assert.equal(events[1].tap_to_focus_ms >= 0, true);
    assert.equal(events[2].tap_to_layout_ms >= 0, true);
    assert.equal(events[4].result, 'success');
    assert.equal(events[4].load_ms >= 0, true);
    assert.equal(events[7].result, 'error');

    globalThis.__DEV__ = false;
    recordImagePerfNavigationTap('landing', 'home', 'ignored-in-production');
    assert.equal(logs.length, 8);
  } finally {
    if (oldDev === undefined) delete globalThis.__DEV__;
    else globalThis.__DEV__ = oldDev;
    if (oldOptIn === undefined) delete globalThis.process.env.EXPO_PUBLIC_NGOKE_PERF01;
    else globalThis.process.env.EXPO_PUBLIC_NGOKE_PERF01 = oldOptIn;
    globalThis.console.info = oldInfo;
  }
});
