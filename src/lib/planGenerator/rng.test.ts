import { describe, expect, test } from "bun:test";

import type { AssistedPlanConfig } from "@/types/plan";
import { generatePlan } from "./index";
import { planRandom, planSeedFromConfig, seedPlanRng } from "./rng";

const CONFIG: AssistedPlanConfig = {
  id: "plan-1",
  raceDistance: "10K",
  raceDate: "2026-10-11",
  runnerLevel: "intermediate",
  longRunDay: 6,
  daysPerWeek: 4,
  vma: 16.5,
  startDate: "2026-07-27",
  trainingGoal: "time",
  planPurpose: "race",
  createdAt: "2026-07-25T00:00:00.000Z",
};

describe("seedPlanRng", () => {
  test("same seed replays the same stream", () => {
    seedPlanRng("abc");
    const first = [planRandom(), planRandom(), planRandom()];
    seedPlanRng("abc");
    expect([planRandom(), planRandom(), planRandom()]).toEqual(first);
  });

  test("different seeds diverge", () => {
    seedPlanRng("abc");
    const a = planRandom();
    seedPlanRng("xyz");
    expect(planRandom()).not.toBe(a);
  });
});

describe("planSeedFromConfig", () => {
  test("ignores id and createdAt — they are unique per plan", () => {
    expect(planSeedFromConfig({ ...CONFIG, id: "other", createdAt: "2027-01-01" })).toBe(
      planSeedFromConfig(CONFIG),
    );
  });

  test("changes when a selection-shaping field changes", () => {
    expect(planSeedFromConfig({ ...CONFIG, daysPerWeek: 5 })).not.toBe(
      planSeedFromConfig(CONFIG),
    );
  });
});

describe("generatePlan reproducibility", () => {
  const workoutIds = (plan: Awaited<ReturnType<typeof generatePlan>>) =>
    plan.weeks.flatMap((w) => w.sessions.map((s) => s.workoutId));

  test("the same config yields the same sessions", async () => {
    const a = await generatePlan(CONFIG);
    // A fresh id/createdAt is what a recipient's regeneration would look like.
    const b = await generatePlan({ ...CONFIG, id: "plan-2", createdAt: "2027-02-02" });
    expect(workoutIds(b)).toEqual(workoutIds(a));
  });

  test("a different config yields a different plan", async () => {
    const a = await generatePlan(CONFIG);
    const b = await generatePlan({ ...CONFIG, daysPerWeek: 5 });
    expect(workoutIds(b)).not.toEqual(workoutIds(a));
  });
});
