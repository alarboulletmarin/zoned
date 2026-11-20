import { describe, expect, mock, test } from "bun:test";

mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { formatDurationMinutes } = await import("./transforms");

const NBSP = " ";
const n = (s: string) => s.replace(/ /g, NBSP);

describe("formatDurationMinutes", () => {
  test("minutes rondes", () => {
    expect(formatDurationMinutes(37)).toBe(n("37 min"));
    expect(formatDurationMinutes(5)).toBe(n("5 min"));
  });

  test("minutes et secondes", () => {
    expect(formatDurationMinutes(22.5)).toBe(n("22 min 30"));
    expect(formatDurationMinutes(1 + 5 / 60)).toBe(n("1 min 05"));
  });

  test("heures", () => {
    expect(formatDurationMinutes(65)).toBe(n("1 h 05"));
    expect(formatDurationMinutes(60)).toBe(n("1 h"));
    expect(formatDurationMinutes(125)).toBe(n("2 h 05"));
  });

  test("secondes", () => {
    expect(formatDurationMinutes(0.5)).toBe(n("30 s"));
  });

  test("zéro s'écrit 0, sans unité", () => {
    expect(formatDurationMinutes(0)).toBe("0");
    expect(formatDurationMinutes(Number.NaN)).toBe("0");
    expect(formatDurationMinutes(-3)).toBe("0");
  });

  test("les exemples de référence", () => {
    expect(formatDurationMinutes(2.5)).toBe(n("2 min 30"));
    expect(formatDurationMinutes(200)).toBe(n("3 h 20"));
    expect(formatDurationMinutes(120)).toBe(n("2 h"));
  });

  test("l'arrondi ne déborde pas", () => {
    expect(formatDurationMinutes(59.9999)).toBe(n("1 h"));
    expect(formatDurationMinutes(0.9999)).toBe(n("1 min"));
  });

  test("espace insécable, jamais une espace ordinaire", () => {
    expect(formatDurationMinutes(22.5)).not.toContain(" ");
    expect(formatDurationMinutes(22.5)).toContain(NBSP);
  });

  test("une seule forme, plus de variante serrée", () => {
    // La forme sans espace (37min, 1h05) servait aux cartes de partage :
    // elle se lisait comme une coquille, elle est retirée.
    expect(formatDurationMinutes.length).toBe(1);
  });
});
