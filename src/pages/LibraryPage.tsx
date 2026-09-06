import {
  useDeferredValue,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentType,
} from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  SlidersHorizontal,
  Dumbbell,
  Run,
  Bike,
  Pool,
  X,
  type IconProps,
} from "@/components/icons";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useAppStats } from "@/hooks/useAppStats";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { getWorkoutDuration, ZoneScale } from "@/components/visualization";
import { categories } from "@/data/workouts";
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
import { normalizeSearch } from "@/lib/search-utils";

// Duration constants (same as in WorkoutFilters)
const DURATION_MIN = 0;
const DURATION_MAX = 300;

/** The discipline strip. "all" is a view of the catalogue, not a discipline. */
const ACTIVITY_TYPES: ActivityType[] = [
  "all",
  "running",
  "cycling",
  "swimming",
  "strength",
];
const DISCIPLINE_COUNT = ACTIVITY_TYPES.length - 1;

const ACTIVITY_ICONS: Partial<
  Record<ActivityType, ComponentType<IconProps>>
> = {
  running: Run,
  cycling: Bike,
  swimming: Pool,
  strength: Dumbbell,
};

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
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const stats = useAppStats();
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
  const disciplineRailRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Activity type from URL
  const [activityType, setActivityType] = useState<ActivityType>(() =>
    parseActivityType(searchParams),
  );

  useKeyboardShortcuts({ searchRef: searchInputRef });

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

  // The filter panel. Nine rows of chips, a slider and a switch used to sit
  // permanently between the title and the first card — on a phone that was a
  // full screen of controls before a single session was visible. They are the
  // same controls, moved behind one button that says how many are on.
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Sous 640 le rail des disciplines défile, jamais la page. Un onglet
  // restauré depuis ?type= doit revenir sous les yeux — même geste que
  // RaceSimNav, mais en « nearest » : au-dessus de 360px le rail ne défile
  // pas et l'appel ne bouge rien, donc aucune secousse au montage.
  useEffect(() => {
    disciplineRailRef.current
      ?.querySelector<HTMLElement>(`[data-discipline="${activityType}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activityType]);

  // APG « Radio Group » : un seul arrêt de tabulation pour le groupe, les
  // flèches déplacent le focus ET cochent, avec bouclage. Cassé jusqu'ici —
  // cinq boutons tabulables, aucun onKeyDown — et bloquant dès que le rail
  // défile. Mécanique reprise telle quelle de ui/segmented.tsx.
  const moveDiscipline = useCallback(
    (index: number) => {
      const next = ACTIVITY_TYPES[index];
      if (!next) return;
      handleActivityTypeChange(next);
      disciplineRailRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        [index]?.focus();
    },
    [handleActivityTypeChange],
  );

  const handleDisciplineKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const count = ACTIVITY_TYPES.length;
      const current = ACTIVITY_TYPES.indexOf(activityType);
      // Rien de coché : la première option porte l'arrêt de tabulation.
      const tabStop = current === -1 ? 0 : current;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          moveDiscipline((tabStop - 1 + count) % count);
          break;
        case "ArrowRight":
        case "ArrowDown":
          moveDiscipline((tabStop + 1) % count);
          break;
        case "Home":
          moveDiscipline(0);
          break;
        case "End":
          moveDiscipline(count - 1);
          break;
        default:
          return;
      }
      event.preventDefault();
    },
    [activityType, moveDiscipline],
  );

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

      // Duration filter. When the upper bound sits at the slider ceiling we
      // treat it as "no cap", so long sessions above the ceiling (e.g. a
      // 300-min long run) aren't silently filtered out by default.
      const duration = getAnyWorkoutDuration(workout);
      const capped = f.durationRange[1] < DURATION_MAX;
      if (
        duration < f.durationRange[0] ||
        (capped && duration > f.durationRange[1])
      ) {
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
    ? `Browse ${allWorkouts.length} science-based training sessions. Filter by category, difficulty, duration, and more.`
    : `Parcourez ${allWorkouts.length} séances d'entraînement scientifiques. Filtrez par catégorie, difficulté, durée et plus.`;

  // The strip's meta line: what is on screen, and what is narrowing it.
  const metaLine = [
    t("meta.results", { count: filteredWorkouts.length }),
    activeFiltersCount > 0
      ? t("meta.filters", { count: activeFiltersCount })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // An empty result states its cause with a number, and offers the way back.
  const emptyDescription = filters.favoritesOnly
    ? t("emptyState.noFavoritesDescription")
    : activeFiltersCount > 0
      ? t("emptyState.filteredOut", {
          count: activeFiltersCount,
          total: allWorkouts.length,
        })
      : filters.searchQuery
        ? t("emptyState.noMatchForQuery", {
            query: filters.searchQuery,
            total: allWorkouts.length,
          })
        : t("emptyState.noResultsDescription");

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

      <div className="zn-lib">
        {/* 1 — the catalogue, named and counted, with the way into it */}
        <section className="zn-split zn-lib__head">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <span className="zn-kicker">
              {stats.workouts > 0
                ? t("catalogue", {
                    workouts: stats.workouts,
                    categories: categories.length,
                    disciplines: DISCIPLINE_COUNT,
                  })
                : " "}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("title")}
            </h1>
          </div>

          <div className="zn-lib__search" role="search">
            <Search size={16} className="zn-lib__search-glyph" />
            <input
              ref={searchInputRef}
              type="search"
              className="zn-lib__search-input"
              aria-label={t("filters.searchLabel")}
              placeholder={t("filters.searchPlaceholder")}
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
            />
            {filters.searchQuery && (
              <button
                type="button"
                className="zn-lib__search-clear"
                aria-label={t("common:actions.clear")}
                onClick={() => setFilters({ ...filters, searchQuery: "" })}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        {/* 2 — the discipline strip, on the rule */}
        <div className="zn-lib__strip">
          <div className="zn-tabs__list zn-lib__tabs">
            <div
              ref={disciplineRailRef}
              className="zn-lib__disciplines"
              role="radiogroup"
              aria-label={t("draw.filters.discipline")}
              onKeyDown={handleDisciplineKeyDown}
            >
              {ACTIVITY_TYPES.map((type) => {
                const Icon = ACTIVITY_ICONS[type];
                const active = activityType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    data-discipline={type}
                    data-state={active ? "active" : "inactive"}
                    className="zn-tabs__trigger"
                    onClick={() => handleActivityTypeChange(type)}
                  >
                    {Icon && <Icon size={15} />}
                    {/* Le libellé long au-dessus de 640, le court en dessous :
                        la variante masquée sort de l'arbre d'accessibilité, le
                        nom accessible reste ce qui est à l'écran. */}
                    <span className="zn-lib__disc-full">
                      {t(`activityToggle.${type}`)}
                    </span>
                    <span className="zn-lib__disc-short">
                      {t(`activityToggleShort.${type}`)}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="zn-mono zn-lib__meta">{metaLine}</span>

            <button
              type="button"
              className="zn-lib__filters-btn"
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              data-on={activeFiltersCount > 0 || undefined}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={15} />
              {t("filters.title")}
              {activeFiltersCount > 0 && (
                <span className="zn-lib__filters-count">{activeFiltersCount}</span>
              )}
            </button>

            <ViewModeSelector
              value={viewMode}
              onChange={setViewMode}
              className="zn-lib__viewmode"
            />
          </div>
        </div>

        {/* 3 — the filters, behind the strip's button. Same component, same
            state: only where it is rendered changed. */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="right" className="zn-lib__filters-panel">
            <SheetHeader>
              <SheetTitle>{t("filters.title")}</SheetTitle>
            </SheetHeader>

            <div className="zn-lib__filters-body">
              <WorkoutFilters
                filters={filters}
                onFiltersChange={setFilters}
                activityType={activityType}
              />
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={activeFiltersCount === 0}
                onClick={() => setFilters({ ...defaultFilters, searchQuery: filters.searchQuery })}
              >
                {t("clearFilters")}
              </Button>
              <Button type="button" onClick={() => setFiltersOpen(false)}>
                {t("meta.results", { count: filteredWorkouts.length })}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* 4 — the ink ramp orders the zones, it does not name them */}
        <div className="zn-lib__legend">
          <ZoneScale />
        </div>

        {/* 5 — the results */}
        <section className="zn-lib__results" aria-busy={isLoading}>
          {isLoading ? (
            <div className="zn-grid zn-lib__grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="zn-lib__skeleton" aria-hidden="true">
                  <Skeleton className="zn-lib__skeleton-title" />
                  <Skeleton className="zn-lib__skeleton-line" />
                  <Skeleton className="zn-lib__skeleton-line zn-lib__skeleton-line--short" />
                  <Skeleton
                    variant="zone-shimmer"
                    className="zn-lib__skeleton-bar"
                  />
                  <Skeleton className="zn-lib__skeleton-line zn-lib__skeleton-line--short" />
                </div>
              ))}
            </div>
          ) : filteredWorkouts.length > 0 ? (
            <>
              {viewMode === "grid" && (
                <div className="zn-grid zn-lib__grid">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
                >
                  {visibleWorkouts.map((workout) => (
                    <WorkoutListItem key={workout.id} workout={workout} />
                  ))}
                </div>
              )}

              {viewMode === "compact" && (
                <div className="zn-grid zn-lib__grid" data-view="compact">
                  {visibleWorkouts.map((workout) => (
                    <WorkoutCardCompact key={workout.id} workout={workout} />
                  ))}
                </div>
              )}

              {/* Pagination: count + infinite scroll */}
              <div className="zn-lib__more">
                <p className="zn-mono">
                  {t("showingCount", {
                    visible: visibleWorkouts.length,
                    total: filteredWorkouts.length,
                  })}
                </p>
                {hasMore && (
                  <>
                    <div
                      ref={sentinelRef}
                      className="zn-lib__sentinel"
                      aria-hidden="true"
                    />
                    <Spinner size={18} />
                  </>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              variant="no-results"
              icon={Search}
              title={
                filters.favoritesOnly
                  ? t("emptyState.noFavorites")
                  : t("emptyState.noResults")
              }
              description={emptyDescription}
              action={
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultFilters)}
                >
                  {t("clearFilters")}
                </Button>
              }
            />
          )}
        </section>
      </div>

      <ScrollToTop />
    </>
  );
}
