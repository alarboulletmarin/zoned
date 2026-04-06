import type { Difficulty, TrainingPhase, DurationRange } from "@/types";

// ── Muscle Groups ─────────────────────────────────────────────────
export type MuscleGroup =
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "hip_flexors"
  | "adductors"
  | "core_anterior"  // abs
  | "core_lateral"   // obliques
  | "core_posterior"  // lower back
  | "upper_back"
  | "shoulders"
  | "chest";

// ── Equipment ─────────────────────────────────────────────────────
export type StrengthEquipment =
  | "none"
  | "resistance_band"
  | "dumbbells"
  | "kettlebell"
  | "barbell"
  | "pull_up_bar"
  | "box"
  | "foam_roller"
  | "medicine_ball";

// ── Strength Intensity (separate from running zones Z1-Z6) ──────
// Each level maps to an RPE range for load scoring bridge
export type StrengthIntensity =
  | "mobility"      // RPE 2-3, movement prep, prehab
  | "endurance"     // RPE 4-5, high rep low load (2-3×12-15)
  | "hypertrophy"   // RPE 6-7, moderate rep/load (3×8-12)
  | "strength"      // RPE 8-9, low rep high load (3-5×3-6)
  | "power";        // RPE 7-8, explosive (3-4×4-6)

// ── Strength Categories ─────────────────────────────────────────
export type StrengthCategory =
  | "runner_full_body"
  | "runner_lower"
  | "runner_core"
  | "runner_upper"
  | "plyometrics"
  | "mobility"
  | "prehab";

// ── Exercise Tempo (eccentric-pause-concentric-pause) ───────────
export interface ExerciseTempo {
  eccentric: number;    // seconds (lowering)
  pause: number;        // seconds at bottom position
  concentric: number;   // seconds (lifting), 0 = explosive
  pauseTop: number;     // seconds at top position
}

// ── Atomic Exercise Definition ──────────────────────────────────
export interface StrengthExercise {
  id: string;                        // e.g., "EX-SQ-001"
  name: string;                      // French name
  nameEn: string;                    // English name
  description: string;               // French description
  descriptionEn: string;             // English description
  primaryMuscles: MuscleGroup[];     // Main muscles targeted
  secondaryMuscles: MuscleGroup[];   // Supporting muscles
  equipment: StrengthEquipment[];    // Required equipment
  isUnilateral: boolean;             // True = per side
  formCues: string[];                // French form cues (3-5 bullet points)
  formCuesEn: string[];              // English form cues
  tempo?: ExerciseTempo;             // Optional tempo prescription
  regressionId?: string;             // Easier variant exercise ID
  progressionId?: string;            // Harder variant exercise ID
  imageSlug?: string;                // Image filename in public/exercises/
}

// ── Strength Block (exercise within a session) ──────────────────
export interface StrengthBlock {
  exerciseId: string;                // Reference to StrengthExercise.id
  sets: number;
  reps: number | string;             // number or "30s" for timed holds
  restBetweenSets: string;           // e.g., "60s", "90s", "2min"
  intensity: StrengthIntensity;
  notes?: string;                    // French notes
  notesEn?: string;                  // English notes
  percentRM?: number;                // Optional % of 1RM for advanced users
  rpe?: number;                      // RPE target (1-10)
  supersetGroup?: string;            // "A", "B" etc. for supersets
}

// ── Strength Workout Template ───────────────────────────────────
export interface StrengthWorkoutTemplate {
  id: string;                        // STR-XXX prefix
  kind: "strength";                  // Discriminator for union type
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: StrengthCategory;
  difficulty: Difficulty;
  typicalDuration: DurationRange;
  equipment: StrengthEquipment[];    // All equipment needed for this session
  primaryMuscleGroups: MuscleGroup[];
  warmupBlocks: StrengthBlock[];
  mainBlocks: StrengthBlock[];
  cooldownBlocks: StrengthBlock[];
  intensity: StrengthIntensity;      // Overall session intensity
  coachingTips: string[];
  coachingTipsEn: string[];
  commonMistakes: string[];
  commonMistakesEn: string[];
  variationIds: string[];
  suitablePhases: TrainingPhase[];   // Which plan phases this fits
  weeklyFrequencyMax: number;
  minimumRecoveryDays: number;
  references?: string[];             // Scientific references
}

// ── Strength Category File (for lazy loading) ───────────────────
export interface StrengthCategoryFile {
  category: StrengthCategory;
  exercises: StrengthExercise[];
}

export interface StrengthSessionFile {
  category: StrengthCategory;
  templates: StrengthWorkoutTemplate[];
}
