import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase, migrate, importDataset, readDataset } from '../src/database.mjs';
import { parseDataset } from '../../mobile/src/data/sourceState.ts';

const sample = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

function database(t) {
  const dir = mkdtempSync(join(tmpdir(), 'ngoke-db-test-'));
  const path = join(dir, 'db', 'test.sqlite');
  const db = openDatabase(path);
  t.after(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { db, path };
}

test('migration is repeatable and imported content survives reopening', (t) => {
  const { db, path } = database(t);
  migrate(db);
  migrate(db);
  assert.equal(readDataset(db), undefined);
  assert.equal(importDataset(db, sample), true);
  assert.equal(importDataset(db, sample), false);
  assert.deepEqual(readDataset(db), sample);
  assert.equal(db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n, 1);
  const reopened = openDatabase(path);
  try {
    assert.deepEqual(readDataset(reopened), sample);
  } finally {
    reopened.close();
  }
});

test('invalid import and SQL constraint failures preserve existing content', (t) => {
  const { db } = database(t);
  migrate(db);
  importDataset(db, sample);

  const invalid = structuredClone(sample);
  invalid.qa[0].evidence = [];
  assert.throws(() => importDataset(db, invalid, { replace: true }), /dataset/i);
  assert.deepEqual(readDataset(db), sample);

  db.exec("CREATE TRIGGER reject_qa BEFORE INSERT ON qa BEGIN SELECT RAISE(ABORT, 'test write failure'); END");
  assert.throws(() => importDataset(db, sample, { replace: true }), /test write failure/);
  assert.deepEqual(readDataset(db), sample);
});

test('foreign keys and prepared queries keep injected identifiers inert', (t) => {
  const { db } = database(t);
  migrate(db);
  importDataset(db, sample);
  assert.throws(() => db.prepare('UPDATE qa SET node_id = ? WHERE id = ?').run('missing', 'qa-01'), /FOREIGN KEY/);
  assert.equal(db.prepare('SELECT id FROM nodes WHERE id = ?').get("' OR 1=1 --"), undefined);
  assert.equal(readDataset(db).nodes.length, 6);
});

test('seed cannot erase orphaned user content', (t) => {
  const { db } = database(t);
  migrate(db);
  importDataset(db, sample);
  db.prepare('UPDATE nodes SET name = ? WHERE id = ?').run('Recoverable edit', 'demo-01');
  db.exec('DELETE FROM dataset');
  assert.throws(() => importDataset(db, sample), /orphan/i);
  assert.equal(db.prepare('SELECT name FROM nodes WHERE id = ?').get('demo-01').name, 'Recoverable edit');
});

test('live parser rejects payloads above the shared byte and record limits', () => {
  const oversized = structuredClone(sample);
  oversized.disclaimer = 'x'.repeat(600 * 1024);
  assert.equal(parseDataset(oversized, { mode: 'live' }), undefined);

  const tooManyNodes = structuredClone(sample);
  tooManyNodes.nodes = Array.from({ length: 51 }, (_, i) => ({ ...sample.nodes[0], id: 'node-' + i }));
  assert.equal(parseDataset(tooManyNodes, { mode: 'live' }), undefined);
});

test('review metadata survives the SQLite roundtrip without changing its values', (t) => {
  const { db } = database(t);
  migrate(db);
  const reviewed = structuredClone(sample);
  reviewed.kind = 'reviewed';
  reviewed.intro.reviewStatus = 'approved';
  reviewed.intro.updatedAt = '2026-10-16T00:00:00.000Z';
  reviewed.nodes.forEach((node) => Object.assign(node, { reviewStatus: 'approved', updatedAt: reviewed.intro.updatedAt }));
  reviewed.qa.forEach((entry) => Object.assign(entry, { reviewStatus: 'approved', updatedAt: reviewed.intro.updatedAt }));
  assert.equal(importDataset(db, reviewed), true);
  assert.deepEqual(readDataset(db), reviewed);
});
