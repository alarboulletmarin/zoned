import { beforeAll, describe, expect, mock, test } from "bun:test";

mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { estimateDistanceKm, intensitySplit, peakOf, stepTarget, zoneCode, zoneTone } = await import(
  "./sessionFacts"
);
const { qualityShareOf } = await import("./weekRings");
const { loadAllWorkouts } = await import("@/data/workouts");
const { calculateAllZones } = await import("./zones");

import type { WorkoutTemplate } from "@/types";
import type { PlanSession } from "@/types/plan";

let mix010: WorkoutTemplate;

beforeAll(async () => {
  mix010 = (await loadAllWorkouts()).find((w) => w.id === "MIX-010")!;
});

describe("intensitySplit", () => {
  test("MIX-010 sur la règle des anneaux : Z1-Z2 contre Z3 et plus", () => {
    const split = intensitySplit(mix010, 36.5);
    // 15 min d'échauffement, 3 min de récup, 2 min de footing et 10 min de
    // retour au calme en Endurance ; 5 min de Z3-Z4 et 3 × 30 s de Z5 en Qualité.
    expect(split.enduranceMin).toBeCloseTo(30, 5);
    expect(split.qualityMin).toBeCloseTo(6.5, 5);
  });

  test("dit la même chose que les anneaux de la semaine", () => {
    const session = { workoutId: "MIX-010", estimatedDurationMin: 37 } as PlanSession;
    const split = intensitySplit(mix010, 37);
    expect(split.qualityMin / (split.enduranceMin + split.qualityMin)).toBeCloseTo(
      qualityShareOf(session, mix010, 37),
      10,
    );
  });
});

describe("peakOf", () => {
  test("MIX-010 : Z5, trois fois 30 s cumulées", () => {
    expect(peakOf(mix010)).toEqual({ zone: 5, seconds: 90 });
  });

  test("une séance sans zone n'a pas de pic", () => {
    const bare = { ...mix010, warmupStructure: [], cooldownStructure: [], warmupTemplate: [], cooldownTemplate: [],
      mainSetTemplate: [{ description: "Gammes", durationMin: 10 }],
      mainSetStructure: [{ kind: "segment", description: "Gammes", durationSec: 600 }] } as WorkoutTemplate;
    expect(peakOf(bare)).toBeNull();
  });
});

describe("estimateDistanceKm", () => {
  test("MIX-010 à 15 km/h fait un peu moins de 6 km", () => {
    const km = estimateDistanceKm(mix010, 15)!;
    expect(km).toBeGreaterThan(5.5);
    expect(km).toBeLessThan(6.3);
  });

  test("plus vite avec une VMA plus haute", () => {
    expect(estimateDistanceKm(mix010, 18)!).toBeGreaterThan(estimateDistanceKm(mix010, 15)!);
  });

  test("rien hors de la course", () => {
    expect(estimateDistanceKm({ ...mix010, discipline: "cycling" }, 15)).toBeNull();
  });
});

describe("zones", () => {
  test("le code et la teinte", () => {
    expect(zoneCode("Z1-Z2")).toBe("Z1-Z2");
    expect(zoneCode("Z5")).toBe("Z5");
    expect(zoneCode(undefined)).toBeNull();
    expect(zoneTone("Z3-Z4")).toBe(4);
  });

  test("la cible d'un bloc, du plus lent au plus rapide", () => {
    const zones = calculateAllZones({ vma: 15 });
    expect(stepTarget("Z1-Z2", zones, { paces: true })).toBe("8:00 → 5:20 /km");
    expect(stepTarget("Z5", zones, { paces: true })).toBe("4:21 → 4:00 /km");
    expect(stepTarget("Z5", undefined, { paces: true })).toBeNull();
    const hr = calculateAllZones({ fcMax: 190 });
    expect(stepTarget("Z2", hr, { paces: true })).toBe("114-133 bpm");
  });
});
