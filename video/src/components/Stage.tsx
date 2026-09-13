import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, fontFamily, useLayout } from "../theme";
import { LangProvider, type Lang } from "../lang";
import { useBreath, useTriangle } from "../motion";

/**
 * The paper every shot is printed on.
 *
 * Flat light ground, Space Grotesk, and three orange washes that drift on
 * different periods so the background is never twice the same frame. That
 * ambient movement is doing real work: a static ground under moving content is
 * what made the first cut read as a slide deck.
 *
 * It is also where the language enters the tree. Every film wraps itself in a
 * Stage, so publishing `lang` here means no other component has to be handed it
 * — leaves ask for it with `useLang()` the same way they ask `useLayout()` for
 * the format.
 */
export const Stage: React.FC<{ children: ReactNode; lang: Lang; style?: CSSProperties }> = ({
  children,
  lang,
  style,
}) => {
  // Three washes, deliberately coprime periods so the pattern never repeats
  // inside a film. The first one rides a triangle rather than a sine: sines all
  // reach their turning points sooner or later, and when the three coincided the
  // whole ground went still for half a second — which `bun run qa:motion`
  // reported, correctly, as a frozen shot.
  const ax = useTriangle(14, 9);
  const ay = useBreath(13, 7, 1.1);
  const bx = useBreath(17, 11, 2.3);
  const by = useBreath(19, 8, 0.6);
  const cx = useBreath(23, 13, 3.7);
  const pulse = useBreath(9, 0.02, 0.4);

  return (
    <LangProvider lang={lang}>
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.bg,
          color: COLORS.fg,
          fontFamily,
          WebkitFontSmoothing: "antialiased",
          overflow: "hidden",
          ...style,
        }}
      >
        <AbsoluteFill
          style={{
            backgroundImage: [
              `radial-gradient(circle at ${18 + ax}% ${12 + ay}%, rgba(249,115,22,${0.1 + pulse}), transparent 46%)`,
              `radial-gradient(circle at ${84 + bx}% ${88 + by}%, rgba(249,115,22,0.07), transparent 52%)`,
              `radial-gradient(circle at ${52 + cx}% ${46 - ay}%, rgba(124,58,237,0.045), transparent 44%)`,
            ].join(","),
          }}
        />
        {children}
      </AbsoluteFill>
    </LangProvider>
  );
};

/** Safe-area padding for the active format, as a column. */
export const Frame: React.FC<{
  children: ReactNode;
  style?: CSSProperties;
  /** Ignore the safe area and bleed to the canvas edges. */
  bleed?: boolean;
}> = ({ children, style, bleed = false }) => {
  const l = useLayout();
  return (
    <AbsoluteFill
      style={{
        padding: bleed ? 0 : `${l.padTop}px ${l.padX}px ${l.padBottom}px`,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
