/**
 * PeriodicElement — 1080×1080. Single periodic-table cell. Atomic number =
 * duration minutes. Symbol = Z{n}. Element name = zoneLabel. Atomic weight
 * row = RPE / blocks. Plays the scientific identity head-on.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, BrandStrip, ShareFooter, ZONE_BG_TINT, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function PeriodicElement({
  workout,
  transparent,
}: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

  const labelLen = zoneLabel.length;
  const labelSize =
    labelLen <= 6 ? 56 : labelLen <= 9 ? 46 : labelLen <= 11 ? 38 : 32;
  const nameSize = name.length <= 18 ? 72 : name.length <= 28 ? 58 : 46;

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

      {/* Brand top */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BrandStrip scale={1.4} />
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Elementus Cursor
        </span>
      </div>

      {/* Workout name — hero */}
      <div
        style={{
          position: "absolute",
          top: 138,
          left: 60,
          right: 60,
        }}
      >
        <div
          style={{
            fontSize: nameSize,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.96,
            color: "#0f172a",
          }}
        >
          {name}
        </div>
      </div>

      {/* Periodic cell — slightly smaller to free the title */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 320,
          width: 680,
          height: 620,
          background: zoneTint,
          border: `4px solid ${zoneHex}`,
          boxShadow: `12px 12px 0 ${zoneHex}, 0 24px 48px rgba(15,23,42,0.18)`,
          display: "flex",
          flexDirection: "column",
          padding: 48,
        }}
      >
        {/* Top row : atomic number + RPE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: zoneHex,
            }}
          >
            {hero.durationMin}
          </span>
          <div
            style={{
              textAlign: "right",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.18em",
                color: "#64748b",
              }}
            >
              RPE
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1,
              }}
            >
              {hero.rpe}/10
            </div>
          </div>
        </div>

        {/* Symbol */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 320,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-0.06em",
              color: "#0f172a",
            }}
          >
            Z{hero.dominantZone}
          </span>
        </div>

        {/* Name + footer row */}
        <div>
          <div
            style={{
              fontSize: labelSize,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "#0f172a",
              textTransform: "capitalize",
            }}
          >
            {zoneLabel}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            <span>{hero.blockCount} blocks</span>
            <span>{formatDurationMinutes(hero.durationMin)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 36,
        }}
      >
        <ShareFooter workout={workout} />
      </div>
    </div>
  );
}
