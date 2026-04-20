/**
 * Cross-discipline substitution — swap a planned running session for an
 * equivalent cycling or swimming workout.
 *
 * Philosophy: substitution is allowed only for aerobic/recovery sessions
 * (easy, endurance, long runs). Quality running work (VMA, seuil, race pace)
 * is never substituted: discipline-specific neuromuscular adaptations can't
 * be transferred to another sport.
 *
 * Matching strategy:
 *   1. Compute the target TSS of the planned session.
 *   2. Pick the target zone for the replacement discipline from the session
 *      type (endurance → Z2 cycling / Z2 swim, recovery → Z1/Z1).
 *   3. From the candidate pool, rank workouts by how close their estimated
 *      TSS matches the target (±10 % is "great", ±20 % is "acceptable").
 *   4. Tie-break on priority score.
 */

import type { Discipline, SessionType, WorkoutTemplate } from "@/types";
import type { PlanSession } from "@/types/plan";
import { getWorkoutDiscipline } from "@/types";
import { crossDisciplineTss, tssMatchRatio } from "./tss";
import { cyclingSessionTypeToZone, type CogganZone } from "./cyclingPaceEngine";
import { swimmingSessionTypeToZone, type SwimZone } from "./swimmingPaceEngine";

// ── Eligibility ────────────────────────────────────────────────────

/** Session types that may legitimately be replaced by cross-training. */
const AEROBIC_SUBSTITUTABLE_TYPES: ReadonlySet<SessionType> = new Set<SessionType>([
  "recovery",
  "endurance",
  "long_run",
  "cross_training",
]);

/**
 * Returns true when the planned running session can be swapped for a
 * cycling or swimming workout without compromising the training goal.
 */
export function isSessionSubstitutable(session: PlanSession): boolean {
  return AEROBIC_SUBSTITUTABLE_TYPES.has(session.sessionType);
}

// ── Candidate ranking ──────────────────────────────────────────────

export interface SubstitutionCandidate {
  workout: WorkoutTemplate;
  /** Estimated TSS of the candidate at its mapped zone. */
  candidateTss: number;
  /** Ratio candidate / target (1.0 = perfect match). */
  matchRatio: number;
  /** Distance from 1.0 — smaller is better. */
  matchDistance: number;
  /** Duration used for the candidate TSS estimate. */
  estimatedDurationMin: number;
}

export interface SubstitutionOptions {
  /**
   * Hard cutoff ratio — candidates whose match ratio falls outside
   * [1 - maxDeviation, 1 + maxDeviation] are discarded. Default 0.20.
   */
  maxDeviation?: number;
  /** Override the duration used to estimate the target TSS (minutes). */
  targetDurationMinOverride?: number;
}

const DEFAULT_MAX_DEVIATION = 0.20;

/** Mid-duration used to estimate a candidate's TSS when no explicit duration fits. */
function pickCandidateDuration(workout: WorkoutTemplate): number {
  const range = workout.typicalDuration;
  return Math.round((range.min + range.max) / 2);
}

/** Resolve the target zone for a candidate based on its own sessionType + discipline. */
function resolveCandidateZone(
  discipline: Discipline,
  sessionType: SessionType,
): number | CogganZone | SwimZone {
  if (discipline === "cycling") return cyclingSessionTypeToZone(sessionType);
  if (discipline === "swimming") return swimmingSessionTypeToZone(sessionType);
  // running fallback — map to a zone index
  switch (sessionType) {
    case "recovery":
      return 1;
    case "endurance":
    case "long_run":
      return 2;
    case "tempo":
      return 3;
    case "threshold":
      return 4;
    case "vo2max":
      return 5;
    case "speed":
      return 6;
    default:
      return 2;
  }
}

/**
 * Estimate a planned session's TSS. We rely on {@link PlanSession.loadScore}
 * when the generator has already scored it (v2 pipeline); otherwise we fall
 * back to a zone-2 running approximation using the planned duration.
 */
export function estimatePlannedSessionTss(session: PlanSession): number {
  if (typeof session.loadScore === "number" && session.loadScore > 0) {
    // loadScore ≈ duration × zone factor (TRIMP). Convert to TSS-equivalent
    // by dividing by 1.3 (Z4 factor → IF 1.0) and multiplying hours × IF² × 100.
    // For practical purposes we use loadScore directly as the target magnitude
    // — TSS and TRIMP are close-enough for matching within ±20 %.
    return Math.round(session.loadScore);
  }

  const duration = session.estimatedDurationMin;
  const zone = resolveCandidateZone(session.discipline ?? "running", session.sessionType);
  const numericZone = typeof zone === "number" ? zone : 2;
  return crossDisciplineTss({
    discipline: session.discipline ?? "running",
    durationMin: duration,
    zone: numericZone,
  });
}

/**
 * Rank candidate workouts of a target discipline by how well their estimated
 * TSS matches the planned session's TSS.
 */
export function rankSubstitutionCandidates(args: {
  plannedSession: PlanSession;
  targetDiscipline: Discipline;
  candidates: WorkoutTemplate[];
  options?: SubstitutionOptions;
}): SubstitutionCandidate[] {
  const { plannedSession, targetDiscipline, candidates, options } = args;
  const maxDeviation = options?.maxDeviation ?? DEFAULT_MAX_DEVIATION;
  const targetTss = estimatePlannedSessionTss(plannedSession);
  if (targetTss <= 0) return [];

  const ranked: SubstitutionCandidate[] = [];

  for (const workout of candidates) {
    if (getWorkoutDiscipline(workout) !== targetDiscipline) continue;
    const duration = options?.targetDurationMinOverride ?? pickCandidateDuration(workout);
    const zone = resolveCandidateZone(targetDiscipline, workout.sessionType);
    const candidateTss = crossDisciplineTss({
      discipline: targetDiscipline,
      durationMin: duration,
      zone,
    });
    const ratio = tssMatchRatio(candidateTss, targetTss);
    if (ratio <= 0) continue;
    if (ratio < 1 - maxDeviation || ratio > 1 + maxDeviation) continue;

    ranked.push({
      workout,
      candidateTss,
      matchRatio: ratio,
      matchDistance: Math.abs(ratio - 1),
      estimatedDurationMin: duration,
    });
  }

  // Sort: best TSS match first, then highest priorityScore as tiebreaker.
  ranked.sort((a, b) => {
    if (a.matchDistance !== b.matchDistance) {
      return a.matchDistance - b.matchDistance;
    }
    return (
      (b.workout.selectionCriteria.priorityScore ?? 0) -
      (a.workout.selectionCriteria.priorityScore ?? 0)
    );
  });

  return ranked;
}

/**
 * High-level helper: given a planned session and a pool of workouts, return
 * the best substitution candidate for the target discipline, or null when
 * the session is not substitutable or no candidate lies within tolerance.
 */
export function findEquivalentWorkout(args: {
  plannedSession: PlanSession;
  targetDiscipline: Discipline;
  candidates: WorkoutTemplate[];
  options?: SubstitutionOptions;
}): SubstitutionCandidate | null {
  if (!isSessionSubstitutable(args.plannedSession)) return null;
  const ranked = rankSubstitutionCandidates(args);
  return ranked[0] ?? null;
}
