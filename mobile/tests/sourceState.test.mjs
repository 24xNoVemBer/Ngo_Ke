import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { getSourceState, parseDataset } from '../src/data/sourceState.ts';

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
    nodes: validFixture.nodes.map((node) => ({
      ...node,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
    qa: validFixture.qa.map((qa) => ({
      ...qa,
      reviewStatus: 'approved',
      updatedAt: ts,
    })),
  };
}

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
    ['missing simulation label', { ...validFixture, kind: 'reviewed' }],
    ['empty disclaimer', { ...validFixture, disclaimer: '  ' }],
    ['disclaimer too long', { ...validFixture, disclaimer: 'x'.repeat(2001) }],
    ['missing nodes', { ...validFixture, nodes: undefined }],
    ['empty nodes', { ...validFixture, nodes: [] }],
    ['five nodes', { ...validFixture, nodes: validFixture.nodes.slice(0, 5) }],
    ['seven nodes', { ...validFixture, nodes: [...validFixture.nodes, { ...validFixture.nodes[0], id: 'demo-07' }] }],
    ['null node', { ...validFixture, nodes: [null, ...validFixture.nodes.slice(1)] }],
    ['blank name', { ...validFixture, nodes: [{ ...validFixture.nodes[0], name: ' ' }, ...validFixture.nodes.slice(1)] }],
    ['name too long', { ...validFixture, nodes: [{ ...validFixture.nodes[0], name: 'x'.repeat(501) }, ...validFixture.nodes.slice(1)] }],
    ['non-string name', { ...validFixture, nodes: [{ ...validFixture.nodes[0], name: 1 }, ...validFixture.nodes.slice(1)] }],
    ['invalid id', { ...validFixture, nodes: [{ ...validFixture.nodes[0], id: null }, ...validFixture.nodes.slice(1)] }],
    ['id too long', { ...validFixture, nodes: [{ ...validFixture.nodes[0], id: 'x'.repeat(129) }, ...validFixture.nodes.slice(1)] }],
    ['blank story', { ...validFixture, nodes: [{ ...validFixture.nodes[0], story: ' ' }, ...validFixture.nodes.slice(1)] }],
    ['story too long', { ...validFixture, nodes: [{ ...validFixture.nodes[0], story: 'x'.repeat(2001) }, ...validFixture.nodes.slice(1)] }],
    ['blank caption', { ...validFixture, nodes: [{ ...validFixture.nodes[0], caption: '' }, ...validFixture.nodes.slice(1)] }],
    ['caption too long', { ...validFixture, nodes: [{ ...validFixture.nodes[0], caption: 'x'.repeat(221) }, ...validFixture.nodes.slice(1)] }],
    ['unknown topic', { ...validFixture, nodes: [{ ...validFixture.nodes[0], tags: ['dia diem that'] }, ...validFixture.nodes.slice(1)] }],
    ['zero minutes', { ...validFixture, nodes: [{ ...validFixture.nodes[0], visitMinutes: 0 }, ...validFixture.nodes.slice(1)] }],
    ['negative minutes', { ...validFixture, nodes: [{ ...validFixture.nodes[0], visitMinutes: -5 }, ...validFixture.nodes.slice(1)] }],
    ['latitude out of range', { ...validFixture, nodes: [{ ...validFixture.nodes[0], latitude: 91 }, ...validFixture.nodes.slice(1)] }],
    ['longitude out of range', { ...validFixture, nodes: [{ ...validFixture.nodes[0], longitude: -181 }, ...validFixture.nodes.slice(1)] }],
    ['missing coordinates', { ...validFixture, nodes: [{ ...validFixture.nodes[0], latitude: undefined }, ...validFixture.nodes.slice(1)] }],
    ['duplicate ids', { ...validFixture, nodes: [validFixture.nodes[1], ...validFixture.nodes.slice(1)] }],
    ['intro text too long', { ...validFixture, intro: { text: 'x'.repeat(4001), evidence: ['Nguồn'] } }],
    ['intro evidence item too long', { ...validFixture, intro: { text: 'Lời giới thiệu', evidence: ['x'.repeat(2001)] } }],
    ['intro evidence count too high', { ...validFixture, intro: { text: 'Lời giới thiệu', evidence: Array(21).fill('Nguồn') } }],
    ['qa question too long', { ...validFixture, qa: [{ ...validFixture.qa[0], question: 'x'.repeat(501) }, validFixture.qa[1]] }],
    ['qa answer too long', { ...validFixture, qa: [{ ...validFixture.qa[0], answer: 'x'.repeat(2001) }, validFixture.qa[1]] }],
    ['qa too many aliases', { ...validFixture, qa: [{ ...validFixture.qa[0], aliases: Array(8).fill('alias') }, validFixture.qa[1]] }],
    ['qa too many followUps', { ...validFixture, qa: [{ ...validFixture.qa[0], followUps: ['qa-02', 'qa-02', 'qa-02'] }, validFixture.qa[1]] }],
    ['qa too many tags', { ...validFixture, qa: [{ ...validFixture.qa[0], tags: Array(21).fill('tag') }, validFixture.qa[1]] }],
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

test('live mode accepts 1 to 50 nodes and 0 to 200 QA entries', () => {
  const oneNode = {
    ...validFixture,
    startNodeId: 'demo-01',
    nodes: [validFixture.nodes[0]],
    qa: [],
  };
  assert.ok(parseDataset(oneNode, { mode: 'live' }));
  // But rejected in demo mode (which requires exactly 6 nodes and >= 1 QA)
  assert.equal(parseDataset(oneNode, { mode: 'demo' }), undefined);
  assert.equal(parseDataset(oneNode), undefined);

  // 50 nodes in live mode
  const fiftyNodes = {
    ...validFixture,
    startNodeId: 'node-0',
    nodes: Array.from({ length: 50 }, (_, i) => ({
      ...validFixture.nodes[0],
      id: `node-${i}`,
      name: `Điểm ${i}`,
    })),
    qa: [],
  };
  assert.ok(parseDataset(fiftyNodes, { mode: 'live' }));

  // 51 nodes is rejected
  const fiftyOneNodes = {
    ...fiftyNodes,
    nodes: Array.from({ length: 51 }, (_, i) => ({
      ...validFixture.nodes[0],
      id: `node-${i}`,
      name: `Điểm ${i}`,
    })),
  };
  assert.equal(parseDataset(fiftyOneNodes, { mode: 'live' }), undefined);

  // 0 nodes is rejected
  const zeroNodes = {
    ...validFixture,
    nodes: [],
  };
  assert.equal(parseDataset(zeroNodes, { mode: 'live' }), undefined);

  // 200 QA in live mode
  const twoHundredQa = {
    ...oneNode,
    qa: Array.from({ length: 200 }, (_, i) => ({
      id: `qa-${i}`,
      question: `Câu hỏi số ${i}?`,
      answer: `Câu trả lời ${i}.`,
      nodeId: 'demo-01',
      aliases: [`cau hoi ${i}`],
      evidence: ['Nguồn'],
      followUps: [],
      tags: [],
    })),
  };
  assert.ok(parseDataset(twoHundredQa, { mode: 'live' }));

  // 201 QA is rejected
  const twoHundredOneQa = {
    ...oneNode,
    qa: Array.from({ length: 201 }, (_, i) => ({
      id: `qa-${i}`,
      question: `Câu hỏi số ${i}?`,
      answer: `Câu trả lời ${i}.`,
      nodeId: 'demo-01',
      aliases: [`cau hoi ${i}`],
      evidence: ['Nguồn'],
      followUps: [],
      tags: [],
    })),
  };
  assert.equal(parseDataset(twoHundredOneQa, { mode: 'live' }), undefined);
});

test('reviewed dataset requires complete approved reviewStatus and valid UTC updatedAt metadata', () => {
  const reviewed = makeReviewedFixture();
  assert.ok(parseDataset(reviewed, { mode: 'live' }));

  // Demo mode rejects kind 'reviewed'
  assert.equal(parseDataset(reviewed, { mode: 'demo' }), undefined);

  // Missing reviewStatus on intro
  const missingIntroStatus = makeReviewedFixture();
  delete missingIntroStatus.intro.reviewStatus;
  assert.equal(parseDataset(missingIntroStatus, { mode: 'live' }), undefined);

  // Missing updatedAt on intro
  const missingIntroUpdatedAt = makeReviewedFixture();
  delete missingIntroUpdatedAt.intro.updatedAt;
  assert.equal(parseDataset(missingIntroUpdatedAt, { mode: 'live' }), undefined);

  // Missing reviewStatus on a node
  const missingNodeStatus = makeReviewedFixture();
  delete missingNodeStatus.nodes[2].reviewStatus;
  assert.equal(parseDataset(missingNodeStatus, { mode: 'live' }), undefined);

  // Missing updatedAt on a node
  const missingNodeUpdatedAt = makeReviewedFixture();
  delete missingNodeUpdatedAt.nodes[2].updatedAt;
  assert.equal(parseDataset(missingNodeUpdatedAt, { mode: 'live' }), undefined);

  // Unapproved reviewStatus on a node
  const draftNode = makeReviewedFixture();
  draftNode.nodes[0].reviewStatus = 'draft';
  assert.equal(parseDataset(draftNode, { mode: 'live' }), undefined);

  // Non-UTC or invalid updatedAt on a node
  const localOffsetNode = makeReviewedFixture();
  localOffsetNode.nodes[0].updatedAt = '2026-10-16T02:00:00+07:00';
  assert.equal(parseDataset(localOffsetNode, { mode: 'live' }), undefined);

  const nonIsoDate = makeReviewedFixture();
  nonIsoDate.nodes[0].updatedAt = '2026-10-16 02:00:00';
  assert.equal(parseDataset(nonIsoDate, { mode: 'live' }), undefined);

  const invalidDate = makeReviewedFixture();
  invalidDate.nodes[0].updatedAt = 'not-a-valid-date';
  assert.equal(parseDataset(invalidDate, { mode: 'live' }), undefined);

  // Missing reviewStatus on QA
  const missingQaStatus = makeReviewedFixture();
  delete missingQaStatus.qa[0].reviewStatus;
  assert.equal(parseDataset(missingQaStatus, { mode: 'live' }), undefined);

  // Missing updatedAt on QA
  const missingQaUpdatedAt = makeReviewedFixture();
  delete missingQaUpdatedAt.qa[0].updatedAt;
  assert.equal(parseDataset(missingQaUpdatedAt, { mode: 'live' }), undefined);

  // Empty evidence on intro
  const emptyIntroEvidence = makeReviewedFixture();
  emptyIntroEvidence.intro.evidence = [];
  assert.equal(parseDataset(emptyIntroEvidence, { mode: 'live' }), undefined);

  // Empty evidence on QA
  const emptyQaEvidence = makeReviewedFixture();
  emptyQaEvidence.qa[0].evidence = [];
  assert.equal(parseDataset(emptyQaEvidence, { mode: 'live' }), undefined);
});
