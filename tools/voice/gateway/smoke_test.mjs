import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const gateway = path.join(root, 'tools', 'voice', 'gateway', 'server.mjs');
const probeDirectory = path.join(root, 'tools', 'voice', '.cache', 'v0-probe');

async function reserveLocalPort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a test port');
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}

function silentPcmWav(seconds) {
  const sampleRate = 16_000;
  const dataBytes = sampleRate * seconds * 2;
  const wav = Buffer.alloc(44 + dataBytes);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + dataBytes, 4); wav.write('WAVE', 8);
  wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(dataBytes, 40);
  return wav;
}

const port = await reserveLocalPort();
const child = spawn(process.execPath, [gateway], {
  cwd: root,
  env: { ...process.env, NGOKE_VOICE_HOST: '127.0.0.1', NGOKE_VOICE_PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderr = '';
let stdout = '';
let cancellationLogResolve;
const cancellationLogged = new Promise((resolve) => { cancellationLogResolve = resolve; });
child.stdout.on('data', (chunk) => {
  stdout = (stdout + String(chunk)).slice(-4_000);
  if (stdout.includes('code=REQUEST_CANCELLED')) cancellationLogResolve();
});
child.stderr.on('data', (chunk) => { stderr = (stderr + String(chunk)).slice(-2_000); });
const baseUrl = `http://127.0.0.1:${port}`;

try {
  let health;
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Gateway exited during startup: ${stderr}`);
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) { health = await response.json(); break; }
    } catch { /* The local worker is still loading. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.equal(health?.status, 'ready', `Gateway health timeout: ${stderr}`);
  assert.equal(health.node.split('.')[0], '24');

  const report = JSON.parse(await readFile(path.join(probeDirectory, 'report.json'), 'utf8'));
  const sample = report.voices['Đoan Trang'].intro;
  const bytes = await readFile(path.join(probeDirectory, sample.file));
  const form = new FormData();
  form.append('audio', new Blob([bytes], { type: 'audio/wav' }), 'synthetic-intro.wav');
  const expected = {
    turnId: `gateway-smoke-${Date.now()}`,
    locale: 'vi',
    mode: 'demo',
    nodeId: 'demo-02',
    datasetRevision: 'local-synthetic-v0',
  };
  for (const [key, value] of Object.entries(expected)) form.append(key, value);
  const response = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: form });
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  for (const [key, value] of Object.entries(expected)) assert.equal(result[key], value);
  assert.equal(result.locale, 'vi');
  assert.ok(result.durationSeconds > 0);
  assert.ok(typeof result.text === 'string' && result.text.length > 0);

  const m4aBytes = await readFile(path.join(root, 'tools', 'voice', 'gateway', 'test-fixtures', 'ios-aac-smoke.m4a'));
  const m4aMeta = { ...expected, turnId: `gateway-m4a-${Date.now()}` };
  const m4aForm = new FormData();
  m4aForm.append('audio', new Blob([m4aBytes], { type: 'audio/mp4' }), 'native-recording.m4a');
  for (const [key, value] of Object.entries(m4aMeta)) m4aForm.append(key, value);
  const m4aResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: m4aForm });
  const m4aResult = await m4aResponse.json();
  assert.equal(m4aResponse.status, 200, JSON.stringify(m4aResult));
  for (const [key, value] of Object.entries(m4aMeta)) assert.equal(m4aResult[key], value);
  assert.ok(m4aResult.durationSeconds > 0);
  assert.ok(typeof m4aResult.text === 'string' && m4aResult.text.length > 0);

  const cancelled = new AbortController();
  const cancelMeta = { ...expected, turnId: `gateway-cancel-${Date.now()}` };
  const cancelForm = new FormData();
  cancelForm.append('audio', new Blob([bytes], { type: 'audio/wav' }), 'cancelled-synthetic-intro.wav');
  for (const [key, value] of Object.entries(cancelMeta)) cancelForm.append(key, value);
  const cancelledRequest = fetch(`${baseUrl}/v1/transcribe`, {
    method: 'POST', body: cancelForm, signal: cancelled.signal,
  });
  const cancelTimer = setTimeout(() => cancelled.abort(), 1_500);
  try {
    await assert.rejects(cancelledRequest, (error) => error.name === 'AbortError');
  } finally {
    clearTimeout(cancelTimer);
  }
  let cancellationWaitTimer;
  try {
    await Promise.race([
      cancellationLogged,
      new Promise((_, reject) => {
        cancellationWaitTimer = setTimeout(() => reject(new Error(`Gateway did not log an active ASR cancellation: ${stdout}`)), 5_000);
      }),
    ]);
  } finally {
    clearTimeout(cancellationWaitTimer);
  }

  const retryMeta = { ...expected, turnId: `gateway-after-cancel-${Date.now()}` };
  const retryForm = new FormData();
  retryForm.append('audio', new Blob([bytes], { type: 'audio/wav' }), 'retry-synthetic-intro.wav');
  for (const [key, value] of Object.entries(retryMeta)) retryForm.append(key, value);
  const retryResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: retryForm });
  const retryResult = await retryResponse.json();
  assert.equal(retryResponse.status, 200, JSON.stringify(retryResult));
  assert.equal(retryResult.turnId, retryMeta.turnId);
  assert.equal(retryResult.nodeId, retryMeta.nodeId);
  assert.ok(typeof retryResult.text === 'string' && retryResult.text.length > 0);

  const invalid = new FormData();
  invalid.append('audio', new Blob([bytes], { type: 'audio/mp4' }), 'wrong-format.m4a');
  for (const [key, value] of Object.entries({ ...expected, turnId: `invalid-${Date.now()}` })) invalid.append(key, value);
  const invalidResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: invalid });
  assert.equal(invalidResponse.status, 415);
  assert.equal((await invalidResponse.json()).code, 'UNSUPPORTED_AUDIO_FORMAT');
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.match(stdout, /voice status=415 code=UNSUPPORTED_AUDIO_FORMAT ms=/);
  assert.doesNotMatch(`${stdout}\n${stderr}`, /wrong-format\.m4a|audio\/mp4|header=/);

  const tooLong = new FormData();
  tooLong.append('audio', new Blob([silentPcmWav(21)], { type: 'audio/wav' }), 'too-long.wav');
  for (const [key, value] of Object.entries({ ...expected, turnId: `too-long-${Date.now()}` })) tooLong.append(key, value);
  const tooLongResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: tooLong });
  assert.equal(tooLongResponse.status, 400);
  assert.equal((await tooLongResponse.json()).code, 'AUDIO_TOO_LONG');

  const tooShort = new FormData();
  tooShort.append('audio', new Blob([silentPcmWav(0.25)], { type: 'audio/wav' }), 'too-short.wav');
  for (const [key, value] of Object.entries({ ...expected, turnId: `too-short-${Date.now()}` })) tooShort.append(key, value);
  const tooShortResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: tooShort });
  assert.equal(tooShortResponse.status, 400);
  assert.equal((await tooShortResponse.json()).code, 'AUDIO_TOO_SHORT');

  const silence = new FormData();
  silence.append('audio', new Blob([silentPcmWav(1)], { type: 'audio/wav' }), 'silence.wav');
  for (const [key, value] of Object.entries({ ...expected, turnId: `silence-${Date.now()}` })) silence.append(key, value);
  const silenceResponse = await fetch(`${baseUrl}/v1/transcribe`, { method: 'POST', body: silence });
  assert.equal(silenceResponse.status, 422);
  assert.equal((await silenceResponse.json()).code, 'NO_SPEECH');

  let rateLimited = false;
  for (let attempt = 0; attempt < 13 && !rateLimited; attempt += 1) {
    const quotaResponse = await fetch(`${baseUrl}/v1/transcribe`, {
      method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'invalid',
    });
    const quotaResult = await quotaResponse.json();
    if (quotaResponse.status === 429) {
      assert.equal(quotaResult.code, 'RATE_LIMITED');
      rateLimited = true;
    } else {
      assert.equal(quotaResponse.status, 415);
      assert.equal(quotaResult.code, 'UNSUPPORTED_CONTENT_TYPE');
    }
  }
  assert.equal(rateLimited, true, 'The source IP quota must reject the request after 12 requests per minute');

  process.stdout.write(`Voice gateway smoke passed: Node ${health.node}, ${health.engine}; ${result.durationSeconds}s synthetic WAV and native AAC/M4A; abort/retry, quota, invalid-format, duration and silence guards passed.\n`);
} finally {
  child.kill('SIGTERM');
}
