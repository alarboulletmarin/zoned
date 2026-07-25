/**
 * Share a race simulation as a URL — no backend involved.
 *
 * A simulation is fully described by its five inputs, and `generateRacePlan()`
 * is deterministic, so the link carries the inputs and the recipient's browser
 * rebuilds the km-by-km plan. That keeps the URL around 110 chars instead of
 * serializing every split.
 *
 * Unlike weeks and workouts, there is nothing to import into a library here:
 * the simulator page *is* the result, so `/race-simulator/shared?d=…` renders
 * the simulator itself with its state preloaded.
 */

import type { SavedSimulation } from "@/lib/raceSimStorage";
import { decodePayload, encodePayload, shareUrl } from "./codec";

type Strategy = SavedSimulation["input"]["strategy"];
type SimulationInput = SavedSimulation["input"];

/** Append only — indexes are baked into links already sent. */
const STRATEGY_CODES: Strategy[] = ["even", "negative", "positive"];

export interface SharedSimulationPayload {
  v: 1;
  /** Distance in km. */
  d: number;
  /** Target time in seconds. */
  t: number;
  /** Start time as minutes past midnight ("08:30" → 510). */
  s: number;
  /** Strategy code, 1-based. */
  st: number;
  /** Body weight in kg, omitted when unset. */
  w?: number;
}

/** "08:30" → 510. Returns null on anything that is not HH:MM. */
function startTimeToMinutes(startTime: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(startTime);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToStartTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function encodeSharedSimulation(input: SimulationInput): string {
  const payload: SharedSimulationPayload = {
    v: 1,
    d: input.distanceKm,
    t: Math.round(input.targetTimeSeconds),
    s: startTimeToMinutes(input.startTime) ?? 0,
    st: Math.max(1, STRATEGY_CODES.indexOf(input.strategy) + 1),
    ...(input.bodyWeightKg ? { w: input.bodyWeightKg } : {}),
  };
  return encodePayload(payload);
}

export function sharedSimulationUrl(input: SimulationInput): string {
  return shareUrl("/race-simulator/shared", encodeSharedSimulation(input));
}

export function decodeSharedSimulation(encoded: string): SimulationInput | null {
  const obj = decodePayload(encoded);
  if (!obj) return null;
  if (obj.v !== 1) return null;

  const { d, t, s, st, w } = obj;
  if (typeof d !== "number" || !Number.isFinite(d) || d <= 0 || d > 1000) return null;
  if (typeof t !== "number" || !Number.isFinite(t) || t <= 0) return null;
  if (typeof s !== "number" || !Number.isInteger(s) || s < 0 || s > 1439) return null;

  const strategy = typeof st === "number" ? STRATEGY_CODES[st - 1] : undefined;
  if (!strategy) return null;

  const weight = typeof w === "number" && Number.isFinite(w) && w > 0 ? w : undefined;

  return {
    distanceKm: d,
    targetTimeSeconds: t,
    startTime: minutesToStartTime(s),
    strategy,
    ...(weight ? { bodyWeightKg: weight } : {}),
  };
}
