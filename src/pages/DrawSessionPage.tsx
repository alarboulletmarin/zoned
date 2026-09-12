import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dices,
  Sparkles,
  RotateCcw,
  Filter,
  Run,
  Bike,
  Pool,
  Dumbbell,
  CalendarRange,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutCardChrome, ScanCard, DifficultyIcon } from "@/components/domain";
import { StatBlock } from "@/components/domain/StatBlock";
import { FavoriteButton } from "@/components/domain/FavoriteButton";
import { formatDurationMinutes, ZoneScale } from "@/components/visualization";
import { SEOHead } from "@/components/seo";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { categories } from "@/data/workouts";
import {
  DISCIPLINES,
  DURATION_NO_LIMIT,
  defaultFilterCriteria,
  getAnyWorkoutDuration,
  getAnyWorkoutTss,
  getAnyWorkoutZones,
  getDrawDiscipline,
  isFilterActive,
  matchesFilters,
  type DrawDiscipline,
  type WorkoutFilterCriteria,
} from "@/lib/workoutFilters";
import type {
  AnyWorkoutTemplate,
  Difficulty,
  ZoneNumber,
} from "@/types";
import {
  getDominantZone,
  isStrengthWorkout,
  isRunningWorkout,
} from "@/types";
import { usePickLang } from "@/lib/i18n-utils";
import { buildScanSchedule } from "@/lib/scanSchedule";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// ────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ────────────────────────────────────────────────────────────────────────────

const DURATION_MIN = 25;
const DURATION_MAX = 300; // slider ceiling
const DURATION_PRESETS: { label: string; value: number }[] = [
  { label: "≤30", value: 30 },
  { label: "≤45", value: 45 },
  { label: "≤60", value: 60 },
  { label: "≤90", value: 90 },
  { label: "≤150", value: 150 },
  { label: "≤300", value: 300 },
  { label: "+300", value: DURATION_NO_LIMIT },
];

const DISCIPLINE_ICONS: Record<
  DrawDiscipline,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  running: Run,
  cycling: Bike,
  swimming: Pool,
  strength: Dumbbell,
};

const ZONE_NUMBERS: ZoneNumber[] = [1, 2, 3, 4, 5, 6];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

const HISTORY_LIMIT = 5;

/** "VMA-001" → "001", "LR-014" → "014". */
function getWorkoutNumber(id: string): string {
  const parts = id.split("-");
  return parts[parts.length - 1] || id;
}

/** Pick a uniformly random element. */
function sample<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ────────────────────────────────────────────────────────────────────────────
// Filter state
// ────────────────────────────────────────────────────────────────────────────

type DrawFilters = WorkoutFilterCriteria;

const defaultFilters: DrawFilters = defaultFilterCriteria;

// ── Session persistence ──────────────────────────────────────────────────────
// Keep the drawn session (with filters and history) alive across navigation:
// opening a workout and hitting "back" should restore the draw, not wipe it.
// Stored in sessionStorage so it lives for the tab and clears on close.
const STORAGE_KEY = "zoned-draw-state";

interface DrawSnapshot {
  result: AnyWorkoutTemplate | null;
  history: AnyWorkoutTemplate[];
  filters: DrawFilters;
  avoidRepeats: boolean;
}

function readDrawSnapshot(): Partial<DrawSnapshot> {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<DrawSnapshot>) : {};
  } catch {
    return {};
  }
}

function writeDrawSnapshot(snap: DrawSnapshot): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* storage unavailable or full (non-critical) */
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export function DrawSessionPage() {
  const { t, i18n } = useTranslation(["library", "common"]);
  const { t: tStrength } = useTranslation("strength");
  const pick = usePickLang();
  const isEn = i18n.language?.startsWith("en") ?? false;
  const isMobile = useIsMobile();

  const { workouts: running } = useWorkouts();
  const { workouts: strength } = useStrengthWorkouts();
  const { workouts: cycling } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimming } = useCrossDisciplineWorkouts("swimming");

  const catalog: AnyWorkoutTemplate[] = useMemo(
    () => [...running, ...cycling, ...swimming, ...strength],
    [running, cycling, swimming, strength],
  );

  // Restore any previously drawn session (read once on mount).
  const restored = useMemo(readDrawSnapshot, []);
  const [filters, setFilters] = useState<DrawFilters>(() => ({
    ...defaultFilters,
    ...restored.filters,
  }));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [avoidRepeats, setAvoidRepeats] = useState<boolean>(
    restored.avoidRepeats ?? true,
  );

  // ── Draw state ───────────────────────────────────────────────────────────
  const [result, setResult] = useState<AnyWorkoutTemplate | null>(
    restored.result ?? null,
  );
  const [scanWorkout, setScanWorkout] = useState<AnyWorkoutTemplate | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  /* La borne CSS de motion.css ne voit pas le JS : il faut lire la
     préférence ici pour que le balayage la respecte. */
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [history, setHistory] = useState<AnyWorkoutTemplate[]>(
    restored.history ?? [],
  );
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const filtered = useMemo(
    () => catalog.filter((w) => matchesFilters(w, filters)),
    [catalog, filters],
  );

  const filtersActive = isFilterActive(filters);
  const hasMatches = filtered.length > 0;
  const proportion = catalog.length > 0 ? filtered.length / catalog.length : 0;

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  // Persist the draw so navigating to a workout and back restores it.
  useEffect(() => {
    writeDrawSnapshot({ result, history, filters, avoidRepeats });
  }, [result, history, filters, avoidRepeats]);

  /** Pick a final result, optionally avoiding the recent history. */
  const pickFinal = useCallback(
    (pool: AnyWorkoutTemplate[]): AnyWorkoutTemplate => {
      if (!avoidRepeats || pool.length <= history.length) {
        return sample(pool);
      }
      const recentIds = new Set(history.map((w) => w.id));
      const fresh = pool.filter((w) => !recentIds.has(w.id));
      return sample(fresh.length > 0 ? fresh : pool);
    },
    [avoidRepeats, history],
  );

  /**
   * Run the "archive drawer" scan: flash through random candidate cards while
   * decelerating (ease-out) over ~1.5s, then settle on the final pick.
   *
   * Le balayage INFORME — il dit « je pioche au hasard dans un lot », ce qui
   * est le sujet même de la page — donc il reste par défaut. Mais il est
   * piloté par des `setTimeout` en JS, et la borne `prefers-reduced-motion` de
   * `styles/design/motion.css` ne peut pas atteindre du JS : quelqu'un qui a
   * demandé moins de mouvement à son système se prenait les 1,5 s quand même.
   * Sous cette préférence, le résultat arrive donc directement. Le seul
   * contournement légitime d'une préférence d'accessibilité est la même
   * personne qui le demande, ce qui n'est pas le cas ici.
   */
  const runDraw = useCallback(
    (pool: AnyWorkoutTemplate[]) => {
      if (pool.length === 0 || isDrawing) return;
      clearTimeouts();

      const final = pickFinal(pool);

      if (prefersReducedMotion) {
        setScanWorkout(null);
        setResult(final);
        setIsDrawing(false);
        setHistory((prev) =>
          [final, ...prev.filter((w) => w.id !== final.id)].slice(0, HISTORY_LIMIT),
        );
        return;
      }

      setIsDrawing(true);
      setResult(null);

      // Schedule whose gaps grow geometrically → ease-out feel (shared helper).
      const times = buildScanSchedule();

      times.forEach((at, i) => {
        const isLast = i === times.length - 1;
        timeoutsRef.current.push(
          setTimeout(() => {
            if (isLast) {
              setScanWorkout(null);
              setResult(final);
              setIsDrawing(false);
              setHistory((prev) =>
                [final, ...prev.filter((w) => w.id !== final.id)].slice(
                  0,
                  HISTORY_LIMIT,
                ),
              );
            } else {
              setScanWorkout(sample(pool));
            }
          }, at),
        );
      });
    },
    [isDrawing, clearTimeouts, pickFinal, prefersReducedMotion],
  );

  const handleDraw = useCallback(() => runDraw(filtered), [runDraw, filtered]);
  const handleSurprise = useCallback(() => runDraw(catalog), [runDraw, catalog]);

  // Space bar shortcut for drawing (ignored while typing in a control).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        el?.isContentEditable
      ) {
        return;
      }
      if (!hasMatches || isDrawing) return;
      e.preventDefault();
      handleDraw();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDraw, hasMatches, isDrawing]);

  // ── Filter mutators ────────────────────────────────────────────────────────
  const toggleDiscipline = (d: DrawDiscipline) =>
    setFilters((f) => ({
      ...f,
      disciplines: f.disciplines.includes(d)
        ? f.disciplines.filter((x) => x !== d)
        : [...f.disciplines, d],
    }));

  const toggleZone = (z: ZoneNumber) =>
    setFilters((f) => ({
      ...f,
      zones: f.zones.includes(z)
        ? f.zones.filter((x) => x !== z)
        : [...f.zones, z],
    }));

  const toggleLevel = (l: Difficulty) =>
    setFilters((f) => ({
      ...f,
      levels: f.levels.includes(l)
        ? f.levels.filter((x) => x !== l)
        : [...f.levels, l],
    }));

  const resetFilters = () => setFilters(defaultFilters);

  const seoDescription = isEn
    ? "Let chance pick your next training session. Filter by discipline, zone, duration and level, then draw from the catalogue."
    : "Laisse le hasard choisir ta prochaine séance. Filtre par discipline, zone, durée et niveau, puis tire dans le catalogue.";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEOHead
        title={t("common:seo.drawTitle")}
        description={seoDescription}
        canonical="/library/draw"
      />

      <div className="zn-disc">
        {/* 1 — the catalogue, named and counted */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {catalog.length > 0
              ? t("catalogue", {
                  workouts: catalog.length,
                  categories: categories.length,
                  disciplines: DISCIPLINES.length,
                })
              : " "}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("draw.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-disc__lede">
            {t("draw.subtitle")}
          </p>
          <div className="zn-disc__headactions">
            <Button variant="link" asChild>
              <Link to="/weeks">
                <CalendarRange size={16} />
                {t("draw.toWeek")}
              </Link>
            </Button>
          </div>
        </section>

        {/* 2 — filters on the left, the draw on the right */}
        <div className="zn-split zn-draw__layout">
          <aside>
            {/* The drawer toggle is a phone affordance; CSS drops it at
                desktop width, where the panel is always open. */}
            <Button
              variant="outline"
              className="zn-draw__toggle"
              aria-expanded={mobileFiltersOpen}
              aria-controls="draw-filters"
              onClick={() => setMobileFiltersOpen((v) => !v)}
            >
              <span className="zn-row" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
                <Filter size={16} />
                {t("draw.filters.title")}
              </span>
              <span className="zn-mono zn-faint">
                {t("draw.counter.short", { count: filtered.length })}
              </span>
            </Button>

            <div
              id="draw-filters"
              className="zn-draw__aside"
              data-open={mobileFiltersOpen ? "true" : "false"}
            >
              {/* What the filters let through, out of the whole catalogue */}
              <div className="zn-draw__counter">
                <div className="zn-row zn-row--split">
                  <StatBlock
                    size="sm"
                    value={String(filtered.length)}
                    label={t("draw.counter.match", { count: filtered.length })}
                  />
                  {filtersActive && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <RotateCcw size={14} />
                      {t("draw.filters.reset")}
                    </Button>
                  )}
                </div>

                <div className="zn-draw__ratio">
                  <span
                    className="zn-draw__ratiofill"
                    style={{
                      inlineSize: `${Math.max(
                        proportion * 100,
                        filtered.length > 0 ? 4 : 0,
                      )}%`,
                    }}
                  />
                </div>
                <p className="zn-mono zn-faint" aria-live="polite">
                  {t("draw.counter.short", { count: filtered.length })} ·{" "}
                  {t("draw.counter.ofTotal", { total: catalog.length })}
                </p>
              </div>

              {/* Discipline */}
              <FilterGroup label={t("draw.filters.discipline")}>
                <div className="zn-cluster">
                  {DISCIPLINES.map((d) => {
                    const Icon = DISCIPLINE_ICONS[d];
                    return (
                      <Chip
                        key={d}
                        selected={filters.disciplines.includes(d)}
                        onClick={() => toggleDiscipline(d)}
                      >
                        <Icon size={15} />
                        {t(`activityToggle.${d}`)}
                      </Chip>
                    );
                  })}
                </div>
              </FilterGroup>

              {/* Zones — the ink ramp, each rung paired with its Z-code */}
              <FilterGroup label={t("draw.filters.zone")}>
                <div className="zn-cluster">
                  {ZONE_NUMBERS.map((z) => (
                    <Chip
                      key={z}
                      selected={filters.zones.includes(z)}
                      onClick={() => toggleZone(z)}
                    >
                      <span className="zn-disc__swatch" aria-hidden="true">
                        <span data-zone={z} />
                      </span>
                      {t(`draw.zoneChips.${z}`)}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>

              {/* Max duration */}
              <FilterGroup label={t("draw.filters.maxDuration")}>
                <Slider
                  value={[Math.min(filters.maxDuration, DURATION_MAX)]}
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={5}
                  onValueChange={([v]) =>
                    setFilters((f) => ({ ...f, maxDuration: v }))
                  }
                  aria-label={t("draw.filters.maxDuration")}
                />
                <div className="zn-draw__ends zn-mono zn-faint">
                  <span>{DURATION_MIN} min</span>
                  <span className="zn-body zn-body--sm">
                    {filters.maxDuration > DURATION_MAX
                      ? `+${DURATION_MAX} min`
                      : `≤ ${filters.maxDuration} min`}
                  </span>
                  <span>{DURATION_MAX} min</span>
                </div>
                <div className="zn-cluster">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className="zn-chip"
                      onClick={() =>
                        setFilters((f) => ({ ...f, maxDuration: p.value }))
                      }
                      aria-pressed={filters.maxDuration === p.value}
                    >
                      <span className="zn-mono">{p.label}</span>
                    </button>
                  ))}
                </div>
              </FilterGroup>

              {/* Level */}
              <FilterGroup label={t("draw.filters.level")}>
                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                >
                  {LEVELS.map((l) => (
                    <Chip
                      key={l}
                      className="zn-draw__level"
                      selected={filters.levels.includes(l)}
                      onClick={() => toggleLevel(l)}
                    >
                      <span>{t(`difficulty.${l}`)}</span>
                      <DifficultyIcon difficulty={l} />
                    </Chip>
                  ))}
                </div>
              </FilterGroup>
            </div>
          </aside>

          {/* ── Draw zone ─────────────────────────────────────────────────── */}
          <section className="zn-fill">
            <div className="zn-draw__stage">
              {/* The screen's one vermillon fill */}
              <div className="zn-draw__controls">
                <Button
                  size="lg"
                  className="zn-draw__cta"
                  onClick={handleDraw}
                  disabled={!hasMatches || isDrawing}
                >
                  <Dices size={18} />
                  {isDrawing
                    ? t("draw.scanning")
                    : result
                      ? t("draw.redraw")
                      : t("draw.draw")}
                </Button>
                {!isMobile && (
                  <p className="zn-caption zn-faint">{t("draw.spaceHint")}</p>
                )}
                {filtersActive && (
                  <button
                    type="button"
                    className="zn-chip zn-chip--more"
                    onClick={handleSurprise}
                    disabled={isDrawing}
                  >
                    <Sparkles size={14} />
                    {t("draw.surprise")}
                  </button>
                )}
              </div>

              {/* Result / scan / placeholder / empty */}
              {!hasMatches ? (
                <EmptyState
                  variant="no-results"
                  icon={Filter}
                  title={t("draw.empty.title")}
                  description={t("draw.empty.description")}
                  action={
                    <Button variant="outline" onClick={resetFilters}>
                      <RotateCcw size={16} />
                      {t("draw.empty.reset")}
                    </Button>
                  }
                />
              ) : isDrawing && scanWorkout ? (
                <ScanCard workout={scanWorkout} pick={pick} />
              ) : result ? (
                <ResultCard
                  workout={result}
                  pick={pick}
                  t={t}
                  tStrength={tStrength}
                />
              ) : (
                <EmptyState
                  variant="not-started"
                  icon={Dices}
                  title={t("draw.placeholder.title")}
                  description={t("draw.placeholder.description")}
                />
              )}
            </div>

            {/* Recent draws */}
            {history.length > 0 && (
              <div className="zn-draw__recent">
                <div className="zn-row zn-row--split zn-disc__grouphead">
                  <h2 className="zn-title" data-level="4">
                    {t("draw.recent.title")}
                  </h2>
                  <label className="zn-row" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
                    <span className="zn-caption zn-muted">
                      {t("draw.recent.avoidRepeats")}
                    </span>
                    <Switch
                      checked={avoidRepeats}
                      onCheckedChange={setAvoidRepeats}
                      aria-label={t("draw.recent.avoidRepeats")}
                    />
                  </label>
                </div>
                <div className="zn-cluster">
                  {history.map((w) => {
                    const zone = isRunningWorkout(w) ? getDominantZone(w) : null;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        className="zn-chip"
                        aria-pressed={result?.id === w.id}
                        onClick={() => {
                          clearTimeouts();
                          setIsDrawing(false);
                          setScanWorkout(null);
                          setResult(w);
                        }}
                      >
                        {zone && (
                          <span className="zn-disc__swatch" aria-hidden="true">
                            <span data-zone={zone} />
                          </span>
                        )}
                        <span className="zn-truncate zn-draw__recentname">
                          {pick(w, "name")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* The ramp orders the zones, it does not name them */}
            <div className="zn-draw__recent">
              <ZoneScale />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/**
 * A filter value the athlete switches on or off — the library's chip, same
 * markup and same paint: `role="checkbox"` with `aria-checked`, and a full ink
 * inversion when it is on.
 */
function Chip({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn("zn-chip", className)}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="zn-draw__group" role="group" aria-label={label}>
      <span className="zn-kicker zn-kicker--inline" aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Full result card with profile, zones and metrics.
 *
 * Like a library card, the whole card is a link to the workout detail and
 * carries a favourite toggle, plus an explicit "view detail" button below.
 * Running-family workouts reuse the shared {@link WorkoutCardChrome};
 * strength sessions (no aerobic zones / intensity profile, different template
 * type) fall back to a lightweight layout, mirroring how the rest of the app
 * branches on `isStrengthWorkout`.
 */
function ResultCard({
  workout,
  pick,
  t,
  tStrength,
}: {
  workout: AnyWorkoutTemplate;
  pick: ReturnType<typeof usePickLang>;
  t: (k: string, o?: Record<string, unknown>) => string;
  tStrength: (k: string) => string;
}) {
  const isStrength = isStrengthWorkout(workout);
  const discipline = getDrawDiscipline(workout);
  const DisciplineIcon = DISCIPLINE_ICONS[discipline];
  const dominantZone = isRunningWorkout(workout) ? getDominantZone(workout) : 2;
  const zones = getAnyWorkoutZones(workout);
  const duration = getAnyWorkoutDuration(workout);
  const tss = getAnyWorkoutTss(workout);

  const methodLabel = isStrength
    ? tStrength(`categories.${workout.category}`)
    : t(`categories.${workout.category}`);

  // Eyebrow: discipline · method · n°
  const eyebrow = (
    <div
      className="zn-row zn-kicker zn-kicker--inline"
      style={{ "--gap": "var(--sp-4)" } as CSSProperties}
    >
      <DisciplineIcon size={14} />
      <span>{t(`activityToggle.${discipline}`)}</span>
      <span aria-hidden="true">·</span>
      <span>{methodLabel}</span>
      <span aria-hidden="true">·</span>
      <span className="zn-mono">n°{getWorkoutNumber(workout.id)}</span>
    </div>
  );

  const metrics = (
    <div className="zn-draw__metrics">
      <StatBlock
        size="sm"
        className="zn-draw__metric"
        label={t("draw.metrics.duration")}
        value={formatDurationMinutes(duration)}
      />
      <StatBlock
        size="sm"
        className="zn-draw__metric"
        label={t("draw.metrics.tss")}
        value={tss != null ? String(tss) : "—"}
      />
      <StatBlock
        size="sm"
        className="zn-draw__metric"
        label={t("draw.metrics.zone")}
        value={zones.length > 0 ? `Z${dominantZone}` : "—"}
      />
      <StatBlock
        size="sm"
        className="zn-draw__metric"
        label={t("draw.metrics.level")}
        value={t(`difficulty.${workout.difficulty}`)}
      />
    </div>
  );

  // Explicit "view detail" CTA. Kept outside the card link below to avoid an
  // anchor nested inside an anchor (the whole card is already a link).
  const detailAction = (
    <Button asChild variant="outline">
      <Link to={`/workout/${workout.id}`}>{t("draw.viewDetail")}</Link>
    </Button>
  );

  // Running / cycling / swimming → reuse the shared library card chrome.
  if (isRunningWorkout(workout)) {
    return (
      <div className="zn-draw__result">
        <Link to={`/workout/${workout.id}`}>
          <WorkoutCardChrome
            workout={workout}
            eyebrow={eyebrow}
            metrics={metrics}
            showZoneBadges
            showPeek={false}
            showBadges={false}
          />
        </Link>
        <div>{detailAction}</div>
      </div>
    );
  }

  // Strength fallback (no zones / intensity profile).
  return (
    <div className="zn-draw__result">
      <Link to={`/workout/${workout.id}`} className="zn-draw__plaincard">
        <div className="zn-row zn-row--start zn-row--split">
          {eyebrow}
          <FavoriteButton workoutId={workout.id} size="sm" />
        </div>
        <h3 className="zn-title" data-level="4">
          {pick(workout, "name")}
        </h3>
        <p className="zn-body zn-body--sm zn-muted zn-clamp">
          {pick(workout, "description")}
        </p>
        {metrics}
      </Link>
      <div>{detailAction}</div>
    </div>
  );
}
