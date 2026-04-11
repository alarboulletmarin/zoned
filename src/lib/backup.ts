export const BACKUP_STORAGE_KEYS = [
  "zoned-plans",
  "zoned-favorites",
  "zoned-settings",
  "zoned-last-seen-version",
  "zoned-planViewMode",
  "zoned-viewMode",
  "zoned-dismissed-tips",
  "zoned-userZones",
  "zoned-quiz-results",
  "zoned-zone-cta-dismissed",
  "zoned-racechecklist",
  "zoned-theme",
  "zoned-sidebar-collapsed",
  "zoned-language",
  "zoned-custom-workouts",
  "zoned-race-simulations",
  "zoned-whatif-scenarios",
] as const;

export type BackupStorageKey = typeof BACKUP_STORAGE_KEYS[number];
export type RestoreMode = "merge" | "replace";

export interface BackupData {
  _meta: { version: number; app: string; exportedAt: string };
  localStorage: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function serializeStorageValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function buildBackupData(readValue: (key: BackupStorageKey) => string | null): BackupData {
  const data: Record<string, unknown> = {};

  for (const key of BACKUP_STORAGE_KEYS) {
    const value = readValue(key);
    if (value === null) continue;

    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }

  return {
    _meta: {
      version: 2,
      app: "zoned",
      exportedAt: new Date().toISOString(),
    },
    localStorage: data,
  };
}

export function parseBackupData(raw: unknown): BackupData | null {
  if (!isObject(raw) || !isObject(raw._meta) || !isObject(raw.localStorage)) return null;
  if (raw._meta.app !== "zoned") return null;
  if (typeof raw._meta.version !== "number") return null;
  if (typeof raw._meta.exportedAt !== "string") return null;

  return {
    _meta: {
      version: raw._meta.version,
      app: "zoned",
      exportedAt: raw._meta.exportedAt,
    },
    localStorage: raw.localStorage,
  };
}

export function buildManagedStorageSnapshot(
  currentManagedEntries: Partial<Record<BackupStorageKey, string>>,
  importedEntries: Record<string, unknown>,
  mode: RestoreMode,
): Partial<Record<BackupStorageKey, string>> {
  const snapshot: Partial<Record<BackupStorageKey, string>> = mode === "merge"
    ? { ...currentManagedEntries }
    : {};

  for (const key of BACKUP_STORAGE_KEYS) {
    if (!(key in importedEntries)) continue;
    snapshot[key] = serializeStorageValue(importedEntries[key]);
  }

  return snapshot;
}
