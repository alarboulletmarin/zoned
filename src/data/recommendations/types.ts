import type { WorkoutCategory } from "@/types";

/** Phase of the workout timeline */
export type RecommendationPhase = "before" | "during" | "after";

/** Domain of the recommendation */
export type RecommendationDomain = "nutrition" | "hydration" | "recovery";

/** A single recommendation item with bilingual text */
export interface RecommendationItem {
  text: string;
  textEn: string;
  priority: number; // 1 = critical, 2 = important, 3 = nice-to-have
}

/** Recommendations grouped by domain for a given phase */
export interface PhaseRecommendations {
  nutrition: RecommendationItem[];
  hydration: RecommendationItem[];
  recovery: RecommendationItem[];
}

/** Complete recommendations for a workout across all phases */
export interface WorkoutRecommendations {
  before: PhaseRecommendations;
  during: PhaseRecommendations | null;
  after: PhaseRecommendations;
  showDuringPhase: boolean;
}

/** Duration classification bucket */
export type DurationCategory = "short" | "medium" | "long";

/** Intensity classification bucket */
export type IntensityCategory = "low" | "moderate" | "high";

/** Classified workout profile used by rule functions */
export interface WorkoutProfile {
  duration: DurationCategory;
  intensity: IntensityCategory;
  category: WorkoutCategory;
}
