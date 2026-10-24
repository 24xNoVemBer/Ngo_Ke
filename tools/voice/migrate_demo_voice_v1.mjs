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
const MAX_CHUNK = 3_000;
const OUT = path.join(ROOT, 'mobile/assets/voice/demo-migration-v1');
const STATE_PATH = path.join(ROOT, 'tools/voice/.cache/demo-migration-v1/progress.json');
const MANIFEST_PATH = path.join(OUT, 'manifest.json');
const CATALOG_PATH = path.join(ROOT, 'mobile/src/voice/demoVoiceMigrationV1Catalog.ts');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const rel = (value) => path.relative(ROOT, value).replaceAll(path.sep, '/');
const fail = (message) => { throw new Error(message); };

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function checkedText(value, label) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) fail(`Invalid spoken text: ${label}`);
  return value;
}

function sourceHashMatches(raw, expected) {
  if (!expected) return true;
  const normalized = Buffer.from(raw.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  return sha256(raw) === expected || sha256(normalized) === expected;
}

function resolveText(row) {
  const source = row.source;
  if (typeof source !== 'string' || source.startsWith('/') || source.includes('..')) fail('Unsafe or missing source path in voice manifest');
  const raw = fs.readFileSync(path.join(ROOT, source));
  const dataHashMatches = sourceHashMatches(raw, row.sourceDataSha256);
  const data = JSON.parse(raw.toString('utf8'));
  const id = row.contentId ?? row.id;
  let text;
  if (row.kind === 'intro') {
    text = data.intro?.text;
  } else if (row.kind === 'caption') {
    text = data.nodes?.find((node) => node.id === row.nodeId)?.caption;
  } else if (row.kind === 'answer') {
    const answerId = String(id).endsWith('-answer') ? String(id).slice(0, -7) : String(id);
    text = data.qa?.find((answer) => answer.id === answerId)?.answer;
  } else if (row.kind === 'story') {
    const node = data.nodes?.find((item) => item.id === row.nodeId);
    if (node && id === `${node.id}-story`) text = node.story;
    if (typeof text !== 'string') {
      const entries = [ ...(data.chapters ?? []), ...(data.transitions ?? []), ...(data.closing ? [data.closing] : []) ];
      text = entries.find((item) => item.voiceContentId === id)?.text;
    }
  }
  text = checkedText(text, `${row.collectionId}/${row.locale}/${id}`);
  if (row.textHash && sha256(Buffer.from(text, 'utf8')) !== row.textHash) fail(`Spoken text hash mismatch: ${row.collectionId}/${row.locale}/${id}`);
  const characters = Array.from(text).length;
  if (Number.isInteger(row.characters) && row.characters !== characters) fail(`Character count mismatch: ${row.collectionId}/${row.locale}/${id}`);
  return { raw, text, characters, dataHashMatches };
}

function readInventory() {
  const rows = [];
  for (const locale of ['vi', 'en']) {
    const manifest = readJson(`mobile/assets/voice/alleys-intro/manifest.${locale}.json`);
    for (const row of manifest.entries ?? []) rows.push({ ...row, locale, kind: 'intro', contentId: row.contentId, collectionId: row.collectionId });
  }
  for (const row of readJson('mobile/assets/voice/node-stories/manifest.json').entries ?? []) rows.push({ ...row, kind: 'story' });
  for (const row of readJson('mobile/assets/voice/post8/remaining-elevenlabs/manifest.json').tracks ?? []) rows.push({ ...row, contentId: row.id });
  const lenses = readJson('mobile/assets/voice/three-lenses-elevenlabs/manifest.json');
  for (const locale of ['vi', 'en']) for (const row of lenses.catalogues?.[locale]?.tracks ?? []) rows.push({ ...row, locale, contentId: row.id });

  const seen = new Set();
  const prepared = rows.map((row) => {
    const id = row.contentId ?? row.id;
    if (!['intro', 'story', 'caption', 'answer'].includes(row.kind) || !['vi', 'en'].includes(row.locale)
      || !/^[a-z0-9-]+$/.test(row.collectionId ?? '') || !/^[a-z0-9-]+$/.test(id ?? '')) {
      fail(`Unsupported active voice identity (${row.collectionId ?? 'no-collection'}/${row.locale ?? 'no-locale'}/${id ?? 'no-id'}/${row.kind ?? 'no-kind'})`);
    }
    const key = `${row.collectionId}/${row.locale}/${id}`;
    if (seen.has(key)) fail(`Duplicate active voice identity: ${key}`);
    seen.add(key);
    const resolved = resolveText({ ...row, contentId: id });
    const existingAudioPath = row.path ?? null;
    let existingAudioSha256 = null;
    if (existingAudioPath) {
      const oldBytes = fs.readFileSync(path.join(ROOT, existingAudioPath));
      existingAudioSha256 = sha256(oldBytes);
      if (row.audioSha256 && existingAudioSha256 !== row.audioSha256) fail(`Existing audio hash mismatch: ${existingAudioPath}`);
    }
    return {
      key, id, collectionId: row.collectionId, locale: row.locale, kind: row.kind,
      nodeId: row.nodeId ?? null, source: row.source, sourceDataSha256: sha256(resolved.raw),
      previousSourceDataSha256: row.sourceDataSha256 ?? null,
      sourceDataHashMatches: resolved.dataHashMatches,
      datasetRevision: row.datasetRevision, textHash: sha256(Buffer.from(resolved.text, 'utf8')),
      characters: resolved.characters, text: resolved.text,
      existingAudioPath, existingAudioSha256,
      outputPath: `mobile/assets/voice/demo-migration-v1/${row.collectionId}/${row.locale}/${id}.mp3`,
    };
  }).sort((a, b) => a.key.localeCompare(b.key));

  const counts = Object.fromEntries(['vi', 'en'].map((locale) => [locale, prepared.filter((row) => row.locale === locale).length]));
  if (prepared.length !== 198 || counts.vi !== 99 || counts.en !== 99) {
    fail(`Active catalogue inventory changed; found ${prepared.length} tracks (${counts.vi} VI, ${counts.en} EN)`);
  }
  return prepared;
}

function readEnvFile() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) fail('CONFIG_MISSING');
  const values = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, double, single) => double ?? single);
  }
  const key = values.ELEVENLABS_API_KEY;
  const voices = { vi: values.ELEVENLABS_VOICE_ID_VI, en: values.ELEVENLABS_VOICE_ID_EN };
  if (!key || voices.vi !== VOICES.vi || voices.en !== VOICES.en) fail('CONFIG_MISSING_OR_VOICE_ID_MISMATCH');
  return { key, voices };
}

async function request(pathname, key, options = {}) {
  const response = await fetch(`https://api.elevenlabs.io/v1/${pathname}`, {
    ...options,
    headers: { 'xi-api-key': key, accept: options.accept ?? 'application/json', ...options.headers },
  });
  return response;
}

async function preflight(rows) {
  const { key } = readEnvFile();
  const [subscriptionResponse, modelsResponse, viResponse, enResponse] = await Promise.all([
    request('user/subscription', key), request('models', key),
    request(`voices/${VOICES.vi}`, key), request(`voices/${VOICES.en}`, key),
  ]);
  if (![subscriptionResponse.status, modelsResponse.status, viResponse.status, enResponse.status].every((status) => status === 200)) {
    fail(`Provider preflight failed with HTTP ${[subscriptionResponse.status, modelsResponse.status, viResponse.status, enResponse.status].join('/')}`);
  }
  const [subscription, models, viVoice, enVoice] = await Promise.all([
    subscriptionResponse.json(), modelsResponse.json(), viResponse.json(), enResponse.json(),
  ]);
  const model = models.find((item) => item.model_id === MODEL);
  if (!model?.can_do_text_to_speech || !Array.isArray(model.languages)
    || !model.languages.some((item) => item.language_id === 'vi')
    || !model.languages.some((item) => item.language_id === 'en')) fail('Selected model does not support both locales');
  if (viVoice.voice_id !== VOICES.vi || enVoice.voice_id !== VOICES.en) fail('Selected voice ID verification failed');
  const available = subscription.character_limit - subscription.character_count;
  const estimate = rows.reduce((sum, row) => sum + row.characters, 0) * model.token_cost_factor
    * (model.model_rates?.character_cost_multiplier ?? 1) * (model.model_rates?.cost_discount_multiplier ?? 1);
  if (subscription.can_extend_character_limit !== false || (subscription.max_credit_limit_extension ?? 0) !== 0) {
    fail('Overage/credit extension is enabled or not verifiably disabled');
  }
  if (!Number.isFinite(available) || available < estimate + RESERVE) fail('Available balance does not cover the full run and 10,000-credit reserve');
  return {
    key, subscription, model, available, estimate,
    voiceNames: { vi: viVoice.name, en: enVoice.name },
  };
}

function splitText(text) {
  const chunks = [];
  let rest = text;
  while (Array.from(rest).length > MAX_CHUNK) {
    const chars = Array.from(rest);
    let cut = MAX_CHUNK;
    while (cut > 0 && !/\s/u.test(chars[cut - 1])) cut--;
    if (!cut) fail('Cannot split a long TTS segment safely');
    chunks.push(chars.slice(0, cut).join(''));
    rest = chars.slice(cut).join('');
  }
  if (rest) chunks.push(rest);
  if (chunks.join('') !== text || chunks.some((chunk) => !chunk.trim() || Array.from(chunk).length > MAX_CHUNK)) fail('Long-text split changed or dropped source characters');
  return chunks;
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function loadState(fingerprint) {
  if (!fs.existsSync(STATE_PATH)) return { fingerprint, status: 'in_progress', entries: {}, startedAt: new Date().toISOString() };
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  if (state.fingerprint !== fingerprint) fail('Existing progress belongs to a different frozen inventory');
  for (const entry of Object.values(state.entries ?? {})) {
    if (entry.status === 'requesting' || entry.status === 'outcome_unknown') fail('A paid request has an uncertain outcome; refusing to retry');
  }
  return state;
}

function mp3Header(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length < 16) fail('Audio file is empty or too short to contain an MP3 frame');
  let offset = 0;
  if (bytes.toString('ascii', 0, 3) === 'ID3') {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    offset = 10 + size + ((bytes[5] & 0x10) ? 10 : 0);
  }
  const maxOffset = Math.min(bytes.length - 4, offset + 16_384);
  const mpeg1Layer3Rates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRates = [44_100, 48_000, 32_000, 0];
  for (let i = offset; i <= maxOffset; i++) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (bytes[i + 1] >> 3) & 0x03;
    const layer = (bytes[i + 1] >> 1) & 0x03;
    const bitrateIndex = (bytes[i + 2] >> 4) & 0x0f;
    const sampleRateIndex = (bytes[i + 2] >> 2) & 0x03;
    if (version !== 0x03 || layer !== 0x01) continue;
    const bitrateKbps = mpeg1Layer3Rates[bitrateIndex];
    const sampleRate = sampleRates[sampleRateIndex];
    if (bitrateKbps && sampleRate) return { codec: 'mp3', sampleRate, bitrateKbps };
  }
  fail('No valid MPEG-1 Layer-III frame found in generated audio');
}

class BrowserDecoder {
  constructor() { this.profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ngoke-mp3-decode-')); this.files = new Map(); this.nextToken = 0; }
  async start() {
    if (!fs.existsSync(EDGE)) fail('No installed Edge MP3 decoder is available');
    this.server = http.createServer((req, res) => {
      const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
      if (pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(`<!doctype html><body><script>window.decodeAudioFromUrl=async(url)=>{const bytes=await(await fetch(url)).arrayBuffer();const context=new AudioContext();try{const audio=await context.decodeAudioData(bytes);return {durationSeconds:audio.duration,channels:audio.numberOfChannels}}finally{await context.close()}}</script></body>`);
        return;
      }
      const token = pathname.slice('/audio/'.length);
      const audioPath = this.files.get(token);
      if (pathname.startsWith('/audio/') && audioPath) {
        this.files.delete(token);
        res.writeHead(200, { 'content-type': 'audio/mpeg', 'content-length': fs.statSync(audioPath).size });
        fs.createReadStream(audioPath).pipe(res);
        return;
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
      try {
        const result = await this.send('Runtime.evaluate', { expression: 'typeof window.decodeAudioFromUrl', returnByValue: true });
        ready = result.result?.value === 'function';
      } catch {}
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!ready) fail('Headless browser decoder page did not become ready');
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.commandId; this.pending.set(id, [resolve, reject]);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
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

async function probe(file, decoder) {
  const header = mp3Header(file);
  if (header.sampleRate !== 44_100 || header.bitrateKbps !== 128) fail('MP3 does not match requested 44.1 kHz / 128 kbps format');
  const decoded = await decoder.decode(file);
  return { ...header, ...decoded };
}

async function accountSnapshot(key) {
  const response = await request('user/subscription', key);
  if (response.status !== 200) fail(`Subscription reconciliation failed with HTTP ${response.status}`);
  return response.json();
}

async function renderPart(row, part, partNumber, pre, state) {
  const id = `${row.key}#${partNumber}`;
  state.entries[id] = { status: 'requesting', reservedCharacters: Array.from(part).length, textHash: sha256(Buffer.from(part, 'utf8')) };
  saveState(state);
  const response = await request(`text-to-speech/${pre.voiceIds[row.locale]}?output_format=${FORMAT}`, pre.key, {
    method: 'POST', accept: 'audio/mpeg',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: part, model_id: MODEL, language_code: row.locale,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  const requestId = response.headers.get('request-id') ?? null;
  const costHeader = response.headers.get('character-cost');
  if (response.status !== 200) {
    state.entries[id] = { ...state.entries[id], status: 'outcome_unknown', httpStatus: response.status, requestId };
    saveState(state);
    fail(`TTS returned HTTP ${response.status}; no retry was attempted`);
  }
  if (!/^audio\/mpeg(?:;|$)/i.test(response.headers.get('content-type') ?? '')) {
    state.entries[id] = { ...state.entries[id], status: 'outcome_unknown', httpStatus: response.status, requestId };
    saveState(state); fail('TTS response did not identify itself as MP3 audio; no retry was attempted');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const cost = costHeader !== null && /^\d+$/.test(costHeader) ? Number(costHeader) : null;
  const attempt = { ...state.entries[id], status: 'received', httpStatus: response.status, requestId, characterCost: cost, audioSha256: sha256(bytes), bytes: bytes.length };
  if (!bytes.length || (cost === null) || cost > attempt.reservedCharacters) {
    state.entries[id] = { ...attempt, status: 'outcome_unknown' }; saveState(state);
    fail('TTS response lacked a safe audio/cost record; no retry was attempted');
  }
  state.entries[id] = attempt; saveState(state);
  return bytes;
}

async function generate(rows, pre) {
  const fingerprint = sha256(JSON.stringify(rows.map(({ key, textHash, characters, datasetRevision }) => ({ key, textHash, characters, datasetRevision }))));
  const state = loadState(fingerprint);
  if (state.status === 'complete' && fs.existsSync(MANIFEST_PATH) && fs.existsSync(CATALOG_PATH)) {
    process.stdout.write('migration already completed; no files or requests changed\n');
    return;
  }
  state.preflight = { tier: pre.subscription.tier, characterCount: pre.subscription.character_count, characterLimit: pre.subscription.character_limit,
    canExtendCharacterLimit: false, estimatedCredits: pre.estimate, reserveCredits: RESERVE, model: MODEL, voices: VOICES };
  state.voiceIds = VOICES;
  if (fs.existsSync(CATALOG_PATH)) fail('Migration catalogue target already exists; refusing to overwrite');
  if (!Object.keys(state.entries).length && rows.some((row) => fs.existsSync(path.join(ROOT, row.outputPath)))) fail('Migration output contains unexpected files; refusing to overwrite');
  fs.mkdirSync(OUT, { recursive: true });
  if (fs.existsSync(MANIFEST_PATH) && !state.status.startsWith('complete')) fail('A migration manifest already exists; refusing to overwrite');
  const decoder = new BrowserDecoder();
  try {
  await decoder.start();
  const smokePath = path.join(ROOT, rows[0].existingAudioPath);
  await probe(smokePath, decoder);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const target = path.join(ROOT, row.outputPath);
    const chunks = splitText(row.text);
    const completed = chunks.map((_, partIndex) => state.entries[`${row.key}#${partIndex}`]);
    if (completed.every((entry) => entry?.status === 'complete') && fs.existsSync(target)) {
      const quality = await probe(target, decoder);
      row.audioSha256 = sha256(fs.readFileSync(target)); row.bytes = fs.statSync(target).size;
      row.durationSeconds = quality.durationSeconds; row.codec = quality.codec; row.sampleRate = quality.sampleRate; row.channels = quality.channels;
      row.voiceId = pre.voiceIds[row.locale]; row.model = MODEL; row.outputFormat = FORMAT;
      row.requestIds = chunks.map((_, partIndex) => state.entries[`${row.key}#${partIndex}`].requestId);
      continue;
    }
    if (completed.some((entry) => entry && entry.status !== 'complete')) fail(`Track has an incomplete/uncertain request: ${row.key}`);
    if (fs.existsSync(target)) fail(`Unexpected existing output; refusing to overwrite ${row.outputPath}`);

    const chunkFiles = [];
    for (let partIndex = 0; partIndex < chunks.length; partIndex++) {
      const bytes = await renderPart(row, chunks[partIndex], partIndex, pre, state);
      const chunkPath = `${target}.part-${partIndex}.mp3`;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (fs.existsSync(chunkPath)) fail(`Unexpected partial audio exists: ${row.outputPath}`);
      fs.writeFileSync(chunkPath, bytes, { flag: 'wx' });
      const quality = await probe(chunkPath, decoder);
      const attempt = state.entries[`${row.key}#${partIndex}`];
      state.entries[`${row.key}#${partIndex}`] = { ...attempt, status: 'complete', ...quality };
      saveState(state);
      chunkFiles.push(chunkPath);
    }
    if (chunkFiles.length === 1) fs.renameSync(chunkFiles[0], target);
    else {
      const listPath = `${target}.concat.txt`;
      fs.writeFileSync(listPath, chunkFiles.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n', { flag: 'wx' });
      fail(`A long track requires an offline MP3 concatenator before paid generation: ${row.key}`);
      for (const file of chunkFiles) fs.unlinkSync(file);
      fs.unlinkSync(listPath);
    }
    const quality = await probe(target, decoder);
    row.audioSha256 = sha256(fs.readFileSync(target)); row.bytes = fs.statSync(target).size;
    row.durationSeconds = quality.durationSeconds; row.codec = quality.codec; row.sampleRate = quality.sampleRate; row.channels = quality.channels;
    row.voiceId = pre.voiceIds[row.locale]; row.model = MODEL; row.outputFormat = FORMAT;
    row.requestIds = chunks.map((_, partIndex) => state.entries[`${row.key}#${partIndex}`].requestId);
    process.stdout.write(`generated ${index + 1}/${rows.length} ${row.key} (${row.characters} chars)\n`);
  }
  const totalCost = Object.values(state.entries).reduce((sum, entry) => sum + (entry.status === 'complete' ? entry.characterCost : 0), 0);
  const closing = await accountSnapshot(pre.key);
  if (closing.can_extend_character_limit !== false || closing.character_count - pre.subscription.character_count !== totalCost) {
    state.status = 'billing_reconciliation_blocked'; state.closingAccount = { characterCount: closing.character_count, limit: closing.character_limit, canExtend: closing.can_extend_character_limit };
    saveState(state); fail('Final account delta does not reconcile with paid request costs; catalogue integration is blocked');
  }
  if (closing.character_limit - closing.character_count < RESERVE) fail('Closing balance violates the 10,000-credit reserve');
  await install(rows, { pre, closing, totalCost, fingerprint }, decoder);
  state.status = 'complete'; state.completedAt = new Date().toISOString(); state.totalCost = totalCost; state.closingAccount = { characterCount: closing.character_count, characterLimit: closing.character_limit, remainingCredits: closing.character_limit - closing.character_count, canExtendCharacterLimit: false };
  saveState(state);
  process.stdout.write(`complete ${rows.length} tracks; observed cost ${totalCost}; remaining ${closing.character_limit - closing.character_count}\n`);
  } finally {
    await decoder.close();
  }
}

async function install(rows, billing, decoder) {
  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  const entries = await Promise.all(rows.map(async (row) => {
    const asset = path.join(ROOT, row.outputPath);
    const quality = decoder ? await probe(asset, decoder) : {
      codec: row.codec, sampleRate: row.sampleRate, bitrateKbps: row.bitrateKbps,
      durationSeconds: row.durationSeconds, channels: row.channels,
    };
    if (quality.codec !== 'mp3' || quality.sampleRate !== 44_100 || quality.bitrateKbps !== 128
      || !Number.isFinite(quality.durationSeconds) || quality.durationSeconds <= 0
      || !Number.isInteger(quality.channels)) fail(`Audio quality record is incomplete: ${row.key}`);
    const cost = row.requestIds.reduce((sum, requestId) => {
      const part = Object.values(state.entries).find((entry) => entry.requestId === requestId);
      return sum + (part?.characterCost ?? 0);
    }, 0);
    return { ...row, characterCost: cost, humanApproved: false, listened: false, selectedForShipping: false,
      path: row.outputPath, codec: quality.codec, sampleRateHz: quality.sampleRate, bitrateKbps: quality.bitrateKbps, fullDecode: true,
      sourceOnly: true };
  }));
  const manifest = {
    schemaVersion: 1, scope: 'demo-voice-migration-v1', status: billing.deltaMismatch ? 'source-only-billing-delta-mismatch' : 'source-only',
    billingReconciled: !billing.deltaMismatch, billingDeltaMismatchCredits: billing.deltaMismatch,
    subscriptionNetChangeCredits: billing.accountDelta, humanApproved: false, listened: false,
    selectedForShipping: false, model: MODEL, voiceIds: billing.pre.voiceIds, voiceNames: billing.pre.voiceNames,
    outputFormat: FORMAT, estimatedCredits: billing.pre.estimate, observedCredits: billing.totalCost,
    reserveCredits: RESERVE, initialAccountCharacterCount: billing.pre.subscription.character_count,
    closingAccount: { tier: billing.closing.tier, characterCount: billing.closing.character_count,
      characterLimit: billing.closing.character_limit, remainingCredits: billing.closing.character_limit - billing.closing.character_count,
      canExtendCharacterLimit: false },
    counts: { vi: entries.filter((row) => row.locale === 'vi').length, en: entries.filter((row) => row.locale === 'en').length, total: entries.length },
    entries: entries.map(({ text, ...row }) => row),
  };
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });

  const groups = {};
  for (const row of entries) {
    groups[row.collectionId] ??= {};
    const locale = row.locale;
    groups[row.collectionId][locale] ??= { datasetRevision: row.datasetRevision, tracks: {} };
    if (groups[row.collectionId][locale].datasetRevision !== row.datasetRevision) fail(`Mixed revisions for ${row.collectionId}/${locale}`);
    groups[row.collectionId][locale].tracks[row.id] = {
      id: row.id, kind: row.kind, ...(row.nodeId ? { nodeId: row.nodeId } : {}),
      source: `require('../../assets/voice/demo-migration-v1/${row.collectionId}/${row.locale}/${row.id}.mp3')`,
      textHash: row.textHash, durationSeconds: row.durationSeconds,
    };
  }
  const lines = [
    "/* eslint-disable @typescript-eslint/no-require-imports -- Metro needs statically analyzable asset requires. */",
    "import type { Locale } from '../data/locale';",
    "import type { VoiceTrack } from './catalog';",
    '',
    '/* Generated by tools/voice/migrate_demo_voice_v1.mjs; humanApproved=false. */',
    'export const demoVoiceMigrationV1Catalogues: Record<string, Partial<Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }>>> = {',
  ];
  for (const collection of Object.keys(groups).sort()) {
    lines.push(`  ${JSON.stringify(collection)}: {`);
    for (const locale of ['en', 'vi']) {
      const group = groups[collection][locale]; if (!group) continue;
      lines.push(`    ${locale}: { datasetRevision: ${JSON.stringify(group.datasetRevision)}, tracks: {`);
      for (const id of Object.keys(group.tracks).sort()) {
        const track = group.tracks[id];
        lines.push(`      ${JSON.stringify(id)}: { id: ${JSON.stringify(track.id)}, kind: ${JSON.stringify(track.kind)}${track.nodeId ? `, nodeId: ${JSON.stringify(track.nodeId)}` : ''}, source: ${track.source}, textHash: ${JSON.stringify(track.textHash)}, durationSeconds: ${track.durationSeconds} },`);
      }
      lines.push('    } },');
    }
    lines.push('  },');
  }
  lines.push('};', '');
  fs.writeFileSync(CATALOG_PATH, lines.join('\n'), { flag: 'wx' });
}

async function main() {
  const rows = readInventory();
  const estimate = rows.reduce((sum, row) => sum + row.characters, 0);
  const max = Math.max(...rows.map((row) => row.characters));
  if (rows.some((row) => row.characters > MAX_CHUNK)) fail('A track exceeds Eleven v3 request size; no paid call is made until MP3 concatenation is configured');
  const fingerprint = sha256(JSON.stringify(rows.map(({ key, textHash, characters, datasetRevision }) => ({ key, textHash, characters, datasetRevision }))));
  if (process.argv.includes('--decoder-check')) {
    const decoder = new BrowserDecoder();
    try {
      await decoder.start();
      const sample = await probe(path.join(ROOT, rows[0].existingAudioPath), decoder);
      process.stdout.write(JSON.stringify({ mode: 'local decoder check', fullDecode: true, ...sample }, null, 2) + '\n');
    } finally { await decoder.close(); }
    return;
  }
  if (process.argv.includes('--finalize')) {
    await finalize(rows, fingerprint);
    return;
  }
  if (process.argv.includes('--dry-run')) {
    process.stdout.write(JSON.stringify({ mode: 'offline inventory only', tracks: rows.length,
      byLocale: { vi: rows.filter((row) => row.locale === 'vi').length, en: rows.filter((row) => row.locale === 'en').length },
      characters: estimate, estimatedCreditsAtOnePerCharacter: estimate, maxTrackCharacters: max,
      voiceIds: VOICES, model: MODEL, fingerprint, outputPathExists: fs.existsSync(OUT),
      oldAudioFilesToReplace: rows.filter((row) => row.existingAudioPath).length,
      sourceDataHashMismatches: rows.filter((row) => !row.sourceDataHashMatches).length,
      mismatchedSourceFiles: [...new Set(rows.filter((row) => !row.sourceDataHashMatches).map((row) => row.source))],
      manifestPathExists: fs.existsSync(MANIFEST_PATH), catalogPathExists: fs.existsSync(CATALOG_PATH) }, null, 2) + '\n');
    return;
  }
  const pre = await preflight(rows);
  process.stdout.write(JSON.stringify({ mode: process.argv.includes('--generate') ? 'paid generation authorized' : 'non-billable preflight',
    tracks: rows.length, characters: estimate, estimatedCredits: pre.estimate, availableCredits: pre.available,
    reserveCredits: RESERVE, projectedRemainingCredits: pre.available - pre.estimate,
    tier: pre.subscription.tier, characterLimit: pre.subscription.character_limit,
    canExtendCharacterLimit: false, model: MODEL, voiceIds: VOICES, voiceNames: pre.voiceNames,
    modelSupportsVietnameseAndEnglish: true, fingerprint }, null, 2) + '\n');
  if (process.argv.includes('--generate')) await generate(rows, { ...pre, voiceIds: VOICES });
}

async function finalize(rows, fingerprint) {
  const state = loadState(fingerprint);
  if ((state.status === 'complete' || state.status === 'installed_billing_delta_mismatch')
      && fs.existsSync(MANIFEST_PATH) && fs.existsSync(CATALOG_PATH)) {
    process.stdout.write('migration catalogue already installed; no provider requests made\n'); return;
  }
  if (fs.existsSync(MANIFEST_PATH) || fs.existsSync(CATALOG_PATH)) fail('A finalization target already exists; refusing to overwrite');
  if (Object.keys(state.entries).length !== rows.length || Object.values(state.entries).some((entry) => entry.status !== 'complete')) {
    fail('Not every paid request is complete; finalization is blocked');
  }
  if (state.voiceIds?.vi !== VOICES.vi || state.voiceIds?.en !== VOICES.en
    || state.preflight?.voices?.vi !== VOICES.vi || state.preflight?.voices?.en !== VOICES.en
    || state.preflight?.model !== MODEL) fail('Saved voice/model identity does not match this migration');
  for (const row of rows) {
    const part = state.entries[`${row.key}#0`];
    const asset = path.join(ROOT, row.outputPath);
    if (!part || !fs.existsSync(asset) || sha256(fs.readFileSync(asset)) !== part.audioSha256
      || part.codec !== 'mp3' || part.sampleRate !== 44_100 || part.bitrateKbps !== 128
      || part.textHash !== row.textHash || !part.requestId
      || part.bytes !== fs.statSync(asset).size || !Number.isFinite(part.characterCost)
      || !Number.isFinite(part.durationSeconds) || part.durationSeconds <= 0 || !Number.isInteger(part.channels)) {
      fail(`Completed audio integrity record does not match its saved asset: ${row.key}`);
    }
    row.audioSha256 = part.audioSha256; row.bytes = fs.statSync(asset).size;
    row.durationSeconds = part.durationSeconds; row.codec = part.codec;
    row.sampleRate = part.sampleRate; row.channels = part.channels; row.bitrateKbps = part.bitrateKbps;
    row.voiceId = VOICES[row.locale]; row.model = MODEL; row.outputFormat = FORMAT;
    row.requestIds = [part.requestId];
  }
  const savedClosing = state.closingAccount;
  if (!Number.isInteger(savedClosing?.characterCount) || !Number.isInteger(savedClosing?.limit)
    || savedClosing?.canExtend !== false || savedClosing.limit !== state.preflight.characterLimit
    || savedClosing.limit - savedClosing.characterCount < RESERVE) {
    fail('Saved closing account snapshot is missing, inconsistent, or below the 10,000-credit reserve');
  }
  const closing = { tier: state.preflight.tier, character_count: savedClosing.characterCount,
    character_limit: savedClosing.limit, can_extend_character_limit: savedClosing.canExtend };
  const startCount = state.preflight?.characterCount;
  if (!Number.isInteger(startCount)) fail('Original account snapshot is missing; billing cannot be reported safely');
  if (state.preflight.characterLimit - startCount < state.preflight.estimatedCredits + RESERVE) {
    fail('Saved initial account snapshot does not cover the estimate and reserve');
  }
  const headerCost = Object.values(state.entries).reduce((sum, entry) => sum + entry.characterCost, 0);
  const accountDelta = closing.character_count - startCount;
  if (accountDelta < 0 || headerCost > state.preflight.characterLimit - startCount) fail('Account delta or response costs exceed the verified original balance');
  const deltaMismatch = headerCost - accountDelta;
  const pre = {
    subscription: { tier: state.preflight.tier, character_count: startCount, character_limit: state.preflight.characterLimit },
    estimate: state.preflight.estimatedCredits, voiceIds: VOICES,
    voiceNames: { vi: 'Nhật Phong - Narrative & Compelling', en: 'Talia - Warm Soft Guide' },
  };
  const billing = { pre, closing, totalCost: headerCost, accountDelta, deltaMismatch };
  // The complete journal contains successful decodeAudioData results from generation.
  // Each current asset was just re-hashed against that exact decoded file; do not require
  // another browser launch (or any provider request) to finalize a byte-identical asset.
  await install(rows, billing, null);
  state.status = deltaMismatch === 0 ? 'complete' : 'installed_billing_delta_mismatch';
  state.completedAt = new Date().toISOString(); state.totalCost = headerCost;
  state.subscriptionNetChangeCredits = accountDelta; state.billingDeltaMismatchCredits = deltaMismatch;
  saveState(state);
  process.stdout.write(JSON.stringify({ tracks: rows.length, responseCharacterCostSum: headerCost,
    subscriptionNetChange: accountDelta, unexplainedDifference: deltaMismatch,
    remainingCredits: closing.character_limit - closing.character_count,
    billingReconciled: deltaMismatch === 0, catalogueInstalled: true }, null, 2) + '\n');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
