import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { getSourceState } from '../src/data/sourceState.ts';

const validFixture = {
  schemaVersion: 1,
  kind: 'simulated',
  disclaimer: 'Sáu điểm mô phỏng, không phải địa điểm thật.',
  intro: { text: 'Chào bạn, đây là phần giới thiệu mô phỏng.', evidence: ['Nội dung demo kỹ thuật'] },
  startNodeId: 'demo-01',
  nodes: [
    { id: 'demo-01', name: 'Điểm demo 01', summary: 'Mô tả 01.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 01.', caption: 'Caption 01.', latitude: 10.76, longitude: 106.68 },
    { id: 'demo-02', name: 'Điểm demo 02', summary: 'Mô tả 02.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 02.', caption: 'Caption 02.', latitude: 10.76, longitude: 106.68 },
    { id: 'demo-03', name: 'Điểm demo 03', summary: 'Mô tả 03.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 03.', caption: 'Caption 03.', latitude: 10.76, longitude: 106.68 },
    { id: 'demo-04', name: 'Điểm demo 04', summary: 'Mô tả 04.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 04.', caption: 'Caption 04.', latitude: 10.76, longitude: 106.68 },
    { id: 'demo-05', name: 'Điểm demo 05', summary: 'Mô tả 05.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 05.', caption: 'Caption 05.', latitude: 10.76, longitude: 106.68 },
    { id: 'demo-06', name: 'Điểm demo 06', summary: 'Mô tả 06.', tags: ['an thuc'], visitMinutes: 10, available: true, visited: false, story: 'Lời kể 06.', caption: 'Caption 06.', latitude: 10.76, longitude: 106.68 },
  ],
  qa: [
    {
      id: 'qa-01',
      question: 'Đây là điểm nào?',
      answer: 'Bạn đang ở Điểm demo 01.',
      nodeId: 'demo-01',
      aliases: ['o dau day'],
      evidence: ['Nội dung demo kỹ thuật'],
      followUps: ['qa-02'],
      tags: ['gioi thieu'],
    },
    {
      id: 'qa-02',
      question: 'Có gì để xem?',
      answer: 'Có sáu điểm mô phỏng.',
      nodeId: 'demo-01',
      aliases: ['co gi de xem o day'],
      evidence: ['Nội dung demo kỹ thuật'],
      followUps: [],
      tags: ['gioi thieu'],
    },
  ],
};

test('valid simulated fixture becomes demo ready with six points', () => {
  const source = getSourceState('demo', validFixture);
  assert.equal(source.mode, 'demo');
  assert.equal(source.status, 'ready');
  assert.deepEqual(
    source.dataset.nodes.map((node) => ({ id: node.id, name: node.name })),
    validFixture.nodes.map((node) => ({ id: node.id, name: node.name })),
  );
  assert.equal(source.dataset.disclaimer, validFixture.disclaimer);
});

// Regression: missing demo data must never be presented as a working fixture.
test('missing original fixture reports a demo error without dataset', () => {
  const source = getSourceState('demo');
  assert.equal(source.mode, 'demo');
  assert.equal(source.status, 'error');
  assert.equal('dataset' in source, false);
});

// Regression: switching to live must not keep demo status or silently load a fixture.
test('unconfigured live never receives fixture even after viewing demo', () => {
  getSourceState('demo', validFixture);
  const source = getSourceState('live', validFixture);
  assert.equal(source.mode, 'live');
  assert.equal(source.status, 'empty');
  assert.equal('dataset' in source, false);
});

test('invalid demo input returns error without partial dataset', async (t) => {
  const invalidInputs = [
    ['null', null],
    ['string', 'fixture'],
    ['array', []],
    ['version', { ...validFixture, schemaVersion: 2 }],
    ['missing simulation label', { ...validFixture, kind: 'live' }],
    ['empty disclaimer', { ...validFixture, disclaimer: '  ' }],
    ['missing nodes', { ...validFixture, nodes: undefined }],
    ['empty nodes', { ...validFixture, nodes: [] }],
    ['five nodes', { ...validFixture, nodes: validFixture.nodes.slice(0, 5) }],
    ['null node', { ...validFixture, nodes: [null, ...validFixture.nodes.slice(1)] }],
    ['blank name', { ...validFixture, nodes: [{ ...validFixture.nodes[0], name: ' ' }, ...validFixture.nodes.slice(1)] }],
    ['non-string name', { ...validFixture, nodes: [{ ...validFixture.nodes[0], name: 1 }, ...validFixture.nodes.slice(1)] }],
    ['invalid id', { ...validFixture, nodes: [{ ...validFixture.nodes[0], id: null }, ...validFixture.nodes.slice(1)] }],
    ['blank story', { ...validFixture, nodes: [{ ...validFixture.nodes[0], story: ' ' }, ...validFixture.nodes.slice(1)] }],
    ['blank caption', { ...validFixture, nodes: [{ ...validFixture.nodes[0], caption: '' }, ...validFixture.nodes.slice(1)] }],
    ['unknown topic', { ...validFixture, nodes: [{ ...validFixture.nodes[0], tags: ['dia diem that'] }, ...validFixture.nodes.slice(1)] }],
    ['zero minutes', { ...validFixture, nodes: [{ ...validFixture.nodes[0], visitMinutes: 0 }, ...validFixture.nodes.slice(1)] }],
    ['latitude out of range', { ...validFixture, nodes: [{ ...validFixture.nodes[0], latitude: 91 }, ...validFixture.nodes.slice(1)] }],
    ['longitude out of range', { ...validFixture, nodes: [{ ...validFixture.nodes[0], longitude: -181 }, ...validFixture.nodes.slice(1)] }],
    ['missing coordinates', { ...validFixture, nodes: [{ ...validFixture.nodes[0], latitude: undefined }, ...validFixture.nodes.slice(1)] }],
    ['duplicate ids', { ...validFixture, nodes: [validFixture.nodes[1], ...validFixture.nodes.slice(1)] }],
  ];
  for (const [name, input] of invalidInputs) {
    await t.test(name, () => {
      const source = getSourceState('demo', input);
      assert.equal(source.mode, 'demo');
      assert.equal(source.status, 'error');
      assert.equal('dataset' in source, false);
    });
  }
});

test('switching back to demo revalidates current input instead of retaining old data', () => {
  getSourceState('demo', validFixture);
  getSourceState('live', validFixture);
  const source = getSourceState('demo', null);
  assert.equal(source.status, 'error');
  assert.equal('dataset' in source, false);
});

test('actual bundled fiction preserves six simulated point IDs and chapter names', () => {
  const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));
  const source = getSourceState('demo', fixture);
  assert.equal(source.status, 'ready');
  assert.deepEqual(
    source.dataset.nodes.map((node) => ({ id: node.id, name: node.name })),
    ['Cổng ngõ', 'Hiên đồng hồ', 'Bếp đầu hè', 'Sân hoa giấy', 'Bậc thềm nắng', 'Đèn cuối ngõ']
      .map((name, index) => ({ id: `demo-0${index + 1}`, name })),
  );
  assert.deepEqual(Object.keys(fixture).sort(), [
    'disclaimer',
    'intro',
    'kind',
    'nodes',
    'qa',
    'schemaVersion',
    'startNodeId',
  ]);
  for (const node of fixture.nodes) {
    assert.deepEqual(Object.keys(node).sort(), [
      'available',
      'caption',
      'id',
      'latitude',
      'longitude',
      'name',
      'story',
      'summary',
      'tags',
      'visitMinutes',
      'visited',
    ]);
  }
});
