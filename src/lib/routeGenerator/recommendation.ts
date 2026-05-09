import { calculateTrainingPaces, estimateDistanceForDuration, sessionTypeToIntensity } from "@/lib/planGenerator/paceEngine";
import type { PoiBoost } from "@/lib/routeGenerator";
import type { PlanSession, PlanWeek } from "@/types/plan";
import type { RunnerProfile } from "@/types/runner-profile";
import { getWorkoutDiscipline } from "@/types";
import type { Difficulty, Discipline, SessionType, WorkoutTemplate } from "@/types";
import type { Route, RouteShape, RouteSurface } from "@/types/route";
import {
  clamp01,
  computeTurnDensityPerKm,
  pickExtreme,
  roundHalf,
} from "./recommendation/math";
import {
  athleteFitScore,
  estimatePredictedDurationSec,
  scoreWeightsForIntent,
  terrainScoreForIntent,
} from "./recommendation/scoring-helpers";

type SupportedRouteShape = Extract<RouteShape, "loop" | "out_and_back">;

export interface RouteAthleteProfile {
  vma?: number;
  runnerLevel?: Difficulty;
  currentWeeklyKm?: number;
  currentLongRunKm?: number;
}

export interface RouteIntent {
  source: "plan" | "workout" | "manual";
  discipline: Discipline;
  sessionType?: SessionType;
  targetDistanceKm: number;
  targetDurationMin?: number;
  elevationGainTargetM?: number;
  shapePreference: SupportedRouteShape;
  terrainPreference: "flat" | "rolling" | "climbing";
  continuityPriority: "low" | "medium" | "high";
  repeatabilityPriority: "low" | "medium" | "high";
}

export interface TrainingRoutePreset {
  intent: RouteIntent;
  athlete: RouteAthleteProfile | null;
  planSessionRef?: Route["planSessionRef"];
  formDefaults: {
    discipline: Discipline;
    shape: SupportedRouteShape;
    surface: RouteSurface;
    targetDistanceKm: number;
    elevationGainTargetM?: number;
  };
}

export type RouteRecommendationReason =
  | "closest_to_target_distance"
  | "matches_elevation_target"
  | "matches_target_duration"
  | "keeps_climbing_low"
  | "adds_useful_climbing"
  | "supports_steady_pacing"
  | "stays_repeatable_for_repeats"
  | "respects_current_long_run"
  | "uses_athletics_track";

export type RouteRecommendationAccent =
  | "best_fit"
  | "closest_to_target"
  | "gentlest_option"
  | "best_for_steady_pacing"
  | "best_for_hills";

export interface RankedRouteCandidate {
  route: Route;
  score: number;
  accent: RouteRecommendationAccent;
  reasons: RouteRecommendationReason[];
  predictedDurationSec: number;
  metrics: {
    distanceKm: number;
    distanceErrorRatio: number;
    durationErrorRatio: number;
    elevationErrorRatio: number;
    climbPerKm: number;
    turnDensityPerKm: number;
    continuityScore: number;
  };
}

export function buildTrainingRoutePreset(args: {
  session: PlanSession;
  runnerProfile?: RunnerProfile | null;
  planSessionRef?: Route["planSessionRef"];
}): TrainingRoutePreset {
  const discipline = resolveSessionDiscipline(args.session);
  const athlete = buildAthleteProfile(args.runnerProfile);
  const shapePreference = defaultShapeForSessionType(args.session.sessionType);
  const targetDistanceKm = resolveTargetDistanceKm(args.session, athlete, discipline);
  const elevationGainTargetM = defaultElevationTargetM(targetDistanceKm, discipline, args.session.sessionType);

  return {
    intent: {
      source: "plan",
      discipline,
      sessionType: args.session.sessionType,
      targetDistanceKm,
      targetDurationMin: args.session.targetDurationMin ?? args.session.estimatedDurationMin,
      elevationGainTargetM,
      shapePreference,
      terrainPreference: terrainPreferenceForSessionType(args.session.sessionType),
      continuityPriority: continuityPriorityForSessionType(args.session.sessionType),
      repeatabilityPriority: repeatabilityPriorityForSessionType(args.session.sessionType),
    },
    athlete,
    planSessionRef: args.planSessionRef,
    formDefaults: {
      discipline,
      shape: shapePreference,
      surface: defaultSurfaceForSession(discipline, args.session.sessionType),
      targetDistanceKm,
      elevationGainTargetM,
    },
  };
}

export function buildManualRouteIntent(args: {
  discipline: Discipline;
  shape: SupportedRouteShape;
  targetDistanceKm: number;
  surface: RouteSurface;
  elevationGainTargetM?: number;
}): RouteIntent {
  return {
    source: "manual",
    discipline: args.discipline,
    targetDistanceKm: roundHalf(args.targetDistanceKm),
    elevationGainTargetM: args.elevationGainTargetM,
    shapePreference: args.shape,
    terrainPreference: terrainPreferenceForManualRequest(args.surface, args.elevationGainTargetM),
    continuityPriority: args.shape === "out_and_back" ? "high" : "medium",
    repeatabilityPriority: args.shape === "out_and_back" ? "medium" : "low",
  };
}

export function buildWorkoutRoutePreset(args: {
  workout: WorkoutTemplate;
  runnerProfile?: RunnerProfile | null;
}): TrainingRoutePreset {
  const discipline = getWorkoutDiscipline(args.workout);
  const durationMin = Math.round((args.workout.typicalDuration.min + args.workout.typicalDuration.max) / 2);
  const athlete = buildAthleteProfile(args.runnerProfile) ?? { runnerLevel: args.workout.difficulty };
  const targetDistanceKm = args.workout.estimatedDistanceKm
    ? roundHalf((args.workout.estimatedDistanceKm.min + args.workout.estimatedDistanceKm.max) / 2)
    : resolveTargetDistanceKm(
        {
          dayOfWeek: 0,
          workoutId: args.workout.id,
          discipline,
          sessionType: args.workout.sessionType,
          isKeySession: isWorkoutQualitySession(args.workout.sessionType),
          estimatedDurationMin: durationMin,
          targetDurationMin: durationMin,
        },
        athlete,
        discipline,
      );
  const elevationGainTargetM = args.workout.environment.requiresHills
    ? defaultElevationTargetM(targetDistanceKm, discipline, args.workout.sessionType)
    : undefined;
  const shapePreference = args.workout.environment.requiresHills
    ? "out_and_back"
    : defaultShapeForSessionType(args.workout.sessionType);

  return {
    intent: {
      source: "workout",
      discipline,
      sessionType: args.workout.sessionType,
      targetDistanceKm,
      targetDurationMin: durationMin,
      elevationGainTargetM,
      shapePreference,
      terrainPreference: args.workout.environment.prefersFlat
        ? "flat"
        : args.workout.environment.requiresHills
          ? "climbing"
          : terrainPreferenceForSessionType(args.workout.sessionType),
      continuityPriority: continuityPriorityForSessionType(args.workout.sessionType),
      repeatabilityPriority: repeatabilityPriorityForSessionType(args.workout.sessionType),
    },
    athlete,
    formDefaults: {
      discipline,
      shape: shapePreference,
      surface: defaultSurfaceForWorkout(args.workout),
      targetDistanceKm,
      elevationGainTargetM,
    },
  };
}

export function rankRouteCandidates(
  routes: Route[],
  args: { intent: RouteIntent; athlete?: RouteAthleteProfile | null },
): RankedRouteCandidate[] {
  const scored = routes.map((route) => scoreRoute(route, args.intent, args.athlete ?? null));
  scored.sort((a, b) => b.score - a.score);

  const gentlest = pickExtreme(scored, (candidate) => candidate.metrics.climbPerKm);
  const steadiest = pickExtreme(scored, (candidate) => candidate.metrics.turnDensityPerKm);
  const closest = pickExtreme(scored, (candidate) => candidate.metrics.distanceErrorRatio);
  const hilliest = pickExtreme(scored, (candidate) => -candidate.metrics.climbPerKm);

  return scored.map((candidate, index) => ({
    ...candidate,
    accent: index === 0
      ? "best_fit"
      : args.intent.terrainPreference === "climbing" && candidate.route.id === hilliest?.route.id
        ? "best_for_hills"
        : candidate.route.id === gentlest?.route.id
          ? "gentlest_option"
          : candidate.route.id === steadiest?.route.id
            ? "best_for_steady_pacing"
            : candidate.route.id === closest?.route.id
              ? "closest_to_target"
              : "closest_to_target",
  }));
}

export function pickWeekRouteTarget(week: Pick<PlanWeek, "sessions">): {
  session: PlanSession;
  sessionIndex: number;
} | null {
  const routeable = week.sessions
    .map((session, sessionIndex) => ({ session, sessionIndex }))
    .filter(({ session }) => isRouteableSession(session));

  if (routeable.length === 0) return null;

  const keyRunning = routeable.find(({ session }) => session.isKeySession && resolveSessionDiscipline(session) === "running");
  if (keyRunning) return keyRunning;

  const longRun = routeable.find(({ session }) => session.sessionType === "long_run");
  if (longRun) return longRun;

  return routeable.reduce((best, current) =>
    current.session.estimatedDurationMin > best.session.estimatedDurationMin ? current : best,
  );
}

function scoreRoute(
  route: Route,
  intent: RouteIntent,
  athlete: RouteAthleteProfile | null,
): RankedRouteCandidate {
  const distanceKm = route.distanceM / 1000;
  const predictedDurationSec = estimatePredictedDurationSec(route, intent, athlete);
  const targetDurationSec = intent.targetDurationMin ? intent.targetDurationMin * 60 : null;
  const distanceErrorRatio = Math.abs(distanceKm - intent.targetDistanceKm) / Math.max(intent.targetDistanceKm, 1);
  const durationErrorRatio = targetDurationSec
    ? Math.abs(predictedDurationSec - targetDurationSec) / Math.max(targetDurationSec, 1)
    : distanceErrorRatio;
  const elevationErrorRatio = intent.elevationGainTargetM != null
    ? Math.abs(route.elevationGainM - intent.elevationGainTargetM) / Math.max(intent.elevationGainTargetM, 80)
    : 0;
  const climbPerKm = route.elevationGainM / Math.max(distanceKm, 1);
  const turnDensityPerKm = computeTurnDensityPerKm(route.points, distanceKm);
  const continuityScore = clamp01(1 - turnDensityPerKm / 10);

  const distanceScore = clamp01(1 - distanceErrorRatio / 0.25);
  const durationScore = clamp01(1 - durationErrorRatio / 0.3);
  const terrainScore = terrainScoreForIntent(intent.terrainPreference, climbPerKm);
  const elevationTargetScore = intent.elevationGainTargetM != null
    ? clamp01(1 - elevationErrorRatio / 0.6)
    : terrainScore;
  const terrainCompositeScore = intent.elevationGainTargetM != null
    ? terrainScore * 0.35 + elevationTargetScore * 0.65
    : terrainScore;
  const shapeScore = route.shape === intent.shapePreference ? 1 : 0.72;
  const continuityWeight = intent.continuityPriority === "high" ? 1 : intent.continuityPriority === "medium" ? 0.8 : 0.55;
  const repeatabilityScore = intent.repeatabilityPriority === "high"
    ? route.shape === "out_and_back"
      ? 1
      : 0.68
    : route.shape === "out_and_back"
      ? 0.92
      : 0.85;
  const athleteScore = athleteFitScore(intent, athlete, distanceKm, climbPerKm);

  const weights = scoreWeightsForIntent(intent.sessionType);
  const score =
    distanceScore * weights.distance +
    durationScore * weights.duration +
    terrainCompositeScore * weights.terrain +
    continuityScore * continuityWeight * weights.continuity +
    shapeScore * weights.shape +
    repeatabilityScore * weights.repeatability +
    athleteScore * weights.athlete;

  return {
    route,
    score,
    predictedDurationSec,
    reasons: buildReasons({
      route,
      intent,
      athlete,
      distanceKm,
      distanceErrorRatio,
      durationErrorRatio,
      elevationErrorRatio,
      climbPerKm,
      continuityScore,
    }),
    metrics: {
      distanceKm,
      distanceErrorRatio,
      durationErrorRatio,
      elevationErrorRatio,
      climbPerKm,
      turnDensityPerKm,
      continuityScore,
    },
    accent: "best_fit",
  };
}

function buildReasons(args: {
  route: Route;
  intent: RouteIntent;
  athlete: RouteAthleteProfile | null;
  distanceKm: number;
  distanceErrorRatio: number;
  durationErrorRatio: number;
  elevationErrorRatio: number;
  climbPerKm: number;
  continuityScore: number;
}): RouteRecommendationReason[] {
  const reasons: RouteRecommendationReason[] = [];

  // Athletics track surfaces first when the session is interval-shaped —
  // it's the most concrete answer to "why this route" for fractionnés.
  const hasTrack = !!args.route.pois?.some((p) => p.type === "track");
  if (hasTrack && poiBoostForIntent(args.intent)?.type === "track") {
    reasons.push("uses_athletics_track");
  }

  if (args.intent.elevationGainTargetM != null && args.elevationErrorRatio <= 0.25) reasons.push("matches_elevation_target");
  if (args.intent.terrainPreference === "flat" && args.climbPerKm <= 12) reasons.push("keeps_climbing_low");
  if (args.intent.terrainPreference === "climbing" && args.climbPerKm >= 18) reasons.push("adds_useful_climbing");
  if (args.intent.continuityPriority === "high" && args.continuityScore >= 0.65) reasons.push("supports_steady_pacing");
  if (args.intent.repeatabilityPriority === "high" && args.route.shape === "out_and_back") reasons.push("stays_repeatable_for_repeats");
  if (args.intent.targetDurationMin && args.durationErrorRatio <= 0.14) reasons.push("matches_target_duration");
  if (args.distanceErrorRatio <= 0.1) reasons.push("closest_to_target_distance");
  if (
    args.intent.sessionType === "long_run" &&
    args.athlete?.currentLongRunKm &&
    args.distanceKm <= args.athlete.currentLongRunKm * 1.15
  ) {
    reasons.push("respects_current_long_run");
  }

  if (reasons.length === 0) reasons.push("closest_to_target_distance");
  return reasons.slice(0, 3);
}

function buildAthleteProfile(profile?: RunnerProfile | null): RouteAthleteProfile | null {
  if (!profile) return null;
  return {
    vma: profile.vma,
    runnerLevel: profile.runnerLevel,
    currentWeeklyKm: profile.currentWeeklyKm,
    currentLongRunKm: profile.currentLongRunKm,
  };
}

function isRouteableSession(session: PlanSession): boolean {
  if (session.workoutId === "__race_day__" || session.workoutId === "__intermediate_race__") return false;
  const discipline = resolveSessionDiscipline(session);
  if (discipline !== "running" && discipline !== "cycling") return false;

  return !new Set(["strength", "yoga", "rest", "rest_day", "cross_training", "swimming"]).has(session.sessionType);
}

function resolveTargetDistanceKm(
  session: PlanSession,
  athlete: RouteAthleteProfile | null,
  discipline: Discipline,
): number {
  if (session.targetDistanceKm && session.targetDistanceKm > 0) return roundHalf(session.targetDistanceKm);

  const durationMin = session.targetDurationMin ?? session.estimatedDurationMin;
  if (durationMin <= 0) return 8;

  if (discipline === "running") {
    const paces = calculateTrainingPaces(athlete?.vma, athlete?.runnerLevel);
    const intensity = sessionTypeToIntensity(session.sessionType);
    return roundHalf(estimateDistanceForDuration(durationMin, intensity, paces));
  }

  if (discipline === "cycling") {
    return roundHalf((durationMin / 60) * 25);
  }

  return roundHalf((durationMin / 60) * 4);
}

function resolveSessionDiscipline(session: PlanSession): Discipline {
  if (session.discipline) return session.discipline;
  if (session.sessionType === "cycling") return "cycling";
  if (session.sessionType === "swimming") return "swimming";
  return "running";
}

function defaultShapeForSessionType(sessionType: SessionType): SupportedRouteShape {
  switch (sessionType) {
    case "threshold":
    case "tempo":
    case "race_specific":
    case "hills":
      return "out_and_back";
    default:
      return "loop";
  }
}

function defaultSurfaceForSession(discipline: Discipline, sessionType: SessionType): RouteSurface {
  if (discipline === "cycling") return "road";
  switch (sessionType) {
    case "recovery":
    case "tempo":
    case "threshold":
    case "race_specific":
    case "speed":
    case "vo2max":
      return "road";
    case "hills":
      return "trail";
    default:
      return "mixed";
  }
}

function defaultSurfaceForWorkout(workout: WorkoutTemplate): RouteSurface {
  if (workout.environment.requiresHills) return "trail";
  if (workout.environment.prefersFlat) return "road";
  return defaultSurfaceForSession(getWorkoutDiscipline(workout), workout.sessionType);
}

function terrainPreferenceForManualRequest(
  surface: RouteSurface,
  elevationGainTargetM?: number,
): RouteIntent["terrainPreference"] {
  if (elevationGainTargetM != null) {
    if (elevationGainTargetM <= 60) return "flat";
    if (elevationGainTargetM >= 180) return "climbing";
    return "rolling";
  }

  if (surface === "road") return "flat";
  return "rolling";
}

function terrainPreferenceForSessionType(sessionType: SessionType): RouteIntent["terrainPreference"] {
  switch (sessionType) {
    case "recovery":
    case "tempo":
    case "threshold":
    case "race_specific":
    case "speed":
      return "flat";
    case "hills":
      return "climbing";
    default:
      return "rolling";
  }
}

function continuityPriorityForSessionType(sessionType: SessionType): RouteIntent["continuityPriority"] {
  switch (sessionType) {
    case "tempo":
    case "threshold":
    case "race_specific":
    case "cycling":
      return "high";
    case "recovery":
    case "hills":
      return "medium";
    default:
      return "medium";
  }
}

function repeatabilityPriorityForSessionType(sessionType: SessionType): RouteIntent["repeatabilityPriority"] {
  switch (sessionType) {
    case "hills":
    case "vo2max":
    case "speed":
      return "high";
    case "tempo":
    case "threshold":
      return "medium";
    default:
      return "low";
  }
}

function isWorkoutQualitySession(sessionType: SessionType): boolean {
  return new Set<SessionType | string>(["tempo", "threshold", "vo2max", "speed", "hills", "race_specific"]).has(sessionType);
}

const TRACK_FRIENDLY_SESSIONS = new Set<SessionType | string>([
  "vo2max",
  "speed",
  "vma",
  "intervals",
  "fractionne",
]);

/**
 * Bias the underlying generator towards an athletics track when the session
 * is interval-shaped. Returns `undefined` for everything else so endurance,
 * recovery and long runs keep getting parks/promenades as before.
 */
export function poiBoostForSession(sessionType?: SessionType): PoiBoost | undefined {
  if (!sessionType) return undefined;
  if (TRACK_FRIENDLY_SESSIONS.has(sessionType)) {
    // Track weight is 0.6 in overpass.ts (lowest of the bunch); a 4× boost
    // pushes it above promenades (1.0) and parks (0.9) without making it
    // mandatory — if no track is in range we still fall back gracefully.
    return { type: "track", factor: 4 };
  }
  return undefined;
}

export function poiBoostForIntent(intent: RouteIntent): PoiBoost | undefined {
  return poiBoostForSession(intent.sessionType);
}

function defaultElevationTargetM(
  targetDistanceKm: number,
  discipline: Discipline,
  sessionType?: SessionType,
): number | undefined {
  if (discipline !== "running" && discipline !== "cycling") return undefined;
  if (sessionType !== "hills") return undefined;
  return Math.max(120, Math.round(targetDistanceKm * 18));
}

// Scoring sub-helpers (estimatePredictedDurationSec, terrainScoreForIntent,
// athleteFitScore, scoreWeightsForIntent) live in
// ./recommendation/scoring-helpers.ts so this file focuses on the
// orchestration (rankRouteCandidates → scoreRoute → buildReasons) and
// the preset builders.

// Math helpers (bearing, angularDistance, computeTurnDensityPerKm,
// pickExtreme, roundHalf, clamp01) live in ./recommendation/math.ts —
// imported above. Kept that way so this file focuses on the
// recommendation domain rather than 3D geometry boilerplate.
