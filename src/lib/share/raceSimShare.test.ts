import { describe, expect, test } from "bun:test";

import {
  decodeSharedSimulation,
  encodeSharedSimulation,
  sharedSimulationUrl,
} from "./raceSimShare";

const MARATHON = {
  distanceKm: 42.195,
  targetTimeSeconds: 12600,
  startTime: "08:30",
  strategy: "negative" as const,
  bodyWeightKg: 70,
};

describe("encode/decode round-trip", () => {
  test("preserves every input", () => {
    expect(decodeSharedSimulation(encodeSharedSimulation(MARATHON))).toEqual(MARATHON);
  });

  test("omits body weight when unset", () => {
    const input = { ...MARATHON, bodyWeightKg: undefined };
    const decoded = decodeSharedSimulation(encodeSharedSimulation(input))!;
    expect(decoded).not.toHaveProperty("bodyWeightKg");
    expect(decoded.distanceKm).toBe(42.195);
  });

  test.each(["00:00", "23:59", "07:05"])("round-trips start time %s", (startTime) => {
    const decoded = decodeSharedSimulation(
      encodeSharedSimulation({ ...MARATHON, startTime }),
    )!;
    expect(decoded.startTime).toBe(startTime);
  });

  test.each(["even", "negative", "positive"] as const)(
    "round-trips the %s strategy",
    (strategy) => {
      const decoded = decodeSharedSimulation(
        encodeSharedSimulation({ ...MARATHON, strategy }),
      )!;
      expect(decoded.strategy).toBe(strategy);
    },
  );
});

describe("URL length", () => {
  test("stays under 140 chars", () => {
    expect(sharedSimulationUrl(MARATHON).length).toBeLessThan(140);
  });
});

describe("decodeSharedSimulation rejects bad input", () => {
  const encode = (payload: unknown) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url");
  const valid = { v: 1, d: 10, t: 2700, s: 510, st: 1 };

  test.each([
    ["a wrong version", encode({ ...valid, v: 2 })],
    ["a zero distance", encode({ ...valid, d: 0 })],
    ["an absurd distance", encode({ ...valid, d: 5000 })],
    ["a zero target time", encode({ ...valid, t: 0 })],
    ["an out-of-range start time", encode({ ...valid, s: 1440 })],
    ["an unknown strategy code", encode({ ...valid, st: 9 })],
    ["a missing strategy", encode({ v: 1, d: 10, t: 2700, s: 510 })],
    ["garbage", "!!!"],
  ])("returns null for %s", (_label, encoded) => {
    expect(decodeSharedSimulation(encoded)).toBeNull();
  });
});
