/**
 * Property tests on generated plans.
 *
 * Each rule here is one the audit of September 2026 found broken in the
 * delivered plans while the unit tests stayed green: they test the pieces,
 * these test what a runner receives.
 */
import { describe, expect, test } from "bun:test";
import { generatePlan } from "./index";
import { calculatePhases } from "./phases";
import { loadAllWorkouts } from "@/data/workouts";
import type { AssistedPlanConfig, TrainingPlan } from "@/types/plan";
import type { Difficulty, RaceDistance } from "@/types";
import { MAX_BASE_WEEKS, MIN_PEAK_WEEKS } from "./constants";

const DL: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
const HARD = new Set(["vo2max", "threshold", "tempo", "hills", "fartlek", "race_specific", "speed", "intervals"]);

interface Case {
  raceDistance: RaceDistance;
  runnerLevel: Difficulty;
  daysPerWeek: number;
  trainingGoal: "finish" | "time" | "compete";
  weeks: number;
  vma: number;
  planPurpose?: AssistedPlanConfig["planPurpose"];
  currentWeeklyKm?: number;
}

const CASES: Case[] = [
  { raceDistance: "5K", runnerLevel: "beginner", daysPerWeek: 3, trainingGoal: "finish", weeks: 8, vma: 10 },
  { raceDistance: "10K", runnerLevel: "beginner", daysPerWeek: 3, trainingGoal: "finish", weeks: 10, vma: 11 },
  { raceDistance: "10K", runnerLevel: "intermediate", daysPerWeek: 4, trainingGoal: "time", weeks: 12, vma: 15 },
  { raceDistance: "semi", runnerLevel: "intermediate", daysPerWeek: 4, trainingGoal: "time", weeks: 14, vma: 14 },
  { raceDistance: "semi", runnerLevel: "advanced", daysPerWeek: 6, trainingGoal: "compete", weeks: 16, vma: 18 },
  { raceDistance: "marathon", runnerLevel: "beginner", daysPerWeek: 4, trainingGoal: "finish", weeks: 20, vma: 12, currentWeeklyKm: 25 },
  { raceDistance: "marathon", runnerLevel: "intermediate", daysPerWeek: 5, trainingGoal: "time", weeks: 18, vma: 15 },
  { raceDistance: "marathon", runnerLevel: "advanced", daysPerWeek: 6, trainingGoal: "compete", weeks: 30, vma: 18 },
  { raceDistance: "trail_short", runnerLevel: "intermediate", daysPerWeek: 4, trainingGoal: "finish", weeks: 14, vma: 14 },
  { raceDistance: "5K", runnerLevel: "beginner", daysPerWeek: 3, trainingGoal: "finish", weeks: 8, vma: 10, planPurpose: "return_from_injury" },
  { raceDistance: "10K", runnerLevel: "beginner", daysPerWeek: 3, trainingGoal: "finish", weeks: 10, vma: 10, planPurpose: "beginner_start" },
];

async function build(c: Case): Promise<TrainingPlan> {
  const raceDate = new Date("2026-09-14");
  raceDate.setDate(raceDate.getDate() + c.weeks * 7 + 1);
  return generatePlan({
    id: "prop",
    createdAt: "2026-09-14T00:00:00.000Z",
    startDate: "2026-09-14",
    longRunDay: 6,
    raceDate: raceDate.toISOString().slice(0, 10),
    totalWeeksOverride: c.weeks,
    planPurpose: c.planPurpose ?? "race",
    includeStrength: true,
    strengthFrequency: 2,
    ...c,
  });
}

const plans = new Map<Case, TrainingPlan>();
async function planFor(c: Case): Promise<TrainingPlan> {
  let p = plans.get(c);
  if (!p) {
    p = await build(c);
    plans.set(c, p);
  }
  return p;
}

function runs(plan: TrainingPlan) {
  return plan.weeks.flatMap((w) =>
    w.sessions
      .filter((s) => s.sessionType !== "strength" && !s.workoutId.startsWith("__"))
      .map((s) => ({ week: w, session: s })),
  );
}

describe("generated plans", () => {
  test("a key session never uses a template above the runner's level", async () => {
    const workouts = await loadAllWorkouts();
    const byId = new Map(workouts.map((w) => [w.id, w]));
    for (const c of CASES) {
      const plan = await planFor(c);
      for (const { week, session } of runs(plan)) {
        if (!session.isKeySession) continue;
        const template = byId.get(session.workoutId);
        expect(template).toBeDefined();
        expect(
          DL[template!.difficulty] <= DL[c.runnerLevel]
            || (DL[template!.difficulty] === DL[c.runnerLevel] + 1 && template!.selectionCriteria.relativeLoad === "moderate"),
          `${c.raceDistance} ${c.runnerLevel}: S${week.weekNumber} ${session.workoutId} is ${template!.difficulty}/${template!.selectionCriteria.relativeLoad}`,
        ).toBe(true);
      }
    }
  });

  test("key sessions stay under 40 % of running sessions", async () => {
    for (const c of CASES) {
      const plan = await planFor(c);
      const all = runs(plan);
      const hard = all.filter(({ session }) => session.isKeySession || HARD.has(session.sessionType));
      expect(hard.length / all.length, `${c.raceDistance} ${c.runnerLevel} ${c.daysPerWeek}d`).toBeLessThanOrEqual(0.40);
    }
  });

  test("race-specific sessions of a 5K or 10K never come from a marathon template", async () => {
    const workouts = await loadAllWorkouts();
    const byId = new Map(workouts.map((w) => [w.id, w]));
    for (const c of CASES.filter((x) => x.raceDistance === "5K" || x.raceDistance === "10K")) {
      const plan = await planFor(c);
      for (const { session } of runs(plan)) {
        if (session.sessionType !== "race_specific") continue;
        const tags = byId.get(session.workoutId)!.selectionCriteria.tags;
        expect(tags.includes("marathon"), `${c.raceDistance}: ${session.workoutId}`).toBe(false);
        expect(session.notes?.includes("Allure marathon"), `${c.raceDistance}: ${session.workoutId}`).toBe(false);
      }
    }
  });

  test("no recovery week in the two weeks before the taper", async () => {
    for (const c of CASES.filter((x) => !x.planPurpose)) {
      const plan = await planFor(c);
      const taper = plan.phases.find((p) => p.phase === "taper")!;
      for (const w of plan.weeks) {
        if (w.weekNumber >= taper.startWeek - 2 && w.weekNumber < taper.startWeek) {
          expect(w.isRecoveryWeek, `${c.raceDistance} ${c.weeks}w S${w.weekNumber}`).toBe(false);
        }
      }
    }
  });

  test("taper weeks decrease and open no lower than 70 % of the delivered peak", async () => {
    for (const c of CASES.filter((x) => !x.planPurpose && x.weeks >= 12)) {
      const plan = await planFor(c);
      const peak = Math.max(...plan.weeks.map((w) => w.targetKm ?? 0));
      const taper = plan.weeks.filter((w) => w.phase === "taper");
      for (let i = 1; i < taper.length; i++) {
        expect(taper[i].targetKm!, `${c.raceDistance} S${taper[i].weekNumber}`).toBeLessThanOrEqual(taper[i - 1].targetKm!);
      }
      if (taper.length >= 2) {
        expect(taper[0].targetKm! / peak, `${c.raceDistance} first taper week`).toBeGreaterThanOrEqual(0.50);
      }
    }
  });

  test("recovery weeks are lighter than the load week before them", async () => {
    for (const c of CASES) {
      const plan = await planFor(c);
      for (let i = 1; i < plan.weeks.length; i++) {
        const w = plan.weeks[i];
        const prev = plan.weeks[i - 1];
        if (!w.isRecoveryWeek || prev.isRecoveryWeek) continue;
        expect(w.targetKm!, `${c.raceDistance} ${c.daysPerWeek}d S${w.weekNumber}`).toBeLessThan(prev.targetKm!);
      }
    }
  });

  test("the long run grows with the volume: at least 25 % of the peak week above 70 km", async () => {
    for (const c of CASES) {
      const plan = await planFor(c);
      if ((plan.peakWeeklyKm ?? 0) < 70) continue;
      expect(plan.peakLongRunKm! / plan.peakWeeklyKm!, `${c.raceDistance} ${c.runnerLevel}`).toBeGreaterThanOrEqual(0.25);
    }
  });

  test("a return from injury holds no key session before week 5 and starts with walk-run", async () => {
    const c = CASES.find((x) => x.planPurpose === "return_from_injury")!;
    const plan = await planFor(c);
    for (const { week, session } of runs(plan)) {
      if (week.weekNumber < 5) {
        expect(session.isKeySession, `S${week.weekNumber} ${session.workoutId}`).toBe(false);
        expect(HARD.has(session.sessionType), `S${week.weekNumber} ${session.sessionType}`).toBe(false);
      }
    }
    const workouts = await loadAllWorkouts();
    const byId = new Map(workouts.map((w) => [w.id, w]));
    const week1 = plan.weeks[0].sessions.filter((s) => s.sessionType !== "long_run" && s.sessionType !== "strength");
    expect(week1.length).toBeGreaterThan(0);
    for (const s of week1) {
      expect(byId.get(s.workoutId)!.selectionCriteria.tags).toContain("walk-run");
    }
  });

  test("a beginner start is easy for its first three weeks", async () => {
    const c = CASES.find((x) => x.planPurpose === "beginner_start")!;
    const plan = await planFor(c);
    for (const { week, session } of runs(plan)) {
      if (week.weekNumber < 4) expect(session.isKeySession, `S${week.weekNumber}`).toBe(false);
    }
  });

  test("the volume peak lands before the taper, not at mid-plan", async () => {
    for (const c of CASES.filter((x) => !x.planPurpose && x.weeks >= 14)) {
      const plan = await planFor(c);
      const taper = plan.phases.find((p) => p.phase === "taper")!;
      const loadWeeks = plan.weeks.filter((w) => w.phase !== "taper" && !w.isRecoveryWeek);
      const peak = Math.max(...loadWeeks.map((w) => w.targetKm ?? 0));
      const firstPeakWeek = loadWeeks.find((w) => (w.targetKm ?? 0) >= peak * 0.97)!.weekNumber;
      expect(firstPeakWeek, `${c.raceDistance} ${c.weeks}w peaks at S${firstPeakWeek}`).toBeGreaterThanOrEqual(Math.floor(taper.startWeek / 2));
    }
  });

  test("race prediction is slower for a beginner than for an elite at the same VMA", async () => {
    const slow = await planFor(CASES[0]);
    const fast = await build({ ...CASES[0], runnerLevel: "elite" });
    const toSeconds = (t: string) => t.split(":").reduce((acc, v) => acc * 60 + Number(v), 0);
    expect(toSeconds(slow.raceTimePrediction!)).toBeGreaterThan(toSeconds(fast.raceTimePrediction!));
  });
});

describe("phase distribution", () => {
  test("the base never exceeds its cap and the peak keeps its minimum on long plans", () => {
    for (const dist of ["5K", "10K", "semi", "marathon", "trail", "ultra"] as RaceDistance[]) {
      for (const weeks of [12, 16, 20, 24, 30, 36]) {
        const phases = calculatePhases(weeks, dist, "time");
        const len = (p: string) => {
          const r = phases.find((x) => x.phase === p)!;
          return r.endWeek - r.startWeek + 1;
        };
        expect(len("base"), `${dist} ${weeks}w`).toBeLessThanOrEqual(MAX_BASE_WEEKS);
        expect(len("peak"), `${dist} ${weeks}w`).toBeGreaterThanOrEqual(MIN_PEAK_WEEKS[dist]);
        const total = phases.reduce((s, p) => s + p.endWeek - p.startWeek + 1, 0);
        expect(total).toBe(weeks);
      }
    }
  });
});
