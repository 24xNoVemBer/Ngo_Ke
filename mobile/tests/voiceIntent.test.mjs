import assert from 'node:assert/strict';
import test from 'node:test';
import { parseVoiceIntent, resolveFirstOptionReference } from '../src/voice/intent.ts';

test('voice commands stay distinct from questions and mixed requests require a choice', () => {
  assert.deepEqual(parseVoiceIntent('Mở chương tiếp theo'), { type: 'next' });
  assert.deepEqual(parseVoiceIntent('Điểm kế tiếp là điểm nào?'), { type: 'question' });
  const mixed = parseVoiceIntent('Điểm kế tiếp là điểm nào? Mở chương tiếp theo');
  assert.equal(mixed.type, 'clarify');
  assert.equal(mixed.action, 'next');
  assert.equal(mixed.questionText, 'Điểm kế tiếp là điểm nào');
  const unpunctuated = parseVoiceIntent('Điểm kế tiếp là điểm nào mở chương tiếp theo');
  assert.equal(unpunctuated.type, 'clarify');
  assert.equal(unpunctuated.questionText, 'Điểm kế tiếp là điểm nào');
});

test('plan slots accept Arabic and Vietnamese minutes, including split turns', () => {
  assert.deepEqual(parseVoiceIntent('Chọn trải nghiệm ẩm thực trong 30 phút'), {
    type: 'plan', draft: { topic: 'an thuc', budgetMinutes: 30 },
  });
  assert.deepEqual(parseVoiceIntent('Chọn trải nghiệm chuyện xưa trong mười lăm phút'), {
    type: 'plan', draft: { topic: 'chuyen xua', budgetMinutes: 15 },
  });
  assert.deepEqual(parseVoiceIntent('Chọn trải nghiệm chuyện xưa trong một tiếng rưỡi'), {
    type: 'plan', draft: { topic: 'chuyen xua', budgetMinutes: 90 },
  });
  assert.deepEqual(parseVoiceIntent('nửa tiếng', true, { topic: 'an thuc' }), {
    type: 'plan', draft: { topic: 'an thuc', budgetMinutes: 30 },
  });
  assert.deepEqual(parseVoiceIntent('ẩm thực', true, { budgetMinutes: 45 }), {
    type: 'plan', draft: { topic: 'an thuc', budgetMinutes: 45 },
  });
});

test('negation, multiple topics, multiple durations and out-of-range values never choose silently', () => {
  assert.ok(parseVoiceIntent('Chọn trải nghiệm không muốn ẩm thực', true).ambiguous);
  assert.ok(parseVoiceIntent('Chọn trải nghiệm ẩm thực và chuyện xưa trong 30 phút').ambiguous);
  assert.ok(parseVoiceIntent('Chọn trải nghiệm ẩm thực trong 30 hay 45 phút').ambiguous);
  assert.ok(parseVoiceIntent('Chọn trải nghiệm ẩm thực trong 181 phút').ambiguous);
  const unsupportedPlanText = parseVoiceIntent('nhắc người thứ ba', true, { topic: 'an thuc', budgetMinutes: 30 });
  assert.equal(unsupportedPlanText.type, 'plan');
  if (unsupportedPlanText.type !== 'plan') return;
  assert.equal(unsupportedPlanText.draft.topic, undefined);
  assert.equal(unsupportedPlanText.draft.budgetMinutes, undefined);
  assert.match(unsupportedPlanText.ambiguous ?? '', /chủ đề hoặc thời lượng/);
  assert.deepEqual(parseVoiceIntent('không dừng nghe'), { type: 'question' });
  assert.deepEqual(parseVoiceIntent('Chương kế là gì?', true, { topic: 'an thuc', budgetMinutes: 30 }), { type: 'question' });
});

test('ambiguous slots clear stale draft values but keep an independently understood slot', () => {
  const negatedTopic = parseVoiceIntent('Chọn trải nghiệm không muốn ẩm thực trong 30 phút', false, {
    topic: 'an thuc', budgetMinutes: 45,
  });
  assert.equal(negatedTopic.type, 'plan');
  if (negatedTopic.type !== 'plan') return;
  assert.equal(negatedTopic.draft.topic, undefined);
  assert.equal(negatedTopic.draft.budgetMinutes, 30);
  assert.match(negatedTopic.ambiguous ?? '', /phủ định/);

  const ambiguousBudget = parseVoiceIntent('30 hay 45 phút', true, { topic: 'an thuc', budgetMinutes: 15 });
  assert.equal(ambiguousBudget.type, 'plan');
  if (ambiguousBudget.type !== 'plan') return;
  assert.equal(ambiguousBudget.draft.topic, 'an thuc');
  assert.equal(ambiguousBudget.draft.budgetMinutes, undefined);
  assert.match(ambiguousBudget.ambiguous ?? '', /thời lượng/);

  const bothAmbiguous = parseVoiceIntent('Chọn trải nghiệm ẩm thực và chuyện xưa trong 30 hay 45 phút', false, {
    topic: 'an thuc', budgetMinutes: 15,
  });
  assert.equal(bothAmbiguous.type, 'plan');
  if (bothAmbiguous.type !== 'plan') return;
  assert.equal(bothAmbiguous.draft.topic, undefined);
  assert.equal(bothAmbiguous.draft.budgetMinutes, undefined);
});

test('first-option references need options from the current point and dataset revision', () => {
  const saved = { turnId: 'turn-1', scope: 'demo:rev-1:demo-01', datasetRevision: 'rev-1', nodeId: 'demo-01', options: ['qa-02'] };
  const current = { scope: saved.scope, datasetRevision: 'rev-1', nodeId: 'demo-01' };
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', saved, current), { type: 'resolved', value: 'qa-02' });
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', null, current), { type: 'missing' });
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', { ...saved, scope: 'live:rev-1:demo-01' }, current), { type: 'missing' });
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', saved, { ...current, datasetRevision: 'rev-2' }), { type: 'missing' });
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', saved, { ...current, nodeId: 'demo-02' }), { type: 'missing' });
  assert.deepEqual(resolveFirstOptionReference('Câu đầu tiên', { ...saved, options: [] }, current), { type: 'missing' });
  assert.deepEqual(resolveFirstOptionReference('Câu thứ hai', saved, current), { type: 'not-reference' });
});
