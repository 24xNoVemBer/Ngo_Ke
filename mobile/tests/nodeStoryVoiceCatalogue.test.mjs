import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (name) => readFileSync(path.join(root, name));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifestPath = 'mobile/assets/voice/node-stories/manifest.json';
const priorRequire = globalThis.require;
globalThis.require = (assetPath) => assetPath;
const { lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts');
if (priorRequire === undefined) delete globalThis.require;
else globalThis.require = priorRequire;

test('handoff source hashes match all 34 current node stories', () => {
  const handoff = JSON.parse(read('docs/handoffs/2026-10-23-node-story-voice-handoff.json'));
  assert.equal(handoff.records.length, 34);
  const counts = { vi: 0, en: 0 };
  for (const record of handoff.records) {
    counts[record.locale] += 1;
    assert.equal(record.contentId, `${record.nodeId}-story`);
    const dataset = JSON.parse(read(`data/localized/${record.collectionId}.${record.locale}.json`));
    const node = dataset.nodes.find((item) => item.id === record.nodeId);
    assert.ok(node?.story);
    assert.equal(sha256(Buffer.from(node.story, 'utf8')), record.textHash);
    assert.equal(sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')), record.datasetRevision);
  }
  assert.deepEqual(counts, { vi: 17, en: 17 });
});

test('all 34 node-story tracks resolve and match the pinned source and audio manifest', {
  skip: existsSync(path.join(root, manifestPath)) ? false : 'Audio generation halted by required ElevenLabs reserve preflight',
}, () => {
  const handoff = JSON.parse(read('docs/handoffs/2026-10-23-node-story-voice-handoff.json'));
  const manifest = JSON.parse(read(manifestPath));
  assert.equal(manifest.scope, '17 node stories, Vietnamese and English');
  assert.equal(manifest.status, 'complete');
  assert.equal(manifest.outputFormat, 'mp3_44100_128');
  assert.equal(manifest.humanApproved, false);
  assert.equal(manifest.listened, false);
  assert.equal(manifest.entries.length, 34);
  assert.equal(manifest.apiRequests, 34);
  assert.equal(manifest.charactersPosted, manifest.charactersAccepted);

  const handoffRows = new Map(handoff.records.map((record) => [`${record.locale}:${record.contentId}`, record]));
  const counts = { vi: 0, en: 0 };
  for (const entry of manifest.entries) {
    const key = `${entry.locale}:${entry.contentId}`;
    const source = handoffRows.get(key);
    assert.ok(source, `unexpected catalogue entry ${key}`);
    handoffRows.delete(key);
    counts[entry.locale] += 1;
    assert.equal(entry.contentId, `${entry.nodeId}-story`);
    assert.equal(entry.datasetRevision, source.datasetRevision);
    assert.equal(entry.textHash, source.textHash);
    assert.equal(entry.sourceDataSha256, sha256(read(entry.source)));
    assert.equal(entry.requestStatus, 'complete');
    assert.equal(entry.humanApproved, false);
    assert.equal(entry.listened, false);

    const dataset = JSON.parse(read(`data/localized/${entry.collectionId}.${entry.locale}.json`));
    const node = dataset.nodes.find((item) => item.id === entry.nodeId);
    assert.ok(node?.story);
    assert.equal(sha256(Buffer.from(node.story, 'utf8')), entry.textHash);
    assert.equal(sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')), entry.datasetRevision);

    const audio = read(entry.path);
    assert.ok(audio.length > 128, `${key} audio is empty or truncated`);
    assert.equal(audio.length, entry.bytes);
    assert.equal(sha256(audio), entry.audioSha256);
    assert.equal(entry.codec, 'mp3');
    assert.equal(entry.sampleRateHz, 44100);
    assert.ok(entry.durationSeconds > 0);
    assert.equal(entry.decodedWithFfmpeg, true);

    const voice = entry.locale === 'vi'
      ? { id: '6adFm46eyy74snVn6YrT', model: 'eleven_v3', language: 'vi' }
      : { id: 'OZ0L6eISlOejga3XjDFt', model: 'eleven_v4', language: 'en' };
    assert.equal(entry.voiceId, voice.id);
    assert.equal(entry.model, voice.model);
    assert.equal(entry.languageCode, voice.language);

    const track = lookupVoiceTrack({
      collectionId: entry.collectionId,
      locale: entry.locale,
      contentId: entry.contentId,
      datasetRevision: entry.datasetRevision,
    });
    assert.equal(track?.id, entry.contentId);
    assert.equal(track?.kind, 'story');
    assert.equal(track?.nodeId, entry.nodeId);
    assert.equal(track?.textHash, entry.textHash);
    assert.equal(track?.durationSeconds, entry.durationSeconds);
    assert.equal(track?.source, path.posix.relative('mobile/src/voice', entry.path));
    assert.equal(lookupVoiceTrack({
      collectionId: entry.collectionId,
      locale: entry.locale,
      contentId: entry.contentId,
      datasetRevision: `${entry.datasetRevision.slice(0, -1)}0`,
    }), undefined);
  }
  assert.deepEqual(counts, { vi: 17, en: 17 });
  assert.equal(handoffRows.size, 0);
});
