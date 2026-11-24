import { describe, expect, test } from "bun:test";
import { generateRacePlan } from "./raceSimulator";
import { dayState, dayStepsFromPlan, hmToMinutes, isRaceToday, minutesToHm, warmupBlocks } from "./raceDay";

// 10 km in 39:00, negative split, gun at 9:30: the race of the mock-ups.
const plan = generateRacePlan({ distanceKm: 10, targetTimeSeconds: 2340, startTime: "09:30", strategy: "negative" });
const steps = dayStepsFromPlan(plan);
const at = (hm: string) => hmToMinutes(hm);

describe("warm-up in four blocks", () => {
  test("jog, drills, strides, rest, back to back, ending before the gun", () => {
    const blocks = warmupBlocks(plan);
    expect(blocks.map((b) => b.kind)).toEqual(["jog", "drills", "strides", "rest"]);
    expect(minutesToHm(blocks[0].at)).toBe("9:00");
    for (let i = 1; i < blocks.length; i++) expect(blocks[i].at).toBe(blocks[i - 1].at + blocks[i - 1].minutes);
    const last = blocks[blocks.length - 1];
    expect(last.at + last.minutes).toBeLessThanOrEqual(at("09:30"));
  });
});

describe("dayState", () => {
  test("before waking up, nothing is current and the wake-up comes next", () => {
    const s = dayState(steps, plan, at("05:00"));
    expect(s.index).toBe(-1);
    expect(steps[s.next].kind).toBe("wake");
    expect(s.minutesToNext).toBe(60);
  });

  test("the step in progress follows the clock", () => {
    const s = dayState(steps, plan, at("06:45"));
    expect(steps[s.index].kind).toBe("breakfast");
    expect(steps[s.next].kind).toBe("venue");
    expect(s.remaining).toBe(at("08:30") - at("06:45"));
    expect(s.progress).toBeGreaterThan(0);
    expect(s.progress).toBeLessThan(1);
  });

  test("during the race, the km in progress, its pace and its passage", () => {
    const first = dayState(steps, plan, at("09:31"));
    expect(steps[first.index].kind).toBe("race");
    expect(first.race!.km).toBe(0);
    expect(first.race!.cueIndex).toBe(0);
    const later = dayState(steps, plan, at("09:55"));
    // 25 min in, about 6.4 km at 3:54 on average: the 7th km
    expect(later.race!.km).toBe(6);
    expect(later.race!.paceMinPerKm).toBeLessThan(plan.splits[0].paceMinPerKm);
    expect(later.race!.passageAt).toBeCloseTo(at("09:30") + plan.splits[6].cumulativeTimeSeconds / 60, 5);
  });

  test("after the finish, the finish stays current, nothing comes next", () => {
    const s = dayState(steps, plan, at("10:20"));
    expect(steps[s.index].kind).toBe("finish");
    expect(s.next).toBe(-1);
    expect(s.race).toBeUndefined();
  });
});

test("a rehearsal on any day but the race date", () => {
  expect(isRaceToday("2027-01-03", "2027-01-03")).toBe(true);
  expect(isRaceToday("2027-01-03", "2026-11-24")).toBe(false);
  expect(isRaceToday(undefined, "2026-11-24")).toBe(false);
});
