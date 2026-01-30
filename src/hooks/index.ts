export { useFavorites, FavoritesProvider } from "./useFavorites";
export { useKeyboardShortcuts } from "./useKeyboardShortcuts";
export {
  useWorkouts,
  useWorkout,
  useCategoryWorkouts,
  useWorkoutOfTheDay,
  useRelatedWorkouts,
  useFilteredWorkouts,
} from "./useWorkouts";

// NOTE: useArticles and useGlossary are NOT exported here to avoid
// pulling their data into the main bundle. Import them directly:
// import { useArticle } from "@/hooks/useArticles";
// import { useGlossary } from "@/hooks/useGlossary";
