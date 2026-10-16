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
const viBytes = read('data/localized/old-quarter.vi.json');
const enBytes = read('data/localized/old-quarter.en.json');
const vi = JSON.parse(viBytes.toString('utf8'));
const en = JSON.parse(enBytes.toString('utf8'));
const manifest = JSON.parse(read('mobile/assets/voice/post8/old-quarter-pilot/manifest.json').toString('utf8'));
const catalogSource = read('mobile/src/voice/post8Catalog.ts').toString('utf8');

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

test('catalogue lookup is exact by collection, locale and dataset revision with no cross-locale fallback', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 42;
  const { lookupVoiceTrack, voiceCatalogueRevision } = await import('../src/voice/localizedCatalog.ts');
  if (previousRequire === undefined) delete globalThis.require;
  else globalThis.require = previousRequire;

  for (const locale of ['en', 'vi']) {
    const revision = manifest.catalogues[locale].datasetRevision;
    const track = lookupVoiceTrack({ collectionId: manifest.collectionId, locale, contentId: 'intro', datasetRevision: revision });
    assert.equal(track?.textHash, manifest.catalogues[locale].entries[0].textHash);
    assert.equal(track?.source, 42);
    assert.equal(lookupVoiceTrack({ collectionId: manifest.collectionId, locale, contentId: 'unknown', datasetRevision: revision }), undefined);
    assert.equal(lookupVoiceTrack({ collectionId: manifest.collectionId, locale, contentId: 'intro', datasetRevision: 'stale' }), undefined);
  }
  assert.equal(lookupVoiceTrack({ collectionId: manifest.collectionId, locale: 'en', contentId: 'intro', datasetRevision: manifest.catalogues.vi.datasetRevision }), undefined);
  assert.equal(lookupVoiceTrack({ collectionId: 'other', locale: 'en', contentId: 'intro', datasetRevision: manifest.catalogues.en.datasetRevision }), undefined);
  assert.equal(lookupVoiceTrack({ contentId: 'intro', datasetRevision: voiceCatalogueRevision })?.source, 42);
});
