import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { backup } from 'node:sqlite';
import { openDatabase, readDataset, readLocalizedPair } from '../src/database.mjs';

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

test('import-localized backs up and restores both canonical locale rows before replacement', async (t) => {
  const { path, dir, run } = fixture(t);
  const vi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
  const en = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));
  const viPath = join(dir, 'old-quarter.vi.json');
  const enPath = join(dir, 'old-quarter.en.json');
  writeFileSync(viPath, JSON.stringify(vi));
  writeFileSync(enPath, JSON.stringify(en));
  assert.equal(run('setup').status, 0);

  const first = run('import-localized', '--vi', viPath, '--en', enPath);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Backup created:/);
  const original = openDatabase(path);
  let originalPair;
  try {
    originalPair = readLocalizedPair(original);
    assert.equal(original.prepare('SELECT count(*) AS n FROM publication_v2').get().n, 2);
    assert.deepEqual(readDataset(original), sample);
  } finally {
    original.close();
  }

  const changedEn = structuredClone(en);
  changedEn.intro.text += ' Replacement revision.';
  writeFileSync(enPath, JSON.stringify(changedEn));
  assert.equal(run('import-localized', '--vi', viPath, '--en', enPath).status, 1);
  let unchanged = openDatabase(path);
  try {
    assert.equal(readLocalizedPair(unchanged).en.sha256, originalPair.en.sha256);
  } finally {
    unchanged.close();
  }

  const replaced = run('import-localized', '--vi', viPath, '--en', enPath, '--replace');
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.match(replaced.stdout, /Backup created:/);
  const backups = readdirSync(dir).filter((name) => name.startsWith('db.sqlite.backup-')).sort();
  assert.ok(backups.length >= 2);
  const backupDb = openDatabase(join(dir, backups.at(-1)));
  const restorePath = join(dir, 'restored.sqlite');
  try {
    await backup(backupDb, restorePath);
  } finally {
    backupDb.close();
  }
  const restored = openDatabase(restorePath);
  try {
    const restoredPair = readLocalizedPair(restored);
    assert.equal(restored.prepare('SELECT count(*) AS n FROM publication_v2').get().n, 2);
    assert.equal(restoredPair.vi.sha256, originalPair.vi.sha256);
    assert.equal(restoredPair.en.sha256, originalPair.en.sha256);
    assert.deepEqual(readDataset(restored), sample);
  } finally {
    restored.close();
  }
});

test('migrating a populated 001 database backs up first; startup leaves 001 unmigrated', async (t) => {
  const { path, dir, run } = fixture(t);
  assert.equal(run('setup').status, 0);
  let legacy = openDatabase(path);
  legacy.exec('DROP TABLE publication_v2; DELETE FROM schema_migrations WHERE version = 2');
  legacy.close();

  const start = spawnSync(process.execPath, [join(root, 'src/server.mjs')], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, DB_PATH: path },
    timeout: 3000,
  });
  assert.equal(start.status, 1);
  legacy = openDatabase(path);
  assert.deepEqual(legacy.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(({ version }) => version), [1]);
  legacy.close();

  const migrated = run('migrate');
  assert.equal(migrated.status, 0, migrated.stderr);
  assert.match(migrated.stdout, /Backup created:/);
  const backupName = readdirSync(dir).find((name) => name.startsWith('db.sqlite.backup-'));
  assert.ok(backupName);
  const backupDb = openDatabase(join(dir, backupName));
  const restorePath = join(dir, 'restored-001.sqlite');
  try {
    assert.equal(backupDb.prepare('SELECT count(*) AS n FROM dataset').get().n, 1);
    assert.equal(backupDb.prepare('SELECT count(*) AS n FROM nodes').get().n, 6);
    await backup(backupDb, restorePath);
  } finally {
    backupDb.close();
  }
  const restored = openDatabase(restorePath);
  try {
    const v1RowsBeforeMigration = restored.prepare('SELECT id, schema_version, kind, disclaimer, start_node_id FROM dataset').get();
    assert.equal(v1RowsBeforeMigration.id, 1);
    assert.equal(v1RowsBeforeMigration.kind, 'simulated');
    assert.equal(restored.prepare('SELECT count(*) AS n FROM nodes').get().n, 6);
    // Restore rehearsal migrates only this temporary copy so the V1 reader can verify exact content.
    const { migrate } = await import('../src/database.mjs');
    migrate(restored);
    assert.deepEqual(readDataset(restored), sample);
  } finally {
    restored.close();
  }
  const current = openDatabase(path);
  try {
    assert.deepEqual(readDataset(current), sample);
  } finally {
    current.close();
  }
});

test('localized CLI rejects a raw per-locale UTF-8 body over 512 KiB', (t) => {
  const { dir, run } = fixture(t);
  assert.equal(run('setup').status, 0);
  const viPath = join(dir, 'too-large.vi.json');
  const enPath = join(dir, 'small.en.json');
  writeFileSync(viPath, ' '.repeat(512 * 1024 + 1));
  writeFileSync(enPath, '{}');
  const result = run('import-localized', '--vi', viPath, '--en', enPath);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /512 KiB/);
});
