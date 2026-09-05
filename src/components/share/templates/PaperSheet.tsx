/**
 * PaperSheet — 1080×1350 in the redesign's own language.
 *
 * Paper #F6F5F2, ink #171614, every edge ruled at 1.5px, and exactly one
 * vermillon mark on the whole sheet: the doodle's ground contact. The 38 other
 * templates are pastiches (record sleeve, boarding pass, casino chip) and that
 * variety is the feature — this one is the house style, deliberately quiet.
 *
 * Inline styles with literal hex like every template here: html-to-image
 * rasterises the node with `skipFonts: true`, so neither Tailwind nor a CSS
 * custom property survives the capture. The doodle's accent path is the one
 * exception — see `AccentPatch`.
 */

import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { formatDurationMinutes, toZoneBarBlocks } from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { BgLayer } from "./_shared";
import {
  PAPER,
  INK,
  INK_2,
  RULE,
  MONO,
  DISPLAY,
  AccentPatch,
  ZoneFrieze,
  sessionTss,
} from "./_paper";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1350;

export function PaperSheet({ workout, transparent }: ShareTemplateProps) {
  const pickLang = usePickLang();
  const isEn = useIsEnglish();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  // A 40-character name at 92px runs to three lines and its descenders reach
  // into the frieze. One step down keeps every catalogue name to two.
  const nameSize = name.length > 30 ? 68 : 92;
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const tss = sessionTss(hero.zoneBreakdown);

  return (
    <div
      data-share-template
      data-transparent={transparent ? "true" : undefined}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: DISPLAY,
        color: INK,
      }}
    >
      <BgLayer background={PAPER} />
      <AccentPatch />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          padding: 40,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            border: RULE,
            padding: "44px 56px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header rule */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span>Zoned</span>
            <span style={{ color: INK_2 }}>
              {isEn ? "Session" : "Séance"}
            </span>
          </div>

          {/* Name */}
          <h1
            style={{
              margin: "36px 0 0",
              fontSize: nameSize,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            {name}
          </h1>

          {/* Frieze — the session profile on the ink ramp */}
          <div style={{ marginTop: 44 }}>
            <ZoneFrieze blocks={toZoneBarBlocks(workout)} height={104} />
          </div>

          {/* Facts */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              borderTop: RULE,
              borderBottom: RULE,
            }}
          >
            <Fact
              label={isEn ? "Duration" : "Durée"}
              value={formatDurationMinutes(hero.durationMin)}
            />
            <Fact
              label={`Zone Z${hero.dominantZone}`}
              value={zoneLabel}
              divided
            />
            <Fact label="TSS" value={String(tss)} divided />
          </div>

          {/* The doodle — the subject, not the decoration */}
          <div
            data-doodle="accent"
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              paddingTop: 24,
            }}
          >
            {/* height 100% + the viewBox aspect: the drawing fits the space
                left over instead of overflowing a long title. */}
            <RunnersDuo
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: INK_2,
            }}
          >
            <span>zoned.run</span>
            <span>{workout.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  divided = false,
}: {
  label: string;
  value: string;
  divided?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "24px 0 26px",
        paddingLeft: divided ? 28 : 0,
        borderLeft: divided ? RULE : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INK_2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          color: INK,
        }}
      >
        {value}
      </span>
    </div>
  );
}
