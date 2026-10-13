import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { parseQrNodeId } from '../src/qr/parseQr.ts';
import { confirmByQr, selectManually } from '../src/qr/confirmPoint.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);
const nodes = fixture.nodes;

test('a QR code built from a known node id is accepted', () => {
  for (const node of nodes) {
    assert.equal(parseQrNodeId(`ngo-ke://node/${node.id}`), node.id);
    assert.equal(parseQrNodeId(`  ngo-ke://node/${node.id}  `), node.id);
    const confirmed = confirmByQr(nodes, `ngo-ke://node/${node.id}`);
    assert.equal(confirmed.ok, true);
    assert.equal(confirmed.node.id, node.id);
  }
});

// Regression: only our own scheme and a well-formed id may be parsed at all.
test('foreign or malformed QR payloads yield no id', () => {
  const refused = [
    '',
    '   ',
    'ngo-ke://node/',
    'https://example.com/demo-01',
    'ngo-ke://point/demo-01',
    'ngo-ke://node/demo-01/extra',
    'demo-01',
    'ngo-ke://node/DEMO-01',
  ];
  for (const payload of refused) {
    assert.equal(parseQrNodeId(payload), undefined, payload);
    const confirmed = confirmByQr(nodes, payload);
    assert.equal(confirmed.ok, false, payload);
    assert.equal('node' in confirmed, false, payload);
  }
});

// Regression: a well-formed code for a point we do not have must not be
// confirmed, otherwise a stray sticker could move the user to a wrong point.
test('a well-formed code for an unknown point is not confirmed', () => {
  assert.equal(parseQrNodeId('ngo-ke://node/demo-99'), 'demo-99');
  const confirmed = confirmByQr(nodes, 'ngo-ke://node/demo-99');
  assert.equal(confirmed.ok, false);
  assert.equal('node' in confirmed, false);
});

test('manual selection works for known points and refuses unknown ids', () => {
  const target = nodes[2];
  assert.equal(selectManually(nodes, target.id)?.id, target.id);
  assert.equal(selectManually(nodes, 'demo-99'), undefined);
  assert.equal(selectManually(nodes, ''), undefined);
});

// Regression: manual choice must keep the demo available when camera is refused.
test('a refused scan still leaves a usable manual choice', () => {
  const refused = confirmByQr(nodes, 'ngo-ke://node/demo-99');
  assert.equal(refused.ok, false);
  const manual = selectManually(nodes, nodes[0].id);
  assert.equal(manual?.id, nodes[0].id);
});

test('every point has narrator text and a caption', () => {
  for (const node of nodes) {
    assert.ok(node.story && node.story.trim().length > 0, node.id);
    assert.ok(node.caption && node.caption.trim().length > 0, node.id);
    assert.ok(node.caption.length <= 220, `${node.id} caption too long to read`);
  }
});

test('closed points cannot be confirmed by QR or manual selection', () => {
  const closed = nodes.map((node) => ({ ...node, available: false }));
  assert.equal(selectManually(closed, nodes[0].id), undefined);
  assert.equal(confirmByQr(closed, `ngo-ke://node/${nodes[0].id}`).ok, false);
});
