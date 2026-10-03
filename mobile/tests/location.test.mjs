import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { distanceMeters, pickCandidate } from '../src/location/nearest.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);
const nodes = fixture.nodes;
const LIMITS = { maxAccuracyMeters: 50, maxDistanceMeters: 300 };
const at = (node) => ({ latitude: node.latitude, longitude: node.longitude, accuracy: 10 });

test('distance is zero for the same spot and grows with separation', () => {
  const origin = { latitude: 10.76, longitude: 106.68 };
  assert.equal(Math.round(distanceMeters(origin, origin)), 0);
  const east = distanceMeters(origin, { latitude: 10.76, longitude: 106.681 });
  assert.ok(east > 100 && east < 120, `expected ~111 m, got ${east}`);
  assert.equal(Math.round(east), Math.round(distanceMeters({ latitude: 10.76, longitude: 106.681 }, origin)));
});

test('standing on a point suggests only that point', () => {
  const target = nodes[2];
  const result = pickCandidate(nodes, at(target), LIMITS);
  assert.equal(result.kind, 'candidate');
  assert.equal(result.node.id, target.id);
  assert.ok(result.distanceMeters < 5, result.distanceMeters);
  assert.equal(result.accuracy, 10);
});

// Regression: a weak fix must never become a suggestion the user could trust.
test('poor accuracy reports the reason instead of a candidate', () => {
  const result = pickCandidate(nodes, { ...at(nodes[0]), accuracy: 80 }, LIMITS);
  assert.equal(result.kind, 'poor-accuracy');
  assert.equal(result.accuracy, 80);
  assert.equal('node' in result, false);
});

test('standing far from the cluster reports the distance, not a guess', () => {
  const result = pickCandidate(
    nodes,
    { latitude: 10.9, longitude: 106.9, accuracy: 10 },
    LIMITS,
  );
  assert.equal(result.kind, 'outside-cluster');
  assert.ok(result.distanceMeters > 300, result.distanceMeters);
  assert.equal('node' in result, false);
});

test('no reading and no coordinates are refused', () => {
  assert.equal(pickCandidate(nodes, undefined, LIMITS).kind, 'needs-position');
  const withoutCoordinates = nodes.map((node) => ({ ...node, latitude: undefined, longitude: undefined }));
  assert.equal(pickCandidate(withoutCoordinates, at(nodes[0]), LIMITS).kind, 'no-coordinates');
});

test('a closed point is never suggested', () => {
  const closed = nodes.map((node) => (node.id === nodes[2].id ? { ...node, available: false } : node));
  const result = pickCandidate(closed, at(nodes[2]), LIMITS);
  assert.notEqual(result.kind === 'candidate' && result.node.id, nodes[2].id);
});

// Regression: R5.02 — receiving a candidate must never confirm a point by itself.
test('no result claims a point is confirmed', () => {
  const kinds = [
    pickCandidate(nodes, undefined, LIMITS).kind,
    pickCandidate(nodes, { ...at(nodes[0]), accuracy: 999 }, LIMITS).kind,
    pickCandidate(nodes, { latitude: 10.9, longitude: 106.9, accuracy: 5 }, LIMITS).kind,
    pickCandidate(nodes, at(nodes[0]), LIMITS).kind,
  ];
  for (const kind of kinds) {
    assert.doesNotMatch(String(kind), /confirm/i);
  }
});

// Regression: the choice must be stable and must not need coordinates to explain.
test('the nearest point is deterministic and carries both readings', () => {
  const first = pickCandidate(nodes, at(nodes[1]), LIMITS);
  const second = pickCandidate(nodes, at(nodes[1]), LIMITS);
  assert.deepEqual(first, second);
  assert.equal(first.kind, 'candidate');
  assert.ok(typeof first.distanceMeters === 'number');
  assert.ok(typeof first.accuracy === 'number');
});

test('every simulated point carries usable coordinates', () => {
  for (const node of nodes) {
    assert.ok(Number.isFinite(node.latitude) && Math.abs(node.latitude) <= 90, node.id);
    assert.ok(Number.isFinite(node.longitude) && Math.abs(node.longitude) <= 180, node.id);
  }
});