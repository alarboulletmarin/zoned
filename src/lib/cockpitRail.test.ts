import { describe, expect, test } from "bun:test";
import {
  advanceTarget,
  closuresBetween,
  defaultSessionRank,
  railWeights,
  sessionKey,
} from "./cockpitRail";

describe("defaultSessionRank", () => {
  test("la première séance qui reste à faire", () => {
    expect(defaultSessionRank(["planned", "planned"])).toBe(0);
    expect(defaultSessionRank(["completed", "planned"])).toBe(1);
    expect(defaultSessionRank(["skipped", "modified", undefined])).toBe(2);
  });

  test("sinon la dernière, celle qui a fermé la journée", () => {
    expect(defaultSessionRank(["completed", "skipped"])).toBe(1);
    expect(defaultSessionRank(["completed"])).toBe(0);
  });

  test("une journée vide reste au rang zéro", () => {
    expect(defaultSessionRank([])).toBe(0);
  });
});

describe("railWeights", () => {
  test("proportionnels à la durée", () => {
    expect(railWeights([59, 50])).toEqual([59, 50]);
    expect(railWeights([20, 90, 35])).toEqual([20, 90, 35]);
  });

  test("une séance sans durée pèse comme la plus courte, jamais zéro", () => {
    expect(railWeights([undefined, 40, 0])).toEqual([40, 40, 40]);
    expect(railWeights([undefined, 30, 60])).toEqual([30, 30, 60]);
  });

  test("aucune durée connue : parts égales", () => {
    expect(railWeights([undefined, 0])).toEqual([1, 1]);
  });
});

describe("closuresBetween", () => {
  const a = sessionKey({ planId: "p", weekNumber: 3, index: 0 });
  const b = sessionKey({ planId: "p", weekNumber: 3, index: 1 });

  test("la clé est celle du cockpit", () => {
    expect(a).toBe("p:3:0");
  });

  test("une clôture : ouverte puis faite", () => {
    const before = new Map([[a, "planned" as const], [b, "planned" as const]]);
    expect(closuresBetween(before, [[a, "completed"], [b, "planned"]])).toEqual([
      { key: a, done: true },
    ]);
    expect(closuresBetween(before, [[a, "modified"]])).toEqual([{ key: a, done: true }]);
  });

  test("sautée est close sans être faite : pas de tampon", () => {
    const before = new Map([[a, undefined]]);
    expect(closuresBetween(before, [[a, "skipped"]])).toEqual([{ key: a, done: false }]);
  });

  test("rien au premier rendu ni sur une séance qu'on n'avait pas lue", () => {
    expect(closuresBetween(new Map(), [[a, "completed"], [b, "planned"]])).toEqual([]);
  });

  test("rien sur un rechargement qui ne change rien", () => {
    const before = new Map([[a, "completed" as const], [b, "planned" as const]]);
    expect(closuresBetween(before, [[a, "completed"], [b, "planned"]])).toEqual([]);
  });

  test("rien sur une réouverture", () => {
    const before = new Map([[a, "completed" as const], [b, "skipped" as const]]);
    expect(closuresBetween(before, [[a, "modified"], [b, "completed"]])).toEqual([]);
    expect(closuresBetween(before, [[a, "planned"]])).toEqual([]);
  });
});

describe("advanceTarget", () => {
  test("la suivante qui reste à faire", () => {
    expect(advanceTarget(["completed", "planned"], 0)).toBe(1);
    expect(advanceTarget(["completed", "completed", "planned"], 1)).toBe(2);
  });

  test("sinon une précédente restée ouverte", () => {
    expect(advanceTarget(["planned", "completed"], 1)).toBe(0);
    expect(advanceTarget(["planned", "skipped", "completed"], 2)).toBe(0);
  });

  test("aucune quand la journée est bouclée", () => {
    expect(advanceTarget(["completed", "skipped"], 1)).toBeNull();
    expect(advanceTarget(["completed"], 0)).toBeNull();
  });
});
