import type { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, ZONES } from "../theme";
import { CURVE, useRamp } from "../motion";

/**
 * La marque : le mot « zoned. ».
 *
 * Elle était une ligne de pouls en zigzag, traversée par les six couleurs de
 * zone — le même tracé que l'ancien `public/favicon.svg`. Ce logo a été retiré
 * du projet (docs/doodles.md, « Le logo est le mot, pas une figure ») : le
 * garder ici aurait laissé le film signer avec un signe que l'app n'a plus.
 *
 * À faire un jour, et qui n'est PAS ce changement-ci : ce sous-projet a sa
 * propre palette, d'avant la refonte — `COLORS.fg` est un bleu ardoise et
 * `COLORS.accent` un orange, là où l'app est encre sur papier avec un
 * vermillon. Le mot suit donc les couleurs DU FILM pour rester cohérent avec
 * les trente autres plans, et non celles de l'app. Aligner la palette du film
 * sur le système est un chantier à part.
 */
export const Wordmark: React.FC<{ size: number; style?: CSSProperties }> = ({ size, style }) => (
  <span
    style={{
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
  // Blended, not banded: the same six stops as the mark's own gradient, so the
  // wipe reads as the logo passing through rather than a colour test card.
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
