import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { parseTimeBudget, parseTopic, pickPoints } from '../src/recommendation/pick.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../data/demo.json', import.meta.url), 'utf8'),
);
const nodes = fixture.nodes;

test('topic is recognised however the user writes it', () => {
  assert.equal(parseTopic('an thuc'), 'an thuc');
  assert.equal(parseTopic('  Ăn Thực '), 'an thuc');
  assert.equal(parseTopic('chuyen xua'), 'chuyen xua');
  assert.equal(parseTopic('kham pha tu do'), 'kham pha tu do');
});

test('unrelated text is not treated as a topic', () => {
  for (const text of ['', '   ', 'mua bao nhieu', 'diem nao de an']) {
    assert.equal(parseTopic(text), undefined);
  }
});

test('time budget is read from plain numbers, minutes and hours', () => {
  assert.equal(parseTimeBudget('30'), 30);
  assert.equal(parseTimeBudget('khoảng 45 phút'), 45);
  assert.equal(parseTimeBudget('  15 PHÚT '), 15);
  assert.equal(parseTimeBudget('1 tiếng'), 60);
  assert.equal(parseTimeBudget('tiếng rưỡi'), 90);
});

test('text that is not a duration yields no budget', () => {
  for (const text of ['', '   ', 'khong biết', 'diem 3', 'ban thay the']) {
    assert.equal(parseTimeBudget(text), undefined);
  }
});

test('picks at most three points, matching the topic, shortest first', () => {
  const result = pickPoints(nodes, { topic: 'an thuc', budgetMinutes: 60 });
  assert.equal(result.kind, 'ok');
  const picks = result.picks;
  assert.ok(picks.length <= 3);
  assert.ok(picks.length > 0);
  assert.ok(picks.every((pick) => pick.node.tags.includes('an thuc')));
  const minutes = picks.map((pick) => pick.node.visitMinutes);
  assert.deepEqual([...minutes].sort((a, b) => a - b), minutes);
  assert.ok(picks.every((pick) => pick.reason.includes('ẩm thực')));
});

test('already visited and closed points are never suggested', () => {
  const visited = nodes.slice(0, 3).map((node) => node.id);
  const result = pickPoints(nodes, {
    topic: 'an thuc',
    budgetMinutes: 120,
    visited: new Set(visited),
  });
  assert.equal(result.kind, 'ok');
  assert.ok(!result.picks.some((pick) => visited.includes(pick.node.id)));

  const closed = nodes.map((node) => ({ ...node, available: false }));
  assert.equal(pickPoints(closed, { topic: 'an thuc', budgetMinutes: 60 }).kind, 'empty');
});

test('explore topic still returns points instead of an empty screen', () => {
  const result = pickPoints(nodes, { topic: 'kham pha tu do', budgetMinutes: 45 });
  assert.equal(result.kind, 'ok');
  const picks = result.picks;
  assert.ok(picks.length > 0);
  assert.ok(picks.every((pick) => pick.node.tags.includes('kham pha tu do')));
});

// Regression: a suggestion must never be presented as walking directions.
test('suggestions carry no coordinates, distance or walking time', () => {
  const result = pickPoints(nodes, { topic: 'an thuc', budgetMinutes: 60 });
  assert.equal(result.kind, 'ok');
  for (const pick of result.picks) {
    // Nodes carry coordinates since Phase 5, but a suggestion must not show
    // distance or read like walking directions.
    assert.deepEqual(
      Object.keys(pick).filter((key) => /lat|lng|dist|walk|eta|route/i.test(key)),
      [],
    );
    assert.equal(/\d+\s*m(?!ô ph)/i.test(pick.reason), false);
    assert.equal(/đi bộ|walking|directions|chỉ đường/i.test(pick.reason), false);
    assert.deepEqual(Object.keys(pick).sort(), ['node', 'reason', 'visitMinutes']);
  }
});

test('missing topic or budget is refused instead of guessing', () => {
  assert.equal(pickPoints(nodes, {}).kind, 'needs-topic');
  assert.equal(pickPoints(nodes, { topic: 'an thuc' }).kind, 'needs-budget');
  assert.equal(pickPoints(nodes, { topic: 'an thuc', budgetMinutes: 45 }).kind, 'ok');
});

test('a topic with no remaining points reports an empty state', () => {
  const onlyHistory = nodes.slice(0, 2).map((node) => ({
    ...node,
    tags: ['chuyen xua'],
    visited: true,
  }));
  const result = pickPoints(onlyHistory, { topic: 'chuyen xua', budgetMinutes: 30 });
  assert.equal(result.kind, 'empty');
});

// Regression: ordering and reason text must stay stable between runs, otherwise
// the same answer looks different every time the user reopens the plan.
test('repeated calls give the same order', () => {
  const first = pickPoints(nodes, { topic: 'chuyen xua', budgetMinutes: 60 });
  const second = pickPoints(nodes, { topic: 'chuyen xua', budgetMinutes: 60 });
  assert.deepEqual(first, second);
});