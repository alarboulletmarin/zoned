/**
 * The foreground check exists to make the banner appear on a resumed PWA, and
 * it has exactly one way to go wrong in production: asking too often. Requests
 * for `sw.js` bypass the HTTP cache, so a listener without a floor turns every
 * app-switch into a network round-trip — on mobile, on someone else's data.
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

  test("does not ask right after subscribing — the page load already compared sw.js", () => {
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
