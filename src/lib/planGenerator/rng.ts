/**
 * Deterministic randomness for plan generation.
 *
 * The generator uses randomness only to break ties — picking among equally
 * fresh workouts so two plans with the same config do not look identical.
 * That is fine locally, but it makes a plan unreproducible, which breaks
 * sharing a plan by its config: the recipient would regenerate a *different*
 * plan from the same link.
 *
 * Seeding from the config keeps the freshness (different configs still pick
 * different workouts) while making `generatePlan(config)` reproducible.
 *
 * The PRNG is module state rather than a threaded parameter so the tie-break
 * call sites stay untouched. `generatePlan()` reseeds on every run; callers
 * that reach the selectors directly (the standalone week generator) simply
 * keep drawing from the stream, exactly as they did with `Math.random()`.
 */

import type { PlanConfig } from "@/types/plan";
import { mulberry32 } from "@/lib/routeGenerator/algorithms/shared/rng";

let draw: () => number = mulberry32(0x5eed);

/** FNV-1a over the config fields that shape selection. */
function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Reseed the tie-break stream. Same seed → same plan. */
export function seedPlanRng(seed: string): void {
  draw = mulberry32(hashSeed(seed));
}

/** Tie-break draw in [0, 1). */
export function planRandom(): number {
  return draw();
}

/**
 * Seed string for a config. Deliberately excludes `id` and `createdAt`: they
 * are unique per plan, and including them would defeat reproducibility.
 */
export function planSeedFromConfig(config: PlanConfig): string {
  return [
    config.raceDistance,
    config.raceDate,
    config.targetPaceMinKm,
    config.elevationGain,
    config.runnerLevel,
    config.daysPerWeek,
    config.longRunDay,
    config.vma,
    config.startDate,
    config.trainingGoal,
    config.planPurpose,
    config.totalWeeksOverride,
    config.currentWeeklyKm,
    config.currentLongRunKm,
    config.includeStrength,
    config.strengthFrequency,
  ].join("|");
}
