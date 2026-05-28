/**
 * SpotifyWrapSquare — 1080×1080. Square variant of the SpotifyWrap recap
 * style, sized for Insta Feed posts.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#475569",
  2: "#15803d",
  3: "#854d0e",
  4: "#9a3412",
  5: "#991b1b",
  6: "#5b21b6",
};

export function SpotifyWrapSquare({ workout }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneTop = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];

  const nameLen = name.length;
  const nameSize = nameLen <= 12 ? 132 : nameLen <= 20 ? 96 : nameLen <= 28 ? 76 : 60;

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
          padding: "64px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo style={{ width: 64, height: 32 }} />
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
              ZONED
            </span>
          </div>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Ta séance #1
          </span>
        </div>

        {/* Big title rotated */}
        <h1
          style={{
            marginTop: 50,
            fontSize: nameSize,
            fontWeight: 900,
            lineHeight: 0.86,
            letterSpacing: "-0.05em",
            margin: "50px 0 0",
            transform: "rotate(-2deg)",
            transformOrigin: "left top",
            overflowWrap: "break-word",
          }}
        >
          {name}
        </h1>

        {/* Stats stacked */}
        <div
          style={{
            marginTop: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <BigStat number={formatDurationMinutes(hero.durationMin)} label="durée" rotate={-1.2} />
          <BigStat number={`Z${hero.dominantZone}`} label={zoneLabel} rotate={1.4} accent={zoneTop} />
          <BigStat number={`${hero.rpe}/10`} label="RPE" rotate={-1} />
          <BigStat number={t(`library:difficulty.${workout.difficulty}`)} label="niveau" rotate={1.1} />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.18)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 14,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
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
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: accent ?? "#ffffff",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 18,
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
