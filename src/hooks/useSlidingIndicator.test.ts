import { describe, expect, test } from "bun:test";
import { indicatorBox } from "./useSlidingIndicator";

describe("indicatorBox", () => {
  test("rien de choisi, pas d'indicateur", () => {
    expect(indicatorBox(null)).toBeNull();
    expect(indicatorBox(undefined)).toBeNull();
  });

  test("la boîte de l'élément choisi, dans le repère du conteneur", () => {
    expect(indicatorBox({ offsetLeft: 97, offsetTop: 4, offsetWidth: 95, offsetHeight: 40 })).toEqual({
      x: 97,
      y: 4,
      w: 95,
      h: 40,
    });
  });

  test("une rangée qui passe à la ligne garde la hauteur de la ligne choisie", () => {
    expect(indicatorBox({ offsetLeft: 0, offsetTop: 47, offsetWidth: 279, offsetHeight: 43 })?.y).toBe(47);
  });
});
