import assert from 'node:assert/strict';
import test from 'node:test';
import { computeSchematicTrailLayout } from '../src/utils/alleyGeometry.ts';

const makeNodes = (count) => Array.from({ length: count }, (_, index) => ({
  id: `node-${index + 1}`,
  available: index !== 1,
}));

test('schematic layout returns no pins for an empty list or invalid canvas dimensions', () => {
  assert.deepEqual(computeSchematicTrailLayout([], 400, 800), { pins: [], splinePoints: [] });

  for (const [width, height] of [
    [0, 800], [-1, 800], [Number.NaN, 800], [Number.POSITIVE_INFINITY, 800],
    [400, 0], [400, -1], [400, Number.NaN], [400, Number.POSITIVE_INFINITY],
  ]) {
    assert.deepEqual(
      computeSchematicTrailLayout(makeNodes(2), width, height),
      { pins: [], splinePoints: [] },
      `Invalid canvas ${width} × ${height} returns an empty layout`,
    );
  }
});

test('a single schematic stop is centered and keeps its actual node ID', () => {
  const layout = computeSchematicTrailLayout([{ id: 'actual-stop-id' }], 400, 800);

  assert.deepEqual(layout.pins, [{ id: 'actual-stop-id', xPct: 0.5, yPct: 0.5, side: 'right' }]);
  assert.deepEqual(layout.splinePoints, [
    { x: 200, y: 0 },
    { x: 200, y: 400 },
    { x: 200, y: 800 },
  ]);
});

test('schematic pin counts 2, 3, 5, 6, and greater than 6 are distributed from 15% through 85%', () => {
  for (const count of [2, 3, 5, 6, 8]) {
    const nodes = makeNodes(count);
    const layout = computeSchematicTrailLayout(nodes, 360, 720);

    assert.deepEqual(layout.pins.map((pin) => pin.id), nodes.map((node) => node.id));
    assert.equal(layout.splinePoints.length, count + 2);
    assert.deepEqual(Object.keys(layout.pins[0]), ['id', 'xPct', 'yPct', 'side']);
    assert.equal(layout.pins[0]?.yPct, 0.15);
    assert.ok(Math.abs((layout.pins.at(-1)?.yPct ?? 0) - 0.85) < 1e-12);
    assert.equal(layout.pins.length, count);
    assert.ok(layout.pins.every((pin) => Number.isFinite(pin.xPct) && Number.isFinite(pin.yPct)));
    assert.ok(layout.splinePoints.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));

    for (let index = 0; index < count; index += 1) {
      const pin = layout.pins[index];
      assert.ok(pin);
      assert.ok(Math.abs(pin.yPct - (0.15 + index * (0.7 / (count - 1)))) < 1e-12);
      assert.equal(pin.side, index % 2 === 0 ? 'right' : 'left');
      assert.equal(pin.xPct, index % 2 === 0 ? 0.56 : 0.44);
    }
  }

  const twoPinLayout = computeSchematicTrailLayout(makeNodes(2), 360, 720);
  assert.ok((twoPinLayout.pins[1].yPct - twoPinLayout.pins[0].yPct) >= 0.65);
});

test('schematic layout preserves order and unavailable node IDs without inventing fallback IDs', () => {
  const nodes = [
    { id: 'stop-b', available: false },
    { id: 'stop-a', available: true },
  ];
  const first = computeSchematicTrailLayout(nodes, 360, 720);
  const reordered = computeSchematicTrailLayout([...nodes].reverse(), 360, 720);

  assert.deepEqual(first.pins.map((pin) => pin.id), ['stop-b', 'stop-a']);
  assert.deepEqual(reordered.pins.map((pin) => pin.id), ['stop-a', 'stop-b']);
  assert.ok(first.pins.every((pin) => !pin.id.startsWith('fallback-')));
});
