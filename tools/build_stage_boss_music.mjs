import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = resolve(ROOT, "public/audio/music");
const SAMPLE_RATE = 22_050;
const TWO_PI = Math.PI * 2;

const clamp = value => Math.max(-1, Math.min(1, value));
const midi = note => 440 * 2 ** ((note - 69) / 12);
const sine = phase => Math.sin(TWO_PI * phase);
const triangle = phase => 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1;

function seededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 0xffff_ffff) * 2 - 1;
  };
}

function noteEnvelope(position, length, attack = 0.012, release = 0.08) {
  if (position < 0 || position >= length) return 0;
  return Math.min(1, position / attack, (length - position) / release);
}

function loopEnvelope(time, duration) {
  const edge = 0.008;
  return Math.min(1, time / edge, (duration - time) / edge);
}

function renderTrack({ tempoBpm, bars, seed, melody, bass, drums, harmony }) {
  const beat = 60 / tempoBpm;
  const duration = beat * 4 * bars;
  const sampleCount = Math.round(duration * SAMPLE_RATE);
  const noise = seededNoise(seed);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE;
    const beatPosition = time / beat;
    const eighth = Math.floor(beatPosition * 2);
    const localEighth = (beatPosition * 2 - eighth) * beat / 2;
    const quarter = Math.floor(beatPosition);
    const localQuarter = (beatPosition - quarter) * beat;
    const bar = Math.floor(beatPosition / 4);
    const localBarBeat = beatPosition % 4;

    const melodyNote = melody[eighth % melody.length];
    const melodyFrequency = midi(melodyNote);
    const melodyAmp = noteEnvelope(localEighth, beat * 0.5, 0.018, 0.07);
    const lead = (
      triangle(melodyFrequency * time) * 0.2
      + sine(melodyFrequency * 2 * time) * 0.055
    ) * melodyAmp;

    const bassNote = bass[quarter % bass.length];
    const bassFrequency = midi(bassNote);
    const bassAmp = noteEnvelope(localQuarter, beat, 0.012, 0.12);
    const low = (
      triangle(bassFrequency * time) * 0.19
      + sine(bassFrequency * 0.5 * time) * 0.08
    ) * bassAmp;

    const chord = harmony[bar % harmony.length];
    const chordAmp = noteEnvelope(localBarBeat * beat, beat * 4, 0.08, 0.24);
    const pad = chord.reduce((sum, note) => (
      sum + sine(midi(note) * time) * 0.045 + triangle(midi(note) * 0.5 * time) * 0.018
    ), 0) * chordAmp;

    const beatIndex = Math.floor(beatPosition) % 4;
    const kick = (beatIndex === 0 || beatIndex === 2)
      ? sine((72 - localQuarter * 34) * time) * 0.3 * Math.exp(-localQuarter * 18)
      : 0;
    const snare = (beatIndex === 1 || beatIndex === 3)
      ? noise() * 0.18 * Math.exp(-localQuarter * 24)
      : 0;
    const hatPosition = localEighth;
    const hat = drums * noise() * 0.08 * Math.exp(-hatPosition * 70);

    samples[index] = clamp((lead + low + pad + kick + snare + hat) * loopEnvelope(time, duration));
  }
  return { duration, samples };
}

const tracks = {
  "stage-bamboo": {
    id: "stage",
    description: "Measured pentatonic bamboo-stage march with restrained arcade percussion.",
    tempoBpm: 112,
    bars: 8,
    seed: 0x7b3101,
    melody: [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 74, 81, 79, 76, 74, 72],
    bass: [45, 45, 48, 48, 50, 50, 48, 43],
    harmony: [[57, 60, 64], [60, 64, 67], [62, 65, 69], [55, 60, 62]],
    drums: 0.55,
  },
  "boss-warlord": {
    id: "boss",
    description: "Urgent war-drum boss ostinato with a darker minor pentatonic lead.",
    tempoBpm: 144,
    bars: 8,
    seed: 0x7b0550,
    melody: [62, 65, 67, 68, 67, 65, 62, 60, 62, 67, 70, 68, 67, 65, 62, 58],
    bass: [38, 38, 41, 38, 43, 41, 38, 36],
    harmony: [[50, 53, 57], [48, 53, 55], [46, 50, 53], [43, 48, 50]],
    drums: 0.9,
  },
};

function encodeWav(samples) {
  const dataSize = samples.length * 2;
  const output = Buffer.alloc(44 + dataSize);
  output.write("RIFF", 0);
  output.writeUInt32LE(36 + dataSize, 4);
  output.write("WAVE", 8);
  output.write("fmt ", 12);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(SAMPLE_RATE, 24);
  output.writeUInt32LE(SAMPLE_RATE * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write("data", 36);
  output.writeUInt32LE(dataSize, 40);
  samples.forEach((sample, index) => {
    output.writeInt16LE(Math.round(clamp(sample) * 32_767), 44 + index * 2);
  });
  return output;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const assets = [];
for (const [name, recipe] of Object.entries(tracks)) {
  const { duration, samples } = renderTrack(recipe);
  const wav = encodeWav(samples);
  const filename = `${name}.wav`;
  await writeFile(resolve(OUTPUT_DIR, filename), wav);
  assets.push({
    id: recipe.id,
    filename,
    description: recipe.description,
    durationMs: Math.round(duration * 1000),
    loopStartMs: 0,
    loopEndMs: Math.round(duration * 1000),
    tempoBpm: recipe.tempoBpm,
    bars: recipe.bars,
    sampleRate: SAMPLE_RATE,
    channels: 1,
    bitDepth: 16,
    encoding: "PCM WAV",
    sha256: createHash("sha256").update(wav).digest("hex"),
  });
}

const metadata = {
  set: "stage-boss-music",
  version: 1,
  generatedAt: "2026-07-24",
  author: "OpenAI Codex for the Three Kingdoms project",
  license: "Original project-owned procedural composition and synthesis; no third-party samples or recordings.",
  source: "tools/build_stage_boss_music.mjs",
  processing: "Deterministic oscillator/noise synthesis, mono 16-bit PCM WAV at 22050 Hz; full-file zero-crossing-safe loops.",
  assets,
};
await writeFile(
  resolve(OUTPUT_DIR, "stage-boss-music.metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);
