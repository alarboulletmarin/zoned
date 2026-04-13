import type { Difficulty, TrainingPhase, SessionType } from "@/types";

// ── Race distance type ──────────────────────────────────────────────

export type RaceDistance = "5K" | "10K" | "semi" | "marathon" | "trail_short" | "trail" | "ultra";

// ── Training goal (mentalité) ──────────────────────────────────────
// Influences volume, intensity distribution, and session types.
//   - finish:  Conservative plan focused on finishing. More Z1-Z2, fewer quality sessions.
//   - time:    Standard plan with balanced build/peak. The default.
//   - compete: Ambitious plan for experienced runners. More quality, higher volume.

export type TrainingGoal = "finish" | "time" | "compete";

// ── Plan purpose (objectif du plan) ────────────────────────────────
// Determines whether the plan targets a race or is a general training cycle.
//   - race:              Prepare for a specific race (default, requires raceDate)
//   - base_building:     Build aerobic base, no specific race
//   - return_from_injury: Progressive return after injury/break
//   - beginner_start:    Complete beginner starting from scratch

export type PlanPurpose = "race" | "base_building" | "return_from_injury" | "beginner_start";

// ── Race priority (for intermediate goals) ────────────────────────
export type RacePriority = "A" | "B" | "C";

// ── Intermediate race goal ────────────────────────────────────────
// Represents a race during plan preparation (before the main race).
//   - A: Important goal — mini-taper + real recovery
//   - B: Preparation race — moderate lightening
//   - C: Tune-up — treated as structured session

export interface IntermediateGoal {
  raceDistance: RaceDistance;
  raceDate: string;            // ISO "YYYY-MM-DD"
  raceName?: string;
  targetPaceMinKm?: number;
  priority: RacePriority;
}

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
  trainingGoal?: TrainingGoal;   // v2: training mindset (default: "time")
  planPurpose?: PlanPurpose;     // v2: plan purpose (default: "race")
  totalWeeksOverride?: number;   // v2: manual week count (for non-race plans)
  currentWeeklyKm?: number;     // v2: user's current weekly volume for smarter starting point
  currentLongRunKm?: number;    // v2: user's current longest run
  includeStrength?: boolean;       // v2: include strength suggestions (Ronnestad 2014)
  strengthFrequency?: 1 | 2 | 3;  // v2: strength sessions per week (default: 2)
  unavailabilities?: Unavailability[];
  intermediateGoals?: IntermediateGoal[];
}

// ── Assisted plan config (all race fields required) ─────────────────

export interface AssistedPlanConfig extends PlanConfig {
  raceDistance: RaceDistance;
  raceDate: string;
  runnerLevel: Difficulty;
  longRunDay: number;
}

// ── Pace note for structured pace annotations ──────────────────────

export interface PaceNote {
  zone: string;           // "Z1", "Z2", etc. or "E", "M", "T", "I", "R"
  paceMinKm: number;      // Faster end of range (min/km)
  paceMaxKm: number;      // Slower end of range (min/km)
  description: string;    // e.g., "Allure seuil"
  descriptionEn: string;  // e.g., "Threshold pace"
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
  // ── New fields (v2, all optional for backward compat) ──
  targetDistanceKm?: number;     // Target distance for this session
  targetDurationMin?: number;    // Refined duration from pace engine
  loadScore?: number;            // TRIMP-like load score
  scaledRepetitions?: number;    // Scaled reps (from workout scaling)
  paceNotes?: PaceNote[];        // Structured pace annotations
  // ── Completion tracking (Phase 4) ──
  status?: "planned" | "completed" | "skipped" | "modified";
  completedAt?: string;          // ISO date
  actualDurationMin?: number;
  actualDistanceKm?: number;
  rpe?: number;                  // 1-10 Rate of Perceived Effort
  userNote?: string;             // Free-form note captured at completion (does not overwrite generated `notes`)
  isSuggestion?: boolean;          // v2: true if auto-suggested (user can dismiss)
}

// ── Unavailability (blocked days) ─────────────────────────────────

export type UnavailabilityReason = "travel" | "injury" | "work" | "weather" | "other";

export interface Unavailability {
  date: string; // "YYYY-MM-DD" date-only
  reason?: UnavailabilityReason;
  note?: string;
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
  // ── New fields (v2, all optional) ──
  targetKm?: number;             // Weekly km target
  targetLongRunKm?: number;      // Long run distance target
  weeklyLoadScore?: number;      // Sum of session load scores
  // ── Adaptation tracking (used by adapt.ts to avoid stacking adjustments) ──
  _originalVolumePercent?: number;
  _originalTargetKm?: number;
  _originalIsRecovery?: boolean;
  intermediateRace?: IntermediateGoal;  // Present if this week has an intermediate race
}

// ── Phase range (start/end weeks for a phase) ──────────────────────

export interface PhaseRange {
  phase: TrainingPhase;
  startWeek: number;
  endWeek: number;
}

// ── Auto-change tracking (shared by reschedule + adaptation) ──────

export interface AutoChange {
  kind: "moved" | "skipped" | "unplaced" | "volume_adjusted" | "recovery_inserted";
  weekNumber: number;
  fromDay?: number;
  toWeekNumber?: number;
  toDay?: number;
  workoutId?: string;
  reason: "unavailability" | "spacing" | "capacity" | "fatigue" | "missed_key";
}

export interface PlanUndoableChange {
  at: string; // ISO datetime
  kind: "reschedule" | "adaptation" | "bulk_move";
  label: string;     // Human summary (FR)
  labelEn: string;   // Human summary (EN)
  before: TrainingPlan; // Full snapshot before change
  changes: AutoChange[];
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
  // ── New fields (v2) ──
  version?: number;              // 1 = legacy, 2 = evidence-based engine
  peakWeeklyKm?: number;         // Peak weekly volume
  peakLongRunKm?: number;        // Peak long run distance
  _lastUndoableChange?: PlanUndoableChange;
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
