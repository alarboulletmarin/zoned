/**
 * HolographicCard — 480×480. Iridescent chrome card (Pokémon holo / iPhone
 * foil vibe). Chromatic gradient base + diagonal foil bands + radial
 * highlight. Zone colour appears only as accent so the holo signature stays
 * dominant.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

const HOLO_GRADIENT =
  "linear-gradient(135deg, #ff6bcb 0%, #ffd86b 22%, #6bffd8 44%, #6b9bff 66%, #c66bff 86%, #ff8c6b 100%)";
const FOIL_BANDS =
  "repeating-linear-gradient(115deg, transparent 0 60px, rgba(255,255,255,0.18) 60px 90px, transparent 90px 150px)";
const HIGHLIGHT =
  "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.55), transparent 55%)";

export function HolographicCard({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

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
        color: "#ffffff",
      }}
    >
      <BgLayer />

      {/* The holographic card IS the visual — not tagged `data-bg-layer` so
          it survives the transparent toggle (only the editorial bg drops
          out, leaving the card alone on the user's photo). */}
      <div
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: 36,
          overflow: "hidden",
          background: HOLO_GRADIENT,
          boxShadow:
            "0 24px 48px -16px rgba(124,58,237,0.45), 0 8px 18px rgba(15,23,42,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: FOIL_BANDS,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: HIGHLIGHT,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 36,
            border: "3px solid rgba(255,255,255,0.55)",
            boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.18)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: 44,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Logo style={{ width: 60, height: 30 }} />
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 2px rgba(15,23,42,0.35)",
            }}
          >
            ZONED · {workout.id}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
            }}
          >
            <span
              style={{
                fontSize: 168,
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: "-0.06em",
                color: "#ffffff",
                textShadow:
                  "0 2px 0 rgba(124,58,237,0.55), 0 6px 18px rgba(15,23,42,0.35), 0 0 24px rgba(255,255,255,0.45)",
              }}
            >
              Z{hero.dominantZone}
            </span>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: zoneHex,
                boxShadow: `0 0 0 3px rgba(255,255,255,0.85), 0 2px 6px ${zoneHex}80`,
                flexShrink: 0,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(15,23,42,0.4)",
              marginTop: 2,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {zoneLabel}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            borderRadius: 16,
            background: "rgba(15,23,42,0.32)",
            border: "1px solid rgba(255,255,255,0.35)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "#ffffff",
          }}
        >
          <span>{formatDurationMinutes(hero.durationMin)}</span>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
            }}
          />
          <span>RPE {hero.rpe}/10</span>
        </div>
      </div>
    </div>
  );
}
