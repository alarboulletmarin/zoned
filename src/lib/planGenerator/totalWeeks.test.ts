/**
 * Le nombre de semaines d'un plan de course et la place de la course.
 *
 * Un plan se lit en semaines calendaires (lundi au dimanche). Compter des
 * tranches de sept jours depuis le départ perdait la semaine de course dès
 * que la course ne tombait pas sept jours pile après un départ : le plan du
 * Trail des Balcons (départ lun. 26 oct., course dim. 10 janv.) sortait en 10
 * semaines, la course posée le dim. 3 janv.
 */
import { describe, expect, test } from "bun:test";
import { generatePlan } from "./index";
import { getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import type { AssistedPlanConfig, TrainingPlan } from "@/types/plan";

function config(startDate: string, raceDate: string, longRunDay = 6): AssistedPlanConfig {
  return {
    id: "weeks",
    createdAt: `${startDate}T00:00:00.000Z`,
    startDate,
    raceDate,
    raceDistance: "trail_short",
    runnerLevel: "intermediate",
    trainingGoal: "finish",
    daysPerWeek: 4,
    longRunDay,
    vma: 14,
    planPurpose: "race",
    includeStrength: true,
    strengthFrequency: 1,
  } as AssistedPlanConfig;
}

function raceDateOf(plan: TrainingPlan): { week: number; date: string } | null {
  for (const week of plan.weeks) {
    const race = week.sessions.find((s) => s.workoutId === "__race_day__");
    if (race) {
      const date = getSessionCalendarDate(getPlanMonday(plan), week.weekNumber, race.dayOfWeek);
      return { week: week.weekNumber, date: isoDateOnly(date) };
    }
  }
  return null;
}

describe("plan de course : semaines et jour de course", () => {
  test("départ un lundi, course un dimanche : 11 semaines, course en S11 le dimanche", async () => {
    const plan = await generatePlan(config("2026-10-26", "2027-01-10"));
    expect(plan.totalWeeks).toBe(11);
    expect(plan.weeks).toHaveLength(11);
    expect(raceDateOf(plan)).toEqual({ week: 11, date: "2027-01-10" });
  });

  test("départ en milieu de semaine : la course tombe à sa date", async () => {
    const plan = await generatePlan(config("2026-10-28", "2027-01-10"));
    expect(plan.totalWeeks).toBe(11);
    expect(raceDateOf(plan)).toEqual({ week: 11, date: "2027-01-10" });
  });

  test("course un samedi, sorties longues le dimanche : la course est le samedi", async () => {
    const plan = await generatePlan(config("2026-10-26", "2027-01-09", 6));
    expect(plan.totalWeeks).toBe(11);
    expect(raceDateOf(plan)).toEqual({ week: 11, date: "2027-01-09" });
    // Rien n'est couru après la course dans sa propre semaine.
    const last = plan.weeks[plan.weeks.length - 1];
    expect(last.sessions.every((s) => s.dayOfWeek <= 5)).toBe(true);
  });

  test("course la semaine du départ : refusée, le plan demande des semaines", async () => {
    await expect(generatePlan(config("2026-10-26", "2026-11-01"))).rejects.toThrow();
  });
});
