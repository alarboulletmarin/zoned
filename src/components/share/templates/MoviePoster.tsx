/**
 * MoviePoster — 1080×1920. A24-minimalist movie-poster.
 *
 * A huge colour block "image" area with the workout name as the dramatic
 * title at the bottom, plus pseudo-credits and a release line.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#475569",
  2: "#15803d",
  3: "#854d0e",
  4: "#9a3412",
  5: "#991b1b",
  6: "#5b21b6",
};

function detectMethod(workout: { name: string; nameEn: string; coachingTips?: string[]; coachingTipsEn?: string[] }): string | null {
  const haystack = [
    workout.name,
    workout.nameEn,
    ...(workout.coachingTips ?? []),
    ...(workout.coachingTipsEn ?? []),
  ].join(" ").toLowerCase();
  if (/\bseiler|polaris|polariz|80\s*\/\s*20/.test(haystack)) return "Seiler";
  if (/\b(daniels|vdot|t-?pace)/.test(haystack)) return "Daniels";
  if (/\bbillat|30\s*\/\s*30|vvo2/.test(haystack)) return "Billat";
  if (/\b(coggan|ftp|tss|if\b)/.test(haystack)) return "Coggan";
  return null;
}

export function MoviePoster({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneTop = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];
  const method = detectMethod(workout);

  // Auto-size headline to fit one line
  const nameLen = name.length;
  const headlineSize = nameLen <= 14 ? 168 : nameLen <= 22 ? 128 : nameLen <= 30 ? 96 : 76;

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
        color: "#f8fafc",
      }}
    >
      <BgLayer background="#0f172a" />

      {/* Hero image area — gradient block with abstract noise */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: H * 0.62,
          background: `linear-gradient(155deg, ${zoneTop} 0%, ${zoneBot} 100%)`,
        }}
      >
        {/* Faux film-grain shimmer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 70% 85%, rgba(0,0,0,0.30), transparent 55%)",
            pointerEvents: "none",
          }}
        />
        {/* Big zone numeral as background "icon" */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            fontSize: 420,
            fontWeight: 900,
            color: "rgba(255,255,255,0.16)",
            lineHeight: 0.8,
            letterSpacing: "-0.08em",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Z{hero.dominantZone}
        </div>
      </div>

      {/* Top bar with masthead */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "64px 80px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo style={{ width: 72, height: 36 }} />
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            ZONED
          </span>
        </div>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Workout Pictures
        </span>
      </div>

      {/* Bottom block with title + credits */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "44px 80px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          A {method ?? "Zoned"} story
        </div>
        <h1
          style={{
            fontSize: headlineSize,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.05em",
            margin: 0,
            color: "#ffffff",
            overflowWrap: "break-word",
            maxWidth: 920,
          }}
        >
          {name}
        </h1>

        {/* Credit block */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 18,
            borderTop: "2px solid rgba(255,255,255,0.25)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            lineHeight: 1.5,
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          <div>
            <span style={{ color: "#94a3b8" }}>Directed by</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              {method ?? "Zoned Coaches"}
            </span>
            <br />
            <span style={{ color: "#94a3b8" }}>Starring</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              Zone {hero.dominantZone} · {zoneLabel}
            </span>
            <br />
            <span style={{ color: "#94a3b8" }}>Runtime</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              {formatDurationMinutes(hero.durationMin)}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#94a3b8" }}>Rated</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              {t(`library:difficulty.${workout.difficulty}`)} · RPE {hero.rpe}
            </span>
            <br />
            <span style={{ color: "#94a3b8" }}>Now playing</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              zoned.run
            </span>
            <br />
            <span style={{ color: "#94a3b8" }}>Ref</span>{" "}
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              {workout.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
