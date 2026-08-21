import { describe, expect, test, beforeEach } from "bun:test";
import {
  calculateAllZones,
  findOverlappingZonePairs,
  saveUserZonePrefs,
  loadUserZonePrefs,
  setZoneOverride,
  clearUserZonePrefs,
} from "@/lib/zones";

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

describe("calculateAllZones with manual overrides", () => {
  test("a zone without an override follows the formula", () => {
    const zones = calculateAllZones({ vma: 16.5 });
    const z4 = zones.find((z) => z.zone === 4)!;
    expect(z4.isManual).toBe(false);
    expect(z4.paceMinPerKm).toBeCloseTo(3.95, 1);
  });

  test("an override replaces the formula's bounds for that zone only", () => {
    const zones = calculateAllZones({
      vma: 16.5,
      zoneOverrides: { 4: { paceMinPerKm: 4.06, paceMaxPerKm: 4.18 } },
    });
    const z4 = zones.find((z) => z.zone === 4)!;
    const z3 = zones.find((z) => z.zone === 3)!;
    expect(z4.isManual).toBe(true);
    expect(z4.paceMinPerKm).toBe(4.06);
    expect(z4.paceMaxPerKm).toBe(4.18);
    expect(z3.isManual).toBe(false);
  });
});

describe("findOverlappingZonePairs", () => {
  test("reports no overlap for clean, ascending zones", () => {
    const zones = calculateAllZones({ vma: 16.5 });
    expect(findOverlappingZonePairs(zones)).toEqual([]);
  });

  test("flags a Z3/Z4 overlap when Z4 is widened into Z3's territory", () => {
    const zones = calculateAllZones({
      vma: 16.5,
      // Z4's slow edge (paceMaxPerKm) now reaches faster than Z3's fast
      // edge (paceMinPerKm) — the two zones now share a pace.
      zoneOverrides: { 4: { paceMinPerKm: 4.0, paceMaxPerKm: 4.9 } },
    });
    const overlaps = findOverlappingZonePairs(zones);
    expect(overlaps).toContainEqual([3, 4]);
  });
});

describe("zone override persistence", () => {
  test("setZoneOverride survives a plain saveUserZonePrefs({ fcMax, vma }) call", () => {
    setZoneOverride(4, { paceMinPerKm: 4.06, paceMaxPerKm: 4.18 });
    saveUserZonePrefs({ fcMax: 186, vma: 16.5 });

    const prefs = loadUserZonePrefs();
    expect(prefs?.fcMax).toBe(186);
    expect(prefs?.zoneOverrides?.[4]).toEqual({ paceMinPerKm: 4.06, paceMaxPerKm: 4.18 });
  });

  test("clearing an override with null removes just that zone", () => {
    setZoneOverride(4, { paceMinPerKm: 4.06, paceMaxPerKm: 4.18 });
    setZoneOverride(5, { paceMinPerKm: 3.4 });
    setZoneOverride(4, null);

    const prefs = loadUserZonePrefs();
    expect(prefs?.zoneOverrides?.[4]).toBeUndefined();
    expect(prefs?.zoneOverrides?.[5]).toEqual({ paceMinPerKm: 3.4 });
  });

  test("clearUserZonePrefs wipes overrides along with everything else", () => {
    setZoneOverride(4, { paceMinPerKm: 4.06 });
    clearUserZonePrefs();
    expect(loadUserZonePrefs()).toBeNull();
  });
});
