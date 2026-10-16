import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { MAX_BODY_BYTES, parseDataset, parseDatasetV2, validateDatasetV2Pair } from '../../mobile/src/data/sourceState.ts';
import { canonicalDatasetJson } from '../../mobile/src/data/canonicalJson.ts';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 3000, enableForeignKeyConstraints: true });
  db.exec('PRAGMA journal_mode = WAL');
  return db;
}

/** Versioned SQL is applied explicitly; server startup never migrates. */
function migrationVersions(db) {
  if (!db.prepare("SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'").get()) return [];
  return db.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(({ version }) => version);
}

export function needsMigration(db) {
  const versions = migrationVersions(db);
  if (versions.some((version) => version > 2)) throw new Error('Database schema is newer than this server');
  if (versions.length === 2 && versions[0] === 1 && versions[1] === 2) return false;
  if (versions.length === 0 || (versions.length === 1 && versions[0] === 1)) return true;
  throw new Error('Database migration history is invalid');
}

export function migrate(db) {
  const versions = migrationVersions(db);
  if (versions.some((version) => version > 2)) throw new Error('Database schema is newer than this server');
  if (versions.length === 2 && versions[0] === 1 && versions[1] === 2) return;
  if (versions.length !== 0 && !(versions.length === 1 && versions[0] === 1)) {
    throw new Error('Database migration history is invalid');
  }
  if (versions.length === 1) {
    for (const table of ['dataset', 'nodes', 'qa']) db.prepare('SELECT count(*) FROM ' + table).get();
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT');
    if (versions.length === 0) {
      db.exec(readFileSync(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8'));
      db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(1, new Date().toISOString());
    }
    db.exec(readFileSync(new URL('../migrations/002_publication_v2.sql', import.meta.url), 'utf8'));
    db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(2, new Date().toISOString());
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function assertMigrated(db) {
  const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
  if (versions.length !== 2 || versions[0].version !== 1 || versions[1].version !== 2) {
    throw new Error('Database needs migration; run npm run migrate');
  }
  for (const table of ['dataset', 'nodes', 'qa', 'publication_v2']) db.prepare('SELECT count(*) FROM ' + table).get();
}

export function hasContent(db) {
  return Boolean(db.prepare('SELECT EXISTS(SELECT 1 FROM dataset) OR EXISTS(SELECT 1 FROM nodes) OR EXISTS(SELECT 1 FROM qa) AS populated').get().populated);
}

export function hasAnyContent(db) {
  const tables = new Set(db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table'").all().map(({ name }) => name));
  return ['dataset', 'nodes', 'qa', 'publication_v2'].some((table) =>
    tables.has(table) && Boolean(db.prepare('SELECT EXISTS(SELECT 1 FROM ' + table + ') AS populated').get().populated));
}

export class DatasetInvalidError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatasetInvalidError';
  }
}

function digest(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function prepareLocalizedPair(viValue, enValue) {
  const vi = parseDatasetV2(viValue, { mode: 'live', expectedLocale: 'vi' });
  const en = parseDatasetV2(enValue, { mode: 'live', expectedLocale: 'en' });
  if (!vi || !en) throw new Error('Invalid localized dataset: schema, locale, evidence or references');
  const pair = validateDatasetV2Pair(vi, en);
  if (!pair.ok) throw new Error('Invalid localized dataset pair: ' + pair.reason);
  const viJson = canonicalDatasetJson(vi);
  const enJson = canonicalDatasetJson(en);
  if (Buffer.byteLength(viJson, 'utf8') > MAX_BODY_BYTES || Buffer.byteLength(enJson, 'utf8') > MAX_BODY_BYTES) {
    throw new Error('Localized dataset exceeds the 512 KiB body limit');
  }
  return {
    vi, en, viJson, enJson, collectionId: vi.collectionId,
    viSha256: digest(viJson), enSha256: digest(enJson),
  };
}

function invalidSchema(error) {
  return /no such table|no such column|malformed|schema.*invalid|needs migration/i.test(error?.message ?? '');
}

function readLocalizedPairInTransaction(db) {
  assertMigrated(db);
  let rows;
  try {
    rows = db.prepare('SELECT locale, collection_id, payload_json, payload_sha256 FROM publication_v2 ORDER BY locale').all();
  } catch (error) {
    if (invalidSchema(error)) throw new DatasetInvalidError('Published dataset schema is invalid');
    throw error;
  }
  if (rows.length === 0) return undefined;
  if (rows.length !== 2 || rows[0].locale !== 'en' || rows[1].locale !== 'vi') {
    throw new DatasetInvalidError('Published dataset pair is incomplete');
  }
  const data = {};
  for (const row of rows) {
    let value;
    try {
      value = JSON.parse(row.payload_json);
    } catch {
      throw new DatasetInvalidError('Published dataset JSON is invalid');
    }
    const dataset = parseDatasetV2(value, { mode: 'live', expectedLocale: row.locale });
    if (!dataset) throw new DatasetInvalidError('Published dataset does not pass validation');
    const canonical = canonicalDatasetJson(dataset);
    if (Buffer.byteLength(canonical, 'utf8') > MAX_BODY_BYTES || canonical !== row.payload_json || digest(canonical) !== row.payload_sha256) {
      throw new DatasetInvalidError('Published dataset digest or payload is invalid');
    }
    if (row.collection_id !== dataset.collectionId) throw new DatasetInvalidError('Published dataset collection is invalid');
    data[row.locale] = { dataset, json: canonical, sha256: row.payload_sha256 };
  }
  const pair = validateDatasetV2Pair(data.vi.dataset, data.en.dataset);
  if (!pair.ok) throw new DatasetInvalidError('Published dataset pair is invalid');
  return { ...data, collectionId: data.vi.dataset.collectionId };
}

export function readLocalizedPair(db) {
  try {
    db.exec('BEGIN');
  } catch (error) {
    if (invalidSchema(error)) throw new DatasetInvalidError('Published dataset schema is invalid');
    throw error;
  }
  try {
    const pair = readLocalizedPairInTransaction(db);
    db.exec('COMMIT');
    return pair;
  } catch (error) {
    try { db.exec('ROLLBACK'); } catch { /* The connection may already be unavailable. */ }
    if (error instanceof DatasetInvalidError) throw error;
    if (invalidSchema(error)) throw new DatasetInvalidError('Published dataset schema is invalid');
    throw error;
  }
}

export function readLocalizedPublication(db, locale) {
  const pair = readLocalizedPair(db);
  if (!pair) return undefined;
  const selected = pair[locale];
  return { dataset: selected.dataset, revision: selected.sha256, collectionId: pair.collectionId };
}

/** Validate both locales before one transaction publishes or replaces either row. */
export function importLocalizedPair(db, input, { replace = false } = {}) {
  const pair = prepareLocalizedPair(input.vi, input.en);
  assertMigrated(db);
  db.exec('BEGIN IMMEDIATE');
  try {
    const current = readLocalizedPairInTransaction(db);
    if (current && current.vi.sha256 === pair.viSha256 && current.en.sha256 === pair.enSha256) {
      db.exec('COMMIT');
      return false;
    }
    if (current && !replace) throw new Error('Localized dataset already exists; use --replace after backup');
    if (!current && db.prepare('SELECT count(*) AS n FROM publication_v2').get().n) {
      throw new DatasetInvalidError('Published dataset pair is incomplete');
    }
    db.exec('DELETE FROM publication_v2');
    const insert = db.prepare('INSERT INTO publication_v2 (locale, collection_id, payload_json, payload_sha256, imported_at) VALUES (?, ?, ?, ?, ?)');
    const importedAt = new Date().toISOString();
    insert.run('vi', pair.collectionId, pair.viJson, pair.viSha256, importedAt);
    insert.run('en', pair.collectionId, pair.enJson, pair.enSha256, importedAt);
    db.exec('COMMIT');
    return true;
  } catch (error) {
    try { db.exec('ROLLBACK'); } catch { /* Preserve the original write failure. */ }
    throw error;
  }
}

function withReview(record, reviewStatus, updatedAt) {
  return reviewStatus === null ? record : { ...record, reviewStatus, updatedAt };
}

function assertBodyLimit(dataset) {
  if (Buffer.byteLength(JSON.stringify(dataset), 'utf8') > MAX_BODY_BYTES) {
    throw new Error('Dataset exceeds the 512 KiB body limit');
  }
}

export function readDataset(db) {
  assertMigrated(db);
  db.exec('BEGIN');
  try {
    const meta = db.prepare('SELECT * FROM dataset WHERE id = ?').get(1);
    if (!meta) {
      if (db.prepare('SELECT count(*) AS n FROM nodes').get().n || db.prepare('SELECT count(*) AS n FROM qa').get().n) {
        throw new Error('Invalid dataset: orphan records');
      }
      db.exec('COMMIT');
      return undefined;
    }
    const dataset = {
      schemaVersion: meta.schema_version,
      kind: meta.kind,
      disclaimer: meta.disclaimer,
      intro: withReview({ text: meta.intro_text, evidence: JSON.parse(meta.intro_evidence) },
        meta.intro_review_status, meta.intro_updated_at),
      startNodeId: meta.start_node_id,
      nodes: db.prepare('SELECT * FROM nodes ORDER BY position').all().map((n) => withReview({
        id: n.id, name: n.name, summary: n.summary, tags: JSON.parse(n.tags),
        visitMinutes: n.visit_minutes, available: Boolean(n.available), visited: Boolean(n.visited),
        story: n.story, caption: n.caption, latitude: n.latitude, longitude: n.longitude,
      }, n.review_status, n.updated_at)),
      qa: db.prepare('SELECT * FROM qa ORDER BY position').all().map((q) => withReview({
        id: q.id, question: q.question, answer: q.answer, nodeId: q.node_id,
        aliases: JSON.parse(q.aliases), evidence: JSON.parse(q.evidence),
        followUps: JSON.parse(q.follow_ups), tags: JSON.parse(q.tags),
      }, q.review_status, q.updated_at)),
    };
    if (!parseDataset(dataset, { mode: 'live' })) throw new Error('Invalid dataset stored in database');
    assertBodyLimit(dataset);
    db.exec('COMMIT');
    return dataset;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** Validate before replacing, then write all records in one transaction. */
export function importDataset(db, value, { replace = false } = {}) {
  const dataset = parseDataset(value, { mode: 'live' });
  if (!dataset) throw new Error('Invalid dataset: schema, evidence or references');
  assertBodyLimit(dataset);
  assertMigrated(db);
  db.exec('BEGIN IMMEDIATE');
  try {
    if (!replace && hasContent(db)) {
      if (!db.prepare('SELECT id FROM dataset WHERE id = ?').get(1)) {
        throw new Error('Invalid dataset: orphan records need explicit replacement with backup');
      }
      db.exec('ROLLBACK');
      return false;
    }
    db.exec('DELETE FROM dataset; DELETE FROM qa; DELETE FROM nodes');
    const insertNode = db.prepare('INSERT INTO nodes (id, position, name, summary, tags, visit_minutes, available, visited, story, caption, latitude, longitude, review_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    dataset.nodes.forEach((n, i) => insertNode.run(n.id, i, n.name, n.summary, JSON.stringify(n.tags),
      n.visitMinutes, Number(n.available), Number(n.visited), n.story, n.caption, n.latitude, n.longitude,
      n.reviewStatus ?? null, n.updatedAt ?? null));
    const insertQa = db.prepare('INSERT INTO qa (id, position, node_id, question, answer, aliases, evidence, follow_ups, tags, review_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    dataset.qa.forEach((q, i) => insertQa.run(q.id, i, q.nodeId, q.question, q.answer,
      JSON.stringify(q.aliases), JSON.stringify(q.evidence), JSON.stringify(q.followUps), JSON.stringify(q.tags),
      q.reviewStatus ?? null, q.updatedAt ?? null));
    db.prepare('INSERT INTO dataset (id, schema_version, kind, disclaimer, intro_text, intro_evidence, intro_review_status, intro_updated_at, start_node_id, imported_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(1, dataset.schemaVersion,
      dataset.kind, dataset.disclaimer, dataset.intro.text, JSON.stringify(dataset.intro.evidence),
      dataset.intro.reviewStatus ?? null, dataset.intro.updatedAt ?? null,
      dataset.startNodeId, new Date().toISOString());
    db.exec('COMMIT');
    return true;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
