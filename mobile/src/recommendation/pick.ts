import type { DemoNode, Topic } from '../data/sourceState.ts';
import { normalizeQuestion } from '../qa/match.ts';

export type Pick = { node: DemoNode; reason: string; visitMinutes: number };

export type PickResult =
  | { kind: 'needs-topic' }
  | { kind: 'needs-budget' }
  | { kind: 'empty'; topic?: Topic }
  | { kind: 'ok'; topic: Topic; budgetMinutes: number; picks: Pick[] };

export type PickInput = {
  topic?: Topic;
  budgetMinutes?: number;
  visited?: ReadonlySet<string>;
};

export type PlanDraft = { topic?: Topic; budgetMinutes?: number };

const MAX_PICKS = 3;

export const TOPIC_LABELS: Record<Topic, string> = {
  'an thuc': 'ẩm thực',
  'chuyen xua': 'chuyện xưa',
  'kham pha tu do': 'khám phá tự do',
};

const TOPIC_ORDER: Topic[] = ['an thuc', 'chuyen xua', 'kham pha tu do'];

export function hasTopicNegation(text: string, _locale: 'vi' | 'en' = 'vi'): boolean {
  void _locale;
  const normalized = normalizeQuestion(text);
  const withoutSpaceNoun = normalized.replace(/\bkhong gian\b/g, ' ');
  return (
    /\b(?:khong|bo qua|tranh|loai tru|dung chon|no|not|dont|don't|never|neither|without|exclude|avoid|skip|ignore)\b/.test(withoutSpaceNoun)
  );
}

export function parseTopic(text: string, _locale: 'vi' | 'en' = 'vi'): Topic | undefined {
  void _locale;
  const normalized = normalizeQuestion(text);
  if (normalized.length === 0 || hasTopicNegation(normalized)) {
    return undefined;
  }
  if (/\b(?:food|culinary|dining|eat|eating)\b/.test(normalized)) {
    return 'an thuc';
  }
  if (/\b(?:history|stories|story|ancient|heritage|memory|memories|nostalgia)\b/.test(normalized)) {
    return 'chuyen xua';
  }
  if (/\b(?:explore|exploration|free|discovery|roam|wander)\b/.test(normalized)) {
    return 'kham pha tu do';
  }
  return TOPIC_ORDER.find((topic) => normalized.includes(topic))
    ?? TOPIC_ORDER.find((topic) => normalized.includes(normalizeQuestion(TOPIC_LABELS[topic])));
}

/** Read a duration in minutes; returns undefined when the text is not one. */
export function parseTimeBudget(text: string, _locale: 'vi' | 'en' = 'vi'): number | undefined {
  void _locale;
  const normalized = normalizeQuestion(text).replace(/^(?:khoang|toi co|minh co|co|about|around|i have)\s+/, '');
  if (normalized === 'nua tieng' || normalized === 'nua gio' || normalized === 'half an hour' || normalized === 'half hour') return 30;
  if (normalized === 'an hour' || normalized === 'one hour' || normalized === '1 hour') return 60;
  if (normalized === 'hour and a half' || normalized === 'one and a half hours' || normalized === '1.5 hours' || normalized === '1.5 hour') return 90;
  const legacyHour = normalized.match(/^(?:(\d+)\s*)?(?:tieng|gio|hours?)(?:\s+(ruoi)|\s+(\d+)\s*phut)?$/);
  const legacyMinutes = normalized.match(/^(\d+)\s*(?:phut|minutes?|mins?|m)?$/);
  if (legacyHour || legacyMinutes) {
    const value = legacyHour
      ? Number(legacyHour[1] ?? 1) * 60 + (legacyHour[2] ? 30 : Number(legacyHour[3] ?? 0))
      : Number(legacyMinutes?.[1]);
    return Number.isSafeInteger(value) && value > 0 ? value : undefined;
  }
  const unitWord = '(?:mot|hai|ba|bon|nam|lam|sau|bay|tam|chin)';
  const numberWords = `(?:muoi(?:\\s+${unitWord})?|(?:hai|ba|bon|nam|sau|bay|tam|chin)\\s+muoi(?:\\s+${unitWord})?|${unitWord})`;
  const amount = `(\\d{1,3}|mot tram(?:\\s+${numberWords})?|${numberWords})`;
  const hour = normalized.match(new RegExp(`^${amount}\\s*(?:tieng|gio|hours?)(?:\\s+ruoi)?$`));
  const minutes = normalized.match(new RegExp(`^${amount}\\s*(?:phut|minutes?)?$`));
  const number = (phrase: string | undefined): number | undefined => {
    if (!phrase) return undefined;
    if (/^\d+$/.test(phrase)) return Number(phrase);
    const words = phrase.split(/\s+/);
    const units: Record<string, number> = { mot: 1, hai: 2, ba: 3, bon: 4, nam: 5, lam: 5, sau: 6, bay: 7, tam: 8, chin: 9 };
    const group = (tokens: string[]): number | undefined => {
      if (tokens.length === 1) return tokens[0] === 'muoi' ? 10 : units[tokens[0]];
      if (tokens.length === 2 && tokens[0] === 'muoi') return 10 + (units[tokens[1]] ?? 0);
      if ((tokens.length === 2 || tokens.length === 3) && tokens[1] === 'muoi') {
        const tens = units[tokens[0]];
        const ones = tokens.length === 3 ? units[tokens[2]] : 0;
        return tens && (tokens.length === 2 || ones) ? tens * 10 + ones : undefined;
      }
      return undefined;
    };
    if (words[0] === 'mot' && words[1] === 'tram') {
      return 100 + (words.length > 2 ? group(words.slice(2)) ?? 0 : 0);
    }
    return group(words);
  };
  const hourMinutes = number(hour?.[1]);
  const minuteValue = number(minutes?.[1]);
  const value = hour ? (hourMinutes ?? 0) * 60 + (normalized.endsWith(' ruoi') ? 30 : 0) : minuteValue;
  return value !== undefined && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

export function pickPoints(nodes: readonly DemoNode[], input: PickInput): PickResult {
  const { topic, budgetMinutes, visited = new Set<string>() } = input;
  if (topic === undefined) {
    return { kind: 'needs-topic' };
  }
  if (budgetMinutes === undefined || !Number.isFinite(budgetMinutes) || budgetMinutes <= 0) {
    return { kind: 'needs-budget' };
  }

  const matches = nodes
    .filter(
      (node) =>
        node.available
        && !node.visited
        && !visited.has(node.id)
        && node.tags.includes(topic),
    )
    .sort((a, b) => a.visitMinutes - b.visitMinutes);

  let remaining = budgetMinutes;
  const selected: DemoNode[] = [];
  for (const node of matches) {
    if (selected.length === MAX_PICKS) break;
    if (node.visitMinutes <= 0 || node.visitMinutes > remaining) continue;
    selected.push(node);
    remaining -= node.visitMinutes;
  }

  if (selected.length === 0) {
    return { kind: 'empty', topic };
  }

  return {
    kind: 'ok',
    topic,
    budgetMinutes,
    picks: selected.map((node) => ({
      node,
      visitMinutes: node.visitMinutes,
      reason: `Hợp chủ đề ${TOPIC_LABELS[topic]} · ${node.summary}`,
    })),
  };
}
