/**
 * The score of the Launch film, synthesised from nothing.
 *
 * No sample, no library, no licence to track: piano, pad, strings, a heartbeat
 * and two impacts, written as arithmetic and run through a Schroeder reverb.
 * Seeded noise, so two runs write the same file byte for byte.
 *
 * The cue sheet is `CUES` in src/compositions/Launch.tsx: every hit here lands
 * on one of its seconds. Change one side, change the other.
 *
 *   bun run scripts/launch-score.ts            -> public/launch/score.wav
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { LAUNCH_CUES as C, LAUNCH_SECONDS } from "../src/compositions/launch-cues";

const SR = 44100;
const LEN = Math.ceil((LAUNCH_SECONDS + 0.5) * SR);
const L = new Float32Array(LEN);
const R = new Float32Array(LEN);
// What the reverb hears. The heartbeat and the boom stay mostly dry: a kick in
// a cathedral is mud, a piano in one is the whole genre.
const SL = new Float32Array(LEN);
const SR_ = new Float32Array(LEN);

let seed = 7;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 31 - 1;
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

const put = (i: number, v: number, pan: number, send: number) => {
  if (i < 0 || i >= LEN) return;
  const l = v * Math.cos(((pan + 1) * Math.PI) / 4);
  const r = v * Math.sin(((pan + 1) * Math.PI) / 4);
  L[i] += l;
  R[i] += r;
  SL[i] += l * send;
  SR_[i] += r * send;
};

/** A felt piano: stretched partials, the high ones dying first. */
const piano = (t: number, midi: number, vel: number, pan = 0) => {
  const f = hz(midi);
  const start = Math.round(t * SR);
  const dur = 5.5 * SR;
  for (let n = 1; n <= 9; n++) {
    const fn = f * n * Math.sqrt(1 + 0.0004 * n * n);
    if (fn > 9000) break;
    const amp = (vel / n ** 1.4) * (n === 1 ? 1 : 0.7);
    const decay = 0.9 + 2.6 / n;
    const w = (2 * Math.PI * fn) / SR;
    for (let k = 0; k < dur; k++) {
      const s = k / SR;
      const env = Math.min(1, k / 60) * Math.exp(-s / decay);
      if (k > 60 && env < 1e-4) break;
      put(start + k, amp * env * Math.sin(w * k), pan, 0.55);
    }
  }
};

/** Detuned, soft-edged pad: a few harmonics only, so it reads as filtered. */
const pad = (t: number, dur: number, notes: number[], vel: number, att = 1.6, rel = 2.2) => {
  const start = Math.round(t * SR);
  const total = Math.round((dur + rel) * SR);
  notes.forEach((midi, ni) => {
    [-0.11, 0, 0.13].forEach((cents, vi) => {
      const f = hz(midi + cents);
      const pan = (vi - 1) * 0.6;
      const ph = ni * 1.7 + vi;
      for (let k = 0; k < total; k++) {
        const s = k / SR;
        const env =
          Math.min(1, s / att) * (s > dur ? Math.max(0, 1 - (s - dur) / rel) : 1);
        const lfo = 1 + 0.15 * Math.sin(2 * Math.PI * 0.21 * s + ph);
        const x = 2 * Math.PI * f * s + ph;
        const v =
          Math.sin(x) + 0.32 * lfo * Math.sin(2 * x) + 0.14 * Math.sin(3 * x) + 0.06 * Math.sin(4 * x);
        put(start + k, (vel / notes.length) * 0.33 * env * v, pan, 0.7);
      }
    });
  });
};

/** Low strings: a slow swell under a chord root, with vibrato. */
const swell = (t: number, dur: number, midi: number, vel: number) => {
  const start = Math.round(t * SR);
  const n = Math.round(dur * SR);
  const f = hz(midi);
  for (let k = 0; k < n; k++) {
    const s = k / SR;
    const p = s / dur;
    const env = Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 2;
    const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 5.2 * s);
    const x = 2 * Math.PI * f * vib * s;
    let v = 0;
    for (let h = 1; h <= 6; h++) v += Math.sin(h * x) / h;
    put(start + k, vel * env * v * 0.35, 0, 0.6);
  }
};

/** A heartbeat: lub-dub, two sine thumps falling in pitch. */
const heart = (t: number, vel: number) => {
  [0, 0.17].forEach((off, j) => {
    const start = Math.round((t + off) * SR);
    const a = j === 0 ? vel : vel * 0.62;
    let phase = 0;
    for (let k = 0; k < 0.35 * SR; k++) {
      const s = k / SR;
      const f = 48 + 70 * Math.exp(-s * 38);
      phase += (2 * Math.PI * f) / SR;
      const env = Math.min(1, k / 40) * Math.exp(-s * 13);
      put(start + k, a * env * Math.sin(phase), 0, 0.08);
    }
  });
};

/** The impact: sub drop, a noise crack, and a long tail sent to the room. */
const boom = (t: number, vel: number) => {
  const start = Math.round(t * SR);
  let phase = 0;
  let lp = 0;
  for (let k = 0; k < 4.5 * SR; k++) {
    const s = k / SR;
    const f = 34 + 55 * Math.exp(-s * 6);
    phase += (2 * Math.PI * f) / SR;
    const body = Math.exp(-s * 1.1) * Math.sin(phase);
    lp += 0.08 * (noise() - lp);
    const crack = Math.exp(-s * 9) * lp * 2.2;
    put(start + k, vel * Math.min(1, k / 30) * (body + crack), 0, 0.35);
  }
};

/** A riser: noise through a one-pole lowpass that opens, ending on `t`. */
const riser = (end: number, dur: number, vel: number) => {
  const start = Math.round((end - dur) * SR);
  const n = Math.round(dur * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const p = k / n;
    const a = 0.002 + 0.25 * p ** 3;
    lp += a * (noise() - lp);
    put(start + k, vel * p ** 2.2 * lp * 3, Math.sin(k / 9000) * 0.5, 0.8);
  }
};

// ---------------------------------------------------------------------------
// The piece. D minor, 60 bpm, one chord per four seconds: Dm, Bb, F, C.
// ---------------------------------------------------------------------------

const PROG = [
  { root: 38, chord: [50, 53, 57, 62] }, // Dm
  { root: 34, chord: [46, 50, 53, 58] }, // Bb
  { root: 41, chord: [48, 53, 57, 60] }, // F
  { root: 36, chord: [48, 52, 55, 60] }, // C
];
const chordAt = (s: number) => PROG[Math.floor(s / 4) % 4];

// The melody the piano returns to: a falling then rising figure on each chord.
const FIGURE = [0, 2, 1, 3, 2, 1];

// 1. Alone. Sparse piano, a note every two seconds, until the question.
for (let s = 0; s < C.introducing - 1; s += 2) {
  const c = chordAt(s);
  piano(s, c.chord[(s / 2) % 4] + 12, 0.09, -0.2);
  if (s % 4 === 0) piano(s, c.root + 12, 0.06, 0.2);
}
pad(4, C.introducing - 4, [50, 57, 62], 0.12, 3, 1.2);

// 2. The riser into the title, then nothing for a breath, then the boom.
riser(C.introducing, 4, 0.35);
boom(C.title, 0.9);

// 3. From the title on: full chords, the piano figure in eighths, strings.
for (let s = C.title; s < C.outro; s += 4) {
  const c = chordAt(s);
  const louder = s >= C.benchmarks ? 1.25 : 1;
  pad(s, 4, c.chord, 0.32 * louder);
  swell(s, 4.6, c.root, 0.12 * louder);
  for (let i = 0; i < 8; i++) {
    const note = c.chord[FIGURE[i % FIGURE.length]] + 12 + (i === 7 ? 12 : 0);
    piano(s + i * 0.5, note, (i % 2 ? 0.06 : 0.09) * louder, i % 2 ? 0.35 : -0.35);
  }
}

// 4. The heartbeat. It enters with the benchmarks at rest and climbs: the film
//    goes up the zones while it talks about them.
for (let s = C.benchmarks; s < C.hit; ) {
  const p = (s - C.benchmarks) / (C.hit - C.benchmarks);
  heart(s, 0.55 + 0.25 * p);
  s += 1 / (1 + p * 1.0);
}

// 5. The hit, the final run, the signature.
riser(C.hit, 3, 0.4);
boom(C.hit, 0.8);
riser(C.signature, 2.5, 0.3);
boom(C.signature, 1);
pad(C.outro, LAUNCH_SECONDS - C.outro, [38, 50, 57, 62, 65], 0.42, 0.4, 0.1);
piano(C.signature, 74, 0.2, 0);
piano(C.signature, 62, 0.16, -0.3);
piano(C.signature, 69, 0.14, 0.3);

// ---------------------------------------------------------------------------
// Room: Schroeder, four combs and two allpasses per side.
// ---------------------------------------------------------------------------

const reverb = (input: Float32Array, spread: number) => {
  const out = new Float32Array(LEN);
  for (const d of [1557, 1617, 1491, 1422]) {
    const len = d + spread;
    const buf = new Float32Array(len);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < LEN; i++) {
      const y = buf[idx];
      lp = y * 0.6 + lp * 0.4;
      buf[idx] = input[i] + lp * 0.86;
      out[i] += y;
      idx = (idx + 1) % len;
    }
  }
  for (const d of [556, 441]) {
    const len = d + spread;
    const buf = new Float32Array(len);
    let idx = 0;
    for (let i = 0; i < LEN; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % len;
    }
  }
  return out;
};

const wetL = reverb(SL, 0);
const wetR = reverb(SR_, 23);

let peak = 0;
for (let i = 0; i < LEN; i++) {
  L[i] += wetL[i] * 0.16;
  R[i] += wetR[i] * 0.16;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}

// Normalise, a soft knee, and fades at both ends.
const gain = 1.25 / peak;
const pcm = Buffer.alloc(LEN * 4);
for (let i = 0; i < LEN; i++) {
  const s = i / SR;
  const fade = Math.min(1, s / 0.05, (LAUNCH_SECONDS + 0.5 - s) / 1.5);
  const l = Math.tanh(L[i] * gain) * 0.89 * Math.max(0, fade);
  const r = Math.tanh(R[i] * gain) * 0.89 * Math.max(0, fade);
  pcm.writeInt16LE(Math.round(l * 32767), i * 4);
  pcm.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const dir = join(import.meta.dirname, "..", "public", "launch");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "score.wav"), Buffer.concat([header, pcm]));
console.log(`public/launch/score.wav · ${(LEN / SR).toFixed(1)} s`);
