import { describe, expect, test } from "bun:test";

import {
  ACTIVITY_DISCIPLINES,
  ACTIVITY_DISCIPLINE_META,
  ACTIVITY_PURPOSES,
  coercePurpose,
  purposeLabelKey,
  purposesFor,
} from "./activity";

/**
 * Le motif d'une activité dépend de sa discipline : on ne va pas au travail
 * à la nage. Ces tests gardent la règle, parce que le formulaire l'affichait
 * à l'envers, vélotaf sous natation, sans que rien ne le dise.
 */
describe("purposesFor", () => {
  test("une discipline avec laquelle on se déplace porte les trois motifs", () => {
    expect(purposesFor("cycling")).toEqual(ACTIVITY_PURPOSES);
    expect(purposesFor("running")).toEqual(ACTIVITY_PURPOSES);
    expect(purposesFor("other")).toEqual(ACTIVITY_PURPOSES);
  });

  test("la natation ne connaît que l'entraînement", () => {
    expect(purposesFor("swimming")).toEqual(["training"]);
  });

  test("l'entraînement vaut pour toute discipline", () => {
    for (const discipline of ACTIVITY_DISCIPLINES) {
      expect(purposesFor(discipline)).toContain("training");
    }
  });

  test("suit la table des disciplines et rien d'autre", () => {
    for (const discipline of ACTIVITY_DISCIPLINES) {
      const expected = ACTIVITY_DISCIPLINE_META[discipline].travel ? 3 : 1;
      expect(purposesFor(discipline)).toHaveLength(expected);
    }
  });
});

describe("coercePurpose", () => {
  test("laisse un motif qui a un sens", () => {
    expect(coercePurpose("cycling", "commute")).toBe("commute");
    expect(coercePurpose("running", "transport")).toBe("transport");
    expect(coercePurpose("swimming", "training")).toBe("training");
  });

  test("ramène un déplacement à la nage sur l'entraînement", () => {
    expect(coercePurpose("swimming", "commute")).toBe("training");
    expect(coercePurpose("swimming", "transport")).toBe("training");
  });
});

describe("purposeLabelKey", () => {
  test("le vélotaf est un mot de vélo", () => {
    expect(purposeLabelKey("cycling", "commute")).toBe("commuteCycling");
  });

  test("les autres disciplines gardent le mot générique", () => {
    expect(purposeLabelKey("running", "commute")).toBe("commute");
    expect(purposeLabelKey("other", "commute")).toBe("commute");
  });

  test("les autres motifs ne changent pas de mot", () => {
    expect(purposeLabelKey("cycling", "transport")).toBe("transport");
    expect(purposeLabelKey("cycling", "training")).toBe("training");
    expect(purposeLabelKey("swimming", "training")).toBe("training");
  });
});
