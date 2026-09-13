import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, useLayout } from "../theme";

/**
 * A band of real session names scrolling forever.
 *
 * Two jobs. It is the one element that is still moving when everything else has
 * landed, so an act built on it can never go static. And the names are the
 * actual catalogue, sampled across every category by `bun run sync` — the scale
 * of the library is shown rather than asserted.
 *
 * The loop is seamless because the strip holds two copies of the list and
 * travels exactly half its own width.
 */
export const Marquee: React.FC<{
  items: string[];
  /** Copies traversed per second. 0.06 is a slow drift. */
  speed?: number;
  reverse?: boolean;
  size?: number;
  opacity?: number;
  style?: CSSProperties;
}> = ({ items, speed = 0.06, reverse = false, size, opacity = 1, style }) => {
  const l = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const travelled = ((frame / fps) * speed * 50) % 50;
  const offset = reverse ? travelled - 50 : -travelled;

  const strip = [...items, ...items];

  return (
    <div
      style={{
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          alignItems: "center",
          gap: l.story ? 26 : 30,
          transform: `translateX(${offset}%)`,
        }}
      >
        {strip.map((item, i) => (
          <span
            key={`${item}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: l.story ? 26 : 30,
              fontSize: size ?? (l.story ? 30 : 27),
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: COLORS.sub,
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span style={{ color: COLORS.accent, opacity: 0.55 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
};
