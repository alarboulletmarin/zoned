/**
 * Saved weeks store for "Ma semaine" (Epic #83, issue #92).
 *
 * A lightweight localStorage CRUD, intentionally separate from the training
 * plan storage (planStorage.ts): saved weeks are disposable, generator-made
 * snapshots, not full periodised plans. Future work (#94) can add categories
 * and prebuilt template weeks on top of this shape.
 */

import type { GeneratedWeek } from "@/types/week";

const STORAGE_KEY = "zoned-saved-weeks";

export interface SavedWeek {
  id: string;
  name: string;
  savedAt: string;
  week: GeneratedWeek;
}

function read(): SavedWeek[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedWeek[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(weeks: SavedWeek[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
  } catch {
    /* storage unavailable or full (non-critical) */
  }
}

/** Newest first. */
export function listSavedWeeks(): SavedWeek[] {
  return read().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveWeek(week: GeneratedWeek, name?: string): SavedWeek {
  const entry: SavedWeek = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || defaultName(week),
    savedAt: new Date().toISOString(),
    week,
  };
  write([entry, ...read()]);
  return entry;
}

export function deleteSavedWeek(id: string): void {
  write(read().filter((w) => w.id !== id));
}

/** A readable fallback name, e.g. "4 séances · 6 h". */
function defaultName(week: GeneratedWeek): string {
  const sessions = week.slots.filter((s) => s.workout).length;
  return `${sessions} × ${week.settings.targetVolumeH} h`;
}
