import { describe, expect, test } from "bun:test";
import {
  computeStorageKeyStats,
  computeGroupTotals,
  totalBytes,
  totalObjects,
  presentKeyCount,
  formatStorageSize,
} from "@/lib/storageInventory";

describe("computeStorageKeyStats", () => {
  test("marks absent keys with zero weight", () => {
    const stats = computeStorageKeyStats(() => null);
    expect(stats.every((s) => !s.present && s.bytes === 0 && s.objectCount === 0)).toBe(true);
  });

  test("counts array entries as objects and sums real byte size", () => {
    const store: Record<string, string> = {
      "zoned-favorites": JSON.stringify(["A", "B", "C"]),
      "zoned-runner-profile": JSON.stringify({ vma: 16.5 }),
    };
    const stats = computeStorageKeyStats((key) => store[key] ?? null);

    const favorites = stats.find((s) => s.key === "zoned-favorites")!;
    expect(favorites.present).toBe(true);
    expect(favorites.objectCount).toBe(3);
    expect(favorites.bytes).toBe(new TextEncoder().encode(store["zoned-favorites"]).length);

    const profile = stats.find((s) => s.key === "zoned-runner-profile")!;
    expect(profile.objectCount).toBe(1);
  });

  test("falls back to a byte count for unparseable values without throwing", () => {
    const stats = computeStorageKeyStats((key) =>
      key === "zoned-theme" ? "dark" : null
    );
    const theme = stats.find((s) => s.key === "zoned-theme")!;
    expect(theme.present).toBe(true);
    expect(theme.bytes).toBe(4);
  });
});

describe("computeGroupTotals / totals", () => {
  test("groups bytes by category and totals match the sum of per-key stats", () => {
    const store: Record<string, string> = {
      "zoned-custom-workouts": JSON.stringify([{ id: "CUSTOM-1" }, { id: "CUSTOM-2" }]),
      "zoned-favorites": JSON.stringify(["A"]),
    };
    const stats = computeStorageKeyStats((key) => store[key] ?? null);
    const totals = computeGroupTotals(stats);

    expect(totals.workouts).toBeGreaterThan(0);
    expect(totals.profile).toBeGreaterThan(0);
    expect(totals.plans).toBe(0);

    const sumOfGroups = Object.values(totals).reduce((a, b) => a + b, 0);
    expect(sumOfGroups).toBe(totalBytes(stats));
  });

  test("totalObjects and presentKeyCount reflect only present keys", () => {
    const store: Record<string, string> = {
      "zoned-favorites": JSON.stringify(["A", "B"]),
    };
    const stats = computeStorageKeyStats((key) => store[key] ?? null);
    expect(presentKeyCount(stats)).toBe(1);
    expect(totalObjects(stats)).toBe(2);
  });
});

describe("formatStorageSize", () => {
  test("stays in octets under 1000 bytes", () => {
    expect(formatStorageSize(412)).toBe("412 o");
  });

  test("switches to ko above 1000 bytes with one decimal", () => {
    expect(formatStorageSize(1234)).toBe("1.2 ko");
  });
});
