/**
 * HighlightBanner — 1080×360. Wide horizontal sticker designed to sit
 * across the bottom of a user's own landscape photo.
 *
 * Compact: workout name + zone pill on the left, 3 stats on the right.
 * Transparent-friendly so it overlays cleanly on photography.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX, ZONE_BG_TINT } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 360;

export function HighlightBanner({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

  const nameLen = name.length;
  const nameSize = nameLen <= 16 ? 52 : nameLen <= 24 ? 42 : 36;

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

      {/* Card with soft shadow — stays visible in transparent mode so the
          banner reads cleanly when overlaid on a photo (only the
          editorial canvas around it drops out). */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          background: "#ffffff",
          border: "2px solid #0f172a",
          borderRadius: 20,
          boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "36px 44px",
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Left: brand + name */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo style={{ width: 56, height: 28 }} />
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
              ZONED
            </span>
            <span
              style={{
                marginLeft: 8,
                padding: "4px 12px",
                borderRadius: 999,
                background: zoneTint,
                color: zoneHex,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Z{hero.dominantZone} · {zoneLabel}
            </span>
          </div>
          <h1
            style={{
              fontSize: nameSize,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              margin: 0,
              overflowWrap: "break-word",
            }}
          >
            {name}
          </h1>
        </div>

        {/* Right: vertical separator + 3 stats */}
        <div
          style={{
            height: 220,
            width: 2,
            background: "#0f172a",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, auto)",
            gap: 28,
          }}
        >
          <Stat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <Stat label="Zone" value={`Z${hero.dominantZone}`} color={zoneHex} />
          <Stat label="RPE" value={`${hero.rpe}`} />
        </div>
      </div>

      {/* Mini workout id bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 36,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "#64748b",
          textTransform: "uppercase",
          zIndex: 2,
        }}
      >
        zoned.run · {workout.id}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 52,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: color ?? "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
