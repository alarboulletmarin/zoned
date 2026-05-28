/**
 * SneakerDrop — 1080×1920. Nike-SNKRS-style product release card.
 *
 * The workout is the "drop": model name big, colourway = zone, release
 * date today, SKU = workout id. Sharp typography, mono accent.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX, ZONE_BG_TINT } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

export function SneakerDrop({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);

  const nameLen = name.length;
  const modelSize = nameLen <= 12 ? 140 : nameLen <= 20 ? 108 : nameLen <= 28 ? 84 : 68;

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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "80px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top — brand + drop tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo style={{ width: 72, height: 36 }} />
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
              ZONED
            </span>
          </div>
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "#0f172a",
              color: "#ffffff",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Drop · Available now
          </span>
        </div>

        {/* Eyebrow line */}
        <div
          style={{
            marginTop: 36,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Zoned Series · No. {(workout.id.match(/(\d+)/) ?? ["", "001"])[1].padStart(3, "0")}
        </div>

        {/* Big model name */}
        <h1
          style={{
            marginTop: 14,
            fontSize: modelSize,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.05em",
            margin: 0,
            textTransform: "uppercase",
            overflowWrap: "break-word",
          }}
        >
          {name}
        </h1>

        {/* Colorway block — uses dominant zone */}
        <div
          style={{
            marginTop: 36,
            padding: 28,
            background: zoneTint,
            border: `3px solid ${zoneHex}`,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 16,
              background: zoneHex,
              flexShrink: 0,
              boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.45)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: zoneHex,
              }}
            >
              Colorway
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                marginTop: 4,
              }}
            >
              Zone {hero.dominantZone} / {zoneLabel}
            </div>
          </div>
        </div>

        {/* Specs grid */}
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            border: "3px solid #0f172a",
          }}
        >
          <Spec label="Runtime" value={formatDurationMinutes(hero.durationMin)} />
          <Spec label="Effort" value={`RPE ${hero.rpe} / 10`} right />
          <Spec label="Level" value={t(`library:difficulty.${workout.difficulty}`)} top />
          <Spec label="Blocks" value={String(hero.blockCount)} right top />
        </div>

        {/* Bottom — CTA + SKU */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 28,
            borderTop: "3px solid #0f172a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Release
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              {dd}.{mm}.{yy}
            </span>
          </div>
          <button
            type="button"
            style={{
              background: "#0f172a",
              color: "#ffffff",
              padding: "20px 36px",
              border: "none",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Train ▸
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              SKU
            </span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {workout.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  right,
  top,
}: {
  label: string;
  value: string;
  right?: boolean;
  top?: boolean;
}) {
  return (
    <div
      style={{
        padding: "22px 24px",
        borderLeft: right ? "3px solid #0f172a" : "none",
        borderTop: top ? "3px solid #0f172a" : "none",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: "#0f172a",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
    </div>
  );
}
