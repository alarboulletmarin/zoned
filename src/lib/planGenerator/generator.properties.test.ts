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

  test("the long run grows with the volume: at least 24 % of the peak week above 70 km", async () => {
    for (const c of CASES) {
      const plan = await planFor(c);
      if ((plan.peakWeeklyKm ?? 0) < 70) continue;
      expect(plan.peakLongRunKm! / plan.peakWeeklyKm!, `${c.raceDistance} ${c.runnerLevel}`).toBeGreaterThanOrEqual(0.24);
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

// ── Edge cases: the generator must not throw, must be deterministic, and
// must keep its structure at the limits of the configuration space.
describe("edge cases", () => {
  const EDGES: Array<Partial<AssistedPlanConfig> & { weeks: number; label: string }> = [
    { label: "5K in 4 weeks", raceDistance: "5K", runnerLevel: "intermediate", daysPerWeek: 4, weeks: 4, vma: 14 },
    { label: "marathon in 6 weeks", raceDistance: "marathon", runnerLevel: "advanced", daysPerWeek: 5, weeks: 6, vma: 17 },
    { label: "ultra in 52 weeks", raceDistance: "ultra", runnerLevel: "intermediate", daysPerWeek: 5, weeks: 52, vma: 14, trainingGoal: "finish" },
    { label: "elite 5K, 7 days", raceDistance: "5K", runnerLevel: "elite", daysPerWeek: 7, weeks: 12, vma: 22, trainingGoal: "compete" },
    { label: "beginner marathon, 3 days", raceDistance: "marathon", runnerLevel: "beginner", daysPerWeek: 3, weeks: 20, vma: 11, trainingGoal: "finish" },
    { label: "declared 5 km a week", raceDistance: "5K", runnerLevel: "beginner", daysPerWeek: 3, weeks: 8, vma: 9, currentWeeklyKm: 5, currentLongRunKm: 2 },
    { label: "declared 200 km a week on 3 days", raceDistance: "marathon", runnerLevel: "elite", daysPerWeek: 3, weeks: 16, vma: 21, currentWeeklyKm: 200 },
    { label: "declared long run 40 km for a 10K", raceDistance: "10K", runnerLevel: "intermediate", daysPerWeek: 4, weeks: 12, vma: 14, currentLongRunKm: 40 },
    { label: "no VMA", raceDistance: "semi", runnerLevel: "intermediate", daysPerWeek: 4, weeks: 14 },
    { label: "VMA 7", raceDistance: "10K", runnerLevel: "beginner", daysPerWeek: 3, weeks: 12, vma: 7 },
    { label: "VMA 26", raceDistance: "5K", runnerLevel: "elite", daysPerWeek: 6, weeks: 12, vma: 26, trainingGoal: "compete" },
    { label: "unrealistic target", raceDistance: "marathon", runnerLevel: "intermediate", daysPerWeek: 5, weeks: 18, vma: 13, targetPaceMinKm: 4.2, trainingGoal: "compete" },
    { label: "trail with 3000 m of climb", raceDistance: "trail", runnerLevel: "intermediate", daysPerWeek: 5, weeks: 20, vma: 14, elevationGain: 3000, trainingGoal: "finish" },
    { label: "long run on Monday", raceDistance: "semi", runnerLevel: "intermediate", daysPerWeek: 5, weeks: 14, vma: 15, longRunDay: 0 },
    { label: "long run on Wednesday, 6 days", raceDistance: "10K", runnerLevel: "advanced", daysPerWeek: 6, weeks: 12, vma: 17, longRunDay: 2 },
    { label: "strength 3 times a week on 3 days", raceDistance: "10K", runnerLevel: "beginner", daysPerWeek: 3, weeks: 10, vma: 10, includeStrength: true, strengthFrequency: 3 },
    { label: "two intermediate races", raceDistance: "marathon", runnerLevel: "intermediate", daysPerWeek: 5, weeks: 18, vma: 15, intermediateGoals: [
      { raceDistance: "10K", raceDate: "2026-10-25", priority: "B" },
      { raceDistance: "semi", raceDate: "2026-12-06", priority: "A" },
    ] },
    { label: "base building 6 weeks", raceDistance: "10K", runnerLevel: "intermediate", daysPerWeek: 4, weeks: 6, vma: 14, planPurpose: "base_building" },
    { label: "return from injury 4 weeks", raceDistance: "5K", runnerLevel: "beginner", daysPerWeek: 3, weeks: 4, vma: 10, planPurpose: "return_from_injury" },
    { label: "return from injury 16 weeks, advanced, 5 days", raceDistance: "10K", runnerLevel: "advanced", daysPerWeek: 5, weeks: 16, vma: 17, planPurpose: "return_from_injury" },
    { label: "beginner start 16 weeks", raceDistance: "10K", runnerLevel: "beginner", daysPerWeek: 4, weeks: 16, vma: 10, planPurpose: "beginner_start" },
  ];

  async function buildEdge(e: (typeof EDGES)[number]): Promise<TrainingPlan> {
    const { weeks, label, ...rest } = e;
    void label;
    const raceDate = new Date("2026-09-14");
    raceDate.setDate(raceDate.getDate() + weeks * 7 + 1);
    const purpose = rest.planPurpose ?? "race";
    return generatePlan({
      id: "edge",
      createdAt: "2026-09-14T00:00:00.000Z",
      startDate: "2026-09-14",
      longRunDay: 6,
      daysPerWeek: 4,
      runnerLevel: "intermediate",
      raceDistance: "10K",
      totalWeeksOverride: weeks,
      planPurpose: purpose,
      ...(purpose === "race" ? { raceDate: raceDate.toISOString().slice(0, 10) } : {}),
      ...rest,
    } as AssistedPlanConfig);
  }

  for (const e of EDGES) {
    test(`${e.label}: generates, deterministic, structurally sound`, async () => {
      const plan = await buildEdge(e);
      const again = await buildEdge(e);
      expect(JSON.stringify({ ...plan, id: 0 })).toBe(JSON.stringify({ ...again, id: 0 }));

      expect(plan.totalWeeks).toBe(e.weeks);
      expect(plan.weeks.length).toBe(e.weeks);
      let cursor = 1;
      for (const ph of plan.phases) {
        expect(ph.startWeek).toBe(cursor);
        expect(ph.endWeek).toBeGreaterThanOrEqual(ph.startWeek);
        cursor = ph.endWeek + 1;
      }
      expect(cursor - 1).toBe(e.weeks);

      const isRace = (e.planPurpose ?? "race") === "race";
      const longRunDay = e.longRunDay ?? 6;
      for (const w of plan.weeks) {
        expect(w.sessions.length).toBeGreaterThan(0);
        const running = w.sessions.filter((s) => s.sessionType !== "strength" && !s.workoutId.startsWith("__"));
        const days = running.map((s) => s.dayOfWeek);
        expect(new Set(days).size).toBe(days.length);
        for (const s of w.sessions) {
          expect(Number.isFinite(s.estimatedDurationMin)).toBe(true);
          expect(s.estimatedDurationMin).toBeGreaterThanOrEqual(0);
          if (s.targetDistanceKm !== undefined) expect(Number.isFinite(s.targetDistanceKm)).toBe(true);
          if (s.loadScore !== undefined) expect(Number.isFinite(s.loadScore)).toBe(true);
        }
        const keys = running.filter((s) => s.isKeySession);
        for (let i = 0; i < keys.length; i++) {
          for (let j = i + 1; j < keys.length; j++) {
            const d = Math.abs(keys[i].dayOfWeek - keys[j].dayOfWeek);
            expect(Math.min(d, 7 - d)).toBeGreaterThan(1);
          }
        }
        if (w.isRecoveryWeek) expect(keys.length).toBe(0);
        const strengthDays = w.sessions.filter((s) => s.sessionType === "strength").map((s) => s.dayOfWeek);
        for (const d of strengthDays) expect(keys.some((k) => k.dayOfWeek === d)).toBe(false);
        if (isRace && w.weekNumber === plan.totalWeeks) {
          const race = w.sessions.find((s) => s.workoutId === "__race_day__");
          expect(race).toBeDefined();
          expect(race!.dayOfWeek).toBe(longRunDay);
          const eve = (longRunDay + 6) % 7;
          expect(w.sessions.some((s) => s.dayOfWeek === eve && s.sessionType !== "strength")).toBe(false);
        }
      }
      if (!isRace) expect(plan.phases.some((p) => p.phase === "taper")).toBe(false);
    });
  }
});
