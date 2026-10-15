import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { MAX_BODY_BYTES, parseDataset } from '../../mobile/src/data/sourceState.ts';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 3000, enableForeignKeyConstraints: true });
  db.exec('PRAGMA journal_mode = WAL');
  return db;
}

/** Versioned SQL is applied explicitly; server startup never migrates. */
export function migrate(db) {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT');
  if (db.prepare('SELECT max(version) AS version FROM schema_migrations').get().version > 1) {
    throw new Error('Database schema is newer than this server');
  }
  if (db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(1)) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(readFileSync(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8'));
    db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(1, new Date().toISOString());
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function assertMigrated(db) {
  const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
  if (versions.length !== 1 || versions[0].version !== 1) {
    throw new Error('Database needs migration; run npm run migrate');
  }
  for (const table of ['dataset', 'nodes', 'qa']) db.prepare('SELECT count(*) FROM ' + table).get();
}

export function hasContent(db) {
  return Boolean(db.prepare('SELECT EXISTS(SELECT 1 FROM dataset) OR EXISTS(SELECT 1 FROM nodes) OR EXISTS(SELECT 1 FROM qa) AS populated').get().populated);
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
