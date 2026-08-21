export const BACKUP_STORAGE_KEYS = [
  "zoned-plans",
  "zoned-favorites",
  "zoned-settings",
  "zoned-last-seen-version",
  "zoned-planViewMode",
  "zoned-viewMode",
  "zoned-dismissed-tips",
  "zoned-userZones",
  "zoned-zone-cta-dismissed",
  "zoned-racechecklist",
  "zoned-theme",
  "zoned-sidebar-collapsed",
  "zoned-language",
  "zoned-custom-workouts",
  "zoned-race-simulations",
  "zoned-whatif-scenarios",
  "zoned-storage-warning-seen",
  "zoned-runner-profile",
  "zoned-cycling-profile",
  "zoned-swimming-profile",
  "zoned-commute-pattern",
  "zoned-routes",
] as const;

export type BackupStorageKey = typeof BACKUP_STORAGE_KEYS[number];

/** Per-key decision taken on the import conflict screen. */
export type ImportChoice = "keep" | "replace";

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

export interface ImportDiff {
  /** Managed keys stored locally *and* in the file, with a different value:
   *  the only ones the user has to arbitrate. */
  conflicts: BackupStorageKey[];
  /** Managed keys only the file carries — simply added, nothing to decide. */
  additions: BackupStorageKey[];
  /** Managed keys the file carries with the exact same value as locally. */
  identical: BackupStorageKey[];
}

/** Compares a parsed backup against what this device already stores, at the
 *  granularity of one managed key (favourites, zones, plans, …) — never
 *  inside a key. Keys stored locally but absent from the file are not
 *  reported: an import never removes them. */
export function computeImportDiff(
  currentManagedEntries: Partial<Record<BackupStorageKey, string>>,
  importedEntries: Record<string, unknown>,
): ImportDiff {
  const diff: ImportDiff = { conflicts: [], additions: [], identical: [] };

  for (const key of BACKUP_STORAGE_KEYS) {
    if (!(key in importedEntries)) continue;
    const current = currentManagedEntries[key];
    if (current === undefined) {
      diff.additions.push(key);
    } else if (current === serializeStorageValue(importedEntries[key])) {
      diff.identical.push(key);
    } else {
      diff.conflicts.push(key);
    }
  }

  return diff;
}

/** The managed entries an import must actually write: every key the file
 *  carries, minus the conflicts the user chose to keep. Keys the file does
 *  not carry are left untouched. */
export function resolveImportWrites(
  currentManagedEntries: Partial<Record<BackupStorageKey, string>>,
  importedEntries: Record<string, unknown>,
  choices: Partial<Record<BackupStorageKey, ImportChoice>>,
): Partial<Record<BackupStorageKey, string>> {
  const writes: Partial<Record<BackupStorageKey, string>> = {};

  for (const key of BACKUP_STORAGE_KEYS) {
    if (!(key in importedEntries)) continue;
    const isConflict = currentManagedEntries[key] !== undefined;
    if (isConflict && choices[key] === "keep") continue;
    writes[key] = serializeStorageValue(importedEntries[key]);
  }

  return writes;
}

/** Removes every key this app manages in localStorage — the "Tout effacer" action. */
export function clearAllManagedStorage(removeValue: (key: BackupStorageKey) => void): void {
  for (const key of BACKUP_STORAGE_KEYS) {
    removeValue(key);
  }
}

/**
 * Whether `localStorage` actually accepts writes in this context. Private
 * browsing in some engines (older Safari) and a full quota both throw on
 * `setItem` even though `localStorage` itself is defined.
 */
export function isLocalStorageAvailable(): boolean {
  const probeKey = "zoned-storage-probe";
  try {
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}
