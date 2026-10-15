#!/usr/bin/env node
/**
 * Shared E2E guard helpers (Phase 7.1/8, W4a).
 *
 * Pure, dependency-free helpers so they can be unit-tested with
 * `node --test` without an emulator, device, Metro or backend:
 *
 * - parseRuns(): --runs must be a finite integer >= 1. A missing value,
 *   NaN, 0, negative or fractional value is an error and must never
 *   report a pass.
 * - summarizeRuns(): an empty result set never passes (kills the
 *   `results.every()` vacuous-truth false pass).
 * - resolveOutDir(): default output goes to a fresh gitignored folder
 *   under tools/e2e/.runs/ so committed evidence under
 *   agent_docs/evidence/ is never overwritten. An explicit --out-dir
 *   (or E2E_OUT_DIR) is honoured verbatim.
 * - resolveAdbTarget()/selectDevice(): portable SDK/adb/device/port
 *   resolution with no hard-coded serial. Zero devices or ambiguous
 *   devices without an explicit serial is an error, never a pass.
 */

import { join } from 'node:path';

export const DEFAULT_RUNS = 3;
export const DEFAULT_ADB_SERVER_PORT = 5037;
export const DEFAULT_METRO_PORT = 8085;

/**
 * Parse `--runs <n>` from argv.
 * Flag absent -> default (ok). Flag present but value missing/invalid ->
 * { ok: false }. Valid means Number.isInteger(n) && n >= 1 && finite.
 */
export function parseRuns(argv, defaultRuns = DEFAULT_RUNS) {
  const args = Array.isArray(argv) ? [...argv] : [];
  const idx = args.indexOf('--runs');
  if (idx === -1) {
    return Number.isInteger(defaultRuns) && defaultRuns >= 1
      ? { ok: true, runs: defaultRuns }
      : { ok: false, runs: 0, error: `invalid default runs: ${String(defaultRuns)}` };
  }
  const raw = args[idx + 1];
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return { ok: false, runs: 0, error: 'missing value for --runs (expected an integer >= 1)' };
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    return { ok: false, runs: 0, error: `invalid --runs value: ${JSON.stringify(String(raw))} (expected an integer >= 1)` };
  }
  return { ok: true, runs: n };
}

/** Fail with exit code 2 and never write a pass artefact. */
export function exitBadRuns(error) {
  process.stderr.write(`ERROR: ${error}\nRefusing to report a pass with zero/invalid runs.\n`);
  process.exit(2);
}

/**
 * Summarize per-run step results. Empty input never passes.
 * Each entry: { passed: boolean } (extra fields ignored).
 */
export function summarizeRuns(results) {
  const list = Array.isArray(results) ? results : [];
  const total = list.length;
  const passed = list.filter((entry) => entry && entry.passed).length;
  const allRunsPassed = total > 0 && passed === total;
  return { total, passed, allRunsPassed };
}

/**
 * Summarize flat check results (phase7-checks style).
 * Empty input never passes.
 */
export function summarizeChecks(checks) {
  const list = Array.isArray(checks) ? checks : [];
  const total = list.length;
  const passed = list.filter((entry) => entry && entry.passed).length;
  const allPassed = total > 0 && passed === total;
  return { total, passed, allPassed };
}

/** Extract `--out-dir <path>` from argv (undefined when absent). */
export function parseOutDir(argv) {
  const args = Array.isArray(argv) ? [...argv] : [];
  const idx = args.indexOf('--out-dir');
  if (idx === -1) return undefined;
  const raw = args[idx + 1];
  if (raw === undefined || String(raw).trim() === '') return '';
  return String(raw);
}

function stamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Resolve the output directory.
 * Default: <repoRoot>/tools/e2e/.runs/<stamp>/ (gitignored, never the
 * committed agent_docs/evidence tree). Explicit --out-dir or E2E_OUT_DIR
 * wins and is returned verbatim (relative paths resolved from repoRoot).
 */
export function resolveOutDir({ argv = [], env = {}, root, now = new Date() } = {}) {
  const repoRoot = root ?? process.cwd();
  const flag = parseOutDir(argv);
  const fromEnv = env.E2E_OUT_DIR ?? process.env.E2E_OUT_DIR;
  const explicit = flag !== undefined ? flag : fromEnv;
  if (explicit !== undefined) {
    if (String(explicit).trim() === '') {
      return { ok: false, dir: '', error: 'empty --out-dir/E2E_OUT_DIR' };
    }
    const raw = String(explicit);
    const absolute = /^(?:[a-zA-Z]:[\\/]|\\\\)/.test(raw) || raw.startsWith('/')
      ? raw
      : join(repoRoot, raw);
    return { ok: true, dir: absolute, explicit: true };
  }
  return { ok: true, dir: join(repoRoot, 'tools', 'e2e', '.runs', stamp(now)), explicit: false };
}

/**
 * Portable SDK/adb/device/port resolution. No hard-coded device serial.
 * Pure: pass env/platform explicitly for tests; defaults read process.env.
 */
export function resolveAdbTarget({ env = process.env, platform = process.platform } = {}) {
  const get = (name) => env?.[name];
  let sdkDir = get('ANDROID_SDK_ROOT') ?? get('ANDROID_HOME') ?? get('ANDROID_SDK') ?? null;
  if (!sdkDir) {
    if (platform === 'win32') {
      sdkDir = get('LOCALAPPDATA') ? join(get('LOCALAPPDATA'), 'Android', 'Sdk') : 'C:\\Android\\Sdk';
    } else if (platform === 'darwin') {
      sdkDir = join(get('HOME') ?? '', 'Library', 'Android', 'sdk');
    } else {
      sdkDir = join(get('HOME') ?? '', 'Android', 'Sdk');
    }
  }
  const adbBin =
    get('ANDROID_ADB_BIN') ??
    get('NGOKE_ADB_BIN') ??
    (sdkDir ? join(sdkDir, 'platform-tools', platform === 'win32' ? 'adb.exe' : 'adb') : 'adb');
  const serial = get('ANDROID_SERIAL') ?? get('NGOKE_ADB_SERIAL') ?? null;
  const rawPort = get('ANDROID_ADB_SERVER_PORT') ?? get('NGOKE_ADB_SERVER_PORT');
  let serverPort = DEFAULT_ADB_SERVER_PORT;
  if (rawPort !== undefined && String(rawPort).trim() !== '') {
    const n = Number(rawPort);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      return { ok: false, error: `invalid adb server port: ${JSON.stringify(String(rawPort))}` };
    }
    serverPort = n;
  }
  const metroHost = get('NGOKE_DEV_HOST') ?? '127.0.0.1';
  const rawMetro = get('NGOKE_EXPO_PORT') ?? get('EXPO_PORT');
  let metroPort = DEFAULT_METRO_PORT;
  if (rawMetro !== undefined && String(rawMetro).trim() !== '') {
    const n = Number(rawMetro);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      return { ok: false, error: `invalid metro port: ${JSON.stringify(String(rawMetro))}` };
    }
    metroPort = n;
  }
  return { ok: true, sdkDir, adbBin, serial, serverPort, metroHost, metroPort };
}

/** Build the adb base argv: [bin, -P, port, (-s serial)?]. Null serial -> no -s flag. */
export function buildAdbBase({ adbBin, serverPort, serial } = {}) {
  const base = [adbBin ?? 'adb', '-P', String(serverPort ?? DEFAULT_ADB_SERVER_PORT)];
  if (serial) base.push('-s', String(serial));
  return base;
}

/**
 * Parse `adb devices` output and pick a device.
 * Zero devices -> error. Multiple without preferredSerial -> error
 * (ambiguous). Unknown preferredSerial -> error. Never silently picks.
 */
export function selectDevice(devicesOutput, preferredSerial = null) {
  const lines = String(devicesOutput ?? '').split('\n').slice(1);
  const devices = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2 && parts[1] === 'device') devices.push(parts[0]);
  }
  if (preferredSerial) {
    if (devices.includes(String(preferredSerial))) return { ok: true, serial: String(preferredSerial) };
    return { ok: false, serial: null, error: `preferred device ${JSON.stringify(String(preferredSerial))} not connected` };
  }
  if (devices.length === 1) return { ok: true, serial: devices[0] };
  if (devices.length === 0) {
    return { ok: false, serial: null, error: 'no adb devices connected (connect one emulator/device or set ANDROID_SERIAL)' };
  }
  return { ok: false, serial: null, error: `multiple adb devices (${devices.join(', ')}); set ANDROID_SERIAL to choose one` };
}
