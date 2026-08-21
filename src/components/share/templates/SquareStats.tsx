/**
 * SquareStats — 1080×1080 Brut share card ("séance partageable").
 *
 * Dark ink background, acid-accented wordmark, a flat zone chip, 4 stats and
 * a mini SessionTimeline for the zone profile. No personal data: everything
 * shown (duration, difficulty, RPE estimate, block count) comes off the
 * workout template itself, never off a user's own paces or history — the
 * point of a shareable image is that it shares the session, not the athlete.
 */

import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { SessionTimeline, formatDurationMinutes } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1080;

const INK = "#0B0B0A";
const PAPER = "#EFEDE6";
const PAPER_MUTED = "#8F8F86";
const ACCENT_ACID = "#D6F24B";

/** Ink or paper text on a flat zone chip, matching `--zone-N-text` in
 *  themes.css: Z5/Z6 are dark enough to need light text, the rest stay ink. */
const ZONE_CHIP_TEXT: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: INK,
  2: INK,
  3: INK,
  4: INK,
  5: "#FCFBF6",
  6: "#FCFBF6",
};

export function SquareStats({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];
  const zoneTextColor = ZONE_CHIP_TEXT[hero.dominantZone];

  return (
    <div
      data-share-template
      data-transparent={transparent ? "true" : undefined}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'General Sans', system-ui, sans-serif",
        color: PAPER,
      }}
    >
      <BgLayer background={INK} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          padding: "80px 88px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Header: brand + zone chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BrandStrip scale={1.3} inverted />
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              padding: "10px 20px",
              background: zoneHex,
              color: zoneTextColor,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Z{hero.dominantZone} · {zoneLabel}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {name}
        </h1>

        {/* 2×2 Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 2,
            flex: 1,
            background: "rgba(239,237,230,0.15)",
          }}
        >
          <BigStat label="Durée" value={formatDurationMinutes(hero.durationMin)} />
          <BigStat
            label="Niveau"
            value={t(`library:difficulty.${workout.difficulty}`)}
          />
          <BigStat label="RPE" value={`${hero.rpe} / 10`} />
          <BigStat label="Blocs" value={String(hero.blockCount)} />
        </div>

        {/* Mini timeline — zone profile, no data labels. Forced to the dark
            theme scope regardless of the app's own theme: `SessionTimeline`
            reads `text-foreground`/`--muted` off the ambient theme, and this
            card is always dark, on-screen and in print alike. */}
        <div
          className="dark"
          style={{
            background: "rgba(239,237,230,0.06)",
            border: "1px solid rgba(239,237,230,0.2)",
            padding: "20px 24px",
          }}
        >
          <SessionTimeline workout={workout} />
        </div>

        <ShareFooter workout={workout} size={18} inverted />
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: INK,
        padding: "26px 30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: PAPER_MUTED,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: ACCENT_ACID,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
