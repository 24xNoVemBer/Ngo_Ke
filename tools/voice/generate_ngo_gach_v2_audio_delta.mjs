import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MODEL = 'eleven_v3';
const FORMAT = 'mp3_44100_128';
const VOICES = { vi: '6adFm46eyy74snVn6YrT', en: 'OZ0L6eISlOejga3XjDFt' };
const RESERVE = 10_000;
const DATA_PATHS = { vi: 'data/localized/ngo-gach.vi.json', en: 'data/localized/ngo-gach.en.json' };
const OUTPUT_ROOT = path.join(ROOT, 'mobile/assets/voice/demo-migration-v1/ngo-gach-v2');
const STATE_PATH = path.join(ROOT, 'tools/voice/.cache/ngo-gach-v2-audio-delta/progress.json');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fail = (message) => { throw new Error(message); };

function readEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) fail('CONFIG_MISSING');
  const values = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, d, s) => d ?? s);
  }
  if (!values.ELEVENLABS_API_KEY || values.ELEVENLABS_VOICE_ID_VI !== VOICES.vi
    || values.ELEVENLABS_VOICE_ID_EN !== VOICES.en) fail('CONFIG_MISSING_OR_VOICE_ID_MISMATCH');
  return values.ELEVENLABS_API_KEY;
}

function inventory() {
  const rows = [];
  for (const locale of ['vi', 'en']) {
    const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, DATA_PATHS[locale]), 'utf8'));
    if (dataset.collectionId !== 'ngo-gach' || dataset.locale !== locale || dataset.nodes.length !== 5) fail('Unexpected Ngõ Gạch dataset identity or node count');
    for (const node of dataset.nodes) {
      if (!node.id.startsWith('ngo-gach-') || typeof node.story !== 'string' || !node.story.trim()) fail('Unexpected story outside the approved Ngõ Gạch inventory');
      rows.push({ key: `${locale}/${node.id}-story`, locale, nodeId: node.id, id: `${node.id}-story`, text: node.story,
        characters: Array.from(node.story).length, textHash: sha256(Buffer.from(node.story, 'utf8')),
        outputPath: `mobile/assets/voice/demo-migration-v1/ngo-gach-v2/${locale}/${node.id}-story.mp3` });
    }
  }
  if (rows.length !== 10 || rows.some((row) => row.characters > 3_000)) fail('Delta must contain exactly ten bounded Ngõ Gạch story tracks');
  return rows;
}

async function request(endpoint, key, options = {}) {
  return fetch(`https://api.elevenlabs.io/v1/${endpoint}`, {
    ...options, headers: { 'xi-api-key': key, accept: options.accept ?? 'application/json', ...options.headers },
  });
}

async function preflight(rows, key) {
  const responses = await Promise.all([
    request('user/subscription', key), request('models', key),
    request(`voices/${VOICES.vi}`, key), request(`voices/${VOICES.en}`, key),
  ]);
  if (!responses.every((response) => response.status === 200)) fail(`Preflight HTTP statuses ${responses.map((response) => response.status).join('/')}`);
  const [subscription, models, viVoice, enVoice] = await Promise.all(responses.map((response) => response.json()));
  const model = models.find((item) => item.model_id === MODEL);
  if (!model?.can_do_text_to_speech || !model.languages?.some((item) => item.language_id === 'vi')
    || !model.languages?.some((item) => item.language_id === 'en')) fail('eleven_v3 does not support both approved locales');
  if (viVoice.voice_id !== VOICES.vi || enVoice.voice_id !== VOICES.en) fail('Approved voice IDs could not be verified');
  if (subscription.can_extend_character_limit !== false || (subscription.max_credit_limit_extension ?? 0) !== 0) fail('Overage/extension is not verifiably disabled');
  const available = subscription.character_limit - subscription.character_count;
  const estimate = rows.reduce((sum, row) => sum + row.characters, 0) * model.token_cost_factor
    * (model.model_rates?.character_cost_multiplier ?? 1) * (model.model_rates?.cost_discount_multiplier ?? 1);
  if (!Number.isFinite(available) || available < estimate + RESERVE) fail('Insufficient verified balance with required reserve');
  return { available, estimate, tier: subscription.tier, voiceNames: { vi: viVoice.name, en: enVoice.name } };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  const temp = `${STATE_PATH}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'w' });
  fs.renameSync(temp, STATE_PATH);
}

function loadState(fingerprint) {
  if (!fs.existsSync(STATE_PATH)) return { fingerprint, status: 'in_progress', entries: {} };
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  if (state.fingerprint !== fingerprint) fail('Journal belongs to a different frozen text inventory');
  if (Object.values(state.entries).some((entry) => entry.status === 'requesting' || entry.status === 'outcome_unknown')) {
    fail('A prior TTS request has an uncertain outcome; refusing to retry or charge again');
  }
  return state;
}

function inspectFrame(bytes) {
  if (bytes.length < 128) fail('Generated audio is too short to be a valid MP3');
  let offset = 0;
  if (bytes.toString('ascii', 0, 3) === 'ID3') {
    offset = 10 + ((bytes[6] & 0x7f) << 21) + ((bytes[7] & 0x7f) << 14) + ((bytes[8] & 0x7f) << 7) + (bytes[9] & 0x7f);
    if (bytes[5] & 0x10) offset += 10;
  }
  const rates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  let frames = 0;
  let channelCount;
  while (offset + 4 <= bytes.length) {
    if (bytes.toString('ascii', offset, offset + 3) === 'TAG' && bytes.length - offset === 128) break;
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) fail(`Invalid MP3 frame sync at byte ${offset}`);
    const version = (bytes[offset + 1] >> 3) & 3;
    const layer = (bytes[offset + 1] >> 1) & 3;
    const bitrate = rates[(bytes[offset + 2] >> 4) & 15];
    const sampleRateIndex = (bytes[offset + 2] >> 2) & 3;
    const sampleRate = [44_100, 48_000, 32_000, 0][sampleRateIndex];
    const padding = (bytes[offset + 2] >> 1) & 1;
    if (version !== 3 || layer !== 1 || bitrate !== 128 || sampleRate !== 44_100) fail(`Unexpected MP3 frame format at byte ${offset}`);
    const channels = ((bytes[offset + 3] >> 6) & 3) === 3 ? 1 : 2;
    if (channelCount !== undefined && channels !== channelCount) fail('MP3 channel mode changes between frames');
    channelCount = channels;
    const frameSize = Math.floor((144 * bitrate * 1_000) / sampleRate) + padding;
    if (offset + frameSize > bytes.length) fail(`Truncated MP3 frame at byte ${offset}`);
    offset += frameSize;
    frames++;
  }
  if (!frames || offset !== bytes.length && !(bytes.length - offset === 128 && bytes.toString('ascii', offset, offset + 3) === 'TAG')) {
    fail('MP3 contains trailing or missing frame data');
  }
  return { durationSeconds: frames * 1_152 / 44_100, channels: channelCount, frameCount: frames };
}

class BrowserDecoder {
  constructor() { this.profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ngoke-gach-v2-decode-')); this.files = new Map(); this.nextToken = 0; }
  async start() {
    if (!fs.existsSync(EDGE)) fail('No installed Edge MP3 decoder is available');
    this.server = http.createServer((req, res) => {
      const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
      if (pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end('<!doctype html><body><script>window.decodeAudioFromUrl=async(url)=>{const bytes=await(await fetch(url)).arrayBuffer();const context=new AudioContext();try{const audio=await context.decodeAudioData(bytes);return {durationSeconds:audio.duration,channels:audio.numberOfChannels}}finally{await context.close()}}</script></body>');
        return;
      }
      const token = pathname.slice('/audio/'.length);
      const file = this.files.get(token);
      if (pathname.startsWith('/audio/') && file) {
        this.files.delete(token); res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': fs.statSync(file).size });
        fs.createReadStream(file).pipe(res); return;
      }
      res.writeHead(404); res.end();
    });
    await new Promise((resolve, reject) => this.server.listen(0, '127.0.0.1', resolve).once('error', reject));
    const url = `http://127.0.0.1:${this.server.address().port}/`;
    this.child = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${this.profile}`, url], { windowsHide: true, stdio: 'ignore' });
    const activePort = path.join(this.profile, 'DevToolsActivePort');
    for (let index = 0; index < 100 && !fs.existsSync(activePort); index++) await new Promise((resolve) => setTimeout(resolve, 100));
    if (!fs.existsSync(activePort)) fail('Headless browser MP3 decoder did not start');
    const port = Number(fs.readFileSync(activePort, 'utf8').split(/\r?\n/)[0]);
    let target;
    for (let index = 0; index < 50 && !target; index++) {
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((item) => item.type === 'page'); } catch {}
      if (!target) await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!target) fail('Headless browser page is unavailable');
    this.ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { this.ws.onopen = resolve; this.ws.onerror = () => reject(new Error('Headless browser connection failed')); });
    this.pending = new Map(); this.commandId = 0;
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const [resolve, reject] = this.pending.get(message.id); this.pending.delete(message.id);
      message.error ? reject(new Error('Headless browser command failed')) : resolve(message.result);
    };
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Page.navigate', { url });
    let ready = false;
    for (let index = 0; index < 100 && !ready; index++) {
      try { ready = (await this.send('Runtime.evaluate', { expression: 'typeof window.decodeAudioFromUrl', returnByValue: true })).result?.value === 'function'; } catch {}
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!ready) fail('Headless browser decoder page did not become ready');
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => { const id = ++this.commandId; this.pending.set(id, [resolve, reject]); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async decode(file) {
    const token = String(++this.nextToken); this.files.set(token, file);
    const result = await this.send('Runtime.evaluate', { expression: `window.decodeAudioFromUrl('/audio/${token}')`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails || result.result?.subtype === 'error') fail('Installed browser failed to decode an MP3');
    const decoded = result.result?.value;
    if (!decoded || !Number.isFinite(decoded.durationSeconds) || decoded.durationSeconds <= 0 || !Number.isInteger(decoded.channels)) fail('Decoded audio metadata is invalid');
    return decoded;
  }
  async close() {
    try { this.ws?.close(); } catch {}
    try { this.child?.kill(); } catch {}
    if (this.server) await new Promise((resolve) => this.server.close(resolve));
    try { fs.rmSync(this.profile, { recursive: true, force: true }); } catch {}
  }
}

async function generate(row, key, state) {
  const output = path.join(ROOT, row.outputPath);
  const previous = state.entries[row.key];
  if (previous?.status === 'complete') {
    if (!fs.existsSync(output)) fail(`Journal says complete but output is missing: ${row.key}`);
    const bytes = fs.readFileSync(output);
    if (sha256(bytes) !== previous.audioSha256 || previous.textHash !== row.textHash) fail(`Completed output failed hash validation: ${row.key}`);
    return;
  }
  if (fs.existsSync(output)) fail(`Unjournaled output already exists; refusing to overwrite or duplicate: ${row.key}`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  state.entries[row.key] = { status: 'requesting', textHash: row.textHash, characters: row.characters };
  saveState(state);
  let response;
  try {
    response = await request(`text-to-speech/${VOICES[row.locale]}?output_format=${FORMAT}`, key, {
      method: 'POST', accept: 'audio/mpeg', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: row.text, model_id: MODEL, language_code: row.locale,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
  } catch {
    state.entries[row.key] = { ...state.entries[row.key], status: 'outcome_unknown' }; saveState(state);
    fail(`Network outcome unknown for ${row.key}; refusing retry`);
  }
  const requestId = response.headers.get('request-id') ?? null;
  const costHeader = response.headers.get('character-cost');
  if (response.status !== 200 || !/^audio\/mpeg(?:;|$)/i.test(response.headers.get('content-type') ?? '')) {
    state.entries[row.key] = { ...state.entries[row.key], status: 'outcome_unknown', httpStatus: response.status, requestId };
    saveState(state); fail(`TTS response outcome not safely usable for ${row.key}; refusing retry`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const cost = costHeader !== null && /^\d+$/.test(costHeader) ? Number(costHeader) : null;
  try { inspectFrame(bytes); } catch (error) {
    state.entries[row.key] = { ...state.entries[row.key], status: 'outcome_unknown', httpStatus: response.status,
      requestId, characterCost: cost, audioSha256: sha256(bytes), bytes: bytes.length };
    saveState(state); fail(`Generated output failed MP3 validation for ${row.key}: ${error.message}`);
  }
  if (cost === null || cost > row.characters) {
    state.entries[row.key] = { ...state.entries[row.key], status: 'outcome_unknown', httpStatus: response.status,
      requestId, characterCost: cost, audioSha256: sha256(bytes), bytes: bytes.length };
    saveState(state); fail(`Unsafe charge record for ${row.key}; refusing further requests`);
  }
  const temp = `${output}.partial`;
  fs.writeFileSync(temp, bytes, { flag: 'wx' });
  fs.renameSync(temp, output);
  state.entries[row.key] = { ...state.entries[row.key], status: 'complete', httpStatus: response.status,
    requestId, characterCost: cost, audioSha256: sha256(bytes), bytes: bytes.length };
  saveState(state);
}

const rows = inventory();
const fingerprint = sha256(Buffer.from(JSON.stringify(rows.map(({ key, textHash, characters }) => ({ key, textHash, characters }))), 'utf8'));
const state = loadState(fingerprint);
if (process.argv.includes('--verify-only')) {
  const decoder = process.argv.includes('--full-decode') ? new BrowserDecoder() : null;
  try {
    await decoder?.start();
    const results = [];
    for (const row of rows) {
      const entry = state.entries[row.key];
      const file = path.join(ROOT, row.outputPath);
      if (entry?.status !== 'complete' || !fs.existsSync(file)) fail(`Missing journaled generated audio: ${row.key}`);
      const bytes = fs.readFileSync(file);
      if (sha256(bytes) !== entry.audioSha256 || entry.textHash !== row.textHash) fail(`Generated audio/hash mismatch: ${row.key}`);
      const decoded = decoder ? await decoder.decode(file) : inspectFrame(bytes);
      entry.durationSeconds = decoded.durationSeconds;
      entry.channels = decoded.channels;
      results.push({ key: row.key, bytes: bytes.length, sha256: entry.audioSha256, durationSeconds: decoded.durationSeconds, channels: decoded.channels });
    }
    state.status = 'full_decode_verified_pending_catalogue_integration'; saveState(state);
    console.log(JSON.stringify({ fullDecode: Boolean(decoder), frameScan: !decoder, tracks: results }, null, 2));
  } finally { await decoder?.close(); }
  process.exit(0);
}
const key = readEnv();
const preflightResult = await preflight(rows, key);
state.preflight = { ...preflightResult, model: MODEL, outputFormat: FORMAT, reserve: RESERVE, approvedMaxTracks: 10 };
state.voiceIds = VOICES;
saveState(state);
console.log(JSON.stringify({ preflight: 'PASS', availableCredits: preflightResult.available,
  estimatedCredits: preflightResult.estimate, overageDisabled: true, voices: preflightResult.voiceNames,
  tracks: rows.length, alreadyComplete: Object.values(state.entries).filter((entry) => entry.status === 'complete').length }));
for (const row of rows) await generate(row, key, state);
state.status = 'generated_pending_catalogue_integration';
saveState(state);
console.log(JSON.stringify({ generated: Object.values(state.entries).filter((entry) => entry.status === 'complete').length,
  chargedCredits: Object.values(state.entries).reduce((sum, entry) => sum + (entry.characterCost ?? 0), 0),
  outputs: rows.map((row) => row.outputPath) }));
