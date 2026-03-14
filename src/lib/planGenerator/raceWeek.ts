import type { RaceDistance, PlanWeek, PlanSession } from "@/types/plan";
import type { Difficulty, WorkoutTemplate } from "@/types";
import { RACE_WEEK_VOLUME_PCT, OPENER_DAYS_BEFORE_RACE } from "./constants";

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
  const raceDaySession: PlanSession = {
    dayOfWeek: longRunDay,
    workoutId: "__race_day__",
    sessionType: "race_specific",
    isKeySession: true,
    estimatedDurationMin: 0, // Race duration varies
    notes: `Jour de course - ${raceDistance === "semi" ? "Semi-marathon" : raceDistance}`,
    notesEn: `Race day - ${raceDistance === "semi" ? "Half Marathon" : raceDistance}`,
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

  // Fill 1-2 more easy days earlier in the week if daysPerWeek > 2
  const usedDays = new Set([longRunDay, openerDay]);
  const easyDays = getAvailableDays(longRunDay, daysPerWeek)
    .filter(d => !usedDays.has(d))
    .slice(0, Math.max(0, daysPerWeek - 2));

  const recoveryWorkouts = allWorkouts.filter(
    w => w.category === "recovery" &&
    w.selectionCriteria.relativeLoad === "light" &&
    getDifficultyLevel(w.difficulty) <= getDifficultyLevel(difficulty)
  );

  for (const day of easyDays) {
    // Only add easy sessions for days well before the race
    const daysBeforeRace = (longRunDay - day + 7) % 7;
    if (daysBeforeRace >= 3 || day < longRunDay) {
      const workout = recoveryWorkouts[0]; // Simple selection for race week
      if (workout) {
        sessions.push({
          dayOfWeek: day,
          workoutId: workout.id,
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: Math.round(workout.typicalDuration.min * RACE_WEEK_VOLUME_PCT),
          notes: "Footing de récupération - semaine de course",
          notesEn: "Recovery jog - race week",
        });
      }
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

function getAvailableDays(longRunDay: number, daysPerWeek: number): number[] {
  // Distribute days evenly across the week, avoiding consecutive days when possible
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const spacing = Math.floor(7 / daysPerWeek);
  const days: number[] = [longRunDay];

  for (let i = 1; i < daysPerWeek; i++) {
    const candidate = (longRunDay - i * spacing + 7) % 7;
    if (!days.includes(candidate)) {
      days.push(candidate);
    }
  }

  // Fill remaining if needed
  if (days.length < daysPerWeek) {
    for (const d of allDays) {
      if (days.length >= daysPerWeek) break;
      if (!days.includes(d)) days.push(d);
    }
  }

  return days.sort((a, b) => a - b);
}
