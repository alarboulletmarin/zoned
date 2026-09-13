/**
 * The motion system.
 *
 * The first cut of these films failed on one thing: every element entered the
 * same way — fade plus a 30 px rise — and then froze. On a four second act that
 * is 0.8 s of movement and 3.2 s of still image, which reads as a slide deck
 * with dissolves.
 *
 * The rules that fix it, and that everything below serves:
 *
 *   1. Nothing is ever still. Every act carries a slow camera move under it, so
 *      the frame keeps breathing long after its content has arrived.
 *   2. Type performs. Lines are masked and slide up from behind their own
 *      baseline rather than fading in place.
 *   3. Motion has mass. Punchy elements overshoot on a spring; ambient ones
 *      glide on a long-tailed bezier. Nothing decelerates uniformly.
 *   4. Cuts have depth. Acts hand over in Z — one pulls back and blurs out
 *      while the next comes forward — instead of cross-dissolving flat.
 */

import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * House curves. `glide` is the workhorse: near-instant departure, long settle,
 * which is what makes a move feel expensive rather than mechanical.
 */
export const CURVE = {
  glide: Easing.bezier(0.16, 1, 0.3, 1),
  snap: Easing.bezier(0.32, 0.72, 0, 1),
  swell: Easing.bezier(0.65, 0, 0.35, 1),
  lift: Easing.bezier(0.22, 1, 0.36, 1),
  fall: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

type Curve = (input: number) => number;

/** 0 → 1 across `[at, at + dur)`, clamped. */
export const useRamp = (at: number, dur: number, curve: Curve = CURVE.glide) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curve,
  });
};

/**
 * A spring with overshoot, for anything that should land with weight: numbers,
 * chips, bars. `bounce` trades damping for a visible rebound.
 */
export const useSpring = (
  at: number,
  { bounce = 0.3, speed = 1 }: { bounce?: number; speed?: number } = {},
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - at,
    fps,
    config: {
      damping: 26 - bounce * 30,
      mass: 0.8 / speed,
      stiffness: 130 * speed,
    },
  });
};

/**
 * Continuous oscillation that never settles — the ambient layer. Period is in
 * seconds so the rhythm reads the same whatever the frame rate.
 *
 * A sine spends time near-stationary at each turning point. That is fine for a
 * detail among others, and wrong for anything that must be the guarantee that a
 * frame is alive — use `useTriangle` there.
 */
export const useBreath = (periodSec: number, amount = 1, phase = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.sin((frame / (fps * periodSec)) * Math.PI * 2 + phase) * amount;
};

/**
 * Triangle wave in [-amount, amount]: constant speed, reversing instantly at
 * each end. Never dwells, so a value driven by it is never two frames the same.
 */
export const useTriangle = (periodSec: number, amount = 1, phase = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / (fps * periodSec) + phase) % 1;
  const u = t < 0 ? t + 1 : t;
  return (Math.abs(u - 0.5) * 4 - 1) * amount;
};

export type CameraOptions = {
  /** Frames over which the move runs; it holds after. */
  dur?: number;
  /** Scale travelled, e.g. 0.04 goes 1 → 1.04. Negative pulls back. */
  scale?: number;
  x?: number;
  y?: number;
  rotate?: number;
  curve?: Curve;
};

/**
 * The slow move under an act. Barely perceptible frame to frame — but the
 * difference between a live frame and a photograph.
 *
 * Linear, and stretched well past the act it runs under. An eased camera has
 * zero velocity at both ends of its ramp, and the ramp used to finish exactly
 * when the act did: every act went perfectly still for its last half second,
 * which is what `bun run qa:motion` reported as a frozen shot. A camera that
 * never reaches its destination never stops moving.
 */
export const useCamera = ({
  dur = 200,
  scale = 0.035,
  x = 0,
  y = 0,
  rotate = 0,
  curve,
}: CameraOptions = {}) => {
  const frame = useCurrentFrame();
  const travel = dur * 1.8;
  const p = curve
    ? interpolate(frame, [0, travel], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: curve,
      })
    : interpolate(frame, [0, travel], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  return {
    transform: [
      `scale(${1 + scale * p})`,
      x ? `translateX(${x * p}px)` : "",
      y ? `translateY(${y * p}px)` : "",
      rotate ? `rotate(${rotate * p}deg)` : "",
    ]
      .filter(Boolean)
      .join(" "),
  } satisfies React.CSSProperties;
};

export type EnterOptions = {
  dur?: number;
  /** Pixels travelled up on entry. */
  y?: number;
  x?: number;
  /** Blur radius the element resolves from, in pixels. */
  blur?: number;
  /** Scale to grow out of, 0.08 starts at 0.92. */
  scale?: number;
  curve?: Curve;
  /** Land on a spring instead of a curve. */
  springy?: boolean;
};

/**
 * The standard entrance: rises, sharpens and settles.
 *
 * Resolving out of a blur is what the eye reads as depth of field — the element
 * arrives from somewhere rather than being switched on.
 */
export const useEnter = (at: number, opts: EnterOptions = {}) => {
  const { dur = 26, y = 44, x = 0, blur = 8, scale = 0, curve = CURVE.glide, springy = false } = opts;
  const ramp = useRamp(at, dur, curve);
  const spr = useSpring(at, { bounce: 0.34 });
  const p = springy ? spr : ramp;
  const inv = 1 - p;

  return {
    opacity: Math.min(1, ramp * 1.6),
    filter: blur ? `blur(${inv * blur}px)` : undefined,
    transform: [
      y ? `translateY(${inv * y}px)` : "",
      x ? `translateX(${inv * x}px)` : "",
      scale ? `scale(${1 - inv * scale})` : "",
    ]
      .filter(Boolean)
      .join(" "),
  } satisfies React.CSSProperties;
};

/**
 * Style for the inner span of a masked line reveal — the move that makes type
 * perform. Pair it with a parent that clips overflow; `<Reveal>` does both.
 */
export const useMask = (at: number, { dur = 30, skew = 0 }: { dur?: number; skew?: number } = {}) => {
  const p = useRamp(at, dur, CURVE.glide);
  const inv = 1 - p;
  return {
    display: "block",
    transform: `translateY(${inv * 112}%) ${skew ? `skewY(${inv * skew}deg)` : ""}`,
    transformOrigin: "left top",
  } satisfies React.CSSProperties;
};

/** Staggered start frame for item `i`, with an optional easing of the cadence. */
export const beat = (at: number, i: number, each = 4) => at + i * each;

/**
 * Deterministic pseudo-random in [0, 1).
 *
 * `Math.random()` would redraw the layout on every frame — the renderer calls
 * each component once per frame, so randomness has to be a pure function of a
 * seed.
 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
