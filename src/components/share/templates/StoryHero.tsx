/**
 * StoryHero — 1080×1920 portrait, Insta Story format.
 *
 * Editorial hero with the SessionTimeline taking centre stage. Title
 * dominates the top, with the dominant zone in italic accent. Three stats
 * sit below the timeline, the footer carries the brand.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { SessionTimeline } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { formatDurationMinutes } from "@/components/visualization";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX, ZONE_BG_TINT } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

export function StoryHero({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library", "common"]);
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
          padding: "104px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {/* Brand */}
        <BrandStrip scale={1.6} />

        {/* Eyebrow — zone pill */}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <span
            style={{
              fontSize: 28,
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
            fontSize: 124,
            fontWeight: 700,
            lineHeight: 0.96,
            letterSpacing: "-0.045em",
            margin: 0,
            maxWidth: 880,
          }}
        >
          {name}
        </h1>

        {/* Timeline card */}
        <div
          style={{
            marginTop: "auto",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 24,
            padding: "32px 36px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#64748b",
              marginBottom: 20,
            }}
          >
            Structure
          </div>
          {/* SessionTimeline renders at ~h-40 md:h-56 so we wrap to force a
              clean ratio inside the card. */}
          <div style={{ width: "100%" }}>
            <SessionTimeline workout={workout} />
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 24,
          }}
        >
          <Stat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <Stat
            label="Niveau"
            value={t(`library:difficulty.${workout.difficulty}`)}
          />
          <Stat label="RPE" value={`${hero.rpe} / 10`} />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24 }}>
          <ShareFooter workout={workout} size={22} />
        </div>
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
        borderRadius: 18,
        padding: "22px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 18,
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
          lineHeight: 1.05,
        }}
      >
        {value}
      </span>
    </div>
  );
}
