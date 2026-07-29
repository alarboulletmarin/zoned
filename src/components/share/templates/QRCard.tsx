/**
 * QRCard — 1080×1080 minimal QR code share.
 *
 * Just the QR, the workout name and the brand. Designed to be dropped
 * as-is into an Insta story / post so anyone can scan and open the
 * workout on zoned.run.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { formatDurationMinutes } from "@/components/visualization";
import { BgLayer, BrandStrip, ZONE_HEX, workoutShareUrl } from "./_shared";
import { QRSvg } from "./QRSvg";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

export function QRCard({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
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
          padding: "80px 80px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BrandStrip scale={1.3} />
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.22em",
              padding: "8px 18px",
              borderRadius: 999,
              border: "2px solid #0f172a",
              color: "#0f172a",
            }}
          >
            {workout.id}
          </span>
        </div>

        {/* QR — centred and big */}
        <div
          style={{
            marginTop: 56,
            padding: 36,
            background: "#ffffff",
            border: "2px solid #0f172a",
            borderRadius: 28,
            boxShadow: `0 12px 32px rgba(15,23,42,0.10)`,
          }}
        >
          <QRSvg value={workoutShareUrl(workout)} size={520} fg="#0f172a" />
        </div>

        {/* Scan invitation */}
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Scanne pour ouvrir la séance
        </div>

        {/* Workout label + stat strip */}
        <div
          style={{
            marginTop: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: zoneHex,
            }}
          >
            Z{hero.dominantZone} · {zoneLabel}
          </div>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: 0,
              textAlign: "center",
              overflowWrap: "break-word",
              maxWidth: 900,
            }}
          >
            {name}
          </h1>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              color: "#64748b",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {formatDurationMinutes(hero.durationMin)} ·{" "}
            {t(`library:difficulty.${workout.difficulty}`)} · RPE {hero.rpe}/10
          </div>
        </div>
      </div>
    </div>
  );
}
