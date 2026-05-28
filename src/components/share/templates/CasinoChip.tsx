/**
 * CasinoChip — 480×480. Concentric poker chip. Outer dashed ring of paired
 * stripes, inner solid ring, white centre disc holding the zone tag and
 * duration. Chip-shaped visual survives transparent toggle.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function CasinoChip({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  // Build 8 segment markers around the chip — repeating stripes of white
  // over the colour, classic casino look.
  const segments = Array.from({ length: 8 });

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

      {/* Outer disc */}
      <div
        style={{
          position: "absolute",
          inset: 20,
          borderRadius: "50%",
          background: zoneHex,
          boxShadow: `
            inset 0 0 0 6px rgba(255,255,255,0.85),
            inset 0 0 0 10px ${zoneHex},
            0 14px 30px rgba(15,23,42,0.28)
          `,
        }}
      />

      {/* White stripes around the rim — 8 evenly spaced wedges */}
      {segments.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 56,
            height: 92,
            marginLeft: -28,
            marginTop: -220,
            background: "#ffffff",
            transformOrigin: "50% 200px",
            transform: `rotate(${i * 45}deg)`,
            borderRadius: 4,
            boxShadow: "inset 0 0 0 3px rgba(15,23,42,0.06)",
          }}
        />
      ))}

      {/* Inner ring */}
      <div
        style={{
          position: "absolute",
          inset: 100,
          borderRadius: "50%",
          background: "#ffffff",
          border: `5px dashed ${zoneHex}`,
          boxShadow: "inset 0 0 0 8px #ffffff, 0 4px 10px rgba(15,23,42,0.12)",
        }}
      />

      {/* Centre disc */}
      <div
        style={{
          position: "absolute",
          inset: 130,
          borderRadius: "50%",
          background: "#ffffff",
          border: `3px solid ${zoneHex}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          textAlign: "center",
        }}
      >
        <Logo style={{ width: 44, height: 22, opacity: 0.9 }} />
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            color: zoneHex,
            marginTop: 2,
          }}
        >
          Z{hero.dominantZone}
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "#0f172a",
            marginTop: 2,
          }}
        >
          {formatDurationMinutes(hero.durationMin)}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#64748b",
            marginTop: 4,
          }}
        >
          {zoneLabel}
        </div>
      </div>
    </div>
  );
}
