/**
 * HeartbeatECG — 1080×1920. An electrocardiogram-style horizontal trace
 * whose amplitude + frequency varies per zone, drawn from the actual
 * session segments. Resonates with the Zoned logo (a pulse line) and
 * conveys the workout's intensity profile at a glance.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import {
  transformSessionBlocks,
  formatDurationMinutes,
} from "@/components/visualization";
import { getWorkoutHero } from "@/lib/export/workoutHero";
import { BrandStrip, BgLayer, ShareFooter, ZONE_HEX } from "./_shared";
import type { ShareTemplateProps } from "../shareTemplates";

const W = 1080;
const H = 1920;
const TRACE_VIEW_W = 1080;
const TRACE_VIEW_H = 360;

/**
 * Per-zone "ECG signature" — controls how busy and tall each segment's
 * trace looks. Index = ZoneNumber.
 */
const ZONE_SIGNATURE: Record<number, { cyclesPerMin: number; amp: number }> = {
  1: { cyclesPerMin: 0.5, amp: 0.08 },
  2: { cyclesPerMin: 0.8, amp: 0.16 },
  3: { cyclesPerMin: 1.2, amp: 0.28 },
  4: { cyclesPerMin: 1.8, amp: 0.42 },
  5: { cyclesPerMin: 2.6, amp: 0.62 },
  6: { cyclesPerMin: 3.4, amp: 0.85 },
};

interface PathSegment {
  d: string;
  color: string;
}

/**
 * Build one SVG path per session segment so each colors independently
 * by zone. Paths are guaranteed to start where the previous ended
 * (baseline at TRACE_VIEW_H/2) so the trace is continuous.
 */
function buildEcgPaths(
  segments: { zoneNumber: number | null; durationMin: number }[],
): PathSegment[] {
  const totalDur =
    segments.reduce((acc, s) => acc + (s.durationMin || 0.01), 0) || 1;
  const baseline = TRACE_VIEW_H / 2;
  const paths: PathSegment[] = [];
  let x = 0;

  for (const seg of segments) {
    const segW = (seg.durationMin / totalDur) * TRACE_VIEW_W;
    if (segW < 1) {
      x += segW;
      continue;
    }
    const zone = (seg.zoneNumber ?? 1) as 1 | 2 | 3 | 4 | 5 | 6;
    const sig = ZONE_SIGNATURE[zone] ?? ZONE_SIGNATURE[1];
    const cycles = Math.max(1, Math.round(seg.durationMin * sig.cyclesPerMin));
    const cycleW = segW / cycles;
    const amp = TRACE_VIEW_H * sig.amp;

    let d = `M ${x.toFixed(1)} ${baseline.toFixed(1)}`;
    for (let i = 0; i < cycles; i++) {
      const cx = x + i * cycleW;
      // P-wave (small upbump) → QRS (spike up then down) → T-wave (medium up)
      const p1 = cx + cycleW * 0.18;
      const p2 = cx + cycleW * 0.22;
      const p3 = cx + cycleW * 0.32;
      const p4 = cx + cycleW * 0.42;
      const p5 = cx + cycleW * 0.5;
      const p6 = cx + cycleW * 0.65;
      const p7 = cx + cycleW;

      const pAmp = amp * 0.15;
      const qrsUp = amp * 1.0;
      const qrsDown = amp * 0.4;
      const tAmp = amp * 0.35;

      d += ` L ${p1.toFixed(1)} ${baseline.toFixed(1)}`;
      d += ` L ${p2.toFixed(1)} ${(baseline - pAmp).toFixed(1)}`;
      d += ` L ${p3.toFixed(1)} ${baseline.toFixed(1)}`;
      d += ` L ${p4.toFixed(1)} ${(baseline - qrsUp).toFixed(1)}`;
      d += ` L ${p5.toFixed(1)} ${(baseline + qrsDown).toFixed(1)}`;
      d += ` L ${p6.toFixed(1)} ${(baseline - tAmp).toFixed(1)}`;
      d += ` L ${p7.toFixed(1)} ${baseline.toFixed(1)}`;
    }
    paths.push({ d, color: ZONE_HEX[zone] });
    x += segW;
  }

  return paths;
}

export function HeartbeatECG({ workout, transparent }: ShareTemplateProps) {
  const { t } = useTranslation(["library"]);
  const pickLang = usePickLang();
  const hero = getWorkoutHero(workout);
  const name = pickLang(workout, "name");
  const zoneLabel = pickLang(hero.zoneMeta, "label");
  const zoneHex = ZONE_HEX[hero.dominantZone];

  const paths = useMemo(() => {
    const { segments } = transformSessionBlocks(workout);
    return buildEcgPaths(segments);
  }, [workout]);

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
          padding: "104px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <BrandStrip scale={1.6} />

        {/* Top label */}
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#64748b",
            marginTop: 16,
          }}
        >
          Trace ECG · Z{hero.dominantZone} {zoneLabel}
        </div>

        {/* Workout name */}
        <h1
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            margin: 0,
            maxWidth: 880,
            overflowWrap: "break-word",
          }}
        >
          {name}
        </h1>

        {/* ECG card */}
        <div
          style={{
            marginTop: 16,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 24,
            padding: "40px 32px 32px",
            position: "relative",
          }}
        >
          {/* Grid backdrop reminiscent of ECG paper */}
          <svg
            width={TRACE_VIEW_W}
            height={TRACE_VIEW_H}
            viewBox={`0 0 ${TRACE_VIEW_W} ${TRACE_VIEW_H}`}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(15,23,42,0.04) 23px, rgba(15,23,42,0.04) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(15,23,42,0.04) 23px, rgba(15,23,42,0.04) 24px)",
            }}
          >
            <line
              x1={0}
              y1={TRACE_VIEW_H / 2}
              x2={TRACE_VIEW_W}
              y2={TRACE_VIEW_H / 2}
              stroke="rgba(15,23,42,0.08)"
              strokeWidth={2}
              strokeDasharray="6 8"
            />
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 18,
              color: "#64748b",
              letterSpacing: "0.04em",
              marginTop: 18,
            }}
          >
            <span>0:00</span>
            <span>{formatDurationMinutes(hero.durationMin)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            marginTop: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <Stat label="Durée" value={formatDurationMinutes(hero.durationMin)} accent={zoneHex} />
          <Stat label="Niveau" value={t(`library:difficulty.${workout.difficulty}`)} accent={zoneHex} />
          <Stat label="RPE" value={`${hero.rpe} / 10`} accent={zoneHex} />
        </div>

        <div style={{ marginTop: 24 }}>
          <ShareFooter workout={workout} size={22} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: "22px 26px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: accent,
        }}
      />
      <div
        style={{
          marginLeft: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#0f172a",
            lineHeight: 1.05,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
