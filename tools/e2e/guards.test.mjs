#!/usr/bin/env node
/**
 * Pure guard tests for the E2E harness (W4a).
 * No emulator, device, Metro, mock server or backend required:
 *
 *   node --test tools/e2e/guards.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  buildAdbBase,
  DEFAULT_ADB_SERVER_PORT,
  parseOutDir,
  parseRuns,
  resolveAdbTarget,
  resolveOutDir,
  selectDevice,
  summarizeChecks,
  summarizeRuns,
} from './e2e-env.mjs';

const ROOT = join(import.meta.dirname ?? '.', '..', '..');

describe('parseRuns: only finite integers >= 1 pass', () => {
  it('defaults to 3 when --runs is absent', () => {
    assert.deepEqual(parseRuns(['node', 'demo-scenario.mjs']), { ok: true, runs: 3 });
  });
  it('accepts a valid integer', () => {
    assert.deepEqual(parseRuns(['node', 'x.mjs', '--runs', '3']), { ok: true, runs: 3 });
    assert.deepEqual(parseRuns(['node', 'x.mjs', '--runs', '1']), { ok: true, runs: 1 });
  });
  for (const bad of [undefined, '', '  ', 'NaN', 'abc', '3.5', '0', '-1', '-100', 'Infinity', '1e3x']) {
    it(`rejects --runs ${JSON.stringify(bad)}`, () => {
      const argv = bad === undefined
        ? ['node', 'x.mjs', '--runs']
        : ['node', 'x.mjs', '--runs', String(bad)];
      const res = parseRuns(argv);
      assert.equal(res.ok, false, `expected ok:false for ${JSON.stringify(bad)}`);
      assert.equal(res.runs, 0);
      assert.match(res.error, /runs/i);
    });
  }
  it('rejects zero and fractional values explicitly', () => {
    assert.equal(parseRuns(['n', 'x', '--runs', '0']).ok, false);
    assert.equal(parseRuns(['n', 'x', '--runs', '2.0x']).ok, false);
    assert.equal(parseRuns(['n', 'x', '--runs', '2.5']).ok, false);
  });
});

describe('summarizeRuns/summarizeChecks: zero entries never pass', () => {
  it('empty results fail', () => {
    assert.deepEqual(summarizeRuns([]), { total: 0, passed: 0, allRunsPassed: false });
    assert.deepEqual(summarizeChecks([]), { total: 0, passed: 0, allPassed: false });
  });
  it('all passing passes; one failure fails', () => {
    assert.equal(summarizeRuns([{ passed: true }, { passed: true }]).allRunsPassed, true);
    assert.equal(summarizeRuns([{ passed: true }, { passed: false }]).allRunsPassed, false);
    assert.equal(summarizeChecks([{ passed: true }]).allPassed, true);
    assert.equal(summarizeChecks([{ passed: false }]).allPassed, false);
  });
  it('non-array input fails instead of throwing', () => {
    assert.equal(summarizeRuns(undefined).allRunsPassed, false);
    assert.equal(summarizeChecks(null).allPassed, false);
  });
});

describe('resolveOutDir: default never touches committed evidence', () => {
  const fixed = new Date('2026-10-16T10:00:00Z');
  it('defaults under tools/e2e/.runs/', () => {
    const res = resolveOutDir({ argv: [], env: {}, root: ROOT, now: fixed });
    assert.equal(res.ok, true);
    assert.equal(res.explicit, false);
    assert.ok(res.dir.includes(join('tools', 'e2e', '.runs')), res.dir);
    assert.ok(!res.dir.includes('agent_docs'), res.dir);
    assert.ok(!res.dir.includes('evidence'), res.dir);
  });
  it('honours --out-dir', () => {
    const res = resolveOutDir({ argv: ['n', 'x', '--out-dir', 'custom/out'], env: {}, root: ROOT, now: fixed });
    assert.equal(res.ok, true);
    assert.equal(res.explicit, true);
    assert.equal(res.dir, join(ROOT, 'custom', 'out'));
  });
  it('honours E2E_OUT_DIR', () => {
    const res = resolveOutDir({ argv: [], env: { E2E_OUT_DIR: 'env/out' }, root: ROOT, now: fixed });
    assert.equal(res.explicit, true);
    assert.equal(res.dir, join(ROOT, 'env', 'out'));
  });
  it('rejects an empty --out-dir instead of writing somewhere surprising', () => {
    assert.equal(resolveOutDir({ argv: ['n', 'x', '--out-dir'], env: {}, root: ROOT }).ok, false);
    assert.equal(parseOutDir(['n', 'x', '--out-dir']), '');
    assert.equal(parseOutDir(['n', 'x']), undefined);
  });
});

describe('resolveAdbTarget: portable SDK/adb/device/port', () => {
  it('uses the standard 5037 adb server port by default', () => {
    const res = resolveAdbTarget({ env: {}, platform: 'linux' });
    assert.equal(res.ok, true);
    assert.equal(res.serverPort, DEFAULT_ADB_SERVER_PORT);
    assert.equal(res.serverPort, 5037);
  });
  it('has no hard-coded device serial by default', () => {
    assert.equal(resolveAdbTarget({ env: {}, platform: 'linux' }).serial, null);
    assert.equal(resolveAdbTarget({ env: {}, platform: 'win32' }).serial, null);
  });
  it('prefers ANDROID_SDK_ROOT, honours serial + port + metro overrides', () => {
    const res = resolveAdbTarget({
      env: {
        ANDROID_SDK_ROOT: '/sdk',
        ANDROID_SERIAL: 'emulator-5554',
        ANDROID_ADB_SERVER_PORT: '5038',
        NGOKE_DEV_HOST: '10.0.0.2',
        NGOKE_EXPO_PORT: '8091',
      },
      platform: 'linux',
    });
    assert.equal(res.ok, true);
    assert.equal(res.adbBin, join('/sdk', 'platform-tools', 'adb'));
    assert.equal(res.serial, 'emulator-5554');
    assert.equal(res.serverPort, 5038);
    assert.equal(res.metroHost, '10.0.0.2');
    assert.equal(res.metroPort, 8091);
  });
  it('uses adb.exe on Windows and plain adb on POSIX', () => {
    assert.match(resolveAdbTarget({ env: { ANDROID_SDK_ROOT: 'C:\\sdk' }, platform: 'win32' }).adbBin, /adb\.exe$/);
    assert.ok(!resolveAdbTarget({ env: { ANDROID_SDK_ROOT: '/sdk' }, platform: 'linux' }).adbBin.endsWith('.exe'));
  });
  it('rejects invalid ports instead of silently using them', () => {
    assert.equal(resolveAdbTarget({ env: { ANDROID_ADB_SERVER_PORT: 'abc' }, platform: 'linux' }).ok, false);
    assert.equal(resolveAdbTarget({ env: { NGOKE_EXPO_PORT: '0' }, platform: 'linux' }).ok, false);
  });
});

describe('buildAdbBase/selectDevice: explicit device selection', () => {
  it('omits -s when no serial is known', () => {
    assert.deepEqual(buildAdbBase({ adbBin: 'adb', serverPort: 5037, serial: null }), ['adb', '-P', '5037']);
  });
  it('pins -s when a serial is known', () => {
    assert.deepEqual(
      buildAdbBase({ adbBin: 'adb', serverPort: 5037, serial: 'emulator-5554' }),
      ['adb', '-P', '5037', '-s', 'emulator-5554'],
    );
  });
  const header = 'List of devices attached\n';
  it('fails with zero devices', () => {
    const res = selectDevice(`${header}\n`, null);
    assert.equal(res.ok, false);
    assert.match(res.error, /no adb devices/i);
  });
  it('auto-picks a single device', () => {
    assert.deepEqual(selectDevice(`${header}emulator-5554\tdevice\n`, null), { ok: true, serial: 'emulator-5554' });
  });
  it('fails on multiple devices without an explicit serial', () => {
    const res = selectDevice(`${header}emulator-5554\tdevice\nemulator-5556\tdevice\n`, null);
    assert.equal(res.ok, false);
    assert.match(res.error, /multiple adb devices/i);
  });
  it('honours an explicit serial and rejects unknown ones', () => {
    const out = `${header}emulator-5554\tdevice\nemulator-5556\tdevice\n`;
    assert.deepEqual(selectDevice(out, 'emulator-5556'), { ok: true, serial: 'emulator-5556' });
    assert.equal(selectDevice(out, 'ghost-0000').ok, false);
  });
  it('ignores unauthorized/offline entries', () => {
    const res = selectDevice(`${header}emulator-5554\tunauthorized\n`, null);
    assert.equal(res.ok, false);
  });
});
