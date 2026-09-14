import { describe, expect, test } from "bun:test";

import { buildWeekReview, calendarWeekRange, hasSomethingToReview } from "./weekReview";
import type { PlanSession } from "@/types/plan";
import type { ComplementaryActivity } from "@/types/activity";

const RANGE = { from: "2026-09-07", to: "2026-09-13" };

const session = (over: Partial<PlanSession> = {}): PlanSession => ({
  dayOfWeek: 1,
  workoutId: "END-001",
  sessionType: "endurance",
  isKeySession: false,
  estimatedDurationMin: 60,
  ...over,
});

const activity = (over: Partial<ComplementaryActivity> = {}): ComplementaryActivity => ({
  id: crypto.randomUUID(),
  date: "2026-09-08",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 25,
  createdAt: "2026-09-08T08:00:00.000Z",
  ...over,
});

describe("buildWeekReview", () => {
  test("une semaine vide n'a rien à dire", () => {
    const review = buildWeekReview({ sessions: [], activities: [], range: RANGE });
    expect(review.verdict).toBe("empty");
    expect(hasSomethingToReview(review)).toBe(false);
  });

  test("une séance non close n'est pas une séance sautée", () => {
    const review = buildWeekReview({
      sessions: [session(), session(), session()],
      activities: [],
      range: RANGE,
    });
    expect(review.pending).toBe(3);
    expect(review.skipped).toBe(0);
    expect(review.verdict).toBe("pending");
  });

  test("modifiée compte comme faite", () => {
    const review = buildWeekReview({
      sessions: [
        session({ status: "completed" }),
        session({ status: "modified", actualDurationMin: 40 }),
      ],
      activities: [],
      range: RANGE,
    });
    expect(review.completed).toBe(2);
    expect(review.verdict).toBe("perfect");
    expect(review.doneMinutes).toBe(100);
  });

  test("l'observance se mesure sur le prévu, pas sur le tranché", () => {
    const review = buildWeekReview({
      sessions: [session({ status: "completed" }), session(), session(), session()],
      activities: [],
      range: RANGE,
    });
    expect(review.adherence).toBeCloseTo(0.25, 5);
    expect(review.verdict).toBe("missed");
  });

  test("quatre sur cinq tient la semaine", () => {
    const review = buildWeekReview({
      sessions: [
        session({ status: "completed" }),
        session({ status: "completed" }),
        session({ status: "completed" }),
        session({ status: "completed" }),
        session({ status: "skipped" }),
      ],
      activities: [],
      range: RANGE,
    });
    expect(review.verdict).toBe("solid");
    expect(review.skipped).toBe(1);
  });

  test("les séances clés se comptent à part", () => {
    const review = buildWeekReview({
      sessions: [
        session({ isKeySession: true, status: "completed" }),
        session({ isKeySession: true, status: "skipped" }),
        session({ status: "completed" }),
      ],
      activities: [],
      range: RANGE,
    });
    expect(review.keyPlanned).toBe(2);
    expect(review.keyCompleted).toBe(1);
  });

  test("le jour de course n'est pas une séance", () => {
    const review = buildWeekReview({
      sessions: [session({ workoutId: "__race_day__" }), session({ status: "completed" })],
      activities: [],
      range: RANGE,
    });
    expect(review.planned).toBe(1);
    expect(review.verdict).toBe("perfect");
  });

  test("le temps total compte les activités, le temps du plan non", () => {
    const review = buildWeekReview({
      sessions: [session({ status: "completed" })],
      activities: [activity({ durationMin: 25 }), activity({ durationMin: 25 })],
      range: RANGE,
    });
    expect(review.doneMinutes).toBe(60);
    expect(review.activities.minutes).toBe(50);
    expect(review.totalMinutes).toBe(110);
  });

  test("des activités sans plan suffisent à faire un bilan", () => {
    const review = buildWeekReview({
      sessions: [],
      activities: [activity()],
      range: RANGE,
    });
    expect(review.verdict).toBe("extras");
    expect(hasSomethingToReview(review)).toBe(true);
    expect(review.adherence).toBeNull();
  });

  test("le RPE moyen ignore les séances qui n'en portent pas", () => {
    const review = buildWeekReview({
      sessions: [
        session({ status: "completed", rpe: 4 }),
        session({ status: "completed", rpe: 8 }),
        session({ status: "completed" }),
      ],
      activities: [],
      range: RANGE,
    });
    expect(review.avgRpe).toBe(6);
  });
});

describe("calendarWeekRange", () => {
  test("un mardi rend son lundi et son dimanche", () => {
    expect(calendarWeekRange(new Date(2026, 8, 8))).toEqual({
      from: "2026-09-07",
      to: "2026-09-13",
    });
  });

  test("un dimanche appartient à la semaine qui se termine, pas à la suivante", () => {
    expect(calendarWeekRange(new Date(2026, 8, 13))).toEqual({
      from: "2026-09-07",
      to: "2026-09-13",
    });
  });

  test("un lundi est sa propre borne basse", () => {
    expect(calendarWeekRange(new Date(2026, 8, 7))).toEqual({
      from: "2026-09-07",
      to: "2026-09-13",
    });
  });
});
