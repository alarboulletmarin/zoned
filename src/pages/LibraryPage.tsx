import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Filter, Search, Loader2 } from "@/components/icons";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
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
import { SEOHead } from "@/components/seo";
import { useFavorites, useKeyboardShortcuts, useWorkouts, useViewMode } from "@/hooks";
import { getWorkoutDuration } from "@/components/visualization";
import { categories } from "@/data/workouts";
import type { WorkoutCategory } from "@/types";

// Duration constants (same as in WorkoutFilters)
const DURATION_MIN = 0;
const DURATION_MAX = 240;

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
  usePageHint("library", "hints.library.title", "hints.library.description");
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { favorites } = useFavorites();
  const { workouts: allWorkouts, isLoading } = useWorkouts();
  const { viewMode, setViewMode } = useViewMode();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

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
      <div ref={filterSectionRef} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">
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

        {/* Category quick filters - mobile only */}
        <div className="lg:hidden mt-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.category === "all" ? "default" : "outline"}
              size="sm"
              className="shrink-0 text-xs h-7 rounded-full"
              onClick={() => setFilters({ ...filters, category: "all" })}
            >
              {t("filters.allCategories")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filters.category === cat ? "default" : "outline"}
                size="sm"
                className="shrink-0 text-xs h-7 rounded-full"
                onClick={() => setFilters({ ...filters, category: cat as WorkoutCategory })}
              >
                {t(`categories.${cat}`)}
              </Button>
            ))}
          </div>
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
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 p-3 sm:p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="size-6 rounded-full" />
                  </div>
                  {/* Description (hidden on mobile, matching WorkoutCard) */}
                  <Skeleton className="hidden sm:block h-3 w-full" />
                  <Skeleton className="hidden sm:block h-3 w-2/3" />
                  {/* Intensity bar */}
                  <Skeleton variant="zone-shimmer" className="h-[3px] w-full rounded-full" />
                  {/* Meta row: duration + category */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  {/* Badge pills */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkouts.length > 0 ? (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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

              {viewMode === "compact" && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutCardCompact key={workout.id} workout={workout} />
                  ))}
                </div>
              )}

              {viewMode === "focus" && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} expanded />
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
                <circle cx="28" cy="28" r="16" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <line x1="40" y1="40" x2="52" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.3" />
                {/* Scan line */}
                <line
                  x1="16" y1="28" x2="40" y2="28"
                  stroke="var(--zone-3)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"
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
              <Button variant="link" onClick={() => setFilters(defaultFilters)}>
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
