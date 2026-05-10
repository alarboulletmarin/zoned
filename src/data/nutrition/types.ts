export type ThemeAccent = "amber" | "blue" | "rose" | "green" | "violet" | "primary" | "cyan" | "orange" | "slate";

export type NutritionIconName =
  | "Utensils"
  | "Coffee"
  | "Droplets"
  | "Flag"
  | "Clock"
  | "Zap"
  | "HeartPulse"
  | "Pill"
  | "Calendar"
  | "Wheat"
  | "Sun"
  | "Leaf"
  | "AlertTriangle"
  | "Sparkles"
  | "Activity"
  | "Brain"
  | "Shield"
  | "Moon"
  | "Lightbulb"
  | "Flame"
  | "Snowflake"
  | "Mountain";

export interface ThemeCard {
  id: string;
  iconName: NutritionIconName;
  accent: ThemeAccent;
  titleKey: string;
  taglineKey: string;
}

export interface DosageChip {
  labelKey: string;
  valueKey: string;
  helperKey?: string;
}

export interface CaffeineStep {
  timeLabelKey: string;
  actionKey: string;
}

export type RaceWeekDayId = "j7" | "j6" | "j5" | "j4" | "j3" | "j2" | "j1" | "j0";

export interface RaceWeekDay {
  day: RaceWeekDayId;
  iconName: NutritionIconName;
  titleKey: string;
  detailKey: string;
}

/** AIS supplement framework category. A = strong evidence, D = no evidence / banned. */
export type AisCategory = "A" | "B" | "C" | "D";

export type SupplementVerdict = "proven" | "conditional" | "marketing";

export interface SupplementEntry {
  id: string;
  iconName: NutritionIconName;
  nameKey: string;
  /** AIS classification (Australian Institute of Sport framework). */
  aisCategory: AisCategory;
  /** Coarse verdict for badge color. */
  verdict: SupplementVerdict;
  /** Single-line dose. */
  doseKey: string;
  /** Single-line context: "Race day", "Year-round", etc. */
  whenKey: string;
  rationaleKey: string;
  glossaryTermId?: string;
}

export interface CarbsRow {
  distanceKey: string;
  carbsPerHour: string;
  ratioKey: string;
  totalKey: string;
}

export interface ProteinDose {
  /** Profile of athlete: amateur, serious, elite, ultra. */
  profileKey: string;
  hoursPerWeekKey: string;
  /** g/kg/day target. */
  targetKey: string;
  helperKey: string;
}

export interface GutTrainingPhase {
  weekRangeKey: string;
  carbsPerHour: string;
  detailKey: string;
}

export interface MythCard {
  id: string;
  mythKey: string;
  truthKey: string;
  sourceKey: string;
}

export interface WomenInsight {
  iconName: NutritionIconName;
  titleKey: string;
  detailKey: string;
}

export interface HeatProtocol {
  iconName: NutritionIconName;
  titleKey: string;
  detailKey: string;
  durationKey: string;
}

export interface RatioComparison {
  ratio: string;
  labelKey: string;
  capacityKey: string;
  highlight: boolean;
}
