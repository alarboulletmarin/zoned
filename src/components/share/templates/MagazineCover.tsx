/**
 * MagazineCover — 1080×1920. Editorial sport-magazine cover.
 *
 * Tight masthead, "issue/zone" tag, huge italic feature title, three
 * cover lines + a faux barcode at the bottom.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BgLayer, ShareFooter, ZONE_HEX, ZONE_BG_TINT, workoutShareUrl } from "./_shared";
import { QRSvg } from "./QRSvg";
import Logo from "@/assets/logo.svg?react";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;

export function MagazineCover({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTint = ZONE_BG_TINT[hero.dominantZone];

  // Issue number from workout id tail (e.g. "VMA-001" → "001").
  const issueNo = (workout.id.match(/(\d+)\s*$/) ?? ["", "001"])[1].padStart(3, "0");

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
          padding: "84px 84px 60px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingBottom: 14,
            borderBottom: "6px solid #0f172a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo style={{ width: 96, height: 48 }} />
            <span
              style={{
                fontSize: 80,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: "#0f172a",
              }}
            >
              ZONED
            </span>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              lineHeight: 1.3,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Issue
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
              No. {issueNo}
            </div>
          </div>
        </div>

        {/* Zone strip */}
        <div
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 24px",
            borderRadius: 999,
            background: zoneTint,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: zoneHex,
            }}
          />
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: zoneHex,
              textTransform: "uppercase",
            }}
          >
            Zone {hero.dominantZone} · {zoneLabel}
          </span>
        </div>

        {/* Feature title */}
        <h1
          style={{
            marginTop: 56,
            fontSize: 168,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 0.86,
            letterSpacing: "-0.05em",
            margin: 0,
            maxWidth: 920,
            overflowWrap: "break-word",
          }}
        >
          {name}
        </h1>

        {/* Cover lines */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            paddingTop: 56,
          }}
        >
          <CoverLine
            kicker="01"
            title="Structure"
            detail={`${hero.blockCount} blocs · ${formatDurationMinutes(hero.durationMin)}`}
          />
          <CoverLine
            kicker="02"
            title="Effort"
            detail={`RPE ${hero.rpe} / 10 · ${t(`library:difficulty.${workout.difficulty}`)}`}
          />
          <CoverLine
            kicker="03"
            title="Méthode"
            detail={`Z${hero.dominantZone} ${zoneLabel} — protocole ciblé`}
          />
        </div>

        {/* Bottom strip — QR linking to the workout + price tag */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 28,
            borderTop: "2px solid #0f172a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <QRSvg value={workoutShareUrl(workout)} size={140} />
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#64748b",
                maxWidth: 180,
                lineHeight: 1.4,
              }}
            >
              Scanne pour<br />ouvrir la séance
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              lineHeight: 1.2,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Free · No subscription
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
              zoned.run · {workout.id}
            </div>
          </div>
        </div>
      </div>
      {/* Hide the default ShareFooter — we composed our own bottom strip. */}
      <div style={{ display: "none" }}>
        <ShareFooter workout={workout} />
      </div>
    </div>
  );
}

function CoverLine({
  kicker,
  title,
  detail,
}: {
  kicker: string;
  title: string;
  detail: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        paddingBottom: 14,
        borderBottom: "1px dashed rgba(15,23,42,0.2)",
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "#f97316",
          flex: "0 0 40px",
        }}
      >
        {kicker}
      </span>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: "#0f172a",
          flex: "0 0 auto",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: 22,
          color: "#475569",
          letterSpacing: "0.01em",
          flex: 1,
          textAlign: "right",
        }}
      >
        {detail}
      </span>
    </div>
  );
}
