// Zone System Types
export type Zone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6";
export type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6;

// Workout Categories
export type WorkoutCategory =
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vma_intervals"
  | "long_run"
  | "hills"
  | "fartlek"
  | "race_pace"
  | "mixed";

// Session Types (training focus)
export type SessionType =
  | "recovery"
  | "endurance"
  | "tempo"
  | "threshold"
  | "vo2max"
  | "speed"
  | "long_run"
  | "hills"
  | "fartlek"
  | "race_specific";

// Target System
export type TargetSystem =
  | "aerobic_base"
  | "aerobic_power"
  | "lactate_threshold"
  | "vo2max"
  | "speed"
  | "strength"
  | "race_specific";

// Difficulty Levels
export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";

// Training Phases
export type TrainingPhase = "base" | "build" | "peak" | "taper" | "recovery";

// Week Positions
export type WeekPosition = "early" | "mid" | "late";

// Relative Load
export type RelativeLoad = "light" | "moderate" | "hard" | "key";

// Workout Block (single element in a phase)
export interface WorkoutBlock {
  description: string;
  descriptionEn?: string;
  durationMin?: number;
  repetitions?: number;
  distance?: string;
  zone?: Zone;
  rest?: string;
}

// Environment Requirements
export interface WorkoutEnvironment {
  requiresHills: boolean;
  requiresTrack: boolean;
  prefersFlat?: boolean;
  prefersSoft?: boolean;
}

// Duration Range
export interface DurationRange {
  min: number;
  max: number;
}

// Selection Criteria (for plan generation)
export interface SelectionCriteria {
  phases: TrainingPhase[];
  weekPositions: WeekPosition[];
  relativeLoad: RelativeLoad;
  tags: string[];
  priorityScore: number;
}

// Main Workout Template Type
export interface WorkoutTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: WorkoutCategory;
  sessionType: SessionType;
  targetSystem: TargetSystem;
  difficulty: Difficulty;
  typicalDuration: DurationRange;
  environment: WorkoutEnvironment;
  warmupTemplate: WorkoutBlock[];
  mainSetTemplate: WorkoutBlock[];
  cooldownTemplate: WorkoutBlock[];
  coachingTips: string[];
  coachingTipsEn: string[];
  commonMistakes: string[];
  commonMistakesEn: string[];
  variationIds: string[];
  selectionCriteria: SelectionCriteria;
}

// Category File Structure
export interface WorkoutCategoryFile {
  category: WorkoutCategory;
  templates: WorkoutTemplate[];
}

// Zone Display Metadata
export const ZONE_META: Record<
  ZoneNumber,
  {
    label: string;
    labelEn: string;
    color: string;
    description: string;
    descriptionEn: string;
  }
> = {
  1: {
    label: "Récupération",
    labelEn: "Recovery",
    color: "zone-1",
    description: "Effort très léger, récupération active",
    descriptionEn: "Very light effort, active recovery",
  },
  2: {
    label: "Endurance",
    labelEn: "Endurance",
    color: "zone-2",
    description: "Effort modéré, base aérobie",
    descriptionEn: "Moderate effort, aerobic base",
  },
  3: {
    label: "Tempo",
    labelEn: "Tempo",
    color: "zone-3",
    description: "Effort soutenu, seuil aérobie",
    descriptionEn: "Sustained effort, aerobic threshold",
  },
  4: {
    label: "Seuil",
    labelEn: "Threshold",
    color: "zone-4",
    description: "Effort intense, seuil lactique",
    descriptionEn: "Intense effort, lactate threshold",
  },
  5: {
    label: "VO2max",
    labelEn: "VO2max",
    color: "zone-5",
    description: "Effort très intense, puissance aérobie",
    descriptionEn: "Very intense effort, aerobic power",
  },
  6: {
    label: "Sprint",
    labelEn: "Sprint",
    color: "zone-6",
    description: "Effort maximal, vitesse",
    descriptionEn: "Maximal effort, speed",
  },
};

// Category Display Metadata
export const CATEGORY_META: Record<
  WorkoutCategory,
  { label: string; labelEn: string; icon: string }
> = {
  recovery: { label: "Récupération", labelEn: "Recovery", icon: "🌿" },
  endurance: { label: "Endurance", labelEn: "Endurance", icon: "🏃" },
  tempo: { label: "Tempo", labelEn: "Tempo", icon: "⚡" },
  threshold: { label: "Seuil", labelEn: "Threshold", icon: "🔥" },
  vma_intervals: { label: "VMA", labelEn: "VO2max", icon: "🚀" },
  long_run: { label: "Sortie longue", labelEn: "Long Run", icon: "🛤️" },
  hills: { label: "Côtes", labelEn: "Hills", icon: "⛰️" },
  fartlek: { label: "Fartlek", labelEn: "Fartlek", icon: "🎯" },
  race_pace: { label: "Allure course", labelEn: "Race Pace", icon: "🏁" },
  mixed: { label: "Mixte", labelEn: "Mixed", icon: "🔄" },
};

// Difficulty Display Metadata
export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; labelEn: string; level: number }
> = {
  beginner: { label: "Débutant", labelEn: "Beginner", level: 1 },
  intermediate: { label: "Intermédiaire", labelEn: "Intermediate", level: 2 },
  advanced: { label: "Avancé", labelEn: "Advanced", level: 3 },
  elite: { label: "Élite", labelEn: "Elite", level: 4 },
};

// Helper to extract zone number from zone string
export function getZoneNumber(zone: Zone | string): ZoneNumber {
  const num = parseInt(zone.replace("Z", ""), 10);
  return (num >= 1 && num <= 6 ? num : 1) as ZoneNumber;
}

// Helper to get dominant zone from workout
export function getDominantZone(workout: WorkoutTemplate): ZoneNumber {
  const zones: ZoneNumber[] = [];

  for (const block of workout.mainSetTemplate) {
    if (block.zone) {
      zones.push(getZoneNumber(block.zone));
    }
  }

  if (zones.length === 0) return 2; // Default to endurance

  // Return the highest zone (most intense)
  return Math.max(...zones) as ZoneNumber;
}

// User Zone Preferences (for personalized zones)
export interface UserZonePreferences {
  fcMax?: number; // Max heart rate in bpm
  vma?: number; // Maximal Aerobic Speed in km/h
  updatedAt?: string; // ISO timestamp
}

// Calculated zone ranges
export interface ZoneRange {
  zone: ZoneNumber;
  hrMin?: number;
  hrMax?: number;
  paceMinPerKm?: number; // min/km (lower = faster)
  paceMaxPerKm?: number; // min/km (higher = slower)
}

// Helper to get estimated duration from typicalDuration
export function getEstimatedDuration(workout: WorkoutTemplate): number {
  return Math.round(
    (workout.typicalDuration.min + workout.typicalDuration.max) / 2
  );
}
