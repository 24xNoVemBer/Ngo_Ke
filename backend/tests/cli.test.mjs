import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, readDataset } from '../src/database.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sample = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'ngoke-cli-test-'));
  const path = join(dir, 'db.sqlite');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  function run(...args) {
    return spawnSync(process.execPath, [join(root, 'src/cli.mjs'), ...args], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, DB_PATH: path, SERVE_SIMULATED_DATA: 'false' },
    });
  }
  return { dir, path, run };
}

test('setup seeds once; repeat setup and seed preserve existing edits', (t) => {
  const { path, run } = fixture(t);
  assert.equal(existsSync(path), false);
  assert.equal(run('setup').status, 0);
  let db = openDatabase(path);
  db.prepare('UPDATE nodes SET name = ? WHERE id = ?').run('User edit', 'demo-01');
  db.close();
  assert.equal(run('setup').status, 0);
  assert.equal(run('seed').status, 0);
  db = openDatabase(path);
  try {
    assert.equal(readDataset(db).nodes[0].name, 'User edit');
  } finally {
    db.close();
  }
});

test('migrate does not seed, and server startup does not create a missing database', (t) => {
  const { path, dir, run } = fixture(t);
  const start = spawnSync(process.execPath, [join(root, 'src/server.mjs')], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, DB_PATH: path },
    timeout: 3000,
  });
  assert.equal(start.status, 1);
  assert.equal(existsSync(path), false);
  assert.equal(run('migrate').status, 0);
  const db = openDatabase(path);
  try {
    assert.equal(readDataset(db), undefined);
  } finally {
    db.close();
  }
});

test('replace makes a restorable SQLite backup before replacing data', (t) => {
  const { dir, path, run } = fixture(t);
  assert.equal(run('setup').status, 0);
  const replacement = structuredClone(sample);
  replacement.nodes[0].name = 'Replacement';
  const input = join(dir, 'replacement.json');
  writeFileSync(input, JSON.stringify(replacement));
  assert.equal(run('import', input).status, 1);
  const result = run('import', input, '--replace');
  assert.equal(result.status, 0, result.stderr);

  const backupName = readdirSync(dir).find((name) => name.startsWith('db.sqlite.backup-'));
  assert.ok(backupName);
  const current = openDatabase(path);
  const saved = openDatabase(join(dir, backupName));
  try {
    assert.equal(readDataset(current).nodes[0].name, 'Replacement');
    assert.deepEqual(readDataset(saved), sample);
  } finally {
    current.close();
    saved.close();
  }
});

test('invalid replacement is rejected without losing the current dataset', (t) => {
  const { path, dir, run } = fixture(t);
  assert.equal(run('setup').status, 0);
  const invalid = structuredClone(sample);
  invalid.qa[0].evidence = [];
  const input = join(dir, 'invalid.json');
  writeFileSync(input, JSON.stringify(invalid));
  assert.equal(run('import', input, '--replace').status, 1);
  const db = openDatabase(path);
  try {
    assert.deepEqual(readDataset(db), sample);
  } finally {
    db.close();
  }
});

test('reviewed import requires acknowledgement and validates metadata', (t) => {
  const { path, dir, run } = fixture(t);
  assert.equal(run('setup').status, 0);
  const reviewed = structuredClone(sample);
  reviewed.kind = 'reviewed';
  reviewed.intro.reviewStatus = 'approved';
  reviewed.intro.updatedAt = '2026-10-16T00:00:00.000Z';
  reviewed.nodes.forEach((node) => Object.assign(node, { reviewStatus: 'approved', updatedAt: reviewed.intro.updatedAt }));
  reviewed.qa.forEach((entry) => Object.assign(entry, { reviewStatus: 'approved', updatedAt: reviewed.intro.updatedAt }));
  const input = join(dir, 'reviewed.json');
  writeFileSync(input, JSON.stringify(reviewed));
  assert.equal(run('import', input, '--replace').status, 1);
  const result = run('import', input, '--reviewed', '--replace');
  assert.equal(result.status, 0, result.stderr);
  const db = openDatabase(path);
  try {
    assert.deepEqual(readDataset(db), reviewed);
  } finally {
    db.close();
  }
});
