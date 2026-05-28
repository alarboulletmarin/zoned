/**
 * EnamelPin — 480×480. Varsity-style enamel pin. Shield silhouette with
 * gilded gold border, central monogram and laurels. Premium collectible
 * vibe — the pin IS the visual.
 */

import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 480;
const H = 480;

const GOLD_LIGHT = "#fde68a";
const GOLD_MID = "#d4a017";
const GOLD_DEEP = "#8b6914";

export function EnamelPin({ workout, transparent }: ShareTemplateProps) {
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

      <svg
        width={W}
        height={H}
        viewBox="0 0 480 480"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="goldBorder" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="50%" stopColor={GOLD_MID} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>
          <radialGradient id="enamel" cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="55%" stopColor={zoneHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        {/* Shield path */}
        <path
          d="M240 40 L420 110 L410 290 C 410 360 340 410 240 450 C 140 410 70 360 70 290 L 60 110 Z"
          fill="url(#goldBorder)"
        />
        <path
          d="M240 62 L398 122 L390 286 C 390 348 332 390 240 426 C 148 390 90 348 90 286 L 82 122 Z"
          fill="url(#enamel)"
        />
        {/* Hanging loop */}
        <circle cx="240" cy="30" r="12" fill="url(#goldBorder)" />
        <circle cx="240" cy="30" r="5" fill="#f8fafc" />

        {/* Laurel branches */}
        {[60, 360].map((y) => (
          <g key={y} opacity="0.55" stroke={GOLD_LIGHT} strokeWidth="2" fill="none">
            <path d={`M120 ${y} Q160 ${y - 14} 195 ${y}`} />
            <path d={`M285 ${y} Q320 ${y - 14} 360 ${y}`} />
            {[0, 1, 2, 3].map((j) => (
              <g key={j}>
                <ellipse
                  cx={130 + j * 18}
                  cy={y - 4 - j * 1.5}
                  rx="6"
                  ry="3"
                  transform={`rotate(-25 ${130 + j * 18} ${y - 4})`}
                  fill={GOLD_LIGHT}
                  opacity="0.7"
                />
                <ellipse
                  cx={295 + j * 18}
                  cy={y - 4 - j * 1.5}
                  rx="6"
                  ry="3"
                  transform={`rotate(25 ${295 + j * 18} ${y - 4})`}
                  fill={GOLD_LIGHT}
                  opacity="0.7"
                />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Centre text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff7ed",
          textAlign: "center",
          textShadow: "0 -1px 0 rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: GOLD_LIGHT,
            marginTop: 12,
          }}
        >
          Est. Today
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: "-0.04em",
            color: "#fffbeb",
            marginTop: 4,
          }}
        >
          Z{hero.dominantZone}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#fde68a",
            marginTop: 2,
          }}
        >
          {zoneLabel}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.24em",
            color: GOLD_LIGHT,
          }}
        >
          {formatDurationMinutes(hero.durationMin)} · {workout.id}
        </div>
      </div>
    </div>
  );
}
