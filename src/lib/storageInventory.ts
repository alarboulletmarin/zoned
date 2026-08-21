/**
 * Real inventory of every localStorage key Zoned manages, built on top of
 * `BACKUP_STORAGE_KEYS` (the same list `backup.ts` exports/imports/wipes).
 * Nothing here is invented: the key names are the actual keys read by
 * `runnerProfile.ts`, `zones.ts`, `useFavorites.tsx`, `planStorage.ts`,
 * `customWorkoutStorage.ts`, `raceSimStorage.ts`, `routeStorage.ts`,
 * `athleteProfile.ts`, `useSettings.tsx` and `theme.ts`.
 */

import { BACKUP_STORAGE_KEYS, type BackupStorageKey } from "@/lib/backup";

/** Coarse grouping used for the "répartition du poids" breakdown. */
export type StorageGroup =
  | "workouts"
  | "plans"
  | "profile"
  | "routes"
  | "scenarios"
  | "settings";

export const STORAGE_GROUP_ORDER: StorageGroup[] = [
  "workouts",
  "plans",
  "profile",
  "routes",
  "scenarios",
  "settings",
];

export const STORAGE_KEY_GROUPS: Record<BackupStorageKey, StorageGroup> = {
  "zoned-custom-workouts": "workouts",
  "zoned-plans": "plans",
  "zoned-runner-profile": "profile",
  "zoned-userZones": "profile",
  "zoned-favorites": "profile",
  "zoned-cycling-profile": "profile",
  "zoned-swimming-profile": "profile",
  "zoned-commute-pattern": "profile",
  "zoned-routes": "routes",
  "zoned-race-simulations": "scenarios",
  "zoned-whatif-scenarios": "scenarios",
  "zoned-settings": "settings",
  "zoned-last-seen-version": "settings",
  "zoned-planViewMode": "settings",
  "zoned-viewMode": "settings",
  "zoned-dismissed-tips": "settings",
  "zoned-zone-cta-dismissed": "settings",
  "zoned-racechecklist": "settings",
  "zoned-theme": "settings",
  "zoned-sidebar-collapsed": "settings",
  "zoned-language": "settings",
  "zoned-storage-warning-seen": "settings",
};

export interface StorageKeyStat {
  key: BackupStorageKey;
  group: StorageGroup;
  /** UTF-8 byte size of the stored value, 0 when the key is absent. */
  bytes: number;
  /** Best-effort count: array length, 1 for a single object, 0 when absent. */
  objectCount: number;
  present: boolean;
}

function countObjects(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") return 1;
  return value === undefined || value === null ? 0 : 1;
}

function byteSize(raw: string): number {
  return new TextEncoder().encode(raw).length;
}

/** Reads every managed key through `readValue` (injected so this stays
 *  testable without a real `localStorage`) and computes its real weight. */
export function computeStorageKeyStats(
  readValue: (key: BackupStorageKey) => string | null
): StorageKeyStat[] {
  return BACKUP_STORAGE_KEYS.map((key) => {
    const raw = readValue(key);
    const group = STORAGE_KEY_GROUPS[key];
    if (raw === null) {
      return { key, group, bytes: 0, objectCount: 0, present: false };
    }
    let objectCount = 1;
    try {
      objectCount = countObjects(JSON.parse(raw));
    } catch {
      objectCount = 1;
    }
    return { key, group, bytes: byteSize(raw), objectCount, present: true };
  });
}

export function computeGroupTotals(
  stats: StorageKeyStat[]
): Record<StorageGroup, number> {
  const totals = Object.fromEntries(
    STORAGE_GROUP_ORDER.map((group) => [group, 0])
  ) as Record<StorageGroup, number>;
  for (const stat of stats) totals[stat.group] += stat.bytes;
  return totals;
}

export function totalBytes(stats: StorageKeyStat[]): number {
  return stats.reduce((sum, s) => sum + s.bytes, 0);
}

export function totalObjects(stats: StorageKeyStat[]): number {
  return stats.reduce((sum, s) => sum + s.objectCount, 0);
}

export function presentKeyCount(stats: StorageKeyStat[]): number {
  return stats.filter((s) => s.present).length;
}

/** "412 o" under 1 ko, "1.2 ko" above — matches how the rest of the app
 *  reads storage sizes (no bytes precision beyond a decimal once in ko). */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} o`;
  return `${(bytes / 1000).toFixed(1)} ko`;
}
