import { describe, expect, test } from "bun:test";
import { createElement, type ReactElement } from "react";

import { Slot } from "./slot";

/** `Slot` is a plain function component: calling it returns the cloned child,
 *  which is exactly where the merge has to be right. No DOM needed. */
function slot(props: Record<string, unknown>) {
  return (Slot as unknown as (p: Record<string, unknown>) => ReactElement)(props)
    .props as Record<string, unknown>;
}

describe("Slot", () => {
  test("the child wins on className, style and plain props", () => {
    const merged = slot({
      className: "zn-btn",
      style: { color: "red", margin: 0 },
      "data-variant": "default",
      children: createElement("a", {
        className: "zn-glink",
        style: { color: "blue" },
        "data-variant": "outline",
        href: "/x",
      }),
    });
    expect(merged.className).toBe("zn-btn zn-glink");
    expect(merged.style).toEqual({ color: "blue", margin: 0 });
    expect(merged["data-variant"]).toBe("outline");
    expect(merged.href).toBe("/x");
  });

  test("handlers run ours first, then the child's, unless we prevented", () => {
    const calls: string[] = [];
    const merged = slot({
      onClick: (e: { preventDefault: () => void; defaultPrevented: boolean }) => {
        calls.push("parent");
        if (calls.includes("stop")) e.preventDefault();
      },
      children: createElement("a", { onClick: () => calls.push("child") }),
    });
    const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    (merged.onClick as (e: typeof event) => void)(event);
    expect(calls).toEqual(["parent", "child"]);

    calls.length = 0;
    calls.push("stop");
    const event2 = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    (merged.onClick as (e: typeof event2) => void)(event2);
    expect(calls).toEqual(["stop", "parent"]);
  });

  test("a handler only we carry is passed through", () => {
    const merged = slot({ onFocus: () => {}, children: createElement("a") });
    expect(typeof merged.onFocus).toBe("function");
  });

  test("refs compose, ours and the one the child already had", () => {
    const ours: { current: unknown } = { current: null };
    const theirs: unknown[] = [];
    const merged = slot({
      ref: ours,
      children: createElement("a", { ref: (n: unknown) => theirs.push(n) }),
    });
    (merged.ref as (n: unknown) => void)("node");
    expect(ours.current).toBe("node");
    expect(theirs).toEqual(["node"]);
  });

  test("a child ref that returns a React 19 cleanup gets its cleanup, not a null call", () => {
    const seen: unknown[] = [];
    const ours: { current: unknown } = { current: "sentinel" };
    const merged = slot({
      ref: ours,
      children: createElement("a", {
        ref: (n: unknown) => {
          seen.push(n);
          return () => seen.push("cleanup");
        },
      }),
    });
    const cleanup = (merged.ref as (n: unknown) => (() => void) | void)("node");
    expect(seen).toEqual(["node"]);
    expect(typeof cleanup).toBe("function");
    cleanup!();
    expect(seen).toEqual(["node", "cleanup"]); // never called with null
    expect(ours.current).toBe(null); // the object ref still detaches
  });

  test("a non-element child is an error, not a silent no-op", () => {
    expect(() => slot({ children: "texte" })).toThrow(/unique élément/);
    expect(() => slot({ children: undefined })).toThrow(/unique élément/);
  });
});
