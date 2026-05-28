/**
 * CoffeeStamp — 480×480. Loyalty card vibe. Five circular slots with the
 * last one stamped using the zone colour. Plays the "1 session closer to
 * your goal" metaphor.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function CoffeeStamp({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const slots = [false, false, false, false, true];

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
        color: "#1c1917",
      }}
    >
      <BgLayer />

      {/* Loyalty card — kraft paper feel */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          background: "#faf6ed",
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 8px, rgba(120,90,50,0.04) 8px 9px)",
          borderRadius: 24,
          border: "3px dashed #c8a96a",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 12px 28px rgba(28,25,23,0.15)",
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Logo style={{ width: 50, height: 25, opacity: 0.85 }} />
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.22em",
                color: "#78716c",
              }}
            >
              No. {workout.id}
            </span>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Zoned Loyalty
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#78716c",
              marginTop: 4,
            }}
          >
            Train · Recover · Repeat
          </div>
        </div>

        {/* Stamp row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 4px",
          }}
        >
          {slots.map((stamped, i) => (
            <div
              key={i}
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                border: stamped
                  ? `3px solid ${zoneHex}`
                  : "2.5px dashed #a8a29e",
                background: stamped ? zoneHex : "transparent",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: stamped ? "rotate(-8deg)" : "none",
                boxShadow: stamped
                  ? `0 4px 12px ${zoneHex}55`
                  : "none",
              }}
            >
              {stamped ? (
                <span
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color: "#ffffff",
                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  Z{hero.dominantZone}
                  <br />
                  ✓
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#a8a29e",
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "2px solid #c8a96a",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#44403c",
          }}
        >
          <span style={{ textTransform: "uppercase" }}>{zoneLabel}</span>
          <span>{formatDurationMinutes(hero.durationMin)}</span>
        </div>
      </div>
    </div>
  );
}
