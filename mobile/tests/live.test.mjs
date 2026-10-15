import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { loadLiveSource, readLiveConfig } from '../src/data/live.ts';
import { getSourceState } from '../src/data/sourceState.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);

function makeReviewedFixture() {
  const ts = '2026-10-16T02:00:00.000Z';
  return {
    schemaVersion: 1,
    kind: 'reviewed',
    reviewStatus: 'approved',
    updatedAt: ts,
    disclaimer: 'Dữ liệu đã duyệt theo quy trình.',
    intro: {
      text: 'Lời giới thiệu đã được duyệt.',
      evidence: ['Nguồn lưu trữ số 12'],
      reviewStatus: 'approved',
      updatedAt: ts,
    },
    startNodeId: 'demo-01',
    nodes: fixture.nodes.map((node) => ({
      ...node,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
    qa: fixture.qa.map((qa) => ({
      ...qa,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
  };
}

function jsonResponse(body, status = 200, headers = {}) {
  const text = JSON.stringify(body);
  return new Response(text, {
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

const okFetch = (body, status = 200, headers = {}) => async () => jsonResponse(body, status, headers);

test('configuration comes from the environment first, then app.json', () => {
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'https://a.example/' }, { apiBaseUrl: 'https://b.example' }), 'https://a.example');
  assert.equal(readLiveConfig({}, { apiBaseUrl: 'https://b.example/api/' }), 'https://b.example/api');
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: '   ' }, undefined), undefined);
  assert.equal(readLiveConfig({}, undefined), undefined);

  // Reject URLs with credentials, query strings, fragments, or non-http protocols
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'https://user:pass@a.example/' }, undefined), undefined);
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'https://a.example/?token=123' }, undefined), undefined);
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'https://a.example/#frag' }, undefined), undefined);
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'ftp://a.example' }, undefined), undefined);
});

test('a configured backend that returns a reviewed payload becomes ready with safe origin detail', async () => {
  const reviewed = makeReviewedFixture();
  const result = await loadLiveSource({
    baseUrl: 'https://api.example:8443/v1/subpath',
    fetchImpl: okFetch(reviewed),
  });
  assert.equal(result.mode, 'live');
  assert.equal(result.status, 'ready');
  assert.equal(result.dataset.nodes.length, 6);
  assert.equal(result.title, 'Live · 6 điểm đã duyệt');
  // Safe origin redacts path, query, and credentials
  assert.equal(result.detail, 'Nguồn: https://api.example:8443. Dữ liệu live không lưu trong app.');
});

test('a configured backend returning simulated data is ready with unverified label', async () => {
  const result = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: okFetch(fixture),
  });
  assert.equal(result.mode, 'live');
  assert.equal(result.status, 'ready');
  assert.equal(result.title, 'Live · 6 điểm mô phỏng (chưa xác minh)');
  assert.equal(result.detail, 'Nguồn: https://api.example. Dữ liệu live không lưu trong app.');
});

// Regression: the mode must never quietly become demo when live has no config.
test('no configuration is an empty live state, never the fixture', async () => {
  let called = false;
  const result = await loadLiveSource({
    baseUrl: undefined,
    fetchImpl: async () => {
      called = true;
      return jsonResponse(fixture);
    },
  });
  assert.equal(result.status, 'empty');
  assert.equal(result.reason, 'no-config');
  assert.equal('dataset' in result, false);
  assert.equal(called, false);
});

test('invalid baseUrl with credentials, query, fragment, or non-http protocol is rejected as shape error', async () => {
  const withCreds = await loadLiveSource({ baseUrl: 'https://user:pass@api.example', fetchImpl: okFetch(fixture) });
  assert.equal(withCreds.status, 'error');
  assert.equal(withCreds.reason, 'shape');

  const withQuery = await loadLiveSource({ baseUrl: 'https://api.example?secret=true', fetchImpl: okFetch(fixture) });
  assert.equal(withQuery.status, 'error');
  assert.equal(withQuery.reason, 'shape');

  const withFragment = await loadLiveSource({ baseUrl: 'https://api.example#section', fetchImpl: okFetch(fixture) });
  assert.equal(withFragment.status, 'error');
  assert.equal(withFragment.reason, 'shape');

  const nonHttp = await loadLiveSource({ baseUrl: 'ftp://api.example', fetchImpl: okFetch(fixture) });
  assert.equal(nonHttp.status, 'error');
  assert.equal(nonHttp.reason, 'shape');
});

test('404 is canonical empty live state', async () => {
  const notFound = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({}, 404) });
  assert.equal(notFound.status, 'empty');
  assert.equal(notFound.reason, 'no-data');
});

// Tightened rule: 200 with empty nodes is invalid-empty, returning error shape rather than empty state
test('HTTP 200 with empty nodes is an invalid-empty shape error', async () => {
  const noNodes = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({ ...fixture, nodes: [] }) });
  assert.equal(noNodes.status, 'error');
  assert.equal(noNodes.reason, 'shape');
});

// Regression: records without a source or metadata must be refused instead of shown.
test('a payload that breaks the shape or drops evidence is an error', async () => {
  const missingEvidence = structuredClone(fixture);
  missingEvidence.qa[0].evidence = [];
  const badEvidence = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch(missingEvidence) });
  assert.equal(badEvidence.status, 'error');
  assert.equal(badEvidence.reason, 'shape');

  const notJson = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: async () => new Response('<html>oops</html>', { status: 200 }) });
  assert.equal(notJson.status, 'error');
  assert.equal(notJson.reason, 'shape');
});

test('oversized body via Content-Length or actual body exceeds 512 KiB cap', async () => {
  // Exceeds Content-Length
  const oversizedHeader = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: okFetch(fixture, 200, { 'content-length': String(512 * 1024 + 1) }),
  });
  assert.equal(oversizedHeader.status, 'error');
  assert.equal(oversizedHeader.reason, 'shape');

  // Headerless / chunked oversized body
  const bigStory = 'x'.repeat(1000);
  const oversizedNodes = Array.from({ length: 50 }, (_, i) => ({
    ...fixture.nodes[0],
    id: `node-${i}`,
    name: `Điểm ${i}`,
    story: bigStory,
  }));
  const oversizedPayload = {
    ...fixture,
    nodes: oversizedNodes,
    qa: Array.from({ length: 200 }, (_, i) => ({
      ...fixture.qa[0],
      id: `qa-${i}`,
      question: `Câu hỏi ${i}?`,
      answer: bigStory,
      aliases: [`alias-${i}`],
      evidence: Array(5).fill('e'.repeat(1000)),
    })),
  };
  const bodyText = JSON.stringify(oversizedPayload);
  assert.ok(Buffer.byteLength(bodyText, 'utf8') > 512 * 1024);

  const oversizedBody = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: async () => new Response(bodyText, { status: 200 }), // no content-length
  });
  assert.equal(oversizedBody.status, 'error');
  assert.equal(oversizedBody.reason, 'shape');
});

test('headerless or chunked response within 512 KiB limit parses successfully', async () => {
  const result = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: async () => new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });
  assert.equal(result.status, 'ready');
});

test('server and network failures are reported as errors, with the reason', async () => {
  const serverError = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({}, 500) });
  assert.equal(serverError.status, 'error');
  assert.equal(serverError.reason, 'http');

  const networkError = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: async () => {
      throw new TypeError('Network request failed');
    },
  });
  assert.equal(networkError.status, 'error');
  assert.equal(networkError.reason, 'network');
});

// Regression: a hanging backend must not leave the app waiting for ever.
test('a hanging backend is stopped at the timeout and reported', async () => {
  let aborted = false;
  const result = await loadLiveSource({
    baseUrl: 'https://api.example',
    timeoutMs: 30,
    fetchImpl: (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          aborted = true;
          reject(new Error('Aborted'));
        });
      }),
  });
  assert.equal(result.status, 'error');
  assert.equal(result.reason, 'timeout');
  assert.equal(aborted, true);
  assert.equal('dataset' in result, false);
});

test('caller abort signal aborts fetch and cleans up', async () => {
  const callerController = new AbortController();
  let fetchAborted = false;
  const promise = loadLiveSource({
    baseUrl: 'https://api.example',
    signal: callerController.signal,
    fetchImpl: (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          fetchAborted = true;
          reject(new Error('Aborted'));
        });
      }),
  });
  callerController.abort();
  const result = await promise;
  assert.equal(fetchAborted, true);
  assert.equal(result.status, 'error');
  assert.equal(result.reason, 'network');
});

test('the default timeout is the agreed eight seconds', () => {
  assert.equal(loadLiveSource.defaultTimeoutMs, 8000);
});

// Regression: demo must keep working with no network, server or key.
test('demo still reads the bundled fixture without any network', async () => {
  assert.equal(getSourceState('demo', fixture).status, 'ready');
  assert.equal(getSourceState('demo').status, 'error');
});