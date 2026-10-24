#!/usr/bin/env node
/**
 * Phase 8 HTTP integration + security tests (W4, task_d82ac6443e6d).
 * Runs against REAL loopback HTTP: the actual backend app on a temp DB,
 * plus a tiny stub for transport faults. No emulator, no外网, no secrets.
 *
 *   node --test tools/e2e/phase8-http.test.mjs
 *
 * Backend SHA under test: backend/ at HEAD d49b550 (W3 2963fb8 + c1b65fc).
 * Adapter SHA under test: mobile/src/data/{sourceState,live}.ts (W2 c16b662 + 0422ed5).
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import demoJson from '../../data/demo.json' with { type: 'json' };
import { createApp } from '../../backend/src/app.mjs';
import { openDatabase, migrate, importDataset, readDataset } from '../../backend/src/database.mjs';
import { loadLiveSource, readLiveConfig, getUtf8ByteLength } from '../../mobile/src/data/live.ts';
import { parseDataset, MAX_BODY_BYTES } from '../../mobile/src/data/sourceState.ts';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Minimal valid reviewed dataset: 1 node + 1 QA, fully approved. */
function reviewedFixture() {
  const stamp = '2026-10-16T02:00:00Z';
  const approved = { reviewStatus: 'approved', updatedAt: stamp };
  return {
    schemaVersion: 1,
    kind: 'reviewed',
    disclaimer: 'Dữ liệu đã duyệt dùng cho kiểm thử tích hợp.',
    intro: { text: 'Giới thiệu đã duyệt.', evidence: ['field-notes-01'], ...approved },
    startNodeId: 'node-01',
    nodes: [{
      id: 'node-01', name: 'Điểm 01', summary: 'Tóm tắt điểm 01.',
      tags: ['kham pha tu do'], visitMinutes: 30, available: true, visited: false,
      story: 'Câu chuyện đã duyệt.', caption: 'Chú thích đã duyệt.',
      latitude: 21.0, longitude: 105.8, ...approved,
    }],
    qa: [{
      id: 'qa-01', nodeId: 'node-01', question: 'Đây là điểm nào?',
      answer: 'Đây là điểm 01.', aliases: ['Điểm nào đây?'],
      evidence: ['field-notes-01'], followUps: [], tags: ['kham pha tu do'], ...approved,
    }],
  };
}

describe('backend contract on temp loopback (real HTTP, temp DB)', () => {
  let dir;
  let db;
  let server;
  let base;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'ngoke-phase8-'));
    db = openDatabase(join(dir, 'test.sqlite'));
    migrate(db);
    // Second migration is idempotent.
    migrate(db);
    server = createApp({ db, serveSimulatedData: false });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('empty dataset: GET /api/dataset is canonical 404 NO_REVIEWED_DATA', async () => {
    const res = await fetch(`${base}/api/dataset`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), {
      error: { code: 'NO_REVIEWED_DATA', message: 'No dataset is available for live mode' },
    });
  });

  it('empty dataset: /api/ready is 503 but /api/health stays 200 (DB healthy)', async () => {
    const ready = await fetch(`${base}/api/ready`);
    assert.equal(ready.status, 503);
    assert.equal((await ready.json()).error.code, 'NO_REVIEWED_DATA');
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', database: 'ok' });
  });

  it('simulated seed is stored but NOT published without the opt-in', async () => {
    assert.equal(importDataset(db, demoJson), true);
    // Seed twice: no overwrite.
    assert.equal(importDataset(db, demoJson), false);
    const res = await fetch(`${base}/api/dataset`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NO_REVIEWED_DATA');
  });

  it('non-GET is 405 with Allow: GET and unknown routes are 404 NOT_FOUND', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const res = await fetch(`${base}/api/dataset`, { method });
      assert.equal(res.status, 405);
      assert.equal(res.headers.get('allow'), 'GET');
      assert.equal((await res.json()).error.code, 'METHOD_NOT_ALLOWED');
    }
    for (const path of ['/api/chat', '/api/llm', '/api/qa', '/api/recommendations', '/nope']) {
      const res = await fetch(`${base}${path}`);
      assert.equal(res.status, 404);
      assert.equal((await res.json()).error.code, 'NOT_FOUND');
    }
  });

  it('query strings are rejected and error bodies never leak stacks', async () => {
    const res = await fetch(`${base}/api/dataset?node=1`);
    assert.equal(res.status, 400);
    const body = await res.text();
    assert.match(body, /INVALID_INPUT/);
    assert.doesNotMatch(body, /at |Error:|node:internal/);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });

  it('reviewed import round-trips, then /api/ready and /api/dataset are 200', async () => {
    const fixture = reviewedFixture();
    assert.ok(parseDataset(fixture, { mode: 'live' }));
    assert.equal(importDataset(db, fixture, { replace: true }), true);
    assert.deepEqual(readDataset(db).kind, 'reviewed');
    const ready = await fetch(`${base}/api/ready`);
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { status: 'ready', database: 'ok', dataset: 'reviewed' });
    const res = await fetch(`${base}/api/dataset`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.schemaVersion, 1);
    assert.equal(body.kind, 'reviewed');
    assert.ok(getUtf8ByteLength(JSON.stringify(body)) <= MAX_BODY_BYTES);
    for (const key of ['disclaimer', 'intro', 'startNodeId', 'nodes', 'qa']) {
      assert.ok(key in body, `missing envelope field ${key}`);
    }
  });

  it('reviewed missing any approval metadata is a shape error, never served', async () => {
    const bad = reviewedFixture();
    delete bad.qa[0].reviewStatus;
    assert.equal(parseDataset(bad, { mode: 'live' }), undefined);
    assert.throws(() => importDataset(db, bad, { replace: true }), /Invalid dataset/);
    // Previously imported good data is untouched by the failed import.
    assert.equal(readDataset(db).kind, 'reviewed');
  });

  it('aggregate body budget (W3 0399821): import rejects pre-mutate, prior data intact', async () => {
    // Review gap 2026-10-16: every field below stays inside its limit
    // (20 evidence x 2000 chars per QA) yet the whole exceeds 512KiB.
    // The shared parser still has no total-body measure (transport and
    // backend boundary cover it instead): parseDataset accepts, but the
    // backend import boundary must reject before any mutation.
    const bloated = JSON.parse(JSON.stringify(demoJson));
    for (const entry of bloated.qa) {
      entry.evidence = Array.from({ length: 20 }, (_, i) => `note-${i}-`.padEnd(2000, 'x'));
    }
    const bytes = getUtf8ByteLength(JSON.stringify(bloated));
    assert.ok(bytes > MAX_BODY_BYTES, `repro needs >512KiB, got ${bytes}`);
    assert.notEqual(parseDataset(bloated, { mode: 'live' }), undefined,
      'parser layer unchanged: accepts field-legal aggregates; boundary enforced below');
    assert.throws(() => importDataset(db, bloated, { replace: true }), /512 KiB/);
    // Failed import mutated nothing: the reviewed fixture still serves.
    assert.equal(readDataset(db).kind, 'reviewed');
    const res = await fetch(`${base}/api/dataset`);
    assert.equal(res.status, 200);
  });

  it('oversized and bad-reference payloads are rejected before storage', async () => {
    const big = reviewedFixture();
    big.nodes[0].story = 'x'.repeat(2001);
    assert.equal(parseDataset(big, { mode: 'live' }), undefined);
    const dangling = reviewedFixture();
    dangling.qa[0].nodeId = 'ghost-node';
    assert.equal(parseDataset(dangling, { mode: 'live' }), undefined);
    const emptyEvidence = reviewedFixture();
    emptyEvidence.intro.evidence = [];
    assert.equal(parseDataset(emptyEvidence, { mode: 'live' }), undefined);
  });
});

describe('live adapter against real HTTP (no fallback, 8s deadline)', () => {
  let dir;
  let db;
  let server;
  let base;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'ngoke-phase8-live-'));
    db = openDatabase(join(dir, 'test.sqlite'));
    migrate(db);
    // Opt-in server: simulated visible with the mô-phỏng label.
    server = createApp({ db, serveSimulatedData: true });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
    importDataset(db, demoJson);
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('default deadline is 8s and missing config stays live-empty', async () => {
    assert.equal(loadLiveSource.defaultTimeoutMs, 8000);
    const missing = await loadLiveSource({});
    assert.equal(missing.mode, 'live');
    assert.equal(missing.status, 'empty');
    assert.equal(missing.reason, 'no-config');
    const state = await loadLiveSource({ baseUrl: '' });
    assert.equal(state.mode, 'live');
    assert.equal(state.status, 'empty');
    assert.equal(state.reason, 'no-config');
  });

  it('served simulated dataset is ready with the chưa-xác-minh label', async () => {
    const state = await loadLiveSource({ baseUrl: base });
    assert.equal(state.mode, 'live');
    assert.equal(state.status, 'ready');
    assert.match(state.title, /mô phỏng \(chưa xác minh\)/);
    assert.equal(state.dataset.nodes.length, 6);
    assert.match(state.detail, new RegExp(base.replace(/[./]/g, (c) => `\\${c}`).slice(0, 20)));
    assert.ok(!state.detail.includes('/api/dataset'), 'detail shows origin only, not the full URL');
  });

  it('strict URL rules: credentials, query, fragment and non-http(s) never fetch', async () => {
    assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'ftp://x' }, undefined), undefined);
    assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'http://user@h/' }, undefined), undefined);
    assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: `${base}?x=1` }, undefined), undefined);
    for (const bad of ['http://user:pass@127.0.0.1/', `${base}#frag`, 'notaurl']) {
      const state = await loadLiveSource({ baseUrl: bad });
      assert.equal(state.status, 'error');
      assert.equal(state.reason, 'shape');
      assert.equal(state.mode, 'live', 'never falls back to demo');
    }
  });

  it('500 then recovery: first call errors, manual retry succeeds, nothing cached', async () => {
    let calls = 0;
    const flaky = createServer((req, res) => {
      calls += 1;
      if (calls === 1) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end('{}');
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(reviewedFixture()));
    });
    await new Promise((resolve) => flaky.listen(0, '127.0.0.1', resolve));
    try {
      const flakyBase = `http://127.0.0.1:${flaky.address().port}`;
      const first = await loadLiveSource({ baseUrl: flakyBase });
      assert.equal(first.status, 'error');
      assert.equal(first.reason, 'http');
      const second = await loadLiveSource({ baseUrl: flakyBase });
      assert.equal(second.status, 'ready');
      assert.equal(second.dataset.kind, 'reviewed');
    } finally {
      await new Promise((resolve) => flaky.close(resolve));
    }
  });

  it('slow body is cut by the deadline; abort stays live without demo data', async () => {
    const slow = createServer((req, res) => {
      setTimeout(() => {
        try {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(reviewedFixture()));
        } catch { /* client already gone */ }
      }, 1500);
    });
    await new Promise((resolve) => slow.listen(0, '127.0.0.1', resolve));
    try {
      const slowBase = `http://127.0.0.1:${slow.address().port}`;
      const timed = await loadLiveSource({ baseUrl: slowBase, timeoutMs: 300 });
      assert.equal(timed.status, 'error');
      assert.equal(timed.reason, 'timeout');
      const controller = new AbortController();
      const pending = loadLiveSource({ baseUrl: slowBase, timeoutMs: 5000, signal: controller.signal });
      await sleep(100);
      controller.abort();
      const aborted = await pending;
      assert.equal(aborted.mode, 'live');
      assert.equal(aborted.status, 'error');
      assert.ok(!('dataset' in aborted), 'aborted run exposes no dataset');
    } finally {
      await new Promise((resolve) => slow.close(resolve));
    }
  });

  it('oversized body (header or actual bytes) is a shape error', async () => {
    const bigBody = JSON.stringify({ ...reviewedFixture(), padding: 'y'.repeat(MAX_BODY_BYTES) });
    assert.ok(getUtf8ByteLength(bigBody) > MAX_BODY_BYTES);
    const big = createServer((req, res) => {
      res.writeHead(200, {
        'content-type': 'application/json',
        'content-length': String(getUtf8ByteLength(bigBody)),
      });
      res.end(bigBody);
    });
    await new Promise((resolve) => big.listen(0, '127.0.0.1', resolve));
    try {
      const state = await loadLiveSource({ baseUrl: `http://127.0.0.1:${big.address().port}` });
      assert.equal(state.status, 'error');
      assert.equal(state.reason, 'shape');
    } finally {
      await new Promise((resolve) => big.close(resolve));
    }
  });
});
