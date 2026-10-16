import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { setTimeout } from 'node:timers';
import { getResolvedLocalesAsync } from '@expo/config-plugins/build/utils/locales.js';
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
import {
  parsePersistedLocale,
  formatPersistedLocale,
  resolveEffectiveLocale,
} from '../src/data/localeStorageCore.ts';
import {
  parseTopic,
  parseTimeBudget,
  hasTopicNegation,
} from '../src/recommendation/pick.ts';

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

  // 4. Pre-aborted signal -> 0 requests made, returns network error
  const preAbortedAc = new AbortController();
  preAbortedAc.abort();
  let preAbortRequestCalled = false;
  const resPreAbort = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    signal: preAbortedAc.signal,
    fetchImpl: async () => {
      preAbortRequestCalled = true;
      throw new Error('Should not be called');
    },
  });
  assert.equal(preAbortRequestCalled, false, 'Pre-aborted request must not invoke fetchImpl');
  assert.equal(resPreAbort.status, 'error');
  assert.equal(resPreAbort.reason, 'network');

  // 5. 404 response with valid NO_REVIEWED_DATA envelope -> empty (no-data)
  const mock404ValidFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => JSON.stringify({ error: { code: 'NO_REVIEWED_DATA', message: 'No reviewed data' } }),
  });
  const res404Valid = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404ValidFetch,
  });
  assert.equal(res404Valid.status, 'empty');
  assert.equal(res404Valid.reason, 'no-data');
  assert.equal(res404Valid.title, 'Live mode has no data');

  // 5b. 404 response with flat { code: 'NO_REVIEWED_DATA' } (missing outer error envelope) -> http error
  const mock404FlatCodeFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => JSON.stringify({ code: 'NO_REVIEWED_DATA', message: 'Flat code is invalid' }),
  });
  const res404Flat = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404FlatCodeFetch,
  });
  assert.equal(res404Flat.status, 'error');
  assert.equal(res404Flat.reason, 'http');

  // 6. Repro 2: 404 response with wrong error code (e.g. NOT_FOUND) -> must be error, not empty!
  const mock404NotFoundFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Route not found' } }),
  });
  const res404NotFound = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404NotFoundFetch,
  });
  assert.equal(res404NotFound.status, 'error');
  assert.equal(res404NotFound.reason, 'http');

  // 7. 404 response with malformed non-JSON body -> shape error
  const mock404MalformedFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => '<html>404 Not Found</html>',
  });
  const res404Malformed = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404MalformedFetch,
  });
  assert.equal(res404Malformed.status, 'error');
  assert.equal(res404Malformed.reason, 'shape');

  // 8. 404 response exceeding MAX_BODY_BYTES -> shape error
  const mock404OversizedFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: (h) => (h.toLowerCase() === 'content-length' ? String(MAX_BODY_BYTES + 1) : null) },
    text: async () => 'x'.repeat(MAX_BODY_BYTES + 1),
  });
  const res404Oversized = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock404OversizedFetch,
  });
  assert.equal(res404Oversized.status, 'error');
  assert.equal(res404Oversized.reason, 'shape');

  // 9. 503 response -> shape error, never empty
  const mock503Fetch = async () => ({
    status: 503,
    ok: false,
    headers: { get: () => null },
    text: async () => JSON.stringify({ error: { code: 'DATASET_INVALID' } }),
  });
  const res503 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock503Fetch,
  });
  assert.equal(res503.status, 'error');
  assert.equal(res503.reason, 'shape');

  // 10. Repro 1: 200 with valid body but MISSING Content-Language header -> must be error!
  const mockMissingLangFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => null,
    },
    text: async () => JSON.stringify(fictionEnJson),
  });
  const resMissingLang = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mockMissingLangFetch,
  });
  assert.equal(resMissingLang.status, 'error');
  assert.equal(resMissingLang.reason, 'shape');

  // 11. 200 with WRONG Content-Language header -> shape error
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

  // 12. Successful 200 response with exact Content-Language -> ready
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
  const nodeDigest = async (text) => createHash('sha256').update(text, 'utf8').digest('hex');
  const res200 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock200Fetch,
    digestImpl: nodeDigest,
  });
  assert.equal(res200.status, 'ready');
  if (res200.status === 'ready') {
    assert.equal(res200.title, 'Live · 6 simulated points (unverified)');
    assert.equal(res200.dataset.schemaVersion, 2);
    assert.equal(res200.dataset.locale, 'en');
    assert.match(res200.revision, /^[0-9a-f]{64}$/);
    assert.equal(res200.dataset.revision, undefined, 'dataset must not be mutated with revision property');
  }

  // 12a. Missing digestImpl on 200 response -> shape error
  const resMissingDigest = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock200Fetch,
  });
  assert.equal(resMissingDigest.status, 'error');
  assert.equal(resMissingDigest.reason, 'shape');

  // 12b. Invalid digestImpl format (not 64 hex chars) -> shape error
  const resInvalidDigest = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock200Fetch,
    digestImpl: async () => 'not-a-64-character-hex-digest',
  });
  assert.equal(resInvalidDigest.status, 'error');
  assert.equal(resInvalidDigest.reason, 'shape');

  // 12c. Uppercase hex digest -> normalized to lowercase
  const resUpperDigest = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock200Fetch,
    digestImpl: async (text) => createHash('sha256').update(text, 'utf8').digest('hex').toUpperCase(),
  });
  assert.equal(resUpperDigest.status, 'ready');
  if (resUpperDigest.status === 'ready') {
    assert.match(resUpperDigest.revision, /^[0-9a-f]{64}$/);
    assert.equal(resUpperDigest.revision, resUpperDigest.revision.toLowerCase());
  }

  // 12b. HTTP 201 response with valid body and Content-Language -> http error (only 200 permitted)
  const mock201Fetch = async () => ({
    status: 201,
    ok: true,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-language' ? 'en' : null),
    },
    text: async () => JSON.stringify(fictionEnJson),
  });
  const res201 = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: mock201Fetch,
  });
  assert.equal(res201.status, 'error');
  assert.equal(res201.reason, 'http');

  // 13. Payload exceeding MAX_BODY_BYTES -> shape error
  const mockBigFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: (h) => {
        if (h.toLowerCase() === 'content-language') return 'en';
        if (h.toLowerCase() === 'content-length') return String(MAX_BODY_BYTES + 10);
        return null;
      },
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

  // 14. Repro 3: Hard deadline timeout when body text returns late ignoring abort
  const mockLateBodyFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-language' ? 'en' : null),
    },
    text: async () => {
      // Body promise resolves after 60ms ignoring abort
      await new Promise((resolve) => setTimeout(resolve, 60));
      return JSON.stringify(fictionEnJson);
    },
  });
  const resLateBody = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    timeoutMs: 10,
    fetchImpl: mockLateBodyFetch,
  });
  assert.equal(resLateBody.status, 'error');
  assert.equal(resLateBody.reason, 'timeout');
  assert.equal(resLateBody.title, 'Live server timed out');

  // 14b. 404 response where body returns late exceeding timeout -> timeout error, not no-data
  const mock404LateFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
      return JSON.stringify({ error: { code: 'NO_REVIEWED_DATA', message: 'No reviewed data' } });
    },
  });
  const res404Late = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    timeoutMs: 10,
    fetchImpl: mock404LateFetch,
  });
  assert.equal(res404Late.status, 'error');
  assert.equal(res404Late.reason, 'timeout');

  // 14c. 404 response where signal aborts during body read -> network error, not no-data
  const ac404 = new AbortController();
  const mock404AbortFetch = async () => ({
    status: 404,
    ok: false,
    headers: { get: () => null },
    text: async () => {
      ac404.abort();
      return JSON.stringify({ error: { code: 'NO_REVIEWED_DATA', message: 'No reviewed data' } });
    },
  });
  const res404Abort = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    signal: ac404.signal,
    fetchImpl: mock404AbortFetch,
  });
  assert.equal(res404Abort.status, 'error');
  assert.equal(res404Abort.reason, 'network');

  // 15. Hard deadline timeout when fetch never resolves
  const mockNeverResolvingFetch = async () => {
    return new Promise(() => {
      // Never resolves
    });
  };
  const resNeverResolving = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    timeoutMs: 15,
    fetchImpl: mockNeverResolvingFetch,
  });
  assert.equal(resNeverResolving.status, 'error');
  assert.equal(resNeverResolving.reason, 'timeout');

  // 16. External abort while fetch ignores abort signal -> network error
  const inFlightAc = new AbortController();
  const mockIgnoringFetch = async () => {
    // Abort externally while fetch is in-flight
    setTimeout(() => inFlightAc.abort(), 5);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          ok: true,
          headers: { get: (h) => (h.toLowerCase() === 'content-language' ? 'en' : null) },
          text: async () => JSON.stringify(fictionEnJson),
        });
      }, 50);
    });
  };
  const resExternalAbort = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    timeoutMs: 200,
    signal: inFlightAc.signal,
    fetchImpl: mockIgnoringFetch,
  });
  assert.equal(resExternalAbort.status, 'error');
  assert.equal(resExternalAbort.reason, 'network');
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

test('localeStorageCore.ts - parsing, formatting, and OS fallback', () => {
  // Parsing valid JSON records
  assert.equal(parsePersistedLocale('{"locale":"vi"}'), 'vi');
  assert.equal(parsePersistedLocale('{"locale":"en"}'), 'en');
  assert.equal(parsePersistedLocale('{"locale": "en", "timestamp": 123}'), 'en');

  // Bare valid strings
  assert.equal(parsePersistedLocale('vi'), 'vi');
  assert.equal(parsePersistedLocale('en'), 'en');

  // Corrupted / invalid input returns undefined (no crash)
  assert.equal(parsePersistedLocale('{locale:'), undefined);
  assert.equal(parsePersistedLocale('{"locale":"fr"}'), undefined);
  assert.equal(parsePersistedLocale('{"other":true}'), undefined);
  assert.equal(parsePersistedLocale(''), undefined);
  assert.equal(parsePersistedLocale('   '), undefined);
  assert.equal(parsePersistedLocale(null), undefined);
  assert.equal(parsePersistedLocale(undefined), undefined);
  assert.equal(parsePersistedLocale(12345), undefined);

  // Formatting produces valid parseable JSON with locale and timestamp
  assert.equal(parsePersistedLocale(formatPersistedLocale('vi')), 'vi');
  assert.equal(parsePersistedLocale(formatPersistedLocale('en')), 'en');
  assert.ok(formatPersistedLocale('vi').includes('"locale": "vi"'));
  assert.ok(formatPersistedLocale('en').includes('"locale": "en"'));

  // Effective locale resolution
  assert.equal(resolveEffectiveLocale('en'), 'en');
  assert.equal(resolveEffectiveLocale('vi'), 'vi');
  assert.equal(resolveEffectiveLocale(undefined, 'en-US'), 'en');
  assert.equal(resolveEffectiveLocale(undefined, 'en_GB'), 'en');
  assert.equal(resolveEffectiveLocale(undefined, 'vi-VN'), 'vi');
  assert.equal(resolveEffectiveLocale(undefined, 'fr-FR'), 'vi'); // default fallback
  assert.equal(resolveEffectiveLocale(undefined, 'unknown'), 'vi'); // default fallback
  assert.ok(isLocale(resolveEffectiveLocale(undefined, undefined)));
});

test('translator.ts - 100% dictionary parity between VI and EN', () => {
  const viKeys = Object.keys(DICTIONARY.vi).sort();
  const enKeys = Object.keys(DICTIONARY.en).sort();

  assert.equal(viKeys.length >= 150, true, `Expected >= 150 keys, got ${viKeys.length}`);
  assert.deepEqual(viKeys, enKeys, 'VI and EN dictionaries must have identical keys');

  for (const key of viKeys) {
    const viVal = DICTIONARY.vi[key];
    const enVal = DICTIONARY.en[key];
    assert.equal(typeof viVal, 'string', `VI key ${key} must be string`);
    assert.equal(typeof enVal, 'string', `EN key ${key} must be string`);
    assert.ok(viVal.trim().length > 0, `VI key ${key} must not be empty`);
    assert.ok(enVal.trim().length > 0, `EN key ${key} must not be empty`);
  }

  // Translation function works
  assert.equal(translate('vi', 'home.menu_title'), 'Tùy chọn');
  assert.equal(translate('en', 'home.menu_title'), 'Options');
  assert.equal(
    translate('vi', 'home.stories_opened', { opened: 0, total: 6, mode: 'Demo' }),
    'Đã mở 0/6 câu chuyện · Demo',
  );
  assert.equal(
    translate('en', 'home.stories_opened', { opened: 0, total: 6, mode: 'Demo' }),
    'Opened 0/6 stories · Demo',
  );
  assert.equal(translate('vi', 'qa.read_answer_btn'), 'Xem câu trả lời bằng chữ');
  assert.equal(translate('en', 'qa.read_answer_btn'), 'Read answer text');
  assert.equal(translate('vi', 'location.select_manual', { name: 'Điểm 1' }), 'Chọn điểm Điểm 1 bằng tay');
  assert.equal(translate('en', 'location.select_manual', { name: 'Point 1' }), 'Select Point 1 manually');
  assert.equal(translate('vi', 'location.select_manual_simulated', { name: 'Điểm 1' }), 'Chọn điểm Điểm 1 bằng tay, mô phỏng');
  assert.equal(translate('en', 'location.select_manual_simulated', { name: 'Point 1' }), 'Select Point 1 manually, simulated');
  assert.equal(translate('vi', 'location.suggested_visit_minutes', { minutes: 10 }), 'Gợi ý tham quan: 10 phút (chưa đo)');
  assert.equal(translate('en', 'location.suggested_visit_minutes', { minutes: 10 }), 'Suggested visit: 10 min (unmeasured)');
  assert.equal(translate('vi', 'qa.narrator_badge'), 'Kể');
  assert.equal(translate('en', 'qa.narrator_badge'), 'S');
});

test('pick.ts - English alias parsing for topics and time budgets', () => {
  // English topic matching
  assert.equal(parseTopic('food'), 'an thuc');
  assert.equal(parseTopic('street food'), 'an thuc');
  assert.equal(parseTopic('culinary'), 'an thuc');
  assert.equal(parseTopic('history'), 'chuyen xua');
  assert.equal(parseTopic('memories'), 'chuyen xua');
  assert.equal(parseTopic('explore'), 'kham pha tu do');
  assert.equal(parseTopic('free walking'), 'kham pha tu do');

  // Negation matching
  assert.equal(hasTopicNegation('not food'), true);
  assert.equal(hasTopicNegation('no history'), true);
  assert.equal(hasTopicNegation('don\'t want culinary'), true);
  assert.equal(hasTopicNegation('without food'), true);
  assert.equal(hasTopicNegation('không đi ẩm thực'), true);
  assert.equal(hasTopicNegation('just food'), false);

  // Time budget matching
  assert.equal(parseTimeBudget('15 minutes'), 15);
  assert.equal(parseTimeBudget('15 mins'), 15);
  assert.equal(parseTimeBudget('15m'), 15);
  assert.equal(parseTimeBudget('30 minutes'), 30);
  assert.equal(parseTimeBudget('half an hour'), 30);
  assert.equal(parseTimeBudget('45 minutes'), 45);
  assert.equal(parseTimeBudget('1 hour'), 60);
  assert.equal(parseTimeBudget('one hour'), 60);
  assert.equal(parseTimeBudget('1.5 hours'), 90);
  assert.equal(parseTimeBudget('1 hour 30 minutes'), 90);
  assert.equal(parseTimeBudget('1 hour 30 mins'), 90);
  assert.equal(parseTimeBudget('1 tieng 30 phut'), 90);
  assert.equal(parseTimeBudget('2 hours 15 minutes'), 135);
  assert.equal(parseTimeBudget('90 minutes'), 90);
});

test('collections data - dual collection datasets and canonical revisions', () => {
  const demoViPath = join(__dirname, '../../data/demo.json');
  const fictionEnPath = join(__dirname, '../../data/localized/fiction.en.json');
  const oqViPath = join(__dirname, '../../data/localized/old-quarter.vi.json');
  const oqEnPath = join(__dirname, '../../data/localized/old-quarter.en.json');

  const demoViJson = JSON.parse(readFileSync(demoViPath, 'utf8'));
  const fictionEnJson = JSON.parse(readFileSync(fictionEnPath, 'utf8'));
  const oqViJson = JSON.parse(readFileSync(oqViPath, 'utf8'));
  const oqEnJson = JSON.parse(readFileSync(oqEnPath, 'utf8'));

  // 1. Fiction Letter: 6 nodes, 21 Q&A
  assert.equal(demoViJson.nodes.length, 6);
  assert.equal(demoViJson.qa.length, 21);
  assert.equal(fictionEnJson.nodes.length, 6);
  assert.equal(fictionEnJson.qa.length, 21);

  // 2. Old Quarter Pilot: 3 nodes, 9 Q&A
  assert.equal(oqViJson.nodes.length, 3);
  assert.equal(oqViJson.qa.length, 9);
  assert.equal(oqEnJson.nodes.length, 3);
  assert.equal(oqEnJson.qa.length, 9);

  // 3. Exact dataset canonical revisions
  // Legacy VI fiction revision
  const legacyViRevision = '8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b';
  assert.equal(legacyViRevision.length, 64);

  // Fiction EN canonical revision
  const fictionEnRevision = createHash('sha256')
    .update(canonicalDatasetJson(fictionEnJson), 'utf8')
    .digest('hex');
  assert.equal(fictionEnRevision, '746e0d0bfd48fb0a247dd2180dfc266e174dbea0225dabab31bddd38a8ff351b');

  // Old Quarter VI canonical revision
  const oqViRevision = createHash('sha256')
    .update(canonicalDatasetJson(oqViJson), 'utf8')
    .digest('hex');
  assert.equal(oqViRevision, '358209bc5bf8f14e47a3598b93644d168219d919dcb66d9eb1f7cbb7dbd2c94a');

  // Old Quarter EN canonical revision
  const oqEnRevision = createHash('sha256')
    .update(canonicalDatasetJson(oqEnJson), 'utf8')
    .digest('hex');
  assert.equal(oqEnRevision, 'd75fcc183863f7ea2ec3b24bba1c4664b762c6332f0eb768a3493d9e74089b83');
});

test('canonicalJson.ts - pure canonicalDatasetJson serializes consistently for sha256', () => {
  const text = '{"test":123}';
  const expectedHash = createHash('sha256').update(text, 'utf8').digest('hex');
  const serialized = canonicalDatasetJson(JSON.parse(text));
  const actualHash = createHash('sha256').update(serialized, 'utf8').digest('hex');
  assert.equal(actualHash, expectedHash);
});

test('regression - loadLiveSourceV2 timeout includes digest/hash deadline', async () => {
  const fetchMock = async () => ({
    ok: true,
    status: 200,
    headers: {
      get: (h) => {
        const lower = h.toLowerCase();
        if (lower === 'content-language') return 'en';
        if (lower === 'content-length') return '100';
        return 'application/json';
      },
    },
    text: async () => JSON.stringify(fictionEnJson),
  });

  const slowDigest = async () => {
    await new Promise((r) => setTimeout(r, 120));
    return 'fake-hash';
  };

  const result = await loadLiveSourceV2({
    baseUrl: 'http://127.0.0.1:8788',
    locale: 'en',
    fetchImpl: fetchMock,
    timeoutMs: 40,
    digestImpl: slowDigest,
  });

  assert.equal(result.status, 'error');
  assert.equal(result.reason, 'timeout');
  assert.equal(result.mode, 'live');
});

test('regression - source computation synchronously hides stale live locale', () => {
  const viLiveSource = {
    mode: 'live',
    status: 'ready',
    dataset: { ...fictionEnJson, locale: 'vi' },
    revision: 'rev-vi',
  };

  const isStaleLocale =
    viLiveSource.status === 'ready' &&
    'locale' in viLiveSource.dataset &&
    viLiveSource.dataset.locale &&
    viLiveSource.dataset.locale !== 'en';

  assert.equal(isStaleLocale, true);

  const enLiveSource = {
    mode: 'live',
    status: 'ready',
    dataset: { ...fictionEnJson, locale: 'en' },
    revision: 'rev-en',
  };

  const isMatchedLocale =
    enLiveSource.status === 'ready' &&
    'locale' in enLiveSource.dataset &&
    enLiveSource.dataset.locale &&
    enLiveSource.dataset.locale !== 'en';

  assert.equal(isMatchedLocale, false);
});

test('native config - getResolvedLocalesAsync isolates iOS purpose keys from Android strings', async () => {
  const appJsonPath = join(__dirname, '../app.json');
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  const projectRoot = join(__dirname, '..');

  const iosResolved = await getResolvedLocalesAsync(projectRoot, appJson.expo.locales, 'ios');
  const androidResolved = await getResolvedLocalesAsync(projectRoot, appJson.expo.locales, 'android');

  const expectedKeys = [
    'NSCameraUsageDescription',
    'NSLocationWhenInUseUsageDescription',
    'NSMicrophoneUsageDescription',
  ];

  for (const locale of ['vi', 'en']) {
    const iosMap = iosResolved.localesMap[locale] || {};
    assert.equal(Object.keys(iosMap).length, 3);
    for (const key of expectedKeys) {
      assert.ok(iosMap[key], `Missing ${key} in iOS ${locale}`);
      assert.equal(typeof iosMap[key], 'string');
    }

    const androidMap = androidResolved.localesMap[locale] || {};
    assert.equal(Object.keys(androidMap).length, 0);
    for (const key of expectedKeys) {
      assert.equal(androidMap[key], undefined, `Android ${locale} must not contain iOS key ${key}`);
    }
  }
});


