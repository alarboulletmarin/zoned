import type { Difficulty } from "@/types";
import type { RaceDistance, PlanWeek, PhaseRange } from "@/types/plan";

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
}
