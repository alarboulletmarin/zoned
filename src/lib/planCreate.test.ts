import { describe, expect, test } from "bun:test";
import { buildAssistedConfig, emptyPlanForm, levelFromWeeklyKm, levelOf } from "./planCreate";

describe("le niveau du parcours", () => {
  test("rien n'est coché d'office", () => {
    expect(emptyPlanForm().runnerLevel).toBeNull();
  });

  test("un niveau choisi l'emporte sur tout le reste", () => {
    expect(levelOf({ runnerLevel: "beginner", currentWeeklyKm: "60", vma: "18" })).toBe("beginner");
  });

  test("sans choix, le volume actuel donne le niveau sur les repères de l'écran", () => {
    expect(levelFromWeeklyKm(10)).toBe("beginner");
    expect(levelFromWeeklyKm(25)).toBe("intermediate");
    expect(levelFromWeeklyKm(40)).toBe("intermediate");
    expect(levelFromWeeklyKm(55)).toBe("advanced");
    expect(levelFromWeeklyKm(90)).toBe("elite");
    expect(levelOf({ runnerLevel: null, currentWeeklyKm: "12", vma: "17" })).toBe("beginner");
  });

  test("puis la VMA, puis intermédiaire", () => {
    expect(levelOf({ runnerLevel: null, currentWeeklyKm: "", vma: "11" })).toBe("beginner");
    expect(levelOf({ runnerLevel: null, currentWeeklyKm: "", vma: "" })).toBe("intermediate");
  });

  test("la configuration porte toujours un niveau, même avant le choix", () => {
    const form = { ...emptyPlanForm(), raceDistance: "semi" as const, raceDate: "2027-03-07", currentWeeklyKm: "20" };
    expect(buildAssistedConfig(form, "2026-11-28").runnerLevel).toBe("intermediate");
  });
});
