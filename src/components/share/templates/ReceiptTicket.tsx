/**
 * ReceiptTicket — 1080×1920. A paper-receipt / race-bib style card.
 *
 * Each workout block becomes a receipt line item; total duration sits at
 * the bottom. Monospace, dashed separators, perforated edges, barcode at
 * the bottom. Designed to feel physical/analog.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX, workoutShareUrl } from "./_shared";
import { QRSvg } from "./QRSvg";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";
import type { WorkoutBlock } from "@/types";
import { getZoneNumber } from "@/types";

const W = 1080;
const H = 1920;

function zoneOfBlock(block: WorkoutBlock): number | null {
  if (!block.zone) return null;
  return getZoneNumber(block.zone);
}

function blockDurationMin(block: WorkoutBlock): number {
  if (typeof block.durationMin === "number") return block.durationMin;
  return 0;
}

function blockLineItem(block: WorkoutBlock, idx: number): {
  ref: string;
  desc: string;
  zone: number | null;
  dur: number;
} {
  const zone = zoneOfBlock(block);
  const dur = blockDurationMin(block) * (block.repetitions || 1) * (block.sets || 1);
  return {
    ref: `${(idx + 1).toString().padStart(3, "0")}`,
    desc: block.description.length > 38 ? block.description.slice(0, 36) + "…" : block.description,
    zone,
    dur,
  };
}

export function ReceiptTicket({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  // Combine warmup + main + cooldown for the receipt rows; English values
  // remain on the same block reference so descriptions show in user lang.
  const warmup = workout.warmupTemplate ?? [];
  const main = workout.mainSetTemplate ?? [];
  const cooldown = workout.cooldownTemplate ?? [];

  // Take first 8 items so the ticket stays tall but not endless.
  const items = [
    ...warmup.map((b, i) => ({ ...blockLineItem(b, i), kind: "warmup" as const })),
    ...main.map((b, i) => ({ ...blockLineItem(b, i + warmup.length), kind: "main" as const })),
    ...cooldown.map((b, i) => ({
      ...blockLineItem(b, i + warmup.length + main.length),
      kind: "cooldown" as const,
    })),
  ].slice(0, 9);

  // Replace English descriptions if the picker prefers EN.
  const itemsLocalised = items.map((it, idx) => {
    const all = [...warmup, ...main, ...cooldown];
    const source = all[idx];
    const desc = source ? (pickLang(source, "description") || it.desc) : it.desc;
    return {
      ...it,
      desc: desc.length > 38 ? desc.slice(0, 36) + "…" : desc,
    };
  });

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
          padding: "120px 120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Receipt card */}
        <div
          style={{
            width: "100%",
            background: "#fbfbf8",
            padding: "48px 48px 40px",
            // Perforated edges via repeating mask
            position: "relative",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          {/* Top perforation */}
          <PerforatedEdge side="top" />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 4,
            }}
          >
            <Logo style={{ width: 64, height: 32 }} />
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}
            >
              ZONED
            </span>
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              color: "#64748b",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            Workout receipt · {workout.id}
          </div>

          {/* Workout name */}
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              margin: 0,
              marginBottom: 14,
              overflowWrap: "break-word",
            }}
          >
            {name}
          </h1>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: zoneHex,
              letterSpacing: "0.04em",
              marginBottom: 32,
            }}
          >
            Z{hero.dominantZone} · {zoneLabel} · {t(`library:difficulty.${workout.difficulty}`)}
          </div>

          {/* Dashed top */}
          <div
            style={{
              borderTop: "2px dashed #0f172a",
              paddingTop: 18,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              color: "#64748b",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Block</span>
            <span style={{ flex: 1, textAlign: "left", marginLeft: 24 }}>
              Description
            </span>
            <span>Min</span>
          </div>

          {/* Items */}
          <div
            style={{
              marginTop: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 22,
              color: "#0f172a",
              lineHeight: 1.5,
            }}
          >
            {itemsLocalised.map((it) => (
              <div
                key={it.ref + it.kind}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  padding: "6px 0",
                  borderBottom: "1px dotted rgba(15,23,42,0.18)",
                }}
              >
                <span style={{ width: 80, color: it.zone ? ZONE_HEX[it.zone as 1] : "#64748b", fontWeight: 700 }}>
                  {it.zone ? `Z${it.zone}` : "—"}
                </span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {it.desc}
                </span>
                <span style={{ fontWeight: 700, minWidth: 80, textAlign: "right" }}>
                  {it.dur > 0 ? `${Math.round(it.dur)}'` : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "2px dashed #0f172a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.16em" }}>
              TOTAL
            </span>
            <span style={{ fontSize: 36, fontWeight: 800, color: zoneHex }}>
              {formatDurationMinutes(hero.durationMin)}
            </span>
          </div>

          {/* QR code — scans to https://zoned.run/workout/<id> */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <QRSvg value={workoutShareUrl(workout.id)} size={220} />
          </div>
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 16,
              letterSpacing: "0.28em",
              color: "#64748b",
            }}
          >
            SCANNE · ZONED.RUN · {workout.id}
          </div>

          {/* Bottom perforation */}
          <PerforatedEdge side="bottom" />
        </div>
      </div>
    </div>
  );
}

function PerforatedEdge({ side }: { side: "top" | "bottom" }) {
  // Triangular wave cut via repeating conic-gradient as a transparent
  // notch overlay on the card itself.
  const isTop = side === "top";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 16,
        [isTop ? "top" : "bottom"]: -1,
        background:
          "radial-gradient(circle at 14px center, transparent 9px, #fbfbf8 9.5px) 0 0 / 28px 28px",
        // Tint the cutouts using a hard mask on the source bg.
        backgroundColor: "transparent",
        // Simpler: a row of small dots cut out via box-shadow
        // We use repeating-radial-gradient to "punch" holes.
      }}
    />
  );
}

