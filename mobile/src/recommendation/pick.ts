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

const MAX_PICKS = 3;

export const TOPIC_LABELS: Record<Topic, string> = {
  'an thuc': 'ẩm thực',
  'chuyen xua': 'chuyện xưa',
  'kham pha tu do': 'khám phá tự do',
};

const TOPIC_ORDER: Topic[] = ['an thuc', 'chuyen xua', 'kham pha tu do'];

export function parseTopic(text: string): Topic | undefined {
  const normalized = normalizeQuestion(text);
  if (normalized.length === 0) {
    return undefined;
  }
  return TOPIC_ORDER.find((topic) => normalized.includes(topic))
    ?? TOPIC_ORDER.find((topic) => normalized.includes(TOPIC_LABELS[topic]));
}

/** Read a duration in minutes; returns undefined when the text is not one. */
export function parseTimeBudget(text: string): number | undefined {
  const normalized = normalizeQuestion(text);
  if (normalized.length === 0) {
    return undefined;
  }
  const hour = normalized.match(/(\d+)\s*tieng/);
  if (hour) {
    return Number(hour[1]) * 60;
  }
  const halfHour = normalized.match(/tieng\s*ruoi/);
  if (halfHour) {
    return 90;
  }
  const minutes = normalized.match(/(\d+)\s*(?:phut|minutes?)/);
  if (minutes) {
    return Number(minutes[1]);
  }
  const bareNumber = normalized.match(/^(\d+)$/);
  return bareNumber ? Number(bareNumber[1]) : undefined;
}

export function pickPoints(nodes: readonly DemoNode[], input: PickInput): PickResult {
  const { topic, budgetMinutes, visited = new Set<string>() } = input;
  if (topic === undefined) {
    return { kind: 'needs-topic' };
  }
  if (budgetMinutes === undefined) {
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
    .sort((a, b) => a.visitMinutes - b.visitMinutes)
    .slice(0, MAX_PICKS);

  if (matches.length === 0) {
    return { kind: 'empty', topic };
  }

  return {
    kind: 'ok',
    topic,
    budgetMinutes,
    picks: matches.map((node) => ({
      node,
      visitMinutes: node.visitMinutes,
      reason: `Hợp chủ đề ${TOPIC_LABELS[topic]} · ${node.summary}`,
    })),
  };
}