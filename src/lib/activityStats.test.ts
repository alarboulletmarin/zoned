import { describe, expect, test } from "bun:test";

import { activityLoad, complementaryShare, summarizeActivities } from "./activityStats";
import type { ComplementaryActivity } from "@/types/activity";

const make = (over: Partial<ComplementaryActivity>): ComplementaryActivity => ({
  id: over.id ?? crypto.randomUUID(),
  date: "2026-09-14",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 25,
  createdAt: "2026-09-14T08:00:00.000Z",
  ...over,
});

describe("activityLoad", () => {
  test("durée fois RPE saisi", () => {
    expect(activityLoad(make({ durationMin: 60, rpe: 7 }))).toBe(420);
  });

  test("sans RPE, le motif en donne un, et un déplacement pèse moins", () => {
    expect(activityLoad(make({ durationMin: 30, purpose: "commute" }))).toBe(90);
    expect(activityLoad(make({ durationMin: 30, purpose: "training" }))).toBe(150);
  });

  test("une activité sans RPE ne pèse jamais zéro", () => {
    expect(activityLoad(make({ durationMin: 1 }))).toBeGreaterThan(0);
  });
});

describe("summarizeActivities", () => {
  test("rien ne donne rien", () => {
    const summary = summarizeActivities([]);
    expect(summary.count).toBe(0);
    expect(summary.byDiscipline).toEqual([]);
  });

  test("le temps s'additionne entre disciplines, pas les kilomètres", () => {
    const summary = summarizeActivities([
      make({ discipline: "cycling", durationMin: 60, distanceKm: 30 }),
      make({ discipline: "running", durationMin: 30, distanceKm: 6 }),
    ]);
    expect(summary.minutes).toBe(90);
    const bike = summary.byDiscipline.find((d) => d.discipline === "cycling");
    const run = summary.byDiscipline.find((d) => d.discipline === "running");
    expect(bike?.distanceKm).toBe(30);
    expect(run?.distanceKm).toBe(6);
    // Aucun champ du résumé n'additionne 30 et 6.
    expect(Object.values(summary)).not.toContain(36);
  });

  test("une discipline sans activité n'apparaît pas", () => {
    const summary = summarizeActivities([make({ discipline: "cycling" })]);
    expect(summary.byDiscipline).toHaveLength(1);
    expect(summary.byDiscipline[0].discipline).toBe("cycling");
  });

  test("le dénivelé s'additionne toutes disciplines", () => {
    const summary = summarizeActivities([
      make({ discipline: "cycling", elevationGainM: 180 }),
      make({ discipline: "running", elevationGainM: 120 }),
    ]);
    expect(summary.elevationGainM).toBe(300);
  });

  test("les watts sont pondérés par le temps, pas moyennés à plat", () => {
    const summary = summarizeActivities([
      make({ durationMin: 180, avgWatts: 200 }),
      make({ durationMin: 20, avgWatts: 100 }),
    ]);
    // Une moyenne à plat donnerait 150.
    expect(summary.byDiscipline[0].avgWatts).toBe(190);
  });

  test("sans aucun capteur, les watts sont absents et non zéro", () => {
    const summary = summarizeActivities([make({})]);
    expect(summary.byDiscipline[0].avgWatts).toBeNull();
  });

  test("déplacement et entraînement se comptent séparément", () => {
    const summary = summarizeActivities([
      make({ purpose: "commute", durationMin: 25 }),
      make({ purpose: "transport", durationMin: 15 }),
      make({ purpose: "training", durationMin: 90 }),
    ]);
    expect(summary.travelMinutes).toBe(40);
    expect(summary.trainingMinutes).toBe(90);
  });
});

describe("complementaryShare", () => {
  test("la part du complément dans le temps total", () => {
    expect(complementaryShare(300, 100)).toBeCloseTo(0.25, 5);
  });

  test("zéro partout ne rend pas une division par zéro", () => {
    expect(complementaryShare(0, 0)).toBe(0);
  });
});
