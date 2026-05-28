/**
 * VinylDieCut — 480×480. Die-cut laptop sticker vibe. Rounded white card
 * with a thick black outline, hard offset shadow and an off-square
 * rotation. Reads as a sticker mock-up.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_BG_TINT, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function VinylDieCut({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

  const labelLen = zoneLabel.length;
  const labelSize =
    labelLen <= 6 ? 32 : labelLen <= 9 ? 26 : labelLen <= 11 ? 22 : 20;

  return (
    <div
      data-share-template
      data-transparent={transparent ? "true" : undefined}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#0f172a",
      }}
    >
      <BgLayer />

      {/* Hard offset shadow plate (sticker depth) */}
      <div
        style={{
          position: "absolute",
          inset: 32,
          background: "#0f172a",
          borderRadius: 48,
          transform: "translate(10px, 12px) rotate(-4deg)",
        }}
      />

      {/* Sticker body */}
      <div
        style={{
          position: "absolute",
          inset: 28,
          background: "#ffffff",
          borderRadius: 48,
          border: "6px solid #0f172a",
          transform: "rotate(-4deg)",
          display: "flex",
          flexDirection: "column",
          padding: 30,
          overflow: "hidden",
        }}
      >
        {/* Brand bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 14,
            borderBottom: "3px solid #0f172a",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Zoned
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: "#64748b",
            }}
          >
            STK · {workout.id}
          </span>
        </div>

        {/* Hero medallion */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginTop: 6,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: zoneTint,
              border: `5px solid ${zoneHex}`,
            }}
          />
          <div
            style={{
              position: "relative",
              fontSize: 130,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.06em",
              color: zoneHex,
              textShadow: "3px 3px 0 #0f172a",
            }}
          >
            Z{hero.dominantZone}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            paddingTop: 14,
            borderTop: "3px solid #0f172a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: labelSize,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            {zoneLabel}
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: "#0f172a",
            }}
          >
            {formatDurationMinutes(hero.durationMin)}
          </span>
        </div>
      </div>
    </div>
  );
}
