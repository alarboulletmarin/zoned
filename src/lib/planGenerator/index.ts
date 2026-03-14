import type { TrainingPlan, PlanConfig, PlanWeek, PlanSession, RaceDistance } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { loadAllWorkouts } from "@/data/workouts";
import { calculateRaceTimes } from "@/lib/paceCalculator";
import { calculatePhases, getPhaseForWeek } from "./phases";
import { calculateVolumeProgression } from "./volume";
import { buildWeekTemplate } from "./weekTemplate";
import { selectWorkout } from "./selector";
import { generateRaceWeek } from "./raceWeek";
import { MIN_PLAN_WEEKS, MAX_PLAN_WEEKS } from "./constants";

// ── Helpers ────────────────────────────────────────────────────────

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
 * Generate a race time prediction string from VMA.
 */
function predictRaceTime(
  vma: number,
  raceDistance: RaceDistance
): string | undefined {
  if (!vma || vma <= 0) return undefined;

  // No reliable time prediction for trail races (too terrain-dependent)
  if (raceDistance === "trail_short" || raceDistance === "trail" || raceDistance === "ultra") {
    return undefined;
  }

  const estimates = calculateRaceTimes(vma);
  // Map our RaceDistance to paceCalculator distance labels
  const distanceMap: Record<string, string> = {
    "5K": "5K",
    "10K": "10K",
    semi: "Semi",
    marathon: "Marathon",
  };

  const match = estimates.find(
    (e) => e.distance === distanceMap[raceDistance]
  );
  return match?.estimatedTime;
}

/**
 * Generate plan name from config.
 */
function generatePlanName(config: PlanConfig): { name: string; nameEn: string } {
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
 * Algorithm:
 * 1. Calculate total weeks from today to race date
 * 2. Validate: 8 <= totalWeeks <= 24
 * 3. Calculate phases
 * 4. Calculate volume progression
 * 5. Load all workouts
 * 6. For each week: build template, select workouts
 * 7. Race time prediction if VMA available
 * 8. Return complete TrainingPlan
 */
export async function generatePlan(config: PlanConfig): Promise<TrainingPlan> {
  // Step 1: Calculate total weeks
  const totalWeeks = calculateTotalWeeks(config.raceDate);

  // Step 2: Validate
  if (totalWeeks < MIN_PLAN_WEEKS) {
    throw new Error(
      `Le plan nécessite au moins ${MIN_PLAN_WEEKS} semaines. Date de course trop proche (${totalWeeks} semaines).`
    );
  }
  if (totalWeeks > MAX_PLAN_WEEKS) {
    throw new Error(
      `Le plan est limité à ${MAX_PLAN_WEEKS} semaines. Date de course trop éloignée (${totalWeeks} semaines).`
    );
  }

  // Step 3: Calculate phases
  const phases = calculatePhases(totalWeeks, config.raceDistance);

  // Step 4: Calculate volume progression
  const volumeProgression = calculateVolumeProgression(
    totalWeeks,
    phases,
    config.raceDistance
  );

  // Step 5: Load all workouts
  const allWorkouts = await loadAllWorkouts();

  // Step 6: Build weeks
  const weeks: PlanWeek[] = [];
  // Track used workout IDs for variety (rolling window of 3 weeks)
  const usedWorkoutIds: string[] = [];

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const phase = getPhaseForWeek(weekNum, phases);
    const volumeInfo = volumeProgression.find(
      (v) => v.weekNumber === weekNum
    );
    const volumePercent = volumeInfo?.volumePercent ?? 0.8;
    const isRecoveryWeek = volumeInfo?.isRecoveryWeek ?? false;

    // Race week (last week)
    if (weekNum === totalWeeks) {
      const raceWeek = generateRaceWeek(
        weekNum,
        config.raceDistance,
        config.daysPerWeek,
        config.longRunDay,
        config.runnerLevel,
        allWorkouts
      );
      weeks.push(raceWeek);
      continue;
    }

    // Build week template
    const slots = buildWeekTemplate(
      config.daysPerWeek,
      config.longRunDay,
      phase,
      isRecoveryWeek
    );

    // Select workouts for each slot
    const sessions: PlanSession[] = [];
    const weekUsedIds: string[] = [];

    for (const slot of slots) {
      const selection = selectWorkout(
        slot,
        phase,
        config.runnerLevel,
        config.raceDistance,
        allWorkouts,
        usedWorkoutIds,
        volumePercent,
        config.elevationGain,
      );

      if (selection) {
        const session: PlanSession = {
          dayOfWeek: slot.dayOfWeek,
          workoutId: selection.workoutId,
          sessionType: slot.sessionTypes[0],
          isKeySession: slot.slotType === "key_quality",
          estimatedDurationMin: selection.estimatedDurationMin,
        };

        // Add pace-based notes if target pace is defined
        if (config.targetPaceMinKm) {
          const paceMin = Math.floor(config.targetPaceMinKm);
          const paceSec = Math.round((config.targetPaceMinKm - paceMin) * 60);
          const paceStr = `${paceMin}:${paceSec.toString().padStart(2, "0")}`;

          // Easy pace is roughly target + 1:00/km
          const easyPaceMin = Math.floor(config.targetPaceMinKm + 1);
          const easyPaceSec = Math.round(((config.targetPaceMinKm + 1) - easyPaceMin) * 60);
          const easyPaceStr = `${easyPaceMin}:${easyPaceSec.toString().padStart(2, "0")}`;

          const st = slot.sessionTypes[0];
          if (st === "tempo" || st === "threshold" || st === "race_specific") {
            session.notes = `Allure cible : ${paceStr}/km`;
            session.notesEn = `Target pace: ${paceStr}/km`;
          } else if (st === "long_run") {
            session.notes = `Allure endurance : ~${easyPaceStr}/km`;
            session.notesEn = `Easy pace: ~${easyPaceStr}/km`;
          } else if (st === "vo2max" || st === "speed") {
            // VO2max pace is roughly target - 0:30/km
            const vmaPace = config.targetPaceMinKm - 0.5;
            const vmaPaceMin = Math.floor(vmaPace);
            const vmaPaceSec = Math.round((vmaPace - vmaPaceMin) * 60);
            const vmaPaceStr = `${vmaPaceMin}:${vmaPaceSec.toString().padStart(2, "0")}`;
            session.notes = `Allure VMA : ~${vmaPaceStr}/km`;
            session.notesEn = `VO2max pace: ~${vmaPaceStr}/km`;
          }
        }

        // Add elevation note if present
        if (config.elevationGain && config.elevationGain > 0 && slot.sessionTypes[0] === "long_run") {
          const elevNote = `Course avec ${config.elevationGain}m D+ — intégrez du dénivelé`;
          const elevNoteEn = `Race has ${config.elevationGain}m elevation — include hills`;
          session.notes = session.notes ? `${session.notes}\n${elevNote}` : elevNote;
          session.notesEn = session.notesEn ? `${session.notesEn}\n${elevNoteEn}` : elevNoteEn;
        }

        sessions.push(session);
        weekUsedIds.push(selection.workoutId);
      }
    }

    // Update rolling used IDs (keep last 3 weeks worth)
    usedWorkoutIds.push(...weekUsedIds);
    const maxHistory = config.daysPerWeek * 3;
    while (usedWorkoutIds.length > maxHistory) {
      usedWorkoutIds.shift();
    }

    const labels = getWeekLabel(weekNum, totalWeeks, phase, isRecoveryWeek);

    weeks.push({
      weekNumber: weekNum,
      phase,
      isRecoveryWeek,
      volumePercent,
      sessions,
      weekLabel: labels.weekLabel,
      weekLabelEn: labels.weekLabelEn,
    });
  }

  // Step 7: Race time prediction
  const raceTimePrediction = config.vma
    ? predictRaceTime(config.vma, config.raceDistance)
    : undefined;

  // Step 8: Generate plan name
  const { name, nameEn } = generatePlanName(config);

  // Step 9: Return complete plan
  return {
    id: crypto.randomUUID(),
    config,
    weeks,
    totalWeeks,
    phases,
    raceTimePrediction,
    name,
    nameEn,
  };
}

// Re-export sub-modules for direct access
export { calculatePhases, getPhaseForWeek } from "./phases";
export { calculateVolumeProgression } from "./volume";
export { buildWeekTemplate } from "./weekTemplate";
export type { WeekSlot, SlotType } from "./weekTemplate";
export { selectWorkout } from "./selector";
export { generateRaceWeek } from "./raceWeek";
