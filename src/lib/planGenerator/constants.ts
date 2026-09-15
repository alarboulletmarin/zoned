import type { RaceDistance, RacePriority, TrainingGoal, PlanPurpose } from "@/types/plan";
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
//
// The three shares sum to 1. An earlier table summed to 0.85 and quietly
// handed the remainder to the base, so a 30-week marathon plan spent 15 weeks
// in base and 4 in peak while the methodology page promised 40 %.

export interface PhaseDistribution {
  base: number;
  build: number;
  peak: number;
}

export const PHASE_DISTRIBUTION: Record<RaceDistance, PhaseDistribution> = {
  "5K":         { base: 0.35, build: 0.35, peak: 0.30 },
  "10K":        { base: 0.40, build: 0.35, peak: 0.25 },
  semi:         { base: 0.40, build: 0.35, peak: 0.25 },
  marathon:     { base: 0.45, build: 0.33, peak: 0.22 },
  trail_short:  { base: 0.50, build: 0.32, peak: 0.18 },
  trail:        { base: 0.52, build: 0.32, peak: 0.16 },
  ultra:        { base: 0.55, build: 0.30, peak: 0.15 },
};

/**
 * Shortest specific block worth the name, once the plan is long enough to
 * afford it (Pfitzinger's race-preparation mesocycle runs 5-6 weeks; a single
 * week of marathon-pace work is not a peak phase).
 */
export const MIN_PEAK_WEEKS: Record<RaceDistance, number> = {
  "5K": 2,
  "10K": 2,
  semi: 2,
  marathon: 3,
  trail_short: 2,
  trail: 3,
  ultra: 3,
};

/** Absolute cap on the base phase, whatever the plan length */
export const MAX_BASE_WEEKS = 12;

// For short plans (<12 weeks), compress base and favor build/peak.
export const SHORT_PLAN_BASE_ADJUSTMENT = -0.08; // reduce base by 8%
export const SHORT_PLAN_THRESHOLD = 12;

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

/** Recommended ranges per distance, used for UI warnings, not hard blocks */
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

/**
 * Ceiling on the week-to-week increase. A ceiling, not a slope: the slope is
 * computed so the peak lands a few weeks before the taper (volume.ts). The
 * "10 % rule" itself has no experimental support (Buist 2008 found no fewer
 * injuries with a 10 % graded programme; Nielsen 2014 only sees a signal
 * beyond +30 %), it is kept as a conservative bound.
 */
export const MAX_WEEKLY_VOLUME_INCREASE = 0.10;
/** Smallest increase worth planning, below it the week is a plateau */
export const MIN_WEEKLY_VOLUME_INCREASE = 0.03;
/**
 * Recovery week as a share of the previous load week. Pfitzinger's drop-back
 * weeks sit at 78-85 % of the week before, Higdon's at 86-92 %; the earlier
 * 65 % created +50 % rebounds the following week.
 */
export const RECOVERY_WEEK_VOLUME_PCT = 0.82;
export const MAX_CONSECUTIVE_LOAD_WEEKS = 3; // Recovery after 3 consecutive load weeks
/** Long run is shortened on recovery weeks, never removed (Pfitzinger) */
export const RECOVERY_LONG_RUN_PCT = 0.75;
/**
 * No recovery week this close to the taper: the taper is the recovery, and a
 * drop-back week right before it left plans with three light weeks in a row
 * and a single loaded week of peak.
 */
export const NO_RECOVERY_WEEKS_BEFORE_TAPER = 2;
/** The volume peak should land this many weeks before the taper starts */
export const PEAK_WEEKS_BEFORE_TAPER: Record<RaceDistance, number> = {
  "5K": 2,
  "10K": 2,
  semi: 2,
  marathon: 3,
  trail_short: 2,
  trail: 3,
  ultra: 3,
};

// ── Taper ──────────────────────────────────────────────────────────
// Bosquet et al. (2007): a 41-60 % total reduction over about two weeks,
// progressive rather than stepped, intensity and frequency maintained.
// Pfitzinger's marathon ladder is 75 / 60 / 40 % of peak, Higdon's 73 / 53 /
// 23 %, and Smyth & Lawlor (2021) find the disciplined three-week taper the
// most effective for recreational marathoners. The earlier exponential
// (64 / 41 / 26 %) dropped a third of the volume in one step and sat at
// 41 % two weeks out, below every published ladder.
//
// Shares of peak weekly volume for each taper week before race week.

export const TAPER_VOLUME_PCT: Record<RaceDistance, number[]> = {
  "5K": [],
  "10K": [0.72],
  semi: [0.72],
  marathon: [0.78, 0.60],
  trail_short: [0.72],
  trail: [0.72],
  ultra: [0.78, 0.60],
};

// ── Race week ──────────────────────────────────────────────────────
// Training volume of race week (the race itself is not counted), as a share
// of peak: Pfitzinger 33-40 %, Hansons 42 %, Higdon 23 %.

export const RACE_WEEK_VOLUME_PCT: Record<RaceDistance, number> = {
  "5K": 0.55,
  "10K": 0.45,
  semi: 0.45,
  marathon: 0.40,
  trail_short: 0.45,
  trail: 0.40,
  ultra: 0.38,
};
export const OPENER_DAYS_BEFORE_RACE = 2; // 2 days before

// ── Weekly km targets by level and distance ────────────────────────
// [startKm, peakKm]. Intermediate and above follow Pfitzinger and Daniels
// (marathon 55 → 90 km is Pfitzinger 18/55). Beginner starts follow the
// first-timer plans: Higdon Novice 5K 7 → 13 km, Novice 10K 13 → 21 km,
// Half Novice 1 19 → 37 km, Marathon Novice 1 24 → 64 km. A "beginner" who
// starts at 40 km a week is not a beginner.

export const WEEKLY_KM_TARGETS: Record<RaceDistance, Record<Difficulty, [number, number]>> = {
  "5K": {
    beginner:     [12, 25],
    intermediate: [30, 50],
    advanced:     [50, 80],
    elite:        [80, 120],
  },
  "10K": {
    beginner:     [15, 32],
    intermediate: [40, 60],
    advanced:     [60, 90],
    elite:        [90, 130],
  },
  semi: {
    beginner:     [22, 45],
    intermediate: [50, 75],
    advanced:     [70, 110],
    elite:        [100, 150],
  },
  marathon: {
    beginner:     [28, 64],
    intermediate: [55, 90],
    advanced:     [80, 130],
    elite:        [120, 180],
  },
  trail_short: {
    beginner:     [25, 48],
    intermediate: [45, 70],
    advanced:     [65, 100],
    elite:        [90, 140],
  },
  trail: {
    beginner:     [30, 55],
    intermediate: [50, 80],
    advanced:     [70, 115],
    elite:        [100, 160],
  },
  ultra: {
    beginner:     [35, 65],
    intermediate: [55, 90],
    advanced:     [80, 130],
    elite:        [120, 180],
  },
};

/**
 * Weekly volume below which the distance becomes a survival exercise, in km.
 * The volume model uses it as a floor on the peak (a 4-day "finish" marathon
 * plan otherwise topped out at 43 km, below what its own audit accepts), and
 * the audit reports it when the plan still cannot reach it.
 */
export const WEEKLY_VOLUME_FLOOR_KM: Record<RaceDistance, number> = {
  "5K": 15,
  "10K": 18,
  semi: 35,
  marathon: 50,
  trail_short: 40,
  trail: 50,
  ultra: 60,
};

// ── Key session types per phase (quality sessions) ─────────────────
// Aligned with Daniels' phases:
//   Base: Volume + strides/fartlek (aerobic foundation)
//   Build: I-pace focus, VO2max intervals, hills (Daniels Phase III)
//   Peak: T-pace + race-specific (Daniels Phase IV)
//   Taper: Race-specific only
//
// Kept as the distance-agnostic default. Prefer getKeySessionTypes(), which
// weights the same phases toward what actually limits performance on the
// target distance.

export const KEY_SESSION_TYPES: Record<TrainingPhase, SessionType[]> = {
  base: ["fartlek", "hills", "endurance"],
  build: ["vo2max", "threshold", "hills", "fartlek"],
  peak: ["threshold", "race_specific", "tempo"],
  taper: ["race_specific", "tempo"],
  recovery: [],
};

// ── Key session types per distance profile ─────────────────────────
// The limiting factor differs by distance, so the same phase should not
// prescribe the same work for a 5K and a marathon:
//   short (5K/10K):    VO2max is the primary determinant (Daniels I-pace)
//   long (semi/mara):  lactate threshold and race-pace work dominate
//   trail:             hill strength and sustained climbing
//
// Ordering matters, the selector takes the first type that yields a match.

export type DistanceProfile = "short" | "long" | "trail";

export const DISTANCE_PROFILE: Record<RaceDistance, DistanceProfile> = {
  "5K": "short",
  "10K": "short",
  semi: "long",
  marathon: "long",
  trail_short: "trail",
  trail: "trail",
  ultra: "trail",
};

const KEY_SESSION_TYPES_BY_PROFILE: Record<
  DistanceProfile,
  Record<TrainingPhase, SessionType[]>
> = {
  short: {
    // Threshold, not tempo: a tempo template runs at marathon pace, which
    // labelled 5K base sessions "Allure marathon". Pfitzinger opens 5K/10K
    // schedules with lactate-threshold work.
    base: ["fartlek", "hills", "threshold"],
    build: ["vo2max", "threshold", "fartlek"],
    peak: ["vo2max", "race_specific", "threshold"],
    taper: ["race_specific", "vo2max"],
    recovery: [],
  },
  long: {
    base: ["tempo", "fartlek", "hills"],
    build: ["threshold", "tempo", "race_specific"],
    // A marathon block still needs some VO2max work to lift the ceiling the
    // threshold sits under (Pfitzinger keeps it in race preparation), it is
    // last because race-pace and threshold come first, not absent.
    peak: ["race_specific", "threshold", "tempo", "vo2max"],
    taper: ["race_specific", "tempo"],
    recovery: [],
  },
  trail: {
    // No "endurance" here: a key slot filled with an endurance template is
    // not a key session, it left trail plans with weeks that had none.
    base: ["hills", "fartlek", "tempo"],
    build: ["hills", "threshold", "tempo"],
    peak: ["race_specific", "hills", "threshold"],
    taper: ["race_specific", "tempo"],
    recovery: [],
  },
};

/**
 * Key session types for a phase, weighted by what limits the target distance.
 */
export function getKeySessionTypes(
  phase: TrainingPhase,
  raceDistance?: RaceDistance,
): SessionType[] {
  if (!raceDistance) return KEY_SESSION_TYPES[phase];
  return KEY_SESSION_TYPES_BY_PROFILE[DISTANCE_PROFILE[raceDistance]][phase];
}

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

// ── Intensity distribution ─────────────────────────────────────────
// Seiler's 80/20 counts *sessions* (Seiler & Kjerland 2006: 75 % of sessions
// easy; Seiler 2010: about 80 % of sessions, 2-3 hard ones in 10-14). The
// week template enforces it through the key-session budget: one key session
// in base up to 5 days a week, two in build and peak, never more than two.
// Over a plan this lands at 25-35 % hard sessions and about 80 % of running
// time in Z1-Z2, a pyramidal distribution, which is what well-trained
// distance runners actually do (Casado 2022, Kenneally 2021).

/** Largest share of running sessions a plan may schedule as key sessions */
export const MAX_KEY_SESSION_FRACTION = 0.40;

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
  /** Recovery week volume override, share of the previous load week (0 = default) */
  recoveryVolumePct: number;
  /** Long run progression increment multiplier */
  longRunIncrementMultiplier: number;
}

export const GOAL_MODIFIERS: Record<TrainingGoal, GoalModifiers> = {
  finish: {
    volumeMultiplier: 0.90,       // 10% less volume
    maxQualitySessions: 1,        // Only 1 quality session/week
    hardFraction: 0.15,           // 85/15 split (more conservative than 80/20)
    basePhaseShift: 0.05,         // +5% base phase (more aerobic foundation)
    recoveryFrequency: 3,         // Recovery every 3 weeks (more frequent)
    recoveryVolumePct: 0.75,      // Deeper recovery weeks
    longRunIncrementMultiplier: 0.8, // Slower long run progression
  },
  time: {
    volumeMultiplier: 1.0,        // Standard volume
    maxQualitySessions: 0,        // Use default (from weekTemplate)
    hardFraction: 0.20,           // Standard 80/20
    basePhaseShift: 0,            // No adjustment
    recoveryFrequency: 0,         // Use default (load-based)
    recoveryVolumePct: 0,
    longRunIncrementMultiplier: 1.0,
  },
  compete: {
    volumeMultiplier: 1.12,       // 12% more volume
    maxQualitySessions: 3,        // Up to 3 quality sessions/week (advanced)
    hardFraction: 0.25,           // 75/25 split (pyramidal, still safe)
    basePhaseShift: -0.05,        // -5% base (more time in build/peak)
    recoveryFrequency: 0,         // Use default (load-based)
    recoveryVolumePct: 0,
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
  /** Volume multiplier relative to 10K targets, applied to the peak */
  volumeMultiplier: number;
  /** Volume multiplier applied to the starting point; together with
   *  volumeMultiplier it sets how far the plan progresses. */
  startVolumeMultiplier: number;
  /** Max key sessions per week */
  maxKeySessions: number;
  /**
   * First week that may hold a key session. Return-to-running protocols
   * (Warden 2014; George 2024; Daniels' layoff table) keep everything easy
   * for the first weeks and add intensity only once volume is back.
   */
  firstKeySessionWeek: number;
  /** Weeks whose easy runs prefer walk-run templates */
  walkRunWeeks: number;
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
    // startVolumeMultiplier is deliberately lower than volumeMultiplier: the
    // pair sets how far the plan travels. Applying one value to both ends left
    // these plans starting at their own peak and progressing nowhere.
    startVolumeMultiplier: 0.70,
    volumeMultiplier: 0.95,
    maxKeySessions: 2,
    firstKeySessionWeek: 1,
    walkRunWeeks: 0,
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
    // Start well below the reference table, finish on it: the point of the plan
    // is the journey back to normal training, not a flat line at 60%.
    startVolumeMultiplier: 0.35,
    volumeMultiplier: 1.0,
    maxKeySessions: 1,
    firstKeySessionWeek: 5,
    walkRunWeeks: 3,
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
    startVolumeMultiplier: 0.30,
    volumeMultiplier: 0.75,
    maxKeySessions: 1,
    firstKeySessionWeek: 4,
    walkRunWeeks: 2,
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

// ── Intermediate race volume adjustments ─────────────────────────
// Priority-dependent volume reduction for intermediate race events.
//   A: Real race event, mini-taper, recovery week after
//   B: Preparation race, moderate lightening, no break in progression
//   C: Tune-up, minimal disruption, race replaces a quality session

export const INTERMEDIATE_RACE_VOLUME: Record<RacePriority, {
  raceWeekPct: number;
  preRaceWeekPct: number;
  postRaceWeekPct: number;
}> = {
  A: { raceWeekPct: 0.50, preRaceWeekPct: 0.75, postRaceWeekPct: 0.65 },
  B: { raceWeekPct: 0.70, preRaceWeekPct: 0.90, postRaceWeekPct: 0.80 },
  C: { raceWeekPct: 0.85, preRaceWeekPct: 1.00, postRaceWeekPct: 0.90 },
};
