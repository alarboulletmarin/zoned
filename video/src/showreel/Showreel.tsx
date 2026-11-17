/**
 * Showreel: fifteen seconds, six shots, one hero.
 *
 * The hero is the vermillon point of the wordmark. It opens the film as a ball
 * that bounces into frame, becomes the period of a word, irises the frame open,
 * comes back as the start of a route, swallows the screen in a match cut and
 * lands, last, in its place at the end of the official mark. Every shot is a
 * different craft (squash and stretch, kinetic type, data in depth, staggered
 * choreography, the match cut, the logo build) and the HUD names each one, the
 * way a reel does.
 *
 *   01  0.0 - 1.8 s   squash and stretch   the point bounces, "Go." forms, iris
 *   02  1.8 - 5.0 s   kinetic type         Z1 to Z6, darker AND faster each time
 *   03  5.0 - 7.6 s   data in depth        a real session profile, tilted in 3D
 *   04  7.6 - 9.9 s   choreography         a bento of four live tiles, whip in
 *   05  9.9 - 11.3 s  match cut            zoom into the route's start point
 *   06 11.3 - 15.0 s  logo build           the official SVG, letter by letter
 *
 * Built only from the house system: paper, ink, one accent, the ink ramp for
 * effort, Bricolage / Space Grotesk / JetBrains Mono, ink outlines and hard
 * offset shadows. The session in shot 03 is VMA-001 as written in
 * src/data/workouts/vma.json, and the paces in 02 and 04 are the ones
 * theme.ts takes from calculatePaceZones(16).
 *
 * Everything is a pure function of the frame: no hook in a loop, no unseeded
 * random, so the studio, a still and a render all agree.
 */
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import {
  COLORS,
  displayFamily,
  fontFamily,
  monoFamily,
  PHASE_COLORS,
  SHADOW,
  STROKE,
  ZONE_HEIGHT,
  ZONES,
  zoneInk,
} from "../theme";
import { CURVE } from "../motion";
import { LOGO } from "./logo";

export const SHOWREEL_FRAMES = 450;

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const W = 1920;
const H = 1080;
const INK = COLORS.fg;
const PAPER = COLORS.bg;
const ACCENT = COLORS.accent;
/** The dark theme's ink, `--panel-ink-text`. */
const CREAM = "#EDEBE7";
/**
 * The ramp on the dark panel: cream at the zones.css alphas (.14 .30 .46 .62
 * .80 1) composited once on #171614, the same way theme.ts does it on paper.
 */
const DARK_RAMP = ["#353432", "#575653", "#797875", "#9C9A97", "#C2C0BD", "#EDEBE7"];

type Ease = (t: number) => number;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ip = (f: number, a: number, b: number, from = 0, to = 1, easing?: Ease) =>
  interpolate(f, [a, b], [from, to], { ...CLAMP, easing });

const sp = (f: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f - at, fps: 30, config: { damping: 14, stiffness: 160, mass: 0.7, ...cfg } });

/** Deterministic 0..1 noise. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const IN_CUBIC = Easing.in(Easing.cubic);
const WHIP = Easing.bezier(0.7, 0, 0.2, 1);

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/+";

/** Decode effect: characters resolve left to right out of cycling glyphs. */
const scramble = (target: string, p: number, f: number) =>
  target
    .split("")
    .map((ch, i) => {
      if (ch === " " || p >= (i + 1) / target.length) return ch;
      return GLYPHS[Math.floor(hash(f * 13 + i * 7) * GLYPHS.length)];
    })
    .join("");

const mono = (size: number, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: monoFamily,
  fontSize: size,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  ...extra,
});

const zoneCode = (n: number) => `Z${n}`;
/** theme.ts carries typographic ranges; on screen a range is a hyphen. */
const range = (s: string) => s.replace(/\s*[–—]\s*/g, "-");

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

const SCENES = [
  { at: 0, name: "Squash & stretch" },
  { at: 54, name: "Kinetic type" },
  { at: 150, name: "Data in depth" },
  { at: 228, name: "Choreography" },
  { at: 296, name: "Match cut" },
  { at: 340, name: "Logo build" },
] as const;

/** Shot 02: one beat per zone, each one shorter than the last. */
const ZONE_AT = [52, 74, 94, 112, 127, 139];

/** Shot 03 to 04, the whip pan: one shared camera offset. */
const whipOffset = (f: number) => ip(f, 222, 241, 0, -W, WHIP);
const whipBlur = (f: number) => Math.min(70, Math.abs(whipOffset(f + 0.5) - whipOffset(f - 0.5)) * 0.18);

/* -------------------------------------------------------------------------- */
/* 01 · Squash and stretch                                                    */
/* -------------------------------------------------------------------------- */

const FLOOR = 700;
const BALL_X = 1180;
const BALL_R = 44;
const IMPACTS = [12, 30, 42];

/** Bottom of the ball: a fall, then two parabolic hops of decaying height. */
const ballBottom = (t: number) => {
  if (t < 12) return -40 + (FLOOR + 40) * (t / 12) ** 2;
  if (t < 30) {
    const u = (t - 12) / 18;
    return FLOOR - 4 * 250 * u * (1 - u);
  }
  if (t < 42) {
    const u = (t - 30) / 12;
    return FLOOR - 4 * 80 * u * (1 - u);
  }
  return FLOOR;
};

const IRIS_CX = BALL_X;
const IRIS_CY = FLOOR - BALL_R;
const irisOuter = (f: number) => (f < 50 ? 0 : interpolate(f, [50, 63], [BALL_R, 2400], { ...CLAMP, easing: IN_CUBIC }));
const irisInner = (f: number) => interpolate(f, [52, 66], [0, 2400], { ...CLAMP, easing: IN_CUBIC });

const Ghost: React.FC<{ f: number; at: number; until: number; word: string }> = ({ f, at, until, word }) => {
  if (f < at || f >= until) return null;
  const s = ip(f, at, at + 8, 1.22, 1, CURVE.glide);
  const o = ip(f, at, at + 2, 0, 1) * ip(f, at, at + 10, 0.85, 0.32);
  return (
    <text
      x={960}
      y={500}
      textAnchor="middle"
      fontFamily={displayFamily}
      fontWeight={800}
      fontSize={330}
      letterSpacing="-0.04em"
      fill="none"
      stroke={CREAM}
      strokeWidth={2}
      opacity={o}
      style={{ transform: `scale(${s})`, transformOrigin: "960px 400px" }}
    >
      {word}
    </text>
  );
};

const ShotBounce: React.FC<{ f: number }> = ({ f }) => {
  const y = ballBottom(f);
  const v = ballBottom(f + 0.5) - ballBottom(f - 0.5);
  const stretch = f < 42 ? 1 + Math.min(0.32, Math.abs(v) / 140) : 1;
  const impact = Math.max(0, ...IMPACTS.map((t) => 1 - Math.abs(f - t) / 3.5));
  const anticipation = ip(f, 44, 50, 0, 0.45, CURVE.swell);
  const squash = Math.max(impact * (f < 42 ? 0.42 : 0.3), anticipation);
  const sy = (1 - squash) * stretch;
  const sx = (1 + squash * 0.9) / stretch;

  const go = sp(f, 41, { damping: 12, stiffness: 190 });
  const floorLen = ip(f, 12, 26, 0, 760, CURVE.glide) * ip(f, 46, 54, 1, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="go-mask">
            <rect x={0} y={0} width={W} height={FLOOR + 6} />
          </clipPath>
        </defs>
        <Ghost f={f} at={12} until={30} word="Ready" />
        <Ghost f={f} at={30} until={42} word="Set" />

        <line
          x1={BALL_X - floorLen}
          x2={BALL_X + floorLen}
          y1={FLOOR + 1}
          y2={FLOOR + 1}
          stroke={CREAM}
          strokeOpacity={0.22}
          strokeWidth={2}
        />

        {IMPACTS.flatMap((t, k) =>
          [0, 1, 2].map((j) => {
            const s = t + j * 3;
            if (f < s || f > s + 24) return null;
            const r = ip(f, s, s + 24, BALL_R, 560 - j * 110 - k * 90, CURVE.glide);
            return (
              <ellipse
                key={`${k}-${j}`}
                cx={BALL_X}
                cy={FLOOR}
                rx={r}
                ry={r * 0.17}
                fill="none"
                stroke={DARK_RAMP[5 - j * 2]}
                strokeWidth={2.5 - j * 0.6}
                opacity={ip(f, s, s + 24, 0.9, 0)}
              />
            );
          }),
        )}

        <g clipPath="url(#go-mask)">
          <text
            x={BALL_X - BALL_R - 14}
            y={FLOOR}
            textAnchor="end"
            fontFamily={displayFamily}
            fontWeight={800}
            fontSize={390}
            letterSpacing="-0.04em"
            fill={CREAM}
            style={{ transform: `translateY(${(1 - go) * 360}px)` }}
          >
            Go
          </text>
        </g>

        {f < 51 ? (
          <ellipse
            cx={BALL_X}
            cy={y - BALL_R * sy}
            rx={BALL_R * sx}
            ry={BALL_R * sy}
            fill={ACCENT}
          />
        ) : (
          <circle cx={IRIS_CX} cy={IRIS_CY} r={irisOuter(f)} fill={ACCENT} />
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* 02 · Kinetic type: the ramp, harder and faster                             */
/* -------------------------------------------------------------------------- */

const WORD_SIZE = [210, 232, 252, 250, 290, 350];
const LETTER_STAGGER = [2.4, 1.9, 1.5, 1.1, 0.7, 0.35];

const ZoneWord: React.FC<{ f: number; i: number }> = ({ f, i }) => {
  const z = ZONES[i];
  const t = f - ZONE_AT[i];
  const ink = zoneInk(z.n);
  const size = WORD_SIZE[i];
  const word = z.labelEn;

  // The motion gets harder with the zone: less damping, more stiffness, more
  // skew, and from Z5 the word arrives sideways as well as up.
  const damping = 18 - i * 1.8;
  const stiffness = 140 + i * 45;

  // Sprint is the exit: it flies through the lens into shot 03.
  const fly = i === 5 ? ip(f, 146, 160, 1, 9, IN_CUBIC) : 1;
  const flyO = i === 5 ? ip(f, 151, 160, 1, 0) : 1;

  const info = sp(t, 3, { damping: 16, stiffness: 180 });

  return (
    <div
      style={{
        position: "absolute",
        left: 128,
        top: 330,
        transform: `scale(${fly})`,
        transformOrigin: "40% 60%",
        opacity: flyO,
        filter: fly > 1.05 ? `blur(${(fly - 1) * 2.4}px)` : undefined,
      }}
    >
      <div style={{ overflow: "hidden", height: 56, marginBottom: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            transform: `translateY(${(1 - info) * 60}px)`,
            ...mono(24, { color: ink }),
          }}
        >
          <span
            style={{
              border: `${STROKE.heavy}px solid ${ink}`,
              borderRadius: 999,
              padding: "6px 18px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {zoneCode(z.n)}
          </span>
          <span>{range(z.pct)} VMA</span>
          <span style={{ opacity: 0.55 }}>·</span>
          <span>{range(z.pace)} /km</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          overflow: "hidden",
          paddingTop: 90,
          marginTop: -90,
          paddingRight: 40,
          fontFamily: displayFamily,
          fontWeight: 800,
          fontSize: size,
          letterSpacing: "-0.045em",
          lineHeight: 1.02,
          color: ink,
        }}
      >
        {word.split("").map((ch, j) => {
          const e = sp(t, 1 + j * LETTER_STAGGER[i], { damping, stiffness });
          // Sideways it lands dead (no overshoot), or the letters pile into each
          // other; the bounce stays on the vertical.
          const side = i >= 4 ? (1 - Math.min(1, e)) * (i - 3) * 520 : 0;
          return (
            <span
              key={j}
              style={{
                display: "inline-block",
                transform: `translate(${side}px, ${(1 - e) * size * 1.1}px) skewX(${(1 - e) * -i * 5}deg)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** The persistent effort meter on the right of shot 02. */
const ZoneMeter: React.FC<{ f: number }> = ({ f }) => {
  const current = ZONE_AT.reduce((acc, at, i) => (f >= at ? i : acc), 0);
  const ink = zoneInk(ZONES[current].n);
  const o = ip(f, 56, 62) * ip(f, 144, 151, 1, 0);
  return (
    <div style={{ position: "absolute", right: 128, top: 300, width: 190, height: 480, opacity: o }}>
      {ZONES.map((z, i) => {
        const on = f >= ZONE_AT[i];
        const pop = on ? sp(f, ZONE_AT[i], { damping: 9, stiffness: 260 }) : 0;
        const h = 62;
        const y = (5 - i) * (h + 12);
        const w = 70 + ZONE_HEIGHT[z.n] * 70;
        return (
          <div key={z.n} style={{ position: "absolute", right: 0, top: y, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ ...mono(20, { color: ink, fontWeight: 700 }), opacity: i === current ? 1 : 0.5 }}>
              {zoneCode(z.n)}
            </span>
            <div
              style={{
                width: w,
                height: h,
                borderRadius: 12,
                border: `${i === current ? 3 : STROKE.rule}px solid ${i === current ? ACCENT : ink}`,
                background: on ? z.hex : "transparent",
                transform: `scaleX(${on ? 0.6 + pop * 0.4 : 1})`,
                transformOrigin: "right center",
                opacity: on ? 1 : 0.35,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const SpeedLines: React.FC<{ f: number }> = ({ f }) => {
  const t = f - ZONE_AT[5];
  if (t < 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 18 }, (_, k) => {
        const y = 120 + hash(k + 3) * 840;
        const len = 180 + hash(k + 9) * 520;
        const speed = 120 + hash(k + 21) * 120;
        const x = W + hash(k + 40) * 900 - t * speed;
        return (
          <line
            key={k}
            x1={x}
            x2={x + len}
            y1={y}
            y2={y}
            stroke={CREAM}
            strokeOpacity={0.12 + hash(k + 70) * 0.25}
            strokeWidth={1 + hash(k + 5) * 3}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

const ShotZones: React.FC<{ f: number }> = ({ f }) => {
  // Screen shake from Z5, decaying after each hit. Seeded, so it is the same
  // shake on every render.
  const shakeAmp = [0, 0, 0, 0, 5, 10].reduce(
    (acc, amp, i) => acc + amp * Math.max(0, 1 - (f - ZONE_AT[i]) / 9) * (f >= ZONE_AT[i] ? 1 : 0),
    0,
  );
  const sx = (hash(f * 3.1) - 0.5) * 2 * shakeAmp;
  const sy = (hash(f * 7.7) - 0.5) * 2 * shakeAmp;
  const r = irisInner(f);

  return (
    <AbsoluteFill style={{ clipPath: f < 66 ? `circle(${r}px at ${IRIS_CX}px ${IRIS_CY}px)` : undefined }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {ZONES.map((z, i) => {
          if (f < ZONE_AT[i]) return null;
          // Once the next panel has fully wiped over this one, drop it: the
          // last panel goes transparent for the fly-through, and what shows
          // through must be shot 03, not the previous zone.
          if (i < 5 && f > ZONE_AT[i + 1] + (9 - (i + 1)) + 1) return null;
          const wipe = i === 0 ? 0 : ip(f, ZONE_AT[i], ZONE_AT[i] + (9 - i), H, 0, CURVE.snap);
          const next = ZONE_AT[i + 1];
          const push = next ? ip(f, next, next + 8, 0, -170, IN_CUBIC) : 0;
          // The last panel lets the ink of shot 03 show through, so the word
          // can fly over the profile that is already rising behind it.
          const bgAlpha = i === 5 ? ip(f, 147, 152, 1, 0) : 1;
          return (
            <div
              key={z.n}
              style={{ position: "absolute", left: -40, right: -40, top: wipe, bottom: -40, overflow: i === 5 && f > 145 ? "visible" : "hidden" }}
            >
              <div style={{ position: "absolute", inset: 0, background: z.hex, opacity: bgAlpha }} />
              <div style={{ position: "absolute", left: 40, top: -wipe + push, width: W, height: H }}>
                <ZoneWord f={f} i={i} />
              </div>
            </div>
          );
        })}
        <SpeedLines f={f} />
        <ZoneMeter f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* 03 · Data in depth: VMA-001, the classic 30/30, as written                 */
/* -------------------------------------------------------------------------- */

type Seg = { min: number; z: number | null; label?: string };

/**
 * src/data/workouts/vma.json, VMA-001: 15 min Z1-Z2 (a span resolves to its
 * upper bound, Z2), 5 min of drills with no zone (the hatch), then 2 sets of
 * 12 x 30 s Z5 with 30 s Z1 between reps (none after the last one), 3 min Z1
 * between sets, and 10 min Z1. 56 minutes, 50 blocks, the same flattening
 * scripts/sync-data.ts writes into facts.json.
 */
const SESSION: Seg[] = (() => {
  const set = Array.from({ length: 12 }, (_, k) =>
    k < 11 ? [{ min: 0.5, z: 5 }, { min: 0.5, z: 1 }] : [{ min: 0.5, z: 5 }],
  ).flat();
  return [
    { min: 15, z: 2, label: "Warm-up" },
    { min: 5, z: null, label: "Drills" },
    ...set,
    { min: 3, z: 1 },
    ...set,
    { min: 10, z: 1, label: "Cool-down" },
  ];
})();
const SESSION_MIN = SESSION.reduce((a, s) => a + s.min, 0);

const PX0 = 140;
const PW = 1640;
const BASE = 790;
const MAXH = 420;
const PPM = PW / SESSION_MIN;
const SET_MIN = 11.5;
const SET1_AT = 20;
const SET2_AT = SET1_AT + SET_MIN + 3;

const Bracket: React.FC<{ f: number; at: number; x0: number; x1: number; y: number }> = ({ f, at, x0, x1, y }) => {
  const d = ip(f, at, at + 14, 0, 1, CURVE.glide);
  const lab = sp(f, at + 6, { damping: 15 });
  return (
    <g>
      <path
        d={`M${x0} ${y + 18} V${y} H${x1} V${y + 18}`}
        fill="none"
        stroke={ACCENT}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - d}
      />
      <text
        x={(x0 + x1) / 2}
        y={y - 18}
        textAnchor="middle"
        fontFamily={monoFamily}
        fontSize={26}
        fontWeight={700}
        letterSpacing="0.08em"
        fill={CREAM}
        opacity={lab}
        style={{ transform: `translateY(${(1 - lab) * 24}px)` }}
      >
        12 × 30/30 · Z5
      </text>
    </g>
  );
};

const ShotProfile: React.FC<{ f: number }> = ({ f }) => {
  const rx = ip(f, 150, 206, 66, 7, CURVE.glide);
  const rz = ip(f, 150, 206, -9, 0, CURVE.glide);
  const dolly = ip(f, 150, 240, 70, -50);
  const lift = ip(f, 150, 206, 120, 0, CURVE.glide);
  const title = sp(f, 162, { damping: 16 });
  const base = ip(f, 150, 172, 0, 1, CURVE.glide);

  let x = PX0;
  const bars = SESSION.map((s, k) => {
    const x0 = x;
    x += s.min * PPM;
    const w = Math.max(2, s.min * PPM - (s.min < 1 ? 3 : 4));
    const h = (s.z === null ? 0.44 : ZONE_HEIGHT[s.z]) * MAXH;
    const g = sp(f, 154 + ((x0 - PX0) / PW) * 28, { damping: 11, stiffness: 170 });
    return (
      <rect
        key={k}
        x={x0}
        y={BASE - h * g}
        width={w}
        height={Math.max(0, h * g)}
        rx={s.min < 1 ? 2 : 6}
        fill={s.z === null ? "url(#hatch)" : DARK_RAMP[s.z - 1]}
        stroke={s.z === null ? DARK_RAMP[3] : "none"}
        strokeWidth={1.5}
      />
    );
  });

  const ticks = Array.from({ length: 12 }, (_, k) => k * 5);
  const labels = (() => {
    let acc = 0;
    return SESSION.flatMap((s) => {
      const at = acc;
      acc += s.min;
      return s.label ? [{ at, min: s.min, label: s.label }] : [];
    });
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `perspective(1700px) translateY(${lift}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateX(${dolly}px)`, transformOrigin: `50% ${BASE}px` }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <pattern id="hatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width={10} height={10} fill={INK} />
              <line x1={0} y1={0} x2={0} y2={10} stroke="#918E88" strokeWidth={3} />
            </pattern>
          </defs>
          <line x1={PX0} x2={PX0 + PW * base} y1={BASE + 2} y2={BASE + 2} stroke={CREAM} strokeOpacity={0.35} strokeWidth={2} />
          {bars}
          {ticks.map((m, k) => {
            const o = ip(f, 168 + k * 1.5, 176 + k * 1.5);
            const tx = PX0 + m * PPM;
            return (
              <g key={m} opacity={o}>
                <line x1={tx} x2={tx} y1={BASE + 10} y2={BASE + 24} stroke={CREAM} strokeOpacity={0.4} strokeWidth={1.5} />
                <text x={tx} y={BASE + 52} textAnchor="middle" fontFamily={monoFamily} fontSize={20} fill={CREAM} fillOpacity={0.55}>
                  {m}′
                </text>
              </g>
            );
          })}
          {labels.map((l, k) => (
            <text
              key={l.label}
              x={PX0 + (l.at + l.min / 2) * PPM}
              y={BASE + 92}
              textAnchor="middle"
              fontFamily={monoFamily}
              fontSize={20}
              letterSpacing="0.14em"
              fill={CREAM}
              opacity={ip(f, 176 + k * 3, 184 + k * 3) * 0.75}
            >
              {l.label.toUpperCase()}
            </text>
          ))}
          <Bracket f={f} at={186} x0={PX0 + SET1_AT * PPM} x1={PX0 + (SET1_AT + SET_MIN) * PPM - 3} y={BASE - MAXH * 0.86 - 34} />
          <Bracket f={f} at={191} x0={PX0 + SET2_AT * PPM} x1={PX0 + (SET2_AT + SET_MIN) * PPM - 3} y={BASE - MAXH * 0.86 - 34} />
        </svg>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: PX0, top: 120, overflow: "hidden", paddingTop: 10 }}>
        <div style={{ transform: `translateY(${(1 - title) * 130}px)`, display: "flex", alignItems: "baseline", gap: 28 }}>
          <span style={{ ...mono(24, { color: ACCENT, fontWeight: 700 }) }}>VMA-001</span>
          <span style={{ fontFamily: displayFamily, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", color: CREAM }}>
            Classic 30/30
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 140,
          top: 158,
          ...mono(24, { color: CREAM }),
          opacity: ip(f, 172, 180) * 0.8,
        }}
      >
        {scramble(`${SESSION_MIN} min · 2 sets`, ip(f, 172, 190), f)}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* 04 · Choreography: a bento of live tiles                                   */
/* -------------------------------------------------------------------------- */

type Tile = { x: number; y: number; w: number; h: number };
const TILE_A: Tile = { x: 128, y: 168, w: 820, h: 764 };
const TILE_B: Tile = { x: 976, y: 168, w: 816, h: 368 };
const TILE_C: Tile = { x: 976, y: 564, w: 394, h: 368 };
const TILE_D: Tile = { x: 1398, y: 564, w: 394, h: 368 };
/** The route's start point inside tile D, the target of the match cut. */
const ROUTE_START = { x: 66, y: 292 };
const CAM_ORIGIN = { x: 960, y: 550 };
const camScale = (f: number) => ip(f, 238, 300, 1, 1.035);
const routeDotScreen = (f: number) => {
  const c = camScale(f);
  const lx = TILE_D.x + ROUTE_START.x;
  const ly = TILE_D.y + ROUTE_START.y;
  return { x: CAM_ORIGIN.x + (lx - CAM_ORIGIN.x) * c, y: CAM_ORIGIN.y + (ly - CAM_ORIGIN.y) * c };
};
const ZOOM_AT = 294;
const ZOOM_END = 310;
const zoomScale = (f: number) => Math.exp(ip(f, ZOOM_AT, ZOOM_END, 0, Math.log(160), IN_CUBIC));

const Card: React.FC<{ f: number; tile: Tile; at: number; children: ReactNode }> = ({ f, tile, at, children }) => {
  const e = sp(f, at, { damping: 13, stiffness: 150 });
  return (
    <div
      style={{
        position: "absolute",
        left: tile.x,
        top: tile.y,
        width: tile.w,
        height: tile.h,
        background: COLORS.panel,
        border: `${STROKE.rule}px solid ${INK}`,
        borderRadius: 26,
        boxShadow: SHADOW.blockLg,
        overflow: "hidden",
        transform: `translate(${(1 - e) * 260}px, ${(1 - e) * 50}px) rotate(${(1 - e) * 5}deg) scale(${0.9 + e * 0.1})`,
        transformOrigin: "0% 100%",
      }}
    >
      {children}
    </div>
  );
};

const TileHead: React.FC<{ f: number; at: number; kicker: string; title: string; size?: number }> = ({ f, at, kicker, title, size = 46 }) => {
  const e = sp(f, at, { damping: 16 });
  return (
    <div style={{ position: "absolute", left: 36, top: 30, right: 36 }}>
      <div style={{ ...mono(17, { color: COLORS.muted }), opacity: e }}>{scramble(kicker, ip(f, at, at + 12), f)}</div>
      <div style={{ overflow: "hidden", marginTop: 6 }}>
        <div
          style={{
            fontFamily: displayFamily,
            fontWeight: 800,
            fontSize: size,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            color: INK,
            transform: `translateY(${(1 - e) * 70}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

/** Sixteen weeks: base, build in 3+1 blocks, peak, taper, race. Illustrative shape. */
const WEEKS: { v: number; phase: keyof typeof PHASE_COLORS }[] = [
  ...[0.46, 0.52, 0.58, 0.42].map((v) => ({ v, phase: "base" as const })),
  ...[0.6, 0.67, 0.74, 0.52, 0.78, 0.86, 0.93, 0.64].map((v) => ({ v, phase: "build" as const })),
  ...[1.0, 0.96].map((v) => ({ v, phase: "peak" as const })),
  { v: 0.6, phase: "taper" },
  { v: 0.34, phase: "race" },
];

const PlanTile: React.FC<{ f: number }> = ({ f }) => {
  const bx = 40;
  const bw = TILE_A.w - 80;
  const base = 610;
  const maxH = 380;
  const gap = 10;
  const w = (bw - gap * (WEEKS.length - 1)) / WEEKS.length;
  const raceIn = sp(f, 262, { damping: 10, stiffness: 220 });
  const last = bx + (WEEKS.length - 1) * (w + gap);
  return (
    <>
      <TileHead f={f} at={236} kicker="Plan · base to race" title="Build, peak, taper" size={58} />
      <svg width={TILE_A.w} height={TILE_A.h} style={{ position: "absolute", inset: 0 }}>
        <line x1={bx} x2={bx + bw * ip(f, 236, 256, 0, 1, CURVE.glide)} y1={base + 1} y2={base + 1} stroke={INK} strokeWidth={STROKE.rule} />
        {WEEKS.map((wk, i) => {
          const g = sp(f, 238 + i * 1.6, { damping: 11, stiffness: 170 });
          const h = wk.v * maxH * g;
          return (
            <rect
              key={i}
              x={bx + i * (w + gap)}
              y={base - h}
              width={w}
              height={Math.max(0, h)}
              rx={6}
              fill={PHASE_COLORS[wk.phase]}
              stroke={wk.phase === "race" ? "none" : INK}
              strokeWidth={STROKE.hair}
            />
          );
        })}
        <g opacity={raceIn} style={{ transform: `translateY(${(1 - raceIn) * 30}px)` }}>
          <text x={last + w / 2} y={base - 0.34 * maxH - 22} textAnchor="middle" fontFamily={monoFamily} fontWeight={700} fontSize={18} letterSpacing="0.1em" fill={ACCENT}>
            RACE
          </text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: bx, top: base + 40, display: "flex", gap: 26 }}>
        {(["base", "build", "peak", "taper", "race"] as const).map((p, k) => {
          const o = ip(f, 250 + k * 2.5, 258 + k * 2.5);
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: PHASE_COLORS[p], border: p === "race" ? "none" : `1px solid ${INK}` }} />
              <span style={{ ...mono(16, { color: COLORS.sub }) }}>{p}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

/** One slot-machine column, rolling from one digit to another through `loops` turns. */
const Reel: React.FC<{ f: number; at: number; from: number; to: number; loops: number }> = ({ f, at, from, to, loops }) => {
  const LINE = 196;
  const e = sp(f, at, { damping: 15, stiffness: 55, mass: 1 });
  const v = from + (to + 10 * loops - from) * e;
  const speed = Math.abs((from + (to + 10 * loops - from) * sp(f + 1, at, { damping: 15, stiffness: 55, mass: 1 })) - v);
  const base = Math.floor(v);
  return (
    <div
      style={{
        position: "relative",
        width: 0.6 * 190,
        height: LINE,
        overflow: "hidden",
        maskImage: "linear-gradient(transparent, black 22%, black 78%, transparent)",
        WebkitMaskImage: "linear-gradient(transparent, black 22%, black 78%, transparent)",
      }}
    >
      {[-1, 0, 1, 2].map((k) => {
        const n = base + k;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 0,
              top: (n - v) * -LINE,
              height: LINE,
              lineHeight: `${LINE}px`,
              fontFamily: monoFamily,
              fontWeight: 700,
              fontSize: 190,
              color: INK,
              filter: speed > 0.05 ? `blur(${Math.min(6, speed * 9)}px)` : undefined,
            }}
          >
            {((n % 10) + 10) % 10}
          </div>
        );
      })}
    </div>
  );
};

const PaceTile: React.FC<{ f: number }> = ({ f }) => {
  // Z1's slow end to Z5's fast end at VMA 16, theme.ts / calculatePaceZones(16).
  const arrive = sp(f, 252, { damping: 15, stiffness: 55, mass: 1 });
  const segW = (TILE_B.w - 72 - 5 * 6) / 6;
  const markerX = lerp(segW / 2, 4 * (segW + 6) + segW / 2, Math.min(1.08, arrive));
  return (
    <>
      <TileHead f={f} at={240} kicker="Pace · VMA 16 km/h" title="Every zone, a pace" />
      <div style={{ position: "absolute", left: 36, top: 100, display: "flex", alignItems: "center" }}>
        <Reel f={f} at={244} from={7} to={3} loops={1} />
        <div style={{ fontFamily: monoFamily, fontWeight: 700, fontSize: 190, color: INK, width: 0.6 * 190, textAlign: "center", marginTop: -14 }}>:</div>
        <Reel f={f} at={248} from={3} to={4} loops={2} />
        <Reel f={f} at={252} from={0} to={5} loops={3} />
        <div style={{ fontFamily: displayFamily, fontWeight: 700, fontSize: 52, color: COLORS.muted, marginLeft: 18, marginTop: 70 }}>/km</div>
      </div>
      <div style={{ position: "absolute", left: 36, top: 312, width: TILE_B.w - 72 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {ZONES.map((z, i) => (
            <div key={z.n} style={{ flex: 1, opacity: ip(f, 244 + i * 2, 252 + i * 2) }}>
              <div style={{ height: 16, borderRadius: 4, background: z.hex }} />
              <div style={{ ...mono(14, { color: i === 4 ? INK : COLORS.muted, fontWeight: i === 4 ? 700 : 400 }), marginTop: 6 }}>{zoneCode(z.n)}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: markerX - 3, top: -10, width: 6, height: 36, borderRadius: 3, background: ACCENT, opacity: ip(f, 248, 252) }} />
      </div>
    </>
  );
};

const StairTile: React.FC<{ f: number }> = ({ f }) => {
  const bx = 36;
  const gap = 10;
  const w = (TILE_C.w - 72 - gap * 5) / 6;
  const base = 290;
  return (
    <>
      <TileHead f={f} at={244} kicker="Effort · Z1 to Z6" title="Darker is harder" size={38} />
      <svg width={TILE_C.w} height={TILE_C.h} style={{ position: "absolute", inset: 0 }}>
        {ZONES.map((z, i) => {
          const g = sp(f, 250 + i * 2.5, { damping: 10, stiffness: 200 });
          const h = ZONE_HEIGHT[z.n] * 170 * g;
          const x = bx + i * (w + gap);
          return (
            <g key={z.n}>
              <rect x={x} y={base - h} width={w} height={Math.max(0, h)} rx={6} fill={z.hex} stroke={INK} strokeWidth={STROKE.hair} />
              <text x={x + w / 2} y={base + 34} textAnchor="middle" fontFamily={monoFamily} fontSize={16} fill={COLORS.sub} opacity={g}>
                {zoneCode(z.n)}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
};

const ROUTE =
  "M66 292 C 30 250, 34 168, 104 150 S 196 168, 232 128 S 338 104, 350 176 S 318 300, 250 296 S 132 336, 66 292 Z";

const RouteTile: React.FC<{ f: number }> = ({ f }) => {
  const d = ip(f, 250, 290, 0, 1, CURVE.swell);
  const dot = sp(f, 248, { damping: 9, stiffness: 240 });
  const ping = ip(f, 288, 304, 0, 1, CURVE.glide);
  return (
    <>
      <TileHead f={f} at={248} kicker="Routes · loop" title="Out and back" size={38} />
      <svg width={TILE_D.w} height={TILE_D.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={ROUTE} fill="none" stroke={COLORS.border} strokeWidth={10} strokeLinejoin="round" />
        <path
          d={ROUTE}
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - d}
        />
        {ping > 0 && ping < 1 ? (
          <circle cx={ROUTE_START.x} cy={ROUTE_START.y} r={14 + ping * 40} fill="none" stroke={ACCENT} strokeWidth={3} opacity={1 - ping} />
        ) : null}
        <circle cx={ROUTE_START.x} cy={ROUTE_START.y} r={14 * dot} fill={ACCENT} />
      </svg>
    </>
  );
};

const ShotBento: React.FC<{ f: number }> = ({ f }) => {
  const c = camScale(f);
  const z = zoomScale(f);
  const p = routeDotScreen(f);
  const off = f < 242 ? whipOffset(f) + W : 0;
  const blur = f < 242 ? whipBlur(f) : 0;
  return (
    <AbsoluteFill style={{ transform: `translateX(${off}px)`, filter: blur > 0.5 ? `url(#whip)` : undefined }}>
      <AbsoluteFill
        style={{
          backgroundColor: PAPER,
          transform: `translate(${p.x}px, ${p.y}px) scale(${z}) translate(${-p.x}px, ${-p.y}px)`,
          transformOrigin: "0 0",
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${c})`, transformOrigin: `${CAM_ORIGIN.x}px ${CAM_ORIGIN.y}px` }}>
          <Card f={f} tile={TILE_A} at={230}>
            <PlanTile f={f} />
          </Card>
          <Card f={f} tile={TILE_B} at={234}>
            <PaceTile f={f} />
          </Card>
          <Card f={f} tile={TILE_C} at={238}>
            <StairTile f={f} />
          </Card>
          <Card f={f} tile={TILE_D} at={242}>
            <RouteTile f={f} />
          </Card>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* 05 + 06 · Match cut into the logo build                                    */
/* -------------------------------------------------------------------------- */

/** Logo placement: the official viewBox at half scale, centred. */
const LK = 0.5;
const LOGO_LEFT = (W - LOGO.viewBox.w * LK) / 2;
const LOGO_BASE = 600;
const toScreen = (x: number, y: number) => ({ x: LOGO_LEFT + (x - LOGO.viewBox.x) * LK, y: LOGO_BASE + y * LK });
const DOT_HOME = toScreen(LOGO.dot.box.cx, LOGO.dot.box.cy);
const DOT_BOTTOM = toScreen(0, LOGO.dot.box.y1).y;
const DOT_HALF_W = (LOGO.dot.box.w * LK) / 2;
const DOT_HALF_H = (LOGO.dot.box.h * LK) / 2;
const LAND = 343;

/** The point: a full screen of vermillon shrinking to a ball, a hop, a landing. */
const dotState = (f: number) => {
  const start = routeDotScreen(ZOOM_END);
  const apex = { x: DOT_HOME.x, y: 236 };
  if (f < 331) {
    const e = ip(f, 311, 331, 0, 1, CURVE.snap);
    const scale = Math.exp(lerp(Math.log(2400 / DOT_HALF_W), Math.log(1.45), e));
    return { x: lerp(start.x, apex.x, e), y: lerp(start.y, apex.y, e), sx: scale, sy: scale };
  }
  if (f < LAND) {
    const u = (f - 331) / (LAND - 331);
    const y = lerp(apex.y, DOT_HOME.y, u * u);
    const s = lerp(1.45, 1, u);
    const stretch = 1 + u * 0.28;
    return { x: apex.x, y, sx: s / stretch, sy: s * stretch };
  }
  const t = f - LAND;
  const squash = 0.34 * Math.cos(t * 0.75) * Math.exp(-t * 0.28);
  const sy = 1 - squash;
  const sx = 1 + squash * 0.85;
  // Keep the bottom on the baseline while it squashes.
  return { x: DOT_HOME.x, y: DOT_BOTTOM - DOT_HALF_H * sy, sx, sy };
};

const LogoLetter: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  const L = LOGO.letters[k];
  const at = 322 + k * 3.5;
  const e = sp(f, at, { damping: 13, stiffness: 150 });
  // Secondary action: the landing knocks the letters, the wave runs leftwards
  // from the point.
  const t = f - (LAND + (4 - k) * 2);
  const bump = t > 0 ? -22 * Math.sin(t * 0.62) * Math.exp(-t * 0.2) : 0;
  const dy = (1 - e) * 820 + bump;
  const rot = (1 - e) * (k % 2 ? 14 : -14);
  const pivot = `${L.box.cx}px ${L.box.y1}px`;
  return (
    <path
      d={L.d}
      fill={INK}
      style={{ transform: `translateY(${dy}px) rotate(${rot}deg)`, transformOrigin: pivot, transformBox: "view-box" }}
    />
  );
};

const RampStrip: React.FC<{ f: number }> = ({ f }) => {
  const x0 = toScreen(LOGO.letters[0].box.x0, 0).x;
  const x1 = toScreen(LOGO.dot.box.x1, 0).x;
  const gap = 10;
  const w = (x1 - x0 - gap * 5) / 6;
  const base = 690;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {ZONES.map((z, i) => {
        const g = sp(f, 352 + i * 3, { damping: 11, stiffness: 190 });
        const h = 10 + ZONE_HEIGHT[z.n] * 40;
        const x = x0 + i * (w + gap);
        return (
          <g key={z.n} opacity={Math.min(1, g * 1.5)}>
            <rect x={x} y={base - h * g} width={w} height={Math.max(0, h * g)} rx={5} fill={z.hex} />
            <text x={x} y={base + 28} fontFamily={monoFamily} fontSize={17} letterSpacing="0.1em" fill={COLORS.muted}>
              {zoneCode(z.n)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const TAGLINE = ["Structured", "training,", "without", "the", "noise"];

const ShotLogo: React.FC<{ f: number }> = ({ f }) => {
  const d = dotState(f);
  const cam = ip(f, 312, 450, 1, 1.06);
  const vb = LOGO.viewBox;
  const url = ip(f, 384, 404);
  const urlText = scramble("zoned.run", url, f);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: `960px 560px` }}>
        {/* Ripples in the effort ramp, on the ground under the point. */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {ZONES.map((z, j) => {
            const s = LAND + j * 1.6;
            if (f < s || f > s + 30) return null;
            const r = ip(f, s, s + 30, DOT_HALF_W, 240 + j * 52, CURVE.glide);
            return (
              <ellipse
                key={z.n}
                cx={DOT_HOME.x}
                cy={DOT_BOTTOM}
                rx={r}
                ry={r * 0.3}
                fill="none"
                stroke={j === 5 ? ACCENT : z.hex}
                strokeWidth={ip(f, s, s + 30, 7, 1)}
                opacity={ip(f, s, s + 30, 1, 0)}
              />
            );
          })}
        </svg>

        <svg
          width={vb.w * LK}
          height={vb.h * LK + 40}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h + 80}`}
          style={{ position: "absolute", left: LOGO_LEFT, top: LOGO_BASE + vb.y * LK, overflow: "visible" }}
        >
          <defs>
            <clipPath id="baseline">
              <rect x={vb.x - 400} y={-2000} width={vb.w + 800} height={2000 + 26} />
            </clipPath>
          </defs>
          <g clipPath="url(#baseline)">
            {LOGO.letters.map((_, k) => (
              <LogoLetter key={k} f={f} k={k} />
            ))}
          </g>
        </svg>

        <RampStrip f={f} />

        <div style={{ position: "absolute", left: 0, right: 0, top: 752, display: "flex", justifyContent: "center", gap: 16 }}>
          {TAGLINE.map((word, k) => {
            const e = sp(f, 364 + k * 3, { damping: 15, stiffness: 170 });
            return (
              <div key={word} style={{ overflow: "hidden", paddingBottom: 6 }}>
                <div
                  style={{
                    fontFamily,
                    fontWeight: 500,
                    fontSize: 46,
                    letterSpacing: "-0.01em",
                    color: k < 2 ? INK : COLORS.sub,
                    transform: `translateY(${(1 - e) * 64}px)`,
                  }}
                >
                  {word}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 838, textAlign: "center", ...mono(28, { letterSpacing: "0.18em", textTransform: "none", color: INK }), opacity: url > 0 ? 1 : 0 }}>
          {url >= 1 ? (
            <>
              zoned<span style={{ color: ACCENT }}>.</span>run
            </>
          ) : (
            urlText
          )}
        </div>

        {/* The point, always the official path, only its transform changes. */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d={LOGO.dot.d}
            fill={ACCENT}
            transform={`translate(${d.x} ${d.y}) scale(${LK * d.sx} ${LK * d.sy}) translate(${-LOGO.dot.box.cx} ${-LOGO.dot.box.cy})`}
          />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* HUD, grain                                                                 */
/* -------------------------------------------------------------------------- */

const hudInk = (f: number) => (f < 57 ? CREAM : f < 113 ? INK : f < 233 ? CREAM : INK);

const Hud: React.FC<{ f: number }> = ({ f }) => {
  const ink = hudInk(f);
  const idx = SCENES.reduce((acc, s, i) => (f >= s.at ? i : acc), 0);
  const scene = SCENES[idx];
  const label = `${String(idx + 1).padStart(2, "0")} / 06  ${scene.name}`;
  const shown = scramble(label, ip(f, scene.at, scene.at + 12), f);
  const sec = Math.floor(f / 30);
  const tc = `00:00:${String(sec).padStart(2, "0")}:${String(f % 30).padStart(2, "0")}`;
  const end = f >= 424;
  const corner = (x: number, y: number, dx: number, dy: number) => (
    <path d={`M${x} ${y + dy * 30} V${y} H${x + dx * 30}`} fill="none" stroke={ink} strokeWidth={2} />
  );
  const barX0 = 400;
  const barX1 = W - 400;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", color: ink }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {corner(40, 40, 1, 1)}
        {corner(W - 40, 40, -1, 1)}
        {corner(40, H - 40, 1, -1)}
        {corner(W - 40, H - 40, -1, -1)}
        <line x1={barX0} x2={barX1} y1={H - 52} y2={H - 52} stroke={ink} strokeOpacity={0.25} strokeWidth={2} />
        <line x1={barX0} x2={barX0 + (barX1 - barX0) * (f / (SHOWREEL_FRAMES - 1))} y1={H - 52} y2={H - 52} stroke={ACCENT} strokeWidth={3} />
        {SCENES.map((s) => {
          const x = barX0 + (barX1 - barX0) * (s.at / (SHOWREEL_FRAMES - 1));
          return <line key={s.at} x1={x} x2={x} y1={H - 60} y2={H - 44} stroke={ink} strokeOpacity={0.5} strokeWidth={2} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 88, top: 58, ...mono(17, { color: ink, fontWeight: 700 }) }}>
        Zoned · motion reel 2026
      </div>
      <div style={{ position: "absolute", right: 88, top: 58, ...mono(17, { color: ink, whiteSpace: "pre" }) }}>
        {end ? scramble("End of reel", ip(f, 424, 436), f) : shown}
      </div>
      <div style={{ position: "absolute", left: 88, bottom: 40, ...mono(17, { color: ink, fontVariantNumeric: "tabular-nums" }) }}>
        <span style={{ color: ACCENT, marginRight: 12 }}>●</span>
        {tc}
      </div>
      <div style={{ position: "absolute", right: 88, bottom: 40, ...mono(17, { color: ink }) }}>1920 × 1080 · 30 fps</div>
    </AbsoluteFill>
  );
};

/** Film grain: a fresh seed every frame, so no two frames are identical. */
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.16 }}>
    <svg width={W} height={H}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/* -------------------------------------------------------------------------- */
/* The film                                                                   */
/* -------------------------------------------------------------------------- */

export const Showreel: React.FC = () => {
  const f = useCurrentFrame();
  const blur = whipBlur(f);
  const whip = whipOffset(f);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily, WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      {/* Directional blur for the whip pan: horizontal only. */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip" x="-20%" y="0%" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>

      {f >= 146 && f < 242 ? (
        <AbsoluteFill style={{ transform: `translateX(${whip}px)`, filter: blur > 0.5 ? "url(#whip)" : undefined }}>
          <ShotProfile f={f} />
        </AbsoluteFill>
      ) : null}
      {f < 66 ? <ShotBounce f={f} /> : null}
      {f >= 52 && f < 161 ? <ShotZones f={f} /> : null}
      {f >= 222 && f < 313 ? <ShotBento f={f} /> : null}
      {f >= 311 ? <ShotLogo f={f} /> : null}

      <Grain f={f} />
      <Hud f={f} />
    </AbsoluteFill>
  );
};
