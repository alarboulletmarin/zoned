import { describe, expect, test } from "bun:test";

import { cn } from "./utils";

/**
 * `cn` lost its `tailwind-merge` half when Tailwind was removed. What has to
 * survive that is the argument contract: every call site keeps passing the same
 * shapes, and the output order still has to be the order they were written in,
 * because a later class in the string is what wins on equal specificity.
 */
describe("cn", () => {
  test("joins strings in the order they are given", () => {
    expect(cn("zn-btn", "zn-btn--wide")).toBe("zn-btn zn-btn--wide");
  });

  test("drops every falsy value", () => {
    expect(cn("zn-btn", false, null, undefined, 0, "", "zn-btn--wide")).toBe(
      "zn-btn zn-btn--wide"
    );
  });

  test("takes the conditional form call sites use", () => {
    const active = true;
    expect(cn("zn-tab", active && "zn-tab--on")).toBe("zn-tab zn-tab--on");
    expect(cn("zn-tab", !active && "zn-tab--on")).toBe("zn-tab");
  });

  test("takes arrays, nested arrays and objects", () => {
    expect(cn(["zn-a", ["zn-b"]])).toBe("zn-a zn-b");
    expect(cn({ "zn-a": true, "zn-b": false, "zn-c": 1 })).toBe("zn-a zn-c");
  });

  test("passes a className prop through untouched", () => {
    // The pass-through is the whole point of the prop: a call site's class has
    // to reach the DOM verbatim, whatever it is called.
    expect(cn("zn-card", "zn-plan__card")).toBe("zn-card zn-plan__card");
  });

  test("returns an empty string when there is nothing to join", () => {
    expect(cn()).toBe("");
    expect(cn(undefined, null, false)).toBe("");
  });
});
