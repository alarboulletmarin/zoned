/**
 * SpotifyWrap — 1080×1920. Bold flashy gradient + outsized typography,
 * playful angled wordmarks. Inspired by Spotify Wrapped recap cards.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#475569",
  2: "#15803d",
  3: "#854d0e",
  4: "#9a3412",
  5: "#991b1b",
  6: "#5b21b6",
};

export function SpotifyWrap({ workout }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneTop = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];

  return (
    <div
      data-share-template
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#ffffff",
        background: `radial-gradient(circle at 20% 0%, ${zoneTop} 0%, transparent 55%), radial-gradient(circle at 100% 100%, ${zoneBot} 0%, transparent 60%), #0f172a`,
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "96px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Eyebrow + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo style={{ width: 80, height: 40 }} />
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            ZONED
          </span>
        </div>

        {/* Big tagline */}
        <div style={{ marginTop: 80 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Ta séance #1
          </div>
          <h1
            style={{
              marginTop: 8,
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 0.86,
              letterSpacing: "-0.05em",
              margin: 0,
              transform: "rotate(-2deg)",
              transformOrigin: "left top",
              overflowWrap: "break-word",
              maxWidth: 900,
            }}
          >
            {name}
          </h1>
        </div>

        {/* Stats blowups */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <BigStat number={formatDurationMinutes(hero.durationMin)} label="durée totale" rotate={-1} />
          <BigStat number={`Z${hero.dominantZone}`} label={`zone · ${zoneLabel}`} rotate={1.2} accent={zoneTop} />
          <BigStat number={`${hero.rpe}/10`} label={`RPE · ${t(`library:difficulty.${workout.difficulty}`)}`} rotate={-1.5} />
        </div>

        {/* Footer flair */}
        <div
          style={{
            marginTop: 40,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>zoned.run</span>
          <span>{workout.id}</span>
        </div>
      </div>
    </div>
  );
}

function BigStat({
  number,
  label,
  rotate = 0,
  accent,
}: {
  number: string;
  label: string;
  rotate?: number;
  accent?: string;
}) {
  return (
    <div style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "left center" }}>
      <div
        style={{
          fontSize: 128,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          color: accent ?? "#ffffff",
          lineHeight: 0.9,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.78)",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}
