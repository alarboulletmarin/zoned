/**
 * Plan Generator — Main orchestrator
 *
 * Generates complete evidence-based training plans from user configuration.
 * Integrates pace engine (Daniels), long run progression (Pfitzinger),
 * km-based volume with exponential taper (Mujika), and 80/20 validation (Seiler).
 *
 * Architecture:
 *   UserProfile → MacroCycle (phases) → WeekPlanner (volume, slots)
 *   → SessionBuilder (select + annotate) → Validator (80/20, load)
 */

import type { TrainingPlan, AssistedPlanConfig, PlanWeek, PlanSession } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { loadAllWorkouts } from "@/data/workouts";
import { calculatePhases, getPhaseForWeek, getWeekInPhase } from "./phases";
import { calculateVolumeProgression } from "./volume";
import { buildWeekTemplate } from "./weekTemplate";
import { generateRaceWeek } from "./raceWeek";
import { MIN_PLAN_WEEKS, MAX_PLAN_WEEKS, PURPOSE_CONFIGS } from "./constants";
import {
  calculateTrainingPaces,
  predictRaceTime,
  sessionTypeToIntensity,
} from "./paceEngine";
import { calculateLongRunProgression } from "./longRunProgression";
import { buildSession } from "./sessionBuilder";

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Generate plan name for non-race plans.
 */
function generateNonRacePlanName(
  purpose: string,
  totalWeeks: number,
): { name: string; nameEn: string } {
  const purposeConfig = PURPOSE_CONFIGS[purpose as keyof typeof PURPOSE_CONFIGS];
  if (purposeConfig) {
    return {
      name: `${purposeConfig.label} — ${totalWeeks} semaines`,
      nameEn: `${purposeConfig.labelEn} — ${totalWeeks} weeks`,
    };
  }
  return {
    name: `Plan ${totalWeeks} semaines`,
    nameEn: `${totalWeeks}-week Plan`,
  };
}

/**
 * Calculate total weeks between today and race date.
 */
function calculateTotalWeeks(raceDate: string): number {
  const now = new Date();
  const race = new Date(raceDate);
  const diffMs = race.getTime() - now.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks;
}

/**
 * Generate plan name from config.
 */
function generatePlanName(config: AssistedPlanConfig): { name: string; nameEn: string } {
  const distMeta = RACE_DISTANCE_META[config.raceDistance];
  const dateStr = new Date(config.raceDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateStrEn = new Date(config.raceDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (config.raceName) {
    return {
      name: `${distMeta.label} - ${config.raceName}`,
      nameEn: `${distMeta.labelEn} - ${config.raceName}`,
    };
  }

  return {
    name: `Plan ${distMeta.label} - ${dateStr}`,
    nameEn: `${distMeta.labelEn} Plan - ${dateStrEn}`,
  };
}

/**
 * Get phase label for a week.
 */
function getWeekLabel(
  weekNumber: number,
  totalWeeks: number,
  _phase: string,
  isRecoveryWeek: boolean
): { weekLabel: string; weekLabelEn: string } {
  if (weekNumber === totalWeeks) {
    return { weekLabel: "Semaine de course", weekLabelEn: "Race Week" };
  }
  if (isRecoveryWeek) {
    return { weekLabel: "Semaine de récupération", weekLabelEn: "Recovery Week" };
  }

  return {
    weekLabel: `S${weekNumber}`,
    weekLabelEn: `W${weekNumber}`,
  };
}

// ── Main orchestrator ──────────────────────────────────────────────

/**
 * Generate a complete training plan from user configuration.
 *
 * Supports both race-targeted plans and non-race plans (base building,
 * return from injury, beginner start).
 *
 * v2 Algorithm:
 * 1. Determine total weeks (from race date or manual override)
 * 2. Validate week count
 * 3. Resolve plan purpose and effective race distance
 * 4. Calculate training paces, phases, volume, long run progression
 * 5. Build weeks with session builder
 * 6. Return complete plan with v2 metadata
 */
export async function generatePlan(config: AssistedPlanConfig): Promise<TrainingPlan> {
  const purpose = config.planPurpose ?? "race";
  const isRacePlan = purpose === "race";
  const purposeConfig = !isRacePlan ? PURPOSE_CONFIGS[purpose] : null;

  // Step 1: Calculate total weeks
  let totalWeeks: number;
  if (config.totalWeeksOverride && config.totalWeeksOverride > 0) {
    // Manual override (non-race plans or user preference)
    totalWeeks = config.totalWeeksOverride;
  } else if (config.raceDate) {
    totalWeeks = calculateTotalWeeks(config.raceDate);
  } else if (purposeConfig) {
    totalWeeks = purposeConfig.defaultWeeks;
  } else {
    throw new Error("Date de course ou durée du plan requise.");
  }

  // Step 2: Validate
  const minWeeks = purposeConfig?.minWeeks ?? MIN_PLAN_WEEKS;
  const maxWeeks = purposeConfig?.maxWeeks ?? MAX_PLAN_WEEKS;
  if (totalWeeks < minWeeks) {
    throw new Error(
      `Le plan nécessite au moins ${minWeeks} semaines (${totalWeeks} disponibles).`
    );
  }
  if (totalWeeks > maxWeeks) {
    throw new Error(
      `Le plan est limité à ${maxWeeks} semaines (${totalWeeks} demandées).`
    );
  }

  // Step 3: Resolve effective race distance (non-race plans use a fallback)
  const effectiveDistance = config.raceDistance
    ?? purposeConfig?.fallbackDistance
    ?? "10K";

  // Step 4: Calculate training paces (Daniels-based)
  const paces = calculateTrainingPaces(config.vma, config.runnerLevel);

  // Step 5: Calculate phases
  const trainingGoal = config.trainingGoal;

  let phases;
  if (purposeConfig) {
    // Non-race plans: use purpose-specific phase distribution (no taper)
    const pc = purposeConfig.phases;
    const availableWeeks = totalWeeks;
    let baseWeeks = Math.max(1, Math.round(availableWeeks * pc.base));
    let buildWeeks = Math.max(1, Math.round(availableWeeks * pc.build));
    let peakWeeks = availableWeeks - baseWeeks - buildWeeks;
    // Ensure all phases have at least 1 week and total equals availableWeeks
    if (peakWeeks < 1) {
      peakWeeks = 1;
      const excess = baseWeeks + buildWeeks + peakWeeks - availableWeeks;
      if (excess > 0) {
        if (baseWeeks >= buildWeeks && baseWeeks > 1) {
          baseWeeks = Math.max(1, baseWeeks - excess);
        } else if (buildWeeks > 1) {
          buildWeeks = Math.max(1, buildWeeks - excess);
        }
      }
    }

    phases = [];
    let w = 1;
    phases.push({ phase: "base" as const, startWeek: w, endWeek: w + baseWeeks - 1 });
    w += baseWeeks;
    phases.push({ phase: "build" as const, startWeek: w, endWeek: w + buildWeeks - 1 });
    w += buildWeeks;
    if (peakWeeks > 0) {
      phases.push({ phase: "peak" as const, startWeek: w, endWeek: w + peakWeeks - 1 });
    }
  } else {
    phases = calculatePhases(totalWeeks, effectiveDistance, trainingGoal);
  }

  // Step 6: Calculate volume progression
  const volumeMultiplier = purposeConfig?.volumeMultiplier ?? 1;
  const volumeProgression = calculateVolumeProgression(
    totalWeeks,
    phases,
    effectiveDistance,
    config.runnerLevel,
    config.currentWeeklyKm,
    trainingGoal,
    config.daysPerWeek,
  );

  // Apply purpose volume multiplier
  if (volumeMultiplier !== 1) {
    for (const wv of volumeProgression) {
      wv.targetKm = Math.round(wv.targetKm * volumeMultiplier);
    }
  }

  // Step 7: Calculate training paces (already done above)
  const taperPhase = phases.find(p => p.phase === "taper");
  const taperWeekCount = taperPhase
    ? (taperPhase.endWeek - taperPhase.startWeek + 1)
    : 0;

  const longRunTargets = calculateLongRunProgression(
    totalWeeks,
    effectiveDistance,
    config.runnerLevel,
    taperWeekCount,
    paces,
    config.currentLongRunKm,
    trainingGoal,
  );

  // Step 8: Load all workouts
  const allWorkouts = await loadAllWorkouts();

  // Step 9: Build weeks
  const weeks: PlanWeek[] = [];
  const usedWorkoutIds: string[] = [];
  let peakWeeklyKm = 0;
  let peakLongRunKm = 0;

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const phase = getPhaseForWeek(weekNum, phases);
    const volumeInfo = volumeProgression.find(v => v.weekNumber === weekNum);
    const volumePercent = volumeInfo?.volumePercent ?? 80;
    const targetKm = volumeInfo?.targetKm ?? 0;
    const isRecoveryWeek = volumeInfo?.isRecoveryWeek ?? false;
    const longRunTarget = longRunTargets.find(lr => lr.weekNumber === weekNum);

    // Track peaks (will be recalculated from actual sessions below)
    if (longRunTarget && longRunTarget.distanceKm > peakLongRunKm) {
      peakLongRunKm = longRunTarget.distanceKm;
    }

    // Race week (last week) — only for race plans
    if (weekNum === totalWeeks && isRacePlan) {
      const raceWeek = generateRaceWeek(
        weekNum,
        effectiveDistance,
        config.daysPerWeek,
        config.longRunDay,
        config.runnerLevel,
        allWorkouts
      );
      raceWeek.targetKm = targetKm;
      weeks.push(raceWeek);
      continue;
    }

    // Build week template (slot distribution, goal-adjusted)
    const slots = buildWeekTemplate(
      config.daysPerWeek,
      config.longRunDay,
      phase,
      isRecoveryWeek,
      trainingGoal,
    );

    // Get intra-phase progression info (for workout scaling)
    const { weekInPhase, totalPhaseWeeks } = getWeekInPhase(weekNum, phases);

    // Build sessions using the session builder (select + scale + annotate)
    const sessions: PlanSession[] = [];
    const weekUsedIds: string[] = [];
    let weeklyLoadScore = 0;

    for (const slot of slots) {
      const result = buildSession({
        slot,
        phase,
        weekInPhase,
        totalPhaseWeeks,
        volumePercent,
        difficulty: config.runnerLevel,
        raceDistance: effectiveDistance,
        allWorkouts,
        usedWorkoutIds,
        paces,
        elevationGain: config.elevationGain,
        targetLongRunKm: longRunTarget?.distanceKm,
        targetLongRunMin: longRunTarget?.durationMin,
        daysPerWeek: config.daysPerWeek,
      });

      if (result) {
        sessions.push(result.session);
        weekUsedIds.push(result.workout.id);
        weeklyLoadScore += result.session.loadScore ?? 0;
      }
    }

    // Update rolling used IDs (keep last 6 weeks worth for better variety)
    usedWorkoutIds.push(...weekUsedIds);
    const maxHistory = config.daysPerWeek * 6;
    while (usedWorkoutIds.length > maxHistory) {
      usedWorkoutIds.shift();
    }

    const labels = getWeekLabel(weekNum, totalWeeks, phase, isRecoveryWeek);

    // Compute weekly km from sessions using pace-aware estimation
    const weeklyKmFromSessions = sessions.reduce((sum, s) => {
      // Use explicit distance if set (long runs)
      if (s.targetDistanceKm && s.targetDistanceKm > 0) return sum + s.targetDistanceKm;
      // Estimate from duration using the session's intensity-specific pace
      const intensity = sessionTypeToIntensity(s.sessionType);
      const paceRange = paces[intensity];
      const avgPaceMinKm = (paceRange.min + paceRange.max) / 2;
      return sum + (s.estimatedDurationMin / avgPaceMinKm);
    }, 0);
    const actualKm = Math.round(weeklyKmFromSessions);

    weeks.push({
      weekNumber: weekNum,
      phase,
      isRecoveryWeek,
      volumePercent,
      sessions,
      weekLabel: labels.weekLabel,
      weekLabelEn: labels.weekLabelEn,
      // v2 fields — targetKm based on actual session content, not theoretical model
      targetKm: actualKm,
      targetLongRunKm: longRunTarget?.distanceKm,
      weeklyLoadScore: Math.round(weeklyLoadScore),
    });
  }

  // Recalculate peak metrics from actual week data
  peakWeeklyKm = Math.max(...weeks.map(w => w.targetKm ?? 0));

  // Step 10: Race time prediction (only for race plans)
  const raceTimePrediction = (isRacePlan && config.vma)
    ? predictRaceTime(config.vma, effectiveDistance)
    : undefined;

  // Step 11: Generate plan name
  const { name, nameEn } = isRacePlan
    ? generatePlanName(config)
    : generateNonRacePlanName(purpose, totalWeeks);

  // Step 12b: Add strength training suggestions (if enabled)
  // Evidence: Ronnestad et al. (2014) — periodized strength training alongside
  // endurance improves performance more than endurance alone.
  if (config.includeStrength) {
    const { addStrengthSuggestions } = await import("./strengthIntegration");
    await addStrengthSuggestions(weeks, config.strengthFrequency ?? 2);
  }

  // Step 12: Return complete plan
  return {
    id: crypto.randomUUID(),
    config,
    weeks,
    totalWeeks,
    phases,
    raceTimePrediction,
    name,
    nameEn,
    // v2 metadata
    version: 2,
    peakWeeklyKm: peakWeeklyKm,
    peakLongRunKm: peakLongRunKm,
  };
}

// Re-export sub-modules for direct access
export { calculatePhases, getPhaseForWeek, getWeekInPhase } from "./phases";
export { calculateVolumeProgression } from "./volume";
export { buildWeekTemplate } from "./weekTemplate";
export type { WeekSlot, SlotType } from "./weekTemplate";
export { selectWorkout } from "./selector";
export { generateRaceWeek } from "./raceWeek";
export { calculateTrainingPaces, formatPaceRange, predictRaceTime } from "./paceEngine";
export { calculateLongRunProgression } from "./longRunProgression";
export { buildSession } from "./sessionBuilder";
