/**
 * TradingCard — 1080×1080. NBA-style trading card. Double border, hero
 * portrait block in zone colour, stats panel, signature. The card IS the
 * visual.
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

const ROLE: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "Recovery Specialist",
  2: "Endurance Anchor",
  3: "Tempo Operator",
  4: "Threshold Closer",
  5: "VO2 Striker",
  6: "Sprint Phenom",
};

export function TradingCard({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneBot = ZONE_DEEP[hero.dominantZone];
  const role = ROLE[hero.dominantZone];

  const nameSize = name.length <= 14 ? 96 : name.length <= 22 ? 76 : name.length <= 32 ? 60 : 50;

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

      {/* Outer gold border */}
      <div
        style={{
          position: "absolute",
          inset: 40,
          padding: 12,
          background:
            "linear-gradient(135deg, #fde68a 0%, #d4a017 45%, #8b6914 100%)",
          borderRadius: 28,
          boxShadow: "0 24px 48px rgba(15,23,42,0.22)",
        }}
      >
        {/* Inner card */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 18,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header bar */}
          <div
            style={{
              padding: "22px 30px",
              background: zoneHex,
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `4px solid ${zoneBot}`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                Team Zoned · Series 26
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  marginTop: 2,
                }}
              >
                {role}
              </div>
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.16em",
                background: "rgba(15,23,42,0.32)",
                padding: "6px 14px",
                borderRadius: 8,
              }}
            >
              #{workout.id}
            </div>
          </div>

          {/* Body — portrait block + stats column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              padding: 30,
              gap: 26,
            }}
          >
            {/* Portrait block — duotone emblem + Z tag (smaller, hero is the name) */}
            <div
              style={{
                flex: "0 0 320px",
                background: `linear-gradient(155deg, ${zoneHex} 0%, ${zoneBot} 100%)`,
                borderRadius: 14,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Diamond pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent 0 22px, rgba(255,255,255,0.06) 22px 24px), repeating-linear-gradient(-45deg, transparent 0 22px, rgba(255,255,255,0.06) 22px 24px)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "#ffffff",
                  textShadow: "0 4px 16px rgba(0,0,0,0.32)",
                }}
              >
                <span
                  style={{
                    fontSize: 220,
                    fontWeight: 900,
                    lineHeight: 0.85,
                    letterSpacing: "-0.06em",
                  }}
                >
                  Z{hero.dominantZone}
                </span>
                <span
                  style={{
                    marginTop: 10,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                  }}
                >
                  {zoneLabel}
                </span>
              </div>
            </div>

            {/* Stats column — title hero */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: zoneHex,
                  }}
                >
                  Featured Session
                </div>
                <div
                  style={{
                    marginTop: 6,
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

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "DUR", value: formatDurationMinutes(hero.durationMin) },
                  { label: "RPE", value: `${hero.rpe}/10` },
                  { label: "BLOCKS", value: `${hero.blockCount}` },
                  { label: "ZONE", value: zoneLabel },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      paddingBottom: 8,
                      borderBottom: "1.5px solid #e2e8f0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 13,
                        fontWeight: 800,
                        letterSpacing: "0.28em",
                        color: "#94a3b8",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        color: "#0f172a",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Faux signature */}
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 18,
                  borderTop: `2px dashed ${zoneHex}`,
                  fontFamily: "Caveat, Bradley Hand, cursive",
                  fontSize: 44,
                  color: zoneBot,
                  lineHeight: 1,
                }}
              >
                Coach Zoned
                <div
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.24em",
                    color: "#64748b",
                    marginTop: 2,
                  }}
                >
                  AUTHENTICATED · zoned.run
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
