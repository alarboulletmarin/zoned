/**
 * The foreground check exists to make the banner appear on a resumed PWA, and
 * it has exactly one way to go wrong in production: asking too often. Requests
 * for `sw.js` bypass the HTTP cache, so a listener without a floor turns every
 * app-switch into a network round-trip, on mobile, on someone else's data.
 *
 * The other cases are the ones that would throw rather than misbehave: a
 * registration that has not arrived yet, and an `update()` that rejects because
 * the device is offline.
 */

import { describe, expect, mock, test } from "bun:test";

import { UPDATE_CHECK_INTERVAL_MS, createUpdateChecker } from "./swUpdate";

/** A clock the test moves by hand. */
function fakeClock(start = 1_000_000) {
  let value = start;
  return {
    now: () => value,
    advance: (ms: number) => {
      value += ms;
    },
  };
}

function fakeRegistration(update: () => Promise<unknown> = () => Promise.resolve()) {
  return { update: mock(update) };
}

describe("createUpdateChecker", () => {
  test("asks when the app becomes visible", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    const check = createUpdateChecker(() => registration, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);

    expect(check(true)).toBe(true);
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  test("stays quiet when the app goes to the background", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    const check = createUpdateChecker(() => registration, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);

    expect(check(false)).toBe(false);
    expect(registration.update).not.toHaveBeenCalled();
  });

  test("does not ask right after subscribing, the page load already compared sw.js", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    const check = createUpdateChecker(() => registration, clock.now);

    expect(check(true)).toBe(false);
    expect(registration.update).not.toHaveBeenCalled();
  });

  test("two returns inside a minute are one request", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    const check = createUpdateChecker(() => registration, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);
    expect(check(true)).toBe(true);

    clock.advance(UPDATE_CHECK_INTERVAL_MS - 1);
    expect(check(true)).toBe(false);

    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  test("asks again once the floor has passed", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    const check = createUpdateChecker(() => registration, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);
    check(true);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);
    expect(check(true)).toBe(true);

    expect(registration.update).toHaveBeenCalledTimes(2);
  });

  test("survives a registration that has not arrived yet", () => {
    const clock = fakeClock();
    const check = createUpdateChecker(() => null, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);

    expect(() => check(true)).not.toThrow();
    expect(check(true)).toBe(false);
  });

  test("reads the registration through the getter, not at build time", () => {
    const clock = fakeClock();
    const registration = fakeRegistration();
    // Null at subscribe time, as it always is in the real app: `onRegisteredSW`
    // has not fired when the effect runs.
    let current: ReturnType<typeof fakeRegistration> | null = null;
    const check = createUpdateChecker(() => current, clock.now);

    current = registration;
    clock.advance(UPDATE_CHECK_INTERVAL_MS);

    expect(check(true)).toBe(true);
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  test("swallows an update() that rejects offline", () => {
    const clock = fakeClock();
    const registration = fakeRegistration(() => Promise.reject(new Error("offline")));
    const check = createUpdateChecker(() => registration, clock.now);

    clock.advance(UPDATE_CHECK_INTERVAL_MS);

    expect(() => check(true)).not.toThrow();
    expect(registration.update).toHaveBeenCalledTimes(1);
  });
});

// ── Le bouton Mettre à jour ────────────────────────────────────────────────

import { ACTIVATION_TIMEOUT_MS, applyWaitingUpdate } from "./swUpdate";

/** Un worker en attente dont le test fait avancer l'état. */
function fakeWaiting() {
  const listeners: Array<() => void> = [];
  const worker = {
    state: "installed",
    addEventListener: (_type: "statechange", listener: () => void) => {
      listeners.push(listener);
    },
    become(state: string) {
      worker.state = state;
      for (const listener of listeners) listener();
    },
  };
  return worker;
}

/** Les trois canaux, chacun déclenché à la main. */
function harness(waiting: ReturnType<typeof fakeWaiting> | null) {
  const skipWaiting = mock(() => {});
  const reload = mock(() => {});
  let controllerChange: (() => void) | null = null;
  let timer: { fn: () => void; ms: number } | null = null;
  applyWaitingUpdate(
    waiting,
    skipWaiting,
    reload,
    (listener) => {
      controllerChange = listener;
    },
    (fn, ms) => {
      timer = { fn, ms };
    },
  );
  return {
    skipWaiting,
    reload,
    fireControllerChange: () => controllerChange?.(),
    fireTimeout: () => timer?.fn(),
    timerMs: () => timer?.ms,
  };
}

describe("applyWaitingUpdate", () => {
  test("demande l'activation, et ne recharge pas avant qu'elle soit faite", () => {
    const waiting = fakeWaiting();
    const h = harness(waiting);
    expect(h.skipWaiting).toHaveBeenCalledTimes(1);
    expect(h.reload).toHaveBeenCalledTimes(0);

    waiting.become("activating");
    expect(h.reload).toHaveBeenCalledTimes(0);

    waiting.become("activated");
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  test("recharge sur controllerchange quand il arrive le premier", () => {
    const waiting = fakeWaiting();
    const h = harness(waiting);
    h.fireControllerChange();
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  test("une seule fois, quel que soit le nombre de signaux", () => {
    const waiting = fakeWaiting();
    const h = harness(waiting);
    waiting.become("activated");
    h.fireControllerChange();
    h.fireTimeout();
    waiting.become("redundant");
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  test("le délai recharge quand aucun signal ne vient", () => {
    const waiting = fakeWaiting();
    const h = harness(waiting);
    expect(h.timerMs()).toBe(ACTIVATION_TIMEOUT_MS);
    h.fireTimeout();
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  test("un worker devenu redondant recharge aussi", () => {
    const waiting = fakeWaiting();
    const h = harness(waiting);
    waiting.become("redundant");
    expect(h.reload).toHaveBeenCalledTimes(1);
  });

  test("sans worker en attente, rien à activer : on recharge tout de suite", () => {
    const h = harness(null);
    expect(h.skipWaiting).toHaveBeenCalledTimes(0);
    expect(h.reload).toHaveBeenCalledTimes(1);
  });
});
