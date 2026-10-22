import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const hash = (text) => createHash('sha256').update(text).digest('hex');
const priorRequire = globalThis.require;
globalThis.require = (path) => path;
const { pendingAlleyIntroSlots, alleysVoiceCatalogues, ALLEY_INTRO_VOICE } = await import('../src/voice/alleysCatalog.ts');
if (priorRequire === undefined) delete globalThis.require;
else globalThis.require = priorRequire;

test('four VI reservations stay empty and four EN intros match their source, manifest, and audio', () => {
  assert.equal(pendingAlleyIntroSlots.length, 4);
  assert.equal(ALLEY_INTRO_VOICE.voiceId, '6adFm46eyy74snVn6YrT');
  assert.equal(ALLEY_INTRO_VOICE.modelId, 'eleven_v3');
  assert.equal(ALLEY_INTRO_VOICE.locale, 'vi');
  const manifest = JSON.parse(readFileSync(new URL('../assets/voice/alleys-intro/manifest.en.json', import.meta.url), 'utf8'));
  assert.equal(manifest.locale, 'en');
  assert.equal(manifest.voiceId, 'OZ0L6eISlOejga3XjDFt');
  assert.equal(manifest.model, 'eleven_v4');
  assert.equal(manifest.languageCode, 'en');
  assert.equal(manifest.outputFormat, 'mp3_44100_128');
  assert.equal(manifest.entries.length, 4);
  assert.equal(manifest.humanApproved, false);
  assert.equal(manifest.listened, false);
  assert.equal(manifest.selectedForShipping, false);
  for (const slot of pendingAlleyIntroSlots) {
    const dataset = JSON.parse(readFileSync(new URL(`../../data/localized/${slot.collectionId}.vi.json`, import.meta.url), 'utf8'));
    const englishDataset = JSON.parse(readFileSync(new URL(`../../data/localized/${slot.collectionId}.en.json`, import.meta.url), 'utf8'));
    const entry = manifest.entries.find(({ collectionId }) => collectionId === slot.collectionId);
    const catalogue = alleysVoiceCatalogues[slot.collectionId];
    const englishAudio = `../../assets/voice/alleys-intro/en/${slot.collectionId}-intro.mp3`;
    assert.equal(slot.contentId, 'intro');
    assert.equal(slot.textHash, hash(dataset.intro.text));
    assert.equal(slot.datasetRevision, hash(canonicalDatasetJson(dataset)));
    assert.equal('source' in slot, false);
    assert.deepEqual(catalogue.vi.tracks, {});
    assert.equal(catalogue.vi.datasetRevision, slot.datasetRevision);
    assert.equal(catalogue.en.datasetRevision, hash(canonicalDatasetJson(englishDataset)));
    assert.equal(entry.datasetRevision, catalogue.en.datasetRevision);
    assert.equal(entry.textHash, hash(englishDataset.intro.text));
    assert.equal(entry.characters, englishDataset.intro.text.length);
    assert.equal(entry.path, `mobile/assets/voice/alleys-intro/en/${slot.collectionId}-intro.mp3`);
    assert.equal(entry.humanApproved, false);
    assert.equal(entry.listened, false);
    assert.equal(entry.selectedForShipping, false);
    assert.equal(entry.sampleRate, 44_100);
    assert.ok(entry.durationSeconds > 0);
    assert.equal(catalogue.en.tracks.intro.source, englishAudio);
    assert.equal(catalogue.en.tracks.intro.textHash, entry.textHash);
    assert.equal(catalogue.en.tracks.intro.durationSeconds, entry.durationSeconds);
    const audio = readFileSync(new URL(`../assets/voice/alleys-intro/en/${slot.collectionId}-intro.mp3`, import.meta.url));
    assert.equal(hash(audio), entry.audioSha256);
  }
});

test('EN intro resolves only for its collection and current revision while VI remains text-only', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 'existing-audio';
  let lookupVoiceTrack;
  try {
    ({ lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts'));
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }
  for (const slot of pendingAlleyIntroSlots) {
    const catalogue = alleysVoiceCatalogues[slot.collectionId];
    const viQuery = { ...slot, locale: 'vi' };
    const enQuery = { ...slot, locale: 'en', datasetRevision: catalogue.en.datasetRevision };
    assert.equal(lookupVoiceTrack(viQuery), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, datasetRevision: 'changed' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: 'other-story' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: '__proto__' }), undefined);
    assert.equal(lookupVoiceTrack({ ...viQuery, contentId: 'toString' }), undefined);
    assert.equal(lookupVoiceTrack(enQuery), catalogue.en.tracks.intro);
    assert.equal(lookupVoiceTrack({ ...enQuery, datasetRevision: 'changed' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, contentId: 'story' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, locale: 'vi' }), undefined);
    assert.equal(lookupVoiceTrack({ ...enQuery, collectionId: 'other' }), undefined);
  }
});
