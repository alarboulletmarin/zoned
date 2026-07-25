/**
 * Session Builder — Workout selection + scaling + pace annotation
 *
 * Replaces the simple "select a template and estimate duration" approach
 * with a multi-step builder that:
 * 1. Selects the best workout template (reuses selector filtering)
 * 2. Scales the workout based on intra-phase progression
 * 3. Annotates every block with personalized paces from paceEngine
 * 4. Computes accurate duration from user-specific paces
 * 5. Calculates load score for 80/20 validation
 *
 * References:
 * - Daniels, J. (2014). VDOT-based training intensities
 * - Billat, V. (2001). Optimal interval protocols for VO2max
 * - Pfitzinger, P. (2009). Progressive session design
 */

import type {
  WorkoutTemplate,
  WorkoutBlock,
  Difficulty,
  TrainingPhase,
  SessionType,
} from "@/types";
import type { RaceDistance, PlanSession, PaceNote } from "@/types/plan";
import { parseZoneSpan } from "@/types";
import type { WeekSlot } from "./weekTemplate";
import type { TrainingPaces } from "./paceEngine";
import {
  sessionTypeToIntensity,
  computeBlockLoad,
  type DanielsIntensity,
} from "./paceEngine";
import { selectWorkout } from "./selector";

// ── Types ──────────────────────────────────────────────────────

export interface SessionBuildResult {
  session: PlanSession;
  workout: WorkoutTemplate;
}

export interface SessionBuildContext {
  slot: WeekSlot;
  phase: TrainingPhase;
  weekInPhase: number;        // 0-based index within phase
  totalPhaseWeeks: number;    // total weeks in this phase
  volumePercent: number;
  difficulty: Difficulty;
  raceDistance: RaceDistance;
  allWorkouts: WorkoutTemplate[];
  usedWorkoutIds: string[];
  /** Workouts already placed in the current week — never reuse them */
  excludeWorkoutIds?: string[];
  paces: TrainingPaces;
  elevationGain?: number;
  targetLongRunKm?: number;   // From longRunProgression
  targetLongRunMin?: number;
  daysPerWeek?: number;
  /**
   * Rough duration an easy/recovery session should land on this week.
   * Lets low-volume weeks pick short templates instead of picking a 90-minute
   * one and relying on the volume fit to cut it in half afterwards.
   */
  targetEasyMin?: number;
}

// ── Zone mapping ────────────────────────────────────────────────

/**
 * Highest zone referenced by a zone string.
 *
 * Zone strings are free-form in the catalogue ("Z4", "Z1-Z2", "Z5+", "Z4→Z5+"),
 * so a lookup table silently missed the extended forms and fell back to Z2 —
 * which annotated VO2max sets with easy pace and costed them at easy pace too.
 *
 * Delegates to the shared parser rather than mirroring it: this was the last
 * of three private copies, and they disagreed on the same input.
 */
function parseZoneNumber(zone: string | undefined): number | null {
  return parseZoneSpan(zone)?.max ?? null;
}

const INTENSITY_TO_ZONE: Record<DanielsIntensity, number> = {
  E: 2, M: 3, T: 4, I: 5, R: 6,
};

const INTENSITY_LABELS: Record<DanielsIntensity, { fr: string; en: string }> = {
  E: { fr: "Allure endurance", en: "Easy pace" },
  M: { fr: "Allure marathon", en: "Marathon pace" },
  T: { fr: "Allure seuil", en: "Threshold pace" },
  I: { fr: "Allure VMA", en: "VO2max pace" },
  R: { fr: "Allure vitesse", en: "Repetition pace" },
};

// ── Main builder ────────────────────────────────────────────────

/**
 * Build a complete plan session: select workout, scale it, annotate paces,
 * compute load.
 */
export function buildSession(ctx: SessionBuildContext): SessionBuildResult | null {
  // Step 1: Select the best workout template
  const selection = selectWorkout(
    ctx.slot,
    ctx.phase,
    ctx.difficulty,
    ctx.raceDistance,
    ctx.allWorkouts,
    ctx.usedWorkoutIds,
    ctx.volumePercent,
    ctx.elevationGain,
    ctx.daysPerWeek ?? 5,
    ctx.excludeWorkoutIds ?? [],
    ctx.slot.slotType === "long_run"
      ? ctx.targetLongRunMin
      : (ctx.slot.slotType === "easy" || ctx.slot.slotType === "recovery")
        ? ctx.targetEasyMin
        : undefined,
  );

  if (!selection) return null;

  // Find the full workout object
  const workout = ctx.allWorkouts.find(w => w.id === selection.workoutId);
  if (!workout) return null;

  // Step 2: Calculate intra-phase progression (0.0 → 1.0)
  const progression = ctx.totalPhaseWeeks > 1
    ? ctx.weekInPhase / (ctx.totalPhaseWeeks - 1)
    : 0.5;

  // Step 3: Scale the workout (reps, duration, distance)
  const scaledReps = scaleWorkout(workout, progression);

  // Step 4: Compute pace-aware duration AND distance (breakdown for volume scaling)
  const dur = estimatePaceAwareEffort(workout, ctx.paces, scaledReps);

  // Apply volume scaling to main set only (warmup/cooldown unchanged)
  const volumeScale = ctx.volumePercent / 100;
  const scaledTotal = Math.round(dur.warmupMin + dur.mainMin * volumeScale + dur.cooldownMin);
  const scaledKm = dur.warmupKm + dur.mainKm * volumeScale + dur.cooldownKm;

  // Step 5: Build pace notes
  const paceNotes = buildPaceNotes(workout, ctx.paces);

  // Step 6: Compute load score (based on full duration, not volume-scaled).
  // Use the type that actually matched, which may be a fallback of the slot.
  const sessionType = selection.sessionType;
  const intensity = sessionTypeToIntensity(sessionType);
  const zone = INTENSITY_TO_ZONE[intensity];
  const loadScore = computeBlockLoad(dur.totalMin, zone);

  // Step 7: Build session notes.
  // Quote the hardest pace the main set actually calls for, not the one implied
  // by the session type: fartlek maps to I, yet most fartlek templates top out
  // at Z4, so the note read "Allure VMA" above threshold-pace blocks.
  const INTENSITY_RANK: DanielsIntensity[] = ["E", "M", "T", "I", "R"];
  const hardestFromBlocks = paceNotes.reduce<DanielsIntensity | null>((hardest, n) => {
    const candidate = n.zone as DanielsIntensity;
    if (!INTENSITY_RANK.includes(candidate)) return hardest;
    if (!hardest) return candidate;
    return INTENSITY_RANK.indexOf(candidate) > INTENSITY_RANK.indexOf(hardest) ? candidate : hardest;
  }, null);

  const notesParts = buildSessionNotes(
    sessionType,
    ctx.paces,
    scaledReps,
    ctx.targetLongRunKm,
    ctx.targetLongRunMin,
    ctx.elevationGain,
    ctx.slot.slotType,
    hardestFromBlocks,
  );

  // Assemble the session.
  // A key_quality slot filled with an easy-run fallback is not a key session —
  // labelling it as one misrepresents the week's hard/easy balance.
  const QUALITY_TYPES = new Set([
    "vo2max", "threshold", "tempo", "hills", "fartlek", "race_specific", "speed", "intervals",
  ]);
  const session: PlanSession = {
    dayOfWeek: ctx.slot.dayOfWeek,
    workoutId: workout.id,
    sessionType,
    isKeySession: ctx.slot.slotType === "key_quality" && QUALITY_TYPES.has(sessionType),
    estimatedDurationMin: Math.max(20, scaledTotal),
    notes: notesParts.notes,
    notesEn: notesParts.notesEn,
    // v2 fields
    targetDurationMin: Math.max(20, dur.totalMin),
    loadScore: Math.round(loadScore * 10) / 10,
    paceNotes,
    scaledRepetitions: scaledReps ?? undefined,
  };

  // Long run: override duration with targetLongRunKm-based estimate
  // The workout template duration is often too short for the actual target distance
  if (ctx.slot.slotType === "long_run" && ctx.targetLongRunKm && ctx.targetLongRunKm > 0) {
    session.targetDistanceKm = ctx.targetLongRunKm;
    const longRunDurationFromTarget = ctx.targetLongRunMin
      ?? Math.round(ctx.targetLongRunKm * ((ctx.paces.E.min + ctx.paces.E.max) / 2));
    session.targetDurationMin = longRunDurationFromTarget;
    session.estimatedDurationMin = Math.max(session.estimatedDurationMin, longRunDurationFromTarget);
    // Recompute the load on the duration actually prescribed. Keeping the
    // template's score made a 174-minute long run cost the same as a 79-minute
    // one, which reported week 1 as harder than the peak week.
    session.loadScore = Math.round(
      computeBlockLoad(session.estimatedDurationMin, zone) * 10,
    ) / 10;
  }

  // Estimate distance for all running sessions that don't already have it.
  // The distance comes from the block-level breakdown (warmup/cooldown and
  // interval recoveries run at easy pace), never from applying the session's
  // peak intensity to its whole duration.
  const NON_RUNNING_TYPES = new Set(["strength", "cycling", "swimming", "yoga", "cross_training"]);
  if (!session.targetDistanceKm && !NON_RUNNING_TYPES.has(session.sessionType)) {
    // If the duration was clamped up to the 20min floor, scale distance with it
    const km = scaledTotal > 0
      ? scaledKm * (session.estimatedDurationMin / scaledTotal)
      : session.estimatedDurationMin / ((ctx.paces.E.min + ctx.paces.E.max) / 2);
    session.targetDistanceKm = Math.round(km * 2) / 2; // round to 0.5km
  }

  return { session, workout };
}

// ── Scaling ─────────────────────────────────────────────────────

/**
 * Scale a workout's main set based on intra-phase progression.
 * Returns the scaled repetition count, or null if no scaling rules.
 *
 * Example: VMA-001 has scaling { progressionType: "reps", minValue: 8, maxValue: 14, stepSize: 2 }
 * At progression 0.5 → 8 + (14-8) * 0.5 = 11, rounded to step → 10 or 12
 */
function scaleWorkout(workout: WorkoutTemplate, progression: number): number | null {
  const scaling = workout.scaling;
  if (!scaling) return null;

  const range = scaling.maxValue - scaling.minValue;
  const rawValue = scaling.minValue + range * progression;

  // Round to step size if specified
  if (scaling.stepSize && scaling.stepSize > 0) {
    const steps = Math.round((rawValue - scaling.minValue) / scaling.stepSize);
    return scaling.minValue + steps * scaling.stepSize;
  }

  return Math.round(rawValue);
}

// ── Pace-aware duration estimation ──────────────────────────────

/**
 * Estimate workout duration and distance using actual user paces instead of a
 * hardcoded 5min/km. Distance is accumulated block by block: efforts run at
 * their own zone pace, recoveries and rests at easy pace. Applying the peak
 * intensity to the whole session would badly overstate weekly km.
 * Falls back to typicalDuration for workouts without block data.
 */
interface EffortBreakdown {
  warmupMin: number;
  warmupKm: number;
  mainMin: number;
  mainKm: number;
  cooldownMin: number;
  cooldownKm: number;
  totalMin: number;
}

interface BlockEffort {
  min: number;
  km: number;
}

const NO_DATA: BlockEffort = { min: -1, km: 0 };

function estimatePaceAwareEffort(
  workout: WorkoutTemplate,
  paces: TrainingPaces,
  scaledReps: number | null,
): EffortBreakdown {
  const warmup = estimateBlocksEffort(workout.warmupTemplate || [], paces, null);
  const cooldown = estimateBlocksEffort(workout.cooldownTemplate || [], paces, null);

  const mainBlocks = workout.mainSetTemplate || [];
  const main = mainBlocks.length > 0
    ? estimateBlocksEffort(mainBlocks, paces, scaledReps)
    : NO_DATA;

  const wMin = warmup.min >= 0 ? warmup.min : 0;
  const cMin = cooldown.min >= 0 ? cooldown.min : 0;

  if (main.min >= 0) {
    return {
      warmupMin: wMin,
      warmupKm: warmup.min >= 0 ? warmup.km : 0,
      mainMin: main.min,
      mainKm: main.km,
      cooldownMin: cMin,
      cooldownKm: cooldown.min >= 0 ? cooldown.km : 0,
      totalMin: Math.round(wMin + main.min + cMin),
    };
  }

  // Fallback to typicalDuration — assume easy pace for the whole session
  const avg = (workout.typicalDuration.min + workout.typicalDuration.max) / 2;
  const easyPace = (paces.E.min + paces.E.max) / 2;
  return {
    warmupMin: 0,
    warmupKm: 0,
    mainMin: avg,
    mainKm: avg / easyPace,
    cooldownMin: 0,
    cooldownKm: 0,
    totalMin: Math.round(avg),
  };
}

/**
 * Sum duration and distance over a group of blocks.
 */
function estimateBlocksEffort(
  blocks: WorkoutBlock[],
  paces: TrainingPaces,
  scaledReps: number | null,
): BlockEffort {
  let totalMin = 0;
  let totalKm = 0;
  let hasData = false;

  for (const block of blocks) {
    const effort = estimateSingleBlockEffort(block, paces, scaledReps);
    if (effort.min > 0) {
      totalMin += effort.min;
      totalKm += effort.km;
      hasData = true;
    }
  }

  return hasData ? { min: totalMin, km: totalKm } : NO_DATA;
}

/**
 * Estimate duration and distance of a single block using pace-aware calculations.
 */
function estimateSingleBlockEffort(
  block: WorkoutBlock,
  paces: TrainingPaces,
  scaledReps: number | null,
): BlockEffort {
  // Only apply scaledReps to blocks that already have repetitions defined
  // (scaledReps overrides the rep count for the scaled block, not all blocks)
  const reps = (block.repetitions && scaledReps) ? scaledReps : (block.repetitions ?? 1);
  const sets = block.sets ?? 1;
  const easyPace = (paces.E.min + paces.E.max) / 2;

  // Duration-based blocks (steady-state efforts)
  if (block.durationMin) {
    const min = block.durationMin * reps * sets;
    return { min, km: min / getPaceForBlock(block, paces) };
  }

  // Distance-based blocks (intervals) — use pace-aware estimation
  if (block.distanceM || block.distanceKm) {
    const distanceKm = block.distanceKm ?? ((block.distanceM ?? 0) / 1000);
    if (distanceKm <= 0) return { min: 0, km: 0 };

    // Determine pace from zone or intensityType
    const paceMinKm = getPaceForBlock(block, paces);
    const runTimeMin = distanceKm * paceMinKm;

    // Recovery time between reps — covered at easy pace
    let recoveryMin = 0;
    if (block.recovery || block.rest) {
      recoveryMin = estimateRecoveryTime(block, runTimeMin);
    }

    // Rest between sets
    let setBetweenRest = 0;
    if (sets > 1 && block.restBetweenSets) {
      setBetweenRest = parseRestDuration(block.restBetweenSets) * (sets - 1);
    }

    return {
      min: (runTimeMin + recoveryMin) * reps * sets + setBetweenRest,
      km: (distanceKm + recoveryMin / easyPace) * reps * sets + setBetweenRest / easyPace,
    };
  }

  // Rep-only blocks (no distance/duration) — parse rep duration from description
  if (reps > 1) {
    const repDurationMin = parseRepDuration(block);
    const recoveryMin = block.recovery || block.rest
      ? estimateRecoveryTime(block, repDurationMin)
      : 0;

    // Rest between sets
    let setBetweenRest = 0;
    if (sets > 1 && block.restBetweenSets) {
      setBetweenRest = parseRestDuration(block.restBetweenSets) * (sets - 1);
    } else if (sets > 1) {
      setBetweenRest = 3 * (sets - 1); // default 3min between sets
    }

    const effortPace = getPaceForBlock(block, paces);
    return {
      min: (repDurationMin + recoveryMin) * reps * sets + setBetweenRest,
      km: (repDurationMin / effortPace + recoveryMin / easyPace) * reps * sets
        + setBetweenRest / easyPace,
    };
  }

  return { min: 0, km: 0 };
}

/**
 * Parse rep duration from block description (e.g., "20s VMA / 20s récup" → 0.33min)
 */
function parseRepDuration(block: WorkoutBlock): number {
  const desc = (block.description || "") + " " + (block.descriptionEn || "");

  // Match patterns like "20s", "30s", "45s", "1min", "2min", "3min"
  const secMatch = desc.match(/(\d+)\s*s(?:ec)?\s+(?:VMA|VO2|vite|fast|effort|sprint)/i);
  if (secMatch) return parseInt(secMatch[1]) / 60;

  // Match "Xs/Xs" pattern (e.g., "20/20", "30/30", "45/15")
  const ratioMatch = desc.match(/(\d+)\s*\/\s*(\d+)/);
  if (ratioMatch) {
    const effortSec = parseInt(ratioMatch[1]);
    if (effortSec <= 120) return effortSec / 60; // Only for short intervals
  }

  // Match "Xmin" effort blocks
  const minMatch = desc.match(/(\d+)\s*min\s+(?:VMA|VO2|vite|fast|effort|at)/i);
  if (minMatch) return parseInt(minMatch[1]);

  // Fallback based on whether it has recovery
  return (block.recovery || block.rest) ? 1 : 0.5;
}

/**
 * Get pace (min/km) for a workout block based on its zone or intensity type.
 */
function getPaceForBlock(block: WorkoutBlock, paces: TrainingPaces): number {
  // Direct Daniels intensity reference (v2 blocks)
  if (block.intensityType) {
    const range = paces[block.intensityType];
    return (range.min + range.max) / 2;
  }

  // VMA percentage (v2 blocks)
  if (block.vmaPercent && paces.vma > 0) {
    const speedKmh = paces.vma * (block.vmaPercent / 100);
    return speedKmh > 0 ? 60 / speedKmh : 5;
  }

  // Zone-based (existing blocks)
  const zoneNum = parseZoneNumber(block.zone);
  if (zoneNum) {
    const intensity = zoneToIntensity(zoneNum);
    const range = paces[intensity];
    return (range.min + range.max) / 2;
  }

  // Default: easy pace
  return (paces.E.min + paces.E.max) / 2;
}

/**
 * Map zone number to Daniels intensity.
 */
function zoneToIntensity(zone: number): DanielsIntensity {
  if (zone <= 2) return "E";
  if (zone === 3) return "M";
  if (zone === 4) return "T";
  if (zone === 5) return "I";
  return "R";
}

/**
 * Estimate recovery time from block metadata.
 * Tries to parse recovery duration from strings like "200m footing", "90s", "2min".
 */
function estimateRecoveryTime(block: WorkoutBlock, runTimeMin: number): number {
  const recStr = block.recovery || block.rest || "";

  // Try parsing "Xs" or "Xsec" patterns
  const secMatch = recStr.match(/(\d+)\s*s(?:ec)?/i);
  if (secMatch) return parseInt(secMatch[1]) / 60;

  // Try parsing "Xmin" patterns
  const minMatch = recStr.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]);

  // Try parsing "Xm" distance patterns (e.g., "200m footing")
  const distMatch = recStr.match(/(\d+)\s*m\b/i);
  if (distMatch) {
    const distKm = parseInt(distMatch[1]) / 1000;
    return distKm * 6; // ~6 min/km for recovery jog
  }

  // Default: ~60% of run time (old behavior)
  return runTimeMin * 0.6;
}

/**
 * Parse a rest duration string to minutes.
 */
function parseRestDuration(restStr: string): number {
  const minMatch = restStr.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]);

  const secMatch = restStr.match(/(\d+)\s*s(?:ec)?/i);
  if (secMatch) return parseInt(secMatch[1]) / 60;

  return 3; // default 3 min between sets
}

// ── Pace notes builder ──────────────────────────────────────────

/**
 * Build structured pace notes for a workout.
 * Extracts unique zones from the main set and maps them to paces.
 */
function buildPaceNotes(workout: WorkoutTemplate, paces: TrainingPaces): PaceNote[] {
  const seenIntensities = new Set<DanielsIntensity>();
  const notes: PaceNote[] = [];

  for (const block of workout.mainSetTemplate || []) {
    let intensity: DanielsIntensity;

    if (block.intensityType) {
      intensity = block.intensityType;
    } else {
      const zoneNum = parseZoneNumber(block.zone);
      if (zoneNum === null) continue; // Skip blocks without intensity info
      intensity = zoneToIntensity(zoneNum);
    }

    if (seenIntensities.has(intensity)) continue;
    seenIntensities.add(intensity);

    const range = paces[intensity];
    const label = INTENSITY_LABELS[intensity];

    notes.push({
      zone: intensity,
      paceMinKm: range.min,
      paceMaxKm: range.max,
      description: label.fr,
      descriptionEn: label.en,
    });
  }

  return notes;
}

// ── Session notes builder ───────────────────────────────────────

function buildSessionNotes(
  sessionType: SessionType,
  paces: TrainingPaces,
  scaledReps: number | null,
  targetLongRunKm?: number,
  targetLongRunMin?: number,
  elevationGain?: number,
  slotType?: string,
  blockIntensity?: DanielsIntensity | null,
): { notes: string; notesEn: string } {
  const parts: string[] = [];
  const partsEn: string[] = [];

  // Pace note — prefer what the blocks actually prescribe
  const intensity = blockIntensity ?? sessionTypeToIntensity(sessionType);
  const range = paces[intensity];
  const label = INTENSITY_LABELS[intensity];

  const formatPace = (p: number) => {
    const min = Math.floor(p);
    const sec = Math.round((p - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  parts.push(`${label.fr} : ${formatPace(range.min)} - ${formatPace(range.max)}/km`);
  partsEn.push(`${label.en}: ${formatPace(range.min)} - ${formatPace(range.max)}/km`);

  // Scaled reps info
  if (scaledReps !== null) {
    parts.push(`${scaledReps} répétitions`);
    partsEn.push(`${scaledReps} repetitions`);
  }

  // Long run target
  if (slotType === "long_run" && targetLongRunKm && targetLongRunKm > 0) {
    parts.push(`Sortie longue : ${targetLongRunKm} km (~${targetLongRunMin ?? "?"} min)`);
    partsEn.push(`Long run: ${targetLongRunKm} km (~${targetLongRunMin ?? "?"} min)`);
  }

  // Elevation
  if (elevationGain && elevationGain > 0 && sessionType === "long_run") {
    parts.push(`Course avec ${elevationGain}m D+ — intégrez du dénivelé`);
    partsEn.push(`Race has ${elevationGain}m elevation — include hills`);
  }

  return {
    notes: parts.join("\n"),
    notesEn: partsEn.join("\n"),
  };
}
