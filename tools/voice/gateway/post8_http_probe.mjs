import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const [locale, audioPath] = process.argv.slice(2);
if (!['vi', 'en'].includes(locale) || !audioPath) {
  throw new Error('Usage: node post8_http_probe.mjs <vi|en> <local-wav>');
}

const endpoint = new URL(process.env.NGOKE_VOICE_URL || 'http://127.0.0.1:18787');
assert.equal(endpoint.hostname, '127.0.0.1', 'probe must use the controlled loopback gateway');
endpoint.pathname = '/v1/transcribe';
const context = {
  turnId: `post8-${locale}-${randomUUID()}`,
  locale,
  nodeId: 'old-quarter-pilot',
  mode: 'demo',
  datasetRevision: 'post8-synthetic',
};
const form = new FormData();
form.append('audio', new Blob([await readFile(audioPath)], { type: 'audio/wav' }), path.basename(audioPath));
for (const [key, value] of Object.entries(context)) form.append(key, value);

const response = await fetch(endpoint, { method: 'POST', body: form });
const result = await response.json();
assert.equal(response.ok, true, `${response.status} ${result.code ?? 'transcription failed'}`);
assert.deepEqual(Object.fromEntries(Object.keys(context).map((key) => [key, result[key]])), context);
assert.equal(result.decoderLanguage, locale, 'gateway must return the decoder language actually used');
assert.equal(typeof result.text, 'string');
assert.ok(result.text.trim().length > 0);
console.log(JSON.stringify({ status: response.status, decoderLanguage: result.decoderLanguage,
  durationSeconds: result.durationSeconds, text: result.text.trim() }, null, 2));
