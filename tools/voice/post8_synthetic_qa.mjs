import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const cache = path.join(root, 'tools', 'voice', '.cache', 'post8-remaining-20261016');
const output = path.join(cache, 'qa-http-results.json');
const api = 'http://127.0.0.1:18787';
const requestSpacingMs = 5_100;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const file = (relative) => pathToFileURL(path.join(root, relative)).href;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

globalThis.require = () => 1;
const { createVoiceRequestBody, transcribeVoiceRequest } = await import(file('mobile/src/voice/transcribe.ts'));
const { findAnswer } = await import(file('mobile/src/qa/match.ts'));
const { parseDataset, parseDatasetV2, validateDatasetV2Pair } = await import(file('mobile/src/data/sourceState.ts'));
const { canonicalDatasetJson } = await import(file('mobile/src/data/canonicalJson.ts'));
const { voiceCatalogueRevision } = await import(file('mobile/src/voice/catalog.ts'));

const datasets = {};
const revisions = {};
for (const locale of ['en', 'vi']) {
  for (const collectionId of ['fiction-letter', 'old-quarter-pilot']) {
    const source = collectionId === 'fiction-letter'
      ? (locale === 'en' ? 'data/localized/fiction.en.json' : 'data/demo.json')
      : `data/localized/old-quarter.${locale}.json`;
    const rawBytes = await readFile(path.join(root, source));
    const raw = JSON.parse(rawBytes.toString('utf8'));
    const dataset = raw.schemaVersion === 1
      ? parseDataset(raw, { mode: 'demo' })
      : parseDatasetV2(raw, { mode: collectionId === 'fiction-letter' ? 'demo' : 'live', expectedLocale: locale });
    assert.ok(dataset, `shared parser rejected ${collectionId}/${locale}`);
    datasets[`${collectionId}/${locale}`] = { dataset, source, sourceSha256: sha256(rawBytes) };
    revisions[`${collectionId}/${locale}`] = raw.schemaVersion === 1
      ? voiceCatalogueRevision
      : sha256(Buffer.from(canonicalDatasetJson(dataset), 'utf8'));
  }
}
assert.deepEqual(validateDatasetV2Pair(datasets['old-quarter-pilot/vi'].dataset,
  datasets['old-quarter-pilot/en'].dataset), { ok: true });

const resultsByLocale = {};
const expectedPairs = {};
for (const locale of ['en', 'vi']) {
  const results = JSON.parse(await readFile(path.join(cache, locale, 'results.json'), 'utf8'));
  assert.equal(results.qaSamples.length, 18);
  resultsByLocale[locale] = results.qaSamples;
  expectedPairs[locale] = new Map();
  for (const sample of results.qaSamples) {
    const key = `${sample.collectionId}/${sample.nodeId}`;
    expectedPairs[locale].set(key, [...(expectedPairs[locale].get(key) ?? []), sample]);
  }
  assert.equal(expectedPairs[locale].size, 9);
}

const healthResponse = await fetch(`${api}/health`);
const health = await healthResponse.json();
assert.equal(healthResponse.ok, true, `ASR gateway not ready: ${JSON.stringify(health)}`);
assert.equal(health.status, 'ready');
assert.equal(health.model, 'Systran/faster-whisper-small');

const originalFetch = globalThis.fetch;
const outputRows = [];
for (const locale of ['en', 'vi']) {
  for (const [pairKey, pair] of expectedPairs[locale]) {
    const [collectionId, nodeId] = pairKey.split('/');
    const { dataset } = datasets[`${collectionId}/${locale}`];
    const nodeQa = dataset.qa.filter((entry) => entry.nodeId === nodeId);
    assert.equal(pair.length, 2);
    const canonical = pair.find((row) => row.role === 'canonical');
    const followup = pair.find((row) => row.role === 'followup');
    assert.ok(canonical && followup);
    assert.ok(nodeQa.find((entry) => entry.id === canonical.expectedId)?.followUps.includes(followup.expectedId),
      `question pair is not an approved graph edge: ${pairKey}`);
    let canonicalMatchedExpected = false;
    for (const sample of [canonical, followup]) {
      const samplePath = path.join(cache, locale, sample.audioPath);
      const audio = await readFile(samplePath);
      assert.equal(sha256(audio), sample.audioSha256, `synthetic clip hash changed: ${locale}/${pairKey}/${sample.role}`);
      const key = `${collectionId}/${locale}`;
      const revision = revisions[key];
      assert.equal(sample.datasetRevision, revision);
      const mode = collectionId === 'fiction-letter' ? 'demo' : 'live';
      const context = { turnId: `post8-${locale}-${collectionId}-${nodeId}-${sample.role}`,
        locale, mode, nodeId, datasetRevision: revision };
      const body = createVoiceRequestBody(new Blob([audio], { type: 'audio/wav' }), path.basename(sample.audioPath), context);
      let gatewayPayload;
      globalThis.fetch = async (...args) => {
        const response = await originalFetch(...args);
        if (String(args[0]).endsWith('/v1/transcribe')) gatewayPayload = await response.clone().json();
        return response;
      };
      const started = performance.now();
      let transcript = null;
      let requestError = null;
      let match = { status: 'unknown' };
      try {
        if (outputRows.length) await wait(requestSpacingMs);
        transcript = await transcribeVoiceRequest(api, body, new AbortController(), context);
        match = findAnswer(nodeQa, transcript);
      } catch (error) {
        requestError = error instanceof Error ? error.message : String(error);
      } finally {
        globalThis.fetch = originalFetch;
      }
      const actualId = match.status === 'matched' ? match.entry.id : 'unknown';
      if (sample.role === 'canonical') canonicalMatchedExpected = actualId === sample.expectedId;
      outputRows.push({ locale, collectionId, nodeId, role: sample.role, expectedId: sample.expectedId,
        transcript, actualId, matchedOn: match.status === 'matched' ? match.matchedOn : null, requestError,
        decoderLanguage: gatewayPayload?.decoderLanguage ?? null, gatewayLocale: gatewayPayload?.locale ?? null,
        decoderLanguageWasForced: true, languageClassification: 'not-run',
        turnId: gatewayPayload?.turnId ?? null, datasetRevision: revision,
        sourceTextSha256: sample.sourceTextSha256, spokenTextSha256: sample.spokenTextSha256,
        inputAudioSha256: sample.audioSha256, inputAudioPath: sample.audioPath,
        latencyMs: Math.round(performance.now() - started),
        followUpFromId: sample.followUpFromId,
        approvedGraphFollowUp: sample.role !== 'followup' ||
          nodeQa.find((entry) => entry.id === sample.followUpFromId)?.followUps.includes(sample.expectedId) === true,
        ranAfterCanonicalExpectedMatch: sample.role !== 'followup' || canonicalMatchedExpected,
      });
      console.log(JSON.stringify(outputRows.at(-1)));
    }
  }
}
globalThis.fetch = originalFetch;
const report = {
  run: 'post8-remaining-synthetic-http-asr-production-matcher', syntheticOnly: true,
  languageSelection: 'forced by request locale; independent language classification was not run',
  gateway: { engine: health.engine, model: health.model, revision: health.revision,
    device: health.device, computeType: health.computeType, endpoint: api },
  ttsSamples: { en: 'Kokoro af_heart pinned snapshot; see per-locale results.json',
    vi: 'VieNeu Doan Trang pinned local snapshot; see per-locale results.json' },
  scope: '6 fiction nodes plus 3 approved old-quarter pilot nodes per locale',
  results: outputRows,
  counts: {
    samples: outputRows.length,
    expectedMatches: outputRows.filter((row) => row.actualId === row.expectedId).length,
    wrongMatches: outputRows.filter((row) => row.actualId !== 'unknown' && row.actualId !== row.expectedId).length,
    unknown: outputRows.filter((row) => row.actualId === 'unknown').length,
    decoderMismatches: outputRows.filter((row) => row.decoderLanguage !== row.locale).length,
    approvedGraphFollowups: outputRows.filter((row) => row.role === 'followup' && row.approvedGraphFollowUp).length,
    followupsAfterExpectedCanonicalMatch: outputRows.filter((row) => row.role === 'followup' && row.ranAfterCanonicalExpectedMatch).length,
  },
};
assert.equal(outputRows.length, 36);
assert.equal(report.counts.wrongMatches, 0, 'synthetic recognition must not return a different fixed answer');
assert.equal(report.counts.decoderMismatches, 0, 'the configured decoder language must match each request locale');
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ output, ...report.counts }));
