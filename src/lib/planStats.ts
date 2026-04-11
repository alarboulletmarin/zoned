import type { TrainingPlan, PlanSession, PlanWeek } from "@/types/plan";
import type { TrainingPhase, WorkoutTemplate } from "@/types";
import { getWorkoutById } from "@/data/workouts";

// ── Helpers for identifying non-running sessions ──────────────────
const NON_RUNNING_SESSION_TYPES = new Set([
  "strength", "cycling", "swimming", "yoga", "rest", "rest_day", "cross_training",
]);

function isNonRunningSession(session: PlanSession): boolean {
  return (
    NON_RUNNING_SESSION_TYPES.has(session.sessionType) ||
    session.workoutId.startsWith("STR-") ||
    session.workoutId.startsWith("__activity_")
  );
}

function isRunningWorkoutTemplate(w: WorkoutTemplate): boolean {
  // StrengthWorkoutTemplate cast as WorkoutTemplate will have kind === "strength"
  // and will lack warmupTemplate / mainSetTemplate / cooldownTemplate
  return (w as unknown as { kind?: string }).kind !== "strength";
}

export interface PlanStats {
  totalSessions: number;
  totalDurationMin: number;
  avgDurationPerWeekMin: number;
  keySessionCount: number;
  sessionsByType: Record<string, number>;
  totalEstimatedKm: number;
  peakVolumeWeek: number;
  peakVolumeMin: number;
  longestSessionMin: number;
  recoveryWeekCount: number;
  weeklyVolumes: {
    weekNumber: number;
    durationMin: number;
    phase: TrainingPhase;
    isRecovery: boolean;
  }[];
}

/**
 * Estimated average pace (min/km) by session type.
 * Used to compute rough weekly distance.
 */
const PACE_BY_TYPE: Record<string, number> = {
  recovery: 6.5,
  endurance: 5.75,
  long_run: 5.75,
  tempo: 4.75,
  threshold: 4.5,
  vo2max: 4.0,
  speed: 3.75,
  hills: 5.5,
  fartlek: 5.0,
  race_specific: 4.75,
};

/** Estimate distance in km for a session based on duration and type */
function estimateSessionKm(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  // Non-running sessions (strength, cycling, etc.) don't contribute running km
  if (isNonRunningSession(session)) return 0;
  if (session.actualDistanceKm && session.actualDistanceKm > 0) return session.actualDistanceKm;
  if (session.targetDistanceKm && session.targetDistanceKm > 0) return session.targetDistanceKm;
  const pace = PACE_BY_TYPE[session.sessionType] || 5.5;
  return session.estimatedDurationMin / pace;
}

/** Compute total estimated km for a week */
export function computeWeekKm(week: PlanWeek): number {
  const hasSessionDistanceData = week.sessions.some((session) =>
    (session.actualDistanceKm && session.actualDistanceKm > 0)
    || (session.targetDistanceKm && session.targetDistanceKm > 0)
  );

  if (!hasSessionDistanceData && week.targetKm && week.targetKm > 0) {
    return week.targetKm;
  }

  return week.sessions.reduce((sum, s) => sum + estimateSessionKm(s), 0);
}

/** Compute total duration in minutes for a week */
export function computeWeekDuration(week: PlanWeek): number {
  return week.sessions.reduce((sum, s) => s.workoutId === "__race_day__" ? sum : sum + s.estimatedDurationMin, 0);
}

export function computePlanStats(plan: TrainingPlan): PlanStats {
  let totalSessions = 0;
  let totalDurationMin = 0;
  let keySessionCount = 0;
  let totalEstimatedKm = 0;
  let longestSessionMin = 0;
  let recoveryWeekCount = 0;
  let peakVolumeWeek = 0;
  let peakVolumeMin = 0;
  const sessionsByType: Record<string, number> = {};
  const weeklyVolumes: PlanStats["weeklyVolumes"] = [];

  for (const week of plan.weeks) {
    const weekDuration = computeWeekDuration(week);
    const weekKm = computeWeekKm(week);

    weeklyVolumes.push({
      weekNumber: week.weekNumber,
      durationMin: weekDuration,
      phase: week.phase,
      isRecovery: week.isRecoveryWeek,
    });

    if (weekDuration > peakVolumeMin) {
      peakVolumeMin = weekDuration;
      peakVolumeWeek = week.weekNumber;
    }

    if (week.isRecoveryWeek) recoveryWeekCount++;

    totalEstimatedKm += weekKm;

    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__") continue;
      totalSessions++;
      totalDurationMin += session.estimatedDurationMin;
      if (session.estimatedDurationMin > longestSessionMin) {
        longestSessionMin = session.estimatedDurationMin;
      }
      if (session.isKeySession) keySessionCount++;
      sessionsByType[session.sessionType] = (sessionsByType[session.sessionType] || 0) + 1;
    }
  }

  return {
    totalSessions,
    totalDurationMin,
    avgDurationPerWeekMin: plan.totalWeeks > 0 ? Math.round(totalDurationMin / plan.totalWeeks) : 0,
    keySessionCount,
    sessionsByType,
    totalEstimatedKm,
    peakVolumeWeek,
    peakVolumeMin,
    longestSessionMin,
    recoveryWeekCount,
    weeklyVolumes,
  };
}

// ── Enhanced plan analysis (async, workout-level) ───────────────────

export interface ZoneDistribution {
  zone: string;
  minutes: number;
  percent: number;
}

export interface TargetSystemBreakdown {
  system: string;
  count: number;
  percent: number;
}

export interface EnhancedPlanAnalysis {
  zoneDistribution: ZoneDistribution[];
  targetSystemBreakdown: TargetSystemBreakdown[];
}

/** Default rep duration in minutes when only repetitions are specified */
const DEFAULT_REP_MIN = 1;

/**
 * Estimate the time in minutes for a single workout block.
 */
function estimateBlockMinutes(block: { durationMin?: number; repetitions?: number }): number {
  if (block.durationMin && block.durationMin > 0) return block.durationMin;
  if (block.repetitions && block.repetitions > 0) return block.repetitions * DEFAULT_REP_MIN;
  return 0;
}

/**
 * Compute zone-level and target-system-level analysis for a training plan.
 *
 * Loads each unique workout template to inspect block zones and target systems.
 */
export async function computeEnhancedPlanAnalysis(plan: TrainingPlan): Promise<EnhancedPlanAnalysis> {
  // ── 1. Collect unique running workout IDs and load templates ─────
  const workoutIds = new Set<string>();
  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId !== "__race_day__" && !isNonRunningSession(session)) {
        workoutIds.add(session.workoutId);
      }
    }
  }

  const workoutMap = new Map<string, WorkoutTemplate>();
  await Promise.all(
    Array.from(workoutIds).map(async (id) => {
      const w = await getWorkoutById(id);
      if (w && isRunningWorkoutTemplate(w)) workoutMap.set(id, w);
    }),
  );

  // ── 2. Zone distribution ─────────────────────────────────────────
  const zoneMinutes: Record<string, number> = {};

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__") continue;
      // Skip non-running sessions (strength, cross-training, etc.)
      if (isNonRunningSession(session)) continue;

      const workout = workoutMap.get(session.workoutId);
      if (!workout) continue;

      // Safety guard: skip if this workout lacks running block arrays
      if (!workout.warmupTemplate || !workout.mainSetTemplate || !workout.cooldownTemplate) continue;

      const sessionTotal = session.estimatedDurationMin;

      // Compute raw block durations for warmup, main, cooldown
      let warmupRaw = 0;
      for (const block of workout.warmupTemplate) {
        warmupRaw += estimateBlockMinutes(block);
      }

      let mainRaw = 0;
      for (const block of workout.mainSetTemplate) {
        mainRaw += estimateBlockMinutes(block);
      }

      let cooldownRaw = 0;
      for (const block of workout.cooldownTemplate) {
        cooldownRaw += estimateBlockMinutes(block);
      }

      const totalRaw = warmupRaw + mainRaw + cooldownRaw;
      // Scale factor so block durations sum to session estimated duration
      const scale = totalRaw > 0 ? sessionTotal / totalRaw : 1;

      // Warmup: split evenly between Z1 and Z2
      const warmupMin = warmupRaw * scale;
      zoneMinutes["Z1"] = (zoneMinutes["Z1"] || 0) + warmupMin / 2;
      zoneMinutes["Z2"] = (zoneMinutes["Z2"] || 0) + warmupMin / 2;

      // Main set: distribute by block zone
      for (const block of workout.mainSetTemplate) {
        const blockMin = estimateBlockMinutes(block) * scale;
        if (!block.zone) {
          // No zone specified — default to Z2
          zoneMinutes["Z2"] = (zoneMinutes["Z2"] || 0) + blockMin;
        } else if (block.zone.includes("-")) {
          // Range like "Z1-Z2": split evenly
          const parts = block.zone.split("-");
          const perPart = blockMin / parts.length;
          for (const part of parts) {
            const z = part.startsWith("Z") ? part : `Z${part}`;
            zoneMinutes[z] = (zoneMinutes[z] || 0) + perPart;
          }
        } else {
          zoneMinutes[block.zone] = (zoneMinutes[block.zone] || 0) + blockMin;
        }
      }

      // Cooldown: assign to Z1
      const cooldownMin = cooldownRaw * scale;
      zoneMinutes["Z1"] = (zoneMinutes["Z1"] || 0) + cooldownMin;
    }
  }

  const totalZoneMinutes = Object.values(zoneMinutes).reduce((a, b) => a + b, 0);
  const allZones = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"];
  const zoneDistribution: ZoneDistribution[] = allZones.map((zone) => {
    const minutes = Math.round((zoneMinutes[zone] || 0) * 10) / 10;
    return {
      zone,
      minutes,
      percent: totalZoneMinutes > 0 ? Math.round((minutes / totalZoneMinutes) * 1000) / 10 : 0,
    };
  });

  // ── 3. Target system breakdown ───────────────────────────────────
  const systemCounts: Record<string, number> = {};
  let totalSessionsWithSystem = 0;

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId === "__race_day__") continue;
      if (isNonRunningSession(session)) continue;
      const workout = workoutMap.get(session.workoutId);
      if (!workout || !workout.targetSystem) continue;
      systemCounts[workout.targetSystem] = (systemCounts[workout.targetSystem] || 0) + 1;
      totalSessionsWithSystem++;
    }
  }

  const targetSystemBreakdown: TargetSystemBreakdown[] = Object.entries(systemCounts)
    .map(([system, count]) => ({
      system,
      count,
      percent: totalSessionsWithSystem > 0 ? Math.round((count / totalSessionsWithSystem) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { zoneDistribution, targetSystemBreakdown };
}
