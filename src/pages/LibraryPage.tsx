import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Filter, Search, Heart, Loader2 } from "@/components/icons";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { EmptyState } from "@/components/ui/empty-state";
import {
  WorkoutCard,
  WorkoutFilters,
  WorkoutListItem,
  ViewModeSelector,
  defaultFilters,
  type WorkoutFiltersState,
} from "@/components/domain";
import { SEOHead } from "@/components/seo";
import { useFavorites, useKeyboardShortcuts, useWorkouts, useViewMode } from "@/hooks";
import { getWorkoutDuration } from "@/components/visualization";
import type { WorkoutCategory } from "@/types";

// Duration constants (same as in WorkoutFilters)
const DURATION_MIN = 10;
const DURATION_MAX = 180;

/**
 * Parses URL search params into filter state
 */
function parseFiltersFromParams(searchParams: URLSearchParams): Partial<WorkoutFiltersState> {
  const filters: Partial<WorkoutFiltersState> = {};

  // Category
  const category = searchParams.get("category");
  if (category) {
    filters.category = category as WorkoutCategory;
  }

  // Difficulty
  const difficulty = searchParams.get("difficulty");
  if (difficulty && ["beginner", "intermediate", "advanced", "elite"].includes(difficulty)) {
    filters.difficulty = difficulty as WorkoutFiltersState["difficulty"];
  }

  // Terrain
  const terrain = searchParams.get("terrain");
  if (terrain && ["flat", "hills", "track"].includes(terrain)) {
    filters.terrain = terrain as WorkoutFiltersState["terrain"];
  }

  // Max duration - sets the upper bound of duration range
  const maxDuration = searchParams.get("maxDuration");
  if (maxDuration) {
    const maxDur = parseInt(maxDuration, 10);
    if (!isNaN(maxDur) && maxDur >= DURATION_MIN && maxDur <= DURATION_MAX) {
      filters.durationRange = [DURATION_MIN, maxDur];
    }
  }

  return filters;
}

export function LibraryPage() {
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { favorites } = useFavorites();
  const { workouts: allWorkouts } = useWorkouts();
  const { viewMode, setViewMode } = useViewMode();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Temporary filters for mobile (apply/cancel behavior)
  const [tempFilters, setTempFilters] = useState<WorkoutFiltersState>(defaultFilters);

  const closeMobileFilters = useCallback(() => {
    setShowMobileFilters(false);
  }, []);

  useKeyboardShortcuts({
    searchRef: searchInputRef,
    onCloseMobileFilters: closeMobileFilters,
  });

  // Count active filters (excluding searchQuery which is visible separately)
  const getActiveFiltersCount = (f: WorkoutFiltersState) => {
    let count = 0;
    if (f.category !== "all") count++;
    if (f.difficulty !== "all") count++;
    if (f.durationRange[0] !== DURATION_MIN || f.durationRange[1] !== DURATION_MAX) count++;
    if (f.terrain !== "all") count++;
    if (f.targetSystem !== "all") count++;
    if (f.favoritesOnly) count++;
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.category !== "all") {
      params.set("category", filters.category);
    }
    if (filters.difficulty !== "all") {
      params.set("difficulty", filters.difficulty);
    }
    if (filters.terrain !== "all") {
      params.set("terrain", filters.terrain);
    }
    if (filters.durationRange[1] !== DURATION_MAX) {
      params.set("maxDuration", filters.durationRange[1].toString());
    }

    setSearchParams(params);
  }, [filters.category, filters.difficulty, filters.terrain, filters.durationRange, setSearchParams]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return allWorkouts.filter((workout) => {
      // Favorites filter
      if (filters.favoritesOnly && !favorites.includes(workout.id)) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && workout.category !== filters.category) {
        return false;
      }

      // Difficulty filter
      if (
        filters.difficulty !== "all" &&
        workout.difficulty !== filters.difficulty
      ) {
        return false;
      }

      // Terrain filter - matches the availability-based logic from Quiz
      // "track" = user has access to track, show track workouts + general workouts
      // "hills" = user has access to hills, show hills workouts + general workouts
      // "flat" = user only has flat terrain, exclude workouts requiring hills/track
      if (filters.terrain !== "all") {
        const env = workout.environment;
        if (filters.terrain === "flat" && (env.requiresHills || env.requiresTrack)) return false;
        // For track/hills: allow workouts that match OR don't have terrain requirements
        if (filters.terrain === "track" && env.requiresHills) return false;
        if (filters.terrain === "hills" && env.requiresTrack) return false;
      }

      // Target system filter
      if (filters.targetSystem !== "all" && workout.targetSystem !== filters.targetSystem) {
        return false;
      }

      // Duration filter
      const duration = getWorkoutDuration(workout);
      if (
        duration < filters.durationRange[0] ||
        duration > filters.durationRange[1]
      ) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          workout.name.toLowerCase().includes(query) ||
          workout.nameEn.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.descriptionEn.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [filters, favorites]);

  // Calculate temp filtered count for Apply button
  const tempFilteredCount = useMemo(() => {
    if (!showMobileFilters) return 0;
    return allWorkouts.filter((workout) => {
      // Favorites filter
      if (tempFilters.favoritesOnly && !favorites.includes(workout.id)) {
        return false;
      }

      // Category filter
      if (tempFilters.category !== "all" && workout.category !== tempFilters.category) {
        return false;
      }

      // Difficulty filter
      if (
        tempFilters.difficulty !== "all" &&
        workout.difficulty !== tempFilters.difficulty
      ) {
        return false;
      }

      // Terrain filter - matches the availability-based logic from Quiz
      // "track" = user has access to track, show track workouts + general workouts
      // "hills" = user has access to hills, show hills workouts + general workouts
      // "flat" = user only has flat terrain, exclude workouts requiring hills/track
      if (tempFilters.terrain !== "all") {
        const env = workout.environment;
        if (tempFilters.terrain === "flat" && (env.requiresHills || env.requiresTrack)) return false;
        // For track/hills: allow workouts that match OR don't have terrain requirements
        if (tempFilters.terrain === "track" && env.requiresHills) return false;
        if (tempFilters.terrain === "hills" && env.requiresTrack) return false;
      }

      // Target system filter
      if (tempFilters.targetSystem !== "all" && workout.targetSystem !== tempFilters.targetSystem) {
        return false;
      }

      // Duration filter
      const duration = getWorkoutDuration(workout);
      if (
        duration < tempFilters.durationRange[0] ||
        duration > tempFilters.durationRange[1]
      ) {
        return false;
      }

      // Search filter
      if (tempFilters.searchQuery) {
        const query = tempFilters.searchQuery.toLowerCase();
        return (
          workout.name.toLowerCase().includes(query) ||
          workout.nameEn.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.descriptionEn.toLowerCase().includes(query)
        );
      }

      return true;
    }).length;
  }, [tempFilters, showMobileFilters, favorites]);

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

  const seoDescription = isEn
    ? `Browse ${allWorkouts.length} science-based running workouts. Filter by category, difficulty, duration, and terrain.`
    : `Parcourez ${allWorkouts.length} séances de course scientifiques. Filtrez par catégorie, difficulté, durée et terrain.`;

  return (
    <>
      <SEOHead
        title={isEn ? "Workout Library" : "Bibliothèque"}
        description={seoDescription}
        canonical="/library"
        jsonLd={{
          "@type": "CollectionPage",
          name: isEn ? "Workout Library" : "Bibliothèque",
          description: seoDescription,
          url: "https://zoned.run/library",
        }}
      />
      <div className="py-8">
        {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle", { count: filteredWorkouts.length })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View mode selector */}
            <ViewModeSelector
              value={viewMode}
              onChange={setViewMode}
            />

          {/* Mobile filter button with badge */}
          <Button
            variant="outline"
            size="sm"
            onClick={openMobileFilters}
            className="lg:hidden relative"
          >
            <Filter className="size-4" />
            <span className="hidden sm:inline ml-2">{t("filters.title")}</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
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
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <WorkoutFilters
              filters={filters}
              onFiltersChange={setFilters}
              searchInputRef={searchInputRef}
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
                <h2 id="mobile-filters-title" className="font-semibold">{t("filters.title")}</h2>
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
                />
              </div>

              {/* Footer with Apply/Cancel */}
              <div className="border-t p-4 flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={cancelFilters}
                  className="flex-1"
                >
                  {t("common:actions.cancel")}
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1"
                >
                  {t("filters.apply")} ({tempFilteredCount})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Display */}
        <div className="flex-1">
          {filteredWorkouts.length > 0 ? (
            <>
              {viewMode === "grid" && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-2">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutListItem key={workout.id} workout={workout} />
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
                    <div ref={sentinelRef} className="w-full h-1" aria-hidden="true" />
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              icon={filters.favoritesOnly ? Heart : Search}
              title={
                filters.favoritesOnly
                  ? t("emptyState.noFavorites")
                  : t("emptyState.noResults")
              }
              description={
                filters.favoritesOnly
                  ? t("emptyState.noFavoritesDescription")
                  : t("emptyState.noResultsDescription")
              }
              action={
                <Button variant="link" onClick={() => setFilters(defaultFilters)}>
                  {t("clearFilters")}
                </Button>
              }
            />
          )}
        </div>
      </div>

      <ScrollToTop />
    </div>
    </>
  );
}
