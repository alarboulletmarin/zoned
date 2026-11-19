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

  test("zéro est zéro minute", () => {
    expect(formatDurationMinutes(0)).toBe(n("0 min"));
    expect(formatDurationMinutes(Number.NaN)).toBe(n("0 min"));
  });

  test("l'arrondi ne déborde pas", () => {
    expect(formatDurationMinutes(59.9999)).toBe(n("1 h"));
    expect(formatDurationMinutes(0.9999)).toBe(n("1 min"));
  });

  test("espace insécable, jamais une espace ordinaire", () => {
    expect(formatDurationMinutes(22.5)).not.toContain(" ");
    expect(formatDurationMinutes(22.5)).toContain(NBSP);
  });

  test("forme compacte pour les surfaces peintes", () => {
    const c = { compact: true };
    expect(formatDurationMinutes(37, c)).toBe("37min");
    expect(formatDurationMinutes(22.5, c)).toBe("22min30");
    expect(formatDurationMinutes(65, c)).toBe("1h05");
    expect(formatDurationMinutes(60, c)).toBe("1h");
    expect(formatDurationMinutes(0.5, c)).toBe("30s");
  });
});
