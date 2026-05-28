/**
 * CassetteTape — 1080×1080. Horizontal audio cassette with a coloured
 * label band (zone), spinning reels (two black discs), 4 corner screws
 * and a felt strip across the bottom. Side A · tracklist replaces the
 * songs.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const ZONE_TINT: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "#cbd5e1",
  2: "#bbf7d0",
  3: "#fde68a",
  4: "#fed7aa",
  5: "#fecaca",
  6: "#ddd6fe",
};

export function CassetteTape({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_TINT[hero.dominantZone];

  const nameSize = name.length <= 16 ? 56 : name.length <= 26 ? 44 : 36;

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

      {/* Cassette body */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 200,
          bottom: 200,
          background: "#1c1917",
          borderRadius: 28,
          boxShadow:
            "inset 0 4px 12px rgba(255,255,255,0.08), 0 28px 48px rgba(15,23,42,0.35)",
          padding: 36,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Screws — 4 corners */}
        {[
          { top: 16, left: 16 },
          { top: 16, right: 16 },
          { bottom: 16, left: 16 },
          { bottom: 16, right: 16 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 32% 32%, #4b5563 0%, #1f2937 60%, #0a0a0a 100%)",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.18)",
            }}
          />
        ))}

        {/* Label sheet */}
        <div
          style={{
            background: zoneTint,
            borderRadius: 14,
            padding: 28,
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.18)",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.32em",
                  color: "#1c1917",
                }}
              >
                ZONED TAPES · C{hero.durationMin}
              </div>
              <div
                style={{
                  fontSize: nameSize,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  marginTop: 4,
                  color: "#0f172a",
                }}
              >
                {name}
              </div>
            </div>
            <div
              style={{
                background: "#0f172a",
                color: "#f8fafc",
                padding: "10px 16px",
                borderRadius: 8,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.18em",
              }}
            >
              SIDE A
            </div>
          </div>

          {/* Reels area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "20px 60px",
            }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, #1c1917 0%, #0a0a0a 70%)",
                  border: "6px solid #1c1917",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "inset 0 0 0 4px rgba(255,255,255,0.06), 0 4px 10px rgba(0,0,0,0.45)",
                }}
              >
                {/* Spokes */}
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      position: "absolute",
                      width: 8,
                      height: 70,
                      background: "#3f3f46",
                      borderRadius: 2,
                      transform: `rotate(${j * 30}deg)`,
                    }}
                  />
                ))}
                {/* Hub */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: zoneHex,
                    border: "3px solid #18181b",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Tracklist */}
          <div
            style={{
              borderTop: "2px solid rgba(15,23,42,0.32)",
              paddingTop: 14,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#1c1917",
              textTransform: "uppercase",
            }}
          >
            <span>
              01 · Warm-Up — {workout.warmupTemplate?.length ?? 0}
            </span>
            <span>
              02 · {zoneLabel} — {workout.mainSetTemplate.length}
            </span>
            <span>
              03 · Cool-Down — {workout.cooldownTemplate?.length ?? 0}
            </span>
          </div>
        </div>

        {/* Felt strip (tape window) */}
        <div
          style={{
            marginTop: 18,
            height: 36,
            background:
              "linear-gradient(180deg, #18181b 0%, #3f3f46 50%, #18181b 100%)",
            borderRadius: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "8px 24px",
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 4px, transparent 4px 8px)",
            }}
          />
        </div>
      </div>

      {/* Caption below */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "#475569",
          textTransform: "uppercase",
        }}
      >
        <span>zoned.run</span>
        <span>
          {formatDurationMinutes(hero.durationMin)} · RPE {hero.rpe}/10
        </span>
        <span>{workout.id}</span>
      </div>
    </div>
  );
}
