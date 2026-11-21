import { describe, expect, test } from "bun:test";
import { reachableStep, stepsFor } from "./flows";

const custom = { prebuiltSlug: null };
const ready = { prebuiltSlug: "semi-marathon" };

describe("stepsFor", () => {
  test("course avec un plan prêt disponible : cinq écrans", () => {
    expect(stepsFor(custom, 1)).toEqual(["goal", "date", "path", "you", "preview"]);
  });

  test("sans plan prêt pour cet objectif : quatre écrans, pas de choix", () => {
    expect(stepsFor(custom, 0)).toEqual(["goal", "date", "you", "preview"]);
  });

  test("un plan prêt choisi : quatre écrans, toi et ta semaine sauté", () => {
    expect(stepsFor(ready, 2)).toEqual(["goal", "date", "path", "preview"]);
  });
});

describe("reachableStep", () => {
  const steps = stepsFor(custom, 1);

  test("sans objectif, on revient à la première question", () => {
    expect(reachableStep("preview", steps, { goal: false, date: false })).toBe("goal");
  });

  test("sans date valide, rien au-delà de la date", () => {
    expect(reachableStep("you", steps, { goal: true, date: false })).toBe("date");
    expect(reachableStep("date", steps, { goal: true, date: false })).toBe("date");
  });

  test("un écran absent du parcours mène au dernier", () => {
    expect(reachableStep("you", stepsFor(ready, 1), { goal: true, date: true })).toBe("preview");
    expect(reachableStep("path", stepsFor(custom, 0), { goal: true, date: true })).toBe("preview");
  });

  test("un écran du parcours répondu reste où il est", () => {
    expect(reachableStep("path", steps, { goal: true, date: true })).toBe("path");
  });
});
