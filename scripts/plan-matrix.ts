/**
 * Plan matrix, the generator measured on every profile a runner can pick.
 *
 * The unit and property tests check rules on a handful of configurations.
 * This script generates the whole grid (distance, level, goal, days a week,
 * with and without a declared weekly volume, plus the non-race purposes) and
 * measures what a runner actually receives: how many hard days, how much
 * hill work on a road plan, templates above the runner's level, the first
 * week against the volume declared, easy runs longer than the long run,
 * expert templates handed to a beginner, and so on.
 *
 * It is the before/after instrument for any change to the generator or the
 * catalogue:
 *
 *   bun run scripts/plan-matrix.ts --out before.json
 *   (change things)
 *   bun run scripts/plan-matrix.ts --out after.json
 *   bun run scripts/plan-matrix.ts --compare before.json after.json
 *
 * Metrics are computed from the templates themselves (blocks, tags,
 * environment), never from flags the generator sets, so a generator that
 * mislabels a session cannot hide it.
 */

import { writeFileSync, readFileSync } from "fs";
import { generatePlan } from "../src/lib/planGenerator/index";
import { auditPlan } from "../src/lib/planGenerator/audit";
import { loadAllWorkouts } from "../src/data/workouts";
import type { AssistedPlanConfig, PlanPurpose, RaceDistance, TrainingGoal, TrainingPlan } from "../src/types/plan";
import type { Difficulty, WorkoutTemplate } from "../src/types";

const DISTANCES: RaceDistance[] = ["5K", "10K", "semi", "marathon", "trail_short", "trail", "ultra"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const GOALS: TrainingGoal[] = ["finish", "time", "compete"];
const DAYS = [3, 4, 5, 6];
const DL: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
/** Typical VMA of each level, the one the wizard suggests the level from */
const VMA: Record<Difficulty, number> = { beginner: 11, intermediate: 13.5, advanced: 16.5, elite: 19.5 };
/** A plan length inside the recommended range of each distance */
const WEEKS: Record<RaceDistance, number> = {
  "5K": 10, "10K": 12, semi: 14, marathon: 18, trail_short: 14, trail: 18, ultra: 24,
};
/** Weekly km a runner of each level declares when asked, mid-range of the wizard hint */
const DECLARED_KM: Record<Difficulty, number> = { beginner: 12, intermediate: 30, advanced: 55, elite: 85 };
/** Top of the weekly km each level hint names in the wizard (elite: "more than 70") */
const HINT_TOP_KM: Record<Difficulty, number> = { beginner: 15, intermediate: 40, advanced: 70, elite: 100 };
const ROAD = new Set<RaceDistance>(["5K", "10K", "semi", "marathon"]);
const QUALITY_INTENSITIES = new Set(["M", "T", "I", "R"]);
const QUALITY_TYPES = new Set(["vo2max", "threshold", "tempo", "hills", "fartlek", "race_specific", "speed"]);

/**
 * Templates that need a pool, a heart-rate-variability strap, bad weather or a
 * second run the same day, or that name a coaching method a runner has to look
 * up. Listed here by id rather than read from a tag, so the baseline measured
 * before any tag existed stays comparable.
 */
const EXPERT_OR_SITUATIONAL = new Set([
  "END-010", "END-012", "END-015", "END-016", "END-017", "END-006", "SL-009",
  "TMP-018", "TMP-019", "THR-020", "VMA-023", "FAR-016", "MIX-014",
  "REC-006", "REC-010", "REC-013", "REC-014",
]);

interface Case {
  key: string;
  raceDistance: RaceDistance;
  runnerLevel: Difficulty;
  trainingGoal: TrainingGoal;
  daysPerWeek: number;
  declared: boolean;
  planPurpose: PlanPurpose;
  weeks: number;
}

function cases(): Case[] {
  const out: Case[] = [];
  for (const raceDistance of DISTANCES)
    for (const runnerLevel of LEVELS)
      for (const trainingGoal of GOALS)
        for (const daysPerWeek of DAYS)
          for (const declared of [false, true])
            out.push({
              key: `${raceDistance}|${runnerLevel}|${trainingGoal}|${daysPerWeek}j|${declared ? "km" : "-"}`,
              raceDistance, runnerLevel, trainingGoal, daysPerWeek, declared,
              planPurpose: "race", weeks: WEEKS[raceDistance],
            });
  const purposes: { p: PlanPurpose; d: RaceDistance; w: number; days: number[] }[] = [
    { p: "base_building", d: "10K", w: 12, days: [3, 4, 5] },
    { p: "return_from_injury", d: "5K", w: 10, days: [3, 4] },
    { p: "beginner_start", d: "5K", w: 8, days: [3, 4, 5] },
  ];
  for (const { p, d, w, days } of purposes)
    for (const runnerLevel of LEVELS)
      for (const daysPerWeek of days)
        out.push({
          key: `${p}|${runnerLevel}|${daysPerWeek}j`,
          raceDistance: d, runnerLevel, trainingGoal: p === "base_building" ? "time" : "finish",
          daysPerWeek, declared: false, planPurpose: p, weeks: w,
        });
  return out;
}

export interface Metrics {
  key: string;
  ok: boolean;
  error?: string;
  runs: number;
  keySessions: number;
  qualityLongRuns: number;
  /** (key sessions + quality long runs) / running sessions */
  hardShare: number;
  /** Most hard days in a single week */
  maxHardInWeek: number;
  weeksWith3Hard: number;
  /** Non-key sessions on hills (easy runs and long runs), road plans only */
  hillyEasyOrLong: number;
  hillKeySessions: number;
  aboveLevel: number;
  aboveLevelLong: number;
  /** Long runs of a 5K-semi plan whose main set holds marathon-pace work */
  offDistanceLong: number;
  easyLongerThanLong: number;
  expertTemplates: number;
  week1Km: number;
  /** Week 1 km / declared km, 0 when nothing was declared */
  week1VsDeclared: number;
  /** Undeclared volume: week 1 km / top of the weekly km the level hint promises */
  week1VsHintTop: number;
  peakKm: number;
  /** Largest week-over-week increase, load weeks only */
  maxJumpPct: number;
  /** Distinct key templates / key sessions, 1 = never repeats */
  keyVariety: number;
  raceWeekMaxEasyMin: number;
  auditErrors: number;
  auditWarnings: number;
  auditCodes: string[];
}

function isQualityLongRun(w: WorkoutTemplate | undefined): boolean {
  if (!w) return false;
  return w.mainSetTemplate.some((b) => b.intensityType && QUALITY_INTENSITIES.has(b.intensityType));
}

function isHilly(w: WorkoutTemplate | undefined): boolean {
  if (!w) return false;
  return w.environment.requiresHills
    || w.selectionCriteria.tags.includes("hills")
    || w.mainSetTemplate.some((b) => (b.elevationGainM ?? 0) > 0);
}

function measure(c: Case, plan: TrainingPlan, byId: Map<string, WorkoutTemplate>): Metrics {
  let runs = 0, keySessions = 0, qualityLongRuns = 0, maxHardInWeek = 0, weeksWith3Hard = 0;
  let hillyEasyOrLong = 0, hillKeySessions = 0, aboveLevel = 0, aboveLevelLong = 0;
  let offDistanceLong = 0, easyLongerThanLong = 0, expertTemplates = 0, raceWeekMaxEasyMin = 0;
  const keyIds: string[] = [];
  const level = DL[c.runnerLevel];
  const lastWeek = plan.weeks[plan.weeks.length - 1]?.weekNumber;

  for (const week of plan.weeks) {
    let hardThisWeek = 0;
    let longMin = 0;
    let maxEasyMin = 0;
    for (const s of week.sessions) {
      if (s.sessionType === "strength" || s.workoutId.startsWith("__")) continue;
      runs++;
      const t = byId.get(s.workoutId);
      if (t && DL[t.difficulty] > level) {
        aboveLevel++;
        if (s.sessionType === "long_run") aboveLevelLong++;
      }
      if (EXPERT_OR_SITUATIONAL.has(s.workoutId)) expertTemplates++;
      const isKey = QUALITY_TYPES.has(s.sessionType) && s.isKeySession;
      if (isKey) {
        keySessions++;
        hardThisWeek++;
        keyIds.push(s.workoutId);
        if (s.sessionType === "hills") hillKeySessions++;
      } else if (ROAD.has(c.raceDistance) && isHilly(t)) {
        hillyEasyOrLong++;
      }
      if (s.sessionType === "long_run") {
        longMin = Math.max(longMin, s.estimatedDurationMin);
        if (isQualityLongRun(t)) {
          qualityLongRuns++;
          hardThisWeek++;
        }
        if (["5K", "10K", "semi"].includes(c.raceDistance)
          && t?.mainSetTemplate.some((b) => b.intensityType === "M" && (b.durationMin ?? 0) >= 45)) {
          offDistanceLong++;
        }
      } else if (!isKey) {
        maxEasyMin = Math.max(maxEasyMin, s.estimatedDurationMin);
      }
    }
    maxHardInWeek = Math.max(maxHardInWeek, hardThisWeek);
    if (hardThisWeek >= 3) weeksWith3Hard++;
    if (week.weekNumber === lastWeek) raceWeekMaxEasyMin = maxEasyMin;
    else if (longMin > 0 && week.phase !== "taper" && maxEasyMin > longMin) easyLongerThanLong++;
  }

  // Against the last load week: coming back from a recovery week is not a jump.
  // Week 1 is skipped, it may be partial when the plan starts mid-week.
  let maxJumpPct = 0;
  let lastLoad = 0;
  for (const w of plan.weeks.slice(0, -1)) {
    const km = w.targetKm ?? 0;
    if (w.isRecoveryWeek || w.phase === "taper") continue;
    if (lastLoad > 0) maxJumpPct = Math.max(maxJumpPct, Math.round(((km - lastLoad) / lastLoad) * 100));
    lastLoad = km;
  }

  const findings = auditPlan(plan);
  const week1Km = plan.weeks[0]?.targetKm ?? 0;
  return {
    key: c.key,
    ok: true,
    runs,
    keySessions,
    qualityLongRuns,
    hardShare: runs ? Math.round(((keySessions + qualityLongRuns) / runs) * 1000) / 1000 : 0,
    maxHardInWeek,
    weeksWith3Hard,
    hillyEasyOrLong,
    hillKeySessions,
    aboveLevel,
    aboveLevelLong,
    offDistanceLong,
    easyLongerThanLong,
    expertTemplates,
    week1Km,
    week1VsDeclared: c.declared ? Math.round((week1Km / DECLARED_KM[c.runnerLevel]) * 100) / 100 : 0,
    week1VsHintTop: !c.declared && c.planPurpose === "race"
      ? Math.round((week1Km / HINT_TOP_KM[c.runnerLevel]) * 100) / 100
      : 0,
    peakKm: plan.peakWeeklyKm ?? 0,
    maxJumpPct,
    keyVariety: keyIds.length ? Math.round((new Set(keyIds).size / keyIds.length) * 100) / 100 : 0,
    raceWeekMaxEasyMin: Math.round(raceWeekMaxEasyMin),
    auditErrors: findings.filter((f) => f.severity === "error").length,
    auditWarnings: findings.filter((f) => f.severity === "warning").length,
    auditCodes: [...new Set(findings.filter((f) => f.severity !== "info").map((f) => f.code))],
  };
}

async function run(out: string) {
  const all = await loadAllWorkouts();
  const byId = new Map(all.map((w) => [w.id, w]));
  const results: Metrics[] = [];
  for (const c of cases()) {
    const raceDate = new Date("2027-01-04");
    raceDate.setDate(raceDate.getDate() + c.weeks * 7 - 1);
    const config: AssistedPlanConfig = {
      id: "matrix",
      createdAt: "2027-01-04T00:00:00.000Z",
      startDate: "2027-01-04",
      raceDate: raceDate.toISOString().slice(0, 10),
      raceDistance: c.raceDistance,
      runnerLevel: c.runnerLevel,
      trainingGoal: c.trainingGoal,
      daysPerWeek: c.daysPerWeek,
      longRunDay: 6,
      vma: VMA[c.runnerLevel],
      planPurpose: c.planPurpose,
      totalWeeksOverride: c.planPurpose === "race" ? undefined : c.weeks,
      currentWeeklyKm: c.declared ? DECLARED_KM[c.runnerLevel] : undefined,
    };
    try {
      const plan = await generatePlan(config);
      results.push(measure(c, plan, byId));
    } catch (err) {
      results.push({ key: c.key, ok: false, error: String(err) } as Metrics);
    }
  }
  writeFileSync(out, JSON.stringify(results, null, 1));
  console.log(`${results.length} plans, ${results.filter((r) => !r.ok).length} failed, written to ${out}`);
  summarize(results);
}

// ── Summaries ────────────────────────────────────────────────────────

type Num = Exclude<keyof Metrics, "key" | "ok" | "error" | "auditCodes">;
const COLUMNS: { k: Num; agg: "mean" | "max" | "sum"; label: string }[] = [
  { k: "hardShare", agg: "mean", label: "dur %" },
  { k: "maxHardInWeek", agg: "max", label: "dur/sem max" },
  { k: "weeksWith3Hard", agg: "sum", label: "sem 3 durs" },
  { k: "qualityLongRuns", agg: "sum", label: "SL qualité" },
  { k: "hillyEasyOrLong", agg: "sum", label: "côte cachée" },
  { k: "aboveLevel", agg: "sum", label: "niv. au-dessus" },
  { k: "aboveLevelLong", agg: "sum", label: "SL au-dessus" },
  { k: "offDistanceLong", agg: "sum", label: "SL autre dist." },
  { k: "easyLongerThanLong", agg: "sum", label: "footing>SL" },
  { k: "expertTemplates", agg: "sum", label: "expert" },
  { k: "keyVariety", agg: "mean", label: "variété clés" },
  { k: "week1Km", agg: "mean", label: "S1 km" },
  { k: "week1VsDeclared", agg: "mean", label: "S1/déclaré" },
  { k: "week1VsHintTop", agg: "mean", label: "S1/repère" },
  { k: "peakKm", agg: "mean", label: "pic km" },
  { k: "maxJumpPct", agg: "max", label: "saut % max" },
  { k: "raceWeekMaxEasyMin", agg: "max", label: "sem. course max'" },
  { k: "auditErrors", agg: "sum", label: "audit err" },
  { k: "auditWarnings", agg: "sum", label: "audit warn" },
];

function aggregate(rows: Metrics[], col: (typeof COLUMNS)[number]): number {
  const RATIOS: Num[] = ["week1VsDeclared", "week1VsHintTop"];
  const vals = rows
    .filter((r) => r.ok)
    .map((r) => r[col.k] as number)
    .filter((v) => !RATIOS.includes(col.k) || v > 0);
  if (vals.length === 0) return 0;
  if (col.agg === "max") return Math.max(...vals);
  const sum = vals.reduce((a, b) => a + b, 0);
  return col.agg === "sum" ? sum : Math.round((sum / vals.length) * 100) / 100;
}

function groupOf(r: Metrics): string {
  const [a, b] = r.key.split("|");
  return `${a} ${b}`;
}

function summarize(results: Metrics[]) {
  const groups = new Map<string, Metrics[]>();
  for (const r of results) {
    const g = groupOf(r);
    groups.set(g, [...(groups.get(g) ?? []), r]);
  }
  console.log(["groupe".padEnd(30), ...COLUMNS.map((c) => c.label)].join(" | "));
  for (const [g, rows] of [...groups.entries(), ["TOUT", results] as [string, Metrics[]]]) {
    console.log([g.padEnd(30), ...COLUMNS.map((c) => String(aggregate(rows, c)))].join(" | "));
  }
}

function compare(beforePath: string, afterPath: string) {
  const before: Metrics[] = JSON.parse(readFileSync(beforePath, "utf8"));
  const after: Metrics[] = JSON.parse(readFileSync(afterPath, "utf8"));
  const groups = [...new Set(before.map(groupOf)), "TOUT"];
  const rowsOf = (list: Metrics[], g: string) => (g === "TOUT" ? list : list.filter((r) => groupOf(r) === g));
  console.log(["groupe".padEnd(30), ...COLUMNS.map((c) => c.label)].join(" | "));
  for (const g of groups) {
    const b = rowsOf(before, g);
    const a = rowsOf(after, g);
    console.log([g.padEnd(30), ...COLUMNS.map((c) => `${aggregate(b, c)}>${aggregate(a, c)}`)].join(" | "));
  }
  const failedAfter = after.filter((r) => !r.ok);
  console.log(`\nfailed before ${before.filter((r) => !r.ok).length}, after ${failedAfter.length}`);
  for (const f of failedAfter) console.log(`  ${f.key}: ${f.error}`);
  const codes = (list: Metrics[]) => {
    const m = new Map<string, number>();
    for (const r of list) for (const code of r.auditCodes ?? []) m.set(code, (m.get(code) ?? 0) + 1);
    return m;
  };
  const cb = codes(before), ca = codes(after);
  console.log("\naudit codes (plans concerned), before > after");
  for (const code of [...new Set([...cb.keys(), ...ca.keys()])].sort()) {
    console.log(`  ${code}: ${cb.get(code) ?? 0} > ${ca.get(code) ?? 0}`);
  }
}

const args = process.argv.slice(2);
if (args[0] === "--compare") {
  compare(args[1], args[2]);
} else {
  const i = args.indexOf("--out");
  await run(i >= 0 ? args[i + 1] : "plan-matrix.json");
}
