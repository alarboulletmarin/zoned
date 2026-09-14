import { describe, expect, test, beforeEach } from "bun:test";

import {
  ACTIVITY_STORAGE_KEY,
  activitiesBetween,
  activitiesOn,
  addActivity,
  deleteActivity,
  getAllActivities,
  updateActivity,
  validateActivity,
} from "./activityStorage";
import type { ActivityDraft } from "@/types/activity";

// ── localStorage minimal pour bun test, sans jsdom ─────────────────
class MemoryStorage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

if (typeof (globalThis as { localStorage?: Storage }).localStorage === "undefined") {
  (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
}

beforeEach(() => {
  localStorage.clear();
});

const commute = (over: Partial<ActivityDraft> = {}): ActivityDraft => ({
  date: "2026-09-14",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 25,
  ...over,
});

describe("validateActivity", () => {
  test("le minimum suffit : une date, une discipline, un motif, une durée", () => {
    const activity = validateActivity({
      id: "a1",
      date: "2026-09-14",
      discipline: "cycling",
      purpose: "commute",
      durationMin: 25,
      createdAt: "2026-09-14T08:00:00.000Z",
    });
    expect(activity).not.toBeNull();
    expect(activity?.durationMin).toBe(25);
    expect(activity?.distanceKm).toBeUndefined();
  });

  test("une date qui n'est pas une date seule est rejetée", () => {
    expect(
      validateActivity({ ...commute(), id: "a1", date: "2026-09-14T08:00:00Z", createdAt: "x" }),
    ).toBeNull();
  });

  test("une durée hors bornes rejette l'entrée entière, elle ne vaut pas zéro", () => {
    expect(validateActivity({ ...commute({ durationMin: 0 }), id: "a1", createdAt: "x" })).toBeNull();
    expect(validateActivity({ ...commute({ durationMin: 5000 }), id: "a1", createdAt: "x" })).toBeNull();
  });

  test("un champ optionnel aberrant tombe, l'entrée survit", () => {
    const activity = validateActivity({
      ...commute({ avgWatts: 5000, elevationGainM: 120 }),
      id: "a1",
      createdAt: "x",
    });
    expect(activity).not.toBeNull();
    expect(activity?.avgWatts).toBeUndefined();
    expect(activity?.elevationGainM).toBe(120);
  });

  test("une discipline ou un motif inconnu est rejeté", () => {
    expect(validateActivity({ ...commute(), discipline: "skiing", id: "a1", createdAt: "x" })).toBeNull();
    expect(validateActivity({ ...commute(), purpose: "fun", id: "a1", createdAt: "x" })).toBeNull();
  });

  test("la note est rognée et une note vide disparaît", () => {
    const long = validateActivity({ ...commute({ note: "x".repeat(400) }), id: "a1", createdAt: "x" });
    expect(long?.note?.length).toBe(280);
    const blank = validateActivity({ ...commute({ note: "   " }), id: "a1", createdAt: "x" });
    expect(blank?.note).toBeUndefined();
  });
});

describe("le journal", () => {
  test("une activité ajoutée se relit", () => {
    const added = addActivity(commute());
    expect(added).not.toBeNull();
    const all = getAllActivities();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(added!.id);
  });

  test("la plus récente d'abord", () => {
    addActivity(commute({ date: "2026-09-10" }));
    addActivity(commute({ date: "2026-09-14" }));
    addActivity(commute({ date: "2026-09-12" }));
    expect(getAllActivities().map((a) => a.date)).toEqual([
      "2026-09-14",
      "2026-09-12",
      "2026-09-10",
    ]);
  });

  test("une entrée corrompue est jetée sans emporter les autres", () => {
    const good = { ...commute(), id: "a1", createdAt: "2026-09-14T08:00:00.000Z" };
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify([good, { id: "nope" }, null]));
    expect(getAllActivities()).toHaveLength(1);
  });

  test("un stockage illisible rend un journal vide, pas une exception", () => {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, "{ pas du json");
    expect(getAllActivities()).toEqual([]);
  });

  test("la modification garde l'identifiant et la date de création", () => {
    const added = addActivity(commute())!;
    const updated = updateActivity(added.id, { ...commute(), durationMin: 40 });
    expect(updated?.id).toBe(added.id);
    expect(updated?.createdAt).toBe(added.createdAt);
    expect(updated?.durationMin).toBe(40);
    expect(getAllActivities()).toHaveLength(1);
  });

  test("modifier une activité inconnue ne crée rien", () => {
    expect(updateActivity("absente", commute())).toBeNull();
    expect(getAllActivities()).toHaveLength(0);
  });

  test("la suppression dit si elle a supprimé", () => {
    const added = addActivity(commute())!;
    expect(deleteActivity("absente")).toBe(false);
    expect(deleteActivity(added.id)).toBe(true);
    expect(getAllActivities()).toHaveLength(0);
  });
});

describe("les filtres de date", () => {
  const list = [
    { date: "2026-09-07" },
    { date: "2026-09-08" },
    { date: "2026-09-14" },
    { date: "2026-09-15" },
  ].map((d, i) => ({
    ...commute(d),
    id: `a${i}`,
    createdAt: "2026-09-01T00:00:00.000Z",
  }));

  test("les bornes sont comprises", () => {
    expect(activitiesBetween(list, "2026-09-08", "2026-09-14").map((a) => a.date)).toEqual([
      "2026-09-08",
      "2026-09-14",
    ]);
  });

  test("un jour isolé", () => {
    expect(activitiesOn(list, "2026-09-14")).toHaveLength(1);
    expect(activitiesOn(list, "2026-09-09")).toHaveLength(0);
  });
});
