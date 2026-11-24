import { describe, expect, test } from "bun:test";
import { formatPaceDisplay, formatSplitTime, generateSplits } from "./splits";

describe("splits", () => {
  test("rounds before formatting minutes and hours", () => {
    expect(formatSplitTime(59.8)).toBe("1:00");
    expect(formatSplitTime(3599.8)).toBe("1:00:00");
    expect(formatPaceDisplay(3 + 59.8 / 60)).toBe("4:00");
  });

  for (const strategy of ["even", "negative", "positive"] as const) {
    for (const km of [0.5, 5, 21.1, 42.195]) {
      test(`${strategy} over ${km} km keeps pace, distance and goal consistent`, () => {
        const rows = generateSplits(km, 10000, strategy);
        expect(rows.reduce((sum, row) => sum + row.distance, 0)).toBeCloseTo(km, 8);
        expect(rows.reduce((sum, row) => sum + row.splitTimeSeconds, 0)).toBeCloseTo(10000, 8);
        for (const row of rows) {
          expect(row.splitTimeSeconds).toBeCloseTo(row.paceMinPerKm * 60 * row.distance, 8);
        }
        if (rows.length > 1 && strategy !== "even") {
          const ratio = rows.at(-1)!.paceMinPerKm / rows[0].paceMinPerKm;
          expect(ratio).toBeCloseTo(strategy === "negative" ? 0.98 / 1.02 : 1.02 / 0.98, 8);
        }
      });
    }
  }
});
