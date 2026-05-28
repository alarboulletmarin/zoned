/**
 * BadgeChip — 480×480. Bold solid-colour chip with zone tag + duration,
 * borders like a luggage tag. Reads instantly as a sticker.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function BadgeChip({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
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
      }}
    >
      <BgLayer />

      {/* The coloured block IS the visual — not tagged `data-bg-layer` so
          the transparent toggle does NOT hide it (only the editorial bg
          drops out, leaving the chip alone over the user's photo). */}
      <div
        style={{
          position: "absolute",
          inset: 20,
          background: zoneHex,
          border: "4px solid #0f172a",
          borderRadius: 28,
          boxShadow: "8px 8px 0 #0f172a",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: 44,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo style={{ width: 60, height: 30 }} />
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            ZONED · {workout.id}
          </span>
        </div>

        <div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
            }}
          >
            Trained · Zone {hero.dominantZone}
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 0.92,
              marginTop: 6,
            }}
          >
            {zoneLabel}
          </div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: "3px solid rgba(255,255,255,0.45)",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            <span>{formatDurationMinutes(hero.durationMin)}</span>
            <span>RPE {hero.rpe}/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
