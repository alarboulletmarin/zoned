import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigationType, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "@/components/icons";
import { localeTo } from "@/lib/seo/locale-to";
import { preloadWorkoutDetail } from "@/lib/sharedTransition";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { WorkoutFilters, WorkoutRow, WorkoutTable, ZoneBadge } from "@/components/domain";
import { SEOHead } from "@/components/seo";
import { HubNav, navSection } from "@/components/layout";
import { useFavoriteIds, useKeyboardShortcuts, useWorkouts } from "@/hooks";
import { useAppStats } from "@/hooks/useAppStats";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { formatDurationMinutes, ZoneScale } from "@/components/visualization";
import { categories } from "@/data/workouts";
import type { AnyWorkoutTemplate, WorkoutCategory } from "@/types";
import { useRadioRail } from "@/hooks/useRadioRail";
import { useSettings } from "@/hooks/useSettings";
import { resolvePractice, saveLastPractice } from "@/lib/practicePrefs";
import { visiblePractices } from "@/lib/settingsSchema";
import { PRACTICE_META, type Practice } from "@/types/practice";
import { PRACTICE_ART } from "@/components/domain/practice-art";
import { isServerSnapshot } from "@/prerender/snapshot";
import {
  DURATION_OPEN,
  LIBRARY_SORTS,
  countActiveFilters,
  defaultFilters,
  familyIndex,
  filterWorkouts,
  isLibraryAtRest,
  parseLibraryParams,
  rangeOfBucket,
  serializeLibraryParams,
  sortWorkouts,
  toggleTerrain,
  type ActivityType,
  type FamilyEntry,
  type LibrarySort,
  type WorkoutFiltersState,
} from "@/lib/libraryFilters";

const PAGE_SIZE = 24;

/** Le bureau, à partir de 1024 px : la ligne où la barre du haut montre ses menus. */
const WIDE_QUERY = "(min-width: 1024px)";

/** Les sports qui ne sont pas la course, sous les familles. */
const OTHER_SPORTS: ActivityType[] = ["cycling", "swimming", "strength"];

/**
 * Le bureau ou le téléphone, ou les deux.
 *
 * Sur une page prérendue, le premier rendu doit égaler celui du serveur, qui
 * ne connaît pas la largeur d'écran : il rend alors les deux présentations, et
 * `library.css` en montre une. Le premier effet tranche et la page ne garde
 * que la bonne. Hors prérendu, la réponse est connue dès le premier rendu.
 */
function useWideLayout(): boolean | null {
  const [wide, setWide] = useState<boolean | null>(() =>
    isServerSnapshot() || typeof window === "undefined"
      ? null
      : window.matchMedia(WIDE_QUERY).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    setWide(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setWide(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return wide;
}

/** Ce qu'un changement de sport rend caduc : un filtre qu'on ne voit plus ne doit pas filtrer. */
function filtersForActivity(prev: WorkoutFiltersState, next: ActivityType): WorkoutFiltersState {
  const endurance = next === "running" || next === "cycling" || next === "swimming";
  return {
    ...prev,
    ...(next === "strength" ? { category: [], peak: [] } : {}),
    // Le D+ et les côtes sont des notions de course ; Sans piste, lui, est un
    // raccourci visible partout et ne trie rien hors course.
    ...(next !== "running" && next !== "all"
      ? { terrain: prev.terrain.filter((t) => t === "no_track") }
      : {}),
    ...(endurance ? { strengthCategory: [], equipment: [], muscleGroup: [] } : {}),
  };
}

export function LibraryPage() {
  const { t, i18n } = useTranslation(["library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const { settings } = useSettings();
  const stats = useAppStats();
  const wide = useWideLayout();

  const { workouts: runningWorkouts, isLoading: isLoadingRunning } = useWorkouts();
  const { workouts: strengthWorkouts, isLoading: isLoadingStrength } = useStrengthWorkouts();
  const { workouts: cyclingWorkouts, isLoading: isLoadingCycling } =
    useCrossDisciplineWorkouts("cycling");
  const { workouts: swimmingWorkouts, isLoading: isLoadingSwimming } =
    useCrossDisciplineWorkouts("swimming");

  const searchInputRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts({ searchRef: searchInputRef });

  /* L'état de la page vit dans React, l'URL en est l'écho : le même lien
     rejoue la même bibliothèque. `parseLibraryParams` convertit les anciens
     liens (terrain=flat, maxDuration, ?q=). */
  const allowedPractices = visiblePractices(settings);
  const initial = useMemo(() => parseLibraryParams(searchParams), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [activityType, setActivityType] = useState<ActivityType>(initial.activityType);
  const [practice, setPractice] = useState<Practice | null>(() =>
    resolvePractice(initial.practice, allowedPractices),
  );
  const [filters, setFilters] = useState<WorkoutFiltersState>(initial.filters);
  const [sort, setSort] = useState<LibrarySort>(initial.sort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Ouvrir ou fermer une famille POUSSE une entrée d'historique : le geste
     retour du téléphone ramène à l'index au lieu de quitter la page. Tout le
     reste remplace l'entrée courante, une liste de filtres n'est pas un
     chemin qu'on voudrait remonter un par un. */
  const historyMode = useRef<"push" | "replace">("replace");

  const serialized = serializeLibraryParams({ activityType, practice, filters, sort }).toString();

  useEffect(() => {
    if (serialized === searchParams.toString()) return;
    const replace = historyMode.current === "replace";
    historyMode.current = "replace";
    setSearchParams(new URLSearchParams(serialized), { replace });
    // L'URL suit l'état ; l'inverse est l'effet suivant.
  }, [serialized]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Le retour arrière : l'URL change sous la page, l'état la rejoint.
     Seulement sur un POP : l'écho de nos propres écritures est un PUSH ou un
     REPLACE, et le relire pendant une frappe rapide rendrait à l'état une
     URL déjà dépassée, la dernière lettre tapée perdue. */
  useEffect(() => {
    if (navigationType !== "POP") return;
    const parsed = parseLibraryParams(searchParams);
    const nextPractice = resolvePractice(parsed.practice, allowedPractices);
    const canonical = serializeLibraryParams({
      activityType: parsed.activityType,
      practice: nextPractice,
      filters: parsed.filters,
      sort: parsed.sort,
    }).toString();
    if (canonical === serialized) return;
    setActivityType(parsed.activityType);
    setPractice(nextPractice);
    setFilters(parsed.filters);
    setSort(parsed.sort);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
        return [...runningWorkouts, ...cyclingWorkouts, ...swimmingWorkouts, ...strengthWorkouts];
    }
  }, [activityType, runningWorkouts, strengthWorkouts, cyclingWorkouts, swimmingWorkouts]);

  const sportCounts: Record<ActivityType, number> = {
    all: runningWorkouts.length + cyclingWorkouts.length + swimmingWorkouts.length + strengthWorkouts.length,
    running: runningWorkouts.length,
    cycling: cyclingWorkouts.length,
    swimming: swimmingWorkouts.length,
    strength: strengthWorkouts.length,
  };

  const isLoading =
    activityType === "running"
      ? isLoadingRunning
      : activityType === "strength"
        ? isLoadingStrength
        : activityType === "cycling"
          ? isLoadingCycling
          : activityType === "swimming"
            ? isLoadingSwimming
            : isLoadingRunning || isLoadingStrength || isLoadingCycling || isLoadingSwimming;

  // Un filtrage sur ~260 séances ne doit pas bloquer la frappe.
  const deferredFilters = useDeferredValue(filters);
  // Le coeur d'état des rangées lit les favoris ; la page n'a plus de bouton
  // qui les change, donc la liste ne se redessine pas sous le doigt.
  const favorites = useFavoriteIds(true);
  useEffect(preloadWorkoutDetail, []);

  const filterCtx = useMemo(
    () => ({ favorites, practice, activityType }),
    [favorites, practice, activityType],
  );

  const filteredWorkouts = useMemo(
    () => sortWorkouts(filterWorkouts(allWorkouts, deferredFilters, filterCtx), sort),
    [allWorkouts, deferredFilters, filterCtx, sort],
  );
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const families = useMemo(
    () => familyIndex(allWorkouts, { practice, activityType }),
    [allWorkouts, practice, activityType],
  );

  const activeFiltersCount = countActiveFilters(filters, activityType);
  const atRest = isLibraryAtRest(filters, activityType);
  const openFamily = filters.category.length === 1 ? filters.category[0] : null;

  const visibleWorkouts = filteredWorkouts.slice(0, visibleCount);
  const remaining = filteredWorkouts.length - visibleWorkouts.length;

  // ── les gestes ─────────────────────────────────────────────────────────

  const handlePracticeChange = useCallback((next: Practice | null) => {
    setPractice(next);
    // Mémorisée pour ne pas reposer la question au retour ; l'URL fait foi.
    saveLastPractice(next);
  }, []);

  const handleActivityTypeChange = useCallback((next: ActivityType) => {
    setActivityType(next);
    setFilters((prev) => filtersForActivity(prev, next));
  }, []);

  const selectFamily = useCallback((category: WorkoutCategory | null) => {
    historyMode.current = "push";
    setFilters((prev) => ({ ...prev, category: category ? [category] : [] }));
  }, []);

  const selectSport = useCallback(
    (next: ActivityType) => {
      historyMode.current = "push";
      handleActivityTypeChange(next);
    },
    [handleActivityTypeChange],
  );

  const clearFilters = useCallback(() => {
    setActivityType("all");
    setFilters((prev) => ({ ...defaultFilters, category: prev.category, searchQuery: prev.searchQuery }));
  }, []);

  const practiceOptions = useMemo<(Practice | null)[]>(
    () => [null, ...allowedPractices],
    [allowedPractices],
  );
  const practiceRailRef = useRef<HTMLDivElement>(null);
  const practiceRail = useRadioRail<Practice | null>({
    items: practiceOptions,
    value: practice,
    onChange: handlePracticeChange,
    railRef: practiceRailRef,
  });

  /* La pastille retenue revient sous les yeux : sous 640 px le rail défile,
     et une pratique restaurée depuis ?practice=ultra était cochée hors champ. */
  useEffect(() => {
    practiceRailRef.current
      ?.querySelector<HTMLElement>(`[data-practice="${practice ?? "all"}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [practice]);

  /* Remonter en haut des résultats quand ce qu'ils contiennent change.

     La bande de commandes colle sous la barre du haut, donc un filtre se pose
     depuis n'importe où dans la page ; sans ce geste, on ouvrait une famille
     depuis le bas de l'index et la liste se réécrivait au-dessus du doigt.
     Deux garde-fous : on ne descend jamais (l'ancre doit être sortie par le
     haut), et rien tant que le panneau est ouvert, il verrouille le
     défilement ; le geste attend sa fermeture. Pas de transition : la liste
     est remplacée net et le haut revient, c'est tout. */
  const listAnchorRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef(false);
  const listMounted = useRef(false);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (!listMounted.current) {
      listMounted.current = true;
      return;
    }
    pendingScroll.current = true;
  }, [filters, activityType, practice, sort]);

  useEffect(() => {
    if (!pendingScroll.current || filtersOpen) return;
    pendingScroll.current = false;
    const anchor = listAnchorRef.current;
    if (anchor && anchor.getBoundingClientRect().top < 0) {
      anchor.scrollIntoView({ block: "start" });
    }
  });

  const cycleSort = () => {
    const index = LIBRARY_SORTS.indexOf(sort);
    setSort(LIBRARY_SORTS[(index + 1) % LIBRARY_SORTS.length]);
  };

  // ── les textes ─────────────────────────────────────────────────────────

  const seoDescription = isEn
    ? `Browse ${allWorkouts.length} science-based training sessions. Filter by family, intensity peak, duration, and more.`
    : `Parcourez ${allWorkouts.length} séances d'entraînement scientifiques. Filtrez par famille, pic d'intensité, durée et plus.`;

  const query = filters.searchQuery.trim();
  const resultTitle = openFamily
    ? t(`categories.${openFamily}`)
    : query
      ? t("results.forQuery", { query })
      : activityType !== "all"
        ? t(`activityToggle.${activityType}`)
        : t("results.all");

  const emptyDescription = filters.favoritesOnly
    ? t("emptyState.noFavoritesDescription")
    : activeFiltersCount > 0
      ? t("emptyState.filteredOut", { count: activeFiltersCount, total: allWorkouts.length })
      : query
        ? t("emptyState.noMatchForQuery", { query, total: allWorkouts.length })
        : t("emptyState.noResultsDescription");

  const nextSort = LIBRARY_SORTS[(LIBRARY_SORTS.indexOf(sort) + 1) % LIBRARY_SORTS.length];
  const showLegend = activityType !== "strength";

  /** Les raccourcis : quatre puces qui miroitent l'état du panneau. */
  const shortcuts: { id: string; label: string; checked: boolean; toggle: () => void; heart?: boolean }[] = [
    {
      id: "le30",
      label: t("durationBucket.le30"),
      checked: filters.durationRange[0] === 0 && filters.durationRange[1] === 30,
      toggle: () =>
        setFilters((prev) => ({
          ...prev,
          durationRange:
            prev.durationRange[0] === 0 && prev.durationRange[1] === 30
              ? [0, DURATION_OPEN]
              : rangeOfBucket("le30"),
        })),
    },
    {
      id: "beginner",
      label: t("difficulty.beginner"),
      checked: filters.difficulty.includes("beginner"),
      toggle: () =>
        setFilters((prev) => ({
          ...prev,
          difficulty: prev.difficulty.includes("beginner")
            ? prev.difficulty.filter((d) => d !== "beginner")
            : [...prev.difficulty, "beginner"],
        })),
    },
    {
      id: "no_track",
      label: t("terrain.no_track"),
      checked: filters.terrain.includes("no_track"),
      toggle: () => setFilters((prev) => ({ ...prev, terrain: toggleTerrain(prev.terrain, "no_track") })),
    },
    {
      id: "favorites",
      label: t("shortcuts.favorites"),
      checked: filters.favoritesOnly,
      heart: true,
      toggle: () => setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly })),
    },
  ];

  const showMobile = wide !== true;
  const showDesktop = wide !== false;

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
        {/* 1, le catalogue, nommé et compté, et les pages voisines */}
        <header className="zn-lib__head">
          <span className="zn-kicker">
            {stats.workouts > 0
              ? t("catalogueFamilies", { workouts: stats.workouts, families: categories.length })
              : "\u00a0"}
          </span>
          <h1 className="zn-display zn-lib__title" data-level="2">
            {t("title")}
          </h1>
          {/* Favoris a sa puce juste en dessous : le lien ferait doublon. */}
          <HubNav section={navSection("sessions")} omit={["/favorites"]} />
        </header>

        {/* 2, la recherche. Sur bureau, en tête de la colonne des résultats. */}
        <div className="zn-lib__search" role="search">
          <Search size={16} className="zn-lib__search-glyph" />
          <input
            ref={searchInputRef}
            type="search"
            className="zn-lib__search-input"
            aria-label={t("filters.searchLabel")}
            aria-keyshortcuts="/"
            placeholder={t("filters.searchPlaceholder")}
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
          {filters.searchQuery ? (
            <button
              type="button"
              className="zn-lib__search-clear"
              aria-label={t("common:actions.clear")}
              onClick={() => setFilters({ ...filters, searchQuery: "" })}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="zn-lib__kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </div>

        {/* L'ancre du retour en haut des résultats. Hors de la bande collante :
            un élément déjà collé est toujours en vue, le viser ne bougerait rien. */}
        <div ref={listAnchorRef} className="zn-lib__anchor" aria-hidden="true" />

        {/* 3, ce qui rétrécit la liste. Sur téléphone ce bloc n'a pas de boîte
            (`display: contents`) : sa bande colle sous la barre du haut et ses
            raccourcis défilent avec la page. Sur bureau c'est la colonne de
            gauche, collante, et l'index des familles. */}
        <div className="zn-lib__side">
          <div className="zn-lib__controls">
            {/* `role="radiogroup"` est déclaré, donc son contrat clavier est
                dû : un seul arrêt de tabulation, les flèches déplacent et
                cochent (`useRadioRail`). */}
            <div
              ref={practiceRailRef}
              className="zn-lib__practice-rail"
              role="radiogroup"
              aria-label={t("practice.label")}
              onKeyDown={practiceRail.onKeyDown}
            >
              {practiceOptions.map((option) => {
                const active = practice === option;
                const meta = option ? PRACTICE_META[option] : null;
                return (
                  <button
                    key={option ?? "all"}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    data-practice={option ?? "all"}
                    data-state={active ? "active" : "inactive"}
                    className="zn-lib__practice"
                    onClick={() => handlePracticeChange(option)}
                  >
                    {meta ? (isEn ? meta.labelEn : meta.label) : t("practice.all")}
                    {/* Une pratique annoncée le dit : ses séances existent, ses plans non. */}
                    {meta?.status === "announced" && (
                      <span className="zn-lib__practice-soon">{t("practice.soon")}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <FiltersButton
              className="zn-lib__filters-btn--bar"
              count={activeFiltersCount}
              open={filtersOpen}
              label={t("filters.title")}
              onOpen={() => setFiltersOpen(true)}
            />
          </div>

          {/* Bureau : la colonne est l'index. Toutes en tête, puis les familles
              non vides de la pratique et du sport regardés. */}
          {showDesktop && (
            <nav className="zn-lib__families" aria-label={t("families.label")}>
              {families.length > 0 && (
              <>
              <span className="zn-kicker zn-lib__sidelabel" aria-hidden="true">
                {t("families.label")}
              </span>
              <ul className="zn-lib__famlist">
                <li>
                  <button
                    type="button"
                    className="zn-lib__fam"
                    aria-pressed={filters.category.length === 0}
                    onClick={() => selectFamily(null)}
                  >
                    {t("families.all")}
                  </button>
                </li>
                {families.map((family) => (
                  <li key={family.category}>
                    <button
                      type="button"
                      className="zn-lib__fam"
                      aria-pressed={openFamily === family.category}
                      onClick={() => selectFamily(family.category)}
                    >
                      {t(`categories.${family.category}`)}
                      <span className="zn-mono zn-lib__famcount">{family.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
              </>
              )}
              <SidebarSports
                activityType={activityType}
                counts={sportCounts}
                onSelect={(sport) => selectSport(activityType === sport ? "all" : sport)}
              />
            </nav>
          )}

          <div className="zn-lib__shortcuts" role="group" aria-label={t("shortcuts.label")}>
            <span className="zn-kicker zn-lib__sidelabel" aria-hidden="true">
              {t("shortcuts.label")}
            </span>
            <div className="zn-lib__shortcut-rail">
              {shortcuts.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  role="checkbox"
                  aria-checked={chip.checked}
                  className="zn-chip zn-lib__shortcut"
                  onClick={chip.toggle}
                >
                  {chip.heart && <Heart filled size={14} className="zn-lib__heart" />}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <FiltersButton
            className="zn-lib__filters-btn--side"
            count={activeFiltersCount}
            open={filtersOpen}
            label={t("filters.all")}
            onOpen={() => setFiltersOpen(true)}
          />
        </div>


        {/* 4, l'index des familles (téléphone, au repos) ou les résultats */}
        <section
          className="zn-lib__main"
          aria-busy={isLoading}
          onPointerEnter={preloadWorkoutDetail}
          onFocus={preloadWorkoutDetail}
        >
          {isLoading ? (
            <div className="zn-lib__skeletons" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="zn-lib__skeleton">
                  <Skeleton className="zn-lib__skeleton-title" />
                  <Skeleton variant="zone-shimmer" className="zn-lib__skeleton-bar" />
                  <Skeleton className="zn-lib__skeleton-line" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {atRest && showMobile && (
                <FamilyIndex
                  families={families}
                  activityType={activityType}
                  counts={sportCounts}
                  onOpenFamily={selectFamily}
                  onSelectSport={selectSport}
                />
              )}

              {!(atRest && wide === false) && (
              <div className="zn-lib__results" data-rest={atRest || undefined}>
                {openFamily && (
                  <button type="button" className="zn-lib__back" onClick={() => selectFamily(null)}>
                    <ChevronLeft size={16} />
                    {t("results.backToFamilies")}
                  </button>
                )}

                <div className="zn-lib__resulthead">
                  <h2 className="zn-lib__resulttitle">
                    {resultTitle}{" "}
                    <span className="zn-mono zn-lib__count" aria-live="polite">
                      {t("meta.results", { count: filteredWorkouts.length })}
                    </span>
                  </h2>
                  <button
                    type="button"
                    className="zn-lib__sort"
                    aria-label={t("sort.cycle", {
                      current: t(`sort.word.${sort}`),
                      next: t(`sort.word.${nextSort}`),
                    })}
                    onClick={cycleSort}
                  >
                    {t(`sort.by.${sort}`)}
                    <ChevronDown size={16} />
                  </button>
                </div>

                {filteredWorkouts.length > 0 && showLegend && (
                  <ZoneScale className="zn-lib__legend" />
                )}

                {filteredWorkouts.length > 0 ? (
                  <>
                    {showMobile && (
                      <ul className="zn-lib__rows">
                        {visibleWorkouts.map((workout) => (
                          <li key={workout.id}>
                            <WorkoutRow workout={workout} favorite={favoriteSet.has(workout.id)} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {showDesktop && (
                      <WorkoutTable
                        workouts={visibleWorkouts}
                        favorites={favoriteSet}
                        sort={sort}
                        onSort={setSort}
                        caption={resultTitle}
                      />
                    )}

                    <div className="zn-lib__more">
                      {remaining > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="zn-lib__more-btn"
                          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                        >
                          {t("showMore", { count: remaining })}
                        </Button>
                      )}
                      <p className="zn-mono zn-lib__showing">
                        {t("showingCount", {
                          visible: visibleWorkouts.length,
                          total: filteredWorkouts.length,
                        })}
                      </p>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    variant="no-results"
                    icon={Search}
                    // La figure de la pratique regardée : un rayon trail vide montre la montée.
                    art={practice ? PRACTICE_ART[practice] : undefined}
                    title={
                      filters.favoritesOnly ? t("emptyState.noFavorites") : t("emptyState.noResults")
                    }
                    description={emptyDescription}
                    // L'action nomme ce qu'elle défait.
                    action={
                      activeFiltersCount > 0 ? (
                        <Button variant="outline" onClick={clearFilters}>
                          {t("clearFilters")}
                        </Button>
                      ) : query ? (
                        <Button
                          variant="outline"
                          onClick={() => setFilters({ ...filters, searchQuery: "" })}
                        >
                          {t("clearSearch")}
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => selectFamily(null)}>
                          {t("results.backToFamilies")}
                        </Button>
                      )
                    }
                  />
                )}
              </div>
              )}
            </>
          )}
        </section>

        {!isLoading && allWorkouts.length > 0 && (
          <details className="zn-crawl zn-disclosure">
            <summary className="zn-disclosure__summary">
              {t("catalogueIndex")}
              <ChevronDown className="zn-disclosure__chevron" aria-hidden="true" />
            </summary>
            <nav className="zn-disclosure__panel" aria-label={t("catalogueIndex")}>
              <ul className="zn-crawl__list">
                {allWorkouts.map((workout) => (
                  <li key={workout.id}>
                    <Link to={localeTo(`/workout/${workout.id}`, isEn)}>
                      {isEn && workout.nameEn ? workout.nameEn : workout.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}
      </div>

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
              onActivityTypeChange={handleActivityTypeChange}
              sportCounts={sportCounts}
            />
          </div>
          <SheetFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={activeFiltersCount === 0}
              onClick={clearFilters}
            >
              {t("clearFilters")}
            </Button>
            <Button type="button" onClick={() => setFiltersOpen(false)}>
              {t("filters.seeResults", { count: filteredWorkouts.length })}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ScrollToTop />
    </>
  );
}

/** La porte du panneau, avec le nombre de filtres posés. */
function FiltersButton({
  count,
  open,
  label,
  onOpen,
  className,
}: {
  count: number;
  open: boolean;
  label: string;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`zn-lib__filters-btn ${className ?? ""}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      data-on={count > 0 || undefined}
      onClick={onOpen}
    >
      <SlidersHorizontal size={15} />
      {label}
      {count > 0 && <span className="zn-lib__filters-count">{count}</span>}
    </button>
  );
}

/** La durée d'une famille : sa plus courte et sa plus longue séance. */
function useDurationSpan() {
  const { t } = useTranslation("library");
  return (min: number, max: number) =>
    min === max
      ? formatDurationMinutes(min)
      : t("index.durationRange", { min: formatDurationMinutes(min), max: formatDurationMinutes(max) });
}

/**
 * L'entrée de la bibliothèque sur téléphone : les familles, de quoi chacune
 * est faite (plage de pics, nombre, durées), et les autres sports. Une
 * famille, c'est le paramètre `category` ; l'ouvrir pousse une entrée
 * d'historique.
 */
function FamilyIndex({
  families,
  activityType,
  counts,
  onOpenFamily,
  onSelectSport,
}: {
  families: FamilyEntry[];
  activityType: ActivityType;
  counts: Record<ActivityType, number>;
  onOpenFamily: (category: WorkoutCategory) => void;
  onSelectSport: (sport: ActivityType) => void;
}) {
  const { t } = useTranslation("library");
  const span = useDurationSpan();
  return (
    <div className="zn-lib__index">
      {families.length > 0 && (
        <>
          <h2 className="zn-lib__indextitle">{t("index.title")}</h2>
          <ul className="zn-lib__indexlist">
            {families.map((family) => (
              <li key={family.category}>
                <button
                  type="button"
                  className="zn-lib__indexrow"
                  onClick={() => onOpenFamily(family.category)}
                >
                  <span className="zn-lib__indexname">{t(`categories.${family.category}`)}</span>
                  <span className="zn-lib__indexmeta">
                    <ZoneBadge
                      zone={
                        family.minPeak === family.maxPeak
                          ? family.maxPeak
                          : `Z${family.minPeak}-Z${family.maxPeak}`
                      }
                      size="sm"
                    />
                    {t("index.meta", {
                      count: family.count,
                      duration: span(family.minDuration, family.maxDuration),
                    })}
                  </span>
                  <ChevronRight size={16} className="zn-lib__indexchevron" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {activityType === "all" && (
        <>
          <h2 className="zn-lib__indextitle zn-lib__indextitle--sub">{t("index.otherSports")}</h2>
          <ul className="zn-lib__indexlist">
            {OTHER_SPORTS.filter((sport) => counts[sport] > 0).map((sport) => (
              <li key={sport}>
                <button type="button" className="zn-lib__indexrow" onClick={() => onSelectSport(sport)}>
                  <span className="zn-lib__indexname">{t(`activityToggle.${sport}`)}</span>
                  <span className="zn-lib__indexmeta">{t("meta.results", { count: counts[sport] })}</span>
                  <ChevronRight size={16} className="zn-lib__indexchevron" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Les autres sports, sous les familles de la colonne de bureau. */
function SidebarSports({
  activityType,
  counts,
  onSelect,
}: {
  activityType: ActivityType;
  counts: Record<ActivityType, number>;
  onSelect: (sport: ActivityType) => void;
}) {
  const { t } = useTranslation("library");
  const sports = OTHER_SPORTS.filter((sport) => counts[sport] > 0);
  if (sports.length === 0) return null;
  return (
    <>
      <span className="zn-kicker zn-lib__sidelabel" aria-hidden="true">
        {t("index.otherSports")}
      </span>
      <ul className="zn-lib__famlist">
        {sports.map((sport) => (
          <li key={sport}>
            <button
              type="button"
              className="zn-lib__fam"
              aria-pressed={activityType === sport}
              onClick={() => onSelect(sport)}
            >
              {t(`activityToggle.${sport}`)}
              <span className="zn-mono zn-lib__famcount">{counts[sport]}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

