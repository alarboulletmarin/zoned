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
}

interface ZoneBarProps {
  blocks: ZoneBarBlock[];
  /** Card-size profile: merge repetitions into sets. See `condenseBlocks`. */
  condense?: boolean;
  /** Bar height in px. 36 is the card size the design bundle states. */
  height?: number;
  /** Overrides the spoken description. Leave unset for the generated one. */
  label?: string;
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
  className,
  style,
}: ZoneBarProps) {
  const { t } = useTranslation("common");
  const list = condense ? condenseBlocks(blocks) : blocks;
  const total = list.reduce((sum, b) => sum + b.seconds, 0) || 1;

  return (
    <span
      role="img"
      aria-label={label ?? describeProfile(list, t)}
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
          style={{ "--flex": block.seconds / total } as CSSProperties}
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
 * run is absorbed into its set, a 30/30 reads as two blocks rather than
 * fifty-one hairlines. Between-series and cool-down recoveries are longer, so
 * they survive as their own strip.
 */
function condenseBlocks(blocks: ZoneBarBlock[]): ZoneBarBlock[] {
  const out: (ZoneBarBlock & { hard: boolean })[] = [];

  for (const block of blocks) {
    const prev = out[out.length - 1];
    const hard = block.zone >= 5;
    const insideSet = prev != null && prev.hard && !hard && block.seconds <= 120;
    const sameEasyZone =
      prev != null && !hard && !prev.hard && prev.zone === block.zone;

    if (prev && ((hard && prev.hard) || insideSet || sameEasyZone)) {
      prev.seconds += block.seconds;
      if (hard && block.zone > prev.zone) prev.zone = block.zone;
    } else {
      out.push({ ...block, hard });
    }
  }

  return out.map(({ seconds, zone }) => ({ seconds, zone }));
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
