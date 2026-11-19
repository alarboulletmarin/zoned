import type { TrainingPlan, PlanSession, PlanWeek } from "@/types/plan";
import {
  getWorkoutDiscipline,
  isStrengthWorkout,
  type AnyWorkoutTemplate,
  type Discipline,
  type TrainingPhase,
  type WorkoutTemplate,
} from "@/types";
import { getWorkoutById } from "@/data/workouts";
import { flattenWorkoutSegments } from "@/lib/workoutStructure";

// ── Helpers for identifying non-running sessions ──────────────────
const NON_RUNNING_SESSION_TYPES = new Set([
  "strength", "cycling", "swimming", "yoga", "rest", "rest_day", "cross_training",
]);

function isNonRunningSession(session: PlanSession): boolean {
  if (session.discipline && session.discipline !== "running") return true;
  return (
    NON_RUNNING_SESSION_TYPES.has(session.sessionType) ||
    session.workoutId.startsWith("STR-") ||
    session.workoutId.startsWith("CYC-") ||
    session.workoutId.startsWith("SWM-") ||
    session.workoutId.startsWith("__activity_")
  );
}

/**
 * Le sport d'une séance, `other` pour ce qui n'en est pas un (renforcement,
 * yoga, repos).
 *
 * L'union rendue est exactement `ActivityDiscipline`, écrite ici sans importer
 * le module des activités : ce fichier est celui des plans, et la dépendance
 * va déjà dans l'autre sens. Les deux vocabulaires se rencontrent dans
 * `weekReview.ts`, qui est le seul endroit à avoir besoin des deux.
 *
 * Les signaux sont ceux d'`isNonRunningSession`, et c'est délibéré : deux
 * tables de détection pour le même fait auraient divergé au premier
 * identifiant ajouté.
 */
export function sessionDiscipline(session: PlanSession): Discipline | "other" {
  if (session.discipline) return session.discipline;
  if (session.sessionType === "cycling" || session.workoutId.startsWith("CYC-")) {
    return "cycling";
  }
  if (session.sessionType === "swimming" || session.workoutId.startsWith("SWM-")) {
    return "swimming";
  }
  if (isNonRunningSession(session)) return "other";
  return "running";
}

/**
 * Les km d'une séance DANS SON PROPRE SPORT, ce que `estimateSessionKm` ne
 * rend pas et n'a pas à rendre.
 *
 * `estimateSessionKm` répond au total de km de COURSE du plan, donc elle rend
 * zéro dès que la séance n'est pas de la course, ce qui est la bonne réponse à
 * sa question et la mauvaise à celle-ci : une sortie vélo du plan a des
 * kilomètres, ils ne se rangent simplement pas dans le même total.
 *
 * Aucune estimation hors course : la table d'allures de ce fichier est une
 * table d'allures de COURSE, l'appliquer à du vélo inventerait un chiffre. Un
 * kilométrage non saisi vaut donc zéro, c'est-à-dire pas de kilomètre à
 * montrer, et non un kilométrage deviné.
 */
export function sessionDisciplineKm(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  if (session.status === "skipped") return 0;
  const discipline = sessionDiscipline(session);
  if (discipline === "running") return estimateSessionKm(session);
  if (discipline === "other") return 0;
  return session.actualDistanceKm ?? session.targetDistanceKm ?? 0;
}

function isRunningWorkoutTemplate(w: AnyWorkoutTemplate): w is WorkoutTemplate {
  if (isStrengthWorkout(w)) return false;
  return getWorkoutDiscipline(w) === "running";
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

/**
 * Les km d'une séance TELLE QU'ELLE ÉTAIT PRÉVUE, sans regarder ce qui a été
 * fait. C'est le terme de gauche du bilan de semaine, tu visais tant : le
 * comparer à un réalisé qui contient déjà le réalisé ne comparerait rien.
 */
export function plannedSessionKm(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  if (session.workoutId === "__intermediate_race__") return session.targetDistanceKm ?? 0;
  if (isNonRunningSession(session)) return 0;
  if (session.targetDistanceKm && session.targetDistanceKm > 0) return session.targetDistanceKm;
  const pace = PACE_BY_TYPE[session.sessionType] || 5.5;
  return session.estimatedDurationMin / pace;
}

/** Estimate distance in km for a session based on duration and type */
export function estimateSessionKm(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  // Intermediate races have explicit distance
  if (session.workoutId === "__intermediate_race__") return session.targetDistanceKm ?? 0;
  // Non-running sessions (strength, cycling, etc.) don't contribute running km
  if (isNonRunningSession(session)) return 0;
  // Explicitly skipped sessions didn't happen, don't count them
  if (session.status === "skipped") return 0;
  if (session.actualDistanceKm && session.actualDistanceKm > 0) return session.actualDistanceKm;
  if (session.targetDistanceKm && session.targetDistanceKm > 0) return session.targetDistanceKm;
  const pace = PACE_BY_TYPE[session.sessionType] || 5.5;
  return session.estimatedDurationMin / pace;
}

/**
 * Estimate duration in minutes for a session, favoring the actual value when present.
 * - `skipped` sessions contribute 0.
 * - `modified` / `completed` sessions with `actualDurationMin` use that value.
 * - Otherwise the planned `estimatedDurationMin` is used.
 */
export function estimateSessionDurationMin(session: PlanSession): number {
  if (session.workoutId === "__race_day__") return 0;
  // Intermediate races have estimated duration based on distance + runner level
  if (session.workoutId === "__intermediate_race__") return session.estimatedDurationMin;
  if (session.status === "skipped") return 0;
  if (session.actualDurationMin && session.actualDurationMin > 0) return session.actualDurationMin;
  return session.estimatedDurationMin;
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

/** Compute total duration in minutes for a week, using actual data when available */
export function computeWeekDuration(week: PlanWeek): number {
  return week.sessions.reduce((sum, s) => sum + estimateSessionDurationMin(s), 0);
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
      const sessionDuration = estimateSessionDurationMin(session);
      totalDurationMin += sessionDuration;
      if (sessionDuration > longestSessionMin) {
        longestSessionMin = sessionDuration;
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

/** Ajoute des minutes à une zone écrite comme dans le catalogue, plage comprise. */
function addZoneMinutes(zoneMinutes: Record<string, number>, zone: string | null | undefined, minutes: number): void {
  if (!zone) {
    // Sans zone, un bloc du corps de séance compte en Z2.
    zoneMinutes["Z2"] = (zoneMinutes["Z2"] || 0) + minutes;
  } else if (zone.includes("-")) {
    // Une plage comme "Z1-Z2" se partage à parts égales entre ses bornes.
    const parts = zone.split("-");
    const perPart = minutes / parts.length;
    for (const part of parts) {
      const z = part.startsWith("Z") ? part : `Z${part}`;
      zoneMinutes[z] = (zoneMinutes[z] || 0) + perPart;
    }
  } else {
    zoneMinutes[zone] = (zoneMinutes[zone] || 0) + minutes;
  }
}

/**
 * Les minutes d'UNE séance, bloc par bloc, ajoutées zone par zone à
 * `zoneMinutes`. Sert à la répartition par zone du plan
 * (`computeEnhancedPlanAnalysis`) et aux anneaux de la semaine
 * (`lib/weekRings.ts`).
 *
 * Les durées sont celles du moteur de structure (`flattenWorkoutSegments`),
 * le même qui donne leur durée aux séances partout ailleurs. La version
 * d'avant lisait `durationMin` sur chaque bloc sans le multiplier par ses
 * répétitions : `3 × 8 min Z4` pesait 8 minutes, et la mise à l'échelle
 * rendait le reste à l'échauffement. Un seuil de 55 minutes donnait 12
 * minutes de Z4 au lieu de 24. Le moteur déroule les répétitions et les
 * séries, et compte les récupérations entre elles dans leur propre zone.
 *
 * Les conventions, elles, n'ont pas bougé :
 *
 * - les minutes sont mises à l'échelle de la durée de la séance ;
 * - l'échauffement se partage moitié Z1, moitié Z2 ;
 * - un segment du corps de séance va dans sa zone, une plage (`Z3-Z4`) se
 *   partage à parts égales entre ses bornes, un segment sans zone va en Z2 ;
 * - le retour au calme va en Z1.
 *
 * Les clés sont les codes tels qu'écrits dans le catalogue (`Z4`, `Z5+`).
 */
export function addSessionZoneMinutes(
  workout: WorkoutTemplate,
  sessionTotal: number,
  zoneMinutes: Record<string, number>,
): void {
  let warmupRaw = 0;
  let cooldownRaw = 0;
  const main: { minutes: number; zone: string | null }[] = [];
  for (const segment of flattenWorkoutSegments(workout)) {
    const minutes = segment.durationSec / 60;
    if (segment.phase === "warmup") warmupRaw += minutes;
    else if (segment.phase === "cooldown") cooldownRaw += minutes;
    else main.push({ minutes, zone: segment.zone });
  }
  const mainRaw = main.reduce((sum, segment) => sum + segment.minutes, 0);

  const totalRaw = warmupRaw + mainRaw + cooldownRaw;
  // Les minutes de la structure, ramenées à la durée de la séance.
  const scale = totalRaw > 0 ? sessionTotal / totalRaw : 1;

  // Échauffement : moitié Z1, moitié Z2.
  const warmupMin = warmupRaw * scale;
  zoneMinutes["Z1"] = (zoneMinutes["Z1"] || 0) + warmupMin / 2;
  zoneMinutes["Z2"] = (zoneMinutes["Z2"] || 0) + warmupMin / 2;

  // Corps de séance : chaque segment dans sa zone, récupérations comprises.
  for (const segment of main) {
    addZoneMinutes(zoneMinutes, segment.zone, segment.minutes * scale);
  }

  // Retour au calme : Z1.
  zoneMinutes["Z1"] = (zoneMinutes["Z1"] || 0) + cooldownRaw * scale;
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
      if (session.workoutId !== "__race_day__" && session.workoutId !== "__intermediate_race__" && !isNonRunningSession(session)) {
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
      if (session.workoutId === "__race_day__" || session.workoutId === "__intermediate_race__") continue;
      // Skip non-running sessions (strength, cross-training, etc.)
      if (isNonRunningSession(session)) continue;

      const workout = workoutMap.get(session.workoutId);
      if (!workout) continue;

      // Safety guard: skip if this workout lacks running block arrays
      if (!workout.warmupTemplate || !workout.mainSetTemplate || !workout.cooldownTemplate) continue;

      addSessionZoneMinutes(workout, session.estimatedDurationMin, zoneMinutes);
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
      if (session.workoutId === "__race_day__" || session.workoutId === "__intermediate_race__") continue;
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
