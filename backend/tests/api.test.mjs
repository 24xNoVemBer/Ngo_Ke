import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { createApp } from '../src/app.mjs';
import { openDatabase, migrate, importDataset } from '../src/database.mjs';
import { loadLiveSource } from '../../mobile/src/data/live.ts';

const sample = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

async function running(t, { seeded = true, simulated = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ngoke-api-test-'));
  const db = openDatabase(join(dir, 'api.sqlite'));
  migrate(db);
  if (seeded) importDataset(db, sample);
  const server = createApp({ db, serveSimulatedData: simulated });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(path, init) {
    const response = await fetch(base + path, init);
    return { status: response.status, body: await response.json(), headers: response.headers };
  }
  return { db, base, request };
}

test('only the opt-in simulated dataset is served; mobile adapter reads actual HTTP', async (t) => {
  const hidden = await running(t);
  assert.equal((await hidden.request('/api/health')).status, 200);
  assert.equal((await hidden.request('/api/ready')).status, 503);
  const empty = await hidden.request('/api/dataset');
  assert.equal(empty.status, 404);
  assert.equal(empty.body.error.code, 'NO_REVIEWED_DATA');
  assert.equal((await loadLiveSource({ baseUrl: hidden.base })).status, 'empty');

  const visible = await running(t, { simulated: true });
  const response = await visible.request('/api/dataset');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, sample);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await visible.request('/api/ready')).body.dataset, 'simulated');
  const source = await loadLiveSource({ baseUrl: visible.base });
  assert.equal(source.status, 'ready');
  assert.match(source.title, /mô phỏng/);
});

test('empty databases and corrupt stored data report empty or bounded server errors', async (t) => {
  const empty = await running(t, { seeded: false });
  assert.equal((await empty.request('/api/health')).status, 200);
  assert.equal((await empty.request('/api/dataset')).status, 404);
  assert.equal((await empty.request('/api/ready')).status, 503);

  const broken = await running(t, { simulated: true });
  broken.db.exec('DROP TABLE qa');
  const response = await broken.request('/api/dataset');
  assert.equal(response.status, 503);
  assert.equal(response.body.error.code, 'DATABASE_UNAVAILABLE');
  assert.doesNotMatch(response.body.error.message, /SQL|sqlite|path|stack/i);
});

test('over-budget stored datasets fail closed instead of being served', async (t) => {
  const { db, request } = await running(t, { simulated: true });
  db.prepare('UPDATE qa SET evidence = ?').run(JSON.stringify(Array(20).fill('x'.repeat(2000))));

  const response = await request('/api/dataset');
  assert.equal(response.status, 503);
  assert.equal(response.body.error.code, 'DATABASE_UNAVAILABLE');
  assert.doesNotMatch(JSON.stringify(response.body), /xxxxxxxx/);
});

test('unsupported routes, query strings, and methods fail without exposing server internals', async (t) => {
  const { request } = await running(t, { simulated: true });
  for (const path of ['/api/chat', '/api/llm', '/api/voice', '/api/nodes', '/api/dataset?x=1']) {
    const response = await request(path);
    assert.ok([400, 404].includes(response.status), path);
    assert.doesNotMatch(JSON.stringify(response.body), /stack|sqlite|token|secret/i);
  }
  const post = await request('/api/dataset', { method: 'POST', body: '{}' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET');
});

test('health only checks database connectivity and unknown routes avoid dataset reads', async (t) => {
  const { db, request } = await running(t, { seeded: false });
  db.exec('DROP TABLE qa');
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/nope')).status, 404);
  assert.equal((await request('/api/ready')).status, 503);
});
