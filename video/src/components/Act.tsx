import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { CURVE, useCamera, type CameraOptions } from "../motion";

export type Handover = "push" | "focus" | "drift";

/**
 * One beat of a film, handed over in depth.
 *
 * Acts overlap: the outgoing one is still leaving while the next is already
 * arriving. What matters is that they leave and arrive along Z — pulling back
 * and blurring out, coming forward and sharpening — rather than cross-fading
 * flat. A dissolve between two still frames is the thing that made the first
 * cut feel like a slide deck.
 *
 * `fadeIn={0}` on the opening act is deliberate: a film that starts on an empty
 * canvas and fades a logo up is read as an advertisement and scrolled past. The
 * first frame must already carry the message.
 */
export const Act: React.FC<{
  from: number;
  dur: number;
  children: ReactNode;
  fadeIn?: number;
  fadeOut?: number;
  /** How this act arrives and leaves. */
  handover?: Handover;
  /** The slow move that runs under the whole act. */
  camera?: CameraOptions;
}> = ({ from, dur, children, fadeIn = 16, fadeOut = 16, handover = "push", camera }) => (
  <Sequence from={from} durationInFrames={dur} layout="none" name={`act@${from}`}>
    <ActBody dur={dur} fadeIn={fadeIn} fadeOut={fadeOut} handover={handover} camera={camera}>
      {children}
    </ActBody>
  </Sequence>
);

/** Per-handover geometry: how far in Z, how much blur, which way it travels. */
const MOTION: Record<Handover, { enter: number[]; exit: number[]; blur: number }> = {
  // Comes up from below and forward; leaves upward and back.
  push: { enter: [0.94, 56], exit: [1.05, -46], blur: 10 },
  // Pull focus: arrives oversized and soft, leaves shrinking.
  focus: { enter: [1.1, 0], exit: [0.93, 0], blur: 16 },
  // Lateral, for acts that continue a thought rather than start one.
  drift: { enter: [0.98, 0], exit: [1.02, 0], blur: 6 },
};

const ActBody: React.FC<{
  dur: number;
  fadeIn: number;
  fadeOut: number;
  handover: Handover;
  camera?: CameraOptions;
  children: ReactNode;
}> = ({ dur, fadeIn, fadeOut, handover, camera, children }) => {
  const frame = useCurrentFrame();
  const m = MOTION[handover];
  const cam = useCamera({ dur, ...camera });

  const entering = fadeIn > 0;
  const leaving = fadeOut > 0;

  // 0 while arriving, 1 held, 2 while leaving — one axis for the whole handover.
  const enter = entering
    ? interpolate(frame, [0, fadeIn], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: CURVE.glide,
      })
    : 1;
  const exit = leaving
    ? interpolate(frame, [dur - fadeOut, dur], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: CURVE.fall,
      })
    : 0;

  // Opacity crosses on its own symmetric curve. Tying it to the motion curves
  // left the outgoing act sitting at two thirds opacity while the incoming one
  // had already sharpened — two headlines competing for the same frame.
  const enterO = entering
    ? interpolate(frame, [0, fadeIn], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: CURVE.swell,
      })
    : 1;
  const exitO = leaving
    ? interpolate(frame, [dur - fadeOut, dur], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: CURVE.swell,
      })
    : 0;

  const scale =
    (entering ? m.enter[0] + (1 - m.enter[0]) * enter : 1) *
    (leaving ? 1 + (m.exit[0] - 1) * exit : 1);
  const y =
    (entering ? m.enter[1] * (1 - enter) : 0) + (leaving ? m.exit[1] * exit : 0);
  const blur = m.blur * ((entering ? 1 - enter : 0) + (leaving ? exit : 0));
  const opacity = Math.min(enterO, 1 - exitO);

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        transform: `scale(${scale}) translateY(${y}px)`,
      }}
    >
      {/* The camera sits inside the handover so the two compose instead of
          fighting over the same transform. */}
      <AbsoluteFill style={cam}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
