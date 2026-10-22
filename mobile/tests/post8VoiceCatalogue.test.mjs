import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';
import { parseDatasetV2, validateDatasetV2Pair } from '../src/data/sourceState.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (name) => readFileSync(path.join(root, name));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const noticeSha256 = (bytes) => sha256(Buffer.from(bytes.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8'));
const originalBytes = read('data/demo.json');
const fictionEnBytes = read('data/localized/fiction.en.json');
const viBytes = read('data/localized/old-quarter.vi.json');
const enBytes = read('data/localized/old-quarter.en.json');
const original = JSON.parse(originalBytes.toString('utf8'));
const fictionEn = JSON.parse(fictionEnBytes.toString('utf8'));
const vi = JSON.parse(viBytes.toString('utf8'));
const en = JSON.parse(enBytes.toString('utf8'));
const originalManifest = JSON.parse(read('mobile/assets/voice/manifest.json').toString('utf8'));
const manifest = JSON.parse(read('mobile/assets/voice/post8/old-quarter-pilot/manifest.json').toString('utf8'));
const remainingManifest = JSON.parse(read('mobile/assets/voice/post8/remaining/manifest.json').toString('utf8'));
const activeManifest = JSON.parse(read('mobile/assets/voice/post8/remaining-elevenlabs/manifest.json').toString('utf8'));
const catalogSource = read('mobile/src/voice/post8Catalog.ts').toString('utf8');
const originalCatalogSource = read('mobile/src/voice/catalog.ts').toString('utf8');
const remainingCatalogSource = read('mobile/src/voice/post8RemainingCatalog.ts').toString('utf8');
const threeLensesCatalogSource = read('mobile/src/voice/threeLensesCatalog.ts').toString('utf8');
const threeLensesManifest = JSON.parse(read('mobile/assets/voice/three-lenses-elevenlabs/manifest.json').toString('utf8'));
const threeLensesNhatPhongManifest = JSON.parse(read('mobile/assets/voice/three-lenses-nhat-phong/manifest.json').toString('utf8'));

const datasetTrackRows = (dataset) => [
  { id: 'intro', kind: 'intro', text: dataset.intro.text },
  ...dataset.nodes.flatMap((node) => [
    { id: `${node.id}-story`, kind: 'story', nodeId: node.id, text: node.story },
    { id: `${node.id}-caption`, kind: 'caption', nodeId: node.id, text: node.caption },
  ]),
  ...dataset.qa.map((item) => ({ id: `${item.id}-answer`, kind: 'answer', nodeId: item.nodeId, text: item.answer })),
];

const trackRows = (dataset) => {
  const node = dataset.nodes.find((item) => item.id === 'oldquarter-bach-ma');
  return [
    { id: 'intro', kind: 'intro', text: dataset.intro.text },
    { id: `${node.id}-story`, kind: 'story', nodeId: node.id, text: node.story },
    { id: `${node.id}-caption`, kind: 'caption', nodeId: node.id, text: node.caption },
    ...dataset.qa.filter((item) => item.nodeId === node.id).sort((a, b) => a.id.localeCompare(b.id))
      .map((item) => ({ id: `${item.id}-answer`, kind: 'answer', nodeId: node.id, text: item.answer })),
  ];
};

const sourceSpecs = {
  'fiction-letter/en': { dataset: fictionEn, bytes: fictionEnBytes, file: 'data/localized/fiction.en.json' },
  'fiction-letter/vi': { dataset: original, bytes: originalBytes, file: 'data/demo.json', rawRevision: true },
  'old-quarter-pilot/en': { dataset: en, bytes: enBytes, file: 'data/localized/old-quarter.en.json' },
  'old-quarter-pilot/vi': { dataset: vi, bytes: viBytes, file: 'data/localized/old-quarter.vi.json' },
};
const activeTrackByKey = new Map(activeManifest.tracks.map((entry) =>
  [`${entry.collectionId}/${entry.locale}/${entry.id}`, entry]));
const expectedActiveRevisions = Object.fromEntries(Object.entries(sourceSpecs).map(([key, source]) => {
  if (source.rawRevision) return [key, sha256(source.bytes)];
  const locale = key.split('/')[1];
  const parsed = parseDatasetV2(source.dataset, { mode: 'demo', expectedLocale: locale });
  assert.ok(parsed, `${key} active dataset parses`);
  return [key, sha256(Buffer.from(canonicalDatasetJson(parsed), 'utf8'))];
}));

const activeSourceFor = (entry) => {
  if (entry.collectionId === 'fiction-letter' && entry.locale === 'vi') return originalCatalogSource;
  if (entry.collectionId === 'old-quarter-pilot'
      && (entry.kind === 'intro' || entry.nodeId === 'oldquarter-bach-ma')) return catalogSource;
  return remainingCatalogSource;
};

function assertActiveMapping(entry, expectedTextSha256, archivedRequire) {
  const key = `${entry.collectionId}/${entry.locale}/${entry.id}`;
  const active = activeTrackByKey.get(key);
  assert.ok(active, `${key} active ElevenLabs manifest record`);
  assert.equal(active.source, sourceSpecs[`${entry.collectionId}/${entry.locale}`].file, `${key} active source file`);
  assert.equal(active.sourceDataSha256, sha256(sourceSpecs[`${entry.collectionId}/${entry.locale}`].bytes), `${key} source bytes`);
  assert.equal(active.datasetRevision, expectedActiveRevisions[`${entry.collectionId}/${entry.locale}`], `${key} dataset revision`);
  assert.equal(active.sourceTextSha256, expectedTextSha256, `${key} source text hash`);
  assert.equal(active.spokenTextSha256, expectedTextSha256, `${key} spoken text hash`);
  assert.equal(active.textHash, expectedTextSha256, `${key} active catalogue text hash`);
  const isNhatPhongMigration = entry.collectionId === 'fiction-letter' && entry.locale === 'vi';
  assert.equal(active.voiceId,
    isNhatPhongMigration ? activeManifest.nhatPhongMigration.voiceId : activeManifest.voiceIds[entry.locale],
    `${key} active voice`);
  assert.equal(active.model,
    isNhatPhongMigration ? activeManifest.nhatPhongMigration.model : activeManifest.model,
    `${key} active model`);
  assert.equal(active.locale, entry.locale);
  assert.equal(active.collectionId, entry.collectionId);
  assert.equal(active.durationSeconds, active.format.durationSeconds, `${key} decoded duration`);
  assert.equal(active.format.codec, 'mp3', `${key} active codec`);
  assert.equal(active.format.sampleRateHz, 44_100, `${key} active sample rate`);
  assert.equal(active.format.bitrateKbps, 128, `${key} active bitrate`);
  const expectedPath = `mobile/assets/voice/post8/remaining-elevenlabs/${entry.collectionId}/${entry.locale}/${entry.id}.mp3`;
  assert.equal(active.path, expectedPath, `${key} active asset path`);
  assert.equal(active.audioSha256, sha256(read(expectedPath)), `${key} active audio hash`);
  assert.equal(active.humanApproved, false);
  const activeRequire = `../../assets/voice/post8/remaining-elevenlabs/${entry.collectionId}/${entry.locale}/${entry.id}.mp3`;
  const activeLine = activeSourceFor(active).split('\n')
    .find((line) => line.includes(`"${entry.id}": {`) && line.includes(activeRequire));
  assert.ok(activeLine, `${key} active static catalogue entry`);
  assert.ok(activeLine.includes(`require("${activeRequire}")`) || activeLine.includes(`require('${activeRequire}')`),
    `${key} ElevenLabs Metro require`);
  assert.ok(activeLine.includes(`textHash: "${active.textHash}"`), `${key} active hash mapping`);
  assert.ok(activeLine.includes(`durationSeconds: ${active.durationSeconds}`), `${key} active duration mapping`);
  assert.ok(!activeLine.includes(archivedRequire), `${key} no archived active require`);
}

test('ElevenLabs notice hash uses canonical UTF-8 LF line endings', () => {
  const lf = Buffer.from('Terms\nAttribution\n', 'utf8');
  const crlf = Buffer.from('Terms\r\nAttribution\r\n', 'utf8');
  assert.equal(noticeSha256(lf), noticeSha256(crlf));
});

test('the provisional firstpoint pair uses the shared parser and exact locale revisions', () => {
  const parsedVi = parseDatasetV2(vi, { mode: 'demo', expectedLocale: 'vi' });
  const parsedEn = parseDatasetV2(en, { mode: 'demo', expectedLocale: 'en' });
  assert.ok(parsedVi && parsedEn);
  assert.deepEqual(validateDatasetV2Pair(parsedVi, parsedEn), { ok: true });
  assert.equal(manifest.status, 'provisional-native-firstpoint-candidate');
  assert.equal(manifest.humanApproved, false);
  assert.equal(manifest.selectedForShipping, false);
  for (const [locale, dataset] of [['en', parsedEn], ['vi', parsedVi]]) {
    const catalogue = manifest.catalogues[locale];
    assert.equal(catalogue.entries.length, 6);
    assert.equal(catalogue.datasetRevision, sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')));
    assert.ok(catalogue.entries.every((entry) => entry.locale === locale && entry.collectionId === manifest.collectionId));
  }
});

test('all twelve locale tracks match source text, manifest hashes and static Metro requires', () => {
  for (const [locale, dataset, sourceBytes] of [['en', en, enBytes], ['vi', vi, viBytes]]) {
    const expected = trackRows(dataset);
    const entries = manifest.catalogues[locale].entries;
    assert.deepEqual(entries.map(({ id }) => id), expected.map(({ id }) => id));
    for (const [index, row] of expected.entries()) {
      const entry = entries[index];
      const relative = `mobile/assets/voice/post8/${manifest.collectionId}/${locale}/${row.id}.mp3`;
      const bytes = read(relative);
      assert.equal(entry.source, `data/localized/old-quarter.${locale}.json`);
      assert.equal(entry.sourceDataSha256, sha256(sourceBytes));
      assert.equal(entry.sourceTextSha256, sha256(Buffer.from(row.text, 'utf8')));
      assert.equal(entry.textHash, entry.sourceTextSha256);
      assert.equal(entry.spokenTextSha256, sha256(Buffer.from(entry.spokenText, 'utf8')));
      assert.equal(entry.audioSha256, sha256(bytes));
      assert.equal(entry.path, relative);
      assert.equal(entry.format.codec, 'mp3');
      assert.equal(entry.format.channels, 1);
      assert.ok(entry.durationSeconds > 0 && bytes.length > 2048);
      if (locale === 'en' && row.kind === 'story') {
        assert.equal(entry.tts.speed, 0.8);
        assert.ok(entry.durationSeconds >= 60 && entry.durationSeconds <= 90);
      }
      assert.equal(entry.humanApproved, false);
      assertActiveMapping(entry, entry.sourceTextSha256,
        `../../assets/voice/post8/${manifest.collectionId}/${locale}/${row.id}.mp3`);
    }
  }
});

test('the 54 new tracks complete the 100-track inventory without changing the 34+12 baseline', () => {
  assert.equal(sha256(read('mobile/assets/voice/manifest.json')),
    '34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a');
  assert.equal(originalManifest.entries.length, 34);
  assert.equal(originalManifest.sourceDataSha256, sha256(originalBytes));
  assert.equal(remainingManifest.scope, 'post8-remaining');
  assert.equal(remainingManifest.humanApproved, false);
  assert.equal(remainingManifest.selectedForShipping, false);
  assert.equal(activeManifest.scope, 'fiction-letter+old-quarter-pilot');
  assert.equal(activeManifest.status, 'provisional');
  assert.equal(activeManifest.sourceStatus, 'source-only');
  assert.equal(activeManifest.humanApproved, false);
  assert.equal(activeManifest.selectedForShipping, false);
  assert.equal(activeManifest.model, 'eleven_v4');
  assert.deepEqual(activeManifest.nhatPhongMigration, {
    scope: 'fiction-letter/vi (34 reviewed-fiction demo tracks only)',
    voiceId: '6adFm46eyy74snVn6YrT',
    voiceName: 'Nhật Phong - Narrative & Compelling',
    model: 'eleven_v3',
    languageCode: 'vi',
    outputFormat: 'mp3_44100_128',
    sourceDataSha256: sha256(originalBytes),
    humanListeningApproved: false,
    rollback: activeManifest.nhatPhongMigration.rollback,
  });
  assert.deepEqual(activeManifest.licenseProvenance, {
    provider: 'ElevenLabs',
    service: 'Text-to-Speech API',
    model: 'eleven_v4',
    termsUrl: 'https://elevenlabs.io/terms-of-use',
    termsLastUpdated: '2026-10-09',
    regionApplicability: 'not independently verified',
    observedAccountTier: 'starter',
    redistributionLicenseAsserted: false,
    rightsClearance: 'not independently verified',
    noticePath: 'mobile/assets/voice/post8/remaining-elevenlabs/LICENSES.md',
    noticeSha256: 'bdc1f2dcf9050d37b9bdf0cf967320b7dab8a41ad48bf9b8520783741849cf7b',
  });
  assert.equal(noticeSha256(read(activeManifest.licenseProvenance.noticePath)), activeManifest.licenseProvenance.noticeSha256);
  assert.deepEqual(activeManifest.counts, {
    en: 50,
    vi: 50,
    total: 100,
    collections: {
      'fiction-letter': { en: 34, vi: 34 },
      'old-quarter-pilot': { en: 16, vi: 16 },
    },
  });
  assert.equal(activeTrackByKey.size, 100);

  const originalRows = new Map(datasetTrackRows(original).map((row) => [row.id, row]));
  assert.equal(originalRows.size, 34);
  for (const entry of originalManifest.entries) {
    const row = originalRows.get(entry.id);
    assert.ok(row, `unknown original VI track: ${entry.id}`);
    assert.equal(entry.textSha256, sha256(Buffer.from(row.text, 'utf8')));
    assert.equal(entry.audioSha256, sha256(read(entry.path)));
    assertActiveMapping({ collectionId: 'fiction-letter', locale: 'vi', ...entry }, entry.textSha256,
      `../../assets/voice/${entry.id}.mp3`);
  }

  let added = 0;
  for (const [collectionId, locales] of Object.entries(remainingManifest.catalogues)) {
    for (const [locale, catalogue] of Object.entries(locales)) {
      const source = sourceSpecs[`${collectionId}/${locale}`];
      assert.ok(source, `unexpected catalogue: ${collectionId}/${locale}`);
      const expectedRows = datasetTrackRows(source.dataset).filter((row) =>
        collectionId !== 'old-quarter-pilot' || (row.id !== 'intro' && row.nodeId !== 'oldquarter-bach-ma'));
      const expectedById = new Map(expectedRows.map((row) => [row.id, row]));
      assert.equal(catalogue.entries.length, expectedRows.length);
      for (const entry of catalogue.entries) {
        const row = expectedById.get(entry.id);
        assert.ok(row, `unexpected remaining track: ${locale}/${entry.id}`);
        expectedById.delete(entry.id);
        const relative = `mobile/assets/voice/post8/remaining/${collectionId}/${locale}/${entry.id}.mp3`;
        const sourceHash = sha256(source.bytes);
        const textHash = sha256(Buffer.from(row.text, 'utf8'));
        assert.equal(entry.locale, locale);
        assert.equal(entry.collectionId, collectionId);
        assert.equal(entry.kind, row.kind);
        assert.equal(entry.nodeId, row.nodeId);
        assert.equal(entry.source, source.file);
        assert.equal(entry.sourceDataSha256, sourceHash);
        assert.equal(entry.sourceTextSha256, textHash);
        assert.equal(entry.textHash, textHash);
        assert.equal(entry.spokenTextSha256, sha256(Buffer.from(entry.spokenText, 'utf8')));
        if (locale === 'vi') assert.equal(entry.spokenText, row.text);
        assert.equal(entry.path, relative);
        assert.equal(entry.audioSha256, sha256(read(relative)));
        assert.equal(entry.format.codec, 'mp3');
        assert.equal(entry.format.channels, 1);
        assert.ok(entry.durationSeconds > 0 && entry.format.bitrateKbps >= 90);
        assert.equal(entry.clippedSamples, 0);
        assert.ok(Number.isFinite(entry.peakDbfs) && Number.isFinite(entry.rmsDbfs));
        assert.ok(Number.isFinite(entry.leadingSilenceMsAtMinus50dB));
        assert.ok(Number.isFinite(entry.trailingSilenceMsAtMinus50dB));
        assert.equal(entry.humanApproved, false);
        if (row.kind === 'story' && collectionId === 'old-quarter-pilot') {
          assert.equal(entry.tts.speed, locale === 'en' ? 0.75 : 1.0);
          assert.equal(entry.tts.speedMethod, locale === 'vi' ? 'none' : undefined);
        }
        assertActiveMapping({ collectionId, locale, ...entry }, textHash,
          `../../assets/voice/post8/remaining/${collectionId}/${locale}/${entry.id}.mp3`);
        added += 1;
      }
      assert.equal(expectedById.size, 0);
    }
  }
  assert.equal(added, 54);
  assert.equal(originalManifest.entries.length + manifest.catalogues.en.entries.length
    + manifest.catalogues.vi.entries.length + added, 100);
});

test('production lookup resolves all 100 active tracks and the 28+28 Three Lenses split', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = (assetPath) => assetPath;
  let lookupVoiceTrack;
  let voiceCatalogueRevision;
  let THREE_LENSES_VOICE_COLLECTION;
  let threeLensesVoiceCatalogues;
  try {
    ({ lookupVoiceTrack, voiceCatalogueRevision } = await import('../src/voice/localizedCatalog.ts'));
    ({ THREE_LENSES_VOICE_COLLECTION, threeLensesVoiceCatalogues } = await import('../src/voice/threeLensesCatalog.ts'));
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }

  for (const entry of activeManifest.tracks) {
    const query = { collectionId: entry.collectionId, locale: entry.locale,
      contentId: entry.id, datasetRevision: entry.datasetRevision };
    const track = lookupVoiceTrack(query);
    assert.equal(track?.textHash, entry.textHash, `${entry.collectionId}/${entry.locale}/${entry.id} text`);
    assert.equal(track?.durationSeconds, entry.durationSeconds, `${entry.collectionId}/${entry.locale}/${entry.id} duration`);
    assert.equal(track?.source,
      `../../assets/voice/post8/remaining-elevenlabs/${entry.collectionId}/${entry.locale}/${entry.id}.mp3`,
      `${entry.collectionId}/${entry.locale}/${entry.id} Metro asset`);
    assert.equal(lookupVoiceTrack({ ...query, contentId: 'unknown' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, datasetRevision: 'stale' }), undefined);
  }

  const originalIntro = originalManifest.entries[0];
  const legacyVi = { collectionId: 'fiction-letter', locale: 'vi', contentId: originalIntro.id,
    datasetRevision: voiceCatalogueRevision };
  assert.equal(lookupVoiceTrack(legacyVi)?.source,
    `../../assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/${originalIntro.id}.mp3`);
  assert.equal(lookupVoiceTrack({ ...legacyVi, locale: 'en' }), undefined);
  assert.equal(lookupVoiceTrack({ ...legacyVi, collectionId: 'other' }), undefined);

  assert.equal(threeLensesManifest.counts.en, 28);
  assert.equal(threeLensesManifest.counts.vi, 28);
  assert.equal(threeLensesManifest.counts.total, 56);
  assert.equal(threeLensesNhatPhongManifest.entries.length, 28);
  assert.equal(threeLensesNhatPhongManifest.scope, 'old-quarter-three-lenses/vi preview');
  assert.equal(threeLensesNhatPhongManifest.sourceOnly, true);
  assert.equal(threeLensesNhatPhongManifest.humanApproved, false);
  assert.equal(threeLensesNhatPhongManifest.selectedForShipping, false);
  assert.deepEqual(threeLensesNhatPhongManifest.voice, {
    id: '6adFm46eyy74snVn6YrT',
    name: 'Nhật Phong - Narrative & Compelling',
  });
  assert.equal(threeLensesNhatPhongManifest.model, 'eleven_v3');
  assert.equal(threeLensesNhatPhongManifest.outputFormat, 'mp3_44100_128');

  let threeLensesTracks = 0;
  for (const locale of ['en', 'vi']) {
    const catalogue = threeLensesVoiceCatalogues[locale];
    const isNhatPhong = locale === 'vi';
    const manifestEntries = isNhatPhong
      ? threeLensesNhatPhongManifest.entries
      : threeLensesManifest.catalogues.en.tracks;
    const manifestById = new Map(manifestEntries.map((entry) => [entry.id, entry]));
    const assetDirectory = isNhatPhong ? 'three-lenses-nhat-phong' : 'three-lenses-elevenlabs';
    const expectedVoiceId = isNhatPhong ? '6adFm46eyy74snVn6YrT' : 'OZ0L6eISlOejga3XjDFt';
    const expectedModel = isNhatPhong ? 'eleven_v3' : 'eleven_v4';

    assert.equal(Object.keys(catalogue.tracks).length, 28, `${locale} Three Lenses catalogue size`);
    assert.equal(manifestById.size, 28, `${locale} Three Lenses manifest size`);
    assert.deepEqual([...manifestById.keys()].sort(), Object.keys(catalogue.tracks).sort(),
      `${locale} content IDs match manifest and static catalogue`);

    for (const entry of Object.values(catalogue.tracks)) {
      const manifestEntry = manifestById.get(entry.id);
      assert.ok(manifestEntry, `${locale}/${entry.id} manifest record`);
      const assetPath = `mobile/assets/voice/${assetDirectory}/${locale}/${entry.id}.mp3`;
      const metroAsset = `../../assets/voice/${assetDirectory}/${locale}/${entry.id}.mp3`;
      const track = lookupVoiceTrack({ collectionId: THREE_LENSES_VOICE_COLLECTION, locale,
        contentId: entry.id, datasetRevision: catalogue.datasetRevision });
      assert.equal(manifestEntry.collectionId, THREE_LENSES_VOICE_COLLECTION, `${locale}/${entry.id} collection`);
      assert.equal(manifestEntry.locale, locale, `${locale}/${entry.id} locale`);
      assert.equal(manifestEntry.kind, entry.kind, `${locale}/${entry.id} kind`);
      assert.equal(manifestEntry.nodeId ?? null, entry.nodeId ?? null, `${locale}/${entry.id} node`);
      assert.equal(manifestEntry.sourceDataSha256, sha256(read(manifestEntry.source)),
        `${locale}/${entry.id} source hash`);
      assert.equal(manifestEntry.textHash, entry.textHash, `${locale}/${entry.id} source text hash`);
      assert.equal(manifestEntry.audioSha256, sha256(read(assetPath)), `${locale}/${entry.id} audio hash`);
      assert.equal(manifestEntry.durationSeconds, entry.durationSeconds, `${locale}/${entry.id} duration`);
      assert.equal(manifestEntry.voiceId, expectedVoiceId, `${locale}/${entry.id} voice`);
      assert.equal(manifestEntry.model, expectedModel, `${locale}/${entry.id} model`);
      assert.equal(manifestEntry.humanApproved, false, `${locale}/${entry.id} approval gate`);
      assert.equal(track?.textHash, entry.textHash, `${locale}/${entry.id} runtime text hash`);
      assert.equal(track?.durationSeconds, entry.durationSeconds, `${locale}/${entry.id} runtime duration`);
      assert.equal(track?.source, metroAsset, `${locale}/${entry.id} runtime Metro asset`);
      const staticLine = threeLensesCatalogSource.split('\n').find((line) =>
        line.includes(`"${entry.id}": {`) && line.includes(`source: require("${metroAsset}")`));
      assert.ok(staticLine, `${locale}/${entry.id} static Metro require`);
      threeLensesTracks += 1;
    }
  }
  assert.equal(threeLensesTracks, 56);
  const staticRequires = [originalCatalogSource, catalogSource, remainingCatalogSource, threeLensesCatalogSource]
    .map((source) => (source.match(/source: require\(/g) ?? []).length);
  assert.deepEqual(staticRequires, [34, 12, 54, 56]);
  assert.equal(staticRequires.reduce((sum, count) => sum + count, 0), 156);
});
