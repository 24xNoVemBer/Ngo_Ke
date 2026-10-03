export type Mode = 'demo' | 'live';

import { normalizeQuestion, type QaEntry } from '../qa/match.ts';

export const TOPICS = ['an thuc', 'chuyen xua', 'kham pha tu do'] as const;

export type Topic = (typeof TOPICS)[number];

export type DemoNode = {
  id: string;
  name: string;
  summary: string;
  tags: Topic[];
  visitMinutes: number;
  available: boolean;
  visited: boolean;
  story: string;
  caption: string;
  latitude: number;
  longitude: number;
};

export type DemoIntro = { text: string; evidence: string[] };

export type DemoDataset = {
  schemaVersion: 1;
  kind: 'simulated';
  disclaimer: string;
  intro: DemoIntro;
  startNodeId: string;
  nodes: DemoNode[];
  qa: QaEntry[];
};

type SourceDescription = {
  title: string;
  detail: string;
};

export type SourceState = SourceDescription & (
  | { mode: 'demo'; status: 'ready'; dataset: DemoDataset }
  | { mode: 'demo'; status: 'error' }
  | { mode: 'live'; status: 'empty' }
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCoordinate(value: unknown, limit: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}

function isTopicList(value: unknown): value is Topic[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= TOPICS.length &&
    value.every((tag) => (TOPICS as readonly string[]).includes(tag))
  );
}

function isStringList(value: unknown, min: number, max = Number.POSITIVE_INFINITY): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.length <= max &&
    value.every(isNonemptyString)
  );
}

function isQaEntry(
  value: unknown,
  nodeIds: Set<string>,
  qaIds: Set<string>,
  claimedQuestions: Set<string>,
): value is QaEntry {
  if (
    !isRecord(value) ||
    !isNonemptyString(value.id) ||
    qaIds.has(value.id) ||
    !isNonemptyString(value.question) ||
    !isNonemptyString(value.answer) ||
    !isNonemptyString(value.nodeId) ||
    !nodeIds.has(value.nodeId) ||
    !isStringList(value.aliases, 1, 5) ||
    !isStringList(value.evidence, 1) ||
    !isStringList(value.followUps, 0, 2) ||
    !isStringList(value.tags, 0)
  ) {
    return false;
  }
  // Two entries answering the same normalized question would return whichever
  // matched first, i.e. a wrong answer with a valid source.
  const questionKey = normalizeQuestion(value.question);
  if (claimedQuestions.has(questionKey)) {
    return false;
  }
  claimedQuestions.add(questionKey);
  for (const alias of value.aliases) {
    const aliasKey = normalizeQuestion(alias);
    if (claimedQuestions.has(aliasKey)) {
      return false;
    }
    claimedQuestions.add(aliasKey);
  }
  if (new Set(value.followUps).size !== value.followUps.length
    || value.followUps.includes(value.id)) {
    return false;
  }
  qaIds.add(value.id);
  return true;
}

function isDemoDataset(value: unknown): value is DemoDataset {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.kind !== 'simulated'
    || !isNonemptyString(value.disclaimer) || !Array.isArray(value.nodes)
    || value.nodes.length !== 6) {
    return false;
  }
  const ids = new Set<string>();
  for (const node of value.nodes) {
    if (!isRecord(node) || !isNonemptyString(node.id) || !isNonemptyString(node.name)
      || ids.has(node.id) || !isNonemptyString(node.summary)
      || !isNonemptyString(node.story) || !isNonemptyString(node.caption)
      || !isTopicList(node.tags) || typeof node.available !== 'boolean'
      || typeof node.visited !== 'boolean'
      || !isCoordinate(node.latitude, 90) || !isCoordinate(node.longitude, 180)
      || !Number.isInteger(node.visitMinutes) || (node.visitMinutes as number) <= 0) {
      return false;
    }
    ids.add(node.id);
  }
  if (!isNonemptyString(value.startNodeId) || !ids.has(value.startNodeId)) {
    return false;
  }
  if (!isRecord(value.intro) || !isNonemptyString(value.intro.text)
    || !isStringList(value.intro.evidence, 1)) {
    return false;
  }
  if (!Array.isArray(value.qa) || value.qa.length === 0) {
    return false;
  }
  const qaIds = new Set<string>();
  const claimedQuestions = new Set<string>();
  if (!value.qa.every((entry) => isQaEntry(entry, ids, qaIds, claimedQuestions))) {
    return false;
  }
  return value.qa.every((entry) => entry.followUps.every((followUp) => qaIds.has(followUp)));
}

export function getSourceState(mode: Mode, demoData?: unknown): SourceState {
  if (mode === 'live') {
    return {
      mode,
      status: 'empty',
      title: 'Live chưa được cấu hình',
      detail:
        'Chưa nối backend hoặc dataset thật. Chế độ vẫn là live; app không tự chuyển sang dữ liệu demo. Kết nối API thuộc Phase 6.',
    };
  }

  if (!isDemoDataset(demoData)) {
    return {
      mode,
      status: 'error',
      title: 'Không đọc được dữ liệu demo',
      detail: 'Fixture demo thiếu hoặc sai định dạng. Cần schema phiên bản 1, sáu điểm mô phỏng, lời giới thiệu và bộ câu hỏi có nguồn hợp lệ; app không lấy dữ liệu từ API để thay thế.',
    };
  }

  return {
    mode,
    status: 'ready',
    title: 'Đã nạp 6 điểm mô phỏng',
    detail: 'Nguồn: data/demo.json trong bundle. Không cần API, server hoặc API key để xem dữ liệu này.',
    dataset: demoData,
  };
}
