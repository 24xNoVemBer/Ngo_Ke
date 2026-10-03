import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { normalizeQuestion } from '../src/qa/match.ts';
import { getSourceState } from '../src/data/sourceState.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);

// Regression: text copied with a trailing space after the question mark is the
// same question; the normalizer must fold it, not report "chưa có dữ liệu".
test('space after trailing punctuation still folds to the same key', () => {
  assert.equal(normalizeQuestion('Hỏi gì tiếp?  '), normalizeQuestion('Hỏi gì tiếp'));
  assert.equal(normalizeQuestion('Ăn gì ở đây ?  '), normalizeQuestion('Ăn gì ở đây'));
});

// Regression: an alias that normalizes to another entry's question would hand
// back a confidently wrong, source-labelled answer.
test('two entries claiming the same normalized question are rejected', () => {
  assert.equal(getSourceState('demo', fixture).status, 'ready');

  const collided = {
    ...fixture,
    qa: [
      { ...fixture.qa[0], aliases: [...fixture.qa[0].aliases, 'có chuyện xưa không'] },
      ...fixture.qa.slice(1),
    ],
  };
  const source = getSourceState('demo', collided);
  assert.equal(source.status, 'error');
  assert.equal('dataset' in source, false);
});

// Regression: data-entry slips must not create repeated or self-referential
// follow-up chips.
test('repeated or self-referential followUps are rejected', async (t) => {
  const cases = [
    ['duplicate followUp', { ...fixture.qa[0], followUps: ['qa-02', 'qa-02'] }],
    ['followUp points at itself', { ...fixture.qa[0], followUps: ['qa-01'] }],
  ];
  for (const [name, entry] of cases) {
    await t.test(name, () => {
      const source = getSourceState('demo', { ...fixture, qa: [entry, ...fixture.qa.slice(1)] });
      assert.equal(source.status, 'error');
    });
  }
});

// Regression: every shipped followUp chip must lead to a different question
// than the one just answered, otherwise the user can loop forever.
test('no shipped followUp re-asks the current question', () => {
  const byId = new Map(fixture.qa.map((entry) => [entry.id, entry]));
  for (const entry of fixture.qa) {
    for (const followUp of entry.followUps) {
      assert.notEqual(followUp, entry.id, entry.id);
      assert.notEqual(byId.get(followUp).question, entry.question, entry.id);
    }
  }
});