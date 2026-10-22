export type Mode = 'demo' | 'live';
export type ReviewStatus = 'approved';

import { normalizeQuestion, type QaEntry as BaseQaEntry } from '../qa/match.ts';
import { type Locale, isLocale } from './locale.ts';
import { translate } from '../i18n/translator.ts';

export const TOPICS = ['an thuc', 'chuyen xua', 'kham pha tu do'] as const;

export type Topic = (typeof TOPICS)[number];

export const MAX_BODY_BYTES = 512 * 1024; // 512 KiB
export const MAX_DISCLAIMER_LENGTH = 2000;
export const MAX_INTRO_TEXT_LENGTH = 4000;
export const MAX_STORY_LENGTH = 2000;
export const MAX_ANSWER_LENGTH = 2000;
export const MAX_CAPTION_LENGTH = 220;
export const MAX_ID_LENGTH = 128;
export const MAX_SHORT_TEXT_LENGTH = 500;
export const MAX_EVIDENCE_LENGTH = 2000;
export const MAX_EVIDENCE_COUNT = 20;
export const MIN_ALIASES = 1;
export const MAX_ALIASES = 7;
export const MIN_FOLLOW_UPS = 0;
export const MAX_FOLLOW_UPS = 2;
export const MAX_TAGS = 20;

export type DemoNode = {
  id: string;
  name: string;
  summary: string;
  tags: Topic[];
  visitMinutes: number;
  available: boolean;
  visited: boolean;
  story: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  order?: number;
  alongAlleyMeters?: number | null;
  pendingCheck?: string | null;
  evidence?: string[];
  reviewStatus?: ReviewStatus;
  updatedAt?: string;
};

export type DemoIntro = {
  text: string;
  evidence: string[];
  reviewStatus?: ReviewStatus;
  updatedAt?: string;
};

export type QaEntry = BaseQaEntry & {
  reviewStatus?: ReviewStatus;
  updatedAt?: string;
};

export type DemoDataset = {
  schemaVersion: 1;
  kind: 'simulated' | 'reviewed';
  disclaimer: string;
  intro: DemoIntro;
  startNodeId: string;
  nodes: DemoNode[];
  qa: QaEntry[];
  reviewStatus?: ReviewStatus;
  updatedAt?: string;
};

export type DemoDatasetV2 = {
  schemaVersion: 2;
  locale: Locale;
  collectionId: string;
  polyline?: [number, number][];
  lengthMeters?: number;
  kind: 'simulated' | 'reviewed';
  disclaimer: string;
  intro: DemoIntro;
  startNodeId: string;
  nodes: DemoNode[];
  qa: QaEntry[];
  reviewStatus?: ReviewStatus;
  updatedAt?: string;
};

export type AnyDemoDataset = DemoDataset | DemoDatasetV2;

type SourceDescription = {
  title: string;
  detail: string;
};

export type LiveReason = 'no-config' | 'no-data' | 'shape' | 'http' | 'network' | 'timeout';

export type SourceState<TDataset = DemoDataset> = SourceDescription & (
  | { mode: 'demo'; status: 'ready'; dataset: TDataset; revision?: string }
  | { mode: 'demo'; status: 'error' }
  | { mode: 'live'; status: 'ready'; dataset: TDataset; revision?: string }
  | { mode: 'live'; status: 'empty'; reason?: LiveReason }
  | { mode: 'live'; status: 'error'; reason?: LiveReason }
);

export type SourceStateV2 = SourceState<DemoDatasetV2>;

export const liveTitles: Record<LiveReason, { title: string; detail: string }> = {
  'no-config': {
    title: 'Live chưa được cấu hình',
    detail:
      'Chưa có URL backend cho chế độ live. App không tự chuyển sang dữ liệu demo và không tự tạo nội dung. Cấu hình EXPO_PUBLIC_NGOKE_API_BASE_URL hoặc app.json extra.apiBaseUrl rồi bấm “Thử lại”.',
  },
  'no-data': {
    title: 'Live chưa có dữ liệu',
    detail:
      'Máy chủ trả về nhưng chưa có điểm nào đã duyệt. App giữ nguyên chế độ live và không nạp dữ liệu demo.',
  },
  shape: {
    title: 'Dữ liệu live không đúng định dạng',
    detail:
      'Bản trả về không khớp schema phiên bản 1, hoặc thiếu nguồn của câu trả lời. App từ chối hiển thị thay vì hiện nội dung thiếu căn cứ.',
  },
  http: {
    title: 'Máy chủ live trả lỗi',
    detail: 'Máy chủ không trả về dữ liệu hợp lệ. Bấm “Thử lại” sau khi máy chủ sẵn sàng.',
  },
  network: {
    title: 'Không kết nối được máy chủ live',
    detail: 'Kiểm tra mạng hoặc URL backend rồi bấm “Thử lại”.',
  },
  timeout: {
    title: 'Máy chủ live phản hồi quá chậm',
    detail: 'Quá 8 giây không có phản hồi nên app dừng chờ. Bấm “Thử lại”.',
  },
};

export const liveEmpty = <TDataset = DemoDataset>(
  reason: LiveReason = 'no-config',
  locale: Locale = 'vi',
): SourceState<TDataset> => {
  const normReason = reason.replace('-', '_');
  const titleKey = `live.reason.${normReason}.title`;
  const detailKey = `live.reason.${normReason}.detail`;
  const translatedTitle = translate(locale, titleKey);
  const translatedDetail = translate(locale, detailKey);
  return {
    mode: 'live',
    status: 'empty',
    reason,
    title: translatedTitle !== titleKey ? translatedTitle : liveTitles[reason].title,
    detail: translatedDetail !== detailKey ? translatedDetail : liveTitles[reason].detail,
  };
};

export const liveError = <TDataset = DemoDataset>(
  reason: LiveReason,
  locale: Locale = 'vi',
): SourceState<TDataset> => {
  const normReason = reason.replace('-', '_');
  const titleKey = `live.reason.${normReason}.title`;
  const detailKey = `live.reason.${normReason}.detail`;
  const translatedTitle = translate(locale, titleKey);
  const translatedDetail = translate(locale, detailKey);
  return {
    mode: 'live',
    status: 'error',
    reason,
    title: translatedTitle !== titleKey ? translatedTitle : liveTitles[reason].title,
    detail: translatedDetail !== detailKey ? translatedDetail : liveTitles[reason].detail,
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|[+-]00:?00)$/i.exec(trimmed);
  if (!match) return false;

  const [, yearStr, monthStr, dayStr, hourStr, minStr, secStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseInt(secStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  if (second < 0 || second > 59) return false;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

function isBoundedString(value: unknown, maxLength: number, minLength = 1): value is string {
  return typeof value === 'string' && value.trim().length >= minLength && value.length <= maxLength;
}

function isCoordinate(value: unknown, limit: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}

export function isCoordinatesV2(latitude: unknown, longitude: unknown): boolean {
  if (latitude === null && longitude === null) {
    return true;
  }
  return isCoordinate(latitude, 90) && isCoordinate(longitude, 180);
}

function isTopicList(value: unknown): value is Topic[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= TOPICS.length &&
    value.length <= MAX_TAGS &&
    value.every((tag) => (TOPICS as readonly string[]).includes(tag))
  );
}

function isBoundedStringList(
  value: unknown,
  minCount: number,
  maxCount: number,
  maxItemLength: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minCount &&
    value.length <= maxCount &&
    value.every((item) => isBoundedString(item, maxItemLength, 1))
  );
}

function isDemoNode(
  value: unknown,
  ids: Set<string>,
  isReviewed: boolean,
  schemaVersion: 1 | 2 = 1,
): value is DemoNode {
  if (!isRecord(value)) return false;
  if (!isBoundedString(value.id, MAX_ID_LENGTH) || ids.has(value.id)) return false;
  if (!isBoundedString(value.name, MAX_SHORT_TEXT_LENGTH)) return false;
  if (!isBoundedString(value.summary, MAX_SHORT_TEXT_LENGTH)) return false;
  if (value.story === null) {
    if (schemaVersion !== 2 || isReviewed) return false;
  } else if (!isBoundedString(value.story, MAX_STORY_LENGTH)) {
    return false;
  }
  if (value.story === undefined) return false;
  if (!isBoundedString(value.caption, MAX_CAPTION_LENGTH)) return false;
  if (!isTopicList(value.tags)) return false;
  if (typeof value.available !== 'boolean' || typeof value.visited !== 'boolean') return false;
  if (schemaVersion === 2) {
    if (!isCoordinatesV2(value.latitude, value.longitude)) return false;
  } else {
    if (!isCoordinate(value.latitude, 90) || !isCoordinate(value.longitude, 180)) return false;
  }
  if (!Number.isInteger(value.visitMinutes) || (value.visitMinutes as number) <= 0) return false;

  if (value.order !== undefined) {
    if (!Number.isInteger(value.order) || (value.order as number) < 1) return false;
  }
  if (value.alongAlleyMeters !== undefined && value.alongAlleyMeters !== null) {
    if (
      typeof value.alongAlleyMeters !== 'number' ||
      !Number.isFinite(value.alongAlleyMeters) ||
      (value.alongAlleyMeters as number) < 0
    ) {
      return false;
    }
  }
  if (value.pendingCheck !== undefined && value.pendingCheck !== null) {
    if (!isBoundedString(value.pendingCheck, MAX_SHORT_TEXT_LENGTH, 1)) return false;
  }

  if (value.evidence !== undefined) {
    if (!isBoundedStringList(value.evidence, 1, MAX_EVIDENCE_COUNT, MAX_EVIDENCE_LENGTH)) {
      return false;
    }
  }

  if (isReviewed) {
    if (value.reviewStatus !== 'approved' || !isValidUtcTimestamp(value.updatedAt)) {
      return false;
    }
  } else {
    if (value.reviewStatus !== undefined && value.reviewStatus !== 'approved') return false;
    if (value.updatedAt !== undefined && !isValidUtcTimestamp(value.updatedAt)) return false;
  }

  ids.add(value.id);
  return true;
}

function isQaEntry(
  value: unknown,
  nodeIds: Set<string>,
  qaIds: Set<string>,
  claimedQuestions: Set<string>,
  isReviewed: boolean,
): value is QaEntry {
  if (!isRecord(value)) return false;
  if (!isBoundedString(value.id, MAX_ID_LENGTH) || qaIds.has(value.id)) return false;
  if (!isBoundedString(value.question, MAX_SHORT_TEXT_LENGTH)) return false;
  if (!isBoundedString(value.answer, MAX_ANSWER_LENGTH)) return false;
  if (!isBoundedString(value.nodeId, MAX_ID_LENGTH) || !nodeIds.has(value.nodeId)) return false;

  if (!isBoundedStringList(value.aliases, MIN_ALIASES, MAX_ALIASES, MAX_SHORT_TEXT_LENGTH)) {
    return false;
  }
  if (!isBoundedStringList(value.evidence, 1, MAX_EVIDENCE_COUNT, MAX_EVIDENCE_LENGTH)) {
    return false;
  }
  if (!isBoundedStringList(value.followUps, MIN_FOLLOW_UPS, MAX_FOLLOW_UPS, MAX_ID_LENGTH)) {
    return false;
  }
  if (!isBoundedStringList(value.tags, 0, MAX_TAGS, MAX_SHORT_TEXT_LENGTH)) {
    return false;
  }

  if (new Set(value.followUps).size !== value.followUps.length || value.followUps.includes(value.id)) {
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

  if (isReviewed) {
    if (value.reviewStatus !== 'approved' || !isValidUtcTimestamp(value.updatedAt)) {
      return false;
    }
  } else {
    if (value.reviewStatus !== undefined && value.reviewStatus !== 'approved') return false;
    if (value.updatedAt !== undefined && !isValidUtcTimestamp(value.updatedAt)) return false;
  }

  qaIds.add(value.id);
  return true;
}

function isIntro(value: unknown, isReviewed: boolean): value is DemoIntro {
  if (!isRecord(value)) return false;
  if (!isBoundedString(value.text, MAX_INTRO_TEXT_LENGTH)) return false;
  if (!isBoundedStringList(value.evidence, 1, MAX_EVIDENCE_COUNT, MAX_EVIDENCE_LENGTH)) {
    return false;
  }

  if (isReviewed) {
    if (value.reviewStatus !== 'approved' || !isValidUtcTimestamp(value.updatedAt)) {
      return false;
    }
  } else {
    if (value.reviewStatus !== undefined && value.reviewStatus !== 'approved') return false;
    if (value.updatedAt !== undefined && !isValidUtcTimestamp(value.updatedAt)) return false;
  }

  return true;
}

function isDataset(value: unknown, mode: Mode): value is DemoDataset {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    return false;
  }

  if (mode === 'demo') {
    if (value.kind !== 'simulated') return false;
  } else {
    if (value.kind !== 'simulated' && value.kind !== 'reviewed') return false;
  }

  const isReviewed = value.kind === 'reviewed';

  if (isReviewed) {
    if (value.reviewStatus !== undefined && value.reviewStatus !== 'approved') return false;
    if (value.updatedAt !== undefined && !isValidUtcTimestamp(value.updatedAt)) return false;
  }

  if (!isBoundedString(value.disclaimer, MAX_DISCLAIMER_LENGTH)) {
    return false;
  }
  if (!isIntro(value.intro, isReviewed)) {
    return false;
  }

  if (!Array.isArray(value.nodes)) {
    return false;
  }
  if (mode === 'demo') {
    if (value.nodes.length !== 6) return false;
  } else {
    if (value.nodes.length < 1 || value.nodes.length > 50) return false;
  }

  const nodeIds = new Set<string>();
  for (const node of value.nodes) {
    if (!isDemoNode(node, nodeIds, isReviewed)) {
      return false;
    }
  }

  if (!isBoundedString(value.startNodeId, MAX_ID_LENGTH) || !nodeIds.has(value.startNodeId)) {
    return false;
  }


  if (!Array.isArray(value.qa)) {
    return false;
  }
  if (mode === 'demo') {
    if (value.qa.length === 0 || value.qa.length > 200) return false;
  } else {
    if (value.qa.length < 0 || value.qa.length > 200) return false;
  }

  const qaIds = new Set<string>();
  const claimedQuestions = new Set<string>();
  for (const entry of value.qa) {
    if (!isQaEntry(entry, nodeIds, qaIds, claimedQuestions, isReviewed)) {
      return false;
    }
  }

  return value.qa.every((entry: { followUps: string[] }) =>
    entry.followUps.every((followUp: string) => qaIds.has(followUp)),
  );
}

/** The one dataset rule shared by demo and live. */
export function parseDataset(value: unknown, options: { mode?: Mode } = {}): DemoDataset | undefined {
  const mode = options.mode ?? 'demo';
  return isDataset(value, mode) ? value : undefined;
}

export function isDatasetV2(
  value: unknown,
  options: { mode?: Mode; expectedLocale?: Locale } = {},
): value is DemoDatasetV2 {
  if (!isRecord(value) || value.schemaVersion !== 2) {
    return false;
  }

  if (!isLocale(value.locale)) {
    return false;
  }
  if (options.expectedLocale !== undefined && value.locale !== options.expectedLocale) {
    return false;
  }

  if (!isBoundedString(value.collectionId, MAX_ID_LENGTH)) {
    return false;
  }

  if (value.kind !== 'simulated' && value.kind !== 'reviewed') {
    return false;
  }

  const isReviewed = value.kind === 'reviewed';

  if (isReviewed) {
    if (value.reviewStatus !== 'approved' || !isValidUtcTimestamp(value.updatedAt)) {
      return false;
    }
  } else {
    if (value.reviewStatus !== undefined && value.reviewStatus !== 'approved') return false;
    if (value.updatedAt !== undefined && !isValidUtcTimestamp(value.updatedAt)) return false;
  }

  if (!isBoundedString(value.disclaimer, MAX_DISCLAIMER_LENGTH)) {
    return false;
  }
  if (!isIntro(value.intro, isReviewed)) {
    return false;
  }

  if (!Array.isArray(value.nodes)) {
    return false;
  }
  if (value.nodes.length < 1 || value.nodes.length > 50) {
    return false;
  }

  const nodeIds = new Set<string>();
  for (const node of value.nodes) {
    if (!isDemoNode(node, nodeIds, isReviewed, 2)) {
      return false;
    }
  }

  if (!isBoundedString(value.startNodeId, MAX_ID_LENGTH) || !nodeIds.has(value.startNodeId)) {
    return false;
  }

  if (value.polyline !== undefined) {
    if (!Array.isArray(value.polyline) || value.polyline.length < 2 || value.polyline.length > 500) {
      return false;
    }
    for (const point of value.polyline) {
      if (
        !Array.isArray(point) ||
        point.length !== 2 ||
        !isCoordinate(point[0], 90) ||
        !isCoordinate(point[1], 180)
      ) {
        return false;
      }
    }
  }

  if (value.lengthMeters !== undefined) {
    if (
      typeof value.lengthMeters !== 'number' ||
      !Number.isFinite(value.lengthMeters) ||
      value.lengthMeters <= 0
    ) {
      return false;
    }
  }

  if (!Array.isArray(value.qa)) {
    return false;
  }
  if (value.qa.length < 0 || value.qa.length > 200) {
    return false;
  }

  const qaIds = new Set<string>();
  const claimedQuestions = new Set<string>();
  for (const entry of value.qa) {
    if (!isQaEntry(entry, nodeIds, qaIds, claimedQuestions, isReviewed)) {
      return false;
    }
  }

  return value.qa.every((entry: { followUps: string[] }) =>
    entry.followUps.every((followUp: string) => qaIds.has(followUp)),
  );
}

export function parseDatasetV2(
  value: unknown,
  options: { mode?: Mode; expectedLocale?: Locale } = {},
): DemoDatasetV2 | undefined {
  return isDatasetV2(value, options) ? value : undefined;
}

export function parseAnyDataset(
  value: unknown,
  options: { mode?: Mode; expectedLocale?: Locale } = {},
): AnyDemoDataset | undefined {
  if (isRecord(value)) {
    if (value.schemaVersion === 2) {
      return parseDatasetV2(value, options);
    }
    if (value.schemaVersion === 1) {
      if (options.expectedLocale !== undefined && options.expectedLocale !== 'vi') {
        return undefined;
      }
      return parseDataset(value, { mode: options.mode });
    }
  }
  return undefined;
}

export type DatasetPairValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateDatasetV2Pair(
  vi: DemoDatasetV2,
  en: DemoDatasetV2,
): DatasetPairValidationResult {
  if (!vi || !en) {
    return { ok: false, reason: 'Both datasets must be defined' };
  }
  if (vi.schemaVersion !== 2 || en.schemaVersion !== 2) {
    return { ok: false, reason: 'Both datasets must have schemaVersion 2' };
  }
  if (vi.locale !== 'vi') {
    return { ok: false, reason: `Vietnamese dataset has invalid locale: ${String(vi.locale)}` };
  }
  if (en.locale !== 'en') {
    return { ok: false, reason: `English dataset has invalid locale: ${String(en.locale)}` };
  }
  if (vi.collectionId !== en.collectionId) {
    return {
      ok: false,
      reason: `Collection ID mismatch: "${vi.collectionId}" vs "${en.collectionId}"`,
    };
  }
  if (vi.kind !== en.kind) {
    return { ok: false, reason: `Kind mismatch: "${vi.kind}" vs "${en.kind}"` };
  }
  if (vi.startNodeId !== en.startNodeId) {
    return {
      ok: false,
      reason: `Start node mismatch: "${vi.startNodeId}" vs "${en.startNodeId}"`,
    };
  }

  if (vi.nodes.length !== en.nodes.length) {
    return {
      ok: false,
      reason: `Node count mismatch: ${vi.nodes.length} in VI vs ${en.nodes.length} in EN`,
    };
  }

  for (let i = 0; i < vi.nodes.length; i++) {
    const viNode = vi.nodes[i];
    const enNode = en.nodes[i];
    if (viNode.id !== enNode.id) {
      return {
        ok: false,
        reason: `Node ID mismatch at index ${i}: "${viNode.id}" vs "${enNode.id}"`,
      };
    }
    if (viNode.available !== enNode.available) {
      return { ok: false, reason: `Node "${viNode.id}" available flag mismatch` };
    }
    if (viNode.visited !== enNode.visited) {
      return { ok: false, reason: `Node "${viNode.id}" visited flag mismatch` };
    }
    if (viNode.visitMinutes !== enNode.visitMinutes) {
      return { ok: false, reason: `Node "${viNode.id}" visitMinutes mismatch` };
    }
    if (viNode.latitude !== enNode.latitude || viNode.longitude !== enNode.longitude) {
      return {
        ok: false,
        reason: `Node "${viNode.id}" coordinate mismatch: (${viNode.latitude}, ${viNode.longitude}) vs (${enNode.latitude}, ${enNode.longitude})`,
      };
    }
    if (
      viNode.tags.length !== enNode.tags.length ||
      !viNode.tags.every((tag, idx) => tag === enNode.tags[idx])
    ) {
      return { ok: false, reason: `Node "${viNode.id}" tags mismatch` };
    }
  }

  if (vi.qa.length !== en.qa.length) {
    return {
      ok: false,
      reason: `QA count mismatch: ${vi.qa.length} in VI vs ${en.qa.length} in EN`,
    };
  }

  for (let i = 0; i < vi.qa.length; i++) {
    const viQa = vi.qa[i];
    const enQa = en.qa[i];
    if (viQa.id !== enQa.id) {
      return {
        ok: false,
        reason: `QA ID mismatch at index ${i}: "${viQa.id}" vs "${enQa.id}"`,
      };
    }
    if (viQa.nodeId !== enQa.nodeId) {
      return {
        ok: false,
        reason: `QA "${viQa.id}" nodeId mismatch: "${viQa.nodeId}" vs "${enQa.nodeId}"`,
      };
    }
    if (
      viQa.followUps.length !== enQa.followUps.length ||
      !viQa.followUps.every((fu, idx) => fu === enQa.followUps[idx])
    ) {
      return { ok: false, reason: `QA "${viQa.id}" followUps mismatch` };
    }
    if (
      viQa.tags.length !== enQa.tags.length ||
      !viQa.tags.every((tag, idx) => tag === enQa.tags[idx])
    ) {
      return { ok: false, reason: `QA "${viQa.id}" tags mismatch` };
    }
  }

  return { ok: true };
}

export function getSourceState(mode: Mode, demoData?: unknown, locale: Locale = 'vi'): SourceState {
  if (mode === 'live') {
    return liveEmpty('no-config', locale);
  }

  const dataset = parseAnyDataset(demoData, { mode: 'demo', expectedLocale: locale })
    ?? parseDataset(demoData, { mode: 'demo' });
  if (dataset === undefined) {
    const title = locale === 'en' ? 'Cannot read demo data' : 'Không đọc được dữ liệu demo';
    const detail = locale === 'en'
      ? 'Demo fixture is missing or invalid. Requires valid schema, simulated points, introduction, and verified Q&A.'
      : 'Fixture demo thiếu hoặc sai định dạng. Cần schema phiên bản 1 hoặc 2, điểm mô phỏng, lời giới thiệu và bộ câu hỏi có nguồn hợp lệ; app không lấy dữ liệu từ API để thay thế.';
    return {
      mode,
      status: 'error',
      title,
      detail,
    };
  }

  const title = locale === 'en'
    ? `Loaded ${dataset.nodes.length} simulated points`
    : `Đã nạp ${dataset.nodes.length} điểm mô phỏng`;
  const detail = locale === 'en'
    ? 'Source: bundled fixture. No API, server or API key required to view this data.'
    : 'Nguồn: data/demo.json trong bundle. Không cần API, server hoặc API key để xem dữ liệu này.';

  return {
    mode,
    status: 'ready',
    title,
    detail,
    dataset: dataset as DemoDataset,
  };
}

export function getSourceStateV2(options: {
  mode: Mode;
  locale: Locale;
  demoData?: unknown;
}): SourceState<DemoDatasetV2> {
  const { mode, locale, demoData } = options;
  if (mode === 'live') {
    return liveEmpty<DemoDatasetV2>('no-config', locale);
  }

  const dataset = parseDatasetV2(demoData, { mode: 'demo', expectedLocale: locale });
  if (dataset === undefined) {
    const title = locale === 'en' ? 'Cannot read demo data' : 'Không đọc được dữ liệu demo';
    const detail =
      locale === 'en'
        ? 'Demo fixture is missing or invalid. Requires schema version 2, valid introduction and verified Q&A.'
        : 'Fixture demo thiếu hoặc sai định dạng. Cần schema phiên bản 2, lời giới thiệu và bộ câu hỏi có nguồn hợp lệ.';
    return {
      mode,
      status: 'error',
      title,
      detail,
    };
  }

  const title =
    locale === 'en'
      ? `Loaded ${dataset.nodes.length} simulated points`
      : `Đã nạp ${dataset.nodes.length} điểm mô phỏng`;
  const detail =
    locale === 'en'
      ? `Source: bundled ${dataset.collectionId}. No API or server required.`
      : `Nguồn: bundle ${dataset.collectionId}. Không cần API hoặc server.`;

  return {
    mode,
    status: 'ready',
    title,
    detail,
    dataset,
  };
}
