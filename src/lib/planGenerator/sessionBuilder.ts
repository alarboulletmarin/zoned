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
  paces: TrainingPaces;
  elevationGain?: number;
  targetLongRunKm?: number;   // From longRunProgression
  targetLongRunMin?: number;
}

// ── Zone mapping ────────────────────────────────────────────────

const ZONE_TO_NUMBER: Record<string, number> = {
  Z1: 1, Z2: 2, Z3: 3, Z4: 4, Z5: 5, Z6: 6,
  "Z1-Z2": 2, "Z2-Z3": 3, "Z3-Z4": 4, "Z4-Z5": 5,
};

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

  // Step 4: Compute pace-aware duration
  const duration = estimatePaceAwareDuration(
    workout,
    ctx.volumePercent,
    ctx.paces,
    scaledReps,
  );

  // Step 5: Build pace notes
  const paceNotes = buildPaceNotes(workout, ctx.paces);

  // Step 6: Compute load score
  const intensity = sessionTypeToIntensity(ctx.slot.sessionTypes[0]);
  const zone = INTENSITY_TO_ZONE[intensity];
  const loadScore = computeBlockLoad(duration, zone);

  // Step 7: Build session notes
  const notesParts = buildSessionNotes(
    ctx.slot.sessionTypes[0],
    ctx.paces,
    scaledReps,
    ctx.targetLongRunKm,
    ctx.targetLongRunMin,
    ctx.elevationGain,
    ctx.slot.slotType,
  );

  // Assemble the session
  const session: PlanSession = {
    dayOfWeek: ctx.slot.dayOfWeek,
    workoutId: workout.id,
    sessionType: ctx.slot.sessionTypes[0],
    isKeySession: ctx.slot.slotType === "key_quality",
    estimatedDurationMin: Math.max(20, duration),
    notes: notesParts.notes,
    notesEn: notesParts.notesEn,
    // v2 fields
    targetDurationMin: Math.max(20, duration),
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
 * Estimate workout duration using actual user paces instead of hardcoded 5min/km.
 * Falls back to the old approach for workouts without distance data.
 */
function estimatePaceAwareDuration(
  workout: WorkoutTemplate,
  volumePercent: number,
  paces: TrainingPaces,
  scaledReps: number | null,
): number {
  const warmup = estimateBlocksDurationWithPaces(workout.warmupTemplate || [], paces);
  const cooldown = estimateBlocksDurationWithPaces(workout.cooldownTemplate || [], paces);

  let mainDuration: number;
  const mainBlocks = workout.mainSetTemplate || [];

  if (mainBlocks.length > 0) {
    mainDuration = estimateMainSetDuration(mainBlocks, paces, scaledReps);
  } else {
    mainDuration = -1;
  }

  const warmupMin = warmup >= 0 ? warmup : 0;
  const cooldownMin = cooldown >= 0 ? cooldown : 0;

  if (mainDuration >= 0) {
    // Scale only main set by volume %
    const scaledMain = Math.round(mainDuration * (volumePercent / 100));
    return Math.round(warmupMin + scaledMain + cooldownMin);
  }

  // Fallback to typicalDuration
  const avg = (workout.typicalDuration.min + workout.typicalDuration.max) / 2;
  return Math.round(avg * (volumePercent / 100));
}

/**
 * Estimate duration of workout blocks using user-specific paces.
 */
function estimateBlocksDurationWithPaces(blocks: WorkoutBlock[], paces: TrainingPaces): number {
  let total = 0;
  let hasData = false;

  for (const block of blocks) {
    const dur = estimateSingleBlockDuration(block, paces, null);
    if (dur > 0) {
      total += dur;
      hasData = true;
    }
  }

  return hasData ? total : -1;
}

/**
 * Estimate main set duration, with optional rep scaling.
 */
function estimateMainSetDuration(
  blocks: WorkoutBlock[],
  paces: TrainingPaces,
  scaledReps: number | null,
): number {
  let total = 0;
  let hasData = false;

  for (const block of blocks) {
    const dur = estimateSingleBlockDuration(block, paces, scaledReps);
    if (dur > 0) {
      total += dur;
      hasData = true;
    }
  }

  return hasData ? total : -1;
}

/**
 * Estimate duration of a single block using pace-aware calculations.
 */
function estimateSingleBlockDuration(
  block: WorkoutBlock,
  paces: TrainingPaces,
  scaledReps: number | null,
): number {
  // Only apply scaledReps to blocks that already have repetitions defined
  // (scaledReps overrides the rep count for the scaled block, not all blocks)
  const reps = (block.repetitions && scaledReps) ? scaledReps : (block.repetitions ?? 1);
  const sets = block.sets ?? 1;

  // Duration-based blocks (steady-state efforts)
  if (block.durationMin) {
    return block.durationMin * reps * sets;
  }

  // Distance-based blocks (intervals) — use pace-aware estimation
  if (block.distanceM || block.distanceKm) {
    const distanceKm = block.distanceKm ?? ((block.distanceM ?? 0) / 1000);
    if (distanceKm <= 0) return 0;

    // Determine pace from zone or intensityType
    const paceMinKm = getPaceForBlock(block, paces);
    const runTimeMin = distanceKm * paceMinKm;

    // Recovery time between reps
    let recoveryMin = 0;
    if (block.recovery || block.rest) {
      recoveryMin = estimateRecoveryTime(block, runTimeMin);
    }

    // Rest between sets
    let setBetweenRest = 0;
    if (sets > 1 && block.restBetweenSets) {
      setBetweenRest = parseRestDuration(block.restBetweenSets) * (sets - 1);
    }

    return (runTimeMin + recoveryMin) * reps * sets + setBetweenRest;
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

    return (repDurationMin + recoveryMin) * reps * sets + setBetweenRest;
  }

  return 0;
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
  if (block.zone) {
    const zoneStr = typeof block.zone === "string" ? block.zone : `Z${block.zone}`;
    const zoneNum = ZONE_TO_NUMBER[zoneStr];
    if (zoneNum) {
      const intensity = zoneToIntensity(zoneNum);
      const range = paces[intensity];
      return (range.min + range.max) / 2;
    }
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
    } else if (block.zone) {
      const zoneStr = typeof block.zone === "string" ? block.zone : `Z${block.zone}`;
      const zoneNum = ZONE_TO_NUMBER[zoneStr] ?? 2;
      intensity = zoneToIntensity(zoneNum);
    } else {
      continue; // Skip blocks without intensity info
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
): { notes: string; notesEn: string } {
  const parts: string[] = [];
  const partsEn: string[] = [];

  // Pace note
  const intensity = sessionTypeToIntensity(sessionType);
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
