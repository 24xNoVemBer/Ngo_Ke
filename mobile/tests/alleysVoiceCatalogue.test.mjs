import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const hash = (text) => createHash('sha256').update(text).digest('hex');
const migrationManifest = JSON.parse(readFileSync(
  new URL('../assets/voice/demo-migration-v1/manifest.json', import.meta.url), 'utf8'));
const priorRequire = globalThis.require;
globalThis.require = (path) => path;
const { pendingAlleyIntroSlots, alleysVoiceCatalogues, ALLEY_INTRO_VOICE } = await import('../src/voice/alleysCatalog.ts');
if (priorRequire === undefined) delete globalThis.require;
else globalThis.require = priorRequire;

test('four VI and four EN intros match their source, manifest, and audio', () => {
  assert.equal(pendingAlleyIntroSlots.length, 4);
  assert.equal(ALLEY_INTRO_VOICE.voiceId, '6adFm46eyy74snVn6YrT');
  assert.equal(ALLEY_INTRO_VOICE.modelId, 'eleven_v3');
  assert.equal(ALLEY_INTRO_VOICE.locale, 'vi');
  const manifests = {
    vi: JSON.parse(readFileSync(new URL('../assets/voice/alleys-intro/manifest.vi.json', import.meta.url), 'utf8')),
    en: JSON.parse(readFileSync(new URL('../assets/voice/alleys-intro/manifest.en.json', import.meta.url), 'utf8')),
  };
  for (const [locale, manifest] of Object.entries(manifests)) {
    assert.equal(manifest.locale, locale);
    assert.equal(manifest.outputFormat, 'mp3_44100_128');
    assert.equal(manifest.entries.length, 4);
    assert.equal(manifest.humanApproved, false);
    assert.equal(manifest.listened, false);
    assert.equal(manifest.selectedForShipping, false);
  }
  assert.equal(manifests.vi.voiceId, ALLEY_INTRO_VOICE.voiceId);
  assert.equal(manifests.vi.model, ALLEY_INTRO_VOICE.modelId);
  assert.equal(manifests.vi.languageCode, 'vi');
  assert.equal(manifests.vi.charactersPosted, 2432);
  assert.equal(manifests.vi.charactersAccepted, 2432);
  assert.equal(manifests.vi.apiRequests, 4);
  assert.equal(manifests.en.voiceId, 'OZ0L6eISlOejga3XjDFt');
  assert.equal(manifests.en.model, 'eleven_v4');
  assert.equal(manifests.en.languageCode, 'en');
  for (const slot of pendingAlleyIntroSlots) {
    const dataset = JSON.parse(readFileSync(new URL(`../../data/localized/${slot.collectionId}.vi.json`, import.meta.url), 'utf8'));
    const englishDataset = JSON.parse(readFileSync(new URL(`../../data/localized/${slot.collectionId}.en.json`, import.meta.url), 'utf8'));
    const entries = Object.fromEntries(Object.entries(manifests).map(([locale, manifest]) => [
      locale, manifest.entries.find(({ collectionId }) => collectionId === slot.collectionId),
    ]));
    const catalogue = alleysVoiceCatalogues[slot.collectionId];
    const vietnameseAudio = `../../assets/voice/alleys-intro/vi/${slot.collectionId}-intro.mp3`;
    const englishAudio = `../../assets/voice/alleys-intro/en/${slot.collectionId}-intro.mp3`;
    assert.equal(slot.contentId, 'intro');
    assert.equal(slot.textHash, hash(dataset.intro.text));
    assert.equal(slot.datasetRevision, hash(canonicalDatasetJson(dataset)));
    assert.equal('source' in slot, false);
    assert.equal(catalogue.vi.datasetRevision, slot.datasetRevision);
    assert.equal(catalogue.vi.tracks.intro.source, vietnameseAudio);
    assert.equal(catalogue.vi.tracks.intro.textHash, hash(dataset.intro.text));
    assert.equal(catalogue.vi.tracks.intro.durationSeconds, entries.vi.durationSeconds);
    assert.equal(entries.vi.datasetRevision, slot.datasetRevision);
    assert.equal(entries.vi.textHash, hash(dataset.intro.text));
    assert.equal(entries.vi.characters, dataset.intro.text.length);
    assert.equal(entries.vi.path, `mobile/assets/voice/alleys-intro/vi/${slot.collectionId}-intro.mp3`);
    assert.equal(entries.vi.humanApproved, false);
    assert.equal(entries.vi.listened, false);
    assert.equal(entries.vi.selectedForShipping, false);
    assert.equal(entries.vi.sampleRate, 44_100);
    assert.ok(entries.vi.durationSeconds > 0);
    assert.equal(catalogue.en.datasetRevision, hash(canonicalDatasetJson(englishDataset)));
    assert.equal(entries.en.datasetRevision, catalogue.en.datasetRevision);
    assert.equal(entries.en.textHash, hash(englishDataset.intro.text));
    assert.equal(entries.en.characters, englishDataset.intro.text.length);
    assert.equal(entries.en.path, `mobile/assets/voice/alleys-intro/en/${slot.collectionId}-intro.mp3`);
    assert.equal(entries.en.humanApproved, false);
    assert.equal(entries.en.listened, false);
    assert.equal(entries.en.selectedForShipping, false);
    assert.equal(entries.en.sampleRate, 44_100);
    assert.ok(entries.en.durationSeconds > 0);
    assert.equal(catalogue.en.tracks.intro.source, englishAudio);
    assert.equal(catalogue.en.tracks.intro.textHash, entries.en.textHash);
    assert.equal(catalogue.en.tracks.intro.durationSeconds, entries.en.durationSeconds);
    for (const locale of ['vi', 'en']) {
      const audio = readFileSync(new URL(`../assets/voice/alleys-intro/${locale}/${slot.collectionId}-intro.mp3`, import.meta.url));
      assert.equal(hash(audio), entries[locale].audioSha256);
    }
  }
});

test('VI and EN intros resolve only for their collection and current revision', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = (assetPath) => assetPath;
  let lookupVoiceTrack;
  try {
    ({ lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts'));
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }
  for (const slot of pendingAlleyIntroSlots) {
    const catalogue = alleysVoiceCatalogues[slot.collectionId];
    const migratedVi = migrationManifest.entries.find((entry) => entry.collectionId === slot.collectionId
      && entry.locale === 'vi' && entry.id === 'intro');
    const migratedEn = migrationManifest.entries.find((entry) => entry.collectionId === slot.collectionId
      && entry.locale === 'en' && entry.id === 'intro');
    const viQuery = { ...slot, locale: 'vi' };
    const enQuery = { ...slot, locale: 'en', datasetRevision: catalogue.en.datasetRevision };
    const viTrack = lookupVoiceTrack(viQuery);
    assert.equal(viTrack?.source,
      `../../assets/voice/demo-migration-v1/${slot.collectionId}/vi/intro.mp3`);
    assert.equal(viTrack?.textHash, migratedVi.textHash);
    assert.equal(viTrack?.durationSeconds, migratedVi.durationSeconds);
    assert.equal(lookupVoiceTrack({ ...viQuery, datasetRevision: 'changed' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: 'other-story' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: '__proto__' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: 'toString' }), undefined);
    const enTrack = lookupVoiceTrack(enQuery);
    assert.equal(enTrack?.source,
      `../../assets/voice/demo-migration-v1/${slot.collectionId}/en/intro.mp3`);
    assert.equal(enTrack?.textHash, migratedEn.textHash);
    assert.equal(enTrack?.durationSeconds, migratedEn.durationSeconds);
    assert.equal(lookupVoiceTrack({ ...enQuery, datasetRevision: 'changed' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, contentId: 'story' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, locale: 'vi' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, collectionId: 'other' }), undefined);
  }
});
