import type { Difficulty, TrainingPhase, SessionType } from "@/types";

// ── Race distance type ──────────────────────────────────────────────

export type RaceDistance = "5K" | "10K" | "semi" | "marathon" | "trail_short" | "trail" | "ultra";

// ── Plan configuration (user inputs) ───────────────────────────────

export interface PlanConfig {
  id: string;
  planMode?: "assisted" | "free" | "prebuilt"; // undefined = "assisted" for backward compat
  planName?: string; // user-given name for free plans
  raceDistance?: RaceDistance;
  raceDate?: string; // ISO date
  raceName?: string;
  targetPaceMinKm?: number;
  elevationGain?: number;
  runnerLevel?: Difficulty;
  daysPerWeek: number; // 3-7
  longRunDay?: number; // 0=Mon ... 6=Sun
  vma?: number;
  createdAt: string;
  startDate?: string; // ISO date, optional
  endDate?: string;   // ISO date, optional (auto-calculated from startDate + totalWeeks)
}

// ── Assisted plan config (all race fields required) ─────────────────

export interface AssistedPlanConfig extends PlanConfig {
  raceDistance: RaceDistance;
  raceDate: string;
  runnerLevel: Difficulty;
  longRunDay: number;
}

// ── Plan session (single scheduled workout) ────────────────────────

export interface PlanSession {
  dayOfWeek: number; // 0=Mon ... 6=Sun
  workoutId: string; // Reference to WorkoutTemplate.id
  sessionType: SessionType;
  isKeySession: boolean;
  estimatedDurationMin: number;
  notes?: string;
  notesEn?: string;
}

// ── Cross-training session (non-running activity) ──────────────────

export type CrossTrainingType = "strength" | "cycling" | "swimming" | "yoga" | "rest" | "other";
export type CrossTrainingIntensity = "easy" | "moderate" | "hard";

export interface CrossTrainingSession {
  id: string;
  dayOfWeek: number; // 0=Mon ... 6=Sun
  activityType: CrossTrainingType;
  durationMin: number;
  description: string;
  intensity: CrossTrainingIntensity;
}

// ── Plan week ──────────────────────────────────────────────────────

export interface PlanWeek {
  weekNumber: number;
  phase: TrainingPhase;
  isRecoveryWeek: boolean;
  volumePercent: number;
  sessions: PlanSession[];
  crossTraining?: CrossTrainingSession[];
  weekLabel?: string;
  weekLabelEn?: string;
}

// ── Phase range (start/end weeks for a phase) ──────────────────────

export interface PhaseRange {
  phase: TrainingPhase;
  startWeek: number;
  endWeek: number;
}

// ── Training plan (full generated plan) ────────────────────────────

export interface TrainingPlan {
  id: string;
  config: PlanConfig;
  weeks: PlanWeek[];
  totalWeeks: number;
  phases: PhaseRange[];
  raceTimePrediction?: string;
  name: string;
  nameEn: string;
}

// ── Display metadata ───────────────────────────────────────────────

export const RACE_DISTANCE_META: Record<
  RaceDistance,
  { label: string; labelEn: string; distanceKm: number; icon: string }
> = {
  "5K": { label: "5 km", labelEn: "5K", distanceKm: 5, icon: "Zap" },
  "10K": { label: "10 km", labelEn: "10K", distanceKm: 10, icon: "Timer" },
  semi: {
    label: "Semi-marathon",
    labelEn: "Half Marathon",
    distanceKm: 21.1,
    icon: "Route",
  },
  marathon: {
    label: "Marathon",
    labelEn: "Marathon",
    distanceKm: 42.195,
    icon: "Trophy",
  },
  trail_short: {
    label: "Trail court",
    labelEn: "Short Trail",
    distanceKm: 30,
    icon: "Mountain",
  },
  trail: {
    label: "Trail",
    labelEn: "Trail",
    distanceKm: 60,
    icon: "Mountain",
  },
  ultra: {
    label: "Ultra trail",
    labelEn: "Ultra Trail",
    distanceKm: 100,
    icon: "Mountain",
  },
};

export const PHASE_META: Record<
  TrainingPhase,
  {
    label: string;
    labelEn: string;
    color: string;
    description: string;
    descriptionEn: string;
  }
> = {
  base: {
    label: "Base",
    labelEn: "Base",
    color: "bg-blue-500",
    description: "Construction de l'endurance fondamentale",
    descriptionEn: "Building fundamental endurance",
  },
  build: {
    label: "Construction",
    labelEn: "Build",
    color: "bg-yellow-500",
    description: "Augmentation progressive de l'intensit\u00e9",
    descriptionEn: "Progressive intensity increase",
  },
  peak: {
    label: "Pic",
    labelEn: "Peak",
    color: "bg-orange-500",
    description: "Aff\u00fbtage des allures sp\u00e9cifiques",
    descriptionEn: "Sharpening race-specific paces",
  },
  taper: {
    label: "Aff\u00fbtage",
    labelEn: "Taper",
    color: "bg-green-500",
    description: "R\u00e9duction du volume, fra\u00eecheur maximale",
    descriptionEn: "Volume reduction, maximum freshness",
  },
  recovery: {
    label: "R\u00e9cup\u00e9ration",
    labelEn: "Recovery",
    color: "bg-slate-400",
    description: "Semaine de r\u00e9cup\u00e9ration active",
    descriptionEn: "Active recovery week",
  },
};
