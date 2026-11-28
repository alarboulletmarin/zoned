/**
 * Difficulty calibration, measured on the whole grid of profiles.
 *
 * November 2026: an amateur generated a half-marathon plan and found it far
 * too hard (hill sessions, hard sessions everywhere), while a competing app
 * gave her nothing but easy runs. The plan was the default one, intermediate,
 * "a time", four days. Measured on every profile, the generator gave three
 * hard days out of four in build and peak weeks (two key sessions plus a
 * race-pace long run the 80/20 count ignored), hilly easy runs and long runs
 * on road plans, advanced long runs to intermediates, a first week at the top
 * of the volume range the level hint promised, and easy runs longer than the
 * long run. Each rule below is one of those findings, held on every distance,
 * level, goal and number of days, so a fix for one profile cannot quietly
 * break another. `scripts/plan-matrix.ts` measures the same grid with numbers.
 */
import { describe, expect, test } from "bun:test";
import { generatePlan } from "./index";
import { loadAllWorkouts } from "@/data/workouts";
import type { AssistedPlanConfig, RaceDistance, TrainingGoal, TrainingPlan } from "@/types/plan";
import type { Difficulty, WorkoutTemplate } from "@/types";
import { hardDayBudget, LEVEL_TYPICAL_WEEKLY_KM } from "./constants";
import { isHillyTemplate, isOffDistanceLongRun, isQualityLongRun } from "./selector";

const DISTANCES: RaceDistance[] = ["5K", "10K", "semi", "marathon", "trail_short", "trail", "ultra"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const GOALS: TrainingGoal[] = ["finish", "time", "compete"];
const DAYS = [3, 4, 5, 6];
const DL: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
const VMA: Record<Difficulty, number> = { beginner: 11, intermediate: 13.5, advanced: 16.5, elite: 19.5 };
const WEEKS: Record<RaceDistance, number> = {
  "5K": 10, "10K": 12, semi: 14, marathon: 18, trail_short: 14, trail: 18, ultra: 24,
};
const ROAD = new Set<RaceDistance>(["5K", "10K", "semi", "marathon"]);
const QUALITY_TYPES = new Set(["vo2max", "threshold", "tempo", "hills", "fartlek", "race_specific", "speed"]);

interface Case {
  label: string;
  raceDistance: RaceDistance;
  runnerLevel: Difficulty;
  trainingGoal: TrainingGoal;
  daysPerWeek: number;
  currentWeeklyKm?: number;
}

const CASES: Case[] = [];
for (const raceDistance of DISTANCES)
  for (const runnerLevel of LEVELS)
    for (const trainingGoal of GOALS)
      for (const daysPerWeek of DAYS)
        CASES.push({
          label: `${raceDistance} ${runnerLevel} ${trainingGoal} ${daysPerWeek}d`,
          raceDistance, runnerLevel, trainingGoal, daysPerWeek,
        });

async function build(c: Case): Promise<TrainingPlan> {
  const weeks = WEEKS[c.raceDistance];
  const raceDate = new Date("2027-01-04");
  raceDate.setDate(raceDate.getDate() + weeks * 7 - 1);
  const config: AssistedPlanConfig = {
    id: "difficulty",
    createdAt: "2027-01-04T00:00:00.000Z",
    startDate: "2027-01-04",
    raceDate: raceDate.toISOString().slice(0, 10),
    longRunDay: 6,
    planPurpose: "race",
    vma: VMA[c.runnerLevel],
    ...c,
  };
  return generatePlan(config);
}

let catalogue: Map<string, WorkoutTemplate> | null = null;
const plans = new Map<Case, TrainingPlan>();

async function each(check: (c: Case, plan: TrainingPlan, byId: Map<string, WorkoutTemplate>) => void) {
  if (!catalogue) catalogue = new Map((await loadAllWorkouts()).map((w) => [w.id, w]));
  for (const c of CASES) {
    let plan = plans.get(c);
    if (!plan) {
      plan = await build(c);
      plans.set(c, plan);
    }
    check(c, plan, catalogue);
  }
}

function runsOf(week: TrainingPlan["weeks"][number]) {
  return week.sessions.filter((s) => s.sessionType !== "strength" && !s.workoutId.startsWith("__"));
}

describe("difficulty calibration on every profile", () => {
  test("no session ever comes from a level above the runner's", async () => {
    await each((c, plan, byId) => {
      for (const week of plan.weeks) {
        for (const s of runsOf(week)) {
          const t = byId.get(s.workoutId)!;
          expect(DL[t.difficulty] <= DL[c.runnerLevel], `${c.label} S${week.weekNumber} ${t.id} ${t.difficulty}`).toBe(true);
        }
      }
    });
  });

  test("hard days per week, quality long run included, stay within the budget", async () => {
    await each((c, plan, byId) => {
      for (const week of plan.weeks.slice(0, -1)) {
        const hard = runsOf(week).filter((s) =>
          (s.isKeySession && QUALITY_TYPES.has(s.sessionType))
          || (s.sessionType === "long_run" && isQualityLongRun(byId.get(s.workoutId)!)),
        ).length;
        const budget = hardDayBudget(week.phase, c.trainingGoal, c.runnerLevel, c.daysPerWeek);
        expect(hard, `${c.label} S${week.weekNumber} ${week.phase}`).toBeLessThanOrEqual(budget);
        // A third hard day is for advanced runners on five days or more who asked for it
        if (hard >= 3) {
          expect(c.trainingGoal === "compete" && DL[c.runnerLevel] >= 3 && c.daysPerWeek >= 5, c.label).toBe(true);
        }
      }
    });
  });

  test("the long run is easy in the base phase and in recovery weeks", async () => {
    await each((c, plan, byId) => {
      for (const week of plan.weeks) {
        if (week.phase !== "base" && !week.isRecoveryWeek) continue;
        for (const s of runsOf(week)) {
          if (s.sessionType !== "long_run") continue;
          expect(isQualityLongRun(byId.get(s.workoutId)!), `${c.label} S${week.weekNumber} ${s.workoutId}`).toBe(false);
        }
      }
    });
  });

  test("a road plan keeps its hills in its hill sessions", async () => {
    await each((c, plan, byId) => {
      if (!ROAD.has(c.raceDistance)) return;
      for (const week of plan.weeks) {
        for (const s of runsOf(week)) {
          if (s.isKeySession) continue;
          expect(isHillyTemplate(byId.get(s.workoutId)!), `${c.label} S${week.weekNumber} ${s.workoutId}`).toBe(false);
        }
      }
    });
  });

  test("no long run written for a longer race in a 5K, 10K or half-marathon plan", async () => {
    await each((c, plan, byId) => {
      for (const week of plan.weeks) {
        for (const s of runsOf(week)) {
          if (s.sessionType !== "long_run") continue;
          expect(isOffDistanceLongRun(byId.get(s.workoutId)!, c.raceDistance), `${c.label} ${s.workoutId}`).toBe(false);
        }
      }
    });
  });

  test("no situational or partner session, and expert ones only from advanced up", async () => {
    await each((c, plan, byId) => {
      for (const week of plan.weeks) {
        for (const s of runsOf(week)) {
          const tags = byId.get(s.workoutId)!.selectionCriteria.tags;
          expect(tags.includes("situational") || tags.includes("social"), `${c.label} ${s.workoutId}`).toBe(false);
          if (DL[c.runnerLevel] <= DL.intermediate) {
            expect(tags.includes("expert"), `${c.label} ${s.workoutId}`).toBe(false);
          }
        }
      }
    });
  });

  test("no easy run lasts longer than the week's long run", async () => {
    await each((c, plan) => {
      for (const week of plan.weeks.slice(0, -1)) {
        const runs = runsOf(week);
        const long = runs.find((s) => s.sessionType === "long_run");
        if (!long) continue;
        for (const s of runs) {
          if (s.isKeySession || s === long) continue;
          expect(s.estimatedDurationMin, `${c.label} S${week.weekNumber} ${s.workoutId}`).toBeLessThanOrEqual(long.estimatedDurationMin);
        }
      }
    });
  });

  test("without a declared volume, week 1 starts within what the level hint promises", async () => {
    await each((c, plan) => {
      // 3.5 km a session is the floor below which a day is not worth running
      const ceiling = Math.max(LEVEL_TYPICAL_WEEKLY_KM[c.runnerLevel], c.daysPerWeek * 3.5);
      // Beginners and six-day weeks keep a margin: the shortest long run, key
      // session and easy runs of the catalogue add up past a 15 km week.
      // Before November 2026 the worst case stood at 1.9 times the hint.
      const margin = c.runnerLevel === "beginner" || c.daysPerWeek >= 6 ? 1.5 : 1.15;
      expect(plan.weeks[0].targetKm ?? 0, c.label).toBeLessThanOrEqual(Math.ceil(ceiling * margin));
    });
  });

  test("race week holds short jogs, no walk-run, nothing after the race", async () => {
    await each((c, plan, byId) => {
      const race = plan.weeks[plan.weeks.length - 1];
      for (const s of runsOf(race)) {
        expect(s.estimatedDurationMin, `${c.label} ${s.workoutId}`).toBeLessThanOrEqual(60);
        expect(byId.get(s.workoutId)!.selectionCriteria.tags.includes("walk-run"), `${c.label} ${s.workoutId}`).toBe(false);
      }
    });
  });

  test("beginners and intermediates meet the same key session two weeks running", async () => {
    await each((c, plan) => {
      if (DL[c.runnerLevel] > DL.intermediate) return;
      const loadWeeks = plan.weeks.filter((w) => !w.isRecoveryWeek && w.phase !== "taper");
      let repeats = 0;
      for (let i = 1; i < loadWeeks.length; i++) {
        const before = new Set(runsOf(loadWeeks[i - 1]).filter((s) => s.isKeySession).map((s) => s.workoutId));
        if (runsOf(loadWeeks[i]).some((s) => s.isKeySession && before.has(s.workoutId))) repeats++;
      }
      expect(repeats, c.label).toBeGreaterThan(0);
    });
  });
});

describe("a declared volume is where the plan starts", () => {
  for (const [level, km] of [["beginner", 15], ["intermediate", 25], ["advanced", 50]] as const) {
    test(`${level} at ${km} km a week, half marathon, 4 days`, async () => {
      const plan = await build({
        label: level, raceDistance: "semi", runnerLevel: level, trainingGoal: "time", daysPerWeek: 4, currentWeeklyKm: km,
      });
      expect(plan.weeks[0].targetKm ?? 0).toBeLessThanOrEqual(Math.ceil(km * 1.15));
    });
  }
});

describe("hard-day budget", () => {
  test("one hard day in the base, two in build and peak, three only for advanced runners who compete on 5 days or more", () => {
    expect(hardDayBudget("base", "time", "intermediate", 4)).toBe(1);
    expect(hardDayBudget("build", "time", "intermediate", 4)).toBe(2);
    expect(hardDayBudget("build", "time", "intermediate", 3)).toBe(1);
    expect(hardDayBudget("build", "finish", "intermediate", 5)).toBe(1);
    expect(hardDayBudget("peak", "finish", "intermediate", 4)).toBe(2);
    expect(hardDayBudget("peak", "compete", "intermediate", 6)).toBe(2);
    expect(hardDayBudget("peak", "compete", "advanced", 5)).toBe(3);
    expect(hardDayBudget("peak", "compete", "advanced", 4)).toBe(2);
  });
});
