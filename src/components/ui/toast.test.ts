import { describe, expect, test } from "bun:test";
import { TOAST_ACTION_MIN_DURATION, TOAST_DURATION, toastDuration } from "./toast";

describe("toastDuration", () => {
  test("a confirmation leaves before an error does", () => {
    expect(toastDuration("success")).toBe(TOAST_DURATION.success);
    expect(toastDuration("error")).toBe(TOAST_DURATION.error);
    expect(TOAST_DURATION.success).toBeLessThan(TOAST_DURATION.error);
  });

  test("loading never times out on its own", () => {
    expect(toastDuration("loading")).toBe(Infinity);
  });

  test("a button raises the floor, never lowers it", () => {
    const action = { label: "Annuler", onClick: () => {} };
    expect(toastDuration("success", { action })).toBe(TOAST_ACTION_MIN_DURATION);
    expect(toastDuration("error", { action })).toBe(
      Math.max(TOAST_DURATION.error, TOAST_ACTION_MIN_DURATION),
    );
  });

  test("an explicit duration wins over the kind and the button", () => {
    const action = { label: "Annuler", onClick: () => {} };
    expect(toastDuration("warning", { duration: Infinity })).toBe(Infinity);
    expect(toastDuration("success", { duration: 1000, action })).toBe(1000);
  });
});
