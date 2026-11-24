import { describe, expect, test } from "bun:test";
import { daysBetween, readMyNumbers } from "./myNumbers";
import type { TrainingPlan } from "@/types/plan";

function plan(id: string, config: Partial<TrainingPlan["config"]>): TrainingPlan {
  return { id, config: { id, daysPerWeek: 4, createdAt: "2026-01-01", ...config } } as TrainingPlan;
}

const TODAY = "2026-11-24";

describe("readMyNumbers", () => {
  test("nothing known gives nothing, never a made-up value", () => {
    const n = readMyNumbers(null, [], TODAY);
    expect(n).toEqual({ races: [] });
    expect("vma" in n).toBe(false);
    expect("threshold" in n).toBe(false);
  });

  test("VMA alone gives the Z4 range, FC max stays absent", () => {
    const n = readMyNumbers({ vma: 16 }, [], TODAY);
    expect(n.vma).toBe(16);
    expect(n.fcMax).toBeUndefined();
    // 92 % and 85 % of 16 km/h
    expect(n.threshold!.fast).toBeCloseTo(60 / (16 * 0.92), 1);
    expect(n.threshold!.slow).toBeCloseTo(60 / (16 * 0.85), 1);
  });

  test("past races are dropped, the rest sorted by date, today kept", () => {
    const n = readMyNumbers(null, [
      plan("a", { raceDistance: "10K", raceDate: "2027-01-03", raceName: "Prom'Classic", targetPaceMinKm: 3.9 }),
      plan("b", {
        raceDistance: "trail_short", raceDate: "2026-12-05", raceName: "Trail 19 km", elevationGain: 1100,
        intermediateGoals: [
          { raceDistance: "5K", raceDate: "2026-11-01", priority: "C" },
          { raceDistance: "5K", raceDate: TODAY, priority: "C", targetPaceMinKm: 4 },
        ],
      }),
    ], TODAY);
    expect(n.races.map((r) => r.date)).toEqual([TODAY, "2026-12-05", "2027-01-03"]);
    expect(n.races[0].daysLeft).toBe(0);
    expect(n.races[0].isMain).toBe(false);
    expect(n.races[0].targetSeconds).toBe(20 * 60);
  });

  test("trail carries its D+ and no target time", () => {
    const [trail] = readMyNumbers(null, [
      plan("b", { raceDistance: "trail_short", raceDate: "2026-12-05", raceName: "Trail 19 km", elevationGain: 1100, targetPaceMinKm: 7 }),
    ], TODAY).races;
    expect(trail.isTrail).toBe(true);
    expect(trail.elevationGain).toBe(1100);
    expect(trail.daysLeft).toBe(11);
    expect(trail.targetSeconds).toBeUndefined();
  });

  test("a road race keeps its target, a plan without a race purpose is ignored", () => {
    const n = readMyNumbers(null, [
      plan("a", { raceDistance: "10K", raceDate: "2027-01-03", targetPaceMinKm: 3.9 }),
      plan("c", { raceDistance: "marathon", raceDate: "2027-04-01", planPurpose: "base_building" }),
      plan("d", { raceDistance: "10K", raceDate: "not a date" }),
    ], TODAY);
    expect(n.races).toHaveLength(1);
    expect(n.races[0].targetSeconds).toBe(2340);
    expect(n.races[0].elevationGain).toBeUndefined();
  });

  test("the same race in two plans is listed once", () => {
    const cfg = { raceDistance: "10K" as const, raceDate: "2027-01-03", raceName: "Prom'Classic" };
    expect(readMyNumbers(null, [plan("a", cfg), plan("b", cfg)], TODAY).races).toHaveLength(1);
  });
});

test("daysBetween counts calendar days across a DST change", () => {
  expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
  expect(daysBetween(TODAY, "2027-01-03")).toBe(40);
});
