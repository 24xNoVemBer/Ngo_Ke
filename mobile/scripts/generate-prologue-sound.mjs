/**
 * Synthesis script for Prologue journey opening sound effect.
 * Generates a short, gentle wooden opening resonance accompanied by warm arpeggio chimes (~0.50s).
 *
 * Characteristics:
 * - Format: 16-bit PCM WAV, 22050 Hz, Mono
 * - Duration: 500ms (completes naturally before <=650ms navigation)
 * - Peak amplitude: restrained (~0.38 / -8.4 dBFS)
 * - Deterministic: fixed-seed pseudo-random generator guarantees identical output bytes
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
const DURATION_SEC = 0.50;
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

const samples = new Float32Array(NUM_SAMPLES);

// Deterministic Linear Congruential Generator (LCG) for reproducible noise texture
let seed = 42;
function seededRandom() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

// 1. Gentle wooden opening / whoosh resonance (180 Hz - 260 Hz with soft decay)
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  if (t < 0.25) {
    // Sliding frequency mimicking wooden latch / door swing
    const freq = 240 - t * 140;
    const env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) / 0.07);
    const tone = Math.sin(2 * Math.PI * freq * t) * 0.22;

    // Subtle soft friction / air texture using deterministic seeded noise
    const noise = (seededRandom() * 2 - 1) * 0.035;
    samples[i] += (tone + noise) * env;
  }
}

// 2. Warm major arpeggio chime cascade ("door to discovery")
// Notes: C5 (523 Hz), E5 (659 Hz), G5 (784 Hz), C6 (1046 Hz)
const chimes = [
  { freq: 523.25, start: 0.03, amp: 0.18, decay: 0.18 },
  { freq: 659.25, start: 0.08, amp: 0.16, decay: 0.16 },
  { freq: 783.99, start: 0.13, amp: 0.15, decay: 0.15 },
  { freq: 1046.50, start: 0.18, amp: 0.14, decay: 0.18 },
];

for (const chime of chimes) {
  const startIndex = Math.floor(chime.start * SAMPLE_RATE);
  for (let i = startIndex; i < NUM_SAMPLES; i++) {
    const tNote = (i - startIndex) / SAMPLE_RATE;
    // 5ms smooth attack to prevent click, then exponential decay
    const attack = Math.min(1, tNote / 0.005);
    const env = attack * Math.exp(-tNote / chime.decay);

    // Fundamental + subtle warm harmonics (2nd at 0.18x, 3rd at 0.06x)
    const fundamental = Math.sin(2 * Math.PI * chime.freq * tNote);
    const harmonic2 = Math.sin(2 * Math.PI * chime.freq * 2 * tNote) * 0.18;
    const harmonic3 = Math.sin(2 * Math.PI * chime.freq * 3 * tNote) * 0.06;

    samples[i] += (fundamental + harmonic2 + harmonic3) * env * chime.amp;
  }
}

// 3. Normalization, soft limiter, and fade-out to zero
let maxAmp = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const abs = Math.abs(samples[i]);
  if (abs > maxAmp) maxAmp = abs;
}

const TARGET_PEAK = 0.38; // Restrained volume (~ -8.4 dBFS)
const gain = maxAmp > 0 ? TARGET_PEAK / maxAmp : 1;

// Master fade out in last 100ms (0.40s - 0.50s) to ensure absolute silence at finish
const fadeOutStart = Math.floor((DURATION_SEC - 0.10) * SAMPLE_RATE);
const buffer = Buffer.alloc(44 + NUM_SAMPLES * 2);

// Write WAV Header (44 bytes)
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + NUM_SAMPLES * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
buffer.writeUInt16LE(2, 32); // BlockAlign (NumChannels * BitsPerSample/8)
buffer.writeUInt16LE(16, 34); // BitsPerSample
buffer.write('data', 36);
buffer.writeUInt32LE(NUM_SAMPLES * 2, 40);

for (let i = 0; i < NUM_SAMPLES; i++) {
  let s = samples[i] * gain;
  if (i > fadeOutStart) {
    const fade = 1 - (i - fadeOutStart) / (NUM_SAMPLES - fadeOutStart);
    s *= fade;
  }
  // Soft clip protection
  s = Math.max(-1, Math.min(1, s));
  const intSample = Math.round(s * 32767);
  buffer.writeInt16LE(intSample, 44 + i * 2);
}

const outputPath = join(__dirname, '../assets/sounds/prologue_door.wav');
writeFileSync(outputPath, buffer);

console.log(`Generated: ${outputPath} (${buffer.length} bytes, ${(DURATION_SEC).toFixed(2)}s, peak: ${(TARGET_PEAK).toFixed(2)})`);
