// Zone System Types
export type Zone = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6";
export type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type ZoneSpec = string;

// Discipline, the sport a workout segment belongs to.
// Introduced for multi-discipline foundation (running + cycling + swimming + triathlon bricks).
// Existing running-only content is treated as discipline = "running" by default.
export type Discipline = "running" | "cycling" | "swimming";

export const DISCIPLINES: readonly Discipline[] = ["running", "cycling", "swimming"] as const;

export type WorkoutPhaseKey = "warmup" | "main" | "cooldown";
export type WorkoutStepRole = "effort" | "recovery" | "transition";
export type WorkoutRepeatUnit = "reps" | "sets" | "blocks";

export interface WorkoutStepSegment {
  kind: "segment";
  description: string;
  descriptionEn?: string;
  descriptionIt?: string;
  durationSec?: number;
  distanceM?: number;
  distanceKm?: number;
  zone?: ZoneSpec;
  vmaPercent?: number;
  intensityType?: "E" | "M" | "T" | "I" | "R";
  role?: WorkoutStepRole;
  elevationGainM?: number;
  gradientPercent?: number;
  terrainType?: TerrainType;
}

export type TerrainType = "road" | "trail_runnable" | "trail_technical" | "mountain";

export interface WorkoutStepRepeat {
  kind: "repeat";
  count: number;
  unit?: WorkoutRepeatUnit;
  steps: WorkoutStep[];
  between?: WorkoutStep[];
}

export type WorkoutStep = WorkoutStepSegment | WorkoutStepRepeat;

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
  | "assessment"
  | "trail";

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
  descriptionIt?: string;
  durationMin?: number;
  repetitions?: number;
  distance?: string;
  distanceM?: number; // Distance in meters (used in interval workouts)
  distanceKm?: number; // Distance in km (for steady-state runs like long runs/footings)
  zone?: ZoneSpec;
  rest?: string;
  recovery?: string; // Recovery description (e.g., "200m footing")
  recoveryEn?: string; // English twin. Required whenever `recovery` is set:
                       // the derived WorkoutStep tree turns it into a segment,
                       // and a segment without its twin leaves an English
                       // reader with French text.
  recoveryIt?: string;
  // ── New fields (v2) ──
  sets?: number;               // Number of series (e.g., 2 series of 12 reps)
  restBetweenSets?: string;    // Rest between series (e.g., "3min footing")
  restBetweenSetsEn?: string;  // English twin, same rule as `recoveryEn`.
  restBetweenSetsIt?: string;
  vmaPercent?: number;         // % VMA target (alternative to zone)
  intensityType?: "E" | "M" | "T" | "I" | "R"; // Daniels intensity reference
  elevationGainM?: number;
  gradientPercent?: number;
  terrainType?: TerrainType;
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
  /**
   * Primary discipline. Defaults to "running" when absent so every existing
   * template is treated as a running workout.
   */
  discipline?: Discipline;
  id: string;
  name: string;
  nameEn: string;
  nameIt?: string;
  description: string;
  descriptionEn: string;
  descriptionIt?: string;
  category: WorkoutCategory;
  sessionType: SessionType;
  targetSystem: TargetSystem;
  difficulty: Difficulty;
  typicalDuration: DurationRange;
  environment: WorkoutEnvironment;
  warmupTemplate: WorkoutBlock[];
  mainSetTemplate: WorkoutBlock[];
  cooldownTemplate: WorkoutBlock[];
  warmupStructure?: WorkoutStep[];
  mainSetStructure?: WorkoutStep[];
  cooldownStructure?: WorkoutStep[];
  coachingTips: string[];
  coachingTipsEn: string[];
  coachingTipsIt?: string[];
  commonMistakes: string[];
  commonMistakesEn: string[];
  commonMistakesIt?: string[];
  variationIds: string[];
  selectionCriteria: SelectionCriteria;
  // ── New fields (v2, optional for backward compat) ──
  scaling?: WorkoutScaling;
  estimatedDistanceKm?: DurationRange; // { min, max } distance range
  weeklyFrequencyMax?: number;         // Max times per week
  minimumRecoveryDays?: number;        // Min rest days after this workout
  /**
   * Id of the workout this one was adapted from. Only ever set on a custom
   * copy, never on a catalogue template: adjusting a workout writes a new
   * `CUSTOM-` entry and leaves its source untouched.
   */
  sourceWorkoutId?: string;
}

/** Resolves the discipline of a workout, defaulting to running for legacy entries. */
export function getWorkoutDiscipline(workout: Pick<WorkoutTemplate, "discipline">): Discipline {
  return workout.discipline ?? "running";
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
  labelIt?: string;
  color: string;
  description: string;
  descriptionEn: string;
  descriptionIt?: string;
  physiology: string;
  physiologyEn: string;
  physiologyIt?: string;
  sensation: string;
  sensationEn: string;
  sensationIt?: string;
  benefit: string;
  benefitEn: string;
  benefitIt?: string;
  examples: string[];
  examplesEn: string[];
  examplesIt?: string[];
}

export const ZONE_META: Record<ZoneNumber, ZoneMeta> = {
  1: {
    label: "Récupération",
    labelEn: "Recovery",
    labelIt: "Recupero",
    color: "zone-1",
    description: "Effort très léger, récupération active",
    descriptionEn: "Very light effort, active recovery",
    descriptionIt: "Sforzo molto leggero, recupero attivo",
    physiology:
      "Stimule la circulation sanguine sans stress musculaire, favorise l'élimination des déchets métaboliques",
    physiologyEn:
      "Stimulates blood circulation without muscle stress, promotes metabolic waste elimination",
    physiologyIt:
      "Stimola la circolazione sanguigna senza stress muscolare, favorisce l'eliminazione dei cataboliti",
    sensation: "Effort minimal, respiration naturelle, conversation facile",
    sensationEn: "Minimal effort, natural breathing, easy conversation",
    sensationIt: "Sforzo minimo, respirazione naturale, conversazione facile",
    benefit: "Accélère la récupération entre les séances intenses",
    benefitEn: "Accelerates recovery between intense sessions",
    benefitIt: "Accelera il recupero tra le sedute intense",
    examples: ["Footing récupération", "Jogging lendemain de compétition"],
    examplesEn: ["Recovery jog", "Day-after-race easy run"],
    examplesIt: ["Corsa di recupero", "Corsa leggera post-gara"],
  },
  2: {
    label: "Endurance",
    labelEn: "Endurance",
    labelIt: "Resistenza",
    color: "zone-2",
    description: "Effort modéré, base aérobie",
    descriptionEn: "Moderate effort, aerobic base",
    descriptionIt: "Sforzo moderato, base aerobica",
    physiology:
      "Développe le réseau capillaire et la densité mitochondriale, améliore l'utilisation des graisses",
    physiologyEn:
      "Develops capillary network and mitochondrial density, improves fat utilization",
    physiologyIt:
      "Sviluppa la rete capillare e la densità mitocondriale, migliora l'ossidazione dei grassi",
    sensation:
      "Effort confortable, respiration régulière, peut tenir une conversation",
    sensationEn:
      "Comfortable effort, regular breathing, can hold a conversation",
    sensationIt:
      "Sforzo confortevole, respirazione regolare, consente di sostenere una conversazione",
    benefit: "Construit la base aérobie, améliore l'économie de course",
    benefitEn: "Builds aerobic base, improves running economy",
    benefitIt: "Costruisce la base aerobica, migliora l'economia di corsa",
    examples: ["Sortie longue", "Footing quotidien", "Échauffement"],
    examplesEn: ["Long run", "Daily jog", "Warm-up"],
    examplesIt: ["Uscita lunga", "Corsa quotidiana", "Riscaldamento"],
  },
  3: {
    label: "Tempo",
    labelEn: "Tempo",
    labelIt: "Tempo",
    color: "zone-3",
    description: "Effort soutenu, seuil aérobie",
    descriptionEn: "Sustained effort, aerobic threshold",
    descriptionIt: "Sforzo sostenuto, soglia aerobica",
    physiology:
      "Stimule le seuil lactique 1, améliore la clairance du lactate",
    physiologyEn:
      "Stimulates lactate threshold 1, improves lactate clearance",
    physiologyIt:
      "Stimola la prima soglia lattacida (LT1), migliora lo smaltimento del lattato",
    sensation:
      "Effort modéré, respiration plus profonde, phrases courtes possibles",
    sensationEn:
      "Moderate effort, deeper breathing, short sentences possible",
    sensationIt:
      "Sforzo moderato, respirazione più profonda, possibili frasi brevi",
    benefit: "Augmente l'endurance à allure marathon",
    benefitEn: "Increases endurance at marathon pace",
    benefitIt: "Aumenta la resistenza al ritmo maratona",
    examples: ["Tempo run", "Course à allure marathon"],
    examplesEn: ["Tempo run", "Marathon pace run"],
    examplesIt: ["Tempo run", "Corsa a ritmo maratona"],
  },
  4: {
    label: "Seuil",
    labelEn: "Threshold",
    labelIt: "Soglia",
    color: "zone-4",
    description: "Effort intense, seuil lactique",
    descriptionEn: "Intense effort, lactate threshold",
    descriptionIt: "Sforzo intenso, soglia del lattato",
    physiology:
      "Travaille au seuil lactique 2, repousse le point de basculement métabolique",
    physiologyEn:
      "Works at lactate threshold 2, pushes back the metabolic tipping point",
    physiologyIt:
      "Lavora alla seconda soglia lattacida (LT2), sposta più in alto il punto di accumulo",
    sensation:
      "Effort soutenu, respiration contrôlée mais intense, quelques mots seulement",
    sensationEn:
      "Sustained effort, controlled but intense breathing, only a few words",
    sensationIt:
      "Sforzo sostenuto, respirazione controllata ma intensa, solo poche parole",
    benefit:
      "Améliore la vitesse de croisière sur semi-marathon et plus",
    benefitEn: "Improves cruising speed for half-marathon and beyond",
    benefitIt:
      "Migliora la velocità di crociera su mezza maratona e oltre",
    examples: ["Intervalles au seuil", "Tempo soutenu 20-40min"],
    examplesEn: ["Threshold intervals", "Sustained tempo 20-40min"],
    examplesIt: ["Ripetute alla soglia", "Tempo sostenuto 20-40 min"],
  },
  5: {
    label: "VO2max",
    labelEn: "VO2max",
    labelIt: "VO2max",
    color: "zone-5",
    description: "Effort très intense, puissance aérobie",
    descriptionEn: "Very intense effort, aerobic power",
    descriptionIt: "Sforzo molto intenso, potenza aerobica",
    physiology:
      "Sollicite la consommation maximale d'oxygène, développe la puissance aérobie",
    physiologyEn:
      "Engages maximal oxygen consumption, develops aerobic power",
    physiologyIt:
      "Sollecita il massimo consumo di ossigeno, sviluppa la potenza aerobica",
    sensation: "Effort intense, respiration difficile, impossible to parler",
    sensationEn: "Intense effort, labored breathing, impossible to talk",
    sensationIt: "Sforzo intenso, respiro affannoso, impossibile parlare",
    benefit:
      "Augmente la VMA et la capacité à maintenir des allures rapides",
    benefitEn: "Increases VO2max and ability to sustain fast paces",
    benefitIt:
      "Aumenta la VAM e la capacità di sostenere ritmi elevati",
    examples: ["30/30", "Fractionné court", "Intervalles 400m-1000m"],
    examplesEn: ["30/30 intervals", "Short repeats", "400m-1000m intervals"],
    examplesIt: ["30/30", "Ripetute brevi", "Ripetute 400m-1000m"],
  },
  6: {
    label: "Sprint",
    labelEn: "Sprint",
    labelIt: "Sprint",
    color: "zone-6",
    description: "Effort maximal, vitesse",
    descriptionEn: "Maximal effort, speed",
    descriptionIt: "Sforzo massimale, velocità",
    physiology:
      "Développe la puissance neuromusculaire et la tolérance au lactate",
    physiologyEn:
      "Develops neuromuscular power and lactate tolerance",
    physiologyIt:
      "Sviluppa la potenza neuromuscolare e la tolleranza al lattato",
    sensation:
      "Effort maximal, sprint, ne peut pas maintenir plus de 30-60 secondes",
    sensationEn:
      "Maximal effort, sprint, cannot sustain for more than 30-60 seconds",
    sensationIt:
      "Sforzo massimale, sprint, non sostenibile oltre 30-60 secondi",
    benefit: "Améliore la vitesse pure et le kick final",
    benefitEn: "Improves pure speed and finishing kick",
    benefitIt: "Migliora la velocità pura e lo scatto finale",
    examples: ["Sprints courts", "Côtes rapides", "Accélérations"],
    examplesEn: ["Short sprints", "Fast hill repeats", "Accelerations"],
    examplesIt: ["Sprint brevi", "Salite veloci", "Accelerazioni"],
  },
};

// Category Display Metadata
// Icons live in CategoryIcon.tsx (CATEGORY_ICONS), not here.
export const CATEGORY_META: Record<
  WorkoutCategory,
  { label: string; labelEn: string; labelIt?: string }
> = {
  recovery: { label: "Récupération", labelEn: "Recovery", labelIt: "Recupero" },
  endurance: { label: "Endurance", labelEn: "Endurance", labelIt: "Resistenza" },
  tempo: { label: "Tempo", labelEn: "Tempo", labelIt: "Tempo" },
  threshold: { label: "Seuil", labelEn: "Threshold", labelIt: "Soglia" },
  vma_intervals: { label: "VMA", labelEn: "VO2max", labelIt: "VAM / VO2max" },
  long_run: { label: "Sortie longue", labelEn: "Long Run", labelIt: "Lungo" },
  hills: { label: "Côtes", labelEn: "Hills", labelIt: "Salite" },
  fartlek: { label: "Fartlek", labelEn: "Fartlek", labelIt: "Fartlek" },
  race_pace: { label: "Allure course", labelEn: "Race Pace", labelIt: "Ritmo gara" },
  mixed: { label: "Mixte", labelEn: "Mixed", labelIt: "Misto" },
  assessment: { label: "Tests", labelEn: "Assessment", labelIt: "Test" },
  trail: { label: "Trail", labelEn: "Trail", labelIt: "Trail" },
};

// Difficulty Display Metadata
export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; labelEn: string; labelIt?: string; level: number; desc: string; descEn: string; descIt?: string }
> = {
  beginner: { label: "Débutant", labelEn: "Beginner", labelIt: "Principiante", level: 1, desc: "1 à 2 sorties/semaine · moins de 15 km/semaine", descEn: "1-2 runs/week · less than 15 km/week", descIt: "1-2 uscite/settimana · meno di 15 km/settimana" },
  intermediate: { label: "Intermédiaire", labelEn: "Intermediate", labelIt: "Intermedio", level: 2, desc: "3 à 4 sorties/semaine · 20-40 km/semaine", descEn: "3-4 runs/week · 20-40 km/week", descIt: "3-4 uscite/settimana · 20-40 km/settimana" },
  advanced: { label: "Avancé", labelEn: "Advanced", labelIt: "Avanzato", level: 3, desc: "4 à 5 sorties/semaine · 40-70 km/semaine", descEn: "4-5 runs/week · 40-70 km/week", descIt: "4-5 uscite/settimana · 40-70 km/settimana" },
  elite: { label: "Élite", labelEn: "Elite", labelIt: "Élite", level: 4, desc: "5 à 7 sorties/semaine · 70+ km/semaine", descEn: "5-7 runs/week · 70+ km/week", descIt: "5-7 uscite/settimana · 70+ km/settimana" },
};

/** Inclusive zone span. `min === max` for a single-zone spec like `Z5`. */
export interface ZoneSpan {
  min: ZoneNumber;
  max: ZoneNumber;
}

function clampZone(value: number): ZoneNumber {
  if (value < 1) return 1;
  if (value > 6) return 6;
  return value as ZoneNumber;
}

/**
 * Single source of truth for reading a zone spec.
 *
 * Zone specs are ranges as often as they are scalars: `Z1-Z2` (progressive
 * jog), `Z4→Z5+`, `Z1-Z6` (free fartlek). Collapsing a range to one number
 * has to happen in exactly one place, otherwise callers disagree, the phase
 * badge and the zone breakdown used to answer Z1 and Z2 for the same string.
 *
 * Zones above the 6-zone Zoned model (e.g. Coggan Z7 cycling) clamp to Z6
 * rather than falling back to Z1, which would misclassify hard work as
 * recovery.
 */
export function parseZoneSpan(zone: Zone | string | null | undefined): ZoneSpan | null {
  if (!zone) return null;
  const matches = [...String(zone).matchAll(/Z\s*(\d+)/gi)].map((match) => Number(match[1]));
  const zones = matches.filter(Number.isFinite).map(clampZone);
  if (zones.length === 0) return null;
  return { min: Math.min(...zones) as ZoneNumber, max: Math.max(...zones) as ZoneNumber };
}

/**
 * Dominant zone of a spec, the hardest zone it reaches. Use for colour,
 * sorting and intensity ranking. Use `parseZoneSpan` when the range itself
 * carries meaning (badges, breakdowns).
 */
export function getZoneNumber(zone: Zone | string): ZoneNumber {
  return parseZoneSpan(zone)?.max ?? 1;
}

function collectStepZones(steps: WorkoutStep[], zones: ZoneNumber[]) {
  for (const step of steps) {
    if (step.kind === "segment") {
      if (!step.zone) continue;
      const matches = step.zone.match(/[1-6]/g) ?? [];
      for (const match of matches) {
        zones.push(Number(match) as ZoneNumber);
      }
      continue;
    }

    collectStepZones(step.steps, zones);
    if (step.between) collectStepZones(step.between, zones);
  }
}

/**
 * La zone de PIC d'une séance : la plus haute que touche son corps de séance,
 * Z2 sans zone du tout.
 *
 * Elle s'appelait `getDominantZone`, et le nom mentait : MIX-010 passe 22 min
 * 30 en Z1 et 1 min 30 en Z5, sa zone dite dominante était Z5. Tous ses
 * appelants voulaient bien le pic (une séance avec du Z4 est une séance de
 * qualité, le badge d'une carte dit jusqu'où elle monte), ils l'appellent
 * maintenant par son nom. La zone où l'on passe le plus de minutes se lit
 * dans la répartition (`transformSessionBlocks().zoneBreakdown`).
 */
export function getPeakZone(workout: WorkoutTemplate): ZoneNumber {
  const zones: ZoneNumber[] = [];

  if (workout.mainSetStructure?.length) {
    collectStepZones(workout.mainSetStructure, zones);
  } else {
    for (const block of workout.mainSetTemplate) {
      if (block.zone) {
        zones.push(getZoneNumber(block.zone));
      }
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

// ── Strength training types ──────────────────────────────────────
export * from "./strength";

// ── Unified workout type (running + strength) ────────────────────
import type { StrengthWorkoutTemplate } from "./strength";

/**
 * The one template contract. Every consumer that can receive either kind of
 * workout takes this union and narrows with the guards below. Nothing should
 * cast its way across the boundary.
 *
 * The two members deliberately keep different phase field names: running holds
 * `warmupTemplate` / `mainSetTemplate` / `cooldownTemplate` of `WorkoutBlock`
 * (zone + duration), strength holds `warmupBlocks` / `mainBlocks` /
 * `cooldownBlocks` of `StrengthBlock` (exercise + sets + reps). Aligning the
 * names was considered and rejected: the block types are not interchangeable,
 * so identical names would advertise a substitutability that does not exist
 * and would hide the mistake of feeding one to a consumer expecting the other.
 *
 * Consumers that do not care which naming applies use the accessors in
 * `@/lib/workoutTemplate` (`getWorkoutPhaseBlocks`), which also re-export
 * these guards so there is a single import path for "handle either kind".
 */
export type AnyWorkoutTemplate = WorkoutTemplate | StrengthWorkoutTemplate;

export function isStrengthWorkout(w: AnyWorkoutTemplate): w is StrengthWorkoutTemplate {
  return "kind" in w && w.kind === "strength";
}

export function isRunningWorkout(w: AnyWorkoutTemplate): w is WorkoutTemplate {
  return !isStrengthWorkout(w);
}
