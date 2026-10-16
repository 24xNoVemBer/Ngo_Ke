import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { backup } from 'node:sqlite';
import { canonicalDatasetJson } from '../../mobile/src/data/canonicalJson.ts';
import { MAX_BODY_BYTES } from '../../mobile/src/data/sourceState.ts';
import { createApp } from '../src/app.mjs';
import {
  openDatabase, migrate, needsMigration, importDataset, prepareLocalizedPair,
  importLocalizedPair, readDataset, readLocalizedPair,
} from '../src/database.mjs';

const demo = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
const pilotVi = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.vi.json', import.meta.url), 'utf8'));
const pilotEn = JSON.parse(readFileSync(new URL('../../data/localized/old-quarter.en.json', import.meta.url), 'utf8'));

function database(t, { seedV1 = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ngoke-localized-test-'));
  const path = join(dir, 'db.sqlite');
  const db = openDatabase(path);
  migrate(db);
  if (seedV1) importDataset(db, demo);
  t.after(() => {
    try { db.close(); } catch { /* A closed-handle error is exercised by the HTTP test. */ }
    rmSync(dir, { recursive: true, force: true });
  });
  return { db, dir, path };
}

async function running(t, { db, simulated = false } = {}) {
  const server = createApp({ db, serveSimulatedData: simulated });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    });
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(path, init) {
    const response = await fetch(base + path, init);
    return { status: response.status, body: await response.json(), headers: response.headers };
  }
  return { request };
}

test('one canonical VI/EN pilot pair publishes atomically and preserves the V1 dataset', (t) => {
  const { db } = database(t, { seedV1: true });
  const v1Before = readDataset(db);
  const pair = prepareLocalizedPair(pilotVi, pilotEn);
  assert.equal(pair.collectionId, 'old-quarter-pilot');
  assert.equal(importLocalizedPair(db, pair), true);
  assert.equal(importLocalizedPair(db, pair), false);
  const saved = readLocalizedPair(db);
  assert.equal(saved.vi.sha256, pair.viSha256);
  assert.equal(saved.en.sha256, pair.enSha256);
  assert.equal(db.prepare('SELECT count(*) AS n FROM publication_v2').get().n, 2);
  assert.deepEqual(saved.vi.dataset, pilotVi);
  assert.deepEqual(saved.en.dataset, pilotEn);
  assert.deepEqual(readDataset(db), v1Before);
});

test('pair identity and the exact UTF-8 body boundary are enforced before writes', (t) => {
  const { db } = database(t);
  const mismatch = structuredClone(pilotEn);
  mismatch.nodes[0].visitMinutes += 1;
  assert.throws(() => prepareLocalizedPair(pilotVi, mismatch), /pair/i);
  assert.equal(db.prepare('SELECT count(*) AS n FROM publication_v2').get().n, 0);

  const vi = structuredClone(pilotVi);
  const en = structuredClone(pilotEn);
  const baseQa = vi.qa[0];
  const makeQa = (source, index) => ({
    ...source,
    id: `boundary-${index}`,
    nodeId: vi.nodes[0].id,
    question: `Boundary question ${index}`,
    answer: `Boundary answer ${index}`,
    aliases: Array.from({ length: 7 }, (_, alias) => `boundary-alias-${index}-${alias}`),
    evidence: Array(20).fill('x'),
    followUps: [],
    tags: baseQa.tags,
  });
  vi.qa = Array.from({ length: 13 }, (_, index) => makeQa(baseQa, index));
  en.qa = Array.from({ length: 13 }, (_, index) => makeQa(pilotEn.qa[0], index));
  const baseline = Buffer.byteLength(canonicalDatasetJson(vi), 'utf8');
  let remaining = MAX_BODY_BYTES - baseline;
  assert.ok(remaining > 0);
  for (const qa of vi.qa) {
    for (const index of qa.evidence.keys()) {
      const extra = Math.min(1999, remaining);
      qa.evidence[index] = 'x'.repeat(1 + extra);
      remaining -= extra;
    }
  }
  assert.equal(remaining, 0);
  assert.equal(Buffer.byteLength(canonicalDatasetJson(vi), 'utf8'), MAX_BODY_BYTES);
  assert.equal(prepareLocalizedPair(vi, en).viSha256.length, 64);
  const partialQa = vi.qa.find((qa) => qa.evidence.some((text) => text.length < 2000));
  const partialIndex = partialQa.evidence.findIndex((text) => text.length < 2000);
  partialQa.evidence[partialIndex] += 'x';
  assert.throws(() => prepareLocalizedPair(vi, en), /512 KiB/);
});

test('replacement requires opt-in and a failed two-row transaction keeps both old locales', (t) => {
  const { db } = database(t, { seedV1: true });
  const original = prepareLocalizedPair(pilotVi, pilotEn);
  importLocalizedPair(db, original);
  const changedEn = structuredClone(pilotEn);
  changedEn.intro.text += ' Revised.';
  const changed = prepareLocalizedPair(pilotVi, changedEn);
  assert.throws(() => importLocalizedPair(db, changed), /--replace/);
  assert.deepEqual(readLocalizedPair(db).en.dataset, pilotEn);

  db.exec("CREATE TRIGGER reject_english BEFORE INSERT ON publication_v2 WHEN NEW.locale = 'en' BEGIN SELECT RAISE(ABORT, 'test write failure'); END");
  assert.throws(() => importLocalizedPair(db, changed, { replace: true }), /test write failure/);
  db.exec('DROP TRIGGER reject_english');
  assert.deepEqual(readLocalizedPair(db).vi.dataset, pilotVi);
  assert.deepEqual(readLocalizedPair(db).en.dataset, pilotEn);
  assert.deepEqual(readDataset(db), demo);

  assert.equal(importLocalizedPair(db, changed, { replace: true }), true);
  assert.equal(readLocalizedPair(db).en.dataset.intro.text, changedEn.intro.text);
});

test('migration 001 to 002 is atomic, repeatable, and refuses future schema versions', (t) => {
  const { db } = database(t, { seedV1: true });
  db.exec('DROP TABLE publication_v2; DELETE FROM schema_migrations WHERE version = 2');
  const before = db.prepare('SELECT count(*) AS n FROM dataset').get().n;
  db.exec("CREATE TRIGGER reject_migration BEFORE INSERT ON schema_migrations WHEN NEW.version = 2 BEGIN SELECT RAISE(ABORT, 'migration failure'); END");
  assert.equal(needsMigration(db), true);
  assert.throws(() => migrate(db), /migration failure/);
  assert.deepEqual(db.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(({ version }) => version), [1]);
  assert.equal(db.prepare("SELECT count(*) AS n FROM sqlite_schema WHERE type = 'table' AND name = 'publication_v2'").get().n, 0);
  assert.equal(db.prepare('SELECT count(*) AS n FROM dataset').get().n, before);
  db.exec('DROP TRIGGER reject_migration');
  migrate(db);
  migrate(db);
  assert.equal(needsMigration(db), false);
  assert.deepEqual(readDataset(db), demo);

  const future = openDatabase(':memory:');
  t.after(() => future.close());
  future.exec("CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT; INSERT INTO schema_migrations VALUES (3, 'future')");
  assert.throws(() => needsMigration(future), /newer/);
  assert.throws(() => migrate(future), /newer/);
  assert.deepEqual(future.prepare('SELECT version FROM schema_migrations').all().map(({ version }) => version), [3]);
  assert.equal(future.prepare("SELECT count(*) AS n FROM sqlite_schema WHERE type = 'table' AND name = 'publication_v2'").get().n, 0);
});

test('localized HTTP returns one requested language, revision metadata, and unchanged V1 responses', async (t) => {
  const { db } = database(t, { seedV1: true });
  const pair = prepareLocalizedPair(pilotVi, pilotEn);
  importLocalizedPair(db, pair);
  const { request } = await running(t, { db, simulated: true });

  const en = await request('/api/v2/dataset?locale=en');
  assert.equal(en.status, 200);
  assert.equal(en.headers.get('content-language'), 'en');
  assert.deepEqual(en.body, pilotEn);
  const vi = await request('/api/v2/dataset?locale=vi');
  assert.equal(vi.status, 200);
  assert.equal(vi.headers.get('content-language'), 'vi');
  assert.deepEqual(vi.body, pilotVi);
  assert.deepEqual((await request('/api/v2/ready?locale=en')).body, {
    status: 'ready', database: 'ok', dataset: 'reviewed', locale: 'en',
    collectionId: pair.collectionId, revision: pair.enSha256,
  });
  assert.deepEqual((await request('/api/dataset')).body, demo);
  assert.deepEqual((await request('/api/ready')).body, { status: 'ready', database: 'ok', dataset: 'simulated' });
});

test('simulated localized data follows the existing opt-in policy', async (t) => {
  const vi = structuredClone(pilotVi);
  const en = structuredClone(pilotEn);
  vi.kind = 'simulated';
  en.kind = 'simulated';
  const { db } = database(t);
  importLocalizedPair(db, prepareLocalizedPair(vi, en));
  const hidden = await running(t, { db });
  assert.equal((await hidden.request('/api/v2/dataset?locale=en')).status, 404);
  assert.equal((await hidden.request('/api/v2/ready?locale=en')).status, 503);
  const notReady = await hidden.request('/api/v2/ready?locale=en');
  assert.equal(notReady.body.error.code, 'NO_REVIEWED_DATA');
  assert.equal(notReady.body.locale, 'en');

  const visible = await running(t, { db, simulated: true });
  assert.equal((await visible.request('/api/v2/dataset?locale=en')).body.kind, 'simulated');
  assert.equal((await visible.request('/api/v2/ready?locale=en')).status, 200);
});

test('localized reads reject empty, partial, mismatched, corrupt, and hash-invalid publication states', async (t) => {
  const { db } = database(t);
  const empty = await running(t, { db });
  assert.equal((await empty.request('/api/v2/dataset?locale=en')).body.error.code, 'NO_REVIEWED_DATA');

  const pair = prepareLocalizedPair(pilotVi, pilotEn);
  importLocalizedPair(db, pair);
  db.prepare("DELETE FROM publication_v2 WHERE locale = 'vi'").run();
  assert.equal((await empty.request('/api/v2/dataset?locale=en')).body.error.code, 'DATASET_INVALID');
  db.prepare('DELETE FROM publication_v2').run();
  importLocalizedPair(db, pair);

  db.prepare("UPDATE publication_v2 SET collection_id = 'other-collection' WHERE locale = 'en'").run();
  assert.equal((await empty.request('/api/v2/dataset?locale=en')).body.error.code, 'DATASET_INVALID');
  db.prepare("UPDATE publication_v2 SET collection_id = 'old-quarter-pilot' WHERE locale = 'en'").run();

  const mismatchedEn = structuredClone(pilotEn);
  mismatchedEn.nodes[0].visitMinutes += 1;
  const mismatchedJson = canonicalDatasetJson(mismatchedEn);
  const mismatchedHash = createHash('sha256').update(mismatchedJson, 'utf8').digest('hex');
  db.prepare("UPDATE publication_v2 SET payload_json = ?, payload_sha256 = ? WHERE locale = 'en'").run(mismatchedJson, mismatchedHash);
  assert.equal((await empty.request('/api/v2/dataset?locale=en')).body.error.code, 'DATASET_INVALID');
  db.prepare("UPDATE publication_v2 SET payload_json = ?, payload_sha256 = ? WHERE locale = 'en'").run(pair.enJson, pair.enSha256);

  db.prepare("UPDATE publication_v2 SET payload_sha256 = '" + '0'.repeat(64) + "' WHERE locale = 'en'").run();
  assert.equal((await empty.request('/api/v2/ready?locale=en')).status, 503);
  assert.equal((await empty.request('/api/v2/ready?locale=en')).body.error.code, 'DATASET_INVALID');
});

test('localized query validation, GET-only methods, schema errors, and database access errors are explicit', async (t) => {
  const { db } = database(t);
  const { request } = await running(t, { db });
  for (const path of [
    '/api/v2/dataset', '/api/v2/dataset?locale=fr', '/api/v2/dataset?locale=en&locale=vi',
    '/api/v2/dataset?locale=en&extra=1', '/api/v2/ready?locale=vi&locale=vi',
  ]) {
    const response = await request(path);
    assert.equal(response.status, 400, path);
    assert.equal(response.body.error.code, 'INVALID_INPUT');
  }
  const post = await request('/api/v2/dataset?locale=en', { method: 'POST', body: '{}' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET');

  db.prepare('DELETE FROM schema_migrations WHERE version = 2').run();
  assert.equal((await request('/api/v2/dataset?locale=en')).body.error.code, 'DATASET_INVALID');
  db.close();
  assert.equal((await request('/api/v2/ready?locale=en')).body.error.code, 'DATABASE_UNAVAILABLE');
});

test('persisted JSON corruption returns a bounded DATASET_INVALID envelope', async (t) => {
  const { db } = database(t);
  importLocalizedPair(db, prepareLocalizedPair(pilotVi, pilotEn));
  const { request } = await running(t, { db });
  const response = await request('/api/v2/dataset?locale=vi');
  assert.equal(response.status, 200);

  db.prepare("UPDATE publication_v2 SET payload_json = '{}' WHERE locale = 'vi'").run();
  const broken = await request('/api/v2/dataset?locale=vi');
  assert.equal(broken.status, 503);
  assert.deepEqual(broken.body, {
    error: { code: 'DATASET_INVALID', message: 'Published dataset is invalid' }, locale: 'vi',
  });
  assert.doesNotMatch(JSON.stringify(broken.body), /sqlite|stack|path|Báº¡ch/);
  db.exec('DROP TABLE publication_v2');
  const missingTable = await request('/api/v2/ready?locale=vi');
  assert.equal(missingTable.status, 503);
  assert.equal(missingTable.body.error.code, 'DATASET_INVALID');
});
