import assert from 'node:assert/strict';
import { Blob } from 'node:buffer';
import test from 'node:test';
import { createVoiceRequestBody, transcribeVoiceRequest } from '../src/voice/transcribe.ts';

const context = {
  turnId: 'turn-12345678', locale: 'vi', mode: 'demo', nodeId: 'demo-02', datasetRevision: 'revision-1',
};
const body = {};

test('voice upload uses a Blob-compatible audio file with the complete turn metadata', () => {
  const audioFile = new Blob(['audio'], { type: 'audio/mp4' });
  const formData = createVoiceRequestBody(audioFile, 'question.m4a', context);
  const uploadedFile = formData.get('audio');
  assert.ok(uploadedFile instanceof Blob);
  assert.equal(uploadedFile.name, 'question.m4a');
  assert.equal(uploadedFile.type, 'audio/mp4');
  for (const [name, value] of Object.entries(context)) assert.equal(formData.get(name), value);
});

test('voice upload preserves Expo file bytes with an explicit multipart audio type', async () => {
  const previousFormData = globalThis.FormData;
  class FormDataCapture {
    parts = new Map();
    append(name, value) { this.parts.set(name, value); }
    get(name) { return this.parts.get(name) ?? null; }
  }
  globalThis.FormData = FormDataCapture;
  try {
    const bytes = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70]);
    const file = { name: 'question.m4a', type: 'audio/mp4', bytes: async () => bytes };
    const formData = createVoiceRequestBody(file, file.name, context);
    assert.equal(formData.get('audio').type, 'audio/mp4');
    assert.deepEqual(await formData.get('audio').bytes(), bytes);
    for (const [name, value] of Object.entries(context)) assert.equal(formData.get(name), value);
  } finally {
    globalThis.FormData = previousFormData;
  }
});

async function withFetch(fetchImpl, run) {
  const previous = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try { await run(); } finally { globalThis.fetch = previous; }
}

test('transcription trims the returned text only after validating the full turn context', async () => {
  await withFetch(async () => new Response(JSON.stringify({ ...context, text: '  hỏi tiếp  ' }), { status: 200 }), async () => {
    const text = await transcribeVoiceRequest('http://gateway', body, new AbortController(), context);
    assert.equal(text, 'hỏi tiếp');
  });
});

test('a response body that stalls after headers is aborted by the request timeout', async () => {
  await withFetch(async (_url, { signal }) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => {
      const abort = () => reject(new Error('aborted'));
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
    }),
  }), async () => {
    await assert.rejects(
      transcribeVoiceRequest('http://gateway', body, new AbortController(), context, 20),
      { message: 'ASR_TIMEOUT' },
    );
  });
});

test('network failure and malformed or stale responses return safe error codes', async () => {
  await withFetch(async () => { throw new Error('offline'); }, async () => {
    await assert.rejects(transcribeVoiceRequest('http://gateway', body, new AbortController(), context), { message: 'ASR_UNAVAILABLE' });
  });
  await withFetch(async () => new Response('{', { status: 200 }), async () => {
    await assert.rejects(transcribeVoiceRequest('http://gateway', body, new AbortController(), context), { message: 'INVALID_RESPONSE' });
  });
  await withFetch(async () => new Response(JSON.stringify({ ...context, nodeId: 'demo-03', text: 'wrong turn' }), { status: 200 }), async () => {
    await assert.rejects(transcribeVoiceRequest('http://gateway', body, new AbortController(), context), { message: 'INVALID_RESPONSE' });
  });
});
