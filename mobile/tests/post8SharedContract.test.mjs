import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { LOCALES, DEFAULT_LOCALE, isLocale, parseLocale, assertLocale } from '../src/data/locale.ts';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';
import {
  isCoordinatesV2,
  isDatasetV2,
  parseDatasetV2,
  parseAnyDataset,
  validateDatasetV2Pair,
  getSourceStateV2,
  MAX_BODY_BYTES,
} from '../src/data/sourceState.ts';
import { loadLiveSourceV2 } from '../src/data/live.ts';
import { DICTIONARY, translate, t } from '../src/i18n/translator.ts';
import { pickCandidate } from '../src/location/nearest.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fictionEnPath = join(__dirname, '../../data/localized/fiction.en.json');
const fictionEnRaw = readFileSync(fictionEnPath, 'utf8');
const fictionEnJson = JSON.parse(fictionEnRaw);

test('locale.ts - definitions, validation, and fallback', () => {
  assert.deepEqual(LOCALES, ['vi', 'en']);
  assert.equal(DEFAULT_LOCALE, 'vi');

  assert.equal(isLocale('vi'), true);
  assert.equal(isLocale('en'), true);
  assert.equal(isLocale('fr'), false);
  assert.equal(isLocale(''), false);
  assert.equal(isLocale(null), false);
  assert.equal(isLocale(123), false);

  assert.equal(parseLocale('en'), 'en');
  assert.equal(parseLocale('vi'), 'vi');
  assert.equal(parseLocale('en-US'), 'en');
  assert.equal(parseLocale('en_GB'), 'en');
  assert.equal(parseLocale('vi-VN'), 'vi');
  assert.equal(parseLocale('vi_VN'), 'vi');
  assert.equal(parseLocale('english'), 'vi');
  assert.equal(parseLocale('viola'), 'vi');
  assert.equal(parseLocale('ja'), 'vi');
  assert.equal(parseLocale(undefined), 'vi');
  assert.equal(parseLocale(null), 'vi');

  assert.doesNotThrow(() => assertLocale('vi'));
  assert.doesNotThrow(() => assertLocale('en'));
  assert.throws(() => assertLocale('es'), /Unsupported or invalid locale: es/);
});

test('canonicalJson.ts - key sorting, array preservation, and diacritics', () => {
  // 1. Key order permutation yields identical canonical JSON string
  const objA = { z: 1, a: 2, m: { y: 'test', b: [3, 2, 1] } };
  const objB = { a: 2, m: { b: [3, 2, 1], y: 'test' }, z: 1 };
  assert.equal(canonicalDatasetJson(objA), canonicalDatasetJson(objB));
  assert.equal(canonicalDatasetJson(objA), '{"a":2,"m":{"b":[3,2,1],"y":"test"},"z":1}');

  // 2. Hash of canonical JSON is invariant under key permutation
  const hashA = createHash('sha256').update(canonicalDatasetJson(objA), 'utf8').digest('hex');
  const hashB = createHash('sha256').update(canonicalDatasetJson(objB), 'utf8').digest('hex');
  assert.equal(hashA, hashB);

  // 3. Array order is strictly preserved
  const arrA = [1, 2, 3];
  const arrB = [3, 2, 1];
  assert.notEqual(canonicalDatasetJson(arrA), canonicalDatasetJson(arrB));

  // 4. Does NOT normalize Unicode diacritics (preserves exact incoming byte sequence)
  const precomposed = 'Hà Nội'; // U+00E0
  const decomposed = 'Ha\u0300 Nô\u0323i'; // U+0061 U+0300
  assert.notEqual(precomposed, decomposed);
  // Both strings must be stringified as-is without NFD or NFC transformation
  assert.equal(canonicalDatasetJson({ city: precomposed }), `{"city":${JSON.stringify(precomposed)}}`);
  assert.equal(canonicalDatasetJson({ city: decomposed }), `{"city":${JSON.stringify(decomposed)}}`);
  assert.notEqual(canonicalDatasetJson({ city: precomposed }), canonicalDatasetJson({ city: decomposed }));
});

test('sourceState.ts - V2 coordinate validation (nullable geometry)', () => {
  // Both numbers valid
  assert.equal(isCoordinatesV2(10.76, 106.68), true);
  assert.equal(isCoordinatesV2(0, 0), true);
  assert.equal(isCoordinatesV2(-90, 180), true);

  // Both null valid (unanchored node per spec)
  assert.equal(isCoordinatesV2(null, null), true);

  // Only one null -> must be rejected as shape error
  assert.equal(isCoordinatesV2(10.76, null), false);
  assert.equal(isCoordinatesV2(null, 106.68), false);

  // Out of bounds
  assert.equal(isCoordinatesV2(91, 106.68), false);
  assert.equal(isCoordinatesV2(10.76, 181), false);
  assert.equal(isCoordinatesV2('10.76', 106.68), false);
});

test('sourceState.ts - V2 dataset acceptance: fiction.en.json', () => {
  assert.equal(isDatasetV2(fictionEnJson), true);

  const parsed = parseDatasetV2(fictionEnJson, { mode: 'demo', expectedLocale: 'en' });
  assert.ok(parsed);
  assert.equal(parsed.schemaVersion, 2);
  assert.equal(parsed.locale, 'en');
  assert.equal(parsed.collectionId, 'fiction-letter');
  assert.equal(parsed.nodes.length, 6);
  assert.equal(parsed.qa.length, 21);

  // Rejects when expectedLocale does not match
  const wrongLocale = parseDatasetV2(fictionEnJson, { mode: 'demo', expectedLocale: 'vi' });
  assert.equal(wrongLocale, undefined);
});

test('sourceState.ts - getSourceStateV2', () => {
  const readyEn = getSourceStateV2({ mode: 'demo', locale: 'en', demoData: fictionEnJson });
  assert.equal(readyEn.status, 'ready');
  if (readyEn.status === 'ready') {
    assert.equal(readyEn.dataset.collectionId, 'fiction-letter');
  }

  const errorState = getSourceStateV2({ mode: 'demo', locale: 'en', demoData: {} });
  assert.equal(errorState.status, 'error');

  const liveState = getSourceStateV2({ mode: 'live', locale: 'en' });
  assert.equal(liveState.status, 'empty');
});

test('sourceState.ts - V2 dataset rejections', () => {
  // 1. Invalid schemaVersion
  assert.equal(isDatasetV2({ ...fictionEnJson, schemaVersion: 3 }), false);

  // 2. Missing collectionId
  const noCollectionId = { ...fictionEnJson };
  delete noCollectionId.collectionId;
  assert.equal(isDatasetV2(noCollectionId), false);

  // 3. CollectionId too long (>128 chars)
  assert.equal(isDatasetV2({ ...fictionEnJson, collectionId: 'x'.repeat(129) }), false);

  // 4. Invalid locale
  assert.equal(isDatasetV2({ ...fictionEnJson, locale: 'fr' }), false);

  // 5. Mismatched coordinate (one null, one number)
  const badCoordsNodes = JSON.parse(JSON.stringify(fictionEnJson.nodes));
  badCoordsNodes[0].latitude = null;
  badCoordsNodes[0].longitude = 106.68;
  assert.equal(isDatasetV2({ ...fictionEnJson, nodes: badCoordsNodes }), false);

  // 6. Both null coordinates accepted
  const nullCoordsNodes = JSON.parse(JSON.stringify(fictionEnJson.nodes));
  nullCoordsNodes[0].latitude = null;
  nullCoordsNodes[0].longitude = null;
  assert.equal(isDatasetV2({ ...fictionEnJson, nodes: nullCoordsNodes }), true);

  // 7. Reviewed dataset must have approved status and valid updatedAt
  const reviewedWithoutApproval = {
    ...fictionEnJson,
    kind: 'reviewed',
    reviewStatus: undefined,
  };
  assert.equal(isDatasetV2(reviewedWithoutApproval), false);

  const reviewedWithApproval = {
    ...fictionEnJson,
    kind: 'reviewed',
    reviewStatus: 'approved',
    updatedAt: '2026-10-16T08:00:00Z',
    intro: {
      ...fictionEnJson.intro,
      reviewStatus: 'approved',
      updatedAt: '2026-10-16T08:00:00Z',
    },
    nodes: fictionEnJson.nodes.map((n) => ({
      ...n,
      reviewStatus: 'approved',
      updatedAt: '2026-10-16T08:00:00Z',
    })),
    qa: fictionEnJson.qa.map((q) => ({
      ...q,
      reviewStatus: 'approved',
      updatedAt: '2026-10-16T08:00:00Z',
    })),
  };
  assert.equal(isDatasetV2(reviewedWithApproval), true);
});

test('sourceState.ts - parseAnyDataset compatibility', () => {
  // Can parse V2
  const v2Result = parseAnyDataset(fictionEnJson, { expectedLocale: 'en' });
  assert.ok(v2Result);
  assert.equal(v2Result.schemaVersion, 2);

  // Rejects V1 if expectedLocale is 'en'
  const demoV1Path = join(__dirname, '../../data/demo.json');
  const demoV1Raw = readFileSync(demoV1Path, 'utf8');
  const demoV1Json = JSON.parse(demoV1Raw);

  const v1AsEn = parseAnyDataset(demoV1Json, { expectedLocale: 'en' });
  assert.equal(v1AsEn, undefined);

  // Accepts V1 when expectedLocale is 'vi' or undefined
  const v1AsVi = parseAnyDataset(demoV1Json, { expectedLocale: 'vi' });
  assert.ok(v1AsVi);
  assert.equal(v1AsVi.schemaVersion, 1);
});

test('sourceState.ts - validateDatasetV2Pair logical parity', () => {
  // Construct matching VI V2 dataset from fictionEnJson
  const fictionViJson = {
    ...fictionEnJson,
    locale: 'vi',
    disclaimer: 'Bản dịch tiếng Việt mô phỏng.',
    intro: {
      text: 'Lời mở đầu tiếng Việt.',
      evidence: ['Bằng chứng demo tiếng Việt'],
    },
    nodes: fictionEnJson.nodes.map((n, i) => ({
      ...n,
      name: `Tên điểm ${i + 1}`,
      summary: `Tóm tắt ${i + 1}`,
      story: `Câu chuyện ${i + 1}`,
      caption: `Chú thích ${i + 1}`,
    })),
    qa: fictionEnJson.qa.map((q, i) => ({
      ...q,
      question: `Câu hỏi ${i + 1}?`,
      answer: `Câu trả lời ${i + 1}.`,
      aliases: [`câu hỏi ${i + 1}`, `hỏi ${i + 1}`],
      evidence: [`Bằng chứng QA ${i + 1}`],
    })),
  };

  const validPair = validateDatasetV2Pair(fictionViJson, fictionEnJson);
  assert.deepEqual(validPair, { ok: true });

  // 1. Mismatched collectionId
  const badCollection = validateDatasetV2Pair(
    { ...fictionViJson, collectionId: 'other-id' },
    fictionEnJson,
  );
  assert.equal(badCollection.ok, false);
  assert.match(badCollection.reason, /Collection ID mismatch/);

  // 2. Mismatched node count
  const badNodeCount = validateDatasetV2Pair(
    { ...fictionViJson, nodes: fictionViJson.nodes.slice(0, 5) },
    fictionEnJson,
  );
  assert.equal(badNodeCount.ok, false);
  assert.match(badNodeCount.reason, /Node count mismatch/);

  // 3. Mismatched node coordinates
  const badCoordNodes = JSON.parse(JSON.stringify(fictionViJson.nodes));
  badCoordNodes[0].latitude = 10.9999;
  const badCoordPair = validateDatasetV2Pair(
    { ...fictionViJson, nodes: badCoordNodes },
    fictionEnJson,
  );
  assert.equal(badCoordPair.ok, false);
  assert.match(badCoordPair.reason, /coordinate mismatch/);

  // 4. Mismatched node tags
  const badTagNodes = JSON.parse(JSON.stringify(fictionViJson.nodes));
  badTagNodes[0].tags = ['an thuc'];
  const badTagPair = validateDatasetV2Pair(
    { ...fictionViJson, nodes: badTagNodes },
    fictionEnJson,
  );
  assert.equal(badTagPair.ok, false);
  assert.match(badTagPair.reason, /tags mismatch/);

  // 5. Mismatched QA followUps
  const badQa = JSON.parse(JSON.stringify(fictionViJson.qa));
  badQa[0].followUps = ['qa-06'];
  const badQaPair = validateDatasetV2Pair(
    { ...fictionViJson, qa: badQa },
    fictionEnJson,
  );
  assert.equal(badQaPair.ok, false);
  assert.match(badQaPair.reason, /followUps mismatch/);
});

test('i18n translator.ts - 100% key parity and parameter substitution', () => {
  const viKeys = Object.keys(DICTIONARY.vi).sort();
  const enKeys = Object.keys(DICTIONARY.en).sort();

  // 1. 100% key parity
  assert.deepEqual(viKeys, enKeys, 'VI and EN dictionaries must have identical keys');

  // 2. All 14 voice error codes exist
  const voiceErrorCodes = [
    'MIC_PERMISSION_DENIED',
    'MIC_PERMISSION_BLOCKED',
    'AUDIO_TOO_SHORT',
    'RECORDER_START_FAILED',
    'AUDIO_PLAYER_STOP_TIMEOUT',
    'AUDIO_TOO_LONG',
    'NO_SPEECH',
    'VOICE_NOT_CONFIGURED',
    'ASR_TIMEOUT',
    'ASR_UNAVAILABLE',
    'ASR_BUSY',
    'RATE_LIMITED',
    'INVALID_AUDIO',
    'UNSUPPORTED_LOCALE',
    'DEFAULT',
  ];
  for (const code of voiceErrorCodes) {
    const key = `voice.error.${code}`;
    assert.ok(DICTIONARY.vi[key], `Missing VI key for ${key}`);
    assert.ok(DICTIONARY.en[key], `Missing EN key for ${key}`);
  }

  // 3. Parameter interpolation
  const viSub = translate('vi', 'voice.notice.quota_exceeded', { seconds: 15 });
  assert.equal(viSub, 'Đã đạt giới hạn 15 giây. Nhấn Gửi để tiếp tục hoặc Huỷ để ghi âm lại.');

  const enSub = translate('en', 'voice.notice.quota_exceeded', { seconds: 15 });
  assert.equal(enSub, 'Maximum 15 seconds reached. Tap Send to continue or Cancel to record again.');

  // 4. Shorthand helper t
  assert.equal(t('vi', 'common.close'), 'Đóng');
  assert.equal(t('en', 'common.close'), 'Close');
});

test('live.ts - loadLiveSourceV2 URL, error, and timeout handling', async () => {
  // 1. Missing baseUrl -> no-config
  const noConfig = await loadLiveSourceV2({ baseUrl: '', locale: 'en' });
  assert.equal(noConfig.status, 'empty');
  assert.equal(noConfig.reason, 'no-config');
  assert.equal(noConfig.title, 'Live mode not configured');

  // 2. Invalid protocol -> shape
  const ftpConfig = await loadLiveSourceV2({ baseUrl: 'ftp://example.com', locale: 'en' });
  assert.equal(ftpConfig.status, 'error');
  assert.equal(ftpConfig.reason, 'shape');

  // 3. Query string in baseUrl -> shape
  const queryConfig = await loadLiveSourceV2({ baseUrl: 'http://example.com/api?a=1', locale: 'en' });
  assert.equal(queryConfig.status, 'error');
  assert.equal(queryConfig.reason, 'shape');

  // 4. 404 response -> no-data
  const mock404Fetch = async () => ({
    status: 404,
    ok: false,
    headers: new Map(),
  });
  const res404 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404Fetch,
  });
  assert.equal(res404.status, 'empty');
  assert.equal(res404.reason, 'no-data');
  assert.equal(res404.title, 'Live mode has no data');

  // 5. 503 response -> shape error
  const mock503Fetch = async () => ({
    status: 503,
    ok: false,
    headers: new Map(),
  });
  const res503 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock503Fetch,
  });
  assert.equal(res503.status, 'error');
  assert.equal(res503.reason, 'shape');

  // 6. Content-Language mismatch -> shape error
  const mockMismatchLangFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-language' ? 'vi' : null),
    },
    text: async () => JSON.stringify(fictionEnJson),
  });
  const resMismatch = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mockMismatchLangFetch,
  });
  assert.equal(resMismatch.status, 'error');
  assert.equal(resMismatch.reason, 'shape');

  // 7. Successful 200 response -> ready
  const mock200Fetch = async (url) => {
    assert.match(url, /\/api\/v2\/dataset\?locale=en/);
    return {
      status: 200,
      ok: true,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-language' ? 'en' : null),
      },
      text: async () => JSON.stringify(fictionEnJson),
    };
  };
  const res200 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock200Fetch,
  });
  assert.equal(res200.status, 'ready');
  assert.equal(res200.title, 'Live · 6 simulated points (unverified)');
  assert.equal(res200.dataset.schemaVersion, 2);
  assert.equal(res200.dataset.locale, 'en');

  // 8. Payload exceeding MAX_BODY_BYTES -> shape
  const mockBigFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-length' ? String(MAX_BODY_BYTES + 10) : null),
    },
    text: async () => 'x'.repeat(MAX_BODY_BYTES + 10),
  });
  const resBig = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mockBigFetch,
  });
  assert.equal(resBig.status, 'error');
  assert.equal(resBig.reason, 'shape');

  // 9. Timeout handling
  const mockHangFetch = async (_url, { signal }) => {
    return new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')));
    });
  };
  const resTimeout = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    timeoutMs: 50,
    fetchImpl: mockHangFetch,
  });
  assert.equal(resTimeout.status, 'error');
  assert.equal(resTimeout.reason, 'timeout');
  assert.equal(resTimeout.title, 'Live server timed out');
});

test('nearest.ts - candidate filtering with nullable coordinates', () => {
  const limits = { maxAccuracyMeters: 50, maxDistanceMeters: 1000 };
  const position = { latitude: 10.76, longitude: 106.68, accuracy: 10 };

  const nodesWithNullCoords = [
    {
      id: 'node-null',
      name: 'Unanchored Node',
      summary: 'No GPS fix yet',
      tags: ['kham pha tu do'],
      visitMinutes: 10,
      available: true,
      visited: false,
      story: 'Story',
      caption: 'Caption',
      latitude: null,
      longitude: null,
    },
    {
      id: 'node-valid',
      name: 'Anchored Node',
      summary: 'Has GPS',
      tags: ['kham pha tu do'],
      visitMinutes: 10,
      available: true,
      visited: false,
      story: 'Story',
      caption: 'Caption',
      latitude: 10.7601,
      longitude: 106.6801,
    },
  ];

  // Should pick the valid node and ignore the null coordinate node
  const candidate = pickCandidate(nodesWithNullCoords, position, limits);
  assert.equal(candidate.kind, 'candidate');
  assert.equal(candidate.node.id, 'node-valid');

  // If all nodes have null coordinates -> returns no-coordinates
  const onlyNullNodes = [nodesWithNullCoords[0]];
  const noCoordsCandidate = pickCandidate(onlyNullNodes, position, limits);
  assert.equal(noCoordsCandidate.kind, 'no-coordinates');
});

test('sourceState.ts - Old Quarter pilot datasets (d3e1e15)', () => {
  const oqViPath = join(__dirname, '../../data/localized/old-quarter.vi.json');
  const oqEnPath = join(__dirname, '../../data/localized/old-quarter.en.json');
  const oqVi = JSON.parse(readFileSync(oqViPath, 'utf8'));
  const oqEn = JSON.parse(readFileSync(oqEnPath, 'utf8'));

  assert.equal(isDatasetV2(oqVi), true);
  assert.equal(isDatasetV2(oqEn), true);

  const parsedVi = parseDatasetV2(oqVi, { expectedLocale: 'vi' });
  const parsedEn = parseDatasetV2(oqEn, { expectedLocale: 'en' });
  assert.ok(parsedVi);
  assert.ok(parsedEn);
  assert.equal(parsedVi.nodes.length, 3);
  assert.equal(parsedEn.nodes.length, 3);
  assert.equal(parsedVi.qa.length, 9);
  assert.equal(parsedEn.qa.length, 9);

  const pairResult = validateDatasetV2Pair(parsedVi, parsedEn);
  assert.deepEqual(pairResult, { ok: true });
});
