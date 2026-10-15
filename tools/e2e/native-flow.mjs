#!/usr/bin/env node
/**
 * Native E2E flow for the CURRENT app UX (Phase 8, T3).
 * THE current native entry point (supersedes demo-scenario.mjs and
 * phase7-checks.mjs, kept as historical references with stale labels).
 *
 *   node tools/e2e/native-flow.mjs [--runs 1] [--out-dir <path>]
 *
 * Drives Expo Go on the connected emulator over adb through the real
 * entry flow (Prologue -> Landing -> alley card -> Home) and the demo
 * journey: 6 fixture nodes, Q&A with sourced answers + follow-ups,
 * unknown-question refusal, plan picks (<=3), camera manual choice,
 * location manual confirm, and the live-mode switch against the LAN
 * backend baked into the Metro bundle.
 *
 * Entry labels follow the W2 UI mapping (drawer hub 'Sổ tay' tab,
 * 'Chủ đề ẩm thực ngõ', picks 'Khám phá (N phút) tới …', typed path
 * 'Đặt câu hỏi cho người kể' + 'Gửi câu hỏi' -> 'Chưa có dữ liệu').
 *
 * Device setup performed by this script (documented, reversible):
 * - transition_animation_scale 0 during the run. The Home map runs an
 *   infinite pin-halo pulse loop, so uiautomator never reaches idle and
 *   dumps are impossible there otherwise. The app explicitly supports
 *   reduce-motion; the exact prior value is restored at the end (deleted
 *   when it was unset).
 * - pm grants for CAMERA and FINE/COARSE location on the test emulator so
 *   the manual-choice paths run deterministically. This covers manual
 *   success only, never the permission-denial branches.
 *
 * Guards (W4a): --runs finite integer >= 1, empty results never pass,
 * output defaults to a fresh gitignored folder, portable adb target with
 * explicit device selection, integer tap coordinates, binary-safe
 * screenshots (PNG signature verified before write). Preflight fails fast
 * (exit 2) when the device, Metro or basic adb plumbing is unavailable.
 */
import { execSync, spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAdbBase,
  exitBadRuns,
  parseRuns,
  resolveAdbTarget,
  resolveOutDir,
  selectDevice,
  summarizeRuns,
} from './e2e-env.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const parsed = parseRuns(process.argv);
if (!parsed.ok) exitBadRuns(parsed.error);
const RUNS = parsed.runs;

const outResolved = resolveOutDir({ argv: process.argv, root: ROOT });
if (!outResolved.ok) exitBadRuns(outResolved.error);
const EVIDENCE = outResolved.dir;

const adbTarget = resolveAdbTarget();
if (!adbTarget.ok) {
  process.stderr.write(`ERROR: ${adbTarget.error}\n`);
  process.exitCode = 2;
  process.exit(process.exitCode);
}
const IP = adbTarget.metroHost;
const EXPO_PORT = adbTarget.metroPort;
let ADB = buildAdbBase(adbTarget);
{
  const probe = spawnSync(ADB[0], ['-P', String(adbTarget.serverPort), 'devices'], { encoding: 'utf8' });
  const picked = selectDevice(probe.stdout ?? '', adbTarget.serial);
  if (!picked.ok) {
    process.stderr.write(`ERROR: ${picked.error}\nRefusing to report a pass with no usable device.\n`);
    process.exitCode = 1;
    process.exit(process.exitCode);
  }
  ADB = buildAdbBase({ ...adbTarget, serial: picked.serial });
}
const SERIAL = ADB[ADB.indexOf('-s') + 1];
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

function gitHead() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown (git rev-parse failed)';
  }
}
async function deviceInfo() {
  const get = async (prop) => {
    try {
      return (await shell(['shell', 'getprop', prop])).trim();
    } catch {
      return '?';
    }
  };
  return {
    serial: SERIAL,
    model: await get('ro.product.model'),
    sdk: await get('ro.build.version.sdk'),
  };
}

/** Preflight self-check: device, Metro packager, animation-setting access. */
async function preflight() {
  const problems = [];
  try {
    const state = (await shell(['shell', 'getprop', 'sys.boot_completed'])).trim();
    if (state !== '1') problems.push(`device ${SERIAL} not fully booted (sys.boot_completed=${state || 'empty'})`);
  } catch (error) {
    problems.push(`adb unreachable: ${error.message}`);
  }
  try {
    const res = await fetch(`http://${IP === '10.0.2.2' || IP === '127.0.0.1' ? '127.0.0.1' : IP}:${EXPO_PORT}/status`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.status !== 200) problems.push(`Metro /status -> ${res.status}`);
  } catch (error) {
    problems.push(`Metro unreachable at ${IP}:${EXPO_PORT} (${error.message})`);
  }
  try {
    await shell(['shell', 'settings', 'get', 'global', 'transition_animation_scale']);
  } catch (error) {
    problems.push(`cannot read animation scale: ${error.message}`);
  }
  return problems;
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function shot(name) {
  const result = spawnSync(ADB[0], [...ADB.slice(1), 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer', maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`adb screencap -> ${result.status}`);
  const idx = result.stdout.indexOf(PNG_SIG);
  if (idx < 0) throw new Error('screencap returned no PNG data');
  writeFileSync(join(EVIDENCE, `${name}.png`), result.stdout.subarray(idx));
}

function parseNodes(xml) {
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

async function uiDump(name) {
  for (let i = 0; i < 3; i += 1) {
    try {
      await shell(['shell', 'uiautomator', 'dump', '/sdcard/ngoke-nf.xml']);
      const xml = await shell(['exec-out', 'cat', '/sdcard/ngoke-nf.xml']);
      if (xml.includes('<hierarchy')) {
        writeFileSync(join(EVIDENCE, `${name}.xml`), xml);
        return { nodes: parseNodes(xml), dumpAvailable: true };
      }
    } catch { /* mid-transition or never-idle screen */ }
    await sleep(1500);
  }
  return { nodes: [], dumpAvailable: false };
}
const textOf = (nodes) => nodes.map((n) => n.label).join(' ');
async function tapBounds(bounds) {
  const [x1, y1, x2, y2] = bounds;
  await shell(['shell', 'input', 'tap', String(Math.round((x1 + x2) / 2)), String(Math.round((y1 + y2) / 2))]);
  await sleep(1600);
}
/** Prefer clickable matches; never tap a non-actionable label when a button exists. */
function findTap(nodes, fragment) {
  const cands = nodes.filter((n) => n.label.includes(fragment) && n.visible);
  return cands.find((n) => n.clickable) ?? cands[0] ?? null;
}
async function tapFrag(nodes, fragment) {
  const hit = findTap(nodes, fragment);
  if (!hit) return false;
  await tapBounds(hit.bounds);
  return true;
}
/** Scroll-and-redump search: bounds are always taken from a fresh dump. */
async function tapFragScroll(tag, fragment, maxScroll = 6) {
  for (let i = 0; i <= maxScroll; i += 1) {
    const { nodes } = await uiDump(`${tag}-s${i}`);
    const hit = findTap(nodes, fragment);
    if (hit) {
      await tapBounds(hit.bounds);
      return true;
    }
    await shell(['shell', 'input', 'swipe', '540', '2000', '540', '1300', '350']);
    await sleep(700);
  }
  return false;
}
async function back() {
  await shell(['shell', 'input', 'keyevent', '4']);
  await sleep(1800);
}

const checks = [];
function need(name, ok, detail) {
  checks.push({ name, passed: Boolean(ok), ...(detail ? { detail } : {}) });
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'}  ${name}` + (detail ? ` (${detail})` : '') + '\n');
}

async function relaunch(tag) {
  await shell(['shell', 'am', 'force-stop', 'host.exp.exponent']);
  await sleep(2000);
  await shell(['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `exp://${IP}:${EXPO_PORT}`, 'host.exp.exponent']);
  for (let i = 0; i < 24; i += 1) {
    await sleep(2500);
    const { nodes, dumpAvailable } = await uiDump(`${tag}-boot-${i}`);
    if (!dumpAvailable) continue;
    const t = textOf(nodes);
    if (/Đã mở \d\/6 câu chuyện · Demo/.test(t) || (t.includes('Nguồn dữ liệu') && t.includes('Cổng ngõ'))) return true;
    if (t.includes('developer menu')) {
      await tapFrag(nodes, 'Continue');
      continue;
    }
    if (t.includes('Reload') && t.includes('Go home') && t.includes('Tools')) {
      await shell(['shell', 'input', 'tap', '540', '500']); // dismiss dev sheet via scrim
      await sleep(1500);
      continue;
    }
    if (t.includes('Bắt đầu dạo ngõ')) {
      await tapFrag(nodes, 'Bắt đầu dạo ngõ');
      continue;
    }
    if (t.includes('Mở con ngõ Ngõ Phất Lộc')) {
      await tapFrag(nodes, 'Mở con ngõ Ngõ Phất Lộc');
      continue;
    }
  }
  return false;
}

const NODE_NAMES = ['Cổng ngõ', 'Hiên đồng hồ', 'Bếp đầu hè', 'Sân hoa giấy', 'Bậc thềm nắng', 'Đèn cuối ngõ'];

async function runOnce(runIndex) {
  const R = `r${runIndex}`;
  if (!(await (async () => {
    const ok = await relaunch(R);
    need(`[run ${runIndex}] app reaches Home in demo mode`, ok);
    return ok;
  })())) return;

  // Home: six fixture nodes + demo label.
  {
    const { nodes } = await uiDump(`${R}-home`);
    const t = textOf(nodes);
    need(`[run ${runIndex}] Home lists all six fixture nodes`, [1, 2, 3, 4, 5, 6].every((n) => t.includes(`Điểm 0${n}:`)));
    need(`[run ${runIndex}] Home shows demo content label`, t.includes('Demo') && NODE_NAMES.every((n) => t.includes(n)));
    await shot(`${R}-home`);
  }

  // Q&A via the visible bottom-dock action (pin tap kept as a separate selection check).
  {
    let { nodes } = await uiDump(`${R}-pin`);
    need(`[run ${runIndex}] node pin Cổng ngõ is selectable`, await tapFrag(nodes, 'Xem Cổng ngõ'));
    ({ nodes } = await uiDump(`${R}-dock`));
    if (!await tapFrag(nodes, 'Đọc lời kể điểm đang chọn')) {
      need(`[run ${runIndex}] dock opens Q&A for the current node`, false);
      return;
    }
    await sleep(2000);
    ({ nodes } = await uiDump(`${R}-qa`));
    let t = textOf(nodes);
    need(`[run ${runIndex}] Q&A offers fixture question chips`, t.includes('Hỏi: Đây là điểm nào?'));
    if (!await tapFrag(nodes, 'Hỏi: Đây là điểm nào?')) {
      need(`[run ${runIndex}] ask fixture question`, false);
      return;
    }
    await sleep(2000);
    ({ nodes } = await uiDump(`${R}-answer`));
    t = textOf(nodes);
    need(`[run ${runIndex}] answer carries a source`, t.includes('Nguồn nội dung:'));
    if (!t.includes('Hỏi tiếp:')) {
      await sleep(2500); // follow-up chips render just after the answer card
      ({ nodes } = await uiDump(`${R}-answer2`));
      t = textOf(nodes);
    }
    need(`[run ${runIndex}] answer offers follow-ups`, t.includes('Hỏi tiếp:')); 
    await shot(`${R}-answer`);
    if (await tapFrag(nodes, 'Xem câu trả lời bằng chữ')) {
      await sleep(1500);
      ({ nodes } = await uiDump(`${R}-answermore`));
      const at = textOf(nodes);
      need(`[run ${runIndex}] expanded answer shows the asked question`, at.includes('Bạn vừa hỏi:'));
    } else {
      need(`[run ${runIndex}] expanded answer shows the asked question`, false, 'expand control not found');
    }
    ({ nodes } = await uiDump(`${R}-followup0`));
    if (await tapFragScroll(`${R}-followup`, 'Hỏi tiếp: Con ngõ này có gì để xem?', 4)) {
      await sleep(2000);
      const after = await uiDump(`${R}-followup`);
      const at = textOf(after.nodes);
      need(`[run ${runIndex}] follow-up still answers with a source`, at.includes('Nguồn nội dung:'));
      await shot(`${R}-followup`);
      if (await tapFrag(after.nodes, 'Đặt câu hỏi khác')) {
        await sleep(1500);
        const reset = await uiDump(`${R}-reset`);
        need(`[run ${runIndex}] question reset returns suggestion chips`, textOf(reset.nodes).includes('Câu hỏi gợi ý ngõ phố:'));
      }
    } else {
      need(`[run ${runIndex}] follow-up still answers with a source`, false, 'follow-up chip not found');
    }
  }

  // Unknown typed question must be refused, never invented.
  {
    let { nodes } = await uiDump(`${R}-drawer0`);
    if (await tapFrag(nodes, 'Mở ô gõ câu hỏi')) {
      await sleep(1500);
      ({ nodes } = await uiDump(`${R}-drawer1`));
      if (await tapFrag(nodes, 'Đặt câu hỏi cho người kể')) {
        await shell(['shell', 'input', 'text', 'cau%shoi%skhong%sco%strong%sdu%slieu']);
        await sleep(800);
        ({ nodes } = await uiDump(`${R}-drawer2`));
        if (await tapFrag(nodes, 'Gửi câu hỏi')) {
          await sleep(2000);
          ({ nodes } = await uiDump(`${R}-unknown`));
          need(`[run ${runIndex}] unknown question is refused with source guidance`,
            textOf(nodes).includes('Chưa có dữ liệu'));
          await shot(`${R}-unknown`);
          await tapFrag(nodes, 'Đặt câu hỏi khác');
        } else need(`[run ${runIndex}] unknown question is refused with source guidance`, false, 'send not found');
      } else need(`[run ${runIndex}] unknown question is refused with source guidance`, false, 'free input not found');
    } else need(`[run ${runIndex}] unknown question is refused with source guidance`, false, 'drawer opener not found');
  }

  // Drawer hub: Plan, Camera, Location and mode switch live inside the 'Sổ tay' tab.
  // Call only from Home; use ensureHome() first after screens that trap back().
  async function openDrawer(tag) {
    const { nodes } = await uiDump(`${tag}-drawerhub`);
    if (await tapFrag(nodes, 'Sổ tay')) {
      await sleep(1800);
      return true;
    }
    return false;
  }

  function isHome(t) {
    // Header counter advances as stories open (0/6 -> 1/6 …), so match the pattern.
    return /Đã mở \d\/6 câu chuyện · (Demo|Live)/.test(t) || (t.includes('Nguồn dữ liệu') && t.includes('Cổng ngõ'));
  }
  async function ensureHome(tag) {
    for (let i = 0; i < 6; i += 1) {
      const { nodes } = await uiDump(`${tag}-home${i}`);
      const t = textOf(nodes);
      if (isHome(t)) return true;
      // Back can land on Landing (live map) or Prologue; walk forward again.
      if (t.includes('Mở con ngõ Ngõ Phất Lộc')) {
        await tapFrag(nodes, 'Mở con ngõ Ngõ Phất Lộc');
      } else if (t.includes('Bắt đầu dạo ngõ')) {
        await tapFrag(nodes, 'Bắt đầu dạo ngõ');
      } else {
        await back();
      }
    }
    return false;
  }

  // Plan: topic + budget -> at most three picks.
  await back();
  {
    if (!await ensureHome(`${R}-preplan`) || !await openDrawer(`${R}-preplan`)) {
      need(`[run ${runIndex}] plan yields at most three picks`, false, 'drawer not found');
    } else {
      const entryTag = `${R}-planentry`;
      if (!await tapFragScroll(entryTag, 'Chọn trải nghiệm theo chủ đề và thời gian', 4)) {
        need(`[run ${runIndex}] plan yields at most three picks`, false, 'plan entry not found');
      } else {
        await sleep(1500);
        await tapFragScroll(`${R}-plantopic`, 'Chủ đề Ẩm thực ngõ', 3);
        await sleep(1200);
        await tapFragScroll(`${R}-planbudget`, '45 phút', 3);
        await sleep(2000);
        let pt = '';
        const pickSet = new Set();
        for (let s = 0; s < 4; s += 1) {
          const { nodes: snodes } = await uiDump(`${R}-planresult${s}`);
          const st = textOf(snodes);
          pt += ' ' + st;
          for (const m of st.match(/Khám phá \(\d+ phút\) tại /g) ?? []) pickSet.add(m);
          if (pt.includes('Chủ đề ẩm thực · 45 phút') && pickSet.size > 0) break;
          await shell(['shell', 'input', 'swipe', '540', '2000', '540', '1300', '350']);
          await sleep(700);
        }
        need(`[run ${runIndex}] plan yields at most three picks`,
          pt.includes('Chủ đề ẩm thực · 45 phút') && pickSet.size > 0 && pickSet.size <= 3,
          `${pickSet.size} pick(s)`);
        await shot(`${R}-planresult`);
      }
    }
  }

  // Camera: manual choice works without scanning.
  await back();
  {
    if (!await ensureHome(`${R}-precam`) || !await openDrawer(`${R}-precam`)) {
      need(`[run ${runIndex}] camera manual choice confirms a point`, false, 'drawer not found');
    } else if (!await tapFragScroll(`${R}-camentry`, 'Quét mã QR tại điểm', 4)) {
      need(`[run ${runIndex}] camera manual choice confirms a point`, false, 'camera entry not found');
    } else {
      await sleep(2000);
      if (await tapFragScroll(`${R}-cam`, 'Chọn điểm Cổng ngõ bằng tay', 6)) {
        await sleep(2000);
        const { nodes } = await uiDump(`${R}-camdone`);
        const t = textOf(nodes);
        need(`[run ${runIndex}] camera manual choice confirms a point`,
          t.includes('ĐIỂM ĐÃ XÁC NHẬN') && t.includes('Cổng ngõ'));
        await shot(`${R}-camdone`);
      } else need(`[run ${runIndex}] camera manual choice confirms a point`, false, 'manual choice not found');
    }
  }

  // Location: manual confirm always works; GPS tap must not invent a point.
  // Expo shows its own experience permission dialog on first GPS use; the
  // script allows it (manual-success path only, denial stays uncovered).
  await back();
  {
    if (!await ensureHome(`${R}-preloc`) || !await openDrawer(`${R}-preloc`)) {
      need(`[run ${runIndex}] location manual confirm works`, false, 'drawer not found');
    } else if (!await tapFragScroll(`${R}-locentry`, 'Tìm điểm bằng GPS', 4)) {
      need(`[run ${runIndex}] location manual confirm works`, false, 'location entry not found');
    } else {
      await sleep(1500);
      let { nodes } = await uiDump(`${R}-loc`);
      need(`[run ${runIndex}] location screen explains one-shot GPS`, textOf(nodes).includes('Xác nhận điểm chạm'));
      await tapFrag(nodes, 'Lấy vị trí của tôi');
      // Expo stacks one system dialog per location tier (coarse, then fine);
      // allow each in turn. Denial branches stay uncovered (pending).
      for (let p = 0; p < 3; p += 1) {
        await sleep(3000);
        ({ nodes } = await uiDump(`${R}-locperm${p}`));
        if (!textOf(nodes).includes('needs permissions')) break;
        await tapFrag(nodes, 'ALLOW');
      }
      await sleep(4000);
      ({ nodes } = await uiDump(`${R}-locgps`));
      const t = textOf(nodes);
      need(`[run ${runIndex}] GPS attempt never auto-switches the point without confirm`,
        !t.includes('GỢI Ý TỪ GPS') || t.includes('Đây chỉ là đề xuất'),
        t.includes('GỢI Ý TỪ GPS') ? 'candidate shown, confirm required' : 'no candidate on emulator GPS');
      if (await tapFragScroll(`${R}-locmanual`, 'Chọn điểm Cổng ngõ bằng tay, mô phỏng', 6)) {
        await sleep(2000);
        ({ nodes } = await uiDump(`${R}-locdone`));
        need(`[run ${runIndex}] location manual confirm works`, textOf(nodes).includes('Cổng ngõ'));
        await shot(`${R}-locdone`);
      } else need(`[run ${runIndex}] location manual confirm works`, false, 'manual point not found');
    }
  }

  // Live mode against the LAN backend, then back to demo (both inside the drawer).
  await back();
  {
    if (!await ensureHome(`${R}-prelive`) || !await openDrawer(`${R}-prelive`)) {
      need(`[run ${runIndex}] live mode loads the LAN dataset`, false, 'drawer not found');
    } else if (!await tapFragScroll(`${R}-liveentry`, 'Chế độ live', 4)) {
      need(`[run ${runIndex}] live mode loads the LAN dataset`, false, 'live switch not found');
    } else {
      await sleep(6000);
      let { nodes } = await uiDump(`${R}-live`);
      let t = textOf(nodes);
      // The drawer modal stays open over the map: assert its mode section,
      // then close it and assert the live map underneath.
      need(`[run ${runIndex}] live drawer shows source, count and origin`,
        t.includes('LIVE · dữ liệu mô phỏng (chưa xác minh)')
        && t.includes('Live · 6 điểm mô phỏng (chưa xác minh)')
        && t.includes('10.0.2.2:8086'));
      await shot(`${R}-live`);
      await tapFrag(nodes, 'Đóng sổ tay');
      await sleep(2500);
      ({ nodes } = await uiDump(`${R}-livemap`));
      t = textOf(nodes);
      need(`[run ${runIndex}] live mode loads the LAN dataset`,
        /Đã mở \d\/6 câu chuyện · Live/.test(t) && NODE_NAMES.every((n) => t.includes(n)));
      await shot(`${R}-livemap`);
      await back();
      if (!await ensureHome(`${R}-livedrawer`) || !await openDrawer(`${R}-livedrawer`)) {
        need(`[run ${runIndex}] demo still works after live`, false, 'drawer not found after live');
      } else if (!await tapFragScroll(`${R}-livedemo`, 'Chế độ demo', 4)) {
        need(`[run ${runIndex}] demo still works after live`, false, 'demo switch not found');
      } else {
        await sleep(3000);
        ({ nodes } = await uiDump(`${R}-backdemo`));
        need(`[run ${runIndex}] demo still works after live`, textOf(nodes).includes('DEMO · nội dung mô phỏng'));
      }
    }
  }
}

let exitCode = 0;
let priorAnim = null;
try {
  const fatal = await preflight();
  if (fatal.length > 0) {
    for (const problem of fatal) process.stderr.write(`PREFLIGHT: ${problem}\n`);
    process.stderr.write('Refusing to report a pass without a working device + Metro.\n');
    exitCode = 2;
  } else {
    try {
      const raw = (await shell(['shell', 'settings', 'get', 'global', 'transition_animation_scale'])).trim();
      priorAnim = raw.length > 0 && raw !== 'null' ? raw : null;
    } catch {
      priorAnim = null;
    }
    await shell(['shell', 'settings', 'put', 'global', 'transition_animation_scale', '0']);
    // Camera/location pre-grants keep the manual-choice paths deterministic.
    // Manual-success coverage only; denial branches are NOT covered by this.
    for (const perm of ['android.permission.CAMERA', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION']) {
      try {
        await shell(['shell', 'pm', 'grant', 'host.exp.exponent', perm]);
      } catch { /* runtime prompt path remains; steps will show it */ }
    }

    const results = [];
    for (let run = 1; run <= RUNS; run += 1) {
      const before = checks.length;
      await runOnce(run);
      const runChecks = checks.slice(before);
      results.push({ run, steps: runChecks, passed: runChecks.length > 0 && runChecks.every((c) => c.passed) });
    }
    const verdict = summarizeRuns(results.map((r) => ({ passed: r.passed })));
    const summary = {
      date: new Date().toISOString(),
      sourceSha: gitHead(),
      device: await deviceInfo(),
      metro: `exp://${IP}:${EXPO_PORT} (bundle built from the source tree at sourceSha; use the 10.0.2.2 route only, never 10.0.0.2)`,
      backend: 'LAN backend owned by this run (temp DB, SERVE_SIMULATED_DATA=true); live step depends on the Metro-baked API URL',
      runs: results,
      allRunsPassed: verdict.allRunsPassed && results.length === RUNS,
    };
    writeFileSync(join(EVIDENCE, 'native-flow.json'), `${JSON.stringify(summary, null, 2)}\n`);
    const total = checks.length;
    const passed = checks.filter((c) => c.passed).length;
    process.stdout.write(`\n${passed}/${total} checks across ${results.length} run(s); all runs passed: ${summary.allRunsPassed}\n`);
    if (!summary.allRunsPassed) exitCode = 1;
  }
} finally {
  try {
    if (priorAnim === null) {
      await shell(['shell', 'settings', 'delete', 'global', 'transition_animation_scale']);
    } else {
      await shell(['shell', 'settings', 'put', 'global', 'transition_animation_scale', priorAnim]);
    }
  } catch { /* best effort restore */ }
}
process.exitCode = exitCode;
