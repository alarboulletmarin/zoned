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
import type { SessionType } from "@/types";
import { RACE_DISTANCE_META } from "@/types/plan";
import { loadAllWorkouts } from "@/data/workouts";
import { calculatePhases, getPhaseForWeek, getWeekInPhase } from "./phases";
import { calculateVolumeProgression } from "./volume";
import { buildWeekTemplate } from "./weekTemplate";
import { generateRaceWeek } from "./raceWeek";
import {
  MIN_PLAN_WEEKS,
  MAX_PLAN_WEEKS,
  PURPOSE_CONFIGS,
  RECOVERY_LONG_RUN_PCT,
  MAX_WEEKLY_VOLUME_INCREASE,
} from "./constants";
import {
  calculateTrainingPaces,
  predictRaceTime,
} from "./paceEngine";
import {
  calculateLongRunProgression,
  capLongRunToWeeklyShare,
} from "./longRunProgression";
import { buildSession } from "./sessionBuilder";
import { fitWeeklyVolume } from "./weeklyVolumeFit";
import { goalDemandFactor } from "./goalCalibration";
import { planSeedFromConfig, seedPlanRng } from "./rng";
import { calculateWeeksBetweenDates } from "@/lib/planDates";
import { intermediateGoalToWeekNumber } from "@/lib/intermediateGoalValidation";

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
 * Calculate total weeks between plan start date and race date.
 * Uses the user-chosen start date (falls back to today if absent).
 */
function calculateTotalWeeks(startDate: string, raceDate: string): number {
  return calculateWeeksBetweenDates(startDate, raceDate);
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
  const dateStrEn = new Date(config.raceDate).toLocaleDateString("en-GB", {
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
  // Same config → same plan, so a plan shared by its config regenerates
  // identically on the recipient's side.
  seedPlanRng(planSeedFromConfig(config));

  const purpose = config.planPurpose ?? "race";
  const isRacePlan = purpose === "race";
  const purposeConfig = !isRacePlan ? PURPOSE_CONFIGS[purpose] : null;

  // Step 1: Calculate total weeks
  let totalWeeks: number;
  if (config.totalWeeksOverride && config.totalWeeksOverride > 0) {
    // Manual override (non-race plans or user preference)
    totalWeeks = config.totalWeeksOverride;
  } else if (config.raceDate) {
    const todayIso = new Date().toISOString().split("T")[0];
    totalWeeks = calculateTotalWeeks(config.startDate ?? todayIso, config.raceDate);
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

  // Step 6: Calculate volume progression.
  // The purpose multiplier is passed in so it scales the reference table only:
  // applying it afterwards also shrank the volume the runner reported doing.
  const volumeMultiplier = purposeConfig?.volumeMultiplier ?? 1;
  const volumeProgression = calculateVolumeProgression(
    totalWeeks,
    phases,
    effectiveDistance,
    config.runnerLevel,
    config.currentWeeklyKm,
    trainingGoal,
    config.daysPerWeek,
    volumeMultiplier,
    // A target race time that current fitness does not support needs volume
    isRacePlan
      ? goalDemandFactor(config.targetPaceMinKm, config.vma, effectiveDistance)
      : 1,
    purposeConfig?.startVolumeMultiplier,
  );

  // Step 7: Calculate training paces (already done above)
  const taperPhase = phases.find(p => p.phase === "taper");
  const taperWeekCount = taperPhase
    ? (taperPhase.endWeek - taperPhase.startWeek + 1)
    : 0;

  // Compute intermediate race week numbers for long run awareness
  // For long races (>= semi / 21.1km), also include week+1 to force step-back
  const intermediateRaceWeeks = isRacePlan && config.intermediateGoals?.length
    ? config.intermediateGoals.flatMap(g => {
        const wk = intermediateGoalToWeekNumber(g.raceDate, config.startDate ?? config.createdAt);
        const distKm = RACE_DISTANCE_META[g.raceDistance]?.distanceKm ?? 10;
        // For long races, also force step-back on the week after
        return distKm >= 21.1 ? [wk, wk + 1] : [wk];
      })
    : undefined;

  const longRunTargets = calculateLongRunProgression(
    totalWeeks,
    effectiveDistance,
    config.runnerLevel,
    taperWeekCount,
    paces,
    config.currentLongRunKm,
    trainingGoal,
    intermediateRaceWeeks,
  );

  // Step 8: Load all workouts
  const allWorkouts = await loadAllWorkouts();

  // Step 9: Build weeks
  const weeks: PlanWeek[] = [];
  const usedWorkoutIds: string[] = [];
  let peakWeeklyKm = 0;
  /** Km actually delivered by the last load week — anchors the ramp cap */
  let lastLoadWeekKm = 0;
  let peakLongRunKm = 0;

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const phase = getPhaseForWeek(weekNum, phases);
    const volumeInfo = volumeProgression.find(v => v.weekNumber === weekNum);
    const volumePercent = volumeInfo?.volumePercent ?? 80;
    const targetKm = volumeInfo?.targetKm ?? 0;
    const isRecoveryWeek = volumeInfo?.isRecoveryWeek ?? false;
    const rawLongRunTarget = longRunTargets.find(lr => lr.weekNumber === weekNum);
    // Recovery weeks keep a shortened long run rather than dropping it, and no
    // week lets the long run swallow most of its volume.
    const longRunTarget = rawLongRunTarget
      ? (() => {
          const recoveryScale = isRecoveryWeek ? RECOVERY_LONG_RUN_PCT : 1;
          const capped = capLongRunToWeeklyShare(
            rawLongRunTarget.distanceKm * recoveryScale,
            targetKm,
            effectiveDistance,
          );
          const ratio = rawLongRunTarget.distanceKm > 0
            ? capped / rawLongRunTarget.distanceKm
            : 1;
          return {
            ...rawLongRunTarget,
            distanceKm: Math.round(capped * 2) / 2,
            durationMin: Math.round(rawLongRunTarget.durationMin * ratio),
          };
        })()
      : rawLongRunTarget;

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
        allWorkouts,
        (paces.E.min + paces.E.max) / 2,
      );
      // Report what is actually scheduled, not the model's target: race week
      // announced 30 km for two 25-minute jogs. The race itself is an event,
      // not training volume, so it stays out of the weekly total.
      const easyPaceRaceWeek = (paces.E.min + paces.E.max) / 2;
      raceWeek.targetKm = Math.round(
        raceWeek.sessions.reduce((sum, s) => {
          if (s.workoutId === "__race_day__") return sum;
          if (s.targetDistanceKm && s.targetDistanceKm > 0) return sum + s.targetDistanceKm;
          return sum + s.estimatedDurationMin / easyPaceRaceWeek;
        }, 0),
      );
      raceWeek.weeklyLoadScore = Math.round(
        raceWeek.sessions.reduce((sum, s) => sum + (s.loadScore ?? 0), 0),
      );
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
      effectiveDistance,
      weekNum,
    );

    // Non-race plans have their own quality budget and intensity ceiling.
    // PURPOSE_CONFIGS.maxKeySessions was defined but never read, so a
    // return-from-injury plan could schedule VO2max intervals in week 4.
    if (purposeConfig) {
      const softKeyTypes: SessionType[] = purpose === "base_building"
        ? ["fartlek", "tempo", "hills"]
        : ["fartlek", "endurance"];
      let keptKeys = 0;
      for (const slot of slots) {
        if (slot.slotType !== "key_quality") continue;
        if (keptKeys < purposeConfig.maxKeySessions) {
          // Rotate like the race-plan templates do: a fixed order meant the
          // first type always won, so these plans ran fartlek every week and
          // nothing else for their whole cycle.
          const offset = (weekNum + keptKeys) % softKeyTypes.length;
          slot.sessionTypes = [...softKeyTypes.slice(offset), ...softKeyTypes.slice(0, offset)];
          keptKeys++;
        } else {
          slot.slotType = "easy";
          slot.sessionTypes = ["endurance", "recovery"];
        }
      }
    }

    // Get intra-phase progression info (for workout scaling)
    const { weekInPhase, totalPhaseWeeks } = getWeekInPhase(weekNum, phases);

    // Rough size of a non-long-run session this week, so the selector can pick
    // templates that already fit instead of leaning on the volume fit to resize
    // them. Key sessions keep their own structure, hence the easy-pace estimate.
    const easyPaceForSlots = (paces.E.min + paces.E.max) / 2;
    const nonLongRunSlots = Math.max(1, slots.length - 1);
    const kmLeftForOthers = Math.max(0, targetKm - (longRunTarget?.distanceKm ?? 0));
    const targetEasyMin = kmLeftForOthers > 0
      ? Math.round((kmLeftForOthers / nonLongRunSlots) * easyPaceForSlots)
      : undefined;

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
        // Hard-exclude what this week already used, otherwise the same workout
        // gets picked for several slots of the same week.
        excludeWorkoutIds: weekUsedIds,
        paces,
        elevationGain: config.elevationGain,
        targetLongRunKm: longRunTarget?.distanceKm,
        targetLongRunMin: longRunTarget?.durationMin,
        daysPerWeek: config.daysPerWeek,
        targetEasyMin,
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

    // Bring the week onto the volume model's target by resizing its easy runs.
    // Without this the catalogue's session durations set the weekly volume and
    // the planned progression never reaches the runner.
    //
    // The target is also capped against what the previous load week actually
    // delivered. High targets (130km+ over 6 sessions) exceed what the workout
    // catalogue can produce, and chasing them week by week made the delivered
    // volume swing by up to 50% between neighbouring weeks. Growing from what
    // was really run keeps the progression smooth even when the ceiling binds.
    const rampCeiling = lastLoadWeekKm > 0 && !isRecoveryWeek && phase !== "taper"
      ? Math.round(lastLoadWeekKm * (1 + MAX_WEEKLY_VOLUME_INCREASE))
      : Number.POSITIVE_INFINITY;
    const fitTargetKm = Math.min(targetKm, rampCeiling);

    const easyPace = (paces.E.min + paces.E.max) / 2;
    fitWeeklyVolume(sessions, fitTargetKm, easyPace, (id) =>
      allWorkouts.find((w) => w.id === id)?.typicalDuration,
    );

    // Recompute from the fitted sessions
    weeklyLoadScore = sessions.reduce((sum, s) => sum + (s.loadScore ?? 0), 0);
    const weeklyKmFromSessions = sessions.reduce((sum, s) => {
      if (s.targetDistanceKm && s.targetDistanceKm > 0) return sum + s.targetDistanceKm;
      return sum + (s.estimatedDurationMin / easyPace);
    }, 0);
    const actualKm = Math.round(weeklyKmFromSessions);
    if (!isRecoveryWeek && phase !== "taper") lastLoadWeekKm = actualKm;

    weeks.push({
      weekNumber: weekNum,
      phase,
      isRecoveryWeek,
      volumePercent,
      sessions,
      weekLabel: labels.weekLabel,
      weekLabelEn: labels.weekLabelEn,
      // v2 fields — targetKm reflects the sessions actually scheduled
      targetKm: actualKm,
      targetLongRunKm: longRunTarget?.distanceKm,
      weeklyLoadScore: Math.round(weeklyLoadScore),
    });
  }

  // Step 9b: Apply intermediate race modifications (overlay model)
  if (isRacePlan && config.intermediateGoals?.length) {
    const { applyIntermediateRaces } = await import("./intermediateRaceWeek");
    applyIntermediateRaces(weeks, config, allWorkouts);
  }

  // Recalculate peak metrics from actual week data
  peakWeeklyKm = Math.max(...weeks.map(w => w.targetKm ?? 0));

  // Restate volumePercent against the volume actually programmed. It came from
  // the volume model, whose ceiling the session catalogue cannot always reach:
  // a plan climbing from 38 to 53 km displayed "46% → 100%", telling the runner
  // they had doubled their load when they had added a third.
  if (peakWeeklyKm > 0) {
    for (const week of weeks) {
      week.volumePercent = Math.min(
        100,
        Math.round(((week.targetKm ?? 0) / peakWeeklyKm) * 100),
      );
    }
  }

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
