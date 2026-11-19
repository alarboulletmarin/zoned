import { describe, expect, mock, test } from "bun:test";

// `weekRings` charge `planStats`, qui atteint le catalogue et l'entrée i18n :
// on la remplace avant de charger le module, comme weekRings.test.ts.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { buildPlanCardModel, isCountedSession } = await import("./planCardModel");

import type { AnyWorkoutTemplate } from "@/types";
import type { PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";

// Le plan commence le lundi 2 novembre 2026 ; jeudi 19 est en semaine 3.
const THURSDAY = new Date("2026-11-19T09:00:00");

const CATALOG: Record<string, AnyWorkoutTemplate> = {
  // Un footing souple de 30 à 50 min : il compte 40 quand il est souple.
  "END-001": {
    id: "END-001",
    category: "endurance",
    typicalDuration: { min: 30, max: 50 },
  } as unknown as AnyWorkoutTemplate,
};
const workoutOf = (id: string) => CATALOG[id];

const s = (over: Partial<PlanSession> = {}): PlanSession => ({
  dayOfWeek: 1,
  workoutId: "THR-001",
  sessionType: "threshold",
  isKeySession: false,
  estimatedDurationMin: 60,
  status: "planned",
  ...over,
});

const week = (weekNumber: number, phase: PlanWeek["phase"], sessions: PlanSession[]): PlanWeek => ({
  weekNumber,
  phase,
  isRecoveryWeek: false,
  volumePercent: 100,
  sessions,
});

function plan(over: Partial<TrainingPlan["config"]> = {}, weeks?: PlanWeek[]): TrainingPlan {
  const ws = weeks ?? [
    week(1, "base", [
      s({ dayOfWeek: 1, status: "completed", actualDurationMin: 75 }),
      s({ dayOfWeek: 3, status: "skipped" }),
      s({ dayOfWeek: 6, workoutId: "__activity_rest__", sessionType: "rest", estimatedDurationMin: 0 }),
    ]),
    week(2, "build", [
      s({ dayOfWeek: 1, status: "modified" }),
      // Non close : prévue à date, pas faite, pas sautée.
      s({ dayOfWeek: 4 }),
    ]),
    week(3, "build", [
      s({ dayOfWeek: 1, status: "completed" }),
      // Aujourd'hui, jeudi, déjà faite.
      s({ dayOfWeek: 3, status: "completed", workoutId: "END-001", sessionType: "endurance", precision: "loose", estimatedDurationMin: 35 }),
      s({ dayOfWeek: 5, workoutId: "LNG-001", sessionType: "long_run", estimatedDurationMin: 90 }),
    ]),
    week(4, "taper", [
      s({ dayOfWeek: 2, estimatedDurationMin: 30 }),
      s({ dayOfWeek: 6, workoutId: "__race_day__", sessionType: "race_specific", estimatedDurationMin: 200 }),
    ]),
  ];
  return {
    id: "p1",
    name: "Plan",
    nameEn: "Plan",
    totalWeeks: ws.length,
    weeks: ws,
    phases: [
      { phase: "base", startWeek: 1, endWeek: 1 },
      { phase: "build", startWeek: 2, endWeek: 3 },
      { phase: "taper", startWeek: 4, endWeek: 4 },
    ],
    config: {
      id: "p1",
      daysPerWeek: 4,
      createdAt: "2026-10-30T10:00:00.000Z",
      startDate: "2026-11-02",
      endDate: "2026-11-29",
      raceDate: "2026-11-29",
      raceDistance: "10K",
      ...over,
    },
  };
}

describe("buildPlanCardModel, à date", () => {
  const m = buildPlanCardModel(plan(), THURSDAY, workoutOf);

  test("compte faites sur prévues jusqu'à aujourd'hui, sautées et non closes comprises au prévu", () => {
    // S1 : 2 séances (le repos sort), S2 : 2, S3 : lundi et jeudi. Samedi S3 est à venir.
    expect(m.sessionsToDate).toEqual({ done: 4, planned: 6 });
  });

  test("le volume prend la durée réelle, et la séance souple au milieu de sa fourchette", () => {
    // Prévu : 60 + 60 + 60 + 60 + 60 + 40 (souple : milieu de 30-50, pas 35).
    // Fait : 75 (réel) + 60 (modifiée) + 60 + 40.
    expect(m.minutesToDate).toEqual({ done: 235, planned: 340 });
  });

  test("sur tout le plan, sans le jour de course ni le repos", () => {
    expect(m.sessionsTotal).toEqual({ done: 4, planned: 8 });
    expect(m.minutesTotal.planned).toBe(340 + 90 + 30);
  });
});

describe("buildPlanCardModel, les semaines et les phases", () => {
  const m = buildPlanCardModel(plan(), THURSDAY, workoutOf);

  test("passées, en cours, à venir", () => {
    expect(m.weekNow).toBe(3);
    expect(m.weeks.map((w) => w.state)).toEqual(["past", "past", "current", "future"]);
  });

  test("minutes prévues et faites par semaine, jour de course exclu", () => {
    expect(m.weeks.map((w) => [w.plannedMin, w.doneMin])).toEqual([
      [120, 75],
      [120, 60],
      [190, 100],
      [30, 0],
    ]);
    expect(m.maxWeekMin).toBe(190);
  });

  test("la semaine de course porte le drapeau", () => {
    expect(m.weeks.map((w) => w.isRace)).toEqual([false, false, false, true]);
  });

  test("une course au-delà de la dernière semaine met le drapeau sur la dernière", () => {
    const p = plan({ raceDate: "2026-12-06", endDate: "2026-12-06" });
    p.weeks[3].sessions = p.weeks[3].sessions.filter((x) => x.workoutId !== "__race_day__");
    const flags = buildPlanCardModel(p, THURSDAY, workoutOf).weeks.map((w) => w.isRace);
    expect(flags).toEqual([false, false, false, true]);
  });

  test("les phases avec leur nombre de semaines et la phase en cours", () => {
    expect(m.phases).toEqual([
      { phase: "base", start: 1, weeks: 1, current: false },
      { phase: "build", start: 2, weeks: 2, current: true },
      { phase: "taper", start: 4, weeks: 1, current: false },
    ]);
    expect(m.phaseNow).toBe("build");
  });
});

test("une phase qui déborde de la frise est bornée à ses colonnes", () => {
  const p = plan();
  p.phases = [
    { phase: "base", startWeek: 1, endWeek: 2 },
    { phase: "taper", startWeek: 3, endWeek: 6 },
  ];
  expect(buildPlanCardModel(p, THURSDAY, workoutOf).phases.map((x) => [x.start, x.weeks])).toEqual([
    [1, 2],
    [3, 2],
  ]);
});

describe("buildPlanCardModel, le compte à rebours", () => {
  test("sur la date de course", () => {
    const m = buildPlanCardModel(plan(), THURSDAY, workoutOf);
    expect(m.countdown).toEqual({ days: 10, kind: "race", date: "2026-11-29" });
  });

  test("repli sur la fin du plan sans course", () => {
    const m = buildPlanCardModel(
      plan({ raceDate: undefined, raceDistance: undefined, planMode: "free", endDate: "2026-12-13" }),
      THURSDAY,
      workoutOf,
    );
    expect(m.countdown).toEqual({ days: 24, kind: "end", date: "2026-12-13" });
  });

  test("Jour J : zéro jour", () => {
    const m = buildPlanCardModel(plan(), new Date("2026-11-29T07:00:00"), workoutOf);
    expect(m.ended).toBe(false);
    expect(m.countdown?.days).toBe(0);
  });

  test("aucun pour un plan terminé", () => {
    const m = buildPlanCardModel(plan(), new Date("2026-11-30T07:00:00"), workoutOf);
    expect(m.ended).toBe(true);
    expect(m.countdown).toBeNull();
    expect(m.weeks.every((w) => w.state === "past")).toBe(true);
  });
});

describe("buildPlanCardModel, la prochaine séance", () => {
  test("ignore la séance faite aujourd'hui et celles d'avant", () => {
    const m = buildPlanCardModel(plan(), THURSDAY, workoutOf);
    // Mardi S2 est non close mais passée ; jeudi S3 est faite : samedi S3.
    expect(m.next).toEqual({
      date: "2026-11-21",
      weekNumber: 3,
      dayOfWeek: 5,
      workoutId: "LNG-001",
      sessionType: "long_run",
      durationMin: 90,
    });
  });

  test("aujourd'hui, si elle n'est pas encore faite", () => {
    const p = plan();
    p.weeks[2].sessions[1].status = "planned";
    const m = buildPlanCardModel(p, THURSDAY, workoutOf);
    expect(m.next?.date).toBe("2026-11-19");
    expect(m.next?.durationMin).toBe(40);
  });

  test("ne propose pas le jour de course", () => {
    const m = buildPlanCardModel(plan(), new Date("2026-11-26T09:00:00"), workoutOf);
    expect(m.next).toBeNull();
  });
});

describe("buildPlanCardModel, les pastilles", () => {
  test("distance, pratique, objectif, au plus trois", () => {
    const p = plan({ planMode: "prebuilt" });
    p.raceTimePrediction = "42:30";
    expect(buildPlanCardModel(p, THURSDAY).chips).toEqual([
      { kind: "distance", distance: "10K" },
      { kind: "practice", practice: "road" },
      { kind: "target", value: "42:30" },
    ]);
  });

  test("un plan libre sans distance : sa pratique et son mode", () => {
    const m = buildPlanCardModel(
      plan({ raceDistance: undefined, raceDate: undefined, planMode: "free", practice: "trail" }),
      THURSDAY,
    );
    expect(m.chips).toEqual([
      { kind: "practice", practice: "trail" },
      { kind: "mode", mode: "free" },
    ]);
  });

  test("pas de pastille Trail deux fois", () => {
    const m = buildPlanCardModel(plan({ raceDistance: "trail" }), THURSDAY);
    expect(m.chips).toEqual([{ kind: "distance", distance: "trail" }]);
  });
});

test("le jour de course et les jours de repos ne sont pas des séances", () => {
  expect(isCountedSession(s({ workoutId: "__race_day__" }))).toBe(false);
  expect(isCountedSession(s({ sessionType: "rest" }))).toBe(false);
  expect(isCountedSession(s({ sessionType: "rest_day" }))).toBe(false);
  expect(isCountedSession(s())).toBe(true);
});
