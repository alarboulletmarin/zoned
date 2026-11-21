/**
 * Les plans prêts calés sur le calendrier : la course tombe à sa date, le
 * départ est le bon lundi, et un plan trop long pour la date est signalé.
 */
import { describe, expect, mock, test } from "bun:test";

mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { anchorPrebuilt } = await import("./prebuiltPlanConverter");
import {
  addDaysToDate,
  defaultPlanStart,
  getPlanMonday,
  getSessionCalendarDate,
  isoDateOnly,
} from "@/lib/planDates";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import type { TrainingPlan } from "@/types/plan";

const WEEK_MONDAY = "2026-11-16";

function dated(plan: TrainingPlan) {
  const monday = getPlanMonday(plan);
  return plan.weeks.flatMap((w) =>
    w.sessions.map((s) => ({
      id: s.workoutId,
      date: isoDateOnly(getSessionCalendarDate(monday, w.weekNumber, s.dayOfWeek)),
    })),
  );
}

const racePlans = getAllPrebuiltPlans().filter((p) => (p.planPurpose ?? "race") === "race");
const openPlans = getAllPrebuiltPlans().filter((p) => p.planPurpose && p.planPurpose !== "race");

describe("anchorPrebuilt, avec une course", () => {
  test("les plans prêts de course posent tous la course le dimanche de leur dernière semaine", () => {
    for (const p of racePlans) {
      const last = p.weeks[p.weeks.length - 1];
      expect(last.sessions.find((s) => s.workoutId === "__race_day__")?.dayOfWeek).toBe(6);
    }
  });

  for (const p of racePlans) {
    for (let t = 0; t < 7; t++) {
      const today = addDaysToDate(WEEK_MONDAY, t);
      const earliest = defaultPlanStart(today);
      for (let dow = 0; dow < 7; dow++) {
        // La course la plus proche possible, puis quatre semaines plus tard.
        for (const extra of [0, 4]) {
          const raceDate = addDaysToDate(earliest, (p.totalWeeks - 1 + extra) * 7 + dow);
          test(`${p.slug} · aujourd'hui ${today} · course ${raceDate}`, () => {
            const res = anchorPrebuilt(p, { raceDate, today, raceName: "Course" });
            expect(res.ok).toBe(true);
            if (!res.ok) return;
            const expectedStart = addDaysToDate(earliest, extra * 7);
            expect(res.startDate).toBe(expectedStart);
            expect(isoDateOnly(getPlanMonday(res.plan))).toBe(expectedStart);
            expect(res.plan.config.raceDate).toBe(raceDate);
            expect(res.plan.config.endDate).toBe(raceDate);
            expect(res.plan.config.raceName).toBe("Course");
            const sessions = dated(res.plan);
            expect(sessions.filter((s) => s.id === "__race_day__").map((s) => s.date)).toEqual([raceDate]);
            expect(sessions.filter((s) => s.date > raceDate)).toEqual([]);
            expect(sessions.filter((s) => s.date < expectedStart)).toEqual([]);
            // Une seule séance le jour de la course : la course.
            expect(sessions.filter((s) => s.date === raceDate)).toHaveLength(1);
          });
        }
      }
    }
  }

  test("course un samedi : la course remplace le samedi, le dimanche disparaît", () => {
    const semi = racePlans.find((p) => p.slug === "semi-marathon")!;
    const res = anchorPrebuilt(semi, { raceDate: "2027-03-13", today: "2026-11-21" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const last = res.plan.weeks[res.plan.weeks.length - 1];
    expect(last.sessions.map((s) => s.dayOfWeek).every((d) => d <= 5)).toBe(true);
    expect(last.sessions.at(-1)?.workoutId).toBe("__race_day__");
    expect(res.startDate).toBe("2026-12-07");
  });

  test("trop long pour la date : signalé, avec les semaines qui restent", () => {
    const marathon = racePlans.find((p) => p.slug === "marathon")!;
    const res = anchorPrebuilt(marathon, { raceDate: "2027-03-14", today: "2026-11-21" });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.needed).toBe(18);
    expect(res.available).toBe(16);
  });

  test("le plan prêt d'origine n'est pas modifié", () => {
    const semi = racePlans.find((p) => p.slug === "semi-marathon")!;
    anchorPrebuilt(semi, { raceDate: "2027-03-17", today: "2026-11-21" });
    const last = semi.weeks[semi.weeks.length - 1];
    expect(last.sessions.find((s) => s.workoutId === "__race_day__")?.dayOfWeek).toBe(6);
  });
});

describe("anchorPrebuilt, sans course", () => {
  for (const p of openPlans) {
    for (let t = 0; t < 7; t++) {
      const today = addDaysToDate(WEEK_MONDAY, t);
      test(`${p.slug} · aujourd'hui ${today}`, () => {
        const start = defaultPlanStart(today);
        const res = anchorPrebuilt(p, { startDate: start });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        expect(isoDateOnly(getPlanMonday(res.plan))).toBe(start);
        expect(start >= today).toBe(true);
        const end = addDaysToDate(start, p.totalWeeks * 7 - 1);
        expect(res.plan.config.endDate).toBe(end);
        expect(res.plan.weeks).toHaveLength(p.totalWeeks);
        const sessions = dated(res.plan);
        expect(sessions.filter((s) => s.date < start || s.date > end)).toEqual([]);
      });
    }
  }
});
