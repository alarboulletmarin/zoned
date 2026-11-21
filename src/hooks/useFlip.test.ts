import { describe, expect, test } from "bun:test";
import { flipDelta } from "./useFlip";

describe("flipDelta", () => {
  test("renvoie le chemin inverse du déplacement", () => {
    expect(flipDelta({ x: 0, y: 100 }, { x: 0, y: 40 })).toEqual({ x: 0, y: 60 });
  });
  test("null quand l'élément n'a pas bougé", () => {
    expect(flipDelta({ x: 0, y: 10 }, { x: 0, y: 10.2 })).toBeNull();
  });
  test("null pour un élément nouveau", () => {
    expect(flipDelta(undefined, { x: 0, y: 0 })).toBeNull();
  });
});
