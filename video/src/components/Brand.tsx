import type { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, displayFamily, ZONES } from "../theme";
import { CURVE, useRamp } from "../motion";

/**
 * La marque : le mot « zoned. ».
 *
 * Elle était une ligne de pouls en zigzag, traversée par les six couleurs de
 * zone — le même tracé que l'ancien `public/favicon.svg`. Ce logo a été retiré
 * du projet (docs/doodles.md, « Le logo est le mot, pas une figure ») : le
 * garder ici aurait laissé le film signer avec un signe que l'app n'a plus.
 *
 * Le chantier annoncé ici — aligner la palette du film sur le système — est
 * fait : `theme.ts` porte le papier, l'encre et le vermillon, et le mot est
 * maintenant écrit comme dans l'app, Bricolage Grotesque 800, approche
 * -0,04 em, point vermillon (src/components/layout/Wordmark.tsx). Les couleurs
 * DU FILM et celles de l'app sont désormais les mêmes couleurs.
 */
export const Wordmark: React.FC<{ size: number; style?: CSSProperties }> = ({ size, style }) => (
  <span
    style={{
      fontFamily: displayFamily,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      color: COLORS.fg,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    zoned<span style={{ color: COLORS.accent }}>.</span>
  </span>
);

/**
 * Le mot qui s'écrit, de gauche à droite.
 *
 * `draw` allait à un `strokeDashoffset` : un trait se trace, un mot en contours
 * pleins ne se trace pas. Il découvre donc le mot par la gauche, ce qui dit la
 * même chose — l'écriture avance — sans faire semblant d'être un trait.
 *
 * Et il ne bat plus : le pouls avait une amplitude qui respirait après s'être
 * tracée, parce qu'une forme d'onde qui s'arrête à plat est une forme d'onde
 * morte. Un mot qui respire n'est pas ça, c'est de l'ornement.
 */
export const BrandBar: React.FC<{
  size?: number;
  draw?: number;
  style?: CSSProperties;
}> = ({ size = 62, draw = 1, style }) => (
  <div style={{ display: "flex", alignItems: "center", overflow: "hidden", ...style }}>
    <Wordmark
      size={size * 0.72}
      style={{ clipPath: `inset(-20% ${(1 - draw) * 100}% -20% 0)` }}
    />
  </div>
);

export const ZoneSweep: React.FC<{
  at: number;
  dur?: number;
  /** Thickness of the band as a share of the travel axis. */
  band?: number;
  vertical?: boolean;
}> = ({ at, dur = 26, band = 0.34, vertical = false }) => {
  // An ease-in-out, not the house snap curve: a front-loaded sweep crosses the
  // frame in its first few frames and is gone before the eye finds it.
  const p = useRamp(at, dur, CURVE.swell);
  if (p <= 0 || p >= 1) return null;

  // Travels from fully off one edge to fully off the other.
  const offset = -band + p * (1 + band * 2);
  const axis = vertical ? "180deg" : "90deg";
  // Blended, not banded, and the six stops are the effort ramp itself: the wipe
  // reads as the whole scale passing through the frame rather than a colour
  // test card. On the ink ramp it is a sweep of light to dark, which is also
  // exactly what the ramp means.
  const stops = ZONES.map((z, i) => `${z.hex} ${(i / (ZONES.length - 1)) * 100}%`).join(",");
  const fade = `linear-gradient(${axis}, transparent, black 14%, black 86%, transparent)`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...(vertical
            ? { left: 0, right: 0, top: `${offset * 100}%`, height: `${band * 100}%` }
            : { top: 0, bottom: 0, left: `${offset * 100}%`, width: `${band * 100}%` }),
          backgroundImage: `linear-gradient(${axis}, ${stops})`,
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />
    </AbsoluteFill>
  );
};
