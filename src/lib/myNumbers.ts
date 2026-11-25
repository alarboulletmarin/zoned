/**
 * Ce que l'app sait déjà de la personne, lu là où ça vit : la VMA et la FC
 * max (profil coureur, sinon l'ancienne clé des zones), le seuil qui en
 * découle, et les courses à venir inscrites dans ses plans. Les calculateurs
 * partent de là au lieu de s'ouvrir vides.
 *
 * Règle : une valeur absente reste absente. Rien n'est deviné ni rempli par
 * défaut, c'est l'écran qui dit à poser.
 */
import type { RaceDistance, TrainingPlan } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { UserZonePreferences } from "@/types";
import { calculatePaceZones } from "@/lib/zones";
import { practiceFromRaceDistance } from "@/types/practice";

export interface UpcomingRace {
  /** Stable across reads: plan id, date and distance. */
  key: string;
  planId: string;
  name?: string;
  distance: RaceDistance;
  /** Nominal distance; for trail and ultra a category, not the real course. */
  distanceKm: number;
  date: string;
  daysLeft: number;
  targetPaceMinKm?: number;
  /** Target finish time, only where a target pace and a real distance exist. */
  targetSeconds?: number;
  elevationGain?: number;
  isTrail: boolean;
  /** The plan's main race, as opposed to an intermediate goal. */
  isMain: boolean;
}

export interface MyNumbers {
  vma?: number;
  fcMax?: number;
  /** Z4 pace range, min/km, derived from the VMA. */
  threshold?: { fast: number; slow: number };
  /** Upcoming races, soonest first, today included, past ones dropped. */
  races: UpcomingRace[];
}

export const NO_NUMBERS: MyNumbers = { races: [] };

/** Name of a race as the person wrote it, else its distance. */
export function raceLabel(race: UpcomingRace, isEn: boolean): string {
  const meta = RACE_DISTANCE_META[race.distance];
  return race.name ?? (isEn ? meta.labelEn : meta.label);
}

/** Days from `fromIso` to `toIso`, both "YYYY-MM-DD", calendar days. */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(+fromIso.slice(0, 4), +fromIso.slice(5, 7) - 1, +fromIso.slice(8, 10));
  const b = Date.UTC(+toIso.slice(0, 4), +toIso.slice(5, 7) - 1, +toIso.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

export function readMyNumbers(
  prefs: UserZonePreferences | null,
  plans: readonly TrainingPlan[],
  todayIso: string,
): MyNumbers {
  const vma = prefs?.vma;
  const fcMax = prefs?.fcMax;
  const z4 = vma ? calculatePaceZones(vma).find((z) => z.zone === 4) : undefined;
  const threshold =
    z4?.paceMinPerKm != null && z4.paceMaxPerKm != null
      ? { fast: z4.paceMinPerKm, slow: z4.paceMaxPerKm }
      : undefined;

  const seen = new Set<string>();
  const races: UpcomingRace[] = [];
  const push = (
    plan: TrainingPlan,
    distance: RaceDistance | undefined,
    rawDate: string | undefined,
    name: string | undefined,
    targetPaceMinKm: number | undefined,
    elevationGain: number | undefined,
    isMain: boolean,
  ) => {
    if (!distance || !rawDate || !ISO_DAY.test(rawDate) || !RACE_DISTANCE_META[distance]) return;
    const date = rawDate.slice(0, 10);
    const daysLeft = daysBetween(todayIso, date);
    if (daysLeft < 0) return;
    const cleanName = name?.trim() || undefined;
    const dedupe = `${date}|${distance}|${cleanName ?? ""}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    const isTrail = practiceFromRaceDistance(distance) !== "road";
    const distanceKm = RACE_DISTANCE_META[distance].distanceKm;
    const pace = targetPaceMinKm && targetPaceMinKm > 0 ? targetPaceMinKm : undefined;
    races.push({
      key: `${plan.id}|${date}|${distance}`,
      planId: plan.id,
      name: cleanName,
      distance,
      distanceKm,
      date,
      daysLeft,
      targetPaceMinKm: pace,
      targetSeconds: pace && !isTrail ? Math.round(pace * distanceKm * 60) : undefined,
      elevationGain: elevationGain && elevationGain > 0 ? elevationGain : undefined,
      isTrail,
      isMain,
    });
  };

  for (const plan of plans) {
    const c = plan.config;
    if (!c) continue;
    if (c.planPurpose === undefined || c.planPurpose === "race") {
      push(plan, c.raceDistance, c.raceDate, c.raceName, c.targetPaceMinKm, c.elevationGain, true);
    }
    for (const goal of c.intermediateGoals ?? []) {
      push(plan, goal.raceDistance, goal.raceDate, goal.raceName, goal.targetPaceMinKm, undefined, false);
    }
  }
  races.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return {
    ...(vma ? { vma } : {}),
    ...(fcMax ? { fcMax } : {}),
    ...(threshold ? { threshold } : {}),
    races,
  };
}
