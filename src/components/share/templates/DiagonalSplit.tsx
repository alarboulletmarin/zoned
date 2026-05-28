/**
 * DiagonalSplit — 1080×1080. A bold diagonal split with the dominant zone
 * colour filling the upper-left triangle and an off-white lower-right.
 *
 * Workout name lives in the white triangle on the right; brand + zone tag
 * sit on the coloured triangle on the left. Geometric Swiss-poster vibe.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ShareFooter, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function DiagonalSplit({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  // Coloured side is ~46% of the 1080 canvas → ~500px usable. At 96px the
  // longer labels ("Récupération") clip. Tier by length.
  const labelLen = zoneLabel.length;
  const zoneLabelSize =
    labelLen <= 6 ? 96 : labelLen <= 9 ? 80 : labelLen <= 11 ? 68 : 58;

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

      {/* The coloured triangle — drawn with a sharp linear-gradient stop.
          Sits above BgLayer (when transparent, BgLayer is hidden and the
          triangle is the only painted shape: still works as overlay). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(118deg, ${zoneHex} 0%, ${zoneHex} 46%, transparent 46.2%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "84px 84px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top row: brand on the colored side (inverted) + zone tag */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo style={{ width: 72, height: 36 }} />
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              Zoned
            </span>
          </div>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              padding: "8px 18px",
              borderRadius: 999,
              border: "2px solid #0f172a",
              color: "#0f172a",
            }}
          >
            {workout.id}
          </span>
        </div>

        {/* Zone label on the colored side */}
        <div
          style={{
            marginTop: 56,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Zone {hero.dominantZone}
          </div>
          <div
            style={{
              fontSize: zoneLabelSize,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              marginTop: 8,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {zoneLabel}
          </div>
        </div>

        {/* Workout name on the white side */}
        <h1
          style={{
            marginTop: "auto",
            fontSize: 80,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 0.96,
            letterSpacing: "-0.04em",
            color: "#0f172a",
            margin: 0,
            textAlign: "right",
            alignSelf: "flex-end",
            maxWidth: 660,
            overflowWrap: "break-word",
          }}
        >
          {name}
        </h1>

        {/* Stats row bottom */}
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            paddingTop: 24,
            borderTop: "2px solid #0f172a",
          }}
        >
          <StatCell label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <StatCell label="Niveau" value={t(`library:difficulty.${workout.difficulty}`)} />
          <StatCell label="RPE" value={`${hero.rpe} / 10`} />
        </div>

        <div style={{ marginTop: 20 }}>
          <ShareFooter workout={workout} size={18} />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "#0f172a",
          lineHeight: 1.05,
        }}
      >
        {value}
      </span>
    </div>
  );
}
