/**
 * Synthesis script for Prologue journey opening sound effect.
 * Generates an original rich "enter another world / portal into exploration" cue (~1.10s).
 *
 * Sound Architecture:
 * 1. Quiet inward suction / air swell (0.00s - 0.28s): filtered rising air texture & resonant threshold sweep
 * 2. Warm expanding harmonic reveal (0.22s - 0.75s): open resonant chord (D3, A3, D4, F#4, A4, E5) with lower-mid warmth
 * 3. Airy shimmering resonant tail (0.50s - 1.10s): delicate luminous harmonics with soft multi-tap diffusion,
 *    smoothly fading to complete silence by 1.10s before the ~1.2s navigation transition.
 *
 * Characteristics:
 * - Format: 16-bit PCM WAV, 22050 Hz, Mono
 * - Duration: 1.10s (~48.5 KB)
 * - Peak amplitude: restrained (~0.42 / -7.5 dBFS), normalized without clipping
 * - Deterministic: fixed-seed LCG generator guarantees 100% reproducible byte output
 * - Zero external dependencies; reproducible from standard Node.js
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Buffer } from 'node:buffer';
import console from 'node:console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SAMPLE_RATE = 22050;
const DURATION_SEC = 1.10;
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

const samples = new Float32Array(NUM_SAMPLES);

// Deterministic Linear Congruential Generator (LCG) for reproducible noise texture
let seed = 10172026;
function seededRandom() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

// Low-pass filtered noise state for smooth air swell
let noiseFilterState = 0;
function filteredNoise(alpha) {
  const white = seededRandom() * 2 - 1;
  noiseFilterState += alpha * (white - noiseFilterState);
  return noiseFilterState;
}

// 1. Quiet inward suction / air swell (0.00s -> 0.28s)
const SWELL_END = 0.28;
for (let i = 0; i < Math.floor(SWELL_END * SAMPLE_RATE); i++) {
  const t = i / SAMPLE_RATE;
  // Rising curve mimicking an intake of breath / door unlatching into space
  const progress = t / SWELL_END;
  const env = Math.pow(progress, 2.2) * 0.28;

  // Rising resonant frequency from 160 Hz to 440 Hz
  const freq = 160 + progress * 280;
  const sweepTone = Math.sin(2 * Math.PI * freq * t) * 0.16;
  const airTexture = filteredNoise(0.12) * 0.24;

  samples[i] += (sweepTone + airTexture) * env;
}

// 2. Warm expanding harmonic reveal (0.22s -> 0.85s)
// Open D-major 9th voicing: D3 (146.83 Hz), A3 (220.0 Hz), D4 (293.66 Hz), F#4 (369.99 Hz), A4 (440.0 Hz), E5 (659.25 Hz)
const harmonics = [
  // Low-mid warm foundation (audible on phone speaker)
  { freq: 146.83, start: 0.22, amp: 0.26, decay: 0.55, attackMs: 35 },
  { freq: 220.00, start: 0.23, amp: 0.22, decay: 0.50, attackMs: 30 },
  { freq: 293.66, start: 0.24, amp: 0.20, decay: 0.45, attackMs: 25 },
  // Luminous chord colors
  { freq: 369.99, start: 0.25, amp: 0.18, decay: 0.42, attackMs: 20 },
  { freq: 440.00, start: 0.26, amp: 0.16, decay: 0.40, attackMs: 18 },
  { freq: 659.25, start: 0.28, amp: 0.14, decay: 0.38, attackMs: 15 },
];

for (const voice of harmonics) {
  const startIndex = Math.floor(voice.start * SAMPLE_RATE);
  const attackSamples = Math.floor((voice.attackMs / 1000) * SAMPLE_RATE);

  for (let i = startIndex; i < NUM_SAMPLES; i++) {
    const tNote = (i - startIndex) / SAMPLE_RATE;
    const noteIndex = i - startIndex;
    const attack = noteIndex < attackSamples ? noteIndex / attackSamples : 1;
    const env = attack * Math.exp(-tNote / voice.decay);

    // Fundamental + subtle organic octave harmonics
    const fundamental = Math.sin(2 * Math.PI * voice.freq * tNote);
    const harmonic2 = Math.sin(2 * Math.PI * voice.freq * 2 * tNote) * 0.15;
    const harmonic3 = Math.sin(2 * Math.PI * voice.freq * 3 * tNote) * 0.05;

    samples[i] += (fundamental + harmonic2 + harmonic3) * env * voice.amp;
  }
}

// 3. Airy shimmering resonant tail / high shimmer (0.35s -> 1.05s)
const shimmers = [
  { freq: 880.00, start: 0.30, amp: 0.09, decay: 0.38 },
  { freq: 1174.66, start: 0.34, amp: 0.08, decay: 0.35 },
  { freq: 1479.98, start: 0.38, amp: 0.06, decay: 0.32 },
  { freq: 1760.00, start: 0.42, amp: 0.04, decay: 0.28 },
];

for (const shim of shimmers) {
  const startIndex = Math.floor(shim.start * SAMPLE_RATE);
  for (let i = startIndex; i < NUM_SAMPLES; i++) {
    const tNote = (i - startIndex) / SAMPLE_RATE;
    const attack = Math.min(1, tNote / 0.015);
    const env = attack * Math.exp(-tNote / shim.decay);
    // Slight vibrato / chorusing on shimmer for atmospheric depth
    const mod = Math.sin(2 * Math.PI * 4.5 * tNote) * 1.5;
    const tone = Math.sin(2 * Math.PI * (shim.freq + mod) * tNote);
    samples[i] += tone * env * shim.amp;
  }
}

// 4. Soft multi-tap diffusion / short reverb reflections
const reflections = [
  { delayMs: 42, gain: 0.20 },
  { delayMs: 88, gain: 0.13 },
  { delayMs: 142, gain: 0.08 },
];

for (const ref of reflections) {
  const delaySamples = Math.floor((ref.delayMs / 1000) * SAMPLE_RATE);
  for (let i = delaySamples; i < NUM_SAMPLES; i++) {
    samples[i] += samples[i - delaySamples] * ref.gain;
  }
}

// 5. Normalization, soft limiter, and natural tail fade-out
let maxAmp = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const abs = Math.abs(samples[i]);
  if (abs > maxAmp) maxAmp = abs;
}

const TARGET_PEAK = 0.42; // Restrained volume (~ -7.5 dBFS)
const gain = maxAmp > 0 ? TARGET_PEAK / maxAmp : 1;

// Master fade out in last 140ms (0.96s - 1.10s) ensuring complete silence before navigation
const fadeOutStart = Math.floor((DURATION_SEC - 0.14) * SAMPLE_RATE);
const buffer = Buffer.alloc(44 + NUM_SAMPLES * 2);

// Write standard WAV Header (44 bytes)
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + NUM_SAMPLES * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate
buffer.writeUInt16LE(2, 32); // BlockAlign
buffer.writeUInt16LE(16, 34); // BitsPerSample
buffer.write('data', 36);
buffer.writeUInt32LE(NUM_SAMPLES * 2, 40);

for (let i = 0; i < NUM_SAMPLES; i++) {
  let s = samples[i] * gain;
  if (i > fadeOutStart) {
    const fade = 1 - (i - fadeOutStart) / (NUM_SAMPLES - fadeOutStart);
    // Smooth cosine fade
    s *= 0.5 * (1 + Math.cos(Math.PI * (1 - fade)));
  }
  // Soft limiter (tanh curve) to prevent any digital harshness
  s = Math.tanh(s * 1.05) / 1.05;
  const intSample = Math.round(s * 32767);
  buffer.writeInt16LE(intSample, 44 + i * 2);
}

const outputPath = join(__dirname, '../assets/sounds/prologue_door.wav');
writeFileSync(outputPath, buffer);

console.log(`Generated: ${outputPath} (${buffer.length} bytes, ${(DURATION_SEC).toFixed(2)}s, peak: ${(TARGET_PEAK).toFixed(2)})`);
