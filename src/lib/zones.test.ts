import { beforeEach, describe, expect, test } from "bun:test";
import { loadUserZonePrefs, setMyNumber } from "./zones";
import { loadRunnerProfile } from "./runnerProfile";

const store = new Map<string, string>();
globalThis.localStorage = {
  get length() {
    return store.size;
  },
  key: (i: number) => [...store.keys()][i] ?? null,
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
} as Storage;

describe("setMyNumber", () => {
  beforeEach(() => store.clear());

  test("sets, changes and deletes a number in the profile", () => {
    expect(setMyNumber("vma", 16.5).ok).toBe(true);
    expect(setMyNumber("fcMax", 188).ok).toBe(true);
    expect(loadUserZonePrefs()).toMatchObject({ vma: 16.5, fcMax: 188 });

    setMyNumber("vma", 17);
    expect(loadRunnerProfile()?.vma).toBe(17);

    setMyNumber("vma", undefined);
    expect(loadRunnerProfile()?.vma).toBeUndefined();
    expect(loadUserZonePrefs()?.vma).toBeUndefined();
    expect(loadUserZonePrefs()?.fcMax).toBe(188);
  });

  test("a deleted number does not come back from the legacy zones key", () => {
    store.set("zoned-userZones", JSON.stringify({ vma: 15, fcMax: 180 }));
    setMyNumber("vma", 16);
    setMyNumber("vma", undefined);
    setMyNumber("fcMax", undefined);
    expect(loadUserZonePrefs()).toBeNull();
  });
});
