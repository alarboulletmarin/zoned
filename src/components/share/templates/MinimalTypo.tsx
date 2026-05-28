/**
 * MinimalTypo — 1080×1080 editorial typographic card.
 *
 * No viz. Big italic accent on the workout name, two muted stats, brand
 * top-left, footer bottom. The most "Instagram-ready" of the bunch when
 * the user wants to overlay it on a photo (transparent toggle on).
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function MinimalTypo({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "88px 96px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BrandStrip scale={1.2} />

        {/* Big italic title */}
        <h1
          style={{
            marginTop: 88,
            marginBottom: 0,
            fontSize: 140,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            color: zoneHex,
            maxWidth: 880,
          }}
        >
          {name}
        </h1>

        {/* Zone tag */}
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#0f172a",
            textTransform: "uppercase",
          }}
        >
          Zone {hero.dominantZone} · {zoneLabel}
        </div>

        {/* Stats inline */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 56,
            paddingTop: 32,
            borderTop: "2px solid #0f172a",
          }}
        >
          <InlineStat
            label="Durée"
            value={formatDurationMinutes(hero.durationMin)}
          />
          <InlineStat
            label="Niveau"
            value={t(`library:difficulty.${workout.difficulty}`)}
          />
          <InlineStat label="RPE" value={`${hero.rpe} / 10`} />
        </div>

        <div style={{ marginTop: 28 }}>
          <ShareFooter workout={workout} size={18} />
        </div>
      </div>
    </div>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 17,
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
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
