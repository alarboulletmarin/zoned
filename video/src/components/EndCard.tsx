import { COLORS, URL_LABEL, useLayout } from "../theme";
import { useCopy } from "../copy";
import { CURVE, useEnter, useRamp } from "../motion";
import { BrandBar } from "./Brand";
import { Frame } from "./Stage";
import { Reveal } from "./Type";

/**
 * The closing plate: mark, promise, address.
 *
 * Anchored top and bottom rather than centred as one block — a single centred
 * slab reads as a slide, two anchored blocks read as a poster, and the vertical
 * cut needs the address clear of the platform's action bar anyway.
 *
 * La marque s'écrit de gauche à droite puis s'arrête. Elle battait, du temps où
 * elle était une ligne de pouls : une forme d'onde qui s'immobilise à plat est
 * une forme d'onde morte, donc elle respirait. Le mot n'a pas ce problème — il
 * n'a jamais l'air en panne — et un mot qui respire serait de l'ornement.
 */
export const EndCard: React.FC<{
  at?: number;
  /** Overrides the default promise line, broken into its lines. */
  tagline?: string[];
  /** Small print under the address. */
  footnote?: string;
}> = ({ at = 0, tagline, footnote }) => {
  const l = useLayout();
  const copy = useCopy();
  const lines = tagline ?? copy.endCard.tagline;
  const smallPrint = footnote ?? copy.endCard.footnote;
  const draw = useRamp(at, 32, CURVE.glide);
  const brand = useEnter(at, { dur: 26, y: 20, blur: 5 });
  const rule = useRamp(at + 20, 28, CURVE.snap);
  const foot = useEnter(at + 30, { dur: 24, y: 14, blur: 3 });

  return (
    <Frame style={{ justifyContent: "space-between" }}>
      <div style={brand}>
        <BrandBar size={l.story ? 92 : 78} draw={draw} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          fontSize: l.story ? 92 : 104,
          fontWeight: 700,
          letterSpacing: "-0.045em",
          lineHeight: 1.0,
        }}
      >
        <div>
          {lines.map((line, i) => (
            <Reveal key={i} at={at + 8 + i * 7} dur={34} skew={1.2}>
              {line}
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <div
          style={{
            height: 2,
            background: COLORS.fg,
            transformOrigin: "left center",
            transform: `scaleX(${rule})`,
          }}
        />
        <div
          style={{
            paddingTop: l.story ? 34 : 28,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <Reveal at={at + 24} dur={30}>
            <span
              style={{
                fontSize: l.story ? 76 : 66,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                color: COLORS.accent,
              }}
            >
              {URL_LABEL}
            </span>
          </Reveal>
          <div
            style={{
              ...foot,
              fontSize: l.story ? 25 : 23,
              fontWeight: 500,
              color: COLORS.muted,
              textAlign: "right",
              maxWidth: l.story ? "16ch" : "none",
              lineHeight: 1.3,
            }}
          >
            {smallPrint}
          </div>
        </div>
      </div>
    </Frame>
  );
};
