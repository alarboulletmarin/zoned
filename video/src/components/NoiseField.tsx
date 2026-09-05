import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, useLayout } from "../theme";
import { useCopy } from "../copy";
import { rand } from "../motion";

/**
 * The questions that stand between a runner and their next session, drifting
 * behind the headline.
 *
 * Positions come from a seeded PRNG, never `Math.random()`: the renderer calls
 * this component once per frame, and an unseeded draw would relayout the whole
 * field 30 times a second. The seeds are the index, so both languages get the
 * same twelve positions — the shot is the same shot, only the words change.
 */

/** Rough advance width per character for Space Grotesk at a given size. */
const CHAR_WIDTH = 0.52;

export const NoiseField: React.FC<{
  /** Frame at which the field starts clearing. */
  clearAt?: number;
  clearDur?: number;
}> = ({ clearAt = 9999, clearDur = 24 }) => {
  const l = useLayout();
  const frame = useCurrentFrame();
  const questions = useCopy().questions;

  // A jittered grid rather than free scatter: pure randomness stacked three
  // fragments on the same spot and pushed the long ones off-canvas.
  const cols = l.story ? 2 : 3;
  const rowsPerBand = Math.ceil(questions.length / cols / 2);
  // Two bands, above and below the headline, so the message stays readable.
  const BANDS: [number, number][] = [
    [0.05, 0.34],
    [0.66, 0.95],
  ];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {questions.map((q, i) => {
        const seed = i + 1;
        const col = i % cols;
        const cell = Math.floor(i / cols);
        const band = BANDS[cell < rowsPerBand ? 0 : 1];
        const rowInBand = cell % rowsPerBand;

        const fontSize = (l.story ? 30 : 27) * (0.86 + rand(seed * 17.7) * 0.36);
        const halfWidth = (q.length * fontSize * CHAR_WIDTH) / 2;

        const cellW = l.width / cols;
        const jitterX = (rand(seed) - 0.5) * cellW * 0.4;
        const x = Math.min(
          Math.max(cellW * (col + 0.5) + jitterX, halfWidth + 20),
          l.width - halfWidth - 20,
        );

        const bandH = (band[1] - band[0]) * l.height;
        const rowH = bandH / rowsPerBand;
        const jitterY = (rand(seed * 3.7) - 0.5) * rowH * 0.45;
        const y = band[0] * l.height + rowH * (rowInBand + 0.5) + jitterY;

        const tilt = (rand(seed * 5.1) - 0.5) * 6;
        const speed = 0.22 + rand(seed * 7.3) * 0.5;
        const phase = rand(seed * 11.9) * Math.PI * 2;

        // Each fragment leaves on its own beat, so the field empties in a
        // ripple rather than switching off.
        const clear = interpolate(
          frame,
          [clearAt + rand(seed * 13.3) * 14, clearAt + clearDur + rand(seed * 13.3) * 14],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inQuart },
        );

        return (
          <div
            key={q}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize,
              fontWeight: 500,
              color: COLORS.faint,
              whiteSpace: "nowrap",
              opacity: (0.3 + rand(seed * 19.1) * 0.4) * clear,
              transform: [
                "translate(-50%, -50%)",
                `translateY(${Math.sin(frame * 0.02 * speed + phase) * 12}px)`,
                `rotate(${tilt}deg)`,
                `scale(${0.92 + clear * 0.08})`,
              ].join(" "),
            }}
          >
            {q}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
