import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { loadLiveSource, readLiveConfig } from '../src/data/live.ts';
import { getSourceState } from '../src/data/sourceState.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const okFetch = (body, status = 200) => async () => jsonResponse(body, status);

test('configuration comes from the environment first, then app.json', () => {
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: 'https://a.example/' }, { apiBaseUrl: 'https://b.example' }), 'https://a.example');
  assert.equal(readLiveConfig({}, { apiBaseUrl: 'https://b.example/api/' }), 'https://b.example/api');
  assert.equal(readLiveConfig({ EXPO_PUBLIC_NGOKE_API_BASE_URL: '   ' }, undefined), undefined);
  assert.equal(readLiveConfig({}, undefined), undefined);
});

test('a configured backend that returns a reviewed payload becomes ready', async () => {
  const result = await loadLiveSource({
    baseUrl: 'https://api.example',
    fetchImpl: okFetch(fixture),
  });
  assert.equal(result.mode, 'live');
  assert.equal(result.status, 'ready');
  assert.equal(result.dataset.nodes.length, 6);
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

test('an empty dataset or a 404 is an empty live state', async () => {
  const noNodes = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({ ...fixture, nodes: [] }) });
  assert.equal(noNodes.status, 'empty');
  assert.equal(noNodes.reason, 'no-data');

  const notFound = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({}, 404) });
  assert.equal(notFound.status, 'empty');
  assert.equal(notFound.reason, 'no-data');
});

// Regression: records without a source must be refused instead of shown.
test('a payload that breaks the shape or drops evidence is an error', async () => {
  const missingEvidence = structuredClone(fixture);
  missingEvidence.qa[0].evidence = [];
  const badEvidence = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch(missingEvidence) });
  assert.equal(badEvidence.status, 'error');
  assert.equal(badEvidence.reason, 'shape');

  const badNodes = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: okFetch({ ...fixture, nodes: fixture.nodes.slice(0, 2) }) });
  assert.equal(badNodes.status, 'error');
  assert.equal(badNodes.reason, 'shape');

  const notJson = await loadLiveSource({ baseUrl: 'https://api.example', fetchImpl: async () => new Response('<html>oops</html>', { status: 200 }) });
  assert.equal(notJson.status, 'error');
  assert.equal(notJson.reason, 'shape');
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

test('the default timeout is the agreed eight seconds', () => {
  assert.equal(loadLiveSource.defaultTimeoutMs, 8000);
});

// Regression: demo must keep working with no network, server or key.
test('demo still reads the bundled fixture without any network', async () => {
  assert.equal(getSourceState('demo', fixture).status, 'ready');
  assert.equal(getSourceState('demo').status, 'error');
});