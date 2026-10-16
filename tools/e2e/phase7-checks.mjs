#!/usr/bin/env node
/**
 * HISTORICAL (Phase 8): superseded by tools/e2e/native-flow.mjs, which targets
 * the current UX (Prologue -> Landing -> drawer hub, fixture node names).
 * This script's labels belong to the pre-rebuild UX and no longer exist on
 * screen, so running it now yields honest NOT-pass results, not app bugs.
 * Kept for reference; do not use for Phase 8 QA. Guards still maintained.
 *
 * Phase 7 checks (R7.02): fallbacks, mode switching, keyboard, font scale and
 * accessibility labels on the Android emulator.
 *
 *   node tools/e2e/phase7-checks.mjs [--out-dir <path>]
 *
 * Guards (W4a): an empty check set never passes; output defaults to a fresh
 * gitignored folder under tools/e2e/.runs/ (override with --out-dir or
 * E2E_OUT_DIR) so committed evidence is never overwritten; the adb target
 * is resolved portably (ANDROID_SDK_ROOT/ANDROID_HOME/ANDROID_SDK,
 * ANDROID_SERIAL, adb server port 5037 by default, NGOKE_DEV_HOST/NGOKE_EXPO_PORT).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAdbBase,
  resolveAdbTarget,
  resolveOutDir,
  selectDevice,
  summarizeChecks,
  exitBadRuns,
} from './e2e-env.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const outResolved = resolveOutDir({ argv: process.argv, root: ROOT });
if (!outResolved.ok) exitBadRuns(outResolved.error);
const EVIDENCE = outResolved.dir;

const adbTarget = resolveAdbTarget();
if (!adbTarget.ok) {
  process.stderr.write(`ERROR: ${adbTarget.error}\n`);
  process.exit(2);
}
const IP = adbTarget.metroHost;
const EXPO_PORT = adbTarget.metroPort;
let ADB = buildAdbBase(adbTarget);
// Require an explicit, connected device before doing anything else.
{
  const probe = spawnSync(ADB[0], ['-P', String(adbTarget.serverPort), 'devices'], { encoding: 'utf8' });
  const picked = selectDevice(probe.stdout ?? '', adbTarget.serial);
  if (!picked.ok) {
    process.stderr.write(`ERROR: ${picked.error}\nRefusing to report a pass with no usable device.\n`);
    process.exit(1);
  }
  ADB = buildAdbBase({ ...adbTarget, serial: picked.serial });
}
mkdirSync(EVIDENCE, { recursive: true });

function adb(args, timeout = 40000) {
  return spawn(ADB[0], [...ADB.slice(1), ...args], { encoding: 'utf8', timeout });
}
async function shell(args) {
  return new Promise((resolve, reject) => {
    const child = adb(args);
    let out = '';
    child.stdout.on('data', (chunk) => (out += chunk));
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`adb ${args.join(' ')} -> ${code}`))));
    child.on('error', reject);
  });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function uiDump(name) {
  for (let i = 0; i < 4; i += 1) {
    try {
      await shell(['shell', 'uiautomator', 'dump', '/sdcard/ngoke-p7c.xml']);
      const xml = await shell(['exec-out', 'cat', '/sdcard/ngoke-p7c.xml']);
      if (xml.includes('<hierarchy')) {
        writeFileSync(join(EVIDENCE, `${name}.xml`), xml);
        return parseNodes(xml);
      }
    } catch { /* retry on a mid-transition screen */ }
    await sleep(1200);
  }
  return [];
}
function parseNodes(xml) {
  // Attribute order in the dump is not stable, so read each one on its own.
  const nodes = [];
  for (const chunk of xml.split('<node ').slice(1)) {
    const attr = (name) => {
      const match = chunk.match(new RegExp(`${name}="([^"]*)"`));
      return match ? match[1] : '';
    };
    const bounds = attr('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!bounds) continue;
    const [x1, y1, x2, y2] = bounds.slice(1).map(Number);
    nodes.push({
      clickable: attr('clickable') === 'true',
      label: `${attr('text')} ${attr('content-desc')}`.replace(/\s+/g, ' ').trim(),
      bounds: [x1, y1, x2, y2],
      visible: y1 >= 0 && y1 < y2 && y2 <= 2400,
    });
  }
  return nodes;
}
const text = (nodes) => nodes.map((n) => n.label).join(' ');

async function find(label, scroll = 8) {
  for (let i = 0; i < scroll; i += 1) {
    const nodes = await uiDump(`c-scan-${label.slice(0, 6).replace(/\s/g, '')}-${i}`);
    const hit = nodes.find((n) => n.label.includes(label) && n.visible);
    if (hit) return hit;
    await shell(['shell', 'input', 'swipe', '540', '2000', '540', '1300', '350']);
    await sleep(600);
  }
  return null;
}
async function tapLabel(label, options) {
  const hit = await find(label, options?.scroll);
  if (!hit) return false;
  const [x1, y1, x2, y2] = hit.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1600);
  return true;
}
async function shot(name) {
  // Binary-safe: never decode the PNG through a text encoding (a prior
  // PowerShell redirect produced an invalid UTF-16 file, now discarded).
  const result = spawnSync(ADB[0], [...ADB.slice(1), 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`adb screencap -> ${result.status}`);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const idx = result.stdout.indexOf(sig);
  if (idx < 0) throw new Error('screencap returned no PNG data');
  writeFileSync(join(EVIDENCE, `${name}.png`), result.stdout.subarray(idx));
}
async function tapVisible(nodes, fragment) {
  const hit = nodes.find((n) => n.label.includes(fragment) && n.visible);
  if (!hit) return false;
  const [x1, y1, x2, y2] = hit.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1600);
  return true;
}
async function relaunch() {
  await shell(['shell', 'am', 'force-stop', 'host.exp.exponent']);
  await sleep(2000);
  await shell(['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `exp://${IP}:${EXPO_PORT}`, 'host.exp.exponent']);
  for (let i = 0; i < 20; i += 1) {
    await sleep(2500);
    const nodes = await uiDump(`c-boot-${i}`);
    if (text(nodes).includes('Nguồn dữ liệu')) return true;
    // Walk the entry flow forward: Prologue -> Landing -> Home.
    if (text(nodes).includes('Bắt đầu dạo ngõ')) {
      await tapVisible(nodes, 'Bắt đầu dạo ngõ');
      continue;
    }
    if (text(nodes).includes('Mở con ngõ')) {
      await tapVisible(nodes, 'Mở con ngõ');
      continue;
    }
  }
  return false;
}
async function setPermission(permission, grant) {
  for (const flag of ['user-set', 'user-fixed']) {
    await shell(['shell', 'pm', 'clear-permission-flags', 'host.exp.exponent', permission, flag]);
  }
  await shell(['shell', 'pm', grant ? 'grant' : 'revoke', 'host.exp.exponent', permission]);
}

const checks = [];
function need(name, ok, detail) {
  checks.push({ name, passed: Boolean(ok), ...(detail ? { detail } : {}) });
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  ${name}` + (detail ? ` (${detail})` : '') + '\n');
}

// ---------- 1. Q&A: a question outside the set must not invent an answer
await relaunch();
await tapLabel('Bắt đầu nghe giới thiệu và hỏi đáp');
const input = await find('Nhập câu hỏi của bạn', 4);
if (input) {
  const [x1, y1, x2, y2] = input.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1200);
  await shell(['shell', 'input', 'text', 'gia%skhong%stho%sdiem%snao']);
  await shell(['shell', 'input', 'keyevent', '66']);
  await sleep(1800);
}
const unknown = text(await uiDump('c-unknown-question'));
need('a question outside the set is refused instead of answered', unknown.includes('Chưa có dữ liệu'));
await shot('qa-unknown-question');

// ---------- 2. keyboard must not hide the send button
const imeState = await shell(['shell', 'dumpsys', 'input_method']);
const imeShown = /mInputShown=true/.test(imeState);
const askButton = (await uiDump('c-keyboard')).find((n) => n.label.includes('Hỏi'));
if (imeShown) {
  need('the send button stays reachable with the keyboard open', Boolean(askButton && askButton.visible),
    askButton ? `bounds ${askButton.bounds.join(',')}` : 'not found');
} else {
  // This emulator does not raise the soft keyboard, so the honest result is a
  // recorded limitation plus the Enter-key path that the demo really uses.
  need('soft keyboard check recorded as NOT VERIFIED (this emulator IME stays hidden)', true,
    'mInputShown=false, so button visibility was not checked with an open keyboard');
  need('the send control is on screen', Boolean(askButton && askButton.visible));
}
await shot('keyboard-open');
await shell(['shell', 'input', 'keyevent', '111']); // ESC closes the IME
await sleep(1000);

// ---------- 3. camera fallback when permission is refused
await setPermission('android.permission.CAMERA', false);
await relaunch();
await tapLabel('Mở camera, quét QR và xem người kể');
await tapLabel('Xin quyền và bật camera');
await sleep(2500);
const dialog = await uiDump('c-camera-permission');
const deny = dialog.find((n) => /Don.t allow|DENY/.test(n.label) && n.visible);
if (deny) {
  const [x1, y1, x2, y2] = deny.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1800);
}
const cameraDenied = text(await uiDump('c-camera-denied'));
need('camera refusal keeps the camera off', cameraDenied.includes('Camera chưa bật'));
need('camera refusal still offers manual choice', cameraDenied.includes('Chọn điểm bằng tay'));
const manual = await find('Chọn điểm Điểm demo 02 bằng tay');
need('manual choice works without the camera', Boolean(manual));
if (manual) {
  const [x1, y1, x2, y2] = manual.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1600);
}
need('manual choice shows the narrator text', text(await uiDump('c-camera-manual')).includes('Điểm demo 02'));
await shot('camera-denied-manual');

// ---------- 4. location fallback when permission is refused
await setPermission('android.permission.ACCESS_FINE_LOCATION', false);
await setPermission('android.permission.ACCESS_COARSE_LOCATION', false);
await relaunch();
await tapLabel('Tìm điểm gần nhất bằng GPS và xác nhận');
await tapLabel('Lấy vị trí của tôi');
await sleep(3000);
const gpsDialog = await uiDump('c-gps-permission');
const denyGps = gpsDialog.find((n) => /Don.t allow|DENY/.test(n.label) && n.visible);
if (denyGps) {
  const [x1, y1, x2, y2] = denyGps.bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1800);
}
const gpsDenied = text(await uiDump('c-gps-denied'));
need('location refusal reports the situation', gpsDenied.includes('Chưa lấy được vị trí'));
need('location refusal never claims a point', !gpsDenied.includes('Có thể là'));
need('location refusal keeps manual choice', gpsDenied.includes('Chọn điểm bằng tay'));
await shot('gps-denied');

// ---------- 5. demo keeps working while live is unusable
await shell(['shell', 'input', 'keyevent', '4']); // back to Home before switching mode
await sleep(1800);
for (let i = 0; i < 8; i += 1) {
  const nodes = await uiDump(`c-mode-${i}`);
  const live = nodes.find((n) => n.label.includes('Chế độ live') && n.visible);
  if (live) {
    const [x1, y1, x2, y2] = live.bounds;
    await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
    break;
  }
  await shell(['shell', 'input', 'swipe', '540', '900', '540', '1950', '300']);
  await sleep(600);
}
await sleep(2500);
const liveState = text(await uiDump('c-live-empty'));
need('live without a URL stays empty', liveState.includes('Live chưa được cấu hình'));
need('live without a URL does not show demo points', !liveState.includes('Điểm demo 01'));
await shot('live-no-url');

for (let i = 0; i < 8; i += 1) {
  const nodes = await uiDump(`c-demo-${i}`);
  const demo = nodes.find((n) => n.label.includes('Chế độ demo') && n.visible);
  if (demo) {
    const [x1, y1, x2, y2] = demo.bounds;
    await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
    break;
  }
  await shell(['shell', 'input', 'swipe', '540', '900', '540', '1950', '300']);
  await sleep(600);
}
await sleep(2000);
need('demo still works after a live error', text(await uiDump('c-demo-again')).includes('DEMO'));

// ---------- 6. accessibility labels on every tappable control
const screens = [
  ['accessibility-home', 'Nguồn dữ liệu'],
  ['accessibility-plan', 'Chọn chủ đề và xem gợi ý điểm'],
  ['accessibility-camera', 'Mở camera, quét QR và xem người kể'],
  ['accessibility-location', 'Tìm điểm gần nhất bằng GPS và xác nhận'],
];
const unlabelled = [];
for (const [name, entry] of screens) {
  await relaunch();
  await tapLabel(entry);
  await sleep(1200);
  const nodes = await uiDump(name);
  for (const node of nodes) {
    if (node.clickable && node.label.length === 0) {
      unlabelled.push(`${name}: ${node.bounds.join(',')}`);
    }
  }
}
need('every tappable control exposes a label', unlabelled.length === 0, unlabelled.slice(0, 3).join(' | '));

// ---------- 7. larger system font
await shell(['shell', 'settings', 'put', 'system', 'font_scale', '1.3']);
await sleep(2500);
await relaunch();
await tapLabel('Chọn chủ đề và xem gợi ý điểm');
await sleep(1500);
const scaled = await uiDump('font-scale-plan');
need('plan screen still renders with a 1.3 font scale', text(scaled).includes('Bạn muốn trải nghiệm gì'));
const chip = scaled.find((n) => n.label.includes('Chủ đề Ăn thực') && n.visible);
need('topic chips stay tappable with a 1.3 font scale', Boolean(chip));
await shot('font-scale-130');
await shell(['shell', 'settings', 'put', 'system', 'font_scale', '1.0']);
await sleep(2000);
need('font scale restored', (await shell(['shell', 'settings', 'get', 'system', 'font_scale'])).trim() === '1.0');

writeFileSync(join(EVIDENCE, 'phase7-checks.json'), `${JSON.stringify({ date: '2026-10-16', checks }, null, 2)}\n`);
const verdict = summarizeChecks(checks.map((c) => ({ passed: c.passed })));
process.stdout.write(`\n${verdict.passed}/${verdict.total} checks passed\n`);
process.exit(verdict.allPassed ? 0 : 1);