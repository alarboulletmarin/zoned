/**
 * BibCard — 1080×1080 race-bib (dossard) style.
 *
 * Big numeral centre-stage like a real pinned bib, with the workout
 * name as the "event", colour stripe per dominant zone and faux pin
 * marks in the corners. Plays into the running-club aesthetic.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ShareFooter, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function BibCard({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  // Auto-size the headline so very long names still fit one line.
  const nameLen = name.length;
  const nameSize = nameLen <= 12 ? 140 : nameLen <= 20 ? 108 : nameLen <= 28 ? 84 : 68;

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
      <BgLayer background="#eef0f3" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: 64,
        }}
      >
        {/* Bib card — proper white paper with a colored stripe on top */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: "#ffffff",
            border: "3px solid #0f172a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sponsor / zone stripe top */}
          <div
            style={{
              height: 56,
              background: zoneHex,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 32px",
              color: "#ffffff",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            <span>Zone {hero.dominantZone} · {zoneLabel}</span>
            <span>{t(`library:difficulty.${workout.difficulty}`)}</span>
          </div>

          {/* Corner pin marks (×) */}
          <PinMark style={{ top: 16, left: 16 }} />
          <PinMark style={{ top: 16, right: 16 }} />
          <PinMark style={{ bottom: 16, left: 16 }} />
          <PinMark style={{ bottom: 16, right: 16 }} />

          {/* Header */}
          <div
            style={{
              padding: "28px 56px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Logo style={{ width: 80, height: 40 }} />
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#0f172a",
                }}
              >
                ZONED
              </div>
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Workout bib · {workout.id}
            </div>
          </div>

          {/* Hero — workout name centered, font-size adapts to length */}
          <div
            style={{
              flex: 1,
              padding: "24px 56px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 28,
            }}
          >
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Séance
            </div>
            <h1
              style={{
                fontSize: nameSize,
                fontWeight: 800,
                letterSpacing: "-0.045em",
                lineHeight: 0.94,
                color: "#0f172a",
                margin: 0,
                maxWidth: 880,
                overflowWrap: "break-word",
              }}
            >
              {name}
            </h1>
            <div
              style={{
                marginTop: 8,
                padding: "10px 24px",
                borderRadius: 999,
                border: `2px solid ${zoneHex}`,
                color: zoneHex,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Z{hero.dominantZone} · {zoneLabel}
            </div>
          </div>

          {/* Bottom strip: stats */}
          <div
            style={{
              padding: "20px 56px",
              borderTop: "2px solid #0f172a",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              background: "#fafafa",
            }}
          >
            <BibStat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
            <BibStat label="Effort" value={`RPE ${hero.rpe}`} />
            <BibStat label="Blocs" value={String(hero.blockCount)} />
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 56px 16px" }}>
            <ShareFooter workout={workout} size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PinMark({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 28,
        height: 28,
        ...style,
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <line x1="4" y1="4" x2="20" y2="20" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="20" y1="4" x2="4" y2="20" stroke="#cbd5e1" strokeWidth="2" />
      </svg>
    </div>
  );
}

function BibStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#0f172a",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
