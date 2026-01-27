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
    label: "Recuperation",
    labelEn: "Recovery",
    color: "zone-1",
    description: "Effort tres leger, recuperation active",
    descriptionEn: "Very light effort, active recovery",
    physiology:
      "Stimule la circulation sanguine sans stress musculaire, favorise l'elimination des dechets metaboliques",
    physiologyEn:
      "Stimulates blood circulation without muscle stress, promotes metabolic waste elimination",
    sensation: "Effort minimal, respiration naturelle, conversation facile",
    sensationEn: "Minimal effort, natural breathing, easy conversation",
    benefit: "Accelere la recuperation entre les seances intenses",
    benefitEn: "Accelerates recovery between intense sessions",
    examples: ["Footing recuperation", "Jogging lendemain de competition"],
    examplesEn: ["Recovery jog", "Day-after-race easy run"],
  },
  2: {
    label: "Endurance",
    labelEn: "Endurance",
    color: "zone-2",
    description: "Effort modere, base aerobie",
    descriptionEn: "Moderate effort, aerobic base",
    physiology:
      "Developpe le reseau capillaire et la densite mitochondriale, ameliore l'utilisation des graisses",
    physiologyEn:
      "Develops capillary network and mitochondrial density, improves fat utilization",
    sensation:
      "Effort confortable, respiration reguliere, peut tenir une conversation",
    sensationEn:
      "Comfortable effort, regular breathing, can hold a conversation",
    benefit: "Construit la base aerobie, ameliore l'economie de course",
    benefitEn: "Builds aerobic base, improves running economy",
    examples: ["Sortie longue", "Footing quotidien", "Echauffement"],
    examplesEn: ["Long run", "Daily jog", "Warm-up"],
  },
  3: {
    label: "Tempo",
    labelEn: "Tempo",
    color: "zone-3",
    description: "Effort soutenu, seuil aerobie",
    descriptionEn: "Sustained effort, aerobic threshold",
    physiology:
      "Stimule le seuil lactique 1, ameliore la clairance du lactate",
    physiologyEn:
      "Stimulates lactate threshold 1, improves lactate clearance",
    sensation:
      "Effort modere, respiration plus profonde, phrases courtes possibles",
    sensationEn:
      "Moderate effort, deeper breathing, short sentences possible",
    benefit: "Augmente l'endurance a allure marathon",
    benefitEn: "Increases endurance at marathon pace",
    examples: ["Tempo run", "Course a allure marathon"],
    examplesEn: ["Tempo run", "Marathon pace run"],
  },
  4: {
    label: "Seuil",
    labelEn: "Threshold",
    color: "zone-4",
    description: "Effort intense, seuil lactique",
    descriptionEn: "Intense effort, lactate threshold",
    physiology:
      "Travaille au seuil lactique 2, repousse le point de basculement metabolique",
    physiologyEn:
      "Works at lactate threshold 2, pushes back the metabolic tipping point",
    sensation:
      "Effort soutenu, respiration controlee mais intense, quelques mots seulement",
    sensationEn:
      "Sustained effort, controlled but intense breathing, only a few words",
    benefit:
      "Ameliore la vitesse de croisiere sur semi-marathon et plus",
    benefitEn: "Improves cruising speed for half-marathon and beyond",
    examples: ["Intervalles au seuil", "Tempo soutenu 20-40min"],
    examplesEn: ["Threshold intervals", "Sustained tempo 20-40min"],
  },
  5: {
    label: "VO2max",
    labelEn: "VO2max",
    color: "zone-5",
    description: "Effort tres intense, puissance aerobie",
    descriptionEn: "Very intense effort, aerobic power",
    physiology:
      "Sollicite la consommation maximale d'oxygene, developpe la puissance aerobie",
    physiologyEn:
      "Engages maximal oxygen consumption, develops aerobic power",
    sensation: "Effort intense, respiration difficile, impossible de parler",
    sensationEn: "Intense effort, labored breathing, impossible to talk",
    benefit:
      "Augmente la VMA et la capacite a maintenir des allures rapides",
    benefitEn: "Increases VO2max and ability to sustain fast paces",
    examples: ["30/30", "Fractionne court", "Intervalles 400m-1000m"],
    examplesEn: ["30/30 intervals", "Short repeats", "400m-1000m intervals"],
  },
  6: {
    label: "Sprint",
    labelEn: "Sprint",
    color: "zone-6",
    description: "Effort maximal, vitesse",
    descriptionEn: "Maximal effort, speed",
    physiology:
      "Developpe la puissance neuromusculaire et la tolerance au lactate",
    physiologyEn:
      "Develops neuromuscular power and lactate tolerance",
    sensation:
      "Effort maximal, sprint, ne peut pas maintenir plus de 30-60 secondes",
    sensationEn:
      "Maximal effort, sprint, cannot sustain for more than 30-60 seconds",
    benefit: "Ameliore la vitesse pure et le kick final",
    benefitEn: "Improves pure speed and finishing kick",
    examples: ["Sprints courts", "Cotes rapides", "Accelerations"],
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

// Helper to get estimated duration from typicalDuration
export function getEstimatedDuration(workout: WorkoutTemplate): number {
  return Math.round(
    (workout.typicalDuration.min + workout.typicalDuration.max) / 2
  );
}
