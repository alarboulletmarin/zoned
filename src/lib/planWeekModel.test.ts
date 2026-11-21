import { describe, expect, mock, test } from "bun:test";

// `weekRings` charge `planStats`, qui atteint le catalogue et l'entrée i18n.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { buildPlanWeekModel, defaultPlanWeek } = await import("./planWeekModel");

import type { AnyWorkoutTemplate } from "@/types";
import type { ComplementaryActivity } from "@/types/activity";
import type { PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";

// Le plan part le lundi 26 octobre 2026 ; jeudi 19 novembre est en semaine 4.
const THURSDAY = new Date("2026-11-19T09:00:00");

const CATALOG: Record<string, AnyWorkoutTemplate> = {
  "END-001": { id: "END-001", category: "endurance", typicalDuration: { min: 30, max: 50 } } as unknown as AnyWorkoutTemplate,
  "STR-001": { id: "STR-001", kind: "strength", exercises: [] } as unknown as AnyWorkoutTemplate,
};
const workoutOf = (id: string) => CATALOG[id];

const s = (over: Partial<PlanSession> = {}): PlanSession => ({
  dayOfWeek: 0,
  workoutId: "END-002",
  sessionType: "endurance",
  isKeySession: false,
  estimatedDurationMin: 40,
  status: "planned",
  ...over,
});

const week = (weekNumber: number, sessions: PlanSession[], phase: PlanWeek["phase"] = "build"): PlanWeek => ({
  weekNumber,
  phase,
  isRecoveryWeek: false,
  volumePercent: 100,
  sessions,
});

function plan(weeks: PlanWeek[], config: Partial<TrainingPlan["config"]> = { startDate: "2026-10-26" }): TrainingPlan {
  return {
    id: "p",
    name: "P",
    nameEn: "P",
    totalWeeks: weeks.length,
    phases: [],
    config: { id: "p", createdAt: "2026-10-20T00:00:00.000Z", daysPerWeek: 4, ...config } as TrainingPlan["config"],
    weeks,
  };
}

const FOUR_WEEKS = [
  week(1, [s({ dayOfWeek: 0, status: "completed" })], "base"),
  week(2, [s({ dayOfWeek: 0, status: "completed" })], "base"),
  week(3, [s({ dayOfWeek: 0, status: "completed" })], "base"),
  week(4, [
    s({ dayOfWeek: 0, status: "skipped", estimatedDurationMin: 37, targetDistanceKm: 7 }),
    s({ dayOfWeek: 1, status: "completed", estimatedDurationMin: 33, actualDurationMin: 30 }),
    s({ dayOfWeek: 1, workoutId: "STR-001", sessionType: "strength", estimatedDurationMin: 25, status: "completed" }),
    s({ dayOfWeek: 4, workoutId: "HIL-012", sessionType: "hills", isKeySession: true, estimatedDurationMin: 48 }),
    s({ dayOfWeek: 6, workoutId: "SL-005", sessionType: "long_run", isKeySession: true, estimatedDurationMin: 81 }),
  ]),
  week(5, [s({ dayOfWeek: 6, workoutId: "__race_day__", sessionType: "race_specific", estimatedDurationMin: 0 })], "taper"),
];

describe("buildPlanWeekModel", () => {
  test("semaine en cours : dates, états des jours, aujourd'hui", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 4, THURSDAY, workoutOf)!;
    expect(m.from).toBe("2026-11-16");
    expect(m.to).toBe("2026-11-22");
    expect(m.state).toBe("current");
    expect(m.phase).toBe("build");
    expect(m.days.map((d) => d.state)).toEqual(["past", "past", "past", "current", "future", "future", "future"]);
    expect(m.days[3].isToday).toBe(true);
    expect(m.days[3].rest).toBe(true);
  });

  test("séance sautée : le jour passé est manqué, sa durée prévue reste", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 4, THURSDAY, workoutOf)!;
    const monday = m.days[0];
    expect(monday.missed).toBe(true);
    expect(monday.sessions[0].status).toBe("skipped");
    expect(monday.plannedMin).toBe(37);
    expect(monday.doneMin).toBe(0);
    expect(monday.sessions[0].distanceKm).toBe(7);
  });

  test("jour avec deux séances : la course à pied d'abord, le renfo ensuite, les index d'origine gardés", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 4, THURSDAY, workoutOf)!;
    const tuesday = m.days[1];
    expect(tuesday.sessions.map((x) => x.index)).toEqual([1, 2]);
    expect(tuesday.sessions[1].strength).toBe(true);
    // La durée réelle saisie remplace la prévue dans le fait, pas dans le prévu.
    expect(tuesday.plannedMin).toBe(33 + 25);
    expect(tuesday.doneMin).toBe(30 + 25);
    expect(m.plannedMin).toBe(37 + 33 + 25 + 48 + 81);
    expect(m.doneMin).toBe(55);
  });

  test("étiquettes : la sortie longue l'emporte sur la séance clé", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 4, THURSDAY, workoutOf)!;
    expect(m.days[4].sessions[0].tag).toBe("key");
    expect(m.days[6].sessions[0].tag).toBe("long_run");
    expect(m.days[0].sessions[0].tag).toBeNull();
  });

  test("semaine passée et semaine future", () => {
    const p = plan(FOUR_WEEKS);
    expect(buildPlanWeekModel(p, 1, THURSDAY, workoutOf)!.state).toBe("past");
    const future = buildPlanWeekModel(p, 5, THURSDAY, workoutOf)!;
    expect(future.state).toBe("future");
    expect(future.days.every((d) => d.state === "future")).toBe(true);
  });

  test("jour de course : une carte, sans durée", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 5, THURSDAY, workoutOf)!;
    const sunday = m.days[6];
    expect(sunday.date).toBe("2026-11-29");
    expect(sunday.sessions[0].kind).toBe("race");
    expect(sunday.plannedMin).toBe(0);
    expect(sunday.rest).toBe(false);
  });

  test("activité hors plan : rangée sur son jour, hors des barres", () => {
    const activity: ComplementaryActivity = {
      id: "a1",
      date: "2026-11-19",
      discipline: "cycling",
      purpose: "commute",
      durationMin: 25,
      createdAt: "2026-11-19T08:00:00.000Z",
    } as ComplementaryActivity;
    const m = buildPlanWeekModel(plan(FOUR_WEEKS), 4, THURSDAY, workoutOf, [activity])!;
    expect(m.days[3].offPlan).toHaveLength(1);
    expect(m.days[3].rest).toBe(false);
    expect(m.days[3].plannedMin).toBe(0);
    expect(m.days[2].offPlan).toHaveLength(0);
  });

  test("plan sans date de départ : la semaine part du lundi de la création", () => {
    const m = buildPlanWeekModel(plan(FOUR_WEEKS, {}), 1, THURSDAY, workoutOf)!;
    expect(m.from).toBe("2026-10-19");
  });

  test("séance souple : la durée prévue est le milieu de la fourchette", () => {
    const p = plan([week(1, [s({ workoutId: "END-001", precision: "loose", estimatedDurationMin: 35 })])]);
    expect(buildPlanWeekModel(p, 1, THURSDAY, workoutOf)!.days[0].plannedMin).toBe(40);
  });

  test("semaine absente", () => {
    expect(buildPlanWeekModel(plan(FOUR_WEEKS), 9, THURSDAY, workoutOf)).toBeNull();
  });
});

describe("defaultPlanWeek", () => {
  test("l'URL bornée, sinon la semaine en cours bornée", () => {
    expect(defaultPlanWeek(10, 4, null)).toBe(4);
    expect(defaultPlanWeek(10, 0, null)).toBe(1);
    expect(defaultPlanWeek(10, 14, null)).toBe(10);
    expect(defaultPlanWeek(10, 4, 7)).toBe(7);
    expect(defaultPlanWeek(10, 4, 40)).toBe(10);
    expect(defaultPlanWeek(10, 4, 0)).toBe(1);
  });
});
