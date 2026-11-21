import { afterEach, describe, expect, test } from "bun:test";
import { markViewReady, startNavTransition, withDirectionalTransition } from "./directionalTransition";
import { sharedTransitionName } from "./sharedTransition";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
afterEach(() => {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

function environment(reduced = false, api = true) {
  const dataset: Record<string, string> = {};
  const timers = new Map<number, () => void>();
  const captures: {
    begin: () => void | Promise<void>;
    finish: () => void;
    reject: () => void;
    skipped: boolean;
  }[] = [];
  let nextTimer = 0;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (callback: () => void, duration: number) => {
      expect(duration).toBe(300);
      timers.set(++nextTimer, callback);
      return nextTimer;
    },
    clearTimeout: (id: number) => timers.delete(id),
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    documentElement: { dataset },
    startViewTransition: api ? (begin: () => void | Promise<void>) => {
      let finish!: () => void;
      let reject!: () => void;
      const finished = new Promise<void>((resolve, fail) => { finish = resolve; reject = () => fail(new Error("skipped")); });
      const capture = { begin, finish, reject, skipped: false };
      captures.push(capture);
      return { finished, skipTransition: () => { capture.skipped = true; } };
    } : undefined,
  } });
  return { dataset, timers, captures, setReduced: (value: boolean) => { reduced = value; } };
}

describe("transitions de navigation", () => {
  test("sans API ou avec mouvement réduit, la mise à jour est immédiate", () => {
    for (const [reduced, api] of [[false, false], [true, true]]) {
      const env = environment(reduced, api);
      let updates = 0;
      withDirectionalTransition("next", () => { updates++; });
      startNavTransition(() => { updates++; }, { key: "detail" });
      expect(updates).toBe(2);
      expect(env.captures).toHaveLength(0);
      expect(env.dataset.move).toBeUndefined();
    }
  });

  test("le geste local porte la direction jusqu'à la fin", async () => {
    const env = environment();
    let updated = false;
    withDirectionalTransition("prev", () => { updated = true; });
    expect(updated).toBe(false);
    expect(env.dataset.move).toBe("prev");
    env.captures[0].begin();
    expect(updated).toBe(true);
    env.captures[0].finish();
    await Promise.resolve();
    expect(env.dataset.move).toBeUndefined();
  });

  test("seul le vrai contenu de la destination libère la capture", async () => {
    const env = environment();
    let updated = false;
    let ready = false;
    startNavTransition(() => { updated = true; }, { key: "week:2", direction: "next" });
    const waiting = Promise.resolve(env.captures[0].begin()).then(() => { ready = true; });
    expect(updated).toBe(true);
    markViewReady("week:1");
    await Promise.resolve();
    expect(ready).toBe(false);
    markViewReady("week:2");
    await waiting;
    expect(env.timers.size).toBe(0);
    env.captures[0].finish();
    await Promise.resolve();
    expect(env.dataset.move).toBeUndefined();
  });

  test("le filet libère une destination lente après 300 ms", async () => {
    const env = environment();
    startNavTransition(() => {}, { key: "slow" });
    const waiting = env.captures[0].begin();
    for (const callback of env.timers.values()) callback();
    await waiting;
    expect(env.timers.size).toBe(0);
    env.captures[0].finish();
    await Promise.resolve();
  });

  test("un geste rapide remplace le précédent sans effacer sa direction", async () => {
    const env = environment();
    startNavTransition(() => {}, { key: "week:2", direction: "next" });
    const waiting = env.captures[0].begin();
    startNavTransition(() => {}, { key: "week:1", direction: "prev" });
    await waiting;
    expect(env.captures[0].skipped).toBe(true);
    env.captures[0].finish();
    await Promise.resolve();
    expect(env.dataset.move).toBe("prev");
    const second = env.captures[1].begin();
    markViewReady("week:1");
    await second;
    env.captures[1].reject();
    await Promise.resolve();
    expect(env.dataset.move).toBeUndefined();
  });

  test("une capture remplacée avant son démarrage ne navigue pas", async () => {
    const env = environment();
    let stale = false;
    startNavTransition(() => { stale = true; }, { key: "old" });
    withDirectionalTransition("next", () => {});
    env.captures[0].begin();
    expect(stale).toBe(false);
    env.captures[0].finish();
    env.captures[1].begin();
    env.captures[1].finish();
    await Promise.resolve();
  });

  test("activer le mouvement réduit libère aussi une capture déjà en attente", async () => {
    const env = environment();
    startNavTransition(() => {}, { key: "slow", direction: "next" });
    const waiting = env.captures[0].begin();
    env.setReduced(true);
    let updated = false;
    startNavTransition(() => { updated = true; }, { key: "fast" });
    await waiting;
    expect(updated).toBe(true);
    expect(env.captures[0].skipped).toBe(true);
    expect(env.timers.size).toBe(0);
    expect(env.dataset.move).toBeUndefined();
    env.captures[0].finish();
    await Promise.resolve();
  });

  test("les noms restent CSS sûrs et distincts pour les ids exotiques", () => {
    const ids = ["A-B", "A B", "A_B", "é:1", "a/b", "a.b", "a😀"];
    const names = ids.map((id) => sharedTransitionName("wk", id, "title"));
    expect(new Set(names).size).toBe(ids.length);
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9-]+$/);
    expect(sharedTransitionName("wk", "a", "title")).not.toBe(sharedTransitionName("wk", "a", "profile"));
  });
});
