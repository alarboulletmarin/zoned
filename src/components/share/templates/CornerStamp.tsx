/**
 * CornerStamp — 480×480. Small square sticker designed to sit in the
 * corner of a user's photo. Minimal info: zone, duration, ID. Outer ring
 * mimics a vintage hand-stamp.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function CornerStamp({ workout, transparent }: ShareTemplateProps) {
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
        color: "#0f172a",
      }}
    >
      <BgLayer />

      {/* The white disc IS the visual identity — keep it visible in
          transparent mode (only the editorial bg drops out). */}
      <div
        style={{
          position: "absolute",
          inset: 28,
          borderRadius: "50%",
          background: "#ffffff",
          border: `4px solid ${zoneHex}`,
          boxShadow: `inset 0 0 0 12px #ffffff, 0 8px 24px rgba(15,23,42,0.16)`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: 36,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Logo style={{ width: 60, height: 30 }} />
        <div
          style={{
            marginTop: 6,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Trained
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: zoneHex,
          }}
        >
          Z{hero.dominantZone}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0f172a",
          }}
        >
          {zoneLabel}
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: `2px solid ${zoneHex}`,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0f172a",
          }}
        >
          {formatDurationMinutes(hero.durationMin)} · {workout.id}
        </div>
      </div>
    </div>
  );
}
