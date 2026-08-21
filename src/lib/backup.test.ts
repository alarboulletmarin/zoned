import { describe, expect, test } from "bun:test";

import {
  BACKUP_STORAGE_KEYS,
  computeImportDiff,
  parseBackupData,
  resolveImportWrites,
} from "./backup";

describe("BACKUP_STORAGE_KEYS", () => {
  test("includes saved race simulations in full backups", () => {
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-race-simulations");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-planViewMode");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-whatif-scenarios");
  });

  test("includes multi-discipline profile keys", () => {
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-runner-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-cycling-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-swimming-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-commute-pattern");
  });
});

describe("computeImportDiff", () => {
  test("splits imported keys into conflicts, additions and identical", () => {
    const diff = computeImportDiff(
      {
        "zoned-plans": JSON.stringify([{ id: "local" }]),
        "zoned-favorites": JSON.stringify(["a"]),
        "zoned-theme": JSON.stringify("dark"),
      },
      {
        "zoned-plans": [{ id: "backup" }],
        "zoned-favorites": ["a"],
        "zoned-custom-workouts": [{ id: "w1" }],
      },
    );

    expect(diff.conflicts).toEqual(["zoned-plans"]);
    expect(diff.additions).toEqual(["zoned-custom-workouts"]);
    expect(diff.identical).toEqual(["zoned-favorites"]);
  });

  test("ignores local keys the file does not carry and unmanaged file keys", () => {
    const diff = computeImportDiff(
      { "zoned-theme": JSON.stringify("dark") },
      { "some-other-app-key": 1 },
    );

    expect(diff.conflicts).toEqual([]);
    expect(diff.additions).toEqual([]);
    expect(diff.identical).toEqual([]);
  });
});

describe("resolveImportWrites", () => {
  test("writes additions and replaced conflicts, skips kept conflicts", () => {
    const writes = resolveImportWrites(
      {
        "zoned-plans": JSON.stringify([{ id: "local" }]),
        "zoned-favorites": JSON.stringify(["a"]),
      },
      {
        "zoned-plans": [{ id: "backup" }],
        "zoned-favorites": ["b"],
        "zoned-custom-workouts": [{ id: "w1" }],
      },
      { "zoned-plans": "keep", "zoned-favorites": "replace" },
    );

    expect(writes["zoned-plans"]).toBeUndefined();
    expect(writes["zoned-favorites"]).toBe(JSON.stringify(["b"]));
    expect(writes["zoned-custom-workouts"]).toBe(JSON.stringify([{ id: "w1" }]));
  });

  test("never touches managed keys the file does not carry", () => {
    const writes = resolveImportWrites(
      { "zoned-theme": JSON.stringify("dark") },
      { "zoned-plans": [] },
      {},
    );

    expect("zoned-theme" in writes).toBe(false);
    expect(writes["zoned-plans"]).toBe("[]");
  });

  test("defaults an unanswered conflict to replacing", () => {
    const writes = resolveImportWrites(
      { "zoned-plans": JSON.stringify([{ id: "local" }]) },
      { "zoned-plans": [{ id: "backup" }] },
      {},
    );

    expect(writes["zoned-plans"]).toBe(JSON.stringify([{ id: "backup" }]));
  });
});

describe("parseBackupData", () => {
  test("accepts valid zoned backup payloads", () => {
    const parsed = parseBackupData({
      _meta: { version: 2, app: "zoned", exportedAt: "2026-01-01T00:00:00.000Z" },
      localStorage: { "zoned-plans": [] },
    });

    expect(parsed).not.toBeNull();
  });

  test("rejects invalid payloads", () => {
    expect(parseBackupData({ _meta: { app: "other" }, localStorage: {} })).toBeNull();
  });
});
