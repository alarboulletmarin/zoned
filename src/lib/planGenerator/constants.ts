import type { RaceDistance, TrainingGoal, PlanPurpose } from "@/types/plan";
import type { Difficulty, SessionType, TrainingPhase } from "@/types";

// ── Phase distribution percentages (of non-taper weeks) ────────────
// Evidence-based ratios adapted per distance (Daniels, Pfitzinger).
//
// Daniels' 4 phases:
//   Phase I  (Base): Easy volume + strides → our "base"
//   Phase II (Early Quality): Repetition work → late "base"
//   Phase III (Transition): I-pace intervals → our "build"
//   Phase IV (Final Quality): T-pace + race-specific → our "peak"
//
// Shorter races need more speed work (larger build/peak).
// Longer races need more aerobic base.

export interface PhaseDistribution {
  base: number;
  build: number;
  peak: number;
}

export const PHASE_DISTRIBUTION: Record<RaceDistance, PhaseDistribution> = {
  "5K":         { base: 0.30, build: 0.30, peak: 0.25 },
  "10K":        { base: 0.35, build: 0.30, peak: 0.20 },
  semi:         { base: 0.35, build: 0.30, peak: 0.20 },
  marathon:     { base: 0.40, build: 0.30, peak: 0.15 },
  trail_short:  { base: 0.45, build: 0.30, peak: 0.10 },
  trail:        { base: 0.45, build: 0.30, peak: 0.10 },
  ultra:        { base: 0.50, build: 0.30, peak: 0.10 },
};

// For short plans (<12 weeks), compress base and favor build/peak.
// For long plans (>18 weeks), extend base for deeper aerobic foundation.
export const SHORT_PLAN_BASE_ADJUSTMENT = -0.08; // reduce base by 8%
export const LONG_PLAN_BASE_ADJUSTMENT = 0.05;   // increase base by 5%
export const SHORT_PLAN_THRESHOLD = 12;
export const LONG_PLAN_THRESHOLD = 18;

// Legacy aliases for backward compatibility
export const BASE_PHASE_PCT = 0.4;
export const BUILD_PHASE_PCT = 0.35;
export const PEAK_PHASE_PCT = 0.15;

// ── Taper weeks by distance ────────────────────────────────────────
// Based on Mujika & Padilla (2003): 7-21 days optimal depending on event.

export const TAPER_WEEKS: Record<RaceDistance, number> = {
  "5K": 1,
  "10K": 2,
  semi: 2,
  marathon: 3,
  trail_short: 2,
  trail: 2,
  ultra: 3,
};

// ── Plan constraints ───────────────────────────────────────────────
// Flexible limits: short plans for 5K, long plans for ultra/base building.
// Warnings are shown in UI beyond the "recommended" range, but generation is allowed.

export const MIN_PLAN_WEEKS = 4;
export const MAX_PLAN_WEEKS = 52;
export const MIN_PHASE_WEEKS = 1;

/** Recommended ranges per distance — used for UI warnings, not hard blocks */
export const RECOMMENDED_PLAN_WEEKS: Record<RaceDistance, { min: number; max: number }> = {
  "5K":         { min: 6,  max: 16 },
  "10K":        { min: 8,  max: 20 },
  semi:         { min: 10, max: 24 },
  marathon:     { min: 14, max: 30 },
  trail_short:  { min: 10, max: 24 },
  trail:        { min: 14, max: 36 },
  ultra:        { min: 16, max: 52 },
};

// ── Volume progression ─────────────────────────────────────────────

export const MAX_WEEKLY_VOLUME_INCREASE = 0.10; // 10% max (classic rule)
export const RECOVERY_WEEK_VOLUME_PCT = 0.65; // 65% — less aggressive than 60% (Mujika)
export const MAX_CONSECUTIVE_LOAD_WEEKS = 3; // Recovery after 3 consecutive load weeks

// ── Taper: exponential decay (Mujika & Padilla) ───────────────────
// volume(week_i) = peak × e^(-rate × week_i)
// Rate calibrated so 3-week taper gives ~75%, ~58%, ~40%

export const TAPER_DECAY_RATE = 0.45;

// Legacy linear reduction kept for backward compat
export const TAPER_VOLUME_REDUCTION = [0.7, 0.5, 0.4]; // Per taper week

// ── Race week ──────────────────────────────────────────────────────

export const RACE_WEEK_VOLUME_PCT = 0.35;
export const OPENER_DAYS_BEFORE_RACE = 2; // 2 days before

// ── Starting volume by plan duration (weeks -> starting %) ─────────

export const STARTING_VOLUME_PCT = {
  short: 0.85, // 8-11 weeks
  medium: 0.7, // 12-17 weeks
  long: 0.6, // 18-24 weeks
};

// ── Weekly km targets by level and distance ────────────────────────
// [startKm, peakKm] — Based on Pfitzinger & Daniels recommendations.
// Start = week 1 of plan, Peak = highest volume week.

export const WEEKLY_KM_TARGETS: Record<RaceDistance, Record<Difficulty, [number, number]>> = {
  "5K": {
    beginner:     [20, 30],
    intermediate: [30, 50],
    advanced:     [50, 80],
    elite:        [80, 120],
  },
  "10K": {
    beginner:     [25, 40],
    intermediate: [40, 60],
    advanced:     [60, 90],
    elite:        [90, 130],
  },
  semi: {
    beginner:     [30, 50],
    intermediate: [50, 75],
    advanced:     [70, 110],
    elite:        [100, 150],
  },
  marathon: {
    beginner:     [40, 65],
    intermediate: [55, 90],
    advanced:     [80, 130],
    elite:        [120, 180],
  },
  trail_short: {
    beginner:     [30, 50],
    intermediate: [45, 70],
    advanced:     [65, 100],
    elite:        [90, 140],
  },
  trail: {
    beginner:     [35, 55],
    intermediate: [50, 80],
    advanced:     [70, 115],
    elite:        [100, 160],
  },
  ultra: {
    beginner:     [40, 65],
    intermediate: [55, 90],
    advanced:     [80, 130],
    elite:        [120, 180],
  },
};

// ── Session type distribution per phase ────────────────────────────
// Maps phase -> array of session types in priority order

export const PHASE_SESSION_TYPES: Record<TrainingPhase, SessionType[]> = {
  base: ["endurance", "recovery", "long_run", "fartlek"],
  build: ["vo2max", "threshold", "long_run", "endurance", "hills", "fartlek"],
  peak: ["threshold", "race_specific", "tempo", "long_run", "vo2max"],
  taper: ["recovery", "endurance", "race_specific"],
  recovery: ["recovery", "endurance"],
};

// ── Key session types per phase (quality sessions) ─────────────────
// Aligned with Daniels' phases:
//   Base: Volume + strides/fartlek (aerobic foundation)
//   Build: I-pace focus — VO2max intervals, hills (Daniels Phase III)
//   Peak: T-pace + race-specific (Daniels Phase IV)
//   Taper: Race-specific only

export const KEY_SESSION_TYPES: Record<TrainingPhase, SessionType[]> = {
  base: ["fartlek", "hills", "endurance"],
  build: ["vo2max", "threshold", "hills", "fartlek"],
  peak: ["threshold", "race_specific", "tempo"],
  taper: ["race_specific", "tempo"],
  recovery: [],
};

// ── VMA percentages for race time prediction ───────────────────────
// Aligned with src/lib/paceCalculator.ts RACE_CONFIGS

export const VMA_RACE_PERCENTAGES: Record<RaceDistance, number> = {
  "5K": 97,
  "10K": 92,
  semi: 82,
  marathon: 77,
  trail_short: 72,
  trail: 65,
  ultra: 55,
};

// ── Distance tags for workout matching ─────────────────────────────

export const DISTANCE_TAGS: Record<RaceDistance, string[]> = {
  "5K": ["5k", "5km", "short-distance"],
  "10K": ["10k", "10km", "medium-distance"],
  semi: ["half-marathon", "semi", "semi-marathon"],
  marathon: ["marathon", "long-distance"],
  trail_short: ["trail", "nature", "short-trail"],
  trail: ["trail", "nature", "long-trail"],
  ultra: ["trail", "ultra", "nature", "ultra-trail"],
};

// ── 80/20 polarized training validation ────────────────────────────
// Seiler (2010): 75-80% Z1-Z2, 15-20% Z4+, minimal Z3
// We use 75% as threshold (allowing some slack)

export const POLARIZED_EASY_MIN_FRACTION = 0.75;
export const POLARIZED_HARD_MAX_FRACTION = 0.25;

// ── Training goal modifiers ────────────────────────────────────────
// Adjusts plan generation based on the runner's mindset/ambition.
//
// "finish": conservative, more easy volume, fewer quality sessions.
//           Best for beginners or runners who just want to complete the race.
// "time":   balanced plan, standard 80/20 split. The default.
// "compete": ambitious plan, more quality sessions, higher volume.
//            For experienced runners chasing a PR.

export interface GoalModifiers {
  /** Volume multiplier applied to km targets (1.0 = no change) */
  volumeMultiplier: number;
  /** Max quality sessions per week override (0 = use default from weekTemplate) */
  maxQualitySessions: number;
  /** Intensity split: fraction of hard work (vs easy). Lower = more conservative. */
  hardFraction: number;
  /** Phase distribution adjustment: shift base% by this amount */
  basePhaseShift: number;
  /** Recovery week frequency override (0 = use default) */
  recoveryFrequency: number;
  /** Long run progression increment multiplier */
  longRunIncrementMultiplier: number;
}

export const GOAL_MODIFIERS: Record<TrainingGoal, GoalModifiers> = {
  finish: {
    volumeMultiplier: 0.85,       // 15% less volume
    maxQualitySessions: 1,        // Only 1 quality session/week
    hardFraction: 0.15,           // 85/15 split (more conservative than 80/20)
    basePhaseShift: 0.05,         // +5% base phase (more aerobic foundation)
    recoveryFrequency: 3,         // Recovery every 3 weeks (more frequent)
    longRunIncrementMultiplier: 0.8, // Slower long run progression
  },
  time: {
    volumeMultiplier: 1.0,        // Standard volume
    maxQualitySessions: 0,        // Use default (from weekTemplate)
    hardFraction: 0.20,           // Standard 80/20
    basePhaseShift: 0,            // No adjustment
    recoveryFrequency: 0,         // Use default (load-based)
    longRunIncrementMultiplier: 1.0,
  },
  compete: {
    volumeMultiplier: 1.12,       // 12% more volume
    maxQualitySessions: 3,        // Up to 3 quality sessions/week (advanced)
    hardFraction: 0.25,           // 75/25 split (pyramidal, still safe)
    basePhaseShift: -0.05,        // -5% base (more time in build/peak)
    recoveryFrequency: 0,         // Use default (load-based)
    longRunIncrementMultiplier: 1.15, // Faster long run progression
  },
};

/** Get goal modifiers with fallback to "time" if undefined */
export function getGoalModifiers(goal?: TrainingGoal): GoalModifiers {
  return GOAL_MODIFIERS[goal ?? "time"];
}

// ── Plan purpose configurations ─────────────────────────────────────
// Non-race plans: no taper, adjusted phases, conservative volume.

export interface PurposeConfig {
  /** Default plan duration in weeks */
  defaultWeeks: number;
  /** Allowed range */
  minWeeks: number;
  maxWeeks: number;
  /** Phase distribution override (no taper for non-race plans) */
  phases: { base: number; build: number; peak: number; taper: number };
  /** Volume multiplier relative to 10K targets */
  volumeMultiplier: number;
  /** Max key sessions per week */
  maxKeySessions: number;
  /** Default race distance to use for workout selection (non-race plans still need one) */
  fallbackDistance: RaceDistance;
  /** Labels */
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}

export const PURPOSE_CONFIGS: Record<Exclude<PlanPurpose, "race">, PurposeConfig> = {
  base_building: {
    defaultWeeks: 12,
    minWeeks: 6,
    maxWeeks: 24,
    phases: { base: 0.55, build: 0.30, peak: 0.15, taper: 0 },
    volumeMultiplier: 0.90,
    maxKeySessions: 2,
    fallbackDistance: "10K",
    label: "Construction de base",
    labelEn: "Base Building",
    description: "Construire une base aérobie solide sans objectif de course",
    descriptionEn: "Build a solid aerobic base without a race target",
  },
  return_from_injury: {
    defaultWeeks: 10,
    minWeeks: 4,
    maxWeeks: 16,
    phases: { base: 0.65, build: 0.25, peak: 0.10, taper: 0 },
    volumeMultiplier: 0.60,
    maxKeySessions: 1,
    fallbackDistance: "5K",
    label: "Retour de blessure",
    labelEn: "Return from Injury",
    description: "Reprise progressive et sécurisée après une blessure ou un arrêt",
    descriptionEn: "Safe progressive return after injury or break",
  },
  beginner_start: {
    defaultWeeks: 8,
    minWeeks: 4,
    maxWeeks: 16,
    phases: { base: 0.70, build: 0.20, peak: 0.10, taper: 0 },
    volumeMultiplier: 0.50,
    maxKeySessions: 1,
    fallbackDistance: "5K",
    label: "Débutant",
    labelEn: "Beginner Start",
    description: "Programme progressif pour commencer la course à pied",
    descriptionEn: "Progressive program to start running from scratch",
  },
};

// ── Days of week labels ────────────────────────────────────────────

export const DAY_LABELS = {
  fr: [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ],
  en: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};
