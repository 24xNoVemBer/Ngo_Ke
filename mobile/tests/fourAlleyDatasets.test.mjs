import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { parseDatasetV2, validateDatasetV2Pair } from '../src/data/sourceState.ts';
import { readAlleyStory, readAlleyGuide } from '../src/data/alleyGuide.ts';

const root = new URL('../../', import.meta.url);
const source = readFileSync(new URL('docs/content/FOUR_ALLEYS_SOURCE_20261022.md', root), 'utf8');
const sections = source.replace(/\[[abc]\]/g, '').split(/(?=^(?:I|II|III|IV)\. NGÕ)/m)
  .filter((section) => /^(?:I|II|III|IV)\. NGÕ/.test(section));
const ids = ['ngo-trung-yen', 'ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc'];
const load = (id, locale = 'vi') => JSON.parse(readFileSync(new URL(`data/localized/${id}.${locale}.json`, root), 'utf8'));
const enNarrationSource = readFileSync(new URL('docs/content/FOUR_ALLEYS_EN_NARRATION_20261023.md', root), 'utf8').replace(/\r\n/g, '\n');

function readEnNarration(id) {
  const index = ids.indexOf(id);
  const heading = `## ${index + 1}. ${id} (EN)`;
  const headingStart = enNarrationSource.indexOf(heading);
  assert.notEqual(headingStart, -1, `${id} EN narration block exists`);
  const contentStart = enNarrationSource.indexOf('\n', headingStart) + 1;
  const nextHeading = enNarrationSource.indexOf('\n## ', contentStart);
  return enNarrationSource.slice(contentStart, nextHeading === -1 ? undefined : nextHeading).trim();
}

test('four VI datasets map source parts to story, narration and guide without mixing source notes into narration', () => {
  assert.equal(sections.length, 4);
  for (const [index, id] of ids.entries()) {
    const data = load(id);
    assert.ok(parseDatasetV2(data), id);
    assert.equal(data.kind, 'simulated');
    assert.equal(data.reviewStatus, undefined);
    assert.deepEqual(data.qa, []);
    const story = readAlleyStory(data);
    const guide = readAlleyGuide(data);
    assert.ok(story && guide);
    const section = sections[index];
    const narration = section.match(/^2\. [^\n]*\n([\s\S]*?)(?=^[ \t]*3\. )/m)[1]
      .split(/^Nguồn biên soạn:/m)[0].trim().split('\n').map((line) => line.trim()).filter(Boolean).join('\n\n');
    assert.equal(data.intro.text, narration, `${id}: narration must be the source's part 2`);
    assert.equal(data.intro.text.includes('Nguồn biên soạn:'), false);
    assert.equal(/\[[abc]\]/.test(story.paragraphs.join('\n')), false);
    const history = section.match(/^1\. [^\n]*\n([\s\S]*?)(?=^2\. )/m)[1]
      .trim().split('\n').map((line) => line.trim()).filter(Boolean);
    assert.deepEqual(story.paragraphs, history);
    assert.equal(guide.eat.length, [4, 4, 4, 3][index]);
    assert.equal(guide.route.length, [4, 5, 5, 5][index]);
    for (const eat of guide.eat) {
      assert.ok(section.includes(eat.name));
      assert.ok(section.includes(eat.address));
      assert.ok(section.includes(eat.dishes));
      if (eat.hours !== null) assert.ok(eat.hours.startsWith('Giờ tham khảo: '));
      else assert.ok(eat.note, 'unknown hours keep the source uncertainty');
    }
    assert.ok(guide.evidence.every((entry) => entry.includes('https://')));
  }
});

test('Trung Yên replaces only the requested stop identities and keeps minimum EN alignment', () => {
  const vi = load('ngo-trung-yen');
  const en = load('ngo-trung-yen', 'en');
  assert.ok(parseDatasetV2(en));
  assert.deepEqual(validateDatasetV2Pair(vi, en), { ok: true });
  assert.equal(vi.nodes.length, 5);
  assert.deepEqual(vi.nodes.map((node) => node.id), [
    'trung-yen-pho-suong', 'trung-yen-dinh-trung-yen', 'trung-yen-bun-ca-sam-cay-si',
    'trung-yen-bun-ngan-nhan', 'trung-yen-pho-ga-huong-tra',
  ]);
  assert.equal(vi.lengthMeters, 146);
  assert.deepEqual(vi.polyline, en.polyline);
  assert.equal(vi.nodes[0].latitude, 21.03355);
  assert.equal(vi.nodes[2].latitude, 21.0334206);
  assert.ok(vi.nodes.find((node) => node.id === 'trung-yen-pho-ga-huong-tra').tags.includes('an thuc'));
  assert.ok(vi.nodes.find((node) => node.id === 'trung-yen-dinh-trung-yen').tags.includes('chuyen xua'));
  for (const index of [1, 4]) {
    assert.equal(vi.nodes[index].latitude, null);
    assert.equal(vi.nodes[index].longitude, null);
    assert.equal(vi.nodes[index].story, null);
  }
  assert.ok(readAlleyStory(en));
  assert.ok(readAlleyGuide(en));
});

test('three new VI collections keep geometry placeholders and no invented point stories', () => {
  for (const [index, id] of ids.slice(1).entries()) {
    const data = load(id);
    assert.equal(data.nodes.length, [2, 3, 2][index]);
    assert.equal(data.polyline, undefined);
    assert.equal(data.lengthMeters, undefined);
    for (const node of data.nodes) {
      assert.equal(node.story, null);
      assert.equal(node.latitude, null);
      assert.equal(node.longitude, null);
    }
    assert.match(data.disclaimer, /ước tính demo/);
  }
});

test('all four EN alley datasets match the approved narration and preserve VI structure and evidence', () => {
  for (const id of ids) {
    const vi = load(id);
    const en = load(id, 'en');
    assert.equal(en.locale, 'en');
    assert.ok(parseDatasetV2(en), `${id} EN parses`);
    assert.deepEqual(validateDatasetV2Pair(vi, en), { ok: true });
    assert.equal(en.intro.text, readEnNarration(id), `${id} intro matches the approved narration block`);
    assert.deepEqual(en.nodes.map(({ id: nodeId, order }) => [nodeId, order]), vi.nodes.map(({ id: nodeId, order }) => [nodeId, order]));
    assert.equal(en.nodes.length, vi.nodes.length);
    assert.equal(en.startNodeId, vi.startNodeId);
    assert.deepEqual({
      intro: en.intro.evidence,
      nodes: en.nodes.map((node) => node.evidence),
      story: en.alleyStory.evidence,
      guide: en.guide.evidence,
    }, {
      intro: vi.intro.evidence,
      nodes: vi.nodes.map((node) => node.evidence),
      story: vi.alleyStory.evidence,
      guide: vi.guide.evidence,
    });
  }
});

test('source uncertainties remain content, including opening times, legend, historical prices and private access', () => {
  const tam = load('ngo-tam-thuong');
  const cam = load('ngo-cam-chi');
  const phat = load('ngo-phat-loc');
  assert.ok(tam.guide.caveats.some((line) => line.includes('ý kiến trải nghiệm')));
  assert.ok(cam.guide.caveats.some((line) => line.includes('2020') && line.includes('giá hiện hành')));
  assert.ok(cam.alleyStory.paragraphs.some((line) => line.includes('giai thoại dân gian') && line.includes('không phải')));
  assert.ok(phat.guide.visit.some((visit) => visit.notes.some((line) => line.includes('46 hoặc 48'))));
  assert.ok(phat.guide.visit.some((visit) => visit.notes.some((line) => line.includes('không tự ý vào nhà dân'))));
  assert.ok(phat.guide.eat.some((eat) => eat.hours === null));
});
