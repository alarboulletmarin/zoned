export { ZoneBadge, ZoneBadges } from "./ZoneBadge";
export { WorkoutCard, WorkoutCardCompact, WorkoutCardChrome } from "./WorkoutCard";
export { WorkoutRow, FavoriteMark } from "./WorkoutRow";
export { WorkoutTable } from "./WorkoutTable";
export { StrengthWorkoutCard, StrengthWorkoutCardCompact } from "./StrengthWorkoutCard";
export {
  WorkoutFilters,
  defaultFilters,
  type WorkoutFiltersState,
} from "./WorkoutFilters";
export { CategoryIcon } from "./CategoryIcon";
export { DifficultyIcon } from "./DifficultyIcon";
export { FavoriteButton } from "./FavoriteButton";
export { ZonePersonalizationCTA, ZONE_CTA_INPUT_ID } from "./ZonePersonalizationCTA";
export { TipCard } from "./TipCard";
export { CollectionCard } from "./CollectionCard";
export { ScanCard } from "./ScanCard";

// NOTE: Heavy components are NOT exported here to keep the main bundle small.
// Import them directly from their files when needed:
//
// Visualization-dependent (import visualization code):
// import { WorkoutStructure, CoachingTips } from "@/components/domain/WorkoutStructure";
// import { ExportMenu } from "@/components/domain/ExportMenu";
// import { ExportableWorkoutCard } from "@/components/domain/ExportableWorkoutCard";
//
// Lazy-loaded pages only:
// import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
// import { PaceCalculator } from "@/components/domain/PaceCalculator";
// import { ExportDatePicker } from "@/components/domain/ExportDatePicker";
// import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
//
// Data-dependent (import articles/glossary):
// import { ArticleCard } from "@/components/domain/ArticleCard";
// import { GlossaryCard } from "@/components/domain/GlossaryCard";
// import { GlossaryDetail } from "@/components/domain/GlossaryDetail";
