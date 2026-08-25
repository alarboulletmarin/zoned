/**
 * `routeGeneratorEnabled` is the one setting with a privacy consequence: while
 * it is on, generating a route hands the start coordinate to Brouter,
 * Nominatim and Overpass. It is documented as an opt-in, so its default is
 * `false` — and flipping that default is only half the job, because the
 * provider persists the whole settings object on mount. Every browser that
 * ever opened Zoned therefore already holds `routeGeneratorEnabled: true`,
 * written by the old default rather than chosen by anyone.
 *
 * These tests pin the reading side of that: what a stored blob is allowed to
 * mean, before and after the one-shot migration latch. The provider itself is
 * not covered — it is React state and DOM writes, and `bun test` has no DOM,
 * which is exactly why `readStoredSettings` is a pure function.
 */

import { beforeEach, describe, expect, test } from "bun:test";

import { DEFAULT_SETTINGS } from "@/types/settings";
import {
  ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY,
  SETTINGS_STORAGE_KEY,
  readStoredSettings,
} from "./useSettings";

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
  (globalThis as { localStorage: Storage }).localStorage =
    new MemoryStorage() as unknown as Storage;
}

function store(settings: Record<string, unknown>): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

beforeEach(() => {
  localStorage.clear();
});

describe("DEFAULT_SETTINGS", () => {
  test("the route generator is off until someone turns it on", () => {
    expect(DEFAULT_SETTINGS.routeGeneratorEnabled).toBe(false);
  });
});

describe("readStoredSettings", () => {
  test("an untouched browser gets the defaults", () => {
    expect(readStoredSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test("unreadable storage falls back to the defaults rather than throwing", () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, "{ not json");
    expect(readStoredSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test("keys the stored blob predates are completed from the defaults", () => {
    store({ colorPalette: "deuteranopia" });
    expect(readStoredSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      colorPalette: "deuteranopia",
    });
  });

  test("choices unrelated to the migration survive it", () => {
    store({ colorPalette: "tritanopia", unitSystem: "imperial", routeGeneratorEnabled: true });
    const settings = readStoredSettings();
    expect(settings.colorPalette).toBe("tritanopia");
    expect(settings.unitSystem).toBe("imperial");
  });
});

describe("route generator opt-in migration", () => {
  test("a legacy `true` carries no consent and is dropped", () => {
    store({ routeGeneratorEnabled: true });
    expect(readStoredSettings().routeGeneratorEnabled).toBe(false);
  });

  test("a legacy `false` was always deliberate and is kept", () => {
    store({ routeGeneratorEnabled: false });
    expect(readStoredSettings().routeGeneratorEnabled).toBe(false);
    expect(localStorage.getItem(ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY)).toBe("1");
  });

  test("it runs once — a later `true` is a real opt-in and is honoured", () => {
    store({ routeGeneratorEnabled: true });
    expect(readStoredSettings().routeGeneratorEnabled).toBe(false);

    // What the Settings toggle writes, on a browser that has already migrated.
    store({ routeGeneratorEnabled: true });
    expect(readStoredSettings().routeGeneratorEnabled).toBe(true);
  });

  test("the latch is set even when there was nothing to migrate", () => {
    expect(readStoredSettings().routeGeneratorEnabled).toBe(false);
    expect(localStorage.getItem(ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY)).toBe("1");

    store({ routeGeneratorEnabled: true });
    expect(readStoredSettings().routeGeneratorEnabled).toBe(true);
  });
});
