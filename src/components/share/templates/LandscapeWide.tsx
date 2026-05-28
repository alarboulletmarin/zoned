/**
 * LandscapeWide — 1200×675 (16:9) for Twitter/LinkedIn.
 *
 * Left column: title + 3 stats. Right column: SessionTimeline +
 * ZoneDistribution stacked. Brand strip across the top.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import {
  SessionTimeline,
  formatDurationMinutes,
} from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX, ZONE_BG_TINT } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1200;
const H = 675;

export function LandscapeWide({ workout, transparent }: ShareTemplateProps) {
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
          padding: "44px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* Top: brand + zone pill */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BrandStrip scale={0.95} />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              padding: "8px 18px",
              borderRadius: 999,
              background: zoneTint,
              color: zoneHex,
              letterSpacing: "0.06em",
            }}
          >
            Z{hero.dominantZone} · {zoneLabel}
          </span>
        </div>

        {/* Two-column body */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left: title + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h1
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {name}
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#475569",
                lineHeight: 1.4,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {pickLang(workout, "description")}
            </p>

            <div
              style={{
                marginTop: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <Stat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
              <Stat label="Niveau" value={t(`library:difficulty.${workout.difficulty}`)} />
              <Stat label="RPE" value={`${hero.rpe} / 10`} />
            </div>
          </div>

          {/* Right: timeline + zone distribution */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ flex: "0 0 auto" }}>
              <SessionTimeline workout={workout} />
            </div>
          </div>
        </div>

        <ShareFooter workout={workout} size={14} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "#0f172a",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
