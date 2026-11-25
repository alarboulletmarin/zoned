/**
 * La journée de course en étapes, et où l'on en est à une heure donnée.
 *
 * Le simulateur en tire deux vues : Préparer (un document chronologique,
 * cinq chapitres) et Jour J (l'étape en cours en grand, la suivante dessous).
 * Tout est en minutes depuis minuit ; l'heure vient de l'appelant, vraie le
 * jour de la course, choisie au curseur les autres jours (répétition).
 */
import type { RacePlan } from "@/lib/raceSimulator";
import type { Exercise } from "@/data/guides/warmup/types";

export function hmToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHm(total: number): string {
  const wrapped = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${Math.floor(wrapped / 60)}:${String(wrapped % 60).padStart(2, "0")}`;
}

export type WarmupBlockKind = "jog" | "drills" | "strides" | "rest";

export interface WarmupBlock {
  kind: WarmupBlockKind;
  at: number;
  minutes: number;
  exercises: Exercise[];
}

function exerciseSeconds(ex: Exercise): number {
  return (ex.durationSeconds ?? 0) * (ex.sets ?? ex.repetitions ?? 1);
}

/**
 * L'échauffement regroupé en quatre temps : le footing (premier exercice),
 * les gammes (tout le milieu), les lignes droites (l'avant-dernier), le sas
 * (le dernier). Les horaires partent du début de l'échauffement.
 */
export function warmupBlocks(plan: RacePlan): WarmupBlock[] {
  const ex = plan.warmupExercises;
  if (ex.length === 0) return [];
  const groups: [WarmupBlockKind, Exercise[]][] =
    ex.length >= 4
      ? [
          ["jog", [ex[0]]],
          ["drills", ex.slice(1, -2)],
          ["strides", [ex[ex.length - 2]]],
          ["rest", [ex[ex.length - 1]]],
        ]
      : ex.map((e, i) => [i === 0 ? "jog" : i === ex.length - 1 ? "rest" : "drills", [e]]);
  let at = hmToMinutes(plan.warmupStartTime);
  return groups.map(([kind, exercises]) => {
    const minutes = Math.max(1, Math.round(exercises.reduce((s, e) => s + exerciseSeconds(e), 0) / 60));
    const block = { kind, at, minutes, exercises };
    at += minutes;
    return block;
  });
}

export type DayStepKind = "wake" | "breakfast" | "venue" | WarmupBlockKind | "race" | "finish";

export interface DayStep {
  kind: DayStepKind;
  at: number;
  /** Exercises of a warm-up step, for its detail line. */
  exercises?: Exercise[];
}

/** Every step of the day, in order (relative times of `generateRacePlan`). */
export function dayStepsFromPlan(plan: RacePlan): DayStep[] {
  const start = hmToMinutes(plan.startTime);
  const steps: DayStep[] = [
    { kind: "wake", at: hmToMinutes(plan.wakeUpTime) },
    { kind: "breakfast", at: hmToMinutes(plan.breakfastTime) },
    { kind: "venue", at: start - 60 },
    ...warmupBlocks(plan).map((b) => ({ kind: b.kind, at: b.at, exercises: b.exercises })),
    { kind: "race", at: start },
    { kind: "finish", at: start + Math.ceil(plan.targetTimeSeconds / 60) },
  ];
  return steps.sort((a, b) => a.at - b.at);
}

/** How long the last step stays "now" once reached. */
export const LAST_STEP_MINUTES = 30;

export interface RaceProgress {
  /** 0-based index of the split being run. */
  km: number;
  paceMinPerKm: number;
  /** Clock time (minutes) at which this split ends. */
  passageAt: number;
  /** Mental cue covering this split, if any. */
  cueIndex: number;
}

export interface DayState {
  /** Current step, -1 before the first one. */
  index: number;
  /** Window of the current step. */
  from: number;
  to: number;
  /** 0-1 through the current step. */
  progress: number;
  remaining: number;
  /** Next step index, -1 when none. */
  next: number;
  minutesToNext: number;
  race?: RaceProgress;
}

export function dayState(steps: DayStep[], plan: RacePlan, now: number): DayState {
  let index = -1;
  steps.forEach((s, i) => {
    if (now >= s.at) index = i;
  });
  const next = index + 1 < steps.length ? index + 1 : -1;
  const from = index >= 0 ? steps[index].at : now;
  const to = next >= 0 ? steps[next].at : from + LAST_STEP_MINUTES;
  const span = Math.max(1, to - from);
  const state: DayState = {
    index,
    from,
    to,
    progress: index < 0 ? 0 : Math.min(1, Math.max(0, (now - from) / span)),
    remaining: Math.max(0, Math.ceil(to - now)),
    next,
    minutesToNext: next >= 0 ? Math.max(0, Math.ceil(steps[next].at - now)) : 0,
  };

  if (index >= 0 && steps[index].kind === "race" && plan.splits.length > 0) {
    const elapsed = (now - steps[index].at) * 60;
    let km = plan.splits.findIndex((s) => s.cumulativeTimeSeconds > elapsed);
    if (km < 0) km = plan.splits.length - 1;
    const split = plan.splits[km];
    const kmDone = km + split.distance / 2;
    const cueIndex = plan.mentalCues.findIndex((c) => kmDone >= c.fromKm && kmDone <= c.toKm);
    state.race = {
      km,
      paceMinPerKm: split.paceMinPerKm,
      passageAt: steps[index].at + split.cumulativeTimeSeconds / 60,
      cueIndex,
    };
  }
  return state;
}

/** Race day is real only on its date; any other day is a rehearsal. */
export function isRaceToday(raceDate: string | undefined, todayIso: string): boolean {
  return raceDate !== undefined && raceDate === todayIso;
}
