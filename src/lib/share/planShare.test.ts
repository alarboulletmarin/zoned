import { describe, expect, test } from "bun:test";

import type { PlanConfig } from "@/types/plan";
import { generatePlan } from "@/lib/planGenerator";
import {
  decodeSharedPlan,
  encodeSharedPlan,
  isShareablePlan,
  sharedPlanUrl,
} from "./planShare";

const CONFIG: PlanConfig = {
  id: "plan-1",
  createdAt: "2026-07-25T00:00:00.000Z",
  planMode: "assisted",
  raceDistance: "marathon",
  raceDate: "2026-10-11",
  raceName: "Marathon de Paris",
  runnerLevel: "intermediate",
  daysPerWeek: 5,
  longRunDay: 6,
  vma: 16.5,
  targetPaceMinKm: 5.1,
  startDate: "2026-07-27",
  trainingGoal: "time",
  planPurpose: "race",
  currentWeeklyKm: 45,
  currentLongRunKm: 18,
  includeStrength: true,
  strengthFrequency: 2,
};

describe("encode/decode round-trip", () => {
  test("preserves every generation-relevant field", () => {
    const decoded = decodeSharedPlan(encodeSharedPlan(CONFIG))!;
    expect(decoded).toMatchObject({
      raceDistance: "marathon",
      raceDate: "2026-10-11",
      raceName: "Marathon de Paris",
      runnerLevel: "intermediate",
      daysPerWeek: 5,
      longRunDay: 6,
      vma: 16.5,
      targetPaceMinKm: 5.1,
      startDate: "2026-07-27",
      trainingGoal: "time",
      planPurpose: "race",
      currentWeeklyKm: 45,
      currentLongRunKm: 18,
      includeStrength: true,
      strengthFrequency: 2,
    });
  });

  test("omits optional fields that are unset", () => {
    const minimal: PlanConfig = {
      id: "p",
      createdAt: "",
      raceDistance: "10K",
      raceDate: "2026-09-01",
      runnerLevel: "beginner",
      daysPerWeek: 3,
      longRunDay: 5,
    };
    const decoded = decodeSharedPlan(encodeSharedPlan(minimal))!;
    expect(decoded).not.toHaveProperty("vma");
    expect(decoded).not.toHaveProperty("includeStrength");
    expect(decoded.raceDistance).toBe("10K");
  });
});

describe("URL length", () => {
  test("a full marathon config stays under 350 chars", () => {
    expect(sharedPlanUrl(CONFIG).length).toBeLessThan(350);
  });
});

describe("isShareablePlan", () => {
  test.each([
    ["an assisted plan", { ...CONFIG }, true],
    ["a plan with no explicit mode", { ...CONFIG, planMode: undefined }, true],
    ["a free plan", { ...CONFIG, planMode: "free" as const }, false],
    ["a prebuilt plan", { ...CONFIG, planMode: "prebuilt" as const }, false],
    ["a config with no race date", { ...CONFIG, raceDate: undefined }, false],
  ])("returns %s → %s", (_label, config, expected) => {
    expect(isShareablePlan(config as PlanConfig)).toBe(expected);
  });
});

describe("decodeSharedPlan rejects bad input", () => {
  const encode = (payload: unknown) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url");
  const valid = { v: 1, rd: 2, rdt: "2026-10-11", lvl: 2, dpw: 4, lrd: 6 };

  test.each([
    ["a wrong version", encode({ ...valid, v: 2 })],
    ["an unknown race distance", encode({ ...valid, rd: 99 })],
    ["an unknown level", encode({ ...valid, lvl: 0 })],
    ["a malformed race date", encode({ ...valid, rdt: "11/10/2026" })],
    ["too few days per week", encode({ ...valid, dpw: 2 })],
    ["too many days per week", encode({ ...valid, dpw: 8 })],
    ["an out-of-range long run day", encode({ ...valid, lrd: 7 })],
    ["garbage", "!!!"],
  ])("returns null for %s", (_label, encoded) => {
    expect(decodeSharedPlan(encoded)).toBeNull();
  });
});

describe("shared link regenerates the same plan", () => {
  test("the recipient gets the sender's sessions", async () => {
    const sender = await generatePlan({
      ...CONFIG,
      raceDistance: "marathon",
      raceDate: "2026-10-11",
      runnerLevel: "intermediate",
      longRunDay: 6,
    });

    const decoded = decodeSharedPlan(encodeSharedPlan(CONFIG))!;
    const recipient = await generatePlan({
      ...decoded,
      id: "recipient-plan",
      createdAt: "2026-08-01T00:00:00.000Z",
    });

    const ids = (plan: typeof sender) =>
      plan.weeks.flatMap((w) => w.sessions.map((s) => s.workoutId));
    expect(ids(recipient)).toEqual(ids(sender));
    expect(recipient.totalWeeks).toBe(sender.totalWeeks);
  });
});
