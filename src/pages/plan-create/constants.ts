import type { ComponentType } from "react";
import {
  Zap,
  Timer,
  Route,
  Flag,
  Target,
  Mountain,
  Heart,
  Footprints,
  TrendingUp,
  type IconProps,
} from "@/components/icons";
import type {
  PlanPurpose,
  RaceDistance,
  RacePriority,
} from "@/types/plan";

/**
 * Les tables du parcours, sorties de la page.
 *
 * Elles y étaient mêlées à 1 600 lignes de JSX. Ici elles se lisent, et un
 * écran qui a besoin d'une option n'a plus à importer la page entière.
 */

export const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6, 7] as const;

export const RACE_DISTANCE_ICONS: Record<RaceDistance, ComponentType<IconProps>> = {
  "5K": Zap,
  "10K": Timer,
  semi: Route,
  marathon: Flag,
  trail_short: Mountain,
  trail: Mountain,
  ultra: Mountain,
};



export const PURPOSE_OPTIONS: { value: PlanPurpose; icon: ComponentType<IconProps>; labelKey: string; descKey: string }[] = [
  { value: "race", icon: Target, labelKey: "purpose.race", descKey: "purpose.raceDesc" },
  { value: "base_building", icon: TrendingUp, labelKey: "purpose.baseBuilding", descKey: "purpose.baseBuildingDesc" },
  { value: "return_from_injury", icon: Heart, labelKey: "purpose.returnFromInjury", descKey: "purpose.returnFromInjuryDesc" },
  { value: "beginner_start", icon: Footprints, labelKey: "purpose.beginnerStart", descKey: "purpose.beginnerStartDesc" },
];

export const PRIORITY_OPTIONS: { value: RacePriority; labelKey: string; descKey: string }[] = [
  { value: "A", labelKey: "intermediateGoals.priorityA", descKey: "intermediateGoals.priorityADesc" },
  { value: "B", labelKey: "intermediateGoals.priorityB", descKey: "intermediateGoals.priorityBDesc" },
  { value: "C", labelKey: "intermediateGoals.priorityC", descKey: "intermediateGoals.priorityCDesc" },
];

/** Validation code → the sentence that says what to do about it. */
export const VALIDATION_KEYS: Record<string, string> = {
  BEFORE_START: "intermediateGoals.validation.beforeStart",
  AFTER_MAIN_RACE: "intermediateGoals.validation.afterMain",
  TOO_CLOSE_TO_MAIN: "intermediateGoals.validation.tooCloseToMain",
  TOO_CLOSE_TO_EACH_OTHER: "intermediateGoals.validation.tooCloseToOther",
  PRIORITY_A_IN_TAPER_ZONE: "intermediateGoals.validation.priorityAInTaper",
  INVALID_DATE: "intermediateGoals.validation.invalidDate",
  DISTANCE_TOO_LONG_FOR_PRIORITY: "intermediateGoals.validation.distanceTooLongForPriority",
  DISTANCE_LONGER_THAN_MAIN: "intermediateGoals.validation.distanceLongerThanMain",
};

// ── Helpers ──────────────────────────────────────────────────────────
