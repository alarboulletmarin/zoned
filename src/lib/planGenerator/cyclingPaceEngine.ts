/**
 * Cycling Pace Engine — Evidence-based training zone calculations (power + HR).
 *
 * Implements the Coggan 7-zone system derived from Functional Threshold Power
 * (FTP). When FTP is unavailable, the engine falls back to Friel's 7-zone HR
 * model anchored on threshold heart rate.
 *
 * References:
 * - Allen, H. & Coggan, A. (2019). Training and Racing with a Power Meter, 3rd ed.
 * - Friel, J. (2018). The Cyclist's Training Bible, 5th ed. (HR zones).
 * - Seiler, S. (2010). Intensity distribution — applies cross-discipline.
 */

import type { Difficulty } from "@/types";

// ── Coggan 7-zone system ────────────────────────────────────────────

/** Coggan power-based training zones. */
export type CogganZone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6" | "Z7";

/** Coggan intensity labels matching the 7-zone model. */
export type CogganIntensity =
  | "active_recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "anaerobic"
  | "neuromuscular";

export interface PowerZone {
  /** Lower bound of the zone in watts (inclusive). */
  minWatts: number;
  /** Upper bound of the zone in watts (exclusive). Undefined = unlimited (Z7). */
  maxWatts?: number;
  /** Lower bound as % of FTP (inclusive). */
  minPctFtp: number;
  /** Upper bound as % of FTP (exclusive). Undefined = unlimited. */
  maxPctFtp?: number;
}

export interface HrZone {
  /** Lower bound in bpm (inclusive). */
  minBpm: number;
  /** Upper bound in bpm (exclusive). Undefined = unlimited (Z7). */
  maxBpm?: number;
  /** Lower bound as % of threshold HR (inclusive). */
  minPctThrHr: number;
  /** Upper bound as % of threshold HR (exclusive). */
  maxPctThrHr?: number;
}

export interface CyclingZones {
  /** Source FTP in watts (when power-derived). */
  ftpWatts?: number;
  /** Source threshold HR in bpm (when HR-derived). */
  thresholdHr?: number;
  /** Power zones by Coggan label. */
  power?: Record<CogganZone, PowerZone>;
  /** HR zones by Coggan label. */
  hr?: Record<CogganZone, HrZone>;
  /** True if the zones were computed from a real FTP/HR (vs difficulty fallback). */
  fromUserData: boolean;
}

// ── Coggan % FTP bounds (Allen & Coggan, 2019) ──────────────────────
// Higher upper bounds (Z5+) are practical training caps; Z7 is open-ended.

const COGGAN_FTP_PCT: Record<CogganZone, [number, number | undefined]> = {
  Z1: [0, 55],    // Active recovery    — <55% FTP
  Z2: [56, 75],   // Endurance          — 56–75% FTP
  Z3: [76, 90],   // Tempo              — 76–90% FTP
  Z4: [91, 105],  // Lactate Threshold  — 91–105% FTP
  Z5: [106, 120], // VO2max             — 106–120% FTP
  Z6: [121, 150], // Anaerobic capacity — 121–150% FTP
  Z7: [151, undefined], // Neuromuscular — >150% FTP, short bursts
};

// Friel 7-zone HR bounds expressed as % of threshold HR (LTHR).
// Ref: The Cyclist's Training Bible, 5th ed., p. 47.

const FRIEL_HR_PCT: Record<CogganZone, [number, number | undefined]> = {
  Z1: [0, 81],    // Active recovery
  Z2: [82, 88],   // Endurance
  Z3: [89, 93],   // Tempo
  Z4: [94, 100],  // Sub-threshold / threshold
  Z5: [101, 105], // VO2max
  Z6: [106, 120], // Anaerobic
  Z7: [121, undefined], // Neuromuscular
};

// ── Fallback FTP by difficulty ──────────────────────────────────────
// Conservative population estimates (flat, generalist cyclist).

const FALLBACK_FTP_WATTS: Record<Difficulty, number> = {
  beginner: 140,
  intermediate: 200,
  advanced: 260,
  elite: 320,
};

// ── Intensity factor mapping per zone ──────────────────────────────
// Used for TSS calculation and cross-discipline load equivalence.
// IF is the power output normalized by FTP (NP/FTP); these are zone midpoints.

export const COGGAN_ZONE_INTENSITY_FACTORS: Record<CogganZone, number> = {
  Z1: 0.45,
  Z2: 0.65,
  Z3: 0.83,
  Z4: 0.97,
  Z5: 1.10,
  Z6: 1.30,
  Z7: 1.60,
};

// ── Helpers ─────────────────────────────────────────────────────────

function roundWatts(value: number): number {
  return Math.round(value);
}

function roundBpm(value: number): number {
  return Math.round(value);
}

function buildPowerZones(ftpWatts: number): Record<CogganZone, PowerZone> {
  const result = {} as Record<CogganZone, PowerZone>;
  for (const [zone, [minPct, maxPct]] of Object.entries(COGGAN_FTP_PCT) as [
    CogganZone,
    [number, number | undefined],
  ][]) {
    result[zone] = {
      minPctFtp: minPct,
      maxPctFtp: maxPct,
      minWatts: roundWatts((ftpWatts * minPct) / 100),
      maxWatts: maxPct === undefined ? undefined : roundWatts((ftpWatts * maxPct) / 100),
    };
  }
  return result;
}

function buildHrZones(thresholdHr: number): Record<CogganZone, HrZone> {
  const result = {} as Record<CogganZone, HrZone>;
  for (const [zone, [minPct, maxPct]] of Object.entries(FRIEL_HR_PCT) as [
    CogganZone,
    [number, number | undefined],
  ][]) {
    result[zone] = {
      minPctThrHr: minPct,
      maxPctThrHr: maxPct,
      minBpm: roundBpm((thresholdHr * minPct) / 100),
      maxBpm: maxPct === undefined ? undefined : roundBpm((thresholdHr * maxPct) / 100),
    };
  }
  return result;
}

// ── Core functions ──────────────────────────────────────────────────

/**
 * Compute cycling zones from FTP (preferred) and/or threshold HR.
 * If neither is provided, falls back to a difficulty-based FTP estimate.
 * Both power and HR zones are returned when both inputs are provided,
 * so callers can pick whichever the athlete is training with that day.
 */
export function calculateCyclingZones(args: {
  ftpWatts?: number;
  thresholdHr?: number;
  difficulty?: Difficulty;
}): CyclingZones {
  const { ftpWatts, thresholdHr, difficulty } = args;

  const hasRealFtp = typeof ftpWatts === "number" && ftpWatts > 0;
  const hasRealHr = typeof thresholdHr === "number" && thresholdHr > 0;

  const effectiveFtp = hasRealFtp
    ? ftpWatts!
    : hasRealHr
      ? undefined
      : FALLBACK_FTP_WATTS[difficulty ?? "intermediate"];

  const zones: CyclingZones = {
    fromUserData: hasRealFtp || hasRealHr,
  };

  if (effectiveFtp !== undefined) {
    zones.ftpWatts = effectiveFtp;
    zones.power = buildPowerZones(effectiveFtp);
  }

  if (hasRealHr) {
    zones.thresholdHr = thresholdHr!;
    zones.hr = buildHrZones(thresholdHr!);
  }

  return zones;
}

/**
 * Estimate FTP in watts from a 20-minute time-trial power number.
 * Coggan field test: FTP ≈ 0.95 × 20-min power.
 */
export function estimateFtpFrom20Min(power20MinWatts: number): number {
  if (!Number.isFinite(power20MinWatts) || power20MinWatts <= 0) return 0;
  return roundWatts(power20MinWatts * 0.95);
}

/**
 * Estimate FTP from a ramp test final minute average power.
 * Common convention: FTP ≈ 0.75 × final-minute power.
 */
export function estimateFtpFromRamp(finalMinPowerWatts: number): number {
  if (!Number.isFinite(finalMinPowerWatts) || finalMinPowerWatts <= 0) return 0;
  return roundWatts(finalMinPowerWatts * 0.75);
}

/** Map a generic session type to the Coggan zone we want the ride to spend time in. */
export function cyclingSessionTypeToZone(sessionType: string): CogganZone {
  switch (sessionType) {
    case "recovery":
      return "Z1";
    case "endurance":
    case "long_run":
    case "long_ride":
      return "Z2";
    case "tempo":
    case "sweet_spot":
      return "Z3";
    case "threshold":
    case "race_specific":
      return "Z4";
    case "vo2max":
    case "intervals":
      return "Z5";
    case "speed":
      return "Z6";
    case "sprint":
    case "neuromuscular":
      return "Z7";
    default:
      return "Z2";
  }
}

/** Format a power range as a compact "min-max W" string. */
export function formatPowerRange(zone: PowerZone): string {
  if (zone.maxWatts === undefined) return `${zone.minWatts}+ W`;
  return `${zone.minWatts}–${zone.maxWatts} W`;
}

/** Format an HR range as a compact "min-max bpm" string. */
export function formatHrRange(zone: HrZone): string {
  if (zone.maxBpm === undefined) return `${zone.minBpm}+ bpm`;
  return `${zone.minBpm}–${zone.maxBpm} bpm`;
}
