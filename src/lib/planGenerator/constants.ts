import type { RaceDistance } from "@/types/plan";
import type { SessionType, TrainingPhase } from "@/types";

// ── Phase distribution percentages (of non-taper weeks) ────────────

export const BASE_PHASE_PCT = 0.4;
export const BUILD_PHASE_PCT = 0.35;
export const PEAK_PHASE_PCT = 0.15;
// Remaining 10% is buffer distributed across phases

// ── Taper weeks by distance ────────────────────────────────────────

export const TAPER_WEEKS: Record<RaceDistance, number> = {
  "5K": 1,
  "10K": 2,
  semi: 2,
  marathon: 3,
};

// ── Plan constraints ───────────────────────────────────────────────

export const MIN_PLAN_WEEKS = 8;
export const MAX_PLAN_WEEKS = 24;
export const MIN_PHASE_WEEKS = 1;

// ── Volume progression ─────────────────────────────────────────────

export const MAX_WEEKLY_VOLUME_INCREASE = 0.1; // 10%
export const RECOVERY_WEEK_FREQUENCY = 4; // Every 4th week
export const RECOVERY_WEEK_VOLUME_PCT = 0.6; // 60% of previous week

// ── Taper volume reduction ─────────────────────────────────────────

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

// ── Session type distribution per phase ────────────────────────────
// Maps phase -> array of session types in priority order

export const PHASE_SESSION_TYPES: Record<TrainingPhase, SessionType[]> = {
  base: ["endurance", "recovery", "long_run", "fartlek"],
  build: ["tempo", "threshold", "long_run", "endurance", "fartlek"],
  peak: ["vo2max", "race_specific", "threshold", "long_run", "tempo"],
  taper: ["recovery", "endurance", "race_specific"],
  recovery: ["recovery", "endurance"],
};

// ── Key session types per phase (quality sessions) ─────────────────

export const KEY_SESSION_TYPES: Record<TrainingPhase, SessionType[]> = {
  base: ["fartlek", "endurance"],
  build: ["tempo", "threshold", "fartlek"],
  peak: ["vo2max", "race_specific", "threshold"],
  taper: ["race_specific"],
  recovery: [],
};

// ── VMA percentages for race time prediction ───────────────────────
// Aligned with src/lib/paceCalculator.ts RACE_CONFIGS

export const VMA_RACE_PERCENTAGES: Record<RaceDistance, number> = {
  "5K": 97,
  "10K": 92,
  semi: 82,
  marathon: 77,
};

// ── Distance tags for workout matching ─────────────────────────────

export const DISTANCE_TAGS: Record<RaceDistance, string[]> = {
  "5K": ["5k", "5km", "short-distance"],
  "10K": ["10k", "10km", "medium-distance"],
  semi: ["half-marathon", "semi", "semi-marathon"],
  marathon: ["marathon", "long-distance"],
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
