/**
 * ZonePlate, 1080×1080 built around the six-zone plate.
 *
 * The same body six times, from a walking step to a sprint. The session's
 * dominant zone stands in full ink with the vermillon ground contact; the five
 * others are paled. It is the most explanatory template of the set, and the one
 * that reads outside the app: someone who has never opened Zoned understands
 * "this session lives here on the scale" without a legend.
 *
 * Inline styles with literal hex, html-to-image captures with `skipFonts` and
 * no CSS custom property survives. See `AccentPatch` for the one exception.
 */

import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import Zone1 from "@/assets/doodles/zone-1.svg?react";
import Zone2 from "@/assets/doodles/zone-2.svg?react";
import Zone3 from "@/assets/doodles/zone-3.svg?react";
import Zone4 from "@/assets/doodles/zone-4.svg?react";
import Zone5 from "@/assets/doodles/zone-5.svg?react";
import Zone6 from "@/assets/doodles/zone-6.svg?react";
import { BgLayer } from "./_shared";
import {
  PAPER,
  INK,
  INK_2,
  INK_PALE,
  RULE,
  RULE_PALE,
  SUNKEN,
  MONO,
  DISPLAY,
  AccentPatch,
  sessionTss,
} from "./_paper";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

/** The six drawings share one viewBox, so they sit on a single ground line. */
const ZONE_FIGURES = [Zone1, Zone2, Zone3, Zone4, Zone5, Zone6] as const;
const ZONES: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

export function ZonePlate({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const isEn = useIsEnglish();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const tss = sessionTss(hero.zoneBreakdown);

  return (
    <div
      data-share-template
      data-transparent={transparent ? "true" : undefined}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: DISPLAY,
        color: INK,
      }}
    >
      <BgLayer background={PAPER} />
      <AccentPatch />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          padding: 40,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            border: RULE,
            padding: "40px 44px 36px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header rule */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span>Zoned</span>
            <span style={{ color: INK_2 }}>
              {isEn ? "The six zones" : "Les six zones"}
            </span>
          </div>

          {/* Session */}
          <h1
            style={{
              margin: "28px 0 0",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            {name}
          </h1>
          <div
            style={{
              marginTop: 18,
              paddingBottom: 26,
              borderBottom: RULE,
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: INK_2,
            }}
          >
            {formatDurationMinutes(hero.durationMin)} · {tss} TSS ·{" "}
            {isEn ? "dominant" : "dominante"} Z{hero.dominantZone}
          </div>

          {/* What the dominant zone feels like, the plate says where, this
              says what. */}
          <p
            style={{
              margin: "auto 0",
              paddingBlock: 40,
              fontSize: 34,
              fontWeight: 500,
              lineHeight: 1.35,
              letterSpacing: "-0.015em",
              maxWidth: 820,
            }}
          >
            {pickLang(hero.zoneMeta, "sensation")}
          </p>

          {/* The plate, no gap between the cells so the six ground lines read
              as one, and no box around the dominant figure for the same
              reason: it is picked out by ink weight and a sunken ground. */}
          <div
            style={{
              // Pulled into the sheet's own padding, and each figure drawn a
              // little wider than its column: the drawings carry generous
              // empty margins, so they overlap on paper, not on ink, and the
              // six ground lines meet into one line.
              marginInline: -30,
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            {ZONES.map((zone, i) => {
              const Figure = ZONE_FIGURES[i];
              const on = zone === hero.dominantZone;
              return (
                <div
                  key={zone}
                  data-doodle={on ? "accent" : "mute"}
                  style={{
                    boxSizing: "border-box",
                    flex: 1,
                    minWidth: 0,
                    padding: "12px 0",
                    background: on ? SUNKEN : undefined,
                    color: on ? INK : INK_PALE,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Figure
                    style={{
                      width: "118%",
                      marginLeft: "-9%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: on ? RULE : RULE_PALE,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 24,
                      letterSpacing: "0.04em",
                      color: on ? INK : INK_PALE,
                    }}
                  >
                    Z{zone}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: MONO,
                      fontWeight: 500,
                      fontSize: 13,
                      lineHeight: 1.25,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: on ? INK_2 : INK_PALE,
                    }}
                  >
                    {pickLang(ZONE_META[zone], "label")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 22,
              borderTop: RULE,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: INK_2,
            }}
          >
            <span>zoned.run</span>
            <span>{workout.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
