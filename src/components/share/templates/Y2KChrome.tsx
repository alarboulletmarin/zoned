/**
 * Y2KChrome — 1080×1080. Frutiger-Aero / WordArt nostalgia. Liquid
 * cyan-to-magenta sky, glassy bubbles, chromed `Z{n}` mega-title. Bold
 * and unapologetic. Background IS the visual.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function Y2KChrome({ workout }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const accent = ZONE_HEX[hero.dominantZone];

  const nameSize = name.length <= 14 ? 96 : name.length <= 22 ? 76 : name.length <= 32 ? 60 : 50;

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
          "linear-gradient(180deg, #38bdf8 0%, #a78bfa 50%, #f0abfc 100%)",
      }}
    >
      {/* Aurora blobs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.55), transparent 35%), radial-gradient(circle at 78% 32%, rgba(255,255,255,0.45), transparent 40%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.5), transparent 45%)",
        }}
      />

      {/* Glassy bubbles */}
      {[
        { x: 120, y: 760, r: 180 },
        { x: 880, y: 200, r: 130 },
        { x: 920, y: 880, r: 80 },
        { x: 200, y: 240, r: 60 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - b.r,
            top: b.y - b.r,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), rgba(255,255,255,0.05) 65%)",
            boxShadow: "inset 0 -8px 24px rgba(255,255,255,0.18)",
            opacity: 0.85,
          }}
        />
      ))}

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
        <BrandStrip scale={1.4} inverted />
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.32em",
            color: "#fff",
            background: "rgba(15,23,42,0.32)",
            padding: "8px 14px",
            borderRadius: 999,
            backdropFilter: "blur(4px)",
          }}
        >
          ENERGY · Z{hero.dominantZone}
        </span>
      </div>

      {/* Title slab — workout name is the hero */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 60,
          right: 60,
          padding: "32px 36px",
          background: "rgba(255,255,255,0.62)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.85)",
          borderRadius: 28,
          boxShadow: "0 20px 40px rgba(15,23,42,0.22)",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          Now Loading · {workout.id}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: nameSize,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: "#0f172a",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {name}
        </div>
      </div>

      {/* Chromed Z accent — sits below the title, smaller, signature flourish */}
      <svg
        width={W}
        height={360}
        viewBox="0 0 1080 360"
        style={{ position: "absolute", top: 540, left: 0 }}
      >
        <defs>
          <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="chromeAccent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor={accent} />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <text
          x="540"
          y="280"
          textAnchor="middle"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          fontSize="320"
          fontWeight="900"
          letterSpacing="-0.06em"
          fill="url(#chromeAccent)"
          stroke="#0f172a"
          strokeWidth="6"
          paintOrder="stroke"
          style={{
            filter:
              "drop-shadow(0 10px 0 rgba(15,23,42,0.32)) drop-shadow(0 20px 28px rgba(15,23,42,0.25))",
          }}
        >
          Z{hero.dominantZone}
        </text>
        <text
          x="540"
          y="280"
          textAnchor="middle"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          fontSize="320"
          fontWeight="900"
          letterSpacing="-0.06em"
          fill="url(#chrome)"
          opacity="0.5"
        >
          Z{hero.dominantZone}
        </text>
      </svg>

      {/* Bottom stats strip */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
          padding: "18px 26px",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.85)",
          borderRadius: 999,
          boxShadow: "0 16px 32px rgba(15,23,42,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: "#0f172a",
          textTransform: "uppercase",
        }}
      >
        <span>{zoneLabel}</span>
        <span>{formatDurationMinutes(hero.durationMin)}</span>
        <span>RPE {hero.rpe}/10</span>
      </div>
    </div>
  );
}
