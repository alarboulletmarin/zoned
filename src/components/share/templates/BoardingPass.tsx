/**
 * BoardingPass — 1080×1920. Airline boarding pass with the workout's zone
 * as the destination, duration as flight time, RPE as the gate.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX, workoutShareUrl } from "./_shared";
import { QRSvg } from "./QRSvg";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

export function BoardingPass({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  const flightNum = `ZN${(workout.id.match(/(\d+)/) ?? ["", "001"])[1].padStart(3, "0")}`;
  const idTail = (workout.id.match(/(\d+)\s*$/) ?? ["", "001"])[1].padStart(3, "0");

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
          padding: "96px 80px",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#ffffff",
            border: "3px solid #0f172a",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            boxShadow: "0 24px 48px rgba(15,23,42,0.10)",
          }}
        >
          {/* Header band */}
          <div
            style={{
              padding: "24px 36px",
              borderBottom: "3px solid #0f172a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: zoneHex,
              color: "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Logo style={{ width: 72, height: 36 }} />
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>
                ZONED AIRLINES
              </span>
            </div>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Boarding Pass
            </span>
          </div>

          {/* Passenger row */}
          <div style={{ padding: "32px 36px 12px" }}>
            <Label>Passager · séance</Label>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.02,
                marginTop: 4,
                overflowWrap: "break-word",
              }}
            >
              {name}
            </div>
          </div>

          {/* Departure → arrival */}
          <div
            style={{
              padding: "24px 36px",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div>
              <Label>Origine</Label>
              <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "#0f172a" }}>
                REP
              </div>
              <SubLabel>repos</SubLabel>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="120" height="44" viewBox="0 0 120 44">
                <path
                  d="M 6 22 L 100 22 M 92 14 L 100 22 L 92 30"
                  stroke="#0f172a"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M 50 12 L 70 22 L 50 32 L 60 22 Z" fill={zoneHex} />
              </svg>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                {formatDurationMinutes(hero.durationMin)}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label align="right">Destination</Label>
              <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: zoneHex }}>
                Z{hero.dominantZone}
              </div>
              <SubLabel align="right">{zoneLabel}</SubLabel>
            </div>
          </div>

          {/* Info strip */}
          <div
            style={{
              margin: "12px 36px",
              padding: "20px 24px",
              border: "2px solid #0f172a",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            <Stat label="Vol" value={flightNum} />
            <Stat label="Gate" value={`G${hero.rpe}`} />
            <Stat label="Class" value={t(`library:difficulty.${workout.difficulty}`)} />
            <Stat label="Seat" value={`${hero.blockCount}A`} />
          </div>

          {/* Bottom tear-off with QR */}
          <div
            style={{
              marginTop: "auto",
              padding: "24px 36px",
              borderTop: "3px dashed #0f172a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <QRSvg value={workoutShareUrl(workout.id)} size={140} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Label>Scan</Label>
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  zoned.run<br />/{workout.id.toLowerCase()}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Label align="right">Ref</Label>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 40,
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                {idTail}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "#64748b",
        textAlign: align ?? "left",
      }}
    >
      {children}
    </div>
  );
}

function SubLabel({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#475569",
        letterSpacing: "0.04em",
        marginTop: 2,
        textAlign: align ?? "left",
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Label>{label}</Label>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#0f172a",
          marginTop: 4,
        }}
      >
        {value}
      </span>
    </div>
  );
}
