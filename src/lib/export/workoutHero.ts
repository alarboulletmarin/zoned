/**
 * Hero stats for share templates.
 *
 * Centralises the "what to show" logic for every social-share template so
 * the 5 visuals stay consistent. Each template imports `getWorkoutHero()`
 * and reads the precomputed fields rather than reimplementing the same
 * dominant-zone / duration math.
 */

import type { WorkoutTemplate, ZoneNumber, ZoneMeta } from "@/types";
import {
  ZONE_META,
  getDominantZone,
  getWorkoutDiscipline,
  type Discipline,
} from "@/types";
import {
  transformSessionBlocks,
  getWorkoutDuration,
} from "@/components/visualization";
import type { ZoneBreakdown } from "@/components/visualization";

export interface WorkoutHero {
  /** Total session duration in minutes (rounded). */
  durationMin: number;
  /** Total block count (warmup + main + cooldown). */
  blockCount: number;
  /** Primary discipline (running by default). */
  discipline: Discipline;
  /** Dominant zone — highest zone present in the main set. */
  dominantZone: ZoneNumber;
  /** Full zone metadata for the dominant zone. */
  zoneMeta: ZoneMeta;
  /** Zone distribution by time (only zones present, sorted by zone number asc). */
  zoneBreakdown: ZoneBreakdown[];
  /** Total elevation gain (m) from all blocks — 0 when no trail data. */
  elevationGainM: number;
  /** True when the workout has meaningful elevation data (>= 50m). */
  hasElevation: boolean;
  /** RPE estimate from dominant zone (1–10 scale). */
  rpe: number;
}

/**
 * RPE estimate per zone (Borg CR10 mapping). Conservative — used only
 * for the share visuals' "intensity" stat.
 */
const ZONE_RPE: Record<ZoneNumber, number> = {
  1: 2,
  2: 4,
  3: 5,
  4: 7,
  5: 8,
  6: 10,
};

export function getWorkoutHero(workout: WorkoutTemplate): WorkoutHero {
  const durationMin = getWorkoutDuration(workout);
  const blockCount =
    (workout.warmupTemplate?.length ?? 0) +
    workout.mainSetTemplate.length +
    (workout.cooldownTemplate?.length ?? 0);
  const discipline = getWorkoutDiscipline(workout);
  const dominantZone = getDominantZone(workout);
  const zoneMeta = ZONE_META[dominantZone];

  // Share visuals plot the zone ramp only: the unzoned catch-all bar (drills,
  // strides) has no colour on that scale, so it is left out here.
  const sortedBreakdown = [...transformSessionBlocks(workout).zoneBreakdown]
    .filter((z): z is typeof z & { zone: ZoneNumber } => z.zone != null && z.percent > 0)
    .sort((a, b) => a.zone - b.zone);

  const allBlocks = [
    ...(workout.warmupTemplate ?? []),
    ...workout.mainSetTemplate,
    ...(workout.cooldownTemplate ?? []),
  ];
  const elevationGainM = allBlocks.reduce(
    (acc, b) => acc + (b.elevationGainM ?? 0),
    0,
  );

  return {
    durationMin,
    blockCount,
    discipline,
    dominantZone,
    zoneMeta,
    zoneBreakdown: sortedBreakdown,
    elevationGainM,
    hasElevation: elevationGainM >= 50,
    rpe: ZONE_RPE[dominantZone],
  };
}
