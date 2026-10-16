import { TOPICS, type Topic } from '../data/sourceState.ts';
import type { Locale } from '../data/locale.ts';
import { translate } from '../i18n/translator.ts';
import { normalizeQuestion } from '../qa/match.ts';
import { hasTopicNegation, parseTimeBudget, parseTopic, TOPIC_LABELS, type PlanDraft } from '../recommendation/pick.ts';

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
const ENGLISH_COMMANDS: Record<string, VoiceIntent['type']> = {
  'read the story': 'listen', 'play the story': 'listen', 'listen to the story': 'listen',
  'read the chapter': 'listen', 'replay the story': 'replay', 'read it again': 'replay',
  'stop': 'stop', 'stop listening': 'stop', 'stop playback': 'stop',
  'next chapter': 'next', 'open next chapter': 'next', 'go to next chapter': 'next',
  'open qr': 'open-qr', 'open qr scanner': 'open-qr', 'open the qr scanner': 'open-qr', 'scan qr': 'open-qr', 'scan qr code': 'open-qr',
  'open gps': 'open-gps', 'show gps': 'open-gps',
};
const ENGLISH_PLAN_COMMAND = /^(?:choose (?:an )?experience|open (?:the )?route planner)(?:\b|$)/;
const ENGLISH_ACTION = /\b(?:read the story|play the story|listen to the story|read the chapter|replay the story|read it again|stop listening|stop playback|next chapter|open next chapter|go to next chapter|open (?:the )?qr(?: scanner)?|scan qr(?: code)?|open gps|show gps|choose (?:an )?experience|open (?:the )?route planner)\b/g;
const ENGLISH_QUESTION_WORDS = /\b(?:what|where|when|why|who|which|how|is|are|do|does|can|could|would)\b/;
const ENGLISH_NEGATION = /\b(?:no|not|never|dont|doesnt|didnt|cannot|cant|wont|shouldnt|don't|doesn't|didn't|can't|won't|shouldn't|couldn't|wouldn't)\b/;
const VIETNAMESE_ACTION = /\b(?:nghe loi ke|bat dau nghe|phat loi ke|nghe lai|phat lai|doc lai|dung nghe|dung phat|mo chuong|sang chuong|diem ke tiep|mo qr|quet ma qr|mo camera|mo gps|xem vi tri|chon trai nghiem|goi y trai nghiem)\b/;
const ENGLISH_TOPICS: Record<Topic, readonly string[]> = {
  'an thuc': ['food', 'street food'],
  'chuyen xua': ['history', 'old stories'],
  'kham pha tu do': ['exploration', 'explore'],
};

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
    const halfHour = ['tieng', 'gio', 'h'].includes(tokens[i]) && tokens[i + 1] === 'ruoi';
    const parsed = phrase ? parseTimeBudget(`${phrase} ${tokens[i]}${halfHour ? ' ruoi' : ''}`) : undefined;
    if (!phrase || parsed === undefined) return undefined;
    if (halfHour) i++;
    const phraseStart = i - phrase.split(' ').length;
    if (phraseStart >= 2 && ['hay', 'hoac', 'va', 'den'].includes(tokens[phraseStart - 1])
        && (/^\d{1,3}$/.test(tokens[phraseStart - 2]) || NUMBER_WORDS.has(tokens[phraseStart - 2]))) return undefined;
    values.push(parsed);
  }
  return values;
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

function parseVietnameseVoiceIntent(input: string, collectingPlan: boolean, currentDraft: PlanDraft, locale: Locale): VoiceIntent {
  if (/^\s*đừng(?:\s|$|[,!.?])/iu.test(input)) return { type: 'question' };
  const text = normalizeQuestion(input);
  if (!text) return { type: 'question' };

  const exactCommands: Record<string, VoiceIntent['type']> = {
    'nghe loi ke': 'listen', 'bat dau nghe': 'listen', 'bat dau nghe loi ke': 'listen',
    'phat loi ke': 'listen', 'bat dau phat loi ke': 'listen',
    'nghe lai': 'replay', 'phat lai': 'replay', 'doc lai': 'replay',
    'dung': 'stop', 'dung nghe': 'stop', 'dung ngay': 'stop', 'dung phat': 'stop', 'dung lai': 'stop',
    'mo chuong ke': 'next', 'mo chuong tiep theo': 'next', 'sang chuong ke': 'next',
    'diem ke tiep': 'next',
    'mo qr': 'open-qr', 'quet ma qr': 'open-qr', 'mo camera': 'open-qr', 'mo may quet ma': 'open-qr',
    'mo may quet ma qr': 'open-qr',
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
    return { type: 'clarify', message: translate(locale, 'voice.intent.clarify_action'), options: ['answer', 'action'], questionText, actionText: command?.[0] ?? text, action };
  }
  if (question && !planCommand) return { type: 'question' };

  if (!planCommand && !collectingPlan) {
    if (FIRST_OPTION.test(text)) return { type: 'question' };
    return { type: 'question' };
  }

  const topics = topicsIn(text);
  const durations = durationValues(text);
  let ambiguous: string | undefined;
  const noPlanSlots = collectingPlan && !planCommand && topics.length === 0 && durations?.length === 0;
  const ambiguousTopic = noPlanSlots || topics.length > 1 || hasTopicNegation(text);
  const ambiguousBudget = noPlanSlots || durations === undefined || durations.length > 1
    || (durations.length === 1 && (durations[0] < 1 || durations[0] > 180));
  if (noPlanSlots) ambiguous = translate(locale, 'voice.intent.clarify_plan');
  else if (topics.length > 1) ambiguous = translate(locale, 'voice.intent.ambiguous_topic_multiple');
  else if (ambiguousTopic) ambiguous = translate(locale, 'voice.intent.ambiguous_topic_negation');
  else if (durations === undefined) ambiguous = translate(locale, 'voice.intent.ambiguous_duration_unrecognized');
  else if (durations.length > 1) ambiguous = translate(locale, 'voice.intent.ambiguous_duration_multiple');
  else if (ambiguousBudget) ambiguous = translate(locale, 'voice.intent.ambiguous_duration_range');

  const detectedTopic = topics.length === 1 ? parseTopic(TOPIC_LABELS[topics[0]]) : undefined;
  const topic = ambiguousTopic ? undefined : detectedTopic ?? currentDraft.topic;
  const spokenMinutes = durations?.length === 1 && durations[0] >= 1 && durations[0] <= 180 ? durations[0] : undefined;
  const budgetMinutes = ambiguousBudget ? undefined : spokenMinutes ?? currentDraft.budgetMinutes;
  if (planCommand && question && !ambiguous) {
    return { type: 'clarify', message: translate(locale, 'voice.intent.clarify_plan_question'), options: ['answer', 'action'], questionText: input, actionText: text, action: 'plan' };
  }
  const draft = { topic, budgetMinutes };
  return ambiguous ? { type: 'plan', draft, ambiguous } : { type: 'plan', draft };
}

function parseEnglishVoiceIntent(input: string, collectingPlan: boolean, currentDraft: PlanDraft): VoiceIntent {
  const text = normalizeQuestion(input);
  if (!text) return { type: 'question' };
  if (VIETNAMESE_ACTION.test(text)) return { type: 'question' };

  const negative = ENGLISH_NEGATION.test(text);
  const question = input.includes('?') || ENGLISH_QUESTION_WORDS.test(text);
  const exact = ENGLISH_COMMANDS[text];
  if (exact && !negative && !question) return { type: exact } as VoiceIntent;

  const planCommand = ENGLISH_PLAN_COMMAND.test(text);
  if (negative && !planCommand) return { type: 'question' };
  const actions = [...text.matchAll(ENGLISH_ACTION)].map((match) => match[0]);
  const actionTypes = [...new Set(actions.map((action) => ENGLISH_COMMANDS[action] ?? 'plan'))];
  if (actionTypes.length > 1) return { type: 'question' };
  if (question && actionTypes.length === 1 && ['next', 'plan', 'open-qr', 'open-gps'].includes(actionTypes[0])) {
    const action = actionTypes[0] as 'next' | 'plan' | 'open-qr' | 'open-gps';
    return {
      type: 'clarify', message: translate('en', action === 'plan' ? 'voice.intent.clarify_plan_question' : 'voice.intent.clarify_action'),
      options: ['answer', 'action'], questionText: input, actionText: actions[0], action,
    };
  }
  if (question) return { type: 'question' };
  if (!planCommand && !collectingPlan) return { type: 'question' };

  const topics = TOPIC_ORDER.filter((topic) => ENGLISH_TOPICS[topic].some((name) => text.includes(name)));
  const durationMatches = [...text.matchAll(/\b(?:half an hour|half hour|an hour|one hour|hour and a half|one and a half hours|\d+(?:\.\d+)?\s*hours?(?:\s+\d+\s*minutes?)?|\d+\s*(?:minutes?|mins?))\b/g)];
  const durations = durationMatches.map((match) => parseTimeBudget(match[0], 'en')).filter((value): value is number => value !== undefined);
  const rangeDuration = durationMatches.some(({ index }) => {
    const prefix = text.slice(0, index);
    return /\b\d+\s*-\s*$/.test(prefix) || /\bbetween\s+\d+\s+and\s*$/.test(prefix);
  });
  const negativeDuration = durationMatches.some(({ index }) => /(?:^|\s)-\s*$/.test(text.slice(0, index)));
  const ambiguousTopic = negative || topics.length > 1;
  const ambiguousBudget = rangeDuration || negativeDuration || durationMatches.length !== durations.length || durations.length > 1
    || durations.some((duration) => duration < 1 || duration > 180);
  const ambiguous = negative ? translate('en', 'voice.intent.ambiguous_topic_negation')
    : topics.length > 1 ? translate('en', 'voice.intent.ambiguous_topic_multiple')
      : ambiguousBudget ? translate('en', durations.length > 1 || rangeDuration ? 'voice.intent.ambiguous_duration_multiple' : 'voice.intent.ambiguous_duration_unrecognized')
        : collectingPlan && !planCommand && topics.length === 0 && durations.length === 0
          ? translate('en', 'voice.intent.clarify_plan') : undefined;
  const topic = ambiguousTopic ? undefined : topics.length === 1 ? topics[0] : currentDraft.topic;
  const budgetMinutes = ambiguousBudget ? undefined : durations.length === 1 ? durations[0] : currentDraft.budgetMinutes;
  const draft: PlanDraft = {};
  if (topic !== undefined) draft.topic = topic;
  if (budgetMinutes !== undefined) draft.budgetMinutes = budgetMinutes;
  return ambiguous ? { type: 'plan', draft, ambiguous } : { type: 'plan', draft };
}

/** Old callers stay Vietnamese; pass locale as the fourth argument for localized intent matching. */
export function parseVoiceIntent(input: string, collectingPlan = false, currentDraft: PlanDraft = {}, locale: Locale = 'vi'): VoiceIntent {
  return locale === 'en'
    ? parseEnglishVoiceIntent(input, collectingPlan, currentDraft)
    : parseVietnameseVoiceIntent(input, collectingPlan, currentDraft, locale);
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
