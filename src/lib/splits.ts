export type SplitStrategy = "even" | "negative" | "positive";

export interface SplitRow {
  index: number;
  distance: number; // km for this split (1 or partial)
  splitTimeSeconds: number;
  paceMinPerKm: number;
  cumulativeTimeSeconds: number;
}

export function formatSplitTime(totalSeconds: number): string {
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * A finish time spelled out, "3 h 30 min" / "45 min 30 s". Under a masked
 * time field it states which reading was taken: "3:30" alone could still be
 * read either way, words cannot.
 */
export function formatReadableTime(totalSeconds: number): string {
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const sec = s > 0 ? ` ${s.toString().padStart(2, "0")} s` : "";
  if (h > 0) return `${h} h ${m.toString().padStart(2, "0")} min${sec}`;
  return `${m} min${sec}`;
}

export function formatPaceDisplay(paceMinPerKm: number): string {
  return formatSplitTime(paceMinPerKm * 60);
}

export function generateSplits(
  distanceKm: number,
  totalTimeSeconds: number,
  strategy: SplitStrategy
): SplitRow[] {
  const fullSplits = Math.floor(distanceKm);
  const partialKm = distanceKm - fullSplits;
  const hasPartial = partialKm > 1e-9;
  const numberOfSplits = hasPartial ? fullSplits + 1 : fullSplits;

  // Base pace in seconds per km
  const basePaceSecPerKm = totalTimeSeconds / distanceKm;

  const splits: SplitRow[] = [];
  let cumulative = 0;

  for (let i = 0; i < numberOfSplits; i++) {
    const isLastPartial = hasPartial && i === numberOfSplits - 1;
    const splitDistanceKm = isLastPartial ? partialKm : 1;

    let paceMultiplier = 1;
    if (strategy === "negative" && numberOfSplits > 1) {
      // Linear progression from +2% to -2%
      paceMultiplier = 1 + 0.02 - (0.04 * i) / (numberOfSplits - 1);
    } else if (strategy === "positive" && numberOfSplits > 1) {
      // Linear progression from -2% to +2%
      paceMultiplier = 1 - 0.02 + (0.04 * i) / (numberOfSplits - 1);
    }

    const paceSecPerKm = basePaceSecPerKm * paceMultiplier;
    const splitTimeSeconds = paceSecPerKm * splitDistanceKm;
    cumulative += splitTimeSeconds;

    splits.push({
      index: i + 1,
      distance: splitDistanceKm,
      splitTimeSeconds,
      paceMinPerKm: paceSecPerKm / 60,
      cumulativeTimeSeconds: cumulative,
    });
  }

  // Normalize all splits, including partial kilometres, to the exact goal.
  // Keeping one factor preserves the linear pace progression at the finish.
  const factor = totalTimeSeconds / cumulative;
  cumulative = 0;
  for (const split of splits) {
    split.splitTimeSeconds *= factor;
    split.paceMinPerKm *= factor;
    cumulative += split.splitTimeSeconds;
    split.cumulativeTimeSeconds = cumulative;
  }
  if (splits.length > 0) splits[splits.length - 1].cumulativeTimeSeconds = totalTimeSeconds;

  return splits;
}
