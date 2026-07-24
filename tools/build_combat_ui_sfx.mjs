import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = resolve(ROOT, "public/audio/sfx");
const SAMPLE_RATE = 22_050;
const TWO_PI = Math.PI * 2;

const clamp = value => Math.max(-1, Math.min(1, value));
const fade = (time, duration, attack = 0.004, release = 0.04) => (
  Math.min(1, time / attack, (duration - time) / release)
);
const sine = (frequency, time) => Math.sin(TWO_PI * frequency * time);
const square = (frequency, time) => (sine(frequency, time) >= 0 ? 1 : -1);
const saw = (frequency, time) => 2 * ((frequency * time) % 1) - 1;

function seededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 0xffff_ffff) * 2 - 1;
  };
}

function render(duration, seed, sample) {
  const length = Math.ceil(duration * SAMPLE_RATE);
  const noise = seededNoise(seed);
  return Float32Array.from({ length }, (_, index) => {
    const time = index / SAMPLE_RATE;
    return clamp(sample(time, duration, noise) * fade(time, duration));
  });
}

const recipes = {
  "player-attack": {
    duration: 0.19,
    description: "Short blade whoosh with a descending body tone.",
    render: () => render(0.19, 0x71a1, (t, d, noise) => {
      const sweep = 980 - 760 * (t / d);
      return noise() * 0.42 * Math.exp(-t * 18) + sine(sweep, t) * 0.26 * Math.exp(-t * 9);
    }),
  },
  "hit-confirmed": {
    duration: 0.15,
    description: "Dry impact crack layered over a low arcade thump.",
    render: () => render(0.15, 0x71a2, (t, _d, noise) => (
      noise() * 0.55 * Math.exp(-t * 38) + sine(105 - t * 260, t) * 0.55 * Math.exp(-t * 17)
    )),
  },
  "player-hurt": {
    duration: 0.24,
    description: "Descending rough two-tone player hurt cue.",
    render: () => render(0.24, 0x71a3, (t, d, noise) => {
      const frequency = 285 - 150 * (t / d);
      return saw(frequency, t) * 0.3 + sine(frequency * 0.5, t) * 0.25 + noise() * 0.08;
    }),
  },
  "enemy-death": {
    duration: 0.42,
    description: "Low descending enemy defeat burst.",
    render: () => render(0.42, 0x71a4, (t, d, noise) => {
      const frequency = 190 - 125 * (t / d);
      return saw(frequency, t) * 0.24 + sine(frequency * 0.5, t) * 0.34 + noise() * 0.12 * Math.exp(-t * 5);
    }),
  },
  "ui-start": {
    duration: 0.25,
    description: "Two-note upward title confirmation chime.",
    render: () => render(0.25, 0x71a5, t => {
      const frequency = t < 0.11 ? 440 : 660;
      return square(frequency, t) * 0.12 + sine(frequency, t) * 0.34;
    }),
  },
  "ui-pause": {
    duration: 0.16,
    description: "Compact descending pause signal.",
    render: () => render(0.16, 0x71a6, t => {
      const frequency = t < 0.075 ? 440 : 330;
      return square(frequency, t) * 0.1 + sine(frequency, t) * 0.3;
    }),
  },
  "ui-resume": {
    duration: 0.16,
    description: "Compact ascending resume signal.",
    render: () => render(0.16, 0x71a7, t => {
      const frequency = t < 0.075 ? 330 : 440;
      return square(frequency, t) * 0.1 + sine(frequency, t) * 0.3;
    }),
  },
  "ui-failure": {
    duration: 0.55,
    description: "Three descending minor arcade failure tones.",
    render: () => render(0.55, 0x71a8, t => {
      const notes = [330, 277.18, 220];
      const frequency = notes[Math.min(2, Math.floor(t / 0.18))];
      return saw(frequency, t) * 0.12 + sine(frequency, t) * 0.3;
    }),
  },
  "ui-result": {
    duration: 0.62,
    description: "Four-note ascending victory arpeggio.",
    render: () => render(0.62, 0x71a9, t => {
      const notes = [261.63, 329.63, 392, 523.25];
      const frequency = notes[Math.min(3, Math.floor(t / 0.15))];
      return square(frequency, t) * 0.08 + sine(frequency, t) * 0.34;
    }),
  },
  "ui-confirm": {
    duration: 0.11,
    description: "Short retry and replay confirmation click.",
    render: () => render(0.11, 0x71aa, (t, _d, noise) => (
      sine(620, t) * 0.28 + noise() * 0.16 * Math.exp(-t * 35)
    )),
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
for (const [id, recipe] of Object.entries(recipes)) {
  const wav = encodeWav(recipe.render());
  const filename = `${id}.wav`;
  await writeFile(resolve(OUTPUT_DIR, filename), wav);
  assets.push({
    id,
    filename,
    description: recipe.description,
    durationMs: Math.round(recipe.duration * 1000),
    sampleRate: SAMPLE_RATE,
    channels: 1,
    bitDepth: 16,
    encoding: "PCM WAV",
    sha256: createHash("sha256").update(wav).digest("hex"),
  });
}

const metadata = {
  set: "combat-ui-sfx",
  version: 1,
  generatedAt: "2026-07-24",
  author: "OpenAI Codex for the Three Kingdoms project",
  license: "Original project-owned procedural audio; no third-party samples or recordings.",
  source: "tools/build_combat_ui_sfx.mjs",
  processing: "Deterministic oscillator/noise synthesis, mono 16-bit PCM WAV at 22050 Hz.",
  assets,
};
await writeFile(
  resolve(OUTPUT_DIR, "combat-ui-sfx.metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);
