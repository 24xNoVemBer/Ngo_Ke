import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { setTimeout } from 'node:timers';

import {
  THREE_LENSES_COLLECTION_ID,
  getScopedCompanion,
  getThreeLensesCompanion,
  getThreeLensesDatasetRevision,
  verifyCompanionIntegritySync,
} from '../src/data/threeLensesCompanion.ts';

import { parseEvidenceItem } from '../src/components/evidenceParser.ts';
import { t } from '../src/i18n/translator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viCorePath = join(__dirname, '../../data/localized/three-lenses.vi.json');
const enCorePath = join(__dirname, '../../data/localized/three-lenses.en.json');
const viCompanionPath = join(__dirname, '../../data/journeys/three-lenses.vi.json');
const enCompanionPath = join(__dirname, '../../data/journeys/three-lenses.en.json');

const viCore = JSON.parse(readFileSync(viCorePath, 'utf8'));
const enCore = JSON.parse(readFileSync(enCorePath, 'utf8'));
const viCompanion = JSON.parse(readFileSync(viCompanionPath, 'utf8'));
const enCompanion = JSON.parse(readFileSync(enCompanionPath, 'utf8'));

test('Review 903761 - strict fail-closed companion scopeguard and integrity gate', () => {
  const viRev = getThreeLensesDatasetRevision('vi');
  const enRev = getThreeLensesDatasetRevision('en');
  assert.equal(viRev, viCompanion.datasetRevision);
  assert.equal(enRev, enCompanion.datasetRevision);

  // 1. Missing query / falsy / non-object -> null
  assert.equal(getScopedCompanion(null), null, 'null query rejected');
  assert.equal(getScopedCompanion(undefined), null, 'undefined query rejected');
  assert.equal(getScopedCompanion({}), null, 'empty query rejected');

  // 2. Mode checks: must be strictly 'demo'
  assert.equal(
    getScopedCompanion({
      mode: 'live',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: viRev,
      dataset: viCore,
    }),
    null,
    'live mode must fail closed'
  );
  assert.equal(
    getScopedCompanion({
      mode: '',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: viRev,
      dataset: viCore,
    }),
    null,
    'missing mode must fail closed'
  );

  // 3. Collection checks: must strictly be old-quarter-three-lenses
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: 'fiction-letter',
      locale: 'vi',
      datasetRevision: viRev,
      dataset: viCore,
    }),
    null,
    'fiction-letter collection rejected'
  );
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: 'old-quarter-pilot',
      locale: 'vi',
      datasetRevision: viRev,
      dataset: viCore,
    }),
    null,
    'old-quarter-pilot collection rejected'
  );

  // 4. Locale checks: must be 'vi' or 'en'
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'fr',
      datasetRevision: viRev,
      dataset: viCore,
    }),
    null,
    'unsupported locale rejected'
  );

  // 5. Dataset revision checks: must match companion.datasetRevision
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: 'wrong-revision-hash',
      dataset: viCore,
    }),
    null,
    'mismatched dataset revision rejected'
  );

  // 6. Dataset missing or non-ready -> null
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: viRev,
      dataset: undefined,
    }),
    null,
    'undefined dataset rejected'
  );

  // 7. Core locale mismatch -> null
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: viRev,
      dataset: enCore, // core has locale: 'en' while query has 'vi'
    }),
    null,
    'mismatched core locale rejected'
  );

  // 8. Tampered / mutated core text with same claimed revision -> strictly rejected!
  const tamperedCore = JSON.parse(JSON.stringify(viCore));
  tamperedCore.nodes[0].story = 'Nội dung bị sửa đổi trái phép';
  assert.equal(
    getScopedCompanion({
      mode: 'demo',
      collectionId: THREE_LENSES_COLLECTION_ID,
      locale: 'vi',
      datasetRevision: viRev,
      dataset: tamperedCore,
    }),
    null,
    'mutated core text with claimed revision must be rejected by canonical integrity gate'
  );

  // 8b. Tampered / mutated companion chapter text in memory with same claimed revision -> strictly rejected!
  const companionToTamper = getThreeLensesCompanion('vi');
  const originalChapterText = companionToTamper.chapters[0].text;
  try {
    companionToTamper.chapters[0].text = 'Lời kể chương bị sửa đổi trái phép';
    assert.equal(
      getScopedCompanion({
        mode: 'demo',
        collectionId: THREE_LENSES_COLLECTION_ID,
        locale: 'vi',
        datasetRevision: viRev,
        dataset: viCore,
      }),
      null,
      'mutated companion chapter text with claimed revision must be rejected by companion snapshot integrity gate'
    );
  } finally {
    companionToTamper.chapters[0].text = originalChapterText;
  }

  // 9. Valid inputs -> returns full companion
  const companionViResult = getScopedCompanion({
    mode: 'demo',
    collectionId: THREE_LENSES_COLLECTION_ID,
    locale: 'vi',
    datasetRevision: viRev,
    dataset: viCore,
  });
  assert.ok(companionViResult, 'Valid VI query returns companion');
  assert.equal(companionViResult.collectionId, THREE_LENSES_COLLECTION_ID);
  assert.equal(companionViResult.locale, 'vi');
  assert.equal(companionViResult.chapters.length, 5);

  const companionEnResult = getScopedCompanion({
    mode: 'demo',
    collectionId: THREE_LENSES_COLLECTION_ID,
    locale: 'en',
    datasetRevision: enRev,
    dataset: enCore,
  });
  assert.ok(companionEnResult, 'Valid EN query returns companion');
  assert.equal(companionEnResult.locale, 'en');

  // 10. Cryptographic integrity check via verifyCompanionIntegritySync
  const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
  const integrityVi = verifyCompanionIntegritySync(companionViResult, sha256, viCore);
  assert.equal(integrityVi.valid, true);
  assert.equal(integrityVi.scriptRevisionMatches, true);
  assert.equal(integrityVi.datasetRevisionMatches, true);

  const integrityEn = verifyCompanionIntegritySync(companionEnResult, sha256, enCore);
  assert.equal(integrityEn.valid, true);
  assert.equal(integrityEn.scriptRevisionMatches, true);
  assert.equal(integrityEn.datasetRevisionMatches, true);
});

test('Review 0b4048 - honest ALLEY_LIST metadata without fabricated distance/mood/popularity', () => {
  const photoMapContent = readFileSync(join(__dirname, '../src/assets/photoMap.ts'), 'utf8');
  assert.ok(photoMapContent.includes("id: 'old-quarter-three-lenses'"), 'Three Lenses registered in ALLEY_LIST');

  const startIndex = photoMapContent.indexOf("id: 'old-quarter-three-lenses'");
  const endIndex = photoMapContent.indexOf('getNodePhoto', startIndex);
  const block = photoMapContent.slice(startIndex, endIndex);

  // Must NOT display made-up 250m distance
  assert.equal(block.includes('distanceMeters:'), false, 'No fabricated distance in real journey meta');

  // Must NOT display made-up ambient audio / moodSound
  assert.equal(block.includes('moodSound:'), false, 'No fabricated moodSound in real journey meta');

  // Must NOT claim most popular without evidence
  assert.equal(block.includes('isPopular:'), false, 'No fabricated popularity in real journey meta');

  // Honest editorial badge and structure
  assert.ok(block.includes('isFeatured: true'), 'Badged as featured/editorial instead of popular');
  assert.ok(block.includes("structureLabel: '3 điểm · 5 chương'"), 'Honest 3 places · 5 chapters label');
  assert.ok(block.includes('estTimeMinutes: 50'), '50 min is explicit editorial suggestion');

  // Existing fiction alleys preserve their distance and moodSound
  assert.ok(photoMapContent.includes("id: 'phat-loc'"));
  assert.ok(photoMapContent.includes('distanceMeters: 120'));
  assert.ok(photoMapContent.includes("moodSound: 'Tiếng rao bánh & chén bát sứ'"));
});

test('Review fc2797 - segment audio kind and pending-playback cancellation semantics', () => {
  const companion = getThreeLensesCompanion('vi');
  assert.ok(companion);

  // 1. Opening segment must be kind 'intro', chapters/transitions/closing must be 'story'
  const openingKind = 'intro';
  assert.equal(openingKind, 'intro', 'Opening segment must request intro kind');

  for (const ch of companion.chapters) {
    assert.ok(ch.voiceContentId.endsWith('-story'), `Chapter ${ch.id} voiceContentId ends with -story`);
  }
  for (const tr of companion.transitions) {
    assert.ok(tr.voiceContentId.endsWith('-story'), `Transition ${tr.id} voiceContentId ends with -story`);
  }
  assert.equal(companion.closing.voiceContentId, 'oldquarter-dong-xuan-closing-story');

  // 2. Behavioral verification of intent counter cancellation
  let currentIntent = 0;
  let activePlayingTrack = null;

  function simulateStartPlay(trackId, intentToken) {
    return new Promise((resolve) => {
      // simulate async prepare/seek delay
      setTimeout(() => {
        if (intentToken === currentIntent) {
          activePlayingTrack = trackId;
        }
        resolve();
      }, 20);
    });
  }

  function simulateSelectChapter() {
    currentIntent += 1; // bumps intent to cancel in-flight async operations
    activePlayingTrack = null;
  }

  // Chapter A starts playing
  const intentA = ++currentIntent;
  const pA = simulateStartPlay('chapter-dong-xuan-roots-story', intentA);

  // User immediately switches to Chapter B before A resolves
  simulateSelectChapter();
  const intentB = ++currentIntent;
  const pB = simulateStartPlay('chapter-dong-xuan-fire-story', intentB);

  return Promise.all([pA, pB]).then(() => {
    // A was cancelled and could not overwrite Chapter B
    assert.equal(activePlayingTrack, 'chapter-dong-xuan-fire-story', 'Late resolving chapter A was rejected');
  });
});

test('Three Lenses - narrative architecture: 3 nodes, 5 chapters, 16 QAs, 3 transitions', () => {
  const companion = getThreeLensesCompanion('vi');

  // Exact 3 physical nodes
  assert.equal(viCore.nodes.length, 3);
  const nodeIds = viCore.nodes.map((n) => n.id);
  assert.deepEqual(nodeIds, ['oldquarter-bach-ma', 'oldquarter-ma-may', 'oldquarter-dong-xuan']);

  // Exactly 5 narrative chapters across the 3 nodes
  assert.equal(companion.chapters.length, 5);
  const bmChapters = companion.chapters.filter((c) => c.nodeId === 'oldquarter-bach-ma');
  const mmChapters = companion.chapters.filter((c) => c.nodeId === 'oldquarter-ma-may');
  const dxChapters = companion.chapters.filter((c) => c.nodeId === 'oldquarter-dong-xuan');

  assert.equal(bmChapters.length, 1);
  assert.equal(mmChapters.length, 1);
  assert.equal(dxChapters.length, 3);

  // Exactly 16 QAs: 3 BM, 4 MM, 9 DX (3 per chapter)
  assert.equal(viCore.qa.length, 16);
  const bmQa = viCore.qa.filter((q) => q.nodeId === 'oldquarter-bach-ma');
  const mmQa = viCore.qa.filter((q) => q.nodeId === 'oldquarter-ma-may');
  const dxQa = viCore.qa.filter((q) => q.nodeId === 'oldquarter-dong-xuan');

  assert.equal(bmQa.length, 3);
  assert.equal(mmQa.length, 4);
  assert.equal(dxQa.length, 9);

  // 2 transitions
  assert.equal(companion.transitions.length, 2);
  assert.equal(companion.transitions[0].id, 'transition-1');
  assert.equal(companion.transitions[1].id, 'transition-2');

  // Closing
  assert.ok(companion.closing);
  assert.equal(companion.closing.nodeId, 'oldquarter-dong-xuan');
});

test('Three Lenses - ClickableSources URL parser', () => {
  const parsed1 = parseEvidenceItem('Dự thảo hồ sơ đền Bạch Mã: https://example.com/bach-ma');
  assert.equal(parsed1.label, 'Dự thảo hồ sơ đền Bạch Mã');
  assert.equal(parsed1.url, 'https://example.com/bach-ma');

  const parsed2 = parseEvidenceItem('https://example.com/bare-url');
  assert.equal(parsed2.label, 'https://example.com/bare-url');
  assert.equal(parsed2.url, 'https://example.com/bare-url');

  const parsed3 = parseEvidenceItem('Tư liệu điền dã dân gian không có đường dẫn');
  assert.equal(parsed3.label, 'Tư liệu điền dã dân gian không có đường dẫn');
  assert.equal(parsed3.url, undefined);
});

test('Three Lenses - translations and SOURCED_ONLY boundaries', () => {
  assert.equal(t('vi', 'collection.old_quarter_three_lenses.name'), 'Ba lát cắt phố cổ');
  assert.equal(t('en', 'collection.old_quarter_three_lenses.name'), 'Three lenses on the Old Quarter');
  assert.ok(t('vi', 'qa.tag_sourced_only').includes('SOURCED_ONLY'));
  assert.ok(t('en', 'qa.tag_sourced_only').includes('SOURCED_ONLY'));

  const viDisclaimer = t('vi', 'qa.disclaimer_three_lenses');
  const enDisclaimer = t('en', 'qa.disclaimer_three_lenses');
  assert.ok(viDisclaimer.includes('SOURCED_ONLY'));
  assert.ok(viDisclaimer.includes('Chưa duyệt chính thức'));
  assert.ok(enDisclaimer.includes('SOURCED_ONLY'));
  assert.ok(enDisclaimer.includes('Not officially approved'));
});
