import { describe, expect, test } from "bun:test";
import { justChangedKeys, newKeys, restoredPositions } from "./useJustChanged";
import { becameDone } from "@/lib/cockpitRail";

describe("justChangedKeys", () => {
  const differs = (a: unknown, b: unknown) => a !== b;

  test("rien au montage : une clé sans avant ne compte pas", () => {
    expect(justChangedKeys(new Map(), [["a", "completed"]], differs)).toEqual([]);
  });

  test("un rechargement à valeur égale ne déclenche rien", () => {
    expect(justChangedKeys(new Map([["a", "planned"]]), [["a", "planned"]], differs)).toEqual([]);
  });

  test("un vrai changement déclenche, sur sa clé seule", () => {
    const before = new Map([
      ["a", "planned"],
      ["b", "planned"],
    ]);
    expect(justChangedKeys(before, [["a", "completed"], ["b", "planned"]], differs)).toEqual(["a"]);
  });

  test("le prédicat filtre le sens du passage : le tampon, pas la réouverture", () => {
    const before = new Map<string, "planned" | "completed" | "skipped" | "modified" | undefined>([
      ["open", "planned"],
      ["undone", "completed"],
      ["skip", undefined],
      ["redo", "skipped"],
    ]);
    const after = [
      ["open", "modified"],
      ["undone", "planned"],
      ["skip", "skipped"],
      ["redo", "completed"],
    ] as const;
    expect(justChangedKeys(before, after, becameDone)).toEqual(["open"]);
  });
});

describe("newKeys", () => {
  test("rien au premier passage", () => {
    expect(newKeys(null, ["a", "b"])).toEqual([]);
  });

  test("une liste vide qui reçoit son premier élément", () => {
    expect(newKeys(new Set(), ["a"])).toEqual(["a"]);
  });

  test("seulement ce qui arrive, pas ce qui part", () => {
    expect(newKeys(new Set(["a", "b"]), ["c", "a"])).toEqual(["c"]);
  });
});

describe("restoredPositions", () => {
  test("une séance remise au milieu : elle seule, même si les autres glissent", () => {
    expect(restoredPositions(["A", "C", "D"], ["A", "B", "C", "D"])).toEqual([1]);
  });

  test("une séance remplacée puis rétablie", () => {
    expect(restoredPositions(["A", "X", "C"], ["A", "B", "C"])).toEqual([1]);
  });

  test("les doublons se comptent : le second exemplaire est le revenu", () => {
    expect(restoredPositions(["A", "B"], ["A", "A", "B"])).toEqual([1]);
  });

  test("rien de nouveau, rien de montré", () => {
    expect(restoredPositions(["A", "B"], ["B", "A"])).toEqual([]);
    expect(restoredPositions([], [])).toEqual([]);
  });
});
