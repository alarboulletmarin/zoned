export const BACKUP_STORAGE_KEYS = [
  "zoned-plans",
  "zoned-today",
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
  "zoned-storage-warning-seen",
  "zoned-runner-profile",
  "zoned-cycling-profile",
  "zoned-swimming-profile",
  "zoned-commute-pattern",
  "zoned-activities",
] as const;

export type BackupStorageKey = typeof BACKUP_STORAGE_KEYS[number];
export type RestoreMode = "merge" | "replace";

/** Version du format de sauvegarde écrite par cette build. */
export const BACKUP_VERSION = 2;

/**
 * Réglages propres à un appareil : thème, langue, barre latérale repliée,
 * dernière version vue, avertissement de stockage. La synchro par QR ne les
 * envoie pas et ne les touche pas chez le récepteur, sinon un téléphone en
 * mode sombre passerait le poste de bureau en sombre.
 */
export const DEVICE_ONLY_KEYS = [
  "zoned-theme",
  "zoned-language",
  "zoned-sidebar-collapsed",
  "zoned-last-seen-version",
  "zoned-storage-warning-seen",
] as const satisfies readonly BackupStorageKey[];

/** Les clés que la synchro par QR envoie et remplace. */
export const SYNC_STORAGE_KEYS: readonly BackupStorageKey[] = BACKUP_STORAGE_KEYS.filter(
  (key) => !(DEVICE_ONLY_KEYS as readonly string[]).includes(key),
);

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

export function buildBackupData(
  readValue: (key: BackupStorageKey) => string | null,
  keys: readonly BackupStorageKey[] = BACKUP_STORAGE_KEYS,
): BackupData {
  const data: Record<string, unknown> = {};

  for (const key of keys) {
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
      version: BACKUP_VERSION,
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
  keys: readonly BackupStorageKey[] = BACKUP_STORAGE_KEYS,
): Partial<Record<BackupStorageKey, string>> {
  const snapshot: Partial<Record<BackupStorageKey, string>> = mode === "merge"
    ? { ...currentManagedEntries }
    : {};

  for (const key of keys) {
    if (!(key in importedEntries)) continue;
    snapshot[key] = serializeStorageValue(importedEntries[key]);
  }

  return snapshot;
}

/**
 * Écrit une sauvegarde dans le stockage, tout ou rien : si une écriture échoue
 * (quota plein), chaque clé gérée retrouve sa valeur d'avant et l'erreur est
 * relancée pour que l'appelant la dise.
 *
 * `keys` borne ce qui est lu, effacé (mode `replace`) et écrit : l'import d'un
 * fichier passe toutes les clés, la synchro par QR laisse les réglages
 * d'appareil en paix.
 */
export function restoreBackup(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  importedEntries: Record<string, unknown>,
  mode: RestoreMode,
  keys: readonly BackupStorageKey[] = BACKUP_STORAGE_KEYS,
): void {
  const previous = new Map<BackupStorageKey, string | null>();
  for (const key of keys) previous.set(key, storage.getItem(key));

  const current: Partial<Record<BackupStorageKey, string>> = {};
  for (const [key, value] of previous) {
    if (value !== null) current[key] = value;
  }
  const snapshot = buildManagedStorageSnapshot(current, importedEntries, mode, keys);

  try {
    if (mode === "replace") {
      for (const key of keys) storage.removeItem(key);
    }
    for (const [key, value] of Object.entries(snapshot)) {
      if (typeof value !== "string") continue;
      storage.setItem(key, value);
    }
  } catch (err) {
    for (const [key, value] of previous) {
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        // Retour arrière au mieux : une clé rétive ne doit pas arrêter les autres.
      }
    }
    throw err;
  }
}
