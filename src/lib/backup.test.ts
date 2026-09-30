import { describe, expect, test } from "bun:test";

import {
  BACKUP_STORAGE_KEYS,
  SYNC_STORAGE_KEYS,
  buildManagedStorageSnapshot,
  parseBackupData,
  restoreBackup,
} from "./backup";

describe("BACKUP_STORAGE_KEYS", () => {
  test("includes saved race simulations in full backups", () => {
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-race-simulations");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-planViewMode");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-runner-profile");
  });

  test("includes multi-discipline profile keys", () => {
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-runner-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-cycling-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-swimming-profile");
    expect(BACKUP_STORAGE_KEYS).toContain("zoned-commute-pattern");
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

describe("restoreBackup", () => {
  function fakeStorage(initial: Record<string, string>) {
    const map = new Map(Object.entries(initial));
    return {
      map,
      getItem: (k: string) => map.get(k) ?? null,
      removeItem: (k: string) => void map.delete(k),
      setItem: (k: string, v: string) => void map.set(k, v),
    };
  }

  test("replace efface les clés gérées absentes de la sauvegarde", () => {
    const storage = fakeStorage({ "zoned-plans": "[1]", "zoned-favorites": "[2]" });
    restoreBackup(storage, { "zoned-plans": [9] }, "replace");
    expect(storage.map.get("zoned-plans")).toBe("[9]");
    expect(storage.map.has("zoned-favorites")).toBe(false);
  });

  test("avec des clés bornées, les réglages d'appareil restent intacts", () => {
    const storage = fakeStorage({
      "zoned-plans": "[1]",
      "zoned-theme": '"dark"',
      "zoned-language": '"fr"',
    });
    restoreBackup(
      storage,
      { "zoned-plans": [9], "zoned-theme": "light", "zoned-language": "en" },
      "replace",
      SYNC_STORAGE_KEYS,
    );
    expect(storage.map.get("zoned-plans")).toBe("[9]");
    expect(storage.map.get("zoned-theme")).toBe('"dark"');
    expect(storage.map.get("zoned-language")).toBe('"fr"');
  });

  test("une écriture qui échoue remet tout comme avant et relance l'erreur", () => {
    const storage = fakeStorage({ "zoned-plans": "[1]", "zoned-favorites": "[2]" });
    // Le quota lâche une seule fois : le retour arrière, lui, doit pouvoir écrire
    let failed = false;
    const original = storage.setItem;
    storage.setItem = (k, v) => {
      if (k === "zoned-favorites" && !failed) {
        failed = true;
        throw new Error("quota");
      }
      original(k, v);
    };
    expect(() =>
      restoreBackup(storage, { "zoned-plans": [9], "zoned-favorites": [8] }, "replace"),
    ).toThrow("quota");
    expect(storage.map.get("zoned-plans")).toBe("[1]");
    expect(storage.map.get("zoned-favorites")).toBe("[2]");
  });
});
