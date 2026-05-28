/**
 * BoxingPoster — 1080×1080. Tonight-only fight poster. Massive condensed
 * type, deep crimson burst, two ranked contestants (YOU vs Z{n}).
 * Background IS the visual.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const FIGHTER_NAME: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "The Restorer",
  2: "The Marathoner",
  3: "The Tempo Kid",
  4: "The Closer",
  5: "VO2 Striker",
  6: "Sprint Phenom",
};

export function BoxingPoster({ workout }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const accent = ZONE_HEX[hero.dominantZone];
  const fighter = FIGHTER_NAME[hero.dominantZone];

  const nameSize = name.length <= 14 ? 100 : name.length <= 22 ? 80 : name.length <= 32 ? 60 : 50;

  return (
    <div
      data-share-template
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        color: "#fef2f2",
        background:
          "radial-gradient(circle at 50% 38%, #7f1d1d 0%, #450a0a 60%, #0a0a0a 100%)",
      }}
    >
      {/* Burst rays from centre */}
      <svg
        width={W}
        height={H}
        viewBox="0 0 1080 1080"
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
      >
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 360) / 36;
          return (
            <rect
              key={i}
              x="538"
              y="0"
              width="4"
              height="540"
              fill="#fef2f2"
              transform={`rotate(${angle} 540 540)`}
            />
          );
        })}
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 95%)",
        }}
      />

      {/* TONIGHT banner */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 28px",
            background: accent,
            color: "#0a0a0a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "0.4em",
            transform: "rotate(-2deg)",
            boxShadow: "6px 6px 0 #fef2f2",
          }}
        >
          TONIGHT · MAIN EVENT
        </div>
      </div>

      {/* Fight title — workout name as the headline */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: nameSize,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: "#fef2f2",
            textShadow: `4px 4px 0 ${accent}, 8px 8px 0 rgba(0,0,0,0.45)`,
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {name}
        </div>
      </div>

      {/* Versus block — supporting matchup */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 170,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.06em",
            color: "#fff7ed",
            textShadow: `6px 6px 0 ${accent}, 10px 10px 0 rgba(0,0,0,0.45)`,
          }}
        >
          YOU
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: accent,
            textShadow: "2px 2px 0 rgba(0,0,0,0.45)",
            margin: "6px 0",
          }}
        >
          vs
        </div>
        <div
          style={{
            fontSize: 170,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.06em",
            color: "#fff7ed",
            textShadow: `6px 6px 0 ${accent}, 10px 10px 0 rgba(0,0,0,0.45)`,
          }}
        >
          Z{hero.dominantZone}
        </div>
      </div>

      {/* Round / time card */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 80,
          right: 80,
          padding: "22px 28px",
          border: `3px solid ${accent}`,
          borderRadius: 12,
          background: "rgba(15,23,42,0.45)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {[
          { l: "ROUNDS", v: `${hero.blockCount}` },
          { l: "BELL", v: formatDurationMinutes(hero.durationMin) },
          { l: "PUNCH", v: `RPE ${hero.rpe}` },
        ].map((s) => (
          <div key={s.l}>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.32em",
                color: accent,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#fff7ed",
                marginTop: 4,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Subtitle — opponent identity */}
      <div
        style={{
          position: "absolute",
          bottom: 132,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.32em",
          color: accent,
          textTransform: "uppercase",
        }}
      >
        {zoneLabel} · {fighter}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BrandStrip scale={1.1} inverted />
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.28em",
            color: "rgba(254,242,242,0.7)",
          }}
        >
          zoned.run · {workout.id}
        </span>
      </div>
    </div>
  );
}
