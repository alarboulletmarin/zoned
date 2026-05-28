/**
 * AlbumCover — 1080×1080. Duotone vinyl cover homage. Joy Division
 * `Unknown Pleasures`–style waveform built from the workout's zone
 * breakdown. Side-A tracklist replaces the songs. Background is the
 * visual — transparent disabled.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#1e293b",
  2: "#052e16",
  3: "#3f2e02",
  4: "#3f1605",
  5: "#3f0a0a",
  6: "#26115e",
};

export function AlbumCover({ workout }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zone = hero.dominantZone;
  const accent = ZONE_HEX[zone];
  const bg = ZONE_DEEP[zone];

  // Build 26 ridge lines like Unknown Pleasures. Amplitude grows then
  // falls — mimics a session shape (warmup → main → cooldown).
  const lines = 26;
  const ridges = Array.from({ length: lines }, (_, i) => i);

  const nameSize = name.length <= 16 ? 110 : name.length <= 26 ? 86 : 70;

  return (
    <div
      data-share-template
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#f8fafc",
        background: bg,
      }}
    >
      {/* Subtle film grain via two radial gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 80% 12%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(circle at 12% 88%, rgba(0,0,0,0.4), transparent 60%)",
        }}
      />

      {/* Top label band */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 16,
          borderBottom: "2px solid rgba(248,250,252,0.25)",
        }}
      >
        <BrandStrip scale={1.3} inverted />
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.38em",
            color: "rgba(248,250,252,0.7)",
          }}
        >
          ZND-{workout.id}
        </span>
      </div>

      {/* Ridges waveform */}
      <svg
        width="100%"
        height={420}
        viewBox="0 0 1080 420"
        style={{
          position: "absolute",
          left: 0,
          top: 220,
        }}
        preserveAspectRatio="none"
      >
        {ridges.map((i) => {
          const t = i / (lines - 1);
          const envelope = Math.sin(t * Math.PI); // bell curve
          const y = 40 + i * 13;
          // Build a pseudo-random ridge using sine + cosine layers seeded by zone.
          const seg = 24;
          const segWidth = 1080 / seg;
          const points: string[] = [];
          for (let s = 0; s <= seg; s++) {
            const x = s * segWidth;
            const noise =
              Math.sin(s * 0.9 + i * 0.7 + zone) * 0.5 +
              Math.cos(s * 1.7 + i * 0.4) * 0.5;
            const amp = 70 * envelope * (0.55 + 0.45 * Math.abs(noise));
            const cy = y - amp * Math.pow(Math.sin((s / seg) * Math.PI), 1.5);
            points.push(`${x},${cy.toFixed(1)}`);
          }
          const path = `M0,${y + 10} L${points.join(" L")} L1080,${y + 10} Z`;
          return (
            <g key={i}>
              <path d={path} fill={bg} stroke={accent} strokeWidth={1.3} />
            </g>
          );
        })}
      </svg>

      {/* Title block */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 280,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.36em",
            color: accent,
          }}
        >
          SIDE A · Z{zone}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: nameSize,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            color: "#f8fafc",
          }}
        >
          {name}
        </div>
      </div>

      {/* Tracklist */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 96,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 18,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "rgba(248,250,252,0.78)",
          borderTop: "1px solid rgba(248,250,252,0.25)",
          paddingTop: 16,
        }}
      >
        <div>
          <div style={{ color: accent, fontWeight: 800, letterSpacing: "0.22em" }}>
            01. WARM-UP
          </div>
          <div style={{ marginTop: 4, color: "rgba(248,250,252,0.6)" }}>
            {workout.warmupTemplate?.length ?? 0} blocks
          </div>
        </div>
        <div>
          <div style={{ color: accent, fontWeight: 800, letterSpacing: "0.22em" }}>
            02. MAIN SET
          </div>
          <div style={{ marginTop: 4, color: "rgba(248,250,252,0.6)" }}>
            {workout.mainSetTemplate.length} blocks
          </div>
        </div>
        <div>
          <div style={{ color: accent, fontWeight: 800, letterSpacing: "0.22em" }}>
            03. COOL-DOWN
          </div>
          <div style={{ marginTop: 4, color: "rgba(248,250,252,0.6)" }}>
            {workout.cooldownTemplate?.length ?? 0} blocks
          </div>
        </div>
      </div>

      {/* Total runtime */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 40,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.22em",
          color: accent,
        }}
      >
        TOTAL {formatDurationMinutes(hero.durationMin)} · RPE {hero.rpe}/10
      </div>
    </div>
  );
}
