import { describe, expect, test } from "bun:test";

import { intensitySplit, zoneFromRpe } from "./periodIntensity";
import type { PlanSession } from "@/types/plan";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { ComplementaryActivity } from "@/types/activity";

const session = (over: Partial<PlanSession> = {}): PlanSession => ({
  dayOfWeek: 1,
  workoutId: "END-001",
  sessionType: "endurance",
  isKeySession: false,
  estimatedDurationMin: 60,
  status: "completed",
  ...over,
});

const activity = (over: Partial<ComplementaryActivity> = {}): ComplementaryActivity => ({
  id: crypto.randomUUID(),
  date: "2026-09-08",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 30,
  createdAt: "2026-09-08T08:00:00.000Z",
  ...over,
});

/** Un gabarit réduit à ce que `getDominantZone` lit : son corps de séance. */
function template(id: string, zone: string): AnyWorkoutTemplate {
  return {
    id,
    mainSetTemplate: [{ zone, duration: "20min" }],
  } as unknown as WorkoutTemplate;
}

const CATALOG: Record<string, AnyWorkoutTemplate> = {
  "END-001": template("END-001", "Z2"),
  "TMP-001": template("TMP-001", "Z3"),
  "VMA-001": template("VMA-001", "Z5"),
  "STR-001": { id: "STR-001", kind: "strength", exercises: [] } as unknown as AnyWorkoutTemplate,
};
const workoutOf = (id: string) => CATALOG[id];

describe("zoneFromRpe", () => {
  test("les bornes sont celles de la clôture", () => {
    expect(zoneFromRpe(2)).toBe(2);
    expect(zoneFromRpe(4)).toBe(2);
    expect(zoneFromRpe(5)).toBe(3);
    expect(zoneFromRpe(6)).toBe(3);
    expect(zoneFromRpe(7)).toBe(4);
    expect(zoneFromRpe(10)).toBe(4);
  });
});

describe("intensitySplit", () => {
  test("une séance compte entière dans la zone de son gabarit, à ses minutes réelles", () => {
    const split = intensitySplit({
      sessions: [
        session({ workoutId: "END-001", actualDurationMin: 80 }),
        session({ workoutId: "VMA-001", actualDurationMin: 40 }),
      ],
      activities: [],
      workoutOf,
    });
    expect(split.lowMinutes).toBe(80);
    expect(split.highMinutes).toBe(40);
    expect(split.zonedMinutes).toBe(120);
    expect(split.lowShare).toBeCloseTo(2 / 3);
  });

  test("une séance non close ne compte pas, une sautée non plus", () => {
    const split = intensitySplit({
      sessions: [session({ status: "planned" }), session({ status: "skipped" }), session({ status: undefined })],
      activities: [],
      workoutOf,
    });
    expect(split.zonedMinutes).toBe(0);
    expect(split.unclassifiedMinutes).toBe(0);
  });

  test("modifiée est une façon d'avoir couru", () => {
    const split = intensitySplit({
      sessions: [session({ workoutId: "TMP-001", status: "modified", actualDurationMin: 45 })],
      activities: [],
      workoutOf,
    });
    expect(split.midMinutes).toBe(45);
  });

  test("le renforcement et un gabarit absent ne se devinent pas", () => {
    const split = intensitySplit({
      sessions: [session({ workoutId: "STR-001", estimatedDurationMin: 30 }), session({ workoutId: "XXX-999" })],
      activities: [],
      workoutOf,
    });
    expect(split.zonedMinutes).toBe(0);
    expect(split.unclassifiedMinutes).toBe(90);
    // Et ils ne se confondent pas : l'un n'a rien à qualifier, l'autre attend son chunk.
    expect(split.strengthMinutes).toBe(30);
    expect(split.unknownMinutes).toBe(60);
  });

  test("une activité de semaine prend la zone de son effort prévu", () => {
    const split = intensitySplit({
      sessions: [
        session({ workoutId: "__activity_cycling__", intensity: "hard", estimatedDurationMin: 50 }),
        session({ workoutId: "__activity_commute__", estimatedDurationMin: 25 }),
      ],
      activities: [],
      workoutOf: () => undefined,
    });
    expect(split.highMinutes).toBe(50);
    expect(split.lowMinutes).toBe(25);
  });

  test("le journal se classe par effort perçu, déduit du motif s'il manque", () => {
    const split = intensitySplit({
      sessions: [],
      activities: [
        activity({ durationMin: 25 }),
        activity({ purpose: "training", durationMin: 60 }),
        activity({ purpose: "training", rpe: 8, durationMin: 40 }),
      ],
      workoutOf,
    });
    expect(split.lowMinutes).toBe(25);
    expect(split.midMinutes).toBe(60);
    expect(split.highMinutes).toBe(40);
  });

  test("le jour de course n'est pas une séance", () => {
    const split = intensitySplit({
      sessions: [session({ workoutId: "__race_day__", estimatedDurationMin: 120 })],
      activities: [],
      workoutOf,
    });
    expect(split.zonedMinutes + split.unclassifiedMinutes).toBe(0);
  });
});
