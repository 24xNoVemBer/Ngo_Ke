import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import { readAlleyStory, readAlleyGuide } from '../src/data/alleyGuide.ts';
import { parseDatasetV2 } from '../src/data/sourceState.ts';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const load = (name) => JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), 'utf8'));
const guide = {
  eat: [{ name: 'Quán', address: null, dishes: 'Món ăn', hours: null, note: null }],
  visit: [{ name: 'Di tích', address: null, notes: ['Chưa xác minh giờ.'] }],
  route: ['Cổng ngõ', 'Di tích'], caveats: [], evidence: ['Tài liệu người dùng'],
};
const story = { title: 'Câu chuyện ngõ', paragraphs: ['Một đoạn kể.'], evidence: ['Tài liệu người dùng'] };

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

test('unchanged legacy datasets retain their canonical content fingerprint', () => {
  const fiction = load('demo.json');
  assert.equal(createHash('sha256').update(canonicalDatasetJson(fiction)).digest('hex'),
    'eb4593368b5c34aace4b14ef7588478b35419533402f400cb4e486cec74eb7e5');
  for (const name of ['old-quarter.vi.json', 'ngo-gach.vi.json']) assert.ok(parseDatasetV2(load(`localized/${name}`)));
});
