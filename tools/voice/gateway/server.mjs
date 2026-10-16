import { execFile as execFileCallback, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (Number(process.versions.node.split('.')[0]) < 24) {
  throw new Error('Ngõ Kể voice gateway requires Node.js 24 or newer.');
}

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const workerPath = path.join(root, 'tools', 'voice', 'gateway', 'stt_worker.py');
const pythonPath = process.env.NGOKE_VOICE_PYTHON || path.join(
  root, 'tools', 'voice', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
const cachePath = path.join(root, 'tools', 'voice', '.cache');
const host = process.env.NGOKE_VOICE_HOST || '127.0.0.1';
const port = Number(process.env.NGOKE_VOICE_PORT || 8787);
const ffprobe = process.env.NGOKE_FFPROBE || 'ffprobe';
const maxBodyBytes = 16 * 1024 * 1024;
const maxAudioBytes = 12 * 1024 * 1024;
const maxDurationSeconds = 20;
const requestsPerMinute = 12;
const rateWindows = new Map();

class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

class AsrWorker {
  constructor() {
    this.pending = new Map();
    this.readyPromise = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.child = spawn(pythonPath, ['-u', workerPath], {
      cwd: root,
      env: { ...process.env, HF_HUB_OFFLINE: '1', HF_HOME: path.join(cachePath, 'huggingface'), PYTHONUTF8: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const lines = createInterface({ input: this.child.stdout });
    lines.on('line', (line) => this.handleLine(line));
    this.child.stderr.on('data', (chunk) => {
      const message = String(chunk).trim();
      if (message) process.stderr.write(`[voice-worker] ${message.slice(0, 500)}\n`);
    });
    this.child.on('error', () => this.failAll('ASR_UNAVAILABLE'));
    this.child.on('exit', () => this.failAll('ASR_UNAVAILABLE'));
    this.startupTimer = setTimeout(() => this.rejectReady(new Error('ASR worker startup timeout')), 90_000);
  }

  handleLine(line) {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    if (message.type === 'ready') {
      clearTimeout(this.startupTimer);
      this.resolveReady(message);
      return;
    }
    const item = this.pending.get(message.requestId);
    if (!item) return;
    clearTimeout(item.timer);
    this.pending.delete(message.requestId);
    item.resolve(message);
  }

  failAll(code) {
    clearTimeout(this.startupTimer);
    this.rejectReady(new Error(code));
    for (const [requestId, item] of this.pending) {
      clearTimeout(item.timer);
      item.reject(new HttpError(503, code));
      this.pending.delete(requestId);
    }
  }

  cancel(requestId) {
    const item = this.pending.get(requestId);
    if (!item) return;
    clearTimeout(item.timer);
    item.reject(new HttpError(499, 'REQUEST_CANCELLED'));
    this.pending.delete(requestId);
  }

  async transcribe(audio, suffix, requestId = randomUUID(), locale = 'vi') {
    await this.readyPromise;
    if (this.pending.size >= 2) throw new HttpError(429, 'ASR_BUSY');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new HttpError(504, 'ASR_TIMEOUT'));
      }, 45_000);
      this.pending.set(requestId, { resolve, reject, timer });
      this.child.stdin.write(`${JSON.stringify({
        requestId, suffix, locale, audioBase64: audio.toString('base64'),
      })}\n`, (error) => {
        if (!error) return;
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(new HttpError(503, 'ASR_UNAVAILABLE'));
      });
    });
  }
}

const worker = new AsrWorker();

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

function consumeQuota(request) {
  const key = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = rateWindows.get(key);
  if (!current || now - current.startedAt >= 60_000) {
    rateWindows.set(key, { startedAt: now, count: 1 });
    if (rateWindows.size > 1_000) {
      for (const [address, window] of rateWindows) {
        if (now - window.startedAt >= 60_000) rateWindows.delete(address);
      }
    }
    return;
  }
  current.count += 1;
  if (current.count > requestsPerMinute) throw new HttpError(429, 'RATE_LIMITED');
}

async function readRequestBody(request) {
  const declaredLength = Number(request.headers['content-length'] || 0);
  if (declaredLength > maxBodyBytes) throw new HttpError(413, 'PAYLOAD_TOO_LARGE');
  const chunks = [];
  let size = 0;
  await new Promise((resolve, reject) => {
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        chunks.length = 0;
        request.resume();
        reject(new HttpError(413, 'PAYLOAD_TOO_LARGE'));
      } else if (size <= maxBodyBytes) chunks.push(chunk);
    });
    request.on('end', resolve);
    request.on('error', reject);
  });
  return Buffer.concat(chunks, size);
}

function audioKind(bytes, declaredType) {
  if (declaredType === 'audio/mp4' && bytes.length > 12 && bytes.subarray(4, 8).toString() === 'ftyp') return '.m4a';
  if (declaredType === 'audio/wav' && bytes.length > 12
      && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WAVE') return '.wav';
  throw new HttpError(415, 'UNSUPPORTED_AUDIO_FORMAT');
}

function takeString(form, name, maxLength) {
  const value = form.get(name);
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
    throw new HttpError(400, 'INVALID_REQUEST');
  }
  return value;
}

function workerHttpError(code) {
  const status = code === 'ASR_TIMEOUT' ? 504
    : code === 'NO_SPEECH' ? 422
      : code === 'INVALID_REQUEST' ? 400
        : code === 'INVALID_AUDIO' ? 415
          : code === 'ASR_BUSY' ? 429 : 503;
  return new HttpError(status, code);
}

async function inspectAudio(bytes, suffix) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ngoke-voice-'));
  const file = path.join(directory, `clip${suffix}`);
  try {
    await writeFile(file, bytes, { flag: 'wx' });
    const { stdout } = await execFile(ffprobe, [
      '-v', 'error', '-select_streams', 'a:0',
      '-show_entries', 'stream=codec_name,sample_rate,channels',
      '-show_entries', 'format=duration', '-of', 'json', file,
    ], { timeout: 5_000, maxBuffer: 32 * 1024 });
    const probe = JSON.parse(stdout);
    const stream = probe.streams?.[0];
    const duration = Number(probe.format?.duration);
    if (!stream || !['aac', 'pcm_s16le', 'pcm_s24le'].includes(stream.codec_name)
        || Number(stream.sample_rate) < 8_000 || Number(stream.sample_rate) > 96_000
        || Number(stream.channels) < 1 || Number(stream.channels) > 2) {
      throw new HttpError(415, 'INVALID_AUDIO');
    }
    if (!Number.isFinite(duration) || duration < 0.5 || duration > maxDurationSeconds) {
      throw new HttpError(400, duration < 0.5 ? 'AUDIO_TOO_SHORT' : 'AUDIO_TOO_LONG');
    }
    return { durationSeconds: duration };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(415, 'INVALID_AUDIO');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function transcribeRequest(request, response) {
  consumeQuota(request);
  const contentType = request.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;')) throw new HttpError(415, 'UNSUPPORTED_CONTENT_TYPE');
  const body = await readRequestBody(request);
  let form;
  try { form = await new Response(body, { headers: { 'content-type': contentType } }).formData(); }
  catch { throw new HttpError(400, 'INVALID_MULTIPART'); }

  const file = form.get('audio');
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') throw new HttpError(400, 'MISSING_AUDIO');
  if (file.size <= 0 || file.size > maxAudioBytes) throw new HttpError(413, 'AUDIO_SIZE_LIMIT');
  const turnId = takeString(form, 'turnId', 80);
  request.voiceTurnId = turnId;
  const locale = takeString(form, 'locale', 16);
  const nodeId = takeString(form, 'nodeId', 80);
  const mode = takeString(form, 'mode', 16);
  const datasetRevision = takeString(form, 'datasetRevision', 128);
  if (!/^[A-Za-z0-9-]{8,80}$/.test(turnId) || !/^[A-Za-z0-9_-]{1,80}$/.test(nodeId)
      || !['demo', 'live'].includes(mode) || !['vi', 'en'].includes(locale)) throw new HttpError(400, 'INVALID_REQUEST');

  const declaredType = file.type.toLowerCase();
  const audio = Buffer.from(await file.arrayBuffer());
  const suffix = audioKind(audio, declaredType);
  const inspected = await inspectAudio(audio, suffix);
  const workerRequestId = randomUUID();
  const onClose = () => { if (!response.writableEnded) worker.cancel(workerRequestId); };
  response.on('close', onClose);
  try {
    const result = await worker.transcribe(audio, suffix, workerRequestId, locale);
    if (result.code) throw workerHttpError(result.code);
    if (typeof result.text !== 'string' || !result.text.trim() || result.requestId === undefined) {
      throw new HttpError(502, 'INVALID_ASR_RESPONSE');
    }
    sendJson(response, 200, {
      turnId,
      locale,
      mode,
      nodeId,
      datasetRevision,
      durationSeconds: inspected.durationSeconds,
      text: result.text.trim(),
    });
  } finally {
    response.off('close', onClose);
  }
}

const server = createServer(async (request, response) => {
  const startedAt = Date.now();
  let status = 200;
  let code = 'OK';
  let turnId = '';
  try {
    if (request.method === 'GET' && request.url === '/health') {
      const engine = await worker.readyPromise;
      sendJson(response, 200, { status: 'ready', node: process.versions.node, ...engine });
      return;
    }
    if (request.method !== 'POST' || request.url !== '/v1/transcribe') throw new HttpError(404, 'NOT_FOUND');
    await transcribeRequest(request, response);
  } catch (error) {
    status = error instanceof HttpError ? error.status : 500;
    code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';
    if (!response.headersSent && !response.destroyed) {
      sendJson(response, status, { turnId: request.voiceTurnId || turnId, code });
    }
  } finally {
    process.stdout.write(`${new Date().toISOString()} voice status=${status} code=${code} ms=${Date.now() - startedAt}\n`);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close();
    worker.child.kill();
    process.exit(0);
  });
}
process.once('exit', () => worker.child.kill());

try {
  const engine = await worker.readyPromise;
  server.listen(port, host, () => {
    process.stdout.write(`Ngõ Kể voice gateway ready at http://${host}:${port} (${engine.model}@${engine.revision})\n`);
  });
} catch {
  process.stderr.write('Voice gateway could not start the local ASR worker.\n');
  process.exitCode = 1;
  worker.child.kill();
}
