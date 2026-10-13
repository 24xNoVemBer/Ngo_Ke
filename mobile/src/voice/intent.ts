import { TOPICS, type Topic } from '../data/sourceState.ts';
import { normalizeQuestion } from '../qa/match.ts';
import { parseTimeBudget, parseTopic, TOPIC_LABELS, type PlanDraft } from '../recommendation/pick.ts';

export type VoiceIntent =
  | { type: 'question' }
  | { type: 'listen' | 'replay' | 'stop' | 'next' | 'open-qr' | 'open-gps' }
  | { type: 'clarify'; message: string; options: ['answer', 'action']; questionText: string; actionText: string; action: 'next' | 'plan' | 'open-qr' | 'open-gps' }
  | { type: 'plan'; draft: PlanDraft; ambiguous?: string };

const TOPIC_ORDER: readonly Topic[] = TOPICS;
const DURATION_UNITS = new Set(['phut', 'p', 'tieng', 'gio', 'h']);
const NUMBER_WORDS = new Set(['mot', 'hai', 'ba', 'bon', 'nam', 'lam', 'sau', 'bay', 'tam', 'chin', 'muoi', 'tram']);
const PLAN_COMMAND = /^(?:(?:chon|mo|lap|tim)\s+(?:mot\s+)?(?:trai nghiem|hanh trinh)\b|goi y trai nghiem\b)/;
const QUESTION_WORDS = /\b(?:la gi|o dau|khi nao|bao nhieu|tai sao|ai|nao)\b/;
const FIRST_OPTION = /^(?:cau dau tien|cau hoi dau tien|doc cau dau tien|doc cau hoi dau tien|chon cau dau tien)$/;

export type VoiceOptionContext = {
  turnId: string;
  scope: string;
  datasetRevision: string;
  nodeId: string;
  options: string[];
};

export type OrdinalResolution = { type: 'not-reference' } | { type: 'missing' } | { type: 'resolved'; value: string };

function topicsIn(text: string): Topic[] {
  return TOPIC_ORDER.filter((topic) => text.includes(topic) || text.includes(normalizeQuestion(TOPIC_LABELS[topic])));
}

function durationValues(text: string): number[] | undefined {
  const tokens = text.split(/\s+/).filter(Boolean);
  const values: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (!DURATION_UNITS.has(tokens[i])) continue;
    if (tokens[i - 1] === 'nua' && (tokens[i] === 'tieng' || tokens[i] === 'gio' || tokens[i] === 'h')) {
      values.push(30);
      continue;
    }
    let phrase: string | undefined;
    for (let length = Math.min(4, i); length > 0; length--) {
      const candidate = tokens.slice(i - length, i).join(' ');
      if (/^\d{1,3}$/.test(candidate) || candidate.split(' ').every((word) => NUMBER_WORDS.has(word))) {
        phrase = candidate;
        break;
      }
    }
    const parsed = phrase ? parseTimeBudget(`${phrase} ${tokens[i]}`) : undefined;
    if (!phrase || parsed === undefined) return undefined;
    const phraseStart = i - phrase.split(' ').length;
    if (phraseStart >= 2 && ['hay', 'hoac', 'va', 'den'].includes(tokens[phraseStart - 1])
        && (/^\d{1,3}$/.test(tokens[phraseStart - 2]) || NUMBER_WORDS.has(tokens[phraseStart - 2]))) return undefined;
    values.push(parsed);
  }
  return values;
}

function isNegatedTopic(text: string): boolean {
  return /\b(?:khong muon|khong thich|khong chon|dung chon|bo qua|tranh)\b/.test(text);
}

function isQuestion(text: string, original: string): boolean {
  return original.includes('?') || QUESTION_WORDS.test(text);
}

function rawQuestionBefore(input: string, command: string): string {
  const commandTokens = command.split(/\s+/);
  const rawTokens = input.trim().split(/\s+/);
  const normalizedTokens = rawTokens.map((token) => normalizeQuestion(token));
  const start = normalizedTokens.findIndex((_, index) => commandTokens.every((token, offset) => normalizedTokens[index + offset] === token));
  return start > 0 ? rawTokens.slice(0, start).join(' ') : input;
}

export function parseVoiceIntent(input: string, collectingPlan = false, currentDraft: PlanDraft = {}): VoiceIntent {
  const text = normalizeQuestion(input);
  if (!text) return { type: 'question' };

  const exactCommands: Record<string, VoiceIntent['type']> = {
    'nghe loi ke': 'listen', 'bat dau nghe': 'listen', 'phat loi ke': 'listen',
    'nghe lai': 'replay', 'phat lai': 'replay', 'doc lai': 'replay',
    'dung': 'stop', 'dung nghe': 'stop', 'dung phat': 'stop', 'dung lai': 'stop',
    'mo chuong ke': 'next', 'mo chuong tiep theo': 'next', 'sang chuong ke': 'next',
    'diem ke tiep': 'next',
    'mo qr': 'open-qr', 'quet ma qr': 'open-qr', 'mo camera': 'open-qr', 'mo may quet ma': 'open-qr',
    'mo gps': 'open-gps', 'mo the gps': 'open-gps', 'xem vi tri': 'open-gps', 'xac dinh diem bang gps': 'open-gps',
  };
  const exact = exactCommands[text];
  if (exact) return { type: exact } as VoiceIntent;

  const planCommand = PLAN_COMMAND.test(text);
  const question = isQuestion(text, input);
  const includesCommand = /\b(?:mo chuong ke|mo chuong tiep theo|chon trai nghiem|mo qr|quet ma qr|mo gps)\b/.test(text);
  if (question && includesCommand) {
    const action = /\b(?:mo chuong ke|mo chuong tiep theo)\b/.test(text) ? 'next'
      : /\b(?:chon trai nghiem)\b/.test(text) ? 'plan'
        : /\b(?:mo qr|quet ma qr)\b/.test(text) ? 'open-qr' : 'open-gps';
    const command = text.match(/(?:mo chuong ke|mo chuong tiep theo|chon trai nghiem[^?]*|mo qr|quet ma qr|mo gps[^?]*)/);
    const questionText = input.includes('?') ? input.slice(0, input.indexOf('?')).trim()
      : command ? rawQuestionBefore(input, command[0]).trim() : input;
    return { type: 'clarify', message: 'Bạn muốn nghe câu trả lời hay thực hiện thao tác vừa nói?', options: ['answer', 'action'], questionText, actionText: command?.[0] ?? text, action };
  }
  if (question && !planCommand && !collectingPlan) return { type: 'question' };

  if (!planCommand && !collectingPlan) {
    if (FIRST_OPTION.test(text)) return { type: 'question' };
    return { type: 'question' };
  }

  const topics = topicsIn(text);
  const durations = durationValues(text);
  let ambiguous: string | undefined;
  if (topics.length > 1) ambiguous = 'Mình nghe thấy hơn một chủ đề. Hãy chọn một chủ đề bên dưới.';
  else if (topics.length > 0 && isNegatedTopic(text)) ambiguous = 'Mình không muốn tự chọn chủ đề khi câu có lời phủ định. Hãy chạm một chủ đề bên dưới.';
  else if (durations === undefined) ambiguous = 'Mình chưa hiểu thời lượng. Hãy chọn số phút bên dưới.';
  else if (durations.length > 1) ambiguous = 'Mình nghe thấy hơn một khoảng thời gian. Hãy chọn một mức bên dưới.';
  else if (durations.length === 1 && (durations[0] < 1 || durations[0] > 180)) ambiguous = 'Thời lượng cần từ 1 đến 180 phút. Hãy chọn lại bên dưới.';

  const detectedTopic = topics.length === 1 ? parseTopic(TOPIC_LABELS[topics[0]]) : undefined;
  const topic = ambiguous ? currentDraft.topic : detectedTopic ?? currentDraft.topic;
  const spokenMinutes = durations?.length === 1 && durations[0] >= 1 && durations[0] <= 180 ? durations[0] : undefined;
  const budgetMinutes = ambiguous ? currentDraft.budgetMinutes : spokenMinutes ?? currentDraft.budgetMinutes;
  if (planCommand && question && !ambiguous) {
    return { type: 'clarify', message: 'Bạn muốn hỏi về trải nghiệm hay mở phần chọn hành trình?', options: ['answer', 'action'], questionText: input, actionText: text, action: 'plan' };
  }
  const draft = { topic, budgetMinutes };
  return ambiguous ? { type: 'plan', draft, ambiguous } : { type: 'plan', draft };
}

export function resolveFirstOptionReference(
  input: string,
  saved: VoiceOptionContext | null,
  current: Pick<VoiceOptionContext, 'scope' | 'datasetRevision' | 'nodeId'>,
): OrdinalResolution {
  if (!FIRST_OPTION.test(normalizeQuestion(input))) return { type: 'not-reference' };
  if (!saved || !saved.turnId || saved.options.length === 0 || saved.scope !== current.scope
      || saved.datasetRevision !== current.datasetRevision || saved.nodeId !== current.nodeId) {
    return { type: 'missing' };
  }
  return { type: 'resolved', value: saved.options[0] };
}
