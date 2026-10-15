import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { findAnswer, normalizeQuestion } from '../src/qa/match.ts';
import { getSourceState } from '../src/data/sourceState.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);

test('demo dataset edits advance the voice turn revision', () => {
  const source = readFileSync(new URL('../../data/demo.json', import.meta.url));
  const revision = createHash('sha256').update(source).digest('hex');
  const catalog = readFileSync(new URL('../src/voice/catalog.ts', import.meta.url), 'utf8');
  assert.ok(catalog.includes(`export const voiceCatalogueRevision = "${revision}";`));
});

test('normalize folds case, diacritics, spacing and trailing punctuation', () => {
  assert.equal(normalizeQuestion('  Ngõ   Kể  '), 'ngo ke');
  assert.equal(normalizeQuestion('Ăn gì ở đây?'), 'an gi o day');
  assert.equal(normalizeQuestion('Chuyện xưa!!!'), 'chuyen xua');
  assert.equal(normalizeQuestion('quán ăn .'), 'quan an');
});

test('question asked exactly returns that entry', () => {
  const entry = fixture.qa[0];
  const match = findAnswer(fixture.qa, entry.question);
  assert.equal(match.status, 'matched');
  assert.equal(match.entry.id, entry.id);
  assert.equal(match.matchedOn, 'question');
  assert.equal(match.entry.answer, entry.answer);
});

test('alias and differently written question return the same entry', () => {
  const entry = fixture.qa.find((item) => item.aliases.length > 0);
  for (const alias of entry.aliases) {
    const match = findAnswer(fixture.qa, alias);
    assert.equal(match.status, 'matched');
    assert.equal(match.entry.id, entry.id);
    assert.equal(match.matchedOn, 'alias');
  }
  const shouted = findAnswer(fixture.qa, entry.question.toUpperCase() + '?');
  assert.equal(shouted.status, 'matched');
  assert.equal(shouted.matchedOn, 'question');
});

test('all 21 questions and aliases resolve only within their owning chapter', () => {
  assert.equal(fixture.qa.length, 21);
  assert.deepEqual(
    [...new Set(fixture.qa.map((entry) => entry.nodeId))].sort(),
    ['demo-01', 'demo-02', 'demo-03', 'demo-04', 'demo-05', 'demo-06'],
  );

  for (const entry of fixture.qa) {
    const chapterEntries = fixture.qa.filter((candidate) => candidate.nodeId === entry.nodeId);
    for (const prompt of [entry.question, ...entry.aliases]) {
      const match = findAnswer(chapterEntries, prompt);
      assert.equal(match.status, 'matched', `${entry.id}: ${prompt}`);
      assert.equal(match.entry.id, entry.id, `${entry.id}: ${prompt}`);
      assert.equal(match.entry.nodeId, entry.nodeId, `${entry.id}: ${prompt}`);
      assert.equal(match.entry.answer, entry.answer, `${entry.id}: ${prompt}`);
    }

    for (const otherNode of fixture.nodes.filter((node) => node.id !== entry.nodeId)) {
      const otherChapter = fixture.qa.filter((candidate) => candidate.nodeId === otherNode.id);
      assert.equal(findAnswer(otherChapter, entry.question).status, 'unknown', `${entry.id} leaked to ${otherNode.id}`);
    }
  }
});

test('question outside the approved list returns unknown with no answer', () => {
  for (const text of ['mua bao nhieu', 'cho em xin dia chi wifi', '   ', 'ban co quan an khong']) {
    const match = findAnswer(fixture.qa, text);
    assert.equal(match.status, 'unknown');
    assert.equal('entry' in match, false);
  }
});

test('observed synthetic ASR transcripts resolve to their intended exact answers', () => {
  const transcripts = [
    ['demo-02', 'qa-lam', 'Ông Lâm Nhữ An ra sao?'],
    ['demo-04', 'qa-flowers', 'Hai chồng giàn hoa giấy trong sân'],
    ['demo-04', 'qa-knot', 'Nút thắp trên rằm cây nhắc ăn điều gì?'],
    ['demo-04', 'qa-che', 'Cốc tre của bà Nhi gợi lại ký ức nào?'],
    ['demo-02', 'qa-lam', 'Ông Lâm nhửa an ra sao?'],
    ['demo-04', 'qa-flowers', '2 trồng giàn hoa giấy trong sân.'],
    ['demo-04', 'qa-flowers', 'Ai trồng ràn hoa giấy trong sân?'],
    ['demo-04', 'qa-knot', 'nút thắp trên giảng cây nhắc ăn điều gì.'],
    ['demo-04', 'qa-che', 'Cốc chè của bà Nhi gợi lại kỷ ước nào.'],
    ['demo-05', 'qa-box', 'Chịa chia khóa mở được thứ gì?'],
    ['demo-05', 'qa-box', 'Việc chìa khóa mở được thứ gì?'],
    ['demo-05', 'qa-envelope', 'Vì sao ăn đọc lá thư thật trọng?'],
    ['demo-06', 'qa-letter', 'Mẹ viết gì ở cuối lá thơ?'],
    ['demo-06', 'qa-light', 'Vì sao mẹ hẹ lúc đèn cuối ngõ sáng?'],
    ['demo-06', 'qa-home', 'Anh đã tìm thấy đường về như thế nào?'],
  ];

  for (const [nodeId, expectedId, transcript] of transcripts) {
    const chapter = fixture.qa.filter((entry) => entry.nodeId === nodeId);
    const match = findAnswer(chapter, transcript);
    assert.equal(match.status, 'matched', transcript);
    assert.equal(match.entry.id, expectedId, transcript);
    assert.equal(match.entry.nodeId, nodeId, transcript);
    assert.equal(match.matchedOn, 'alias', transcript);
    assert.equal(match.entry.answer, fixture.qa.find((entry) => entry.id === expectedId).answer);

    for (const otherNode of fixture.nodes.filter((node) => node.id !== nodeId)) {
      const otherChapter = fixture.qa.filter((entry) => entry.nodeId === otherNode.id);
      assert.equal(findAnswer(otherChapter, transcript).status, 'unknown', `${transcript} leaked to ${otherNode.id}`);
    }
  }
});

test('known synthetic ASR near-misses stay unknown instead of guessing', () => {
  const nearMisses = [
    ['demo-02', 'Vì sao, chiếc động hồ không chạy nữa?'],
    ['demo-02', 'Vì sao chức động hồ không chạy nữa?'],
    ['demo-02', 'Bánh sang mẹ gửi có ý nghĩa gì?'],
    ['demo-02', 'Mánh răng mẹ gửi có ý nghĩa gì?'],
    ['demo-02', 'bánh răng mẹ cười có ý nghĩa gì?'],
    ['demo-02', 'Ông Lâm nhỡ ăn ra sau'],
    ['demo-02', 'Công lâm nhựa ăn ra sao?'],
    ['demo-03', 'Sợi giây xanh nối những điều gì?'],
    ['demo-03', 'Vậy sao cô Hương vẫn gọi ăn là bé con?'],
    ['demo-03', 'Vậy sao cô Hương vẫn gọi An là bé con?'],
    ['demo-04', '2 trồng dàn hoa giấy trong sân.'],
    ['demo-04', 'Ai trồng dàn hoa giấy trong sân.'],
    ['demo-04', 'Ai chồng giản hoa giấy trong sân?'],
    ['demo-04', 'nốt thắt trên giản cây nhất ăn điều gì.'],
    ['demo-04', 'Nút tháp chiên dàn cây nhắc ăn điều gì.'],
    ['demo-04', 'Nút thắt chiên dàn cây nhắc ăn điều gì.'],
    ['demo-04', 'Nút thắp trên giản cây nhắc ăn điều gì.'],
    ['demo-04', 'Cốc chè của bà Nhi gọi lại kí ức nào.'],
    ['demo-04', 'ốc che của bà Nhi gợi lại kí ức nào.'],
    ['demo-04', 'Cốc chè của bà Nhi gợi lại kí ức nào.'],
    ['demo-04', 'Hai trùng giàn hoa giấy trong sân.'],
    ['demo-05', 'Chấp chiều khóa mở được thứ gì?'],
    ['demo-05', 'Chích chiều khóa mở được thứ gì?'],
    ['demo-05', 'chiếc chiều khóa mở được thứ gì?'],
    ['demo-05', 'Chiếc chiều khóa mở được thú gì?'],
    ['demo-05', 'Vì sao anh đọc lá thư thật chậm?'],
    ['demo-05', 'Vì sao, ăn đọc là thư thật chậm.'],
    ['demo-05', 'Vì sao, ăn đọc lá thư thật trọng.'],
    ['demo-05', 'Dì sao, ăn đọc lá thư thật trọng.'],
    ['demo-05', 'Vì sao, ông đọc lá thư thật trận.'],
    ['demo-05', 'Bà Nhi, để món gì cảnh hộp thứ?'],
    ['demo-06', 'Vì sao, mệ hệ lúc đèn cuối ngọ sáng.'],
  ];

  for (const [nodeId, transcript] of nearMisses) {
    const chapter = fixture.qa.filter((entry) => entry.nodeId === nodeId);
    const match = findAnswer(chapter, transcript);
    assert.equal(match.status, 'unknown', transcript);
    assert.equal('entry' in match, false, transcript);
  }
});

test('every shipped answer has non-empty evidence', () => {
  assert.ok(fixture.qa.length > 0);
  for (const entry of fixture.qa) {
    assert.ok(entry.evidence.length > 0, entry.id);
    for (const source of entry.evidence) assert.ok(source.trim().length > 0, entry.id);
    assert.ok(entry.answer.trim().length > 0, entry.id);
  }
});

test('every follow-up points at a real entry', () => {
  const ids = new Set(fixture.qa.map((entry) => entry.id));
  for (const entry of fixture.qa) {
    assert.ok(entry.followUps.length <= 2, entry.id);
    for (const followUp of entry.followUps) assert.ok(ids.has(followUp), `${entry.id} -> ${followUp}`);
  }
});

test('demo dataset with intro and qa becomes ready', () => {
  const source = getSourceState('demo', fixture);
  assert.equal(source.status, 'ready');
  assert.equal(source.dataset.startNodeId, fixture.startNodeId);
  assert.ok(source.dataset.intro.text.trim().length > 0);
  assert.ok(source.dataset.qa.length > 0);
  assert.ok(fixture.nodes.some((node) => node.id === fixture.startNodeId));
});

test('qa content failing the reviewed contract is rejected', async (t) => {
  const valid = fixture;
  const first = valid.qa[0];
  const cases = [
    ['answer without evidence', { ...valid, qa: [{ ...first, evidence: [] }, ...valid.qa.slice(1)] }],
    ['blank evidence item', { ...valid, qa: [{ ...first, evidence: ['  '] }, ...valid.qa.slice(1)] }],
    ['no aliases', { ...valid, qa: [{ ...first, aliases: [] }, ...valid.qa.slice(1)] }],
    ['too many aliases', { ...valid, qa: [{ ...first, aliases: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] }, ...valid.qa.slice(1)] }],
    ['followUp not in qa', { ...valid, qa: [{ ...first, followUps: ['qa-khong-ton-tai'] }, ...valid.qa.slice(1)] }],
    ['three followUps', { ...valid, qa: [{ ...first, followUps: [valid.qa[1].id, valid.qa[2].id, valid.qa[3].id] }, ...valid.qa.slice(1)] }],
    ['duplicate id', { ...valid, qa: [first, { ...first, question: 'khác' }, ...valid.qa.slice(1)] }],
    ['normalized question alias collision', { ...valid, qa: [first, { ...valid.qa[1], aliases: [first.question.toUpperCase() + '?'] }, ...valid.qa.slice(2)] }],
    ['unknown nodeId', { ...valid, qa: [{ ...first, nodeId: 'diem-khong-co' }, ...valid.qa.slice(1)] }],
    ['blank intro', { ...valid, intro: { text: '  ', evidence: ['Nguồn demo'] } }],
    ['intro without evidence', { ...valid, intro: { text: 'Xin chào', evidence: [] } }],
    ['startNodeId not a node', { ...valid, startNodeId: 'demo-99' }],
    ['empty qa', { ...valid, qa: [] }],
    ['missing qa', { ...valid, qa: undefined }],
  ];
  for (const [name, invalid] of cases) {
    await t.test(name, () => {
      const source = getSourceState('demo', invalid);
      assert.equal(source.mode, 'demo');
      assert.equal(source.status, 'error');
      assert.equal('dataset' in source, false);
    });
  }
});

test('live mode never exposes qa content', () => {
  const source = getSourceState('live', fixture);
  assert.equal(source.status, 'empty');
  assert.equal('dataset' in source, false);
});
