import { useDeferredValue, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Filter,
  Search,
  Loader2,
  Dumbbell,
  Footprints,
  Bike,
  Waves,
  X,
} from "@/components/icons";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { Button } from "@/components/ui/button";
import { EditorialTitle, FadeUp } from "@/components/editorial";

import { WorkoutCardSkeleton } from "@/components/skeletons";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import {
  WorkoutCard,
  WorkoutCardCompact,
  WorkoutFilters,
  WorkoutListItem,
  ViewModeSelector,
  defaultFilters,
  type WorkoutFiltersState,
} from "@/components/domain";
import type {
  ActivityType,
  TerrainFilter,
} from "@/components/domain/WorkoutFilters";
import { SEOHead } from "@/components/seo";
import {
  useFavorites,
  useKeyboardShortcuts,
  useWorkouts,
  useViewMode,
} from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { getWorkoutDuration } from "@/components/visualization";
import { categories } from "@/data/workouts";
import { strengthCategories } from "@/data/strength";
import type {
  WorkoutCategory,
  AnyWorkoutTemplate,
  TargetSystem,
} from "@/types";
import { isStrengthWorkout, isRunningWorkout, getWorkoutDiscipline } from "@/types";
import type {
  StrengthCategory,
  StrengthWorkoutTemplate,
  StrengthEquipment,
  MuscleGroup,
} from "@/types/strength";
import { cn } from "@/lib/utils";
import { normalizeSearch } from "@/lib/search-utils";

// Duration constants (same as in WorkoutFilters)
const DURATION_MIN = 0;
const DURATION_MAX = 240;

/**
 * Get average duration for a strength workout
 */
function getStrengthDuration(w: StrengthWorkoutTemplate): number {
  return Math.round((w.typicalDuration.min + w.typicalDuration.max) / 2);
}

/**
 * Get duration for any workout type
 */
function getAnyWorkoutDuration(w: AnyWorkoutTemplate): number {
  if (isStrengthWorkout(w)) return getStrengthDuration(w);
  return getWorkoutDuration(w);
}

/**
 * Parses URL search params into filter state
 */
function parseFiltersFromParams(
  searchParams: URLSearchParams,
): Partial<WorkoutFiltersState> {
  const filters: Partial<WorkoutFiltersState> = {};

  // Category (comma-separated)
  const category = searchParams.get("category");
  if (category) {
    filters.category = category.split(",") as WorkoutCategory[];
  }

  // Difficulty (comma-separated)
  const difficulty = searchParams.get("difficulty");
  if (difficulty) {
    filters.difficulty = difficulty
      .split(",")
      .filter((d) =>
        ["beginner", "intermediate", "advanced", "elite"].includes(d),
      ) as WorkoutFiltersState["difficulty"];
  }

  // Terrain (comma-separated)
  const terrain = searchParams.get("terrain");
  if (terrain) {
    filters.terrain = terrain
      .split(",")
      .filter((t) =>
        ["flat", "hills", "track"].includes(t),
      ) as WorkoutFiltersState["terrain"];
  }

  // Max duration - sets the upper bound of duration range
  const maxDuration = searchParams.get("maxDuration");
  if (maxDuration) {
    const maxDur = parseInt(maxDuration, 10);
    if (!isNaN(maxDur) && maxDur >= DURATION_MIN && maxDur <= DURATION_MAX) {
      filters.durationRange = [DURATION_MIN, maxDur];
    }
  }

  // Strength category (comma-separated)
  const strengthCategory = searchParams.get("strengthCategory");
  if (strengthCategory) {
    filters.strengthCategory = strengthCategory.split(
      ",",
    ) as StrengthCategory[];
  }

  // Equipment (comma-separated)
  const equipment = searchParams.get("equipment");
  if (equipment) {
    filters.equipment = equipment.split(
      ",",
    ) as WorkoutFiltersState["equipment"];
  }

  // Muscle group (comma-separated)
  const muscleGroup = searchParams.get("muscleGroup");
  if (muscleGroup) {
    filters.muscleGroup = muscleGroup.split(
      ",",
    ) as WorkoutFiltersState["muscleGroup"];
  }

  return filters;
}

/**
 * Parse activity type from URL params
 */
function parseActivityType(searchParams: URLSearchParams): ActivityType {
  const type = searchParams.get("type");
  if (
    type === "running" ||
    type === "strength" ||
    type === "cycling" ||
    type === "swimming"
  ) {
    return type;
  }
  return "all";
}

export function LibraryPage() {
  usePageHint("library", "hints.library.title", "hints.library.description");
  const { t, i18n } = useTranslation(["library", "common"]);
  const { t: tStrength } = useTranslation("strength");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { favorites } = useFavorites();
  const { workouts: runningWorkouts, isLoading: isLoadingRunning } =
    useWorkouts();
  const { workouts: strengthWorkouts, isLoading: isLoadingStrength } =
    useStrengthWorkouts();
  const { workouts: cyclingWorkouts, isLoading: isLoadingCycling } =
    useCrossDisciplineWorkouts("cycling");
  const { workouts: swimmingWorkouts, isLoading: isLoadingSwimming } =
    useCrossDisciplineWorkouts("swimming");
  const { viewMode, setViewMode } = useViewMode();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Activity type from URL
  const [activityType, setActivityType] = useState<ActivityType>(() =>
    parseActivityType(searchParams),
  );

  // Temporary filters for mobile (apply/cancel behavior)
  const [tempFilters, setTempFilters] =
    useState<WorkoutFiltersState>(defaultFilters);

  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  useKeyboardShortcuts({
    searchRef: searchInputRef,
    onCloseMobileFilters: closeMobileFilters,
  });

  // Build merged workout list based on activity type
  const allWorkouts: AnyWorkoutTemplate[] = useMemo(() => {
    switch (activityType) {
      case "running":
        return runningWorkouts;
      case "strength":
        return strengthWorkouts;
      case "cycling":
        return cyclingWorkouts;
      case "swimming":
        return swimmingWorkouts;
      case "all":
        return [
          ...runningWorkouts,
          ...cyclingWorkouts,
          ...swimmingWorkouts,
          ...strengthWorkouts,
        ];
    }
  }, [
    activityType,
    runningWorkouts,
    strengthWorkouts,
    cyclingWorkouts,
    swimmingWorkouts,
  ]);

  const isLoading =
    activityType === "running"
      ? isLoadingRunning
      : activityType === "strength"
        ? isLoadingStrength
        : activityType === "cycling"
          ? isLoadingCycling
          : activityType === "swimming"
            ? isLoadingSwimming
            : isLoadingRunning ||
              isLoadingStrength ||
              isLoadingCycling ||
              isLoadingSwimming;

  // Count active filters (excluding searchQuery which is visible separately)
  const getActiveFiltersCount = (f: WorkoutFiltersState) => {
    let count = 0;
    count += f.category.length;
    count += f.difficulty.length;
    if (
      f.durationRange[0] !== DURATION_MIN ||
      f.durationRange[1] !== DURATION_MAX
    )
      count++;
    count += f.terrain.length;
    count += f.targetSystem.length;
    if (f.favoritesOnly) count++;
    count += f.strengthCategory.length;
    count += f.equipment.length;
    count += f.muscleGroup.length;
    return count;
  };

  // Open mobile filters and sync temp state
  const openMobileFilters = () => {
    setTempFilters(filters);
    setShowMobileFilters(true);
  };

  // Apply temporary filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setShowMobileFilters(false);
  };

  // Cancel without applying
  const cancelFilters = () => {
    setShowMobileFilters(false);
  };

  // Initialize filters from URL params
  const [filters, setFilters] = useState<WorkoutFiltersState>(() => {
    const paramsFilters = parseFiltersFromParams(searchParams);
    return {
      ...defaultFilters,
      ...paramsFilters,
    };
  });

  // Handle activity type change
  const handleActivityTypeChange = useCallback((newType: ActivityType) => {
    setActivityType(newType);
    const isRunningFamily =
      newType === "running" || newType === "cycling" || newType === "swimming";
    setFilters((prev) => ({
      ...prev,
      // When switching to strength-only, drop the shared running-family filters
      ...(newType === "strength"
        ? {
            category: [] as WorkoutCategory[],
            terrain: [] as TerrainFilter[],
            targetSystem: [] as TargetSystem[],
          }
        : {}),
      // When switching to any endurance discipline, drop strength-specific state
      ...(isRunningFamily
        ? {
            strengthCategory: [] as StrengthCategory[],
            equipment: [] as StrengthEquipment[],
            muscleGroup: [] as MuscleGroup[],
          }
        : {}),
      // Terrain and targetSystem only make sense for running — drop them
      // when the athlete picks cycling or swimming.
      ...(newType === "cycling" || newType === "swimming"
        ? {
            terrain: [] as TerrainFilter[],
            targetSystem: [] as TargetSystem[],
          }
        : {}),
    }));
  }, []);

  // Update URL when filters or activity type change
  useEffect(() => {
    const params = new URLSearchParams();

    if (activityType !== "all") {
      params.set("type", activityType);
    }

    if (filters.category.length > 0) {
      params.set("category", filters.category.join(","));
    }
    if (filters.difficulty.length > 0) {
      params.set("difficulty", filters.difficulty.join(","));
    }
    if (filters.terrain.length > 0) {
      params.set("terrain", filters.terrain.join(","));
    }
    if (filters.durationRange[1] !== DURATION_MAX) {
      params.set("maxDuration", filters.durationRange[1].toString());
    }
    if (filters.strengthCategory.length > 0) {
      params.set("strengthCategory", filters.strengthCategory.join(","));
    }
    if (filters.equipment.length > 0) {
      params.set("equipment", filters.equipment.join(","));
    }
    if (filters.muscleGroup.length > 0) {
      params.set("muscleGroup", filters.muscleGroup.join(","));
    }

    setSearchParams(params, { replace: true });
  }, [
    activityType,
    filters.category,
    filters.difficulty,
    filters.terrain,
    filters.durationRange,
    filters.strengthCategory,
    filters.equipment,
    filters.muscleGroup,
    setSearchParams,
  ]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, activityType]);

  // Shared filter logic
  const applyFiltersToWorkout = useCallback(
    (workout: AnyWorkoutTemplate, f: WorkoutFiltersState): boolean => {
      // Favorites filter
      if (f.favoritesOnly && !favorites.includes(workout.id)) {
        return false;
      }

      // Difficulty filter (shared)
      if (
        f.difficulty.length > 0 &&
        !f.difficulty.includes(workout.difficulty)
      ) {
        return false;
      }

      // Duration filter
      const duration = getAnyWorkoutDuration(workout);
      if (duration < f.durationRange[0] || duration > f.durationRange[1]) {
        return false;
      }

      // Search filter
      if (f.searchQuery) {
        const query = normalizeSearch(f.searchQuery);
        const matchesName =
          normalizeSearch(workout.name).includes(query) ||
          normalizeSearch(workout.nameEn).includes(query);
        const matchesDesc =
          normalizeSearch(workout.description).includes(query) ||
          normalizeSearch(workout.descriptionEn).includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // --- Cross-type exclusion in "all" mode ---
      // When a strength-specific filter is active, exclude running workouts (and vice versa)
      const hasStrengthFilter =
        f.strengthCategory.length > 0 ||
        f.equipment.length > 0 ||
        f.muscleGroup.length > 0;
      const hasRunningFilter =
        f.category.length > 0 ||
        f.terrain.length > 0 ||
        f.targetSystem.length > 0;

      if (isRunningWorkout(workout) && hasStrengthFilter) {
        return false;
      }
      if (isStrengthWorkout(workout) && hasRunningFilter) {
        return false;
      }

      // --- Endurance filters (running, cycling, swimming) ---
      if (isRunningWorkout(workout)) {
        // Category filter applies to all endurance disciplines
        if (f.category.length > 0 && !f.category.includes(workout.category)) {
          return false;
        }

        // Terrain and target-system are running-only attributes
        if (getWorkoutDiscipline(workout) === "running") {
          if (f.terrain.length > 0) {
            const env = workout.environment;
            const matchesTerrain = f.terrain.some((ter) => {
              if (ter === "flat") return !env.requiresHills && !env.requiresTrack;
              if (ter === "track") return !env.requiresHills;
              if (ter === "hills") return !env.requiresTrack;
              return true;
            });
            if (!matchesTerrain) return false;
          }

          if (
            f.targetSystem.length > 0 &&
            !f.targetSystem.includes(workout.targetSystem)
          ) {
            return false;
          }
        }
      }

      // --- Strength-specific filters ---
      if (isStrengthWorkout(workout)) {
        // Strength category filter
        if (
          f.strengthCategory.length > 0 &&
          !f.strengthCategory.includes(workout.category)
        ) {
          return false;
        }

        // Equipment filter
        if (f.equipment.length > 0) {
          const matchesEquipment = f.equipment.some((eq) => {
            if (eq === "none")
              return (
                workout.equipment.length === 0 ||
                workout.equipment.every((e) => e === "none")
              );
            return workout.equipment.includes(eq);
          });
          if (!matchesEquipment) return false;
        }

        // Muscle group filter
        if (f.muscleGroup.length > 0) {
          if (
            !f.muscleGroup.some((m) => workout.primaryMuscleGroups.includes(m))
          ) {
            return false;
          }
        }
      }

      return true;
    },
    [favorites],
  );

  // Defer the filter object so a fast typist doesn't block paint while
  // re-running the (otherwise pure) workout filter against ~200 entries.
  const deferredFilters = useDeferredValue(filters);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return allWorkouts.filter((workout) =>
      applyFiltersToWorkout(workout, deferredFilters),
    );
  }, [allWorkouts, deferredFilters, applyFiltersToWorkout]);

  // Calculate temp filtered count for Apply button
  const tempFilteredCount = useMemo(() => {
    if (!showMobileFilters) return 0;
    return allWorkouts.filter((workout) =>
      applyFiltersToWorkout(workout, tempFilters),
    ).length;
  }, [allWorkouts, tempFilters, showMobileFilters, applyFiltersToWorkout]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return getActiveFiltersCount(filters);
  }, [filters]);

  const visibleWorkouts = filteredWorkouts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWorkouts.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    onLoadMore: handleLoadMore,
  });

  // Dynamic subtitle based on activity type
  const subtitleKey =
    activityType === "strength"
      ? "subtitleStrength"
      : activityType === "all"
        ? "subtitleAll"
        : "subtitle";

  const seoDescription = isEn
    ? `Browse ${allWorkouts.length} science-based training sessions. Filter by category, difficulty, duration, and more.`
    : `Parcourez ${allWorkouts.length} séances d'entraînement scientifiques. Filtrez par catégorie, difficulté, durée et plus.`;

  return (
    <>
      <SEOHead
        title={t("common:seo.libraryTitle")}
        description={seoDescription}
        canonical="/library"
        jsonLd={{
          "@type": "CollectionPage",
          name: t("common:seo.libraryTitle"),
          description: seoDescription,
          url: "https://zoned.run/library",
        }}
      />
      <div className="py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div ref={filterSectionRef} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <EditorialTitle as="h1" size="md">
                {t("title")}
              </EditorialTitle>
              <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
                {t(subtitleKey, { count: filteredWorkouts.length })}
              </FadeUp>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* View mode selector */}
              <ViewModeSelector value={viewMode} onChange={setViewMode} />

              {/* Mobile filter button with badge */}
              <Button
                variant="outline"
                size="sm"
                onClick={openMobileFilters}
                className="lg:hidden relative"
              >
                <Filter className="size-4" />
                <span className="hidden sm:inline ml-2">
                  {t("filters.title")}
                </span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Activity type toggle */}
          <div className="mb-4">
            <div className="flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
              {(["all", "running", "cycling", "swimming", "strength"] as const).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleActivityTypeChange(type)}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      activityType === type
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {type === "running" && <Footprints className="size-3.5" />}
                    {type === "cycling" && <Bike className="size-3.5" />}
                    {type === "swimming" && <Waves className="size-3.5" />}
                    {type === "strength" && <Dumbbell className="size-3.5" />}
                    {t(`activityToggle.${type}`)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="lg:hidden relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label={t("filters.searchLabel")}
              placeholder={t("filters.search")}
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Category quick filters - mobile only */}
          <div className="lg:hidden mt-3">
            <div className="flex flex-wrap gap-2">
              {/* Running / cycling / swimming categories (shared WorkoutCategory enum) */}
              {(activityType === "running" ||
                activityType === "cycling" ||
                activityType === "swimming" ||
                activityType === "all") &&
                categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        category: filters.category.includes(
                          cat as WorkoutCategory,
                        )
                          ? filters.category.filter((c) => c !== cat)
                          : [...filters.category, cat as WorkoutCategory],
                        strengthCategory: [],
                      })
                    }
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      filters.category.includes(cat as WorkoutCategory)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {t(`categories.${cat}`)}
                  </button>
                ))}
              {/* Strength categories */}
              {(activityType === "strength" || activityType === "all") &&
                strengthCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        category: [],
                        strengthCategory: filters.strengthCategory.includes(
                          cat as StrengthCategory,
                        )
                          ? filters.strengthCategory.filter((c) => c !== cat)
                          : [
                              ...filters.strengthCategory,
                              cat as StrengthCategory,
                            ],
                      })
                    }
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      filters.strengthCategory.includes(cat as StrengthCategory)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {tStrength(`categories.${cat}`)}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
              <WorkoutFilters
                filters={filters}
                onFiltersChange={setFilters}
                searchInputRef={searchInputRef}
                activityType={activityType}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={cancelFilters}
              />
              <div
                className="absolute inset-y-0 right-0 w-full max-w-xs bg-background border-l shadow-lg flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-filters-title"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b shrink-0">
                  <h2 id="mobile-filters-title" className="font-semibold">
                    {t("filters.title")}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={cancelFilters}
                    aria-label={t("actions.close")}
                  >
                    ×
                  </Button>
                </div>

                {/* Filters content - scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <WorkoutFilters
                    filters={tempFilters}
                    onFiltersChange={setTempFilters}
                    hideSearch
                    activityType={activityType}
                  />
                </div>

                {/* Footer with Clear / Cancel / Apply */}
                <div className="border-t p-4 flex flex-col gap-2 shrink-0">
                  {(tempFilters.category.length > 0 ||
                    tempFilters.difficulty.length > 0 ||
                    tempFilters.durationRange[0] !== 0 ||
                    tempFilters.durationRange[1] !== 240 ||
                    tempFilters.terrain.length > 0 ||
                    tempFilters.targetSystem.length > 0 ||
                    tempFilters.favoritesOnly ||
                    tempFilters.strengthCategory.length > 0 ||
                    tempFilters.equipment.length > 0 ||
                    tempFilters.muscleGroup.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTempFilters(defaultFilters)}
                      className="w-full"
                    >
                      <X className="size-4 mr-1" />
                      {t("clearFilters")}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelFilters}
                      className="flex-1"
                    >
                      {t("common:actions.cancel")}
                    </Button>
                    <Button onClick={applyFilters} className="flex-1">
                      {t("filters.apply")} ({tempFilteredCount})
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout Display */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <WorkoutCardSkeleton key={i} className="border-border/50" />
                ))}
              </div>
            ) : filteredWorkouts.length > 0 ? (
              <>
                {viewMode === "grid" && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {visibleWorkouts.map((workout) => (
                      <WorkoutCard key={workout.id} workout={workout} />
                    ))}
                  </div>
                )}

                {viewMode === "list" && (
                  <div className="space-y-3">
                    {visibleWorkouts.map((workout) => (
                      <WorkoutListItem key={workout.id} workout={workout} />
                    ))}
                  </div>
                )}

                {viewMode === "compact" && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {visibleWorkouts.map((workout) => (
                      <WorkoutCardCompact key={workout.id} workout={workout} />
                    ))}
                  </div>
                )}

                {viewMode === "focus" && (
                  <div className="flex flex-col gap-8 max-w-2xl mx-auto">
                    {visibleWorkouts.map((workout) => (
                      <WorkoutCard
                        key={workout.id}
                        workout={workout}
                        expanded
                      />
                    ))}
                  </div>
                )}

                {/* Pagination: count + infinite scroll */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {t("showingCount", {
                      visible: visibleWorkouts.length,
                      total: filteredWorkouts.length,
                    })}
                  </p>
                  {hasMore && (
                    <>
                      <div
                        ref={sentinelRef}
                        className="w-full h-1"
                        aria-hidden="true"
                      />
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {/* Animated search icon with scan line */}
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-4 motion-safe:animate-pulse"
                  aria-hidden="true"
                >
                  <style>{`
                  @keyframes lib-scan {
                    0%, 100% { transform: translateY(12px); opacity: 0; }
                    20% { opacity: 0.6; }
                    80% { opacity: 0.6; }
                    50% { transform: translateY(36px); }
                  }
                `}</style>
                  <circle
                    cx="28"
                    cy="28"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    fill="none"
                  />
                  <line
                    x1="40"
                    y1="40"
                    x2="52"
                    y2="52"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.3"
                  />
                  {/* Scan line */}
                  <line
                    x1="16"
                    y1="28"
                    x2="40"
                    y2="28"
                    stroke="var(--zone-3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeOpacity="0.6"
                    style={{ animation: "lib-scan 2.5s ease-in-out infinite" }}
                  />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {filters.favoritesOnly
                    ? t("emptyState.noFavorites")
                    : t("emptyState.noResults")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {filters.favoritesOnly
                    ? t("emptyState.noFavoritesDescription")
                    : t("emptyState.noResultsDescription")}
                </p>
                <Button
                  variant="link"
                  onClick={() => setFilters(defaultFilters)}
                >
                  {t("clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>

        <ScrollToTop />
      </div>
    </>
  );
}
