import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { TextDecoder } from 'node:util';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { canonicalDatasetJson } from '../src/data/canonicalJson.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (name) => readFileSync(path.join(root, name));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const normalizeSourceEol = (bytes) => {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const normalized = text.replace(/\r\n/g, '\n');
  assert.doesNotMatch(normalized, /\r/, 'source must not contain bare carriage returns');
  return Buffer.from(normalized, 'utf8');
};
const manifestPath = 'mobile/assets/voice/node-stories/manifest.json';
const priorRequire = globalThis.require;
globalThis.require = (assetPath) => assetPath;
const { lookupVoiceTrack } = await import('../src/voice/localizedCatalog.ts');
if (priorRequire === undefined) delete globalThis.require;
else globalThis.require = priorRequire;

test('handoff hashes remain valid and changed Ngõ Gạch stories match the approved V2 migration', () => {
  const handoff = JSON.parse(read('docs/handoffs/2026-10-23-node-story-voice-handoff.json'));
  const migrated = JSON.parse(read('mobile/assets/voice/demo-migration-v1/manifest.json'));
  const migratedRows = new Map(migrated.entries.map((entry) => [`${entry.collectionId}/${entry.locale}/${entry.id}`, entry]));
  assert.equal(handoff.records.length, 34);
  const counts = { vi: 0, en: 0 };
  for (const record of handoff.records) {
    counts[record.locale] += 1;
    assert.equal(record.contentId, `${record.nodeId}-story`);
    const dataset = JSON.parse(read(`data/localized/${record.collectionId}.${record.locale}.json`));
    const node = dataset.nodes.find((item) => item.id === record.nodeId);
    assert.ok(node?.story);
    if (record.collectionId === 'ngo-gach') {
      const active = migratedRows.get(`ngo-gach/${record.locale}/${record.contentId}`);
      assert.ok(active, `${record.locale}:${record.contentId} has an active V2 replacement`);
      assert.equal(sha256(Buffer.from(node.story, 'utf8')), active.textHash);
      assert.equal(sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')), active.datasetRevision);
      assert.notEqual(active.textHash, record.textHash, `${record.contentId} retains its prior handoff text as history`);
      const baselineSource = execFileSync('git', ['show', `HEAD:data/localized/ngo-gach.${record.locale}.json`], { cwd: root });
      assert.equal(record.textHash, sha256(Buffer.from(JSON.parse(baselineSource.toString('utf8')).nodes.find((item) => item.id === record.nodeId).story, 'utf8')));
      assert.equal(record.datasetRevision, sha256(Buffer.from(canonicalDatasetJson(JSON.parse(baselineSource.toString('utf8'))), 'utf8')));
    } else {
      assert.equal(sha256(Buffer.from(node.story, 'utf8')), record.textHash);
      assert.equal(sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')), record.datasetRevision);
    }
  }
  assert.deepEqual(counts, { vi: 17, en: 17 });
});

test('source hash contract normalizes checkout EOLs and detects content edits', () => {
  const lf = Buffer.from('ngõ kể\nsecond line\n', 'utf8');
  const crlf = Buffer.from('ngõ kể\r\nsecond line\r\n', 'utf8');
  assert.notEqual(sha256(lf), sha256(crlf), 'raw source hashes retain byte-level EOL differences');
  assert.equal(sha256(normalizeSourceEol(lf)), sha256(normalizeSourceEol(crlf)));
  assert.notEqual(sha256(normalizeSourceEol(lf)), sha256(normalizeSourceEol(Buffer.from('ngõ kể!\nsecond line\n', 'utf8'))));
});

test('all 34 node-story tracks resolve and match the pinned source and audio manifest', {
  skip: existsSync(path.join(root, manifestPath)) ? false : 'Audio generation halted by required ElevenLabs reserve preflight',
}, () => {
  const handoff = JSON.parse(read('docs/handoffs/2026-10-23-node-story-voice-handoff.json'));
  const manifest = JSON.parse(read(manifestPath));
  const migratedManifest = JSON.parse(read('mobile/assets/voice/demo-migration-v1/manifest.json'));
  const migratedRows = new Map(migratedManifest.entries.map((entry) => [`${entry.locale}:${entry.id}`, entry]));
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
    const rawSource = read(entry.source);
    if (entry.collectionId === 'ngo-gach') {
      const baselineSource = execFileSync('git', ['show', `HEAD:${entry.source}`], { cwd: root });
      assert.equal(entry.sourceDataSha256, sha256(normalizeSourceEol(baselineSource)));
    } else {
      assert.equal(entry.sourceDataSha256, sha256(normalizeSourceEol(rawSource)));
    }
    assert.equal(entry.requestStatus, 'complete');
    assert.equal(entry.humanApproved, false);
    assert.equal(entry.listened, false);

    const dataset = JSON.parse(read(`data/localized/${entry.collectionId}.${entry.locale}.json`));
    const node = dataset.nodes.find((item) => item.id === entry.nodeId);
    assert.ok(node?.story);
    const migrated = migratedRows.get(`${entry.locale}:${entry.contentId}`);
    assert.ok(migrated, `missing migrated track ${entry.collectionId}/${entry.locale}/${entry.contentId}`);
    assert.equal(sha256(Buffer.from(node.story, 'utf8')), migrated.textHash);
    assert.equal(sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8')), migrated.datasetRevision);
    if (entry.collectionId === 'ngo-gach') {
      assert.equal(migrated.previousActiveAudioPath,
        `mobile/assets/voice/demo-migration-v1/ngo-gach/${entry.locale}/${entry.contentId}.mp3`,
        `${key} prior active V1 MP3 retained as rollback asset`);
    }

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
      datasetRevision: migrated.datasetRevision,
    });
    assert.equal(track?.id, entry.contentId);
    assert.equal(track?.kind, 'story');
    assert.equal(track?.nodeId, entry.nodeId);
    assert.equal(track?.textHash, migrated.textHash);
    assert.equal(track?.durationSeconds, migrated.durationSeconds);
    assert.equal(track?.source, path.posix.relative('mobile/src/voice', migrated.path));
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
