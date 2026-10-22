import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { pendingAlleyIntroSlots, alleysVoiceCatalogues, ALLEY_INTRO_VOICE } from '../src/voice/alleysCatalog.ts';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const hash = (text) => createHash('sha256').update(text).digest('hex');

test('four VI intro reservations match the actual narration and dataset, with no playable assets', () => {
  assert.equal(pendingAlleyIntroSlots.length, 4);
  assert.equal(ALLEY_INTRO_VOICE.voiceId, '6adFm46eyy74snVn6YrT');
  assert.equal(ALLEY_INTRO_VOICE.modelId, 'eleven_v3');
  assert.equal(ALLEY_INTRO_VOICE.locale, 'vi');
  for (const slot of pendingAlleyIntroSlots) {
    const dataset = JSON.parse(readFileSync(new URL(`../../data/localized/${slot.collectionId}.vi.json`, import.meta.url), 'utf8'));
    assert.equal(slot.contentId, 'intro');
    assert.equal(slot.textHash, hash(dataset.intro.text));
    assert.equal(slot.datasetRevision, hash(canonicalDatasetJson(dataset)));
    assert.equal('source' in slot, false);
    assert.deepEqual(alleysVoiceCatalogues[slot.collectionId].vi.tracks, {});
    assert.equal(alleysVoiceCatalogues[slot.collectionId].en, undefined);
  }
});

test('pending narration cannot resolve audio, including changed revision and content ID', async () => {
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
    const query = { ...slot, locale: 'vi' };
    assert.equal(lookupVoiceTrack(query), undefined);
    assert.equal(lookupVoiceTrack({ ...query, datasetRevision: 'changed' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, contentId: 'other-story' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, contentId: '__proto__' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, contentId: 'toString' }), undefined);
    assert.equal(lookupVoiceTrack({ ...query, locale: 'en' }), undefined);
  }
});
