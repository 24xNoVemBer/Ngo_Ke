#!/usr/bin/env node
/**
 * Repeatable demo scenario for Ngõ Kể (Phase 7, R7.01).
 *
 *   node tools/e2e/demo-scenario.mjs [--runs 3]
 *
 * It drives the Android emulator over adb and walks the accepted scenario:
 *   giới thiệu -> hỏi -> chọn chủ đề -> nhận điểm -> xác nhận -> xem lời kể -> hỏi tiếp
 * Each run records every step so a failure can be traced to a single step, and
 * the script exits non-zero when any run fails.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SDK = process.env.ANDROID_SDK ?? '/mnt/d/Dev/Android/Sdk';
const ADB = [join(SDK, 'platform-tools/adb.exe'), '-P', '5039', '-s', '127.0.0.1:5557'];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVIDENCE = join(ROOT, 'agent_docs/evidence/phase-7');
const RUNS = Number(process.argv[process.argv.indexOf('--runs') + 1] ?? 3);
const IP = process.env.NGOKE_DEV_HOST ?? '172.28.197.254';
mkdirSync(EVIDENCE, { recursive: true });

function adb(args, timeout = 40000) {
  return spawn(ADB[0], [...ADB.slice(1), ...args], { encoding: 'utf8', timeout });
}

function shell(args) {
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
      await shell(['shell', 'uiautomator', 'dump', '/sdcard/ngoke-p7.xml']);
      const xml = await shell(['exec-out', 'cat', '/sdcard/ngoke-p7.xml']);
      if (xml.includes('<hierarchy')) {
        writeFileSync(join(EVIDENCE, `${name}.xml`), xml);
        return parseNodes(xml);
      }
    } catch {
      /* retry: the screen can be mid-transition */
    }
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
      label: `${attr('text')} ${attr('content-desc')}`.replace(/\s+/g, ' ').trim(),
      bounds: [x1, y1, x2, y2],
      visible: y1 >= 0 && y1 < y2 && y2 <= 2400,
    });
  }
  return nodes;
}
const screenText = (nodes) => nodes.map((node) => node.label).join(' ');

async function find(label, { scroll = 8 } = {}) {
  for (let attempt = 0; attempt < scroll; attempt += 1) {
    const nodes = await uiDump(`scan-${label.slice(0, 6).replace(/\s/g, '')}-${attempt}`);
    const hit = nodes.find((node) => node.label.includes(label));
    if (hit && hit.visible) {
      return hit;
    }
    await shell(['shell', 'input', 'swipe', '540', '2000', '540', '1300', '350']);
    await sleep(600);
  }
  return null;
}

async function tapLabel(label, options) {
  const hit = await find(label, options);
  if (!hit) {
    return false;
  }
  const [x1, y1, x2, y2] = hit.bounds;
  await shell(['shell', 'input', 'tap', String((x1 + x2) / 2), String((y1 + y2) / 2)]);
  await sleep(1600);
  return true;
}

async function screenshot(name) {
  const png = await shell(['exec-out', 'screencap', '-p']);
  writeFileSync(join(EVIDENCE, `${name}.png`), png, 'binary');
}

async function relaunch() {
  await shell(['shell', 'am', 'force-stop', 'host.exp.exponent']);
  await sleep(2000);
  await shell(['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `exp://${IP}:8085`, 'host.exp.exponent']);
  for (let i = 0; i < 14; i += 1) {
    await sleep(2500);
    const text = screenText(await uiDump(`boot-${i}`));
    if (text.includes('Nguồn dữ liệu')) {
      return true;
    }
  }
  return false;
}

async function runScenario(runIndex) {
  const steps = [];
  const step = async (name, fn) => {
    const ok = await fn();
    steps.push({ step: name, passed: Boolean(ok) });
    process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  [run ${runIndex}] ${name}\n`);
    return ok;
  };

  if (!(await step('app opens in demo mode', relaunch))) return steps;
  await step('demo dataset loaded', async () => screenText(await uiDump(`r${runIndex}-home`)).includes('DEMO'));

  // 1. giới thiệu + hỏi
  await step('open Q&A', () => tapLabel('Bắt đầu nghe giới thiệu và hỏi đáp'));
  await step('intro names the current point', async () =>
    screenText(await uiDump(`r${runIndex}-intro`)).includes('Bạn đang ở'));
  await step('ask a sample question', () => tapLabel('Đây là điểm nào?', { scroll: 6 }));
  await step('answer shows a source', async () => {
    const text = screenText(await uiDump(`r${runIndex}-answer`));
    return text.includes('Nguồn') || text.includes('nguồn');
  });
  await screenshot(`r${runIndex}-answer`);

  // 2. chọn chủ đề và nhận điểm
  await shell(['shell', 'input', 'keyevent', '4']);
  await sleep(1500);
  await step('open the plan screen', () => tapLabel('Chọn chủ đề và xem gợi ý điểm'));
  await step('choose a topic', () => tapLabel('Chủ đề Ăn thực'));
  await step('choose a time budget', () => tapLabel('45 phút'));
  await step('receive at most three points', async () => {
    for (let i = 0; i < 6; i += 1) {
      const text = screenText(await uiDump(`r${runIndex}-picks-${i}`));
      if (text.includes('Gợi ý cho chủ đề')) {
        const points = new Set(text.match(/Điểm demo \d\d/g) ?? []);
        return points.size > 0 && points.size <= 3;
      }
      await shell(['shell', 'input', 'swipe', '540', '2050', '540', '1000', '350']);
      await sleep(700);
    }
    return false;
  });
  await screenshot(`r${runIndex}-picks`);

  // 3. xác nhận điểm và xem lời kể
  await step('open camera to confirm a point', async () => {
    await shell(['shell', 'input', 'keyevent', '4']);
    await sleep(1500);
    return tapLabel('Mở camera, quét QR và xem người kể');
  });
  await step('choose a point by hand', async () => {
    const hit = await find('Chọn điểm Điểm demo 03 bằng tay');
    if (!hit) return false;
    const [x1, y1, x2, y2] = hit.bounds;
    await shell(['shell', 'input', 'tap', String((x1 + x2) / 2), String((y1 + y2) / 2)]);
    await sleep(1600);
    return true;
  });
  // With the camera off the narrator text is read directly; the caption
  // overlay only exists on the camera preview (verified in Phase 4).
  await step('narrator story is shown', async () => {
    const text = screenText(await uiDump(`r${runIndex}-story`));
    return text.includes('demo-03') && text.includes('Bạn đang đọc bằng chữ');
  });
  await screenshot(`r${runIndex}-story`);

  // 4. hỏi tiếp tại điểm vừa xác nhận
  await step('back to Q&A keeps the confirmed point', async () => {
    await shell(['shell', 'input', 'keyevent', '4']);
    await sleep(1800);
    const hit = await find('Bắt đầu nghe giới thiệu và hỏi đáp');
    if (!hit) return false;
    const [x1, y1, x2, y2] = hit.bounds;
    await shell(['shell', 'input', 'tap', String((x1 + x2) / 2), String((y1 + y2) / 2)]);
    await sleep(1600);
    return screenText(await uiDump(`r${runIndex}-qa2`)).includes('Điểm demo 03');
  });
  await step('follow-up question still answers with a source', async () => {
    // After asking qa-01 the screen offers its follow-up chips.
    const asked = await tapLabel('Con ngõ này có gì để xem?', { scroll: 6 });
    if (!asked) return false;
    const text = screenText(await uiDump(`r${runIndex}-followup`));
    return text.includes('Nguồn') || text.includes('nguồn');
  });
  await screenshot(`r${runIndex}-followup`);
  return steps;
}

const results = [];
for (let run = 1; run <= RUNS; run += 1) {
  const steps = await runScenario(run);
  results.push({ run, steps, passed: steps.every((entry) => entry.passed) });
}
const summary = {
  date: '2026-10-16',
  scenario: 'giới thiệu → hỏi → chủ đề → nhận điểm → xác nhận → lời kể → hỏi tiếp',
  runs: results,
  allRunsPassed: results.every((entry) => entry.passed),
};
writeFileSync(join(EVIDENCE, 'scenario-runs.json'), `${JSON.stringify(summary, null, 2)}\n`);
const total = results.reduce((sum, entry) => sum + entry.steps.length, 0);
const passed = results.reduce((sum, entry) => sum + entry.steps.filter((s) => s.passed).length, 0);
process.stdout.write(`\n${passed}/${total} steps across ${results.length} runs; all runs passed: ${summary.allRunsPassed}\n`);
process.exit(summary.allRunsPassed ? 0 : 1);