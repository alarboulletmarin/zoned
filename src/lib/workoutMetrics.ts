import type { WorkoutBlock, WorkoutTemplate, TerrainType } from "@/types";

function allBlocks(template: WorkoutTemplate): WorkoutBlock[] {
  return [
    ...(template.warmupTemplate ?? []),
    ...(template.mainSetTemplate ?? []),
    ...(template.cooldownTemplate ?? []),
  ];
}

function blockEffectiveCount(block: WorkoutBlock): number {
  const reps = block.repetitions && block.repetitions > 0 ? block.repetitions : 1;
  const sets = block.sets && block.sets > 0 ? block.sets : 1;
  return reps * sets;
}

function blockDurationMin(block: WorkoutBlock): number {
  if (block.durationMin != null) {
    return block.durationMin * blockEffectiveCount(block);
  }
  return 0;
}

function blockDistanceKm(block: WorkoutBlock): number {
  if (block.distanceKm != null) return block.distanceKm;
  if (block.distanceM != null) return block.distanceM / 1000;
  if (block.durationMin != null) {
    const speed = paceKmhForZone(block.zone);
    return (block.durationMin / 60) * speed;
  }
  return 0;
}

export function computeTotalElevationGain(template: WorkoutTemplate): number {
  let total = 0;
  for (const block of allBlocks(template)) {
    const count = blockEffectiveCount(block);
    if (block.elevationGainM != null && block.elevationGainM > 0) {
      total += block.elevationGainM * count;
    } else if (block.gradientPercent != null && block.gradientPercent > 0) {
      const distKm = blockDistanceKm(block);
      if (distKm > 0) total += (block.gradientPercent / 100) * distKm * 1000 * count;
    }
  }
  return Math.round(total);
}

const DESCENT_RECOVERY_RE = /descente|descend|jog down|walk down|remont/i;

export function computeTotalElevationLoss(template: WorkoutTemplate): number {
  let total = 0;
  for (const block of allBlocks(template)) {
    const count = blockEffectiveCount(block);
    if (block.gradientPercent != null && block.gradientPercent < 0) {
      const distKm = blockDistanceKm(block);
      if (distKm > 0) total += (-block.gradientPercent / 100) * distKm * 1000 * count;
    }
    if (
      block.elevationGainM != null &&
      block.elevationGainM > 0 &&
      block.recovery &&
      DESCENT_RECOVERY_RE.test(block.recovery)
    ) {
      total += block.elevationGainM * count;
    } else if (
      block.gradientPercent != null &&
      block.gradientPercent > 0 &&
      block.recovery &&
      DESCENT_RECOVERY_RE.test(block.recovery)
    ) {
      const distKm = blockDistanceKm(block);
      if (distKm > 0) total += (block.gradientPercent / 100) * distKm * 1000 * count;
    }
  }
  return Math.round(total);
}

export function computeAvgGradient(template: WorkoutTemplate): number {
  let weightedSum = 0;
  let totalWeight = 0;
  let anyGradient = false;
  for (const block of allBlocks(template)) {
    const weight = blockDurationMin(block) || blockEffectiveCount(block);
    if (block.gradientPercent != null) {
      anyGradient = true;
      weightedSum += block.gradientPercent * weight;
    }
    totalWeight += weight;
  }
  if (!anyGradient || totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function computeDominantTerrain(template: WorkoutTemplate): TerrainType | undefined {
  const tally = new Map<TerrainType, number>();
  for (const block of allBlocks(template)) {
    if (!block.terrainType) continue;
    const weight = blockDurationMin(block) || blockEffectiveCount(block);
    tally.set(block.terrainType, (tally.get(block.terrainType) ?? 0) + weight);
  }
  if (tally.size === 0) return undefined;
  let best: TerrainType | undefined;
  let bestWeight = -1;
  for (const [type, weight] of tally) {
    if (weight > bestWeight) {
      best = type;
      bestWeight = weight;
    }
  }
  return best;
}

function paceKmhForZone(zone: string | undefined): number {
  if (!zone) return 10;
  const matches = zone.match(/[1-6]/g);
  if (!matches) return 10;
  const z = Math.max(...matches.map((m) => Number(m)));
  switch (z) {
    case 1: return 9;
    case 2: return 10;
    case 3: return 12;
    case 4: return 14;
    case 5: return 16;
    case 6: return 18;
    default: return 10;
  }
}

export function computeVerticalDensity(
  template: WorkoutTemplate,
  totalElevationM?: number,
): number {
  const elevation = totalElevationM ?? computeTotalElevationGain(template);
  if (elevation <= 0) return 0;

  let totalKm = 0;
  for (const block of allBlocks(template)) {
    const count = blockEffectiveCount(block);
    if (block.distanceKm != null) {
      totalKm += block.distanceKm * count;
    } else if (block.distanceM != null) {
      totalKm += (block.distanceM / 1000) * count;
    } else if (block.durationMin != null) {
      const speed = paceKmhForZone(block.zone);
      totalKm += (block.durationMin / 60) * speed * count;
    }
  }
  if (totalKm <= 0) return 0;
  return Math.round(elevation / totalKm);
}

export interface TrailMetrics {
  totalElevationGainM: number;
  totalElevationLossM: number;
  avgGradientPercent: number;
  dominantTerrain?: TerrainType;
  verticalDensityMPerKm: number;
}

export function computeTrailMetrics(template: WorkoutTemplate): TrailMetrics {
  const totalElevationGainM = computeTotalElevationGain(template);
  const totalElevationLossM = computeTotalElevationLoss(template);
  return {
    totalElevationGainM,
    totalElevationLossM,
    avgGradientPercent: computeAvgGradient(template),
    dominantTerrain: computeDominantTerrain(template),
    verticalDensityMPerKm: computeVerticalDensity(template, totalElevationGainM),
  };
}

export function hasTrailData(template: WorkoutTemplate): boolean {
  const m = computeTrailMetrics(template);
  return m.totalElevationGainM > 0 || m.totalElevationLossM > 0 || m.dominantTerrain != null;
}
