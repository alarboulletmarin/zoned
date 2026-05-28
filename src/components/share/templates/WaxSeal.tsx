/**
 * WaxSeal — 480×480. Embossed crimson wax seal with ribbon. Hot-stamped
 * Z{n} at the center. Letterpress depth via inner shadows. The seal IS
 * the visual — survives transparent toggle.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

const WAX_HEX: Record<1 | 2 | 3 | 4 | 5 | 6, [string, string, string]> = {
  1: ["#475569", "#64748b", "#1e293b"], // slate
  2: ["#15803d", "#22c55e", "#052e16"], // green
  3: ["#854d0e", "#ca8a04", "#3f2e02"], // amber
  4: ["#9a3412", "#f97316", "#3f1605"], // orange
  5: ["#7f1d1d", "#dc2626", "#3f0a0a"], // crimson
  6: ["#5b21b6", "#7c3aed", "#26115e"], // violet
};

export function WaxSeal({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const [waxDeep, waxLight, waxShadow] = WAX_HEX[hero.dominantZone];
  const accent = ZONE_HEX[hero.dominantZone];

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

      {/* Ribbon — sits behind the seal, two-tone fold below. */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 60,
          height: 360,
          background: "#1e293b",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)",
          boxShadow: "0 18px 24px rgba(15,23,42,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 60,
          height: 360,
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 12px)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)",
        }}
      />

      {/* Seal disc — raised wax. */}
      <div
        style={{
          position: "absolute",
          inset: 60,
          borderRadius: "50%",
          background: `radial-gradient(circle at 32% 28%, ${waxLight} 0%, ${waxDeep} 55%, ${waxShadow} 100%)`,
          boxShadow: `
            inset 0 6px 12px rgba(255,255,255,0.18),
            inset 0 -12px 22px rgba(0,0,0,0.35),
            0 14px 28px rgba(15,23,42,0.32)
          `,
        }}
      />

      {/* Festooned inner ring — embossed border. */}
      <div
        style={{
          position: "absolute",
          inset: 84,
          borderRadius: "50%",
          border: `3px dashed ${waxLight}`,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 96,
          borderRadius: "50%",
          border: `2px solid ${waxShadow}`,
          opacity: 0.55,
        }}
      />

      {/* Centre engraving */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fef2f2",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            textShadow: `0 -1px 0 ${waxShadow}`,
          }}
        >
          Sealed by
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: "#fff7ed",
            textShadow: `
              0 -2px 0 ${waxShadow},
              0 3px 0 rgba(0,0,0,0.35),
              0 6px 14px rgba(0,0,0,0.45)
            `,
            marginTop: 4,
          }}
        >
          Z{hero.dominantZone}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            marginTop: 4,
            textShadow: `0 -1px 0 ${waxShadow}`,
          }}
        >
          {zoneLabel}
        </div>
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${accent}`,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          {formatDurationMinutes(hero.durationMin)} · {workout.id}
        </div>
      </div>
    </div>
  );
}
