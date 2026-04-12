import type { RaceDistance } from "@/types/plan";
import type { Difficulty } from "@/types";

export interface RaceTime {
  totalSeconds: number;
  date?: string;
  label?: string;
}

export type PerformanceReferences = Partial<Record<RaceDistance, RaceTime>>;

export type BenchmarkType =
  | "half_cooper"
  | "critical_velocity"
  | "cooper_12min"
  | "time_trial"
  | "lab_test"
  | "other";

export interface BenchmarkEntry {
  id: string;
  type: BenchmarkType;
  date: string;
  result: number;
  derivedVma?: number;
  notes?: string;
}

export type RecordProvenance = "manual" | "race_reference" | "benchmark" | "import";

export interface PersonalRecord {
  distance: RaceDistance | string;
  timeSeconds: number;
  date?: string;
  label?: string;
  provenance: RecordProvenance;
}

export interface RunnerProfile {
  version: 1;
  fcMax?: number;
  vma?: number;
  currentWeeklyKm?: number;
  currentLongRunKm?: number;
  runnerLevel?: Difficulty;
  performanceReferences: PerformanceReferences;
  benchmarks: BenchmarkEntry[];
  personalRecords: PersonalRecord[];
  createdAt: string;
  updatedAt: string;
}
