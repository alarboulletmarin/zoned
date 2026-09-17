import { describe, expect, test } from "bun:test";

import {
  buildWeekReview,
  calendarWeekRange,
  hasSomethingToReview,
  planSessionsBetween,
} from "./weekReview";
import type { TrainingPlan } from "@/types/plan";
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

describe("buildWeekReview, le volume par sport", () => {
  /* La question que la carte posait mal : le temps du vélotaf s'ajoutait au
     total alors que ses kilomètres n'apparaissaient nulle part. */
  test("le temps s'additionne entre sports, les kilomètres restent chez eux", () => {
    const review = buildWeekReview({
      sessions: [session({ status: "completed", actualDurationMin: 60, actualDistanceKm: 11 })],
      activities: [activity({ durationMin: 85, distanceKm: 26.6, elevationGainM: 270 })],
      range: RANGE,
    });

    expect(review.totalMinutes).toBe(145);
    // Les km de COURSE seuls : le vélo n'y entre pas, et c'est la règle.
    expect(review.doneKm).toBe(11);
    // Le plus de temps d'abord : 85 min de vélo passent devant 60 de course.
    expect(review.byDiscipline).toEqual([
      {
        discipline: "cycling",
        minutes: 85,
        distanceKm: 26.6,
        elevationGainM: 270,
        extraMinutes: 85,
      },
      {
        discipline: "running",
        minutes: 60,
        distanceKm: 11,
        elevationGainM: 0,
        extraMinutes: 0,
      },
    ]);
  });

  /* À sport égal, en revanche, tout s'additionne : une sortie du plan et une
     sortie notée à la main sont deux fois de la course. */
  test("le plan et le complément se somment dans le même sport", () => {
    const review = buildWeekReview({
      sessions: [session({ status: "completed", actualDurationMin: 50, actualDistanceKm: 9 })],
      activities: [
        activity({ discipline: "running", purpose: "training", durationMin: 30, distanceKm: 5 }),
      ],
      range: RANGE,
    });

    expect(review.byDiscipline).toEqual([
      {
        discipline: "running",
        minutes: 80,
        distanceKm: 14,
        elevationGainM: 0,
        extraMinutes: 30,
      },
    ]);
  });

  test("une séance de vélo du plan porte ses kilomètres dans sa propre ligne", () => {
    const review = buildWeekReview({
      sessions: [
        session({
          workoutId: "CYC-001",
          sessionType: "cycling",
          status: "completed",
          actualDurationMin: 90,
          actualDistanceKm: 40,
        }),
      ],
      activities: [],
      range: RANGE,
    });

    expect(review.doneKm).toBe(0);
    expect(review.byDiscipline).toEqual([
      {
        discipline: "cycling",
        minutes: 90,
        distanceKm: 40,
        elevationGainM: 0,
        extraMinutes: 0,
      },
    ]);
  });

  test("le renforcement compte son temps et aucun kilomètre", () => {
    const review = buildWeekReview({
      sessions: [
        session({
          workoutId: "STR-001",
          sessionType: "strength",
          status: "completed",
          actualDurationMin: 40,
        }),
      ],
      activities: [],
      range: RANGE,
    });

    expect(review.byDiscipline).toEqual([
      { discipline: "other", minutes: 40, distanceKm: 0, elevationGainM: 0, extraMinutes: 0 },
    ]);
  });

  test("une séance non close ne compte pas : le tableau dit où le temps est passé", () => {
    const review = buildWeekReview({
      sessions: [session(), session({ status: "skipped" })],
      activities: [],
      range: RANGE,
    });
    expect(review.byDiscipline).toEqual([]);
  });

  test("le sport le plus volumineux ouvre le tableau", () => {
    const review = buildWeekReview({
      sessions: [session({ status: "completed", actualDurationMin: 110, actualDistanceKm: 20 })],
      activities: [
        activity({ durationMin: 85 }),
        activity({ discipline: "swimming", purpose: "training", durationMin: 45 }),
      ],
      range: RANGE,
    });
    expect(review.byDiscipline.map((v) => v.discipline)).toEqual([
      "running",
      "cycling",
      "swimming",
    ]);
  });

  test("un sport sans minute ne fait pas de ligne", () => {
    const review = buildWeekReview({ sessions: [], activities: [], range: RANGE });
    expect(review.byDiscipline).toEqual([]);
  });
});

describe("planSessionsBetween", () => {
  const plan: TrainingPlan = {
    id: "p1",
    config: { id: "c1", daysPerWeek: 3, startDate: "2026-09-28", createdAt: "2026-09-01T00:00:00.000Z" },
    totalWeeks: 2,
    phases: [{ phase: "base", startWeek: 1, endWeek: 2 }],
    name: "p1",
    nameEn: "p1",
    weeks: [
      // Lundi 28 septembre, mercredi 30, jeudi 1er octobre, dimanche 4.
      { weekNumber: 1, phase: "base", isRecoveryWeek: false, volumePercent: 100,
        sessions: [session({ dayOfWeek: 0, workoutId: "S28" }), session({ dayOfWeek: 2, workoutId: "S30" }), session({ dayOfWeek: 3, workoutId: "O1" }), session({ dayOfWeek: 6, workoutId: "O4" })] },
      { weekNumber: 2, phase: "base", isRecoveryWeek: false, volumePercent: 100,
        sessions: [session({ dayOfWeek: 0, workoutId: "O5" })] },
    ],
  };

  test("une semaine à cheval ne donne au mois que ses propres jours", () => {
    expect(planSessionsBetween(plan, "2026-09-01", "2026-09-30").map((s) => s.workoutId)).toEqual(["S28", "S30"]);
    expect(planSessionsBetween(plan, "2026-10-01", "2026-10-31").map((s) => s.workoutId)).toEqual(["O1", "O4", "O5"]);
  });

  test("les bornes sont comprises", () => {
    expect(planSessionsBetween(plan, "2026-09-28", "2026-09-28").map((s) => s.workoutId)).toEqual(["S28"]);
    expect(planSessionsBetween(plan, "2026-10-05", "2026-10-05").map((s) => s.workoutId)).toEqual(["O5"]);
  });

  test("un intervalle hors du plan ne rend rien", () => {
    expect(planSessionsBetween(plan, "2026-08-01", "2026-08-31")).toEqual([]);
  });
});
