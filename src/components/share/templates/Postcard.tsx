/**
 * Postcard — 1080×1920. Vintage postcard with stamp, postmark and a
 * handwritten-feel "from" address. The workout becomes the destination.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ZONE_HEX } from "./_shared";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

export function Postcard({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  // Postmark date (today)
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const monthsFr = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUI", "AOÛ", "SEP", "OCT", "NOV", "DÉC"];
  const mm = monthsFr[now.getMonth()];
  const yyyy = now.getFullYear();

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
        color: "#3a322a",
      }}
    >
      <BgLayer background="#e9e2cf" />

      <div style={{ position: "relative", zIndex: 1, padding: 80, width: "100%", height: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#f7efd9",
            border: "2px solid #3a322a",
            padding: "56px 56px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "8px 12px 0 rgba(58, 50, 42, 0.18)",
          }}
        >
          {/* GREETINGS top */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#9c6f3b",
            }}
          >
            Greetings from
          </div>
          {/* Big destination */}
          <div
            style={{
              fontSize: 196,
              fontWeight: 800,
              fontStyle: "italic",
              lineHeight: 0.86,
              letterSpacing: "-0.05em",
              color: zoneHex,
              marginTop: 12,
              textShadow: "4px 4px 0 rgba(58,50,42,0.18)",
              overflowWrap: "break-word",
            }}
          >
            Zone {hero.dominantZone}
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginTop: 8,
              color: "#3a322a",
            }}
          >
            {zoneLabel}
          </div>

          {/* Stamp area top-right */}
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 36,
              width: 200,
              height: 240,
              border: "3px dashed #9c6f3b",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fefae0",
            }}
          >
            <Logo style={{ width: 80, height: 40 }} />
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                color: zoneHex,
                fontStyle: "italic",
                lineHeight: 1,
              }}
            >
              Z{hero.dominantZone}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9c6f3b",
              }}
            >
              ZONED · {workout.id}
            </div>
          </div>

          {/* Postmark circle */}
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 250,
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "3px solid #9c6f3b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-12deg)",
              color: "#9c6f3b",
              opacity: 0.55,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.22em" }}>
              ZONED · POST
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
              {dd} {mm}
            </div>
            <div style={{ fontSize: 16, letterSpacing: "0.16em" }}>
              {yyyy}
            </div>
          </div>

          {/* Body : workout note */}
          <div
            style={{
              marginTop: "auto",
              borderTop: "2px dashed #9c6f3b",
              paddingTop: 32,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 36,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9c6f3b" }}>
                Note du jour
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 30,
                  fontWeight: 600,
                  fontStyle: "italic",
                  lineHeight: 1.25,
                  color: "#3a322a",
                }}
              >
                « {name} »
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#5a4f43",
                  letterSpacing: "0.02em",
                }}
              >
                {formatDurationMinutes(hero.durationMin)} · RPE {hero.rpe}/10<br />
                {t(`library:difficulty.${workout.difficulty}`)} · {hero.blockCount} blocs
              </div>
            </div>
            <div
              style={{
                borderLeft: "2px solid #3a322a",
                paddingLeft: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9c6f3b" }}>
                Adressée à
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 26,
                  fontWeight: 600,
                  fontStyle: "italic",
                  lineHeight: 1.4,
                  color: "#3a322a",
                }}
              >
                Toi, le coureur<br />
                qui aime savoir<br />
                où il met le pied
              </div>
              <div
                style={{
                  marginTop: "auto",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 16,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#9c6f3b",
                }}
              >
                zoned.run · {workout.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
