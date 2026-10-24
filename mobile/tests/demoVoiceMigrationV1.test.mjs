import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => readFileSync(path.join(root, file));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(read('mobile/assets/voice/demo-migration-v1/manifest.json').toString('utf8'));

const previousRequire = globalThis.require;
globalThis.require = (assetPath) => assetPath;
let lookupVoiceTrack;
try {
  ({ lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts'));
} finally {
  if (previousRequire === undefined) delete globalThis.require;
  else globalThis.require = previousRequire;
}

test('migration manifest keeps exact VI/EN voice and billing approval gates', () => {
  assert.equal(manifest.scope, 'demo-voice-migration-v1');
  assert.equal(manifest.status, 'source-only-billing-delta-mismatch');
  assert.equal(manifest.billingReconciled, false);
  assert.equal(manifest.billingDeltaMismatchCredits, 161);
  assert.deepEqual(manifest.counts, { vi: 99, en: 99, total: 198 });
  assert.equal(manifest.model, 'eleven_v3');
  assert.deepEqual(manifest.voiceIds, {
    vi: '6adFm46eyy74snVn6YrT',
    en: 'OZ0L6eISlOejga3XjDFt',
  });
  assert.equal(manifest.humanApproved, false);
  assert.equal(manifest.listened, false);
  assert.equal(manifest.selectedForShipping, false);
});

test('all 198 migrated MP3s hash-match their decoded generation records and resolve in app catalogue', () => {
  assert.equal(manifest.entries.length, 198);
  const counts = { vi: 0, en: 0 };
  const identities = new Set();

  for (const entry of manifest.entries) {
    const key = `${entry.collectionId}/${entry.locale}/${entry.id}`;
    assert.equal(identities.has(key), false, `duplicate ${key}`);
    identities.add(key);
    counts[entry.locale] += 1;

    const expectedVoiceId = entry.locale === 'vi' ? manifest.voiceIds.vi : manifest.voiceIds.en;
    assert.equal(entry.voiceId, expectedVoiceId, `${key} voice ID`);
    assert.equal(entry.model, manifest.model, `${key} model`);
    assert.equal(entry.outputFormat, 'mp3_44100_128', `${key} output format`);
    assert.equal(entry.codec, 'mp3', `${key} codec`);
    assert.equal(entry.sampleRateHz, 44_100, `${key} sample rate`);
    assert.equal(entry.bitrateKbps, 128, `${key} bitrate`);
    if (entry.frameScanValidated) {
      assert.equal(entry.fullDecode, false, `${key} must not claim generation-time full decode`);
      assert.equal(entry.sampleRate, 44_100, `${key} frame scan sample rate`);
      assert.equal(entry.bitrateKbps, 128, `${key} frame scan bitrate`);
    } else {
      assert.equal(entry.fullDecode, true, `${key} generation-time full decode`);
    }
    assert.equal(entry.sourceOnly, true, `${key} remains unapproved source`);
    assert.equal(entry.humanApproved, false, `${key} approval gate`);
    assert.equal(entry.listened, false, `${key} listening gate`);

    const audio = read(entry.path);
    assert.ok(audio.length > 128, `${key} MP3 is empty/truncated`);
    assert.equal(audio.length, entry.bytes, `${key} file size`);
    assert.equal(sha256(audio), entry.audioSha256, `${key} audio SHA-256`);

    const track = lookupVoiceTrack({
      collectionId: entry.collectionId,
      locale: entry.locale,
      contentId: entry.id,
      datasetRevision: entry.datasetRevision,
    });
    assert.equal(track?.id, entry.id, `${key} resolved ID`);
    assert.equal(track?.kind, entry.kind, `${key} resolved kind`);
    assert.equal(track?.nodeId ?? null, entry.nodeId ?? null, `${key} resolved node`);
    assert.equal(track?.textHash, entry.textHash, `${key} spoken text hash`);
    assert.equal(track?.durationSeconds, entry.durationSeconds, `${key} duration`);
    const relativeAsset = entry.path.replace(/^mobile\/assets\/voice\//, '');
    assert.equal(track?.source, `../../assets/voice/${relativeAsset}`, `${key} Metro asset`);
    assert.equal(lookupVoiceTrack({
      collectionId: entry.collectionId,
      locale: entry.locale,
      contentId: entry.id,
      datasetRevision: 'stale-revision',
    }), undefined, `${key} rejects stale revision`);
  }

  assert.deepEqual(counts, { vi: 99, en: 99 });
  assert.equal(identities.size, 198);
});

test('Ngõ Gạch V2 delta keeps all ten prior active story MP3s available for rollback', () => {
  const delta = manifest.entries.filter((entry) => entry.collectionId === 'ngo-gach' && entry.kind === 'story');
  assert.equal(delta.length, 10);
  for (const entry of delta) {
    assert.equal(entry.frameScanValidated, true, `${entry.key} frame validation recorded`);
    assert.equal(entry.fullDecode, false, `${entry.key} does not overstate full decode`);
    assert.ok(entry.previousActiveAudioPath, `${entry.key} prior active path retained`);
    const priorAudio = read(entry.previousActiveAudioPath);
    assert.equal(sha256(priorAudio), entry.previousActiveAudioSha256, `${entry.key} rollback audio SHA-256`);
    assert.notEqual(entry.path, entry.previousActiveAudioPath, `${entry.key} new V2 path is separate`);
  }
});
