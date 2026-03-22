export type SplitStrategy = "even" | "negative" | "positive";

export interface SplitRow {
  index: number;
  distance: number; // km for this split (1 or partial)
  splitTimeSeconds: number;
  paceMinPerKm: number;
  cumulativeTimeSeconds: number;
}

export function formatSplitTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatPaceDisplay(paceMinPerKm: number): string {
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function generateSplits(
  distanceKm: number,
  totalTimeSeconds: number,
  strategy: SplitStrategy
): SplitRow[] {
  const fullSplits = Math.floor(distanceKm);
  const partialKm = distanceKm - fullSplits;
  const hasPartial = partialKm > 0.001;
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

  // Adjust last split cumulative to match exact total time
  // (floating point rounding correction)
  if (splits.length > 0) {
    const diff = totalTimeSeconds - splits[splits.length - 1].cumulativeTimeSeconds;
    splits[splits.length - 1].cumulativeTimeSeconds = totalTimeSeconds;
    splits[splits.length - 1].splitTimeSeconds += diff;
  }

  return splits;
}
