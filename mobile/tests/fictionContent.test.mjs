import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { parseDataset } from '../src/data/sourceState.ts';
import { findAnswer } from '../src/qa/match.ts';

const fixture = JSON.parse(readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'));

test('fiction stays labelled simulated while spoken fields contain a story instead of technical demo copy', () => {
  assert.ok(parseDataset(fixture));
  assert.equal(fixture.kind, 'simulated');
  assert.match(fixture.disclaimer, /Truyện hư cấu/);
  assert.match(fixture.disclaimer, /tọa độ.*mô phỏng/);
  const spoken = [fixture.intro.text, ...fixture.nodes.flatMap((n) => [n.story, n.caption]), ...fixture.qa.map((q) => q.answer)];
  for (const text of spoken) {
    assert.doesNotMatch(text, /dữ liệu demo|bản demo|khu vực demo|Điểm demo|nhóm dữ liệu|chưa.*dữ liệu thật|phase|mô phỏng|hư cấu/i);
  }
  for (const evidence of [fixture.intro.evidence, ...fixture.qa.map((q) => q.evidence)]) {
    assert.ok(evidence.every((item) => /hư cấu/i.test(item)), 'sources must not masquerade as historical evidence');
  }
});

test('every chapter has local voice questions and follow-ups that cannot leak another point answer', () => {
  for (const node of fixture.nodes) {
    const entries = fixture.qa.filter((q) => q.nodeId === node.id);
    assert.ok(entries.length >= 3, `${node.id} needs follow-up content`);
    for (const entry of entries) {
      for (const utterance of [entry.question, ...entry.aliases]) {
        const result = findAnswer(entries, utterance);
        assert.equal(result.status, 'matched');
        assert.equal(result.entry.id, entry.id);
      }
      for (const id of entry.followUps) {
        assert.equal(fixture.qa.find((q) => q.id === id)?.nodeId, node.id, 'follow-up stays in its chapter');
      }
    }
    const foreign = fixture.qa.find((q) => q.nodeId !== node.id);
    assert.equal(findAnswer(entries, foreign.question).status, 'unknown');
  }
});
