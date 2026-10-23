import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import { readAlleyStory, readAlleyGuide } from '../src/data/alleyGuide.ts';
import { parseDatasetV2 } from '../src/data/sourceState.ts';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const load = (name) => JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), 'utf8'));
const hashText = (text) => createHash('sha256').update(text).digest('hex');
const guide = {
  eat: [{ name: 'Quán', address: null, dishes: 'Món ăn', hours: null, note: null }],
  visit: [{ name: 'Di tích', address: null, notes: ['Chưa xác minh giờ.'] }],
  route: ['Cổng ngõ', 'Di tích'], caveats: [], evidence: ['Tài liệu người dùng'],
};
const story = { title: 'Câu chuyện ngõ', paragraphs: ['Một đoạn kể.'], evidence: ['Tài liệu người dùng'] };
const storyGroups = {
  'ngo-trung-yen': ['trung-yen-pho-suong', 'trung-yen-dinh-trung-yen', 'trung-yen-bun-ca-sam-cay-si', 'trung-yen-bun-ngan-nhan', 'trung-yen-pho-ga-huong-tra'],
  'ngo-gach': ['ngo-gach-ca-phe-no1', 'ngo-gach-ta-ca-phe-4', 'ngo-gach-dinh-thanh-ha', 'ngo-gach-cafe-20', 'ngo-gach-chua-cau-dong'],
  'ngo-tam-thuong': ['tam-thuong-dinh-yen-thai', 'tam-thuong-den-vong-tien'],
  'ngo-cam-chi': ['cam-chi-khong-gian-nghe-thuat', 'cam-chi-ngo-hoi-vu', 'cam-chi-den-vong-tien'],
  'ngo-phat-loc': ['phat-loc-den-tien-ha', 'phat-loc-cac-nhanh-ngo'],
};
const revisionSource = readFileSync(new URL('../src/data/collections.ts', import.meta.url), 'utf8');
const voiceHandoff = JSON.parse(readFileSync(new URL('../../docs/handoffs/2026-10-23-node-story-voice-handoff.json', import.meta.url), 'utf8'));

function collectionRevision(collectionId, locale) {
  const start = revisionSource.indexOf(`'${collectionId}': {`);
  assert.notEqual(start, -1);
  const end = revisionSource.indexOf('\n  },', start);
  const match = revisionSource.slice(start, end).match(new RegExp(`\\b${locale}: '([a-f0-9]{64})'`));
  assert.ok(match);
  return match[1];
}

test('optional alley readers fail closed for malformed nested content', () => {
  for (const value of [null, {}, [], { guide: null }]) assert.equal(readAlleyGuide(value), null);
  assert.equal(readAlleyStory({}), null);
  assert.equal(readAlleyStory({ alleyStory: { ...story, paragraphs: [] } }), null);
  for (const field of ['hours', 'note', 'address']) {
    assert.equal(readAlleyGuide({ guide: { ...guide, eat: [{ ...guide.eat[0], [field]: 9 }] } }), null);
  }
  assert.equal(readAlleyGuide({ guide: { ...guide, visit: [{ name: 'Di tích', address: null, notes: [9] }] } }), null);
  assert.equal(readAlleyGuide({ guide: { ...guide, caveats: ['x'.repeat(4001)] } }), null);
  assert.equal(readAlleyGuide({ guide: { ...guide, route: Array(41).fill('Điểm') } }), null);
  assert.deepEqual(readAlleyStory({ alleyStory: story }), story);
  assert.deepEqual(readAlleyGuide({ guide }), guide);
});

test('V2 validation accepts absent or valid optional alley fields and rejects malformed fields', () => {
  const old = load('localized/ngo-gach.vi.json');
  assert.ok(parseDatasetV2(old));
  assert.ok(parseDatasetV2({ ...old, alleyStory: story, guide }));
  assert.equal(parseDatasetV2({ ...old, alleyStory: null }), undefined);
  assert.equal(parseDatasetV2({ ...old, guide: { ...guide, eat: [{ ...guide.eat[0], hours: false }] } }), undefined);
});

test('17 VI and EN node stories match IDs, source datasets, revisions, and voice handoff', () => {
  const handoff = new Map(voiceHandoff.records.map((entry) => [`${entry.collectionId}|${entry.locale}|${entry.nodeId}`, entry]));
  assert.equal(voiceHandoff.records.length, 34);
  assert.equal(handoff.size, 34);
  let nodeCount = 0;

  for (const [collectionId, expectedIds] of Object.entries(storyGroups)) {
    let pairedIds;
    for (const locale of ['vi', 'en']) {
      const dataset = load(`localized/${collectionId}.${locale}.json`);
      assert.equal(dataset.collectionId, collectionId);
      assert.equal(dataset.locale, locale);
      assert.ok(dataset.intro.evidence.length > 0);
      const ids = dataset.nodes.map(({ id }) => id);
      assert.deepEqual(ids, expectedIds);
      if (pairedIds) assert.deepEqual(ids, pairedIds);
      pairedIds = ids;

      const datasetRevision = hashText(canonicalDatasetJson(dataset));
      assert.equal(datasetRevision, collectionRevision(collectionId, locale));
      for (const node of dataset.nodes) {
        assert.ok(typeof node.story === 'string' && node.story.trim());
        assert.doesNotMatch(node.story, /\d|https?:\/\//i);
        const entry = handoff.get(`${collectionId}|${locale}|${node.id}`);
        assert.ok(entry);
        assert.equal(entry.contentId, `${node.id}-story`);
        assert.equal(entry.textHash, hashText(node.story));
        assert.equal(entry.datasetRevision, datasetRevision);
        nodeCount++;
      }
    }
  }

  assert.equal(nodeCount, 34);
});

test('unchanged legacy datasets retain their canonical content fingerprint', () => {
  const fiction = load('demo.json');
  assert.equal(createHash('sha256').update(canonicalDatasetJson(fiction)).digest('hex'),
    'eb4593368b5c34aace4b14ef7588478b35419533402f400cb4e486cec74eb7e5');
  for (const name of ['old-quarter.vi.json', 'ngo-gach.vi.json']) assert.ok(parseDatasetV2(load(`localized/${name}`)));
});
