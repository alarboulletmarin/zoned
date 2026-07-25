/**
 * Share a training plan as a URL — no backend involved.
 *
 * A generated 12-week plan serializes to ~1700 chars; the config that produced
 * it is ~250. So the link carries the *recipe*, and the recipient's browser
 * regenerates the plan. That only works because `generatePlan()` is seeded
 * from the config (see `planGenerator/rng.ts`) — without that, the same link
 * would produce a different plan for every recipient.
 *
 * Consequence: only assisted plans are shareable this way. Free plans are
 * hand-built and have no config to replay; prebuilt plans already have a
 * public `/plan/prebuilt/:slug` URL.
 */

import type { Difficulty } from "@/types";
import type {
  AssistedPlanConfig,
  PlanConfig,
  PlanPurpose,
  RaceDistance,
  TrainingGoal,
} from "@/types/plan";
import { decodePayload, encodePayload, shareUrl } from "./codec";

const RACE_DISTANCES: RaceDistance[] = [
  "5K",
  "10K",
  "semi",
  "marathon",
  "trail_short",
  "trail",
  "ultra",
];
const GOALS: TrainingGoal[] = ["finish", "time", "compete"];
const PURPOSES: PlanPurpose[] = [
  "race",
  "base_building",
  "return_from_injury",
  "beginner_start",
];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

export interface SharedPlanPayload {
  v: 1;
  /** Race distance code, 1-based. */
  rd: number;
  /** Race date, ISO. */
  rdt: string;
  /** Runner level code, 1-based. */
  lvl: number;
  /** Days per week. */
  dpw: number;
  /** Long run day, 0-6. */
  lrd: number;
  g?: number;
  p?: number;
  vma?: number;
  tp?: number;
  eg?: number;
  sd?: string;
  tw?: number;
  wk?: number;
  lr?: number;
  str?: 1;
  sf?: number;
  /** Race name, free text. */
  rn?: string;
}

/** True when the plan carries a config the recipient can replay. */
export function isShareablePlan(config: PlanConfig): boolean {
  const mode = config.planMode ?? "assisted";
  return mode === "assisted" && !!config.raceDistance && !!config.raceDate;
}

export function encodeSharedPlan(config: PlanConfig): string {
  const payload: SharedPlanPayload = {
    v: 1,
    rd: RACE_DISTANCES.indexOf(config.raceDistance as RaceDistance) + 1,
    rdt: config.raceDate ?? "",
    lvl: Math.max(1, LEVELS.indexOf(config.runnerLevel as Difficulty) + 1),
    dpw: config.daysPerWeek,
    lrd: config.longRunDay ?? 6,
    ...(config.trainingGoal && { g: GOALS.indexOf(config.trainingGoal) + 1 }),
    ...(config.planPurpose && { p: PURPOSES.indexOf(config.planPurpose) + 1 }),
    ...(config.vma && { vma: config.vma }),
    ...(config.targetPaceMinKm && { tp: config.targetPaceMinKm }),
    ...(config.elevationGain && { eg: config.elevationGain }),
    ...(config.startDate && { sd: config.startDate }),
    ...(config.totalWeeksOverride && { tw: config.totalWeeksOverride }),
    ...(config.currentWeeklyKm && { wk: config.currentWeeklyKm }),
    ...(config.currentLongRunKm && { lr: config.currentLongRunKm }),
    ...(config.includeStrength && { str: 1 as const }),
    ...(config.strengthFrequency && { sf: config.strengthFrequency }),
    ...(config.raceName && { rn: config.raceName }),
  };
  return encodePayload(payload);
}

export function sharedPlanUrl(config: PlanConfig): string {
  return shareUrl("/plan/shared", encodeSharedPlan(config));
}

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;

/**
 * Decode into a config ready for `generatePlan()`. `id`/`createdAt` are minted
 * by the caller — they are excluded from the generation seed on purpose.
 */
export function decodeSharedPlan(
  encoded: string,
): Omit<AssistedPlanConfig, "id" | "createdAt"> | null {
  const obj = decodePayload(encoded);
  if (!obj) return null;
  if (obj.v !== 1) return null;

  const raceDistance = RACE_DISTANCES[(obj.rd as number) - 1];
  const runnerLevel = LEVELS[(obj.lvl as number) - 1];
  if (!raceDistance || !runnerLevel) return null;

  if (typeof obj.rdt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(obj.rdt)) return null;

  const daysPerWeek = obj.dpw;
  if (typeof daysPerWeek !== "number" || daysPerWeek < 3 || daysPerWeek > 7) return null;

  const longRunDay = obj.lrd;
  if (typeof longRunDay !== "number" || longRunDay < 0 || longRunDay > 6) return null;

  const goal = GOALS[(obj.g as number) - 1];
  const purpose = PURPOSES[(obj.p as number) - 1];
  const strengthFrequency = obj.sf === 1 || obj.sf === 2 || obj.sf === 3 ? obj.sf : undefined;

  return {
    planMode: "assisted",
    raceDistance,
    raceDate: obj.rdt,
    runnerLevel,
    daysPerWeek,
    longRunDay,
    ...(goal && { trainingGoal: goal }),
    ...(purpose && { planPurpose: purpose }),
    ...(num(obj.vma) && { vma: num(obj.vma) }),
    ...(num(obj.tp) && { targetPaceMinKm: num(obj.tp) }),
    ...(num(obj.eg) && { elevationGain: num(obj.eg) }),
    ...(typeof obj.sd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(obj.sd)
      ? { startDate: obj.sd }
      : {}),
    ...(num(obj.tw) && { totalWeeksOverride: num(obj.tw) }),
    ...(num(obj.wk) && { currentWeeklyKm: num(obj.wk) }),
    ...(num(obj.lr) && { currentLongRunKm: num(obj.lr) }),
    ...(obj.str === 1 && { includeStrength: true }),
    ...(strengthFrequency && { strengthFrequency }),
    ...(typeof obj.rn === "string" && obj.rn.length > 0 ? { raceName: obj.rn } : {}),
  };
}
