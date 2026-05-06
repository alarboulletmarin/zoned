import { describe, expect, test, beforeEach } from "bun:test";

import {
  CYCLING_PROFILE_KEY,
  SWIMMING_PROFILE_KEY,
  COMMUTE_PATTERN_KEY,
  createEmptyCyclingProfile,
  createEmptySwimmingProfile,
  validateCyclingProfile,
  validateSwimmingProfile,
  validateCommutePattern,
  saveCyclingProfile,
  loadCyclingProfile,
  saveSwimmingProfile,
  loadSwimmingProfile,
  saveCommutePattern,
  loadCommutePattern,
  updateCyclingBaseData,
  updateSwimmingBaseData,
  loadAthleteProfile,
  hasCrossTrainingData,
} from "./athleteProfile";

// ── Minimal localStorage shim for bun test (jsdom-free) ────────────
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

// Install once; Bun reuses the same globalThis between tests.
if (typeof (globalThis as { localStorage?: Storage }).localStorage === "undefined") {
  (globalThis as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
}

beforeEach(() => {
  localStorage.clear();
});

describe("validateCyclingProfile", () => {
  test("drops out-of-range FTP", () => {
    const profile = createEmptyCyclingProfile();
    profile.ftpWatts = 1000;
    const validated = validateCyclingProfile(profile);
    expect(validated.ftpWatts).toBeUndefined();
  });

  test("keeps plausible FTP", () => {
    const profile = createEmptyCyclingProfile();
    profile.ftpWatts = 240;
    const validated = validateCyclingProfile(profile);
    expect(validated.ftpWatts).toBe(240);
  });

  test("filters malformed benchmarks", () => {
    const profile = createEmptyCyclingProfile();
    profile.benchmarks = [
      { id: "", type: "ftp_test_20min", date: "2026-01-01", result: 250 },
      { id: "ok", type: "ftp_test_20min", date: "2026-01-01", result: 250 },
      { id: "bad", type: "ftp_test_20min", date: "2026-01-01", result: -1 },
    ];
    const validated = validateCyclingProfile(profile);
    expect(validated.benchmarks).toHaveLength(1);
    expect(validated.benchmarks[0].id).toBe("ok");
  });
});

describe("validateSwimmingProfile", () => {
  test("drops invalid pool length", () => {
    const profile = createEmptySwimmingProfile();
    profile.preferredPoolLength = 33 as unknown as 25 | 50;
    const validated = validateSwimmingProfile(profile);
    expect(validated.preferredPoolLength).toBeUndefined();
  });

  test("drops unrealistic CSS", () => {
    const profile = createEmptySwimmingProfile();
    profile.cssSecPer100m = 10;
    const validated = validateSwimmingProfile(profile);
    expect(validated.cssSecPer100m).toBeUndefined();
  });
});

describe("validateCommutePattern", () => {
  test("rejects unknown discipline", () => {
    expect(
      validateCommutePattern({
        version: 1,
        discipline: "swimming" as unknown as "cycling",
        daysOfWeek: [0, 1],
        durationMin: 30,
        includeInPlan: true,
        updatedAt: "",
      }),
    ).toBeNull();
  });

  test("dedupes and sorts days of week", () => {
    const pattern = validateCommutePattern({
      version: 1,
      discipline: "cycling",
      daysOfWeek: [4, 1, 1, 3, 9],
      durationMin: 25,
      includeInPlan: false,
      updatedAt: "",
    });
    expect(pattern).not.toBeNull();
    expect(pattern!.daysOfWeek).toEqual([1, 3, 4]);
  });

  test("rejects empty days of week", () => {
    expect(
      validateCommutePattern({
        version: 1,
        discipline: "cycling",
        daysOfWeek: [],
        durationMin: 30,
        includeInPlan: true,
        updatedAt: "",
      }),
    ).toBeNull();
  });
});

describe("save/load round-trips", () => {
  test("cycling profile persists under the expected key", () => {
    const profile = createEmptyCyclingProfile();
    profile.ftpWatts = 250;
    expect(saveCyclingProfile(profile)).toBe(true);

    const raw = localStorage.getItem(CYCLING_PROFILE_KEY);
    expect(raw).not.toBeNull();

    const loaded = loadCyclingProfile();
    expect(loaded?.ftpWatts).toBe(250);
  });

  test("swimming profile persists under the expected key", () => {
    const profile = createEmptySwimmingProfile();
    profile.cssSecPer100m = 95;
    profile.preferredPoolLength = 25;
    expect(saveSwimmingProfile(profile)).toBe(true);

    const raw = localStorage.getItem(SWIMMING_PROFILE_KEY);
    expect(raw).not.toBeNull();

    const loaded = loadSwimmingProfile();
    expect(loaded?.cssSecPer100m).toBe(95);
    expect(loaded?.preferredPoolLength).toBe(25);
  });

  test("commute pattern persists under the expected key", () => {
    expect(
      saveCommutePattern({
        version: 1,
        discipline: "cycling",
        daysOfWeek: [0, 2, 4],
        durationMin: 30,
        includeInPlan: true,
        updatedAt: "",
      }),
    ).toBe(true);
    expect(localStorage.getItem(COMMUTE_PATTERN_KEY)).not.toBeNull();
    const loaded = loadCommutePattern();
    expect(loaded?.daysOfWeek).toEqual([0, 2, 4]);
    expect(loaded?.includeInPlan).toBe(true);
  });

  test("updateCyclingBaseData merges into existing profile", () => {
    updateCyclingBaseData({ ftpWatts: 220 });
    updateCyclingBaseData({ fcMax: 185 });
    const loaded = loadCyclingProfile();
    expect(loaded?.ftpWatts).toBe(220);
    expect(loaded?.fcMax).toBe(185);
  });

  test("updateSwimmingBaseData merges into existing profile", () => {
    updateSwimmingBaseData({ cssSecPer100m: 90 });
    updateSwimmingBaseData({ preferredPoolLength: 50 });
    const loaded = loadSwimmingProfile();
    expect(loaded?.cssSecPer100m).toBe(90);
    expect(loaded?.preferredPoolLength).toBe(50);
  });
});

describe("loadAthleteProfile", () => {
  test("returns empty profile when nothing is stored", () => {
    const profile = loadAthleteProfile();
    expect(profile.version).toBe(1);
    expect(profile.running).toBeNull();
    expect(profile.cycling).toBeNull();
    expect(profile.swimming).toBeNull();
    expect(profile.commute).toBeNull();
    expect(hasCrossTrainingData(profile)).toBe(false);
  });

  test("assembles cycling and swimming sections when stored", () => {
    updateCyclingBaseData({ ftpWatts: 240 });
    updateSwimmingBaseData({ cssSecPer100m: 100 });
    const profile = loadAthleteProfile();
    expect(profile.cycling?.ftpWatts).toBe(240);
    expect(profile.swimming?.cssSecPer100m).toBe(100);
    expect(hasCrossTrainingData(profile)).toBe(true);
  });
});
