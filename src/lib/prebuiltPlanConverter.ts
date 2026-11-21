import type { TrainingPlan, PlanConfig } from "@/types/plan";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { pickLang } from "@/lib/i18n-utils";
import {
  addDaysToDate,
  calculatePlanWeekCount,
  defaultPlanStart,
  isoDayOfWeek,
  mondayOfDate,
} from "@/lib/planDates";

export function convertPrebuiltToPlan(
  prebuilt: PrebuiltPlan,
): TrainingPlan {
  const id = crypto.randomUUID();
  const config: PlanConfig = {
    id,
    planMode: "prebuilt",
    planName: pickLang(prebuilt, "name"),
    raceDistance: prebuilt.raceDistance,
    daysPerWeek: prebuilt.sessionsPerWeek,
    createdAt: new Date().toISOString(),
  };

  return {
    id,
    config,
    weeks: structuredClone(prebuilt.weeks),
    totalWeeks: prebuilt.totalWeeks,
    phases: structuredClone(prebuilt.phases),
    name: prebuilt.name,
    nameEn: prebuilt.nameEn,
  };
}

export type PrebuiltAnchor =
  /** Un plan de course : il finit le jour de la course. */
  | { raceDate: string; today: string; raceName?: string }
  /** Un plan sans course : il commence ce lundi. */
  | { startDate: string };

export type AnchoredPrebuilt =
  | { ok: true; plan: TrainingPlan; startDate: string }
  /** Pas assez de semaines avant la course : il en faudrait `needed`, il en reste `available`. */
  | { ok: false; startDate: string; needed: number; available: number };

/**
 * Un plan prêt calé sur le calendrier.
 *
 * `convertPrebuiltToPlan` le faisait commencer cette semaine, quelle que soit
 * la date de la course : il ne finissait pas le jour J. Avec une course, la
 * semaine 1 est le lundi de la semaine de course moins (semaines - 1) x 7,
 * la course est déplacée au jour de la semaine de sa date, ce qui était prévu
 * ce jour-là laisse la place, et rien ne reste après elle. Un départ qui
 * tomberait avant `defaultPlanStart(today)` est signalé, pas créé : pas de
 * troncature.
 */
export function anchorPrebuilt(prebuilt: PrebuiltPlan, anchor: PrebuiltAnchor): AnchoredPrebuilt {
  const weeks = prebuilt.totalWeeks;

  if ("raceDate" in anchor) {
    const raceDate = anchor.raceDate.split("T")[0];
    const startDate = addDaysToDate(mondayOfDate(raceDate), -(weeks - 1) * 7);
    const earliest = defaultPlanStart(anchor.today);
    if (startDate < earliest) {
      return {
        ok: false,
        startDate,
        needed: weeks,
        available: Math.max(0, calculatePlanWeekCount(earliest, raceDate)),
      };
    }
    const plan = convertPrebuiltToPlan(prebuilt);
    const raceDow = isoDayOfWeek(raceDate);
    const last = plan.weeks[plan.weeks.length - 1];
    const race = last?.sessions.find((s) => s.workoutId === "__race_day__");
    if (last && race) {
      race.dayOfWeek = raceDow;
      last.sessions = last.sessions
        .filter((s) => s === race || s.dayOfWeek < raceDow)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }
    plan.config = {
      ...plan.config,
      startDate,
      raceDate,
      endDate: raceDate,
      raceName: anchor.raceName?.trim() || undefined,
    };
    return { ok: true, plan, startDate };
  }

  const startDate = mondayOfDate(anchor.startDate);
  const plan = convertPrebuiltToPlan(prebuilt);
  plan.config = {
    ...plan.config,
    startDate,
    endDate: addDaysToDate(startDate, weeks * 7 - 1),
  };
  return { ok: true, plan, startDate };
}
