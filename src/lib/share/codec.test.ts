import { describe, expect, test } from "bun:test";

import { decodePayload, encodePayload, fromBase64Url, shareUrl, toBase64Url } from "./codec";

describe("toBase64Url", () => {
  test("emits URL-safe output with no padding", () => {
    // "??>" forces both + and / in standard base64, and padding.
    const encoded = toBase64Url("??>");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
    expect(fromBase64Url(encoded)).toBe("??>");
  });

  test("round-trips accented text (UTF-8, not latin1)", () => {
    const name = "Séance côtes — récup 1min";
    expect(fromBase64Url(toBase64Url(name))).toBe(name);
  });

  test("is stable — the wire format is part of shared links", () => {
    expect(toBase64Url('{"v":1,"n":"Ma semaine"}')).toBe(
      "eyJ2IjoxLCJuIjoiTWEgc2VtYWluZSJ9",
    );
  });
});

describe("decodePayload", () => {
  test("round-trips an object payload", () => {
    const payload = { v: 1, n: "Ma semaine", s: [[0, "REC-001", 0, 45]] };
    expect(decodePayload(encodePayload(payload))).toEqual(payload);
  });

  test.each([
    ["not base64", "!!!not-base64!!!"],
    ["valid base64, invalid JSON", toBase64Url("{oops")],
    ["a JSON array", encodePayload([1, 2, 3])],
    ["a JSON scalar", encodePayload(42)],
    ["null", encodePayload(null)],
    ["empty string", ""],
  ])("returns null for %s", (_label, encoded) => {
    expect(decodePayload(encoded)).toBeNull();
  });
});

describe("shareUrl", () => {
  test("builds a d= link on the share origin", () => {
    expect(shareUrl("/workout/shared", "abc")).toMatch(/\/workout\/shared\?d=abc$/);
  });
});
