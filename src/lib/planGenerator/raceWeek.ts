import type { RaceDistance, PlanWeek, PlanSession, TrainingGoal } from "@/types/plan";
import type { Difficulty, WorkoutTemplate } from "@/types";
import { DISTANCE_TAGS, OPENER_DAYS_BEFORE_RACE } from "./constants";
import { computeBlockLoad } from "./paceEngine";

/** Floor for race-week jogs, shorter than this is not a run, it's a warm-up */
const RACE_WEEK_MIN_SESSION_MIN = 25;
/**
 * Ceiling for a race-week jog, above it the week stops being a taper. By
 * distance for beginners and intermediates: a 60-minute jog and a 60-minute
 * walk-run in the week of a half marathon read as a training week. Advanced
 * runners on big volumes keep the hour (Pfitzinger's race weeks).
 */
const RACE_WEEK_MAX_SESSION_MIN: Record<RaceDistance, number> = {
  "5K": 35,
  "10K": 40,
  semi: 45,
  marathon: 50,
  trail_short: 45,
  trail: 50,
  ultra: 55,
};
const RACE_WEEK_MAX_SESSION_MIN_ADVANCED = 60;
/** A race-pace reminder sits at least this many days before the race */
const SHARPENER_MIN_DAYS_BEFORE_RACE = 4;
/** The pre-race opener, easy jog plus strides */
const OPENER_MIN = 25;

function getRaceLabel(raceDistance: RaceDistance): { fr: string; en: string } {
  switch (raceDistance) {
    case "semi": return { fr: "Semi-marathon", en: "Half Marathon" };
    case "trail_short": return { fr: "Trail court", en: "Short Trail" };
    case "trail": return { fr: "Trail", en: "Trail" };
    case "ultra": return { fr: "Ultra trail", en: "Ultra Trail" };
    default: return { fr: raceDistance, en: raceDistance };
  }
}

/**
 * Generate the race week (last week of plan).
 */
export function generateRaceWeek(
  weekNumber: number,
  raceDistance: RaceDistance,
  daysPerWeek: number,
  longRunDay: number, // This becomes race day (0=Mon...6=Sun)
  difficulty: Difficulty,
  allWorkouts: WorkoutTemplate[],
  /** Average easy pace (min/km), states the jogs in km like every other week */
  easyPaceMinKm?: number,
  /** Training km the volume model plans for race week (the race excluded) */
  targetKm?: number,
  trainingGoal?: TrainingGoal,
): PlanWeek {
  const sessions: PlanSession[] = [];

  // Race day
  const raceLabel = getRaceLabel(raceDistance);
  const raceDaySession: PlanSession = {
    dayOfWeek: longRunDay,
    workoutId: "__race_day__",
    sessionType: "race_specific",
    isKeySession: true,
    estimatedDurationMin: 0, // Race duration varies
    notes: `Jour de course - ${raceLabel.fr}`,
    notesEn: `Race day - ${raceLabel.en}`,
  };
  sessions.push(raceDaySession);

  // Opener session 2 days before race
  const openerDay = (longRunDay - OPENER_DAYS_BEFORE_RACE + 7) % 7;
  const openerWorkout = findOpenerWorkout(allWorkouts, difficulty);
  // Rien ne se court après la course dans sa propre semaine : une course du
  // lundi ou du mardi n'a pas d'activation dans la semaine, elle tombe dans
  // celle d'avant que le plan ne réécrit pas.
  const openerInWeek = openerDay < longRunDay;
  if (openerWorkout && openerInWeek) {
    sessions.push({
      dayOfWeek: openerDay,
      workoutId: openerWorkout.id,
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: OPENER_MIN,
      notes: "Activation pré-course : footing léger + quelques accélérations",
      notesEn: "Pre-race activation: easy jog + a few strides",
    });
  }

  // Fill easy days earlier in the week (avoid the day before race = rest day)
  const usedDays = new Set([longRunDay, openerDay]);
  const dayBeforeRace = (longRunDay - 1 + 7) % 7;
  usedDays.add(dayBeforeRace); // Keep day before race free (rest)

  // A plain jog: no walk-run, nothing meant for after a race, nothing that
  // needs a pool or a yoga mat.
  const lightRecovery = allWorkouts.filter(
    w => w.category === "recovery" &&
    w.selectionCriteria.relativeLoad === "light" &&
    getDifficultyLevel(w.difficulty) <= getDifficultyLevel(difficulty)
  );
  const plainJogs = lightRecovery.filter((w) => {
    const tags = w.selectionCriteria.tags;
    return !tags.includes("walk-run") && !tags.includes("post-race") && !tags.includes("situational");
  });
  const recoveryWorkouts = plainJogs.length > 0 ? plainJogs : lightRecovery;

  // Only add easy runs on non-consecutive days, well before the race
  const candidateDays = [0, 1, 2, 3, 4, 5, 6]
    .filter(d => !usedDays.has(d))
    .filter(d => d < longRunDay)
    .filter(d => {
      // At least 3 days before race (circular)
      const daysBeforeRace = (longRunDay - d + 7) % 7;
      return daysBeforeRace >= 3;
    })
    .filter(d => {
      // Not adjacent to opener day (ensure rest between)
      const distToOpener = Math.min(Math.abs(d - openerDay), 7 - Math.abs(d - openerDay));
      return distToOpener >= 2;
    });

  const maxExtraSessions = Math.max(0, daysPerWeek - 2);
  const easyDays = candidateDays.slice(0, maxExtraSessions);

  // Size the jogs on the volume model's race-week target. Fixed 25-minute
  // jogs delivered 20 % of peak on a marathon plan when the published
  // ladders keep 33-42 %; the opener is fixed, the jogs share the rest.
  let jogMinutes = RACE_WEEK_MIN_SESSION_MIN;
  if (targetKm && targetKm > 0 && easyPaceMinKm && easyPaceMinKm > 0 && easyDays.length > 0) {
    const openerKm = openerWorkout ? OPENER_MIN / easyPaceMinKm : 0;
    const perJogKm = Math.max(0, targetKm - openerKm) / easyDays.length;
    jogMinutes = Math.round(perJogKm * easyPaceMinKm);
  }
  const maxJog = getDifficultyLevel(difficulty) >= 3
    ? RACE_WEEK_MAX_SESSION_MIN_ADVANCED
    : RACE_WEEK_MAX_SESSION_MIN[raceDistance];
  jogMinutes = Math.min(maxJog, Math.max(RACE_WEEK_MIN_SESSION_MIN, jogMinutes));

  // Intensity is kept through the taper, volume is what drops (Bosquet 2007).
  // A runner chasing a time gets a few minutes at race pace early in the
  // week instead of a jog; "finish" plans and 3-day weeks keep their jogs.
  const sharpener = trainingGoal && trainingGoal !== "finish" && daysPerWeek >= 4
    ? findSharpenerWorkout(allWorkouts, difficulty, raceDistance)
    : undefined;
  const sharpenerDay = sharpener
    ? easyDays.find((d) => (longRunDay - d + 7) % 7 >= SHARPENER_MIN_DAYS_BEFORE_RACE)
    : undefined;
  if (sharpener && sharpenerDay !== undefined) {
    const minutes = Math.round((sharpener.typicalDuration.min + sharpener.typicalDuration.max) / 2);
    sessions.push({
      dayOfWeek: sharpenerDay,
      workoutId: sharpener.id,
      sessionType: "race_specific",
      isKeySession: true,
      estimatedDurationMin: Math.min(maxJog, minutes),
      notes: "Rappel d'allure : quelques minutes à l'allure de course, rien de plus",
      notesEn: "Pace reminder: a few minutes at race pace, nothing more",
    });
  }

  easyDays.filter((d) => d !== sharpenerDay).forEach((day, i) => {
    // Rotate through the pool so race week isn't the same jog three days running
    const workout = recoveryWorkouts[i % Math.max(1, recoveryWorkouts.length)];
    if (workout) {
      sessions.push({
        dayOfWeek: day,
        workoutId: workout.id,
        sessionType: "recovery",
        isKeySession: false,
        estimatedDurationMin: jogMinutes,
        notes: "Footing léger - semaine de course",
        notesEn: "Easy jog - race week",
      });
    }
  });

  // State the jogs in km so race week reads like every other week.
  // The race marker itself keeps no distance: it is an event, not training
  // volume, and counting it would double the week's reported load.
  if (easyPaceMinKm && easyPaceMinKm > 0) {
    for (const s of sessions) {
      if (s.workoutId === "__race_day__") continue;
      s.targetDistanceKm = Math.round((s.estimatedDurationMin / easyPaceMinKm) * 2) / 2;
      // Easy jogs carry little load, but not none
      s.loadScore = Math.round(computeBlockLoad(s.estimatedDurationMin, 2) * 10) / 10;
    }
  }

  // Sort sessions by day
  sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return {
    weekNumber,
    phase: "taper",
    isRecoveryWeek: false,
    volumePercent: 40,
    sessions,
    weekLabel: "Semaine de course",
    weekLabelEn: "Race week",
  };
}

/** A short race-pace session written for the taper, at or below the runner's level */
function findSharpenerWorkout(
  workouts: WorkoutTemplate[],
  difficulty: Difficulty,
  raceDistance: RaceDistance,
): WorkoutTemplate | undefined {
  const level = getDifficultyLevel(difficulty);
  const allDistanceTags = new Set(Object.values(DISTANCE_TAGS).flat());
  const ownTags = new Set(DISTANCE_TAGS[raceDistance]);
  // A template written for one distance ("6km confiance 10K") stays with it
  const fitsDistance = (w: WorkoutTemplate) => {
    const tagged = w.selectionCriteria.tags.filter((t) => allDistanceTags.has(t));
    return tagged.length === 0 || tagged.some((t) => ownTags.has(t));
  };
  return workouts
    .filter((w) =>
      w.category === "race_pace" &&
      w.selectionCriteria.phases.includes("taper") &&
      w.selectionCriteria.tags.includes("taper") &&
      w.selectionCriteria.tags.includes("pre-race") &&
      fitsDistance(w) &&
      !w.selectionCriteria.tags.includes("situational") &&
      getDifficultyLevel(w.difficulty) <= level,
    )
    .sort((a, b) =>
      getDifficultyLevel(b.difficulty) - getDifficultyLevel(a.difficulty)
      || b.selectionCriteria.priorityScore - a.selectionCriteria.priorityScore,
    )[0];
}

function findOpenerWorkout(workouts: WorkoutTemplate[], difficulty: Difficulty): WorkoutTemplate | undefined {
  // Look for opener/shakeout tagged workouts
  const openers = workouts.filter(
    w => w.selectionCriteria.tags.some(t => ["opener", "shakeout", "race-prep"].includes(t)) &&
    getDifficultyLevel(w.difficulty) <= getDifficultyLevel(difficulty)
  );
  if (openers.length > 0) return openers[0];

  // Fallback: any light recovery workout
  return workouts.find(
    w => w.category === "recovery" &&
    w.selectionCriteria.relativeLoad === "light" &&
    getDifficultyLevel(w.difficulty) <= getDifficultyLevel(difficulty)
  );
}

function getDifficultyLevel(d: Difficulty): number {
  const levels: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
  return levels[d];
}

// getAvailableDays removed, race week uses inline day selection logic
