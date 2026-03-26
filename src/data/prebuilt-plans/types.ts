import type { Difficulty } from "@/types";
import type { RaceDistance, PlanWeek, PhaseRange, PlanPurpose, TrainingGoal } from "@/types/plan";

export interface PrebuiltPlan {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  difficulty: Difficulty;
  raceDistance?: RaceDistance;
  sessionsPerWeek: number;
  totalWeeks: number;
  phases: PhaseRange[];
  weeks: PlanWeek[];
  tags: string[];
  // ── v2 fields (optional for backward compat) ──
  version?: number;
  planPurpose?: PlanPurpose;
  trainingGoal?: TrainingGoal;
  peakWeeklyKm?: number;
  peakLongRunKm?: number;
}
