export { ZoneBadge, ZoneBadges } from "./ZoneBadge";
export { WorkoutCard, WorkoutCardCompact } from "./WorkoutCard";
export { WorkoutListItem } from "./WorkoutListItem";
export { ViewModeSelector } from "./ViewModeSelector";
export {
  WorkoutFilters,
  defaultFilters,
  type WorkoutFiltersState,
} from "./WorkoutFilters";
export { CategoryIcon } from "./CategoryIcon";
export { FavoriteButton } from "./FavoriteButton";
export { ZonePersonalizationCTA } from "./ZonePersonalizationCTA";

// NOTE: Heavy components are NOT exported here to keep the main bundle small.
// Import them directly from their files when needed:
//
// Visualization-dependent (import visualization code):
// import { WorkoutOfTheDay } from "@/components/domain/WorkoutOfTheDay";
// import { WorkoutStructure, CoachingTips } from "@/components/domain/WorkoutStructure";
// import { ExportMenu } from "@/components/domain/ExportMenu";
// import { ExportableWorkoutCard } from "@/components/domain/ExportableWorkoutCard";
//
// Lazy-loaded pages only:
// import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
// import { PaceCalculator } from "@/components/domain/PaceCalculator";
// import { WorkoutQuiz } from "@/components/domain/WorkoutQuiz";
// import { ExportDatePicker } from "@/components/domain/ExportDatePicker";
// import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
//
// Data-dependent (import articles/glossary):
// import { ArticleCard } from "@/components/domain/ArticleCard";
// import { GlossaryCard } from "@/components/domain/GlossaryCard";
// import { GlossaryDetail } from "@/components/domain/GlossaryDetail";
