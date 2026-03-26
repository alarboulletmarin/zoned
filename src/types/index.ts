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
  | "mixed"
  | "assessment";

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
  | "race_specific"
  | "strength"
  | "cycling"
  | "swimming"
  | "yoga"
  | "rest"
  | "rest_day"
  | "cross_training";

// Target System
export type TargetSystem =
  | "aerobic_base"
  | "aerobic_power"
  | "aerobic_threshold"
  | "lactate_threshold"
  | "lactate_tolerance"
  | "mixed"
  | "neuromuscular"
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
  distanceM?: number; // Distance in meters (used in interval workouts)
  distanceKm?: number; // Distance in km (for steady-state runs like long runs/footings)
  zone?: Zone;
  rest?: string;
  recovery?: string; // Recovery description (e.g., "200m footing")
  // ── New fields (v2) ──
  sets?: number;               // Number of series (e.g., 2 series of 12 reps)
  restBetweenSets?: string;    // Rest between series (e.g., "3min footing")
  vmaPercent?: number;         // % VMA target (alternative to zone)
  intensityType?: "E" | "M" | "T" | "I" | "R"; // Daniels intensity reference
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

// Scaling rules for progressive workout adaptation
export type ScalingType = "reps" | "duration" | "distance" | "sets";

export interface WorkoutScaling {
  /** What parameter scales with progression */
  progressionType: ScalingType;
  /** Value at start of phase (progression = 0) */
  minValue: number;
  /** Value at end of phase (progression = 1) */
  maxValue: number;
  /** Optional step size (e.g., +2 reps at a time) */
  stepSize?: number;
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
  // ── New fields (v2, optional for backward compat) ──
  scaling?: WorkoutScaling;
  estimatedDistanceKm?: DurationRange; // { min, max } distance range
  weeklyFrequencyMax?: number;         // Max times per week
  minimumRecoveryDays?: number;        // Min rest days after this workout
}

// Category File Structure
export interface WorkoutCategoryFile {
  category: WorkoutCategory;
  templates: WorkoutTemplate[];
}

// Zone Display Metadata with educational content
export interface ZoneMeta {
  label: string;
  labelEn: string;
  color: string;
  description: string;
  descriptionEn: string;
  physiology: string;
  physiologyEn: string;
  sensation: string;
  sensationEn: string;
  benefit: string;
  benefitEn: string;
  examples: string[];
  examplesEn: string[];
}

export const ZONE_META: Record<ZoneNumber, ZoneMeta> = {
  1: {
    label: "Récupération",
    labelEn: "Recovery",
    color: "zone-1",
    description: "Effort très léger, récupération active",
    descriptionEn: "Very light effort, active recovery",
    physiology:
      "Stimule la circulation sanguine sans stress musculaire, favorise l'élimination des déchets métaboliques",
    physiologyEn:
      "Stimulates blood circulation without muscle stress, promotes metabolic waste elimination",
    sensation: "Effort minimal, respiration naturelle, conversation facile",
    sensationEn: "Minimal effort, natural breathing, easy conversation",
    benefit: "Accélère la récupération entre les séances intenses",
    benefitEn: "Accelerates recovery between intense sessions",
    examples: ["Footing récupération", "Jogging lendemain de compétition"],
    examplesEn: ["Recovery jog", "Day-after-race easy run"],
  },
  2: {
    label: "Endurance",
    labelEn: "Endurance",
    color: "zone-2",
    description: "Effort modéré, base aérobie",
    descriptionEn: "Moderate effort, aerobic base",
    physiology:
      "Développe le réseau capillaire et la densité mitochondriale, améliore l'utilisation des graisses",
    physiologyEn:
      "Develops capillary network and mitochondrial density, improves fat utilization",
    sensation:
      "Effort confortable, respiration régulière, peut tenir une conversation",
    sensationEn:
      "Comfortable effort, regular breathing, can hold a conversation",
    benefit: "Construit la base aérobie, améliore l'économie de course",
    benefitEn: "Builds aerobic base, improves running economy",
    examples: ["Sortie longue", "Footing quotidien", "Échauffement"],
    examplesEn: ["Long run", "Daily jog", "Warm-up"],
  },
  3: {
    label: "Tempo",
    labelEn: "Tempo",
    color: "zone-3",
    description: "Effort soutenu, seuil aérobie",
    descriptionEn: "Sustained effort, aerobic threshold",
    physiology:
      "Stimule le seuil lactique 1, améliore la clairance du lactate",
    physiologyEn:
      "Stimulates lactate threshold 1, improves lactate clearance",
    sensation:
      "Effort modéré, respiration plus profonde, phrases courtes possibles",
    sensationEn:
      "Moderate effort, deeper breathing, short sentences possible",
    benefit: "Augmente l'endurance à allure marathon",
    benefitEn: "Increases endurance at marathon pace",
    examples: ["Tempo run", "Course à allure marathon"],
    examplesEn: ["Tempo run", "Marathon pace run"],
  },
  4: {
    label: "Seuil",
    labelEn: "Threshold",
    color: "zone-4",
    description: "Effort intense, seuil lactique",
    descriptionEn: "Intense effort, lactate threshold",
    physiology:
      "Travaille au seuil lactique 2, repousse le point de basculement métabolique",
    physiologyEn:
      "Works at lactate threshold 2, pushes back the metabolic tipping point",
    sensation:
      "Effort soutenu, respiration contrôlée mais intense, quelques mots seulement",
    sensationEn:
      "Sustained effort, controlled but intense breathing, only a few words",
    benefit:
      "Améliore la vitesse de croisière sur semi-marathon et plus",
    benefitEn: "Improves cruising speed for half-marathon and beyond",
    examples: ["Intervalles au seuil", "Tempo soutenu 20-40min"],
    examplesEn: ["Threshold intervals", "Sustained tempo 20-40min"],
  },
  5: {
    label: "VO2max",
    labelEn: "VO2max",
    color: "zone-5",
    description: "Effort très intense, puissance aérobie",
    descriptionEn: "Very intense effort, aerobic power",
    physiology:
      "Sollicite la consommation maximale d'oxygène, développe la puissance aérobie",
    physiologyEn:
      "Engages maximal oxygen consumption, develops aerobic power",
    sensation: "Effort intense, respiration difficile, impossible de parler",
    sensationEn: "Intense effort, labored breathing, impossible to talk",
    benefit:
      "Augmente la VMA et la capacité à maintenir des allures rapides",
    benefitEn: "Increases VO2max and ability to sustain fast paces",
    examples: ["30/30", "Fractionné court", "Intervalles 400m-1000m"],
    examplesEn: ["30/30 intervals", "Short repeats", "400m-1000m intervals"],
  },
  6: {
    label: "Sprint",
    labelEn: "Sprint",
    color: "zone-6",
    description: "Effort maximal, vitesse",
    descriptionEn: "Maximal effort, speed",
    physiology:
      "Développe la puissance neuromusculaire et la tolérance au lactate",
    physiologyEn:
      "Develops neuromuscular power and lactate tolerance",
    sensation:
      "Effort maximal, sprint, ne peut pas maintenir plus de 30-60 secondes",
    sensationEn:
      "Maximal effort, sprint, cannot sustain for more than 30-60 seconds",
    benefit: "Améliore la vitesse pure et le kick final",
    benefitEn: "Improves pure speed and finishing kick",
    examples: ["Sprints courts", "Côtes rapides", "Accélérations"],
    examplesEn: ["Short sprints", "Fast hill repeats", "Accelerations"],
  },
};

// Category Display Metadata
// Icon names correspond to Lucide React icons used in CategoryIcon.tsx
export const CATEGORY_META: Record<
  WorkoutCategory,
  { label: string; labelEn: string; icon: string }
> = {
  recovery: { label: "Récupération", labelEn: "Recovery", icon: "Leaf" },
  endurance: { label: "Endurance", labelEn: "Endurance", icon: "Activity" },
  tempo: { label: "Tempo", labelEn: "Tempo", icon: "Gauge" },
  threshold: { label: "Seuil", labelEn: "Threshold", icon: "Flame" },
  vma_intervals: { label: "VMA", labelEn: "VO2max", icon: "Rocket" },
  long_run: { label: "Sortie longue", labelEn: "Long Run", icon: "Route" },
  hills: { label: "Côtes", labelEn: "Hills", icon: "Mountain" },
  fartlek: { label: "Fartlek", labelEn: "Fartlek", icon: "Crosshair" },
  race_pace: { label: "Allure course", labelEn: "Race Pace", icon: "Flag" },
  mixed: { label: "Mixte", labelEn: "Mixed", icon: "RefreshCw" },
  assessment: { label: "Tests", labelEn: "Assessment", icon: "ClipboardCheck" },
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

