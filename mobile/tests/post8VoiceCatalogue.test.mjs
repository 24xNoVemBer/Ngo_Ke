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
const catalogSource = read('mobile/src/voice/post8Catalog.ts').toString('utf8');
const originalCatalogSource = read('mobile/src/voice/catalog.ts').toString('utf8');
const remainingCatalogSource = read('mobile/src/voice/post8RemainingCatalog.ts').toString('utf8');

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
      assert.ok(catalogSource.includes(`require("../../assets/voice/post8/${manifest.collectionId}/${locale}/${row.id}.mp3")`));
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

  const originalRows = new Map(datasetTrackRows(original).map((row) => [row.id, row]));
  assert.equal(originalRows.size, 34);
  for (const entry of originalManifest.entries) {
    const row = originalRows.get(entry.id);
    assert.ok(row, `unknown original VI track: ${entry.id}`);
    assert.equal(entry.textSha256, sha256(Buffer.from(row.text, 'utf8')));
    assert.equal(entry.audioSha256, sha256(read(entry.path)));
    assert.ok(originalCatalogSource.includes(`require('../../assets/voice/${entry.id}.mp3')`));
  }

  const sources = {
    'fiction-letter/en': { dataset: fictionEn, bytes: fictionEnBytes, file: 'data/localized/fiction.en.json' },
    'old-quarter-pilot/en': { dataset: en, bytes: enBytes, file: 'data/localized/old-quarter.en.json' },
    'old-quarter-pilot/vi': { dataset: vi, bytes: viBytes, file: 'data/localized/old-quarter.vi.json' },
  };
  let added = 0;
  for (const [collectionId, locales] of Object.entries(remainingManifest.catalogues)) {
    for (const [locale, catalogue] of Object.entries(locales)) {
      const source = sources[`${collectionId}/${locale}`];
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
        assert.ok(remainingCatalogSource.includes(`require("../../assets/voice/post8/remaining/${collectionId}/${locale}/${entry.id}.mp3")`));
        added += 1;
      }
      assert.equal(expectedById.size, 0);
    }
  }
  assert.equal(added, 54);
  assert.equal(originalManifest.entries.length + manifest.catalogues.en.entries.length
    + manifest.catalogues.vi.entries.length + added, 100);
});

test('catalogue lookup is exact by collection, locale and dataset revision with no cross-locale fallback', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 42;
  const { lookupVoiceTrack, voiceCatalogueRevision } = await import('../src/voice/localizedCatalog.ts');
  if (previousRequire === undefined) delete globalThis.require;
  else globalThis.require = previousRequire;

  for (const locale of ['en', 'vi']) {
    const revision = manifest.catalogues[locale].datasetRevision;
    const entry = manifest.catalogues[locale].entries[0];
    const query = { collectionId: manifest.collectionId, locale, contentId: entry.id, datasetRevision: revision };
    const track = lookupVoiceTrack(query);
    assert.equal(track?.textHash, manifest.catalogues[locale].entries[0].textHash);
    assert.equal(track?.source, 42);
    assert.equal(lookupVoiceTrack({ ...query, contentId: 'unknown' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, datasetRevision: 'stale' }), undefined);
  }
  const originalIntro = originalManifest.entries[0];
  const legacyVi = { collectionId: 'fiction-letter', locale: 'vi', contentId: originalIntro.id,
    datasetRevision: voiceCatalogueRevision };
  assert.equal(lookupVoiceTrack(legacyVi)?.source, 42);
  assert.equal(lookupVoiceTrack({ ...legacyVi, locale: 'en' }), undefined);
  assert.equal(lookupVoiceTrack({ ...legacyVi, collectionId: 'other' }), undefined);

  for (const [collectionId, locales] of Object.entries(remainingManifest.catalogues)) {
    for (const [locale, catalogue] of Object.entries(locales)) {
      for (const entry of catalogue.entries) {
        const track = lookupVoiceTrack({ collectionId, locale, contentId: entry.id,
          datasetRevision: catalogue.datasetRevision });
        assert.equal(track?.source, 42, `unresolved bundle track: ${collectionId}/${locale}/${entry.id}`);
      }
    }
  }
});
