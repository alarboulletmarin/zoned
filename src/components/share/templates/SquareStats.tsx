/**
 * SquareStats — 1080×1080 Insta Feed / Strava-style stats card.
 *
 * 4 big stats in a 2×2 grid, with a mini SessionTimeline below for context.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { SessionTimeline, formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX, ZONE_BG_TINT } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function SquareStats({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

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
          padding: "80px 88px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Header: brand + zone pill */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BrandStrip scale={1.3} />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: 999,
              background: zoneTint,
              color: zoneHex,
              letterSpacing: "0.06em",
            }}
          >
            Z{hero.dominantZone} · {zoneLabel}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.035em",
            margin: 0,
          }}
        >
          {name}
        </h1>

        {/* 2×2 Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 16,
            flex: 1,
          }}
        >
          <BigStat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <BigStat
            label="Niveau"
            value={t(`library:difficulty.${workout.difficulty}`)}
          />
          <BigStat label="RPE" value={`${hero.rpe} / 10`} />
          <BigStat label="Blocs" value={String(hero.blockCount)} />
        </div>

        {/* Mini timeline */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <SessionTimeline workout={workout} />
        </div>

        <ShareFooter workout={workout} size={18} />
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: "26px 30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
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
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
