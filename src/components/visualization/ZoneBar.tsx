import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { cn } from "@/lib/utils";
import type { WorkoutStructureSource } from "@/lib/workoutStructure";
import { transformSessionBlocks } from "./transforms";
import type { ZoneNumber } from "./types";

/**
 * One phase of a session, as the bar reads it.
 *
 * `zone: 0` is not a zone. It is recovery, or an unmeasured block (drills,
 * strides), the system draws those as a 45 degree hatch, never as a tint on
 * the ink ramp.
 */
export interface ZoneBarBlock {
  seconds: number;
  zone: ZoneNumber | 0;
  /**
   * A condensed set only: where its efforts fall inside it, as [start, end]
   * fractions of the block. The block keeps the set's outline and height,
   * the efforts are painted as teeth and the recoveries between them stay
   * paper. Absent on a plain block, which is filled end to end.
   */
  efforts?: [number, number][];
}

interface ZoneBarProps {
  blocks: ZoneBarBlock[];
  /** Card-size profile: merge repetitions into sets. See `condenseBlocks`. */
  condense?: boolean;
  /** Bar height in px. 36 is the card size the design bundle states. */
  height?: number;
  /** Overrides the spoken description. Leave unset for the generated one. */
  label?: string;
  /**
   * Hidden from assistive tech. For a bar inside a link whose own name already
   * says which session it is: the bibliothèque row, where the generated
   * description would be read as part of the link's name.
   */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The session profile: one block per phase, width = time, intensity coded
 * twice, by ink density and by block height.
 *
 * The bar is `role="img"`: it is a picture of the session, and its
 * `aria-label` says in words what the ink says in shape.
 */
export function ZoneBar({
  blocks,
  condense = false,
  height,
  label,
  decorative = false,
  className,
  style,
}: ZoneBarProps) {
  const { t } = useTranslation("common");
  const list = condense ? condenseBlocks(blocks) : blocks;
  const total = list.reduce((sum, b) => sum + b.seconds, 0) || 1;
  // The spoken profile reads the blocks as they are: a condensed set would
  // count its recoveries as effort.

  return (
    <span
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label ?? describeProfile(blocks, t) })}
      className={cn("zn-zonebar", className)}
      style={
        {
          ...(height ? { "--zn-zonebar-h": `${height}px` } : null),
          ...style,
        } as CSSProperties
      }
    >
      {list.map((block, i) => (
        <span
          key={i}
          className="zn-zonebar__block"
          data-zone={block.zone}
          data-set={block.efforts ? "" : undefined}
          style={
            {
              "--flex": block.seconds / total,
              ...(block.efforts ? { "--zn-set-teeth": setTeeth(block.efforts) } : null),
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

/**
 * Reads a workout template as bar blocks: every timeline segment becomes one
 * block, keeping the block-level timing the profile needs.
 */
export function toZoneBarBlocks(workout: WorkoutStructureSource): ZoneBarBlock[] {
  const { segments } = transformSessionBlocks(workout);
  return segments.map((segment) => ({
    seconds: Math.round(segment.durationMin * 60),
    zone:
      segment.isRecovery || segment.zoneNumber == null ? 0 : segment.zoneNumber,
  }));
}

/**
 * Card-size profile: one strip per phase or set instead of one per repetition.
 *
 * Consecutive hard blocks merge, and a short recovery (<= 2 min) inside a work
 * run is absorbed into its set, a 30/30 reads as two sets rather than
 * fifty-one hairlines. Between-series and cool-down recoveries are longer, so
 * they survive as their own strip.
 *
 * A set keeps its repetitions, though, as `efforts`: the set used to be ONE
 * solid Z5 slab, its recoveries painted over in Z5, so a 30/30, a 45/15 and
 * twelve minutes held at VO2max were the same picture, and the recovery the
 * session is built on had vanished. The block now draws its efforts as teeth
 * with paper between them (`setTeeth`, zone.css): a 30/30 reads half full, a
 * 45/15 three quarters, a continuous block stays solid.
 */
export function condenseBlocks(blocks: ZoneBarBlock[]): ZoneBarBlock[] {
  type Run = ZoneBarBlock & { hard: boolean; parts: [number, number, boolean][] };
  const out: Run[] = [];

  for (const block of blocks) {
    const prev = out[out.length - 1];
    const hard = block.zone >= 5;
    const insideSet = prev != null && prev.hard && !hard && block.seconds <= 120;
    const sameEasyZone =
      prev != null && !hard && !prev.hard && prev.zone === block.zone;

    if (prev && ((hard && prev.hard) || insideSet || sameEasyZone)) {
      prev.parts.push([prev.seconds, prev.seconds + block.seconds, hard]);
      prev.seconds += block.seconds;
      if (hard && block.zone > prev.zone) prev.zone = block.zone;
    } else {
      out.push({ ...block, hard, parts: [[0, block.seconds, hard]] });
    }
  }

  return out.map(({ seconds, zone, hard, parts }) => {
    if (!hard || seconds <= 0 || parts.every(([, , effort]) => effort)) {
      return { seconds, zone };
    }
    // Neighbouring efforts (a Z5 rep straight into a Z6 sprint) are one tooth.
    const efforts: [number, number][] = [];
    for (const [start, end, effort] of parts) {
      if (!effort) continue;
      const last = efforts[efforts.length - 1];
      if (last && last[1] === start / seconds) last[1] = end / seconds;
      else efforts.push([start / seconds, end / seconds]);
    }
    return { seconds, zone, efforts };
  });
}

/** The teeth of a set, as a gradient over the block's own zone fill. */
function setTeeth(efforts: [number, number][]): string {
  const pct = (x: number) => `${(x * 100).toFixed(3)}%`;
  const stops: string[] = [];
  for (const [start, end] of efforts) {
    stops.push(`transparent ${pct(start)}`, `var(--zn-block-fill) ${pct(start)}`);
    stops.push(`var(--zn-block-fill) ${pct(end)}`, `transparent ${pct(end)}`);
  }
  return `linear-gradient(to right, transparent 0%, ${stops.join(", ")}, transparent 100%)`;
}

/** "Profil de la séance : Z2 12 min, Z5 8 min, récupération 6 min." */
function describeProfile(
  blocks: ZoneBarBlock[],
  t: TFunction<"common">,
): string {
  const byZone = new Map<number, number>();
  for (const block of blocks) {
    byZone.set(block.zone, (byZone.get(block.zone) ?? 0) + block.seconds);
  }

  const parts = [...byZone.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([zone, seconds]) => {
      const minutes = Math.max(1, Math.round(seconds / 60));
      return zone === 0
        ? t("zones.profileRecovery", { minutes })
        : t("zones.profileSegment", { zone: `Z${zone}`, minutes });
    });

  return t("zones.profile", { parts: parts.join(", ") });
}
