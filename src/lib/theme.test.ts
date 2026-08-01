/**
 * The theme preference is read from `localStorage` by two independent readers:
 * this module, and the inline boot script in `index.html`. Both have to agree
 * that anything they do not recognise means "follow the system" — a backup
 * written by an older build, a hand-edited JSON, a half-cleared storage. What
 * they must never do is leave the app unpainted or stuck on the wrong theme.
 *
 * `applyResolvedTheme` and `watchSystemTheme` are not covered here: they are
 * DOM writes, and `bun test` has no DOM. They are kept deliberately thin for
 * that reason — the branching lives in `resolveTheme`, which is pure.
 */

import { beforeEach, describe, expect, test } from "bun:test";

import {
  THEME_STORAGE_KEY,
  type ThemePreference,
  isThemePreference,
  readStoredPreference,
  resolveTheme,
  storePreference,
} from "./theme";

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

const PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

beforeEach(() => {
  localStorage.clear();
});

describe("isThemePreference", () => {
  test("accepts exactly the three preferences", () => {
    for (const preference of PREFERENCES) {
      expect(isThemePreference(preference)).toBe(true);
    }
  });

  test("rejects everything else", () => {
    for (const value of [null, undefined, "", "Dark", "auto", "os", 0, {}, []]) {
      expect(isThemePreference(value)).toBe(false);
    }
  });
});

describe("resolveTheme", () => {
  test("an explicit preference ignores the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("dark", true)).toBe("dark");
  });

  test("system follows the OS", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("readStoredPreference", () => {
  test("defaults to system when nothing is stored", () => {
    expect(readStoredPreference()).toBe("system");
  });

  test("falls back to system on a value it does not recognise", () => {
    // A restored backup from a build that stored something else, or a value
    // edited by hand in the exported JSON.
    for (const corrupt of ["purple", '"dark"', "DARK", "{}", ""]) {
      localStorage.setItem(THEME_STORAGE_KEY, corrupt);
      expect(readStoredPreference()).toBe("system");
    }
  });

  test("reads back every preference it wrote", () => {
    for (const preference of PREFERENCES) {
      storePreference(preference);
      expect(readStoredPreference()).toBe(preference);
    }
  });

  test("stores a bare string, not JSON — the boot script cannot parse", () => {
    storePreference("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
