/**
 * MapPinDrop — 480×480. Google-Maps style location pin. Tear-drop silhouette
 * with white inner disc, soft ground shadow. The pin IS the visual —
 * survives transparent toggle.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

export function MapPinDrop({ workout, transparent }: ShareTemplateProps) {
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
      }}
    >
      <BgLayer />

      {/* Ground shadow */}
      <div
        style={{
          position: "absolute",
          left: 130,
          right: 130,
          bottom: 44,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(15,23,42,0.42), transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Pin SVG — tear drop with embedded disc */}
      <svg
        width={W}
        height={H}
        viewBox="0 0 480 480"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id="pinGrad" cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="55%" stopColor={zoneHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.32" />
          </radialGradient>
        </defs>
        {/* Tear drop body — circle on top + triangle below */}
        <path
          d="M240 60 C 350 60 414 144 414 232 C 414 320 320 384 240 440 C 160 384 66 320 66 232 C 66 144 130 60 240 60 Z"
          fill={zoneHex}
        />
        <path
          d="M240 60 C 350 60 414 144 414 232 C 414 320 320 384 240 440 C 160 384 66 320 66 232 C 66 144 130 60 240 60 Z"
          fill="url(#pinGrad)"
        />
        <path
          d="M240 60 C 350 60 414 144 414 232 C 414 320 320 384 240 440 C 160 384 66 320 66 232 C 66 144 130 60 240 60 Z"
          fill="none"
          stroke="#0f172a"
          strokeWidth="6"
          strokeOpacity="0.18"
        />
        {/* Inner white disc */}
        <circle cx="240" cy="222" r="118" fill="#ffffff" />
        <circle
          cx="240"
          cy="222"
          r="118"
          fill="none"
          stroke={zoneHex}
          strokeWidth="3"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Disc content */}
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 104,
          width: 236,
          height: 236,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Trained here
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            color: zoneHex,
            marginTop: 2,
          }}
        >
          Z{hero.dominantZone}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0f172a",
            marginTop: 2,
          }}
        >
          {zoneLabel}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            fontWeight: 700,
            color: "#475569",
          }}
        >
          {formatDurationMinutes(hero.durationMin)} · {workout.id}
        </div>
      </div>
    </div>
  );
}
