import { describe, expect, test } from "bun:test";

import {
  DURATION_MAX_MIN,
  combineDuration,
  digitsOnly,
  normalizeDuration,
  shouldAdvanceFromHours,
  splitDuration,
} from "./durationFields";

describe("combineDuration", () => {
  test("additionne les deux champs", () => {
    expect(combineDuration({ hours: "1", minutes: "25" })).toBe(85);
  });

  test("un champ vide vaut zéro, pas undefined", () => {
    expect(combineDuration({ hours: "", minutes: "45" })).toBe(45);
    expect(combineDuration({ hours: "2", minutes: "" })).toBe(120);
  });

  test("les deux vides ne donnent aucune durée", () => {
    expect(combineDuration({ hours: "", minutes: "" })).toBeUndefined();
  });

  /* La règle de tolérance : 90 min est une durée, pas une faute de saisie. */
  test("accepte plus de 59 minutes", () => {
    expect(combineDuration({ hours: "", minutes: "90" })).toBe(90);
    expect(combineDuration({ hours: "2", minutes: "90" })).toBe(210);
  });

  test("un zéro explicite reste une valeur", () => {
    expect(combineDuration({ hours: "0", minutes: "30" })).toBe(30);
    expect(combineDuration({ hours: "0", minutes: "0" })).toBe(0);
  });
});

describe("splitDuration", () => {
  test("rend les heures et les minutes", () => {
    expect(splitDuration(85)).toEqual({ hours: "1", minutes: "25" });
  });

  test("moins d'une heure ne remplit pas le champ des heures", () => {
    expect(splitDuration(45)).toEqual({ hours: "", minutes: "45" });
  });

  test("une heure ronde ne remplit pas le champ des minutes", () => {
    expect(splitDuration(120)).toEqual({ hours: "2", minutes: "" });
  });

  test("zéro et les valeurs impossibles donnent deux champs vides", () => {
    expect(splitDuration(0)).toEqual({ hours: "", minutes: "" });
    expect(splitDuration(-10)).toEqual({ hours: "", minutes: "" });
    expect(splitDuration(Number.NaN)).toEqual({ hours: "", minutes: "" });
  });
});

describe("normalizeDuration", () => {
  test("range les minutes qui débordent dans les heures", () => {
    expect(normalizeDuration({ hours: "", minutes: "90" })).toEqual({
      hours: "1",
      minutes: "30",
    });
    expect(normalizeDuration({ hours: "2", minutes: "90" })).toEqual({
      hours: "3",
      minutes: "30",
    });
  });

  test("ne touche pas à une saisie déjà rangée", () => {
    expect(normalizeDuration({ hours: "1", minutes: "25" })).toEqual({
      hours: "1",
      minutes: "25",
    });
  });

  test("plafonne à une journée", () => {
    expect(normalizeDuration({ hours: "48", minutes: "" })).toEqual(
      splitDuration(DURATION_MAX_MIN),
    );
  });

  test("un champ vide le reste", () => {
    expect(normalizeDuration({ hours: "", minutes: "" })).toEqual({
      hours: "",
      minutes: "",
    });
    expect(normalizeDuration({ hours: "0", minutes: "0" })).toEqual({
      hours: "",
      minutes: "",
    });
  });
});

describe("shouldAdvanceFromHours", () => {
  test("attend tant que le champ peut encore grandir", () => {
    expect(shouldAdvanceFromHours("")).toBe(false);
    expect(shouldAdvanceFromHours("1")).toBe(false);
    expect(shouldAdvanceFromHours("2")).toBe(false);
  });

  test("passe au champ suivant quand un second chiffre serait impossible", () => {
    expect(shouldAdvanceFromHours("3")).toBe(true);
    expect(shouldAdvanceFromHours("9")).toBe(true);
  });

  test("passe au champ suivant à deux chiffres", () => {
    expect(shouldAdvanceFromHours("12")).toBe(true);
    expect(shouldAdvanceFromHours("01")).toBe(true);
  });
});

describe("digitsOnly", () => {
  test("ne garde que les chiffres, et pas plus que la longueur demandée", () => {
    expect(digitsOnly("1h25", 2)).toBe("12");
    expect(digitsOnly("-45", 3)).toBe("45");
    expect(digitsOnly("1,5", 2)).toBe("15");
    expect(digitsOnly("abc", 2)).toBe("");
  });
});
