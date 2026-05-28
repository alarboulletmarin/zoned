/**
 * SubwayMap — 1080×1080. NYC subway / Paris métro fragment. One line in
 * zone colour traverses the canvas; stations = warmup, main, cooldown
 * blocks. Background grid IS the visual — transparent disabled.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

interface Station {
  x: number;
  y: number;
  label: string;
  sub: string;
  big?: boolean;
}

export function SubwayMap({ workout }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  const warmupBlocks = workout.warmupTemplate?.length ?? 0;
  const cooldownBlocks = workout.cooldownTemplate?.length ?? 0;

  const stations: Station[] = [
    { x: 160, y: 540, label: "Warm-Up", sub: `${warmupBlocks} blocks` },
    { x: 360, y: 380, label: "Lift-Off", sub: "transition" },
    {
      x: 540,
      y: 540,
      label: zoneLabel,
      sub: `Main · Z${hero.dominantZone}`,
      big: true,
    },
    { x: 720, y: 380, label: "Descent", sub: "transition" },
    { x: 920, y: 540, label: "Cool-Down", sub: `${cooldownBlocks} blocks` },
  ];

  const nameSize = name.length <= 18 ? 64 : name.length <= 28 ? 52 : 44;

  return (
    <div
      data-share-template
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#0f172a",
        background:
          "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BrandStrip scale={1.4} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.24em",
            color: "#475569",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: zoneHex,
              display: "inline-block",
            }}
          />
          LINE Z{hero.dominantZone}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 80,
          right: 80,
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.32em",
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          Direction — {zoneLabel}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: nameSize,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: "#0f172a",
          }}
        >
          {name}
        </div>
      </div>

      {/* Line + stations */}
      <svg
        width={W}
        height={H}
        viewBox="0 0 1080 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Line shadow */}
        <path
          d={`M${stations[0].x} ${stations[0].y + 4}
            ${stations
              .slice(1)
              .map((s) => `L${s.x} ${s.y + 4}`)
              .join(" ")}`}
          fill="none"
          stroke="rgba(15,23,42,0.18)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main line */}
        <path
          d={`M${stations[0].x} ${stations[0].y}
            ${stations
              .slice(1)
              .map((s) => `L${s.x} ${s.y}`)
              .join(" ")}`}
          fill="none"
          stroke={zoneHex}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stations */}
        {stations.map((s, i) => (
          <g key={i}>
            <circle
              cx={s.x}
              cy={s.y}
              r={s.big ? 30 : 16}
              fill="#ffffff"
              stroke={zoneHex}
              strokeWidth={s.big ? 7 : 5}
            />
            {s.big && (
              <circle cx={s.x} cy={s.y} r={10} fill={zoneHex} />
            )}
          </g>
        ))}
      </svg>

      {/* Station labels (HTML so we get nicer typography) */}
      {stations.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x - 110,
            top: s.y + (s.big ? 50 : 32),
            width: 220,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: s.big ? 26 : 18,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              lineHeight: 1.1,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            {s.sub}
          </div>
        </div>
      ))}

      {/* Footer ticker */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 60,
          padding: "16px 24px",
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.16em",
        }}
      >
        <span>NEXT TRAIN · {formatDurationMinutes(hero.durationMin)}</span>
        <span style={{ color: zoneHex }}>RPE {hero.rpe}/10</span>
        <span>zoned.run · {workout.id}</span>
      </div>
    </div>
  );
}
