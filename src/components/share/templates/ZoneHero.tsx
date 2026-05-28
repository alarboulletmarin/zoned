/**
 * ZoneHero — 1080×1920 portrait, plein-bleed dégradé coloured by the
 * dominant zone.
 *
 * The background IS the visual: a soft 2-stop gradient from the dominant
 * zone colour to a deeper end. Stats overlay in white. This template does
 * not support transparent mode (the toggle is disabled in the dialog).
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, ShareFooter, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

/** Manually picked darker companion to make a depth gradient. */
const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#475569",
  2: "#15803d",
  3: "#854d0e",
  4: "#9a3412",
  5: "#991b1b",
  6: "#5b21b6",
};

export function ZoneHero({ workout }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneTop = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];

  // Scale the giant zone label to fit on one line — content width is
  // 1080 − 96 × 2 ≈ 888 px. Without this, "Récupération" (12 chars) clips.
  const labelLen = zoneLabel.length;
  const labelSize = labelLen <= 6 ? 200 : labelLen <= 9 ? 160 : 130;

  return (
    <div
      data-share-template
      // Transparent toggle is disabled for this template — bg is the visual.
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#ffffff",
        background: `linear-gradient(160deg, ${zoneTop} 0%, ${zoneBot} 100%)`,
      }}
    >
      {/* Subtle vignette for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 18%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(circle at 75% 88%, rgba(0,0,0,0.18), transparent 55%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "104px 96px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Brand — inverted (white over zone colour) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <BrandStrip scale={1.6} inverted />
        </div>

        {/* Massive zone tag */}
        <div
          style={{
            marginTop: 120,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Zone {hero.dominantZone}
        </div>
        <div
          style={{
            fontSize: labelSize,
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            marginTop: 8,
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {zoneLabel}
        </div>

        {/* Workout name */}
        <h1
          style={{
            marginTop: 56,
            fontSize: 64,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 1,
            letterSpacing: "-0.025em",
            margin: 0,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 880,
          }}
        >
          {name}
        </h1>

        {/* Stats chips */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <Chip label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <Chip
            label="Niveau"
            value={t(`library:difficulty.${workout.difficulty}`)}
          />
          <Chip label="RPE" value={`${hero.rpe} / 10`} />
          <Chip label="Blocs" value={String(hero.blockCount)} />
        </div>

        <div style={{ marginTop: 36 }}>
          <ShareFooter workout={workout} size={22} inverted />
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(6px)",
        borderRadius: 999,
        padding: "16px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
