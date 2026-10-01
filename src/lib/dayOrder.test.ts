import { describe, expect, test } from "bun:test";

import { dayStep, staysInPlace } from "./dayOrder";

/** Lundi : 0 1 2, mercredi : 3. */
const week = [{ dayOfWeek: 0 }, { dayOfWeek: 0 }, { dayOfWeek: 0 }, { dayOfWeek: 2 }];

describe("monter ou descendre d'un cran dans la journée", () => {
  test("monter se place devant la séance qui précède", () => {
    expect(dayStep(week, 2, "up")).toEqual({ before: 1 });
    expect(dayStep(week, 1, "up")).toEqual({ before: 0 });
  });

  test("la première ne monte pas", () => {
    expect(dayStep(week, 0, "up")).toBeNull();
  });

  test("descendre se place devant la séance d'après la suivante", () => {
    expect(dayStep(week, 0, "down")).toEqual({ before: 2 });
  });

  test("l'avant-dernière descend en fin de journée, sans repère", () => {
    expect(dayStep(week, 1, "down")).toEqual({ before: undefined });
  });

  test("la dernière ne descend pas, et seule dans sa journée on ne bouge pas", () => {
    expect(dayStep(week, 2, "down")).toBeNull();
    expect(dayStep(week, 3, "up")).toBeNull();
    expect(dayStep(week, 3, "down")).toBeNull();
  });

  test("une séance qui n'existe pas ne va nulle part", () => {
    expect(dayStep(week, 9, "up")).toBeNull();
  });
});

describe("déposer une séance sans rien changer", () => {
  test("devant elle-même ou devant sa voisine, elle reste où elle est", () => {
    expect(staysInPlace(week, 1, 0, 1)).toBe(true);
    expect(staysInPlace(week, 1, 0, 2)).toBe(true);
  });

  test("la dernière de sa journée reste en fin de journée", () => {
    expect(staysInPlace(week, 2, 0, undefined)).toBe(true);
  });

  test("devant une séance plus haut, ou en fin de journée pour une autre, elle bouge", () => {
    expect(staysInPlace(week, 2, 0, 0)).toBe(false);
    expect(staysInPlace(week, 0, 0, undefined)).toBe(false);
  });

  test("changer de jour bouge toujours", () => {
    expect(staysInPlace(week, 0, 1, undefined)).toBe(false);
  });
});
