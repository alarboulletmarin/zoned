import { describe, expect, test } from "bun:test";

import {
  BACKUP_STORAGE_KEYS,
  buildManagedStorageSnapshot,
  parseBackupData,
} from "./backup";

describe("BACKUP_STORAGE_KEYS", () => {
  test("includes saved race simulations in full backups", () => {
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-race-simulations");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-planViewMode");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-whatif-scenarios");
  });
});

describe("buildManagedStorageSnapshot", () => {
  test("merge preserves existing managed keys not present in backup", () => {
    const snapshot = buildManagedStorageSnapshot(
      {
        "zoned-plans": JSON.stringify([{ id: "local" }]),
        "zoned-theme": JSON.stringify("dark"),
      },
      {
        "zoned-plans": [{ id: "backup" }],
      },
      "merge",
    );

    expect(snapshot["zoned-plans"]).toBe(JSON.stringify([{ id: "backup" }]));
    expect(snapshot["zoned-theme"]).toBe(JSON.stringify("dark"));
  });

  test("replace drops managed keys absent from the backup", () => {
    const snapshot = buildManagedStorageSnapshot(
      {
        "zoned-plans": JSON.stringify([{ id: "local" }]),
        "zoned-theme": JSON.stringify("dark"),
      },
      {
        "zoned-plans": [{ id: "backup" }],
      },
      "replace",
    );

    expect(snapshot["zoned-plans"]).toBe(JSON.stringify([{ id: "backup" }]));
    expect(snapshot["zoned-theme"]).toBeUndefined();
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
