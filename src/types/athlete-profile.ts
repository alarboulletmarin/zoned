import type { Discipline } from "@/types";
import type { RunnerProfile, BenchmarkEntry, PersonalRecord } from "@/types/runner-profile";

/**
 * Multi-discipline athlete profile.
 *
 * Composes the existing {@link RunnerProfile} (kept authoritative for running)
 * with optional cycling and swimming sections so the app can stay 100% compatible
 * with single-discipline users while opening the door to cross-training,
 * cycling-only plans, and triathlon.
 *
 * Storage layout is intentionally split across three localStorage keys so the
 * running profile continues to load untouched when it is all a user has:
 *   - "zoned-runner-profile"   — legacy running profile (unchanged)
 *   - "zoned-cycling-profile"  — cycling metrics (FTP, CP, weekly hours…)
 *   - "zoned-swimming-profile" — swimming metrics (CSS, pool preference…)
 *
 * Read {@link loadAthleteProfile} to assemble the composite view.
 */

export type CyclingBenchmarkType =
  | "ftp_test_20min"
  | "ftp_test_ramp"
  | "critical_power"
  | "time_trial"
  | "lab_test"
  | "other";

export interface CyclingBenchmarkEntry {
  id: string;
  type: CyclingBenchmarkType;
  date: string;
  /** Result in watts for power-based tests, or avg HR for HR-based tests. */
  result: number;
  /** FTP in watts derived from this benchmark (e.g. 0.95 × 20min power). */
  derivedFtp?: number;
  notes?: string;
}

export type SwimBenchmarkType =
  | "css_test_400_200"
  | "css_test_time_trial"
  | "lactate_threshold_swim"
  | "other";

export interface SwimBenchmarkEntry {
  id: string;
  type: SwimBenchmarkType;
  date: string;
  /** Result in seconds per 100m (pace) for CSS-style tests. */
  result: number;
  /** CSS derived from this benchmark (seconds per 100m). */
  derivedCssSecPer100m?: number;
  notes?: string;
}

/** Pool length convention used when rendering swim reps (25m vs 50m). */
export type PoolLength = 25 | 50;

export interface CyclingProfile {
  version: 1;
  /** Functional Threshold Power in watts. */
  ftpWatts?: number;
  /** Threshold heart rate in bpm (fallback when no power meter is available). */
  thresholdHr?: number;
  /** Max heart rate (cycling-specific; typically 5-10 bpm below running FCmax). */
  fcMax?: number;
  /** Critical Power from a 3–12min test. */
  criticalPowerWatts?: number;
  /** Current weekly training time in hours. */
  currentWeeklyHours?: number;
  /** Current typical long ride distance in km. */
  currentLongRideKm?: number;
  benchmarks: CyclingBenchmarkEntry[];
  personalRecords: PersonalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SwimmingProfile {
  version: 1;
  /** Critical Swim Speed in seconds per 100m (pace). */
  cssSecPer100m?: number;
  /** Threshold heart rate while swimming (bpm). */
  thresholdHr?: number;
  /** Current weekly swim volume in metres. */
  currentWeeklyMeters?: number;
  /** Current longest continuous swim in metres. */
  currentLongSwimMeters?: number;
  /** Preferred pool length for workout rendering. */
  preferredPoolLength?: PoolLength;
  benchmarks: SwimBenchmarkEntry[];
  personalRecords: PersonalRecord[];
  createdAt: string;
  updatedAt: string;
}

/** Commute (vélotaf) — recurring cross-training impact on the plan. */
export interface CommutePattern {
  version: 1;
  discipline: Extract<Discipline, "cycling" | "running">;
  /** Days of week when commute happens (0 = Monday … 6 = Sunday). */
  daysOfWeek: number[];
  /** Estimated duration per commute session (minutes, one-way). */
  durationMin: number;
  /** True if commute is counted inside the weekly load budget. */
  includeInPlan: boolean;
  updatedAt: string;
}

export interface AthleteProfile {
  version: 1;
  /** The running side of the athlete — always present, authoritative for running plans. */
  running: RunnerProfile | null;
  /** Optional cycling metrics (FTP, CP, volume). */
  cycling: CyclingProfile | null;
  /** Optional swimming metrics (CSS, pool preference). */
  swimming: SwimmingProfile | null;
  /** Optional commute pattern (recurring impact). */
  commute: CommutePattern | null;
}

// ── Re-exports for consumers that only need the base entries ────────
export type {
  RunnerProfile,
  BenchmarkEntry as RunningBenchmarkEntry,
  PersonalRecord,
};
