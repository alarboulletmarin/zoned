/**
 * PolaroidSquare — 1080×1080. Off-axis polaroid photo with hand-written
 * caption in the bottom margin. Masking tape at top sells the diary feel.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const ZONE_DEEP: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#475569",
  2: "#15803d",
  3: "#854d0e",
  4: "#9a3412",
  5: "#7f1d1d",
  6: "#5b21b6",
};

export function PolaroidSquare({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneTop = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];

  // Photo title — the workout name is the hero, sized to fill the photo
  // block without clipping.
  const photoNameSize =
    name.length <= 10 ? 200 : name.length <= 16 ? 150 : name.length <= 24 ? 110 : 84;
  const captionSize = name.length <= 24 ? 38 : 30;

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

      {/* Polaroid frame */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 90,
          right: 110,
          bottom: 70,
          background: "#fafaf9",
          padding: "44px 44px 0 44px",
          transform: "rotate(-3deg)",
          boxShadow:
            "0 30px 60px rgba(15,23,42,0.22), 0 8px 18px rgba(15,23,42,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Photo area */}
        <div
          style={{
            flex: "0 0 660px",
            background: `linear-gradient(155deg, ${zoneTop} 0%, ${zoneBot} 100%)`,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Vignette + grain via radial overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.3), transparent 55%)",
            }}
          />
          {/* Hero — workout name fills the photo */}
          <div
            style={{
              position: "relative",
              padding: "0 36px",
              textAlign: "center",
              fontSize: photoNameSize,
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              color: "rgba(255,255,255,0.97)",
              textShadow: "0 6px 24px rgba(0,0,0,0.35)",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {name}
          </div>
          {/* Zone tag corner */}
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 22,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              fontWeight: 800,
              color: "#fff7ed",
              background: "rgba(15,23,42,0.42)",
              padding: "6px 12px",
              borderRadius: 4,
              letterSpacing: "0.22em",
            }}
          >
            Z{hero.dominantZone} · {zoneLabel}
          </div>
          {/* Id corner */}
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 22,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 16,
              fontWeight: 700,
              color: "#fef3c7",
              background: "rgba(15,23,42,0.36)",
              padding: "5px 10px",
              borderRadius: 4,
              letterSpacing: "0.14em",
            }}
          >
            {workout.id}
          </div>
        </div>

        {/* Hand-written caption */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              fontFamily: "Caveat, Bradley Hand, cursive",
              fontSize: captionSize,
              fontWeight: 600,
              color: "#57534e",
            }}
          >
            <span style={{ color: zoneBot, fontWeight: 700 }}>
              ● Z{hero.dominantZone} · {zoneLabel}
            </span>
            <span style={{ color: "#a8a29e" }}>·</span>
            <span>{formatDurationMinutes(hero.durationMin)}</span>
            <span style={{ color: "#a8a29e" }}>·</span>
            <span>RPE {hero.rpe}/10</span>
          </div>
        </div>
      </div>

      {/* Yellow masking tape */}
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 40,
          width: 280,
          height: 60,
          background: "rgba(251, 215, 80, 0.78)",
          borderLeft: "1px dashed rgba(120,80,0,0.18)",
          borderRight: "1px dashed rgba(120,80,0,0.18)",
          transform: "rotate(-2deg)",
          boxShadow: "0 2px 6px rgba(15,23,42,0.12)",
        }}
      />
    </div>
  );
}
