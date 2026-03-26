import type { RaceDistance, PlanWeek, PlanSession } from "@/types/plan";
import type { Difficulty, WorkoutTemplate } from "@/types";
import { RACE_WEEK_VOLUME_PCT, OPENER_DAYS_BEFORE_RACE } from "./constants";

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
  if (openerWorkout) {
    sessions.push({
      dayOfWeek: openerDay,
      workoutId: openerWorkout.id,
      sessionType: "recovery",
      isKeySession: false,
      estimatedDurationMin: 25,
      notes: "Activation pré-course : footing léger + quelques accélérations",
      notesEn: "Pre-race activation: easy jog + a few strides",
    });
  }

  // Fill easy days earlier in the week (avoid the day before race = rest day)
  const usedDays = new Set([longRunDay, openerDay]);
  const dayBeforeRace = (longRunDay - 1 + 7) % 7;
  usedDays.add(dayBeforeRace); // Keep day before race free (rest)

  const recoveryWorkouts = allWorkouts.filter(
    w => w.category === "recovery" &&
    w.selectionCriteria.relativeLoad === "light" &&
    getDifficultyLevel(w.difficulty) <= getDifficultyLevel(difficulty)
  );

  // Only add easy runs on non-consecutive days, well before the race
  const candidateDays = [0, 1, 2, 3, 4, 5, 6]
    .filter(d => !usedDays.has(d))
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
  for (const day of candidateDays.slice(0, maxExtraSessions)) {
    const workout = recoveryWorkouts[0];
    if (workout) {
      sessions.push({
        dayOfWeek: day,
        workoutId: workout.id,
        sessionType: "recovery",
        isKeySession: false,
        estimatedDurationMin: Math.round(workout.typicalDuration.min * RACE_WEEK_VOLUME_PCT),
        notes: "Footing léger - semaine de course",
        notesEn: "Easy jog - race week",
      });
    }
  }

  // Sort sessions by day
  sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return {
    weekNumber,
    phase: "taper",
    isRecoveryWeek: false,
    volumePercent: Math.round(RACE_WEEK_VOLUME_PCT * 100),
    sessions,
    weekLabel: "Semaine de course",
    weekLabelEn: "Race week",
  };
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

// getAvailableDays removed — race week uses inline day selection logic
