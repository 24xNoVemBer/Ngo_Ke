import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const datasetBytes = readFileSync(path.join(repo, 'data/demo.json'));
const dataset = JSON.parse(datasetBytes.toString('utf8'));
const manifest = JSON.parse(readFileSync(path.join(repo, 'mobile/assets/voice/manifest.json'), 'utf8'));
const activeManifest = JSON.parse(readFileSync(path.join(repo, 'mobile/assets/voice/post8/remaining-elevenlabs/manifest.json'), 'utf8'));
const catalogue = readFileSync(path.join(repo, 'mobile/src/voice/catalog.ts'), 'utf8');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const expected = [
  { id: 'intro', text: dataset.intro.text },
  ...dataset.nodes.flatMap((node) => [
    { id: `${node.id}-story`, nodeId: node.id, text: node.story },
    { id: `${node.id}-caption`, nodeId: node.id, text: node.caption },
  ]),
  ...dataset.qa.map((entry) => ({
    id: `${entry.id}-answer`, nodeId: entry.nodeId, text: entry.answer,
  })),
];

test('native voice catalogue covers the canonical 34 spoken passages', () => {
  assert.equal(expected.length, 34);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.sourceDataSha256, sha256(datasetBytes));
  assert.deepEqual(manifest.entries.map(({ id }) => id), expected.map(({ id }) => id));
  assert.equal(manifest.voice, 'Đoan Trang');
  assert.equal(manifest.tts.modelRevision, '61b85e3d937fbbacb387714180e8182823512523');
  assert.deepEqual(manifest.format, {
    container: 'mp3', codec: 'mp3', sampleRateHz: 48_000, channels: 1, bitrateKbps: 96,
  });
});

test('archived clips keep their hashes while all 34 active Vietnamese tracks use audited ElevenLabs assets', () => {
  const activeTracks = new Map(activeManifest.tracks.map((entry) => [`${entry.collectionId}/${entry.locale}/${entry.id}`, entry]));
  for (const [index, row] of expected.entries()) {
    const entry = manifest.entries[index];
    assert.equal(entry.nodeId, row.nodeId, `${row.id} node ID`);
    assert.equal(entry.textSha256, sha256(Buffer.from(row.text, 'utf8')), `${row.id} text hash`);
    assert.match(entry.path, /^mobile\/assets\/voice\/[a-z0-9-]+\.mp3$/);
    assert.ok(entry.durationSeconds > 0, `${row.id} measured duration`);

    const filePath = path.join(repo, entry.path);
    const bytes = readFileSync(filePath);
    assert.ok(bytes.length > 2048, `${row.id} is not an empty/tiny file`);
    assert.equal(sha256(bytes), entry.audioSha256, `${row.id} audio hash`);

    const active = activeTracks.get(`fiction-letter/vi/${row.id}`);
    assert.ok(active, `${row.id} active ElevenLabs manifest record`);
    assert.equal(active.sourceDataSha256, manifest.sourceDataSha256, `${row.id} source bytes`);
    assert.equal(active.sourceTextSha256, entry.textSha256, `${row.id} source text`);
    assert.equal(active.textHash, entry.textSha256, `${row.id} catalogue text hash`);
    assert.equal(active.voiceId, activeManifest.voiceIds.vi, `${row.id} active voice`);
    assert.equal(active.model, activeManifest.model, `${row.id} active model`);
    assert.equal(active.format.codec, 'mp3', `${row.id} active codec`);
    assert.equal(active.format.sampleRateHz, 44_100, `${row.id} active sample rate`);
    assert.equal(active.format.bitrateKbps, 128, `${row.id} active bitrate`);
    assert.equal(active.durationSeconds, active.format.durationSeconds, `${row.id} decoded duration`);
    const activeBytes = readFileSync(path.join(repo, active.path));
    assert.equal(sha256(activeBytes), active.audioSha256, `${row.id} active audio hash`);
    const line = catalogue.split('\n').find((line) => line.includes(`"${row.id}": {`));
    assert.ok(line, `${row.id} active catalogue entry`);
    assert.ok(line.includes(`require('../../assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/${row.id}.mp3')`),
      `${row.id} ElevenLabs Metro require`);
    assert.ok(line.includes(`textHash: "${active.textHash}"`), `${row.id} active text hash mapping`);
    assert.ok(line.includes(`durationSeconds: ${active.durationSeconds}`), `${row.id} active duration mapping`);
    assert.ok(!line.includes(`require('../../assets/voice/${row.id}.mp3')`), `${row.id} no archived active require`);
  }
  assert.equal(activeTracks.size, 100);
  assert.equal([...activeTracks.keys()].filter((key) => key.startsWith('fiction-letter/vi/')).length, 34);
});
