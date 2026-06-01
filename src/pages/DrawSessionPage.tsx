import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dices,
  Sparkles,
  RotateCcw,
  Star,
  Clock,
  Target,
  Gauge,
  Filter,
  X,
  ArrowRight,
  Footprints,
  Bike,
  Waves,
  Dumbbell,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ZoneBadges } from "@/components/domain/ZoneBadge";
import { SessionIntensityBar } from "@/components/visualization";
import {
  getWorkoutDuration,
  formatDurationMinutes,
} from "@/components/visualization";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { usePageHint } from "@/hooks/usePageHint";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { estimateTSS, getWorkoutZones } from "@/lib/landing-stats";
import type {
  AnyWorkoutTemplate,
  Difficulty,
  ZoneNumber,
} from "@/types";
import {
  getWorkoutDiscipline,
  getDominantZone,
  isStrengthWorkout,
  isRunningWorkout,
  DIFFICULTY_META,
} from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ────────────────────────────────────────────────────────────────────────────

const DURATION_MIN = 25;
const DURATION_MAX = 150;
const DURATION_PRESETS = [30, 45, 60, 90, 150] as const;

const DISCIPLINES = ["running", "cycling", "swimming", "strength"] as const;
type DrawDiscipline = (typeof DISCIPLINES)[number];

const DISCIPLINE_ICONS: Record<
  DrawDiscipline,
  React.ComponentType<{ className?: string }>
> = {
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  strength: Dumbbell,
};

const ZONE_NUMBERS: ZoneNumber[] = [1, 2, 3, 4, 5, 6];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

const HISTORY_LIMIT = 5;

/** Resolve the draw-level discipline (strength sits alongside the 3 sports). */
function getDrawDiscipline(w: AnyWorkoutTemplate): DrawDiscipline {
  if (isStrengthWorkout(w)) return "strength";
  return getWorkoutDiscipline(w) as DrawDiscipline;
}

function getStrengthDuration(w: StrengthWorkoutTemplate): number {
  return Math.round((w.typicalDuration.min + w.typicalDuration.max) / 2);
}

function getAnyWorkoutDuration(w: AnyWorkoutTemplate): number {
  if (isStrengthWorkout(w)) return getStrengthDuration(w);
  return getWorkoutDuration(w);
}

/** Zones touched by a workout. Strength sessions have no aerobic zones. */
function getAnyWorkoutZones(w: AnyWorkoutTemplate): ZoneNumber[] {
  if (isStrengthWorkout(w)) return [];
  return getWorkoutZones(w);
}

function getAnyWorkoutTss(w: AnyWorkoutTemplate): number | null {
  if (isStrengthWorkout(w)) return null;
  return estimateTSS(w);
}

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

interface DrawFilters {
  disciplines: DrawDiscipline[];
  zones: ZoneNumber[];
  maxDuration: number;
  levels: Difficulty[];
}

const defaultFilters: DrawFilters = {
  disciplines: [],
  zones: [],
  maxDuration: DURATION_MAX,
  levels: [],
};

function isFilterActive(f: DrawFilters): boolean {
  return (
    f.disciplines.length > 0 ||
    f.zones.length > 0 ||
    f.levels.length > 0 ||
    f.maxDuration !== DURATION_MAX
  );
}

function matchesFilters(w: AnyWorkoutTemplate, f: DrawFilters): boolean {
  // Discipline (multi-select)
  if (f.disciplines.length > 0 && !f.disciplines.includes(getDrawDiscipline(w))) {
    return false;
  }
  // Duration ceiling
  if (getAnyWorkoutDuration(w) > f.maxDuration) {
    return false;
  }
  // Level (multi-select)
  if (f.levels.length > 0 && !f.levels.includes(w.difficulty)) {
    return false;
  }
  // Zones (multi-select). Strength has no zones → excluded once a zone is picked.
  if (f.zones.length > 0) {
    const zones = getAnyWorkoutZones(w);
    if (!zones.some((z) => f.zones.includes(z))) return false;
  }
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export function DrawSessionPage() {
  usePageHint("draw", "hints.draw.title", "hints.draw.description");
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

  const [filters, setFilters] = useState<DrawFilters>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [avoidRepeats, setAvoidRepeats] = useState(true);

  // ── Draw state ───────────────────────────────────────────────────────────
  const [result, setResult] = useState<AnyWorkoutTemplate | null>(null);
  const [scanWorkout, setScanWorkout] = useState<AnyWorkoutTemplate | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<AnyWorkoutTemplate[]>([]);
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
   */
  const runDraw = useCallback(
    (pool: AnyWorkoutTemplate[]) => {
      if (pool.length === 0 || isDrawing) return;
      clearTimeouts();

      const final = pickFinal(pool);
      setIsDrawing(true);
      setResult(null);

      // Build a schedule whose gaps grow geometrically → ease-out feel.
      const total = 1500;
      const times: number[] = [];
      let elapsed = 0;
      let gap = 45;
      while (elapsed < total) {
        times.push(elapsed);
        elapsed += gap;
        gap *= 1.14;
      }

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
    [isDrawing, clearTimeouts, pickFinal],
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
      <div className="py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <EditorialTitle as="h1" size="md">
            {t("draw.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
            {t("draw.subtitle")}
          </FadeUp>
        </div>

        {/* Mobile filters toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="size-4" />
              {t("draw.filters.title")}
            </span>
            <span className="text-muted-foreground text-sm">
              {t("draw.counter.short", { count: filtered.length })}
            </span>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* ── Filters panel ─────────────────────────────────────────────── */}
          <aside
            className={cn(
              "lg:block",
              mobileFiltersOpen ? "block" : "hidden",
            )}
          >
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Live counter */}
              <Card className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <p
                      className="text-4xl font-bold tabular-nums leading-none"
                      aria-live="polite"
                    >
                      {filtered.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("draw.counter.match", { count: filtered.length })}
                    </p>
                  </div>
                  {filtersActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="shrink-0"
                    >
                      <RotateCcw className="size-3.5 mr-1" />
                      {t("draw.filters.reset")}
                    </Button>
                  )}
                </div>
                {/* Proportion bar */}
                <div
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${Math.max(proportion * 100, filtered.length > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t("draw.counter.ofTotal", { total: catalog.length })}
                </p>
              </Card>

              {/* Discipline */}
              <FilterGroup label={t("draw.filters.discipline")}>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map((d) => {
                    const Icon = DISCIPLINE_ICONS[d];
                    const selected = filters.disciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        aria-pressed={selected}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                        {t(`activityToggle.${d === "strength" ? "strength" : d}`)}
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>

              {/* Zones */}
              <FilterGroup label={t("draw.filters.zone")}>
                <div className="flex flex-wrap gap-1.5">
                  {ZONE_NUMBERS.map((z) => {
                    const selected = filters.zones.includes(z);
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => toggleZone(z)}
                        aria-pressed={selected}
                        className={cn(
                          `zone-${z}`,
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all",
                          selected
                            ? "ring-2 ring-offset-1 ring-offset-background"
                            : "opacity-60 hover:opacity-100",
                        )}
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--zone-${z}) 18%, transparent)`,
                          borderColor: `var(--zone-${z})`,
                          color: `var(--zone-${z})`,
                          // @ts-expect-error CSS custom prop for ring color
                          "--tw-ring-color": `var(--zone-${z})`,
                        }}
                      >
                        {t(`draw.zoneChips.${z}`)}
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>

              {/* Max duration */}
              <FilterGroup label={t("draw.filters.maxDuration")}>
                <Slider
                  value={[filters.maxDuration]}
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={5}
                  onValueChange={([v]) =>
                    setFilters((f) => ({ ...f, maxDuration: v }))
                  }
                  aria-label={t("draw.filters.maxDuration")}
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{DURATION_MIN} min</span>
                  <span className="font-semibold text-foreground">
                    ≤ {filters.maxDuration} min
                  </span>
                  <span>{DURATION_MAX} min</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setFilters((f) => ({ ...f, maxDuration: p }))
                      }
                      aria-pressed={filters.maxDuration === p}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                        filters.maxDuration === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      ≤{p}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              {/* Level */}
              <FilterGroup label={t("draw.filters.level")}>
                <div className="flex flex-col gap-1.5">
                  {LEVELS.map((l) => {
                    const selected = filters.levels.includes(l);
                    const stars = DIFFICULTY_META[l].level;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleLevel(l)}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span>{t(`difficulty.${l}`)}</span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "size-3",
                                i < stars
                                  ? "fill-current"
                                  : "opacity-25",
                              )}
                            />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>
            </div>
          </aside>

          {/* ── Draw zone ─────────────────────────────────────────────────── */}
          <section className="min-w-0">
            <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-transparent p-4 sm:p-6">
              {/* Draw controls */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  onClick={handleDraw}
                  disabled={!hasMatches || isDrawing}
                  className="h-14 px-8 text-base w-full sm:w-auto"
                >
                  <Dices className={cn("size-5", isDrawing && "animate-spin")} />
                  {isDrawing ? t("draw.scanning") : t("draw.draw")}
                </Button>
                {!isMobile && (
                  <p className="text-xs text-muted-foreground">
                    {t("draw.spaceHint")}
                  </p>
                )}
                {filtersActive && (
                  <button
                    type="button"
                    onClick={handleSurprise}
                    disabled={isDrawing}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="size-3.5" />
                    {t("draw.surprise")}
                  </button>
                )}
              </div>

              {/* Result / scan / placeholder / empty */}
              <div className="mt-6">
                {!hasMatches ? (
                  <EmptyState onReset={resetFilters} t={t} />
                ) : isDrawing && scanWorkout ? (
                  <ScanCard workout={scanWorkout} pick={pick} />
                ) : result ? (
                  <ResultCard
                    workout={result}
                    pick={pick}
                    t={t}
                    tStrength={tStrength}
                    onRedraw={handleDraw}
                    isDrawing={isDrawing}
                  />
                ) : (
                  <Placeholder t={t} />
                )}
              </div>
            </div>

            {/* Recent draws */}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold flex items-center gap-1.5">
                    <RotateCcw className="size-4 text-muted-foreground" />
                    {t("draw.recent.title")}
                  </h2>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    {t("draw.recent.avoidRepeats")}
                    <Switch
                      checked={avoidRepeats}
                      onCheckedChange={setAvoidRepeats}
                      aria-label={t("draw.recent.avoidRepeats")}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((w) => {
                    const zone = isRunningWorkout(w) ? getDominantZone(w) : null;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          clearTimeouts();
                          setIsDrawing(false);
                          setScanWorkout(null);
                          setResult(w);
                        }}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent",
                          zone ? `zone-${zone}` : "",
                          result?.id === w.id
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        {zone && (
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: `var(--zone-${zone})` }}
                            aria-hidden="true"
                          />
                        )}
                        <span className="max-w-[14rem] truncate">
                          {pick(w, "name")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Placeholder({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
      <Dices className="size-10 text-muted-foreground/50 mb-3" />
      <h3 className="text-base font-medium text-foreground">
        {t("draw.placeholder.title")}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {t("draw.placeholder.description")}
      </p>
    </div>
  );
}

function EmptyState({
  onReset,
  t,
}: {
  onReset: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
      <X className="size-10 text-muted-foreground/50 mb-3" />
      <h3 className="text-base font-medium text-foreground">
        {t("draw.empty.title")}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {t("draw.empty.description")}
      </p>
      <Button variant="outline" size="sm" onClick={onReset} className="mt-4">
        <RotateCcw className="size-4 mr-1" />
        {t("draw.empty.reset")}
      </Button>
    </div>
  );
}

/** Flashing card shown while the catalogue is being scanned. */
function ScanCard({
  workout,
  pick,
}: {
  workout: AnyWorkoutTemplate;
  pick: ReturnType<typeof usePickLang>;
}) {
  const zone = isRunningWorkout(workout) ? getDominantZone(workout) : 2;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border p-5",
        `zone-${zone} bg-gradient-to-br from-zone-${zone}/10 to-transparent`,
      )}
      aria-hidden="true"
    >
      {/* Accent scan line sweeping across the card */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 35%, transparent), transparent)",
          animation: "draw-scan 0.6s linear infinite",
        }}
      />
      <style>{`@keyframes draw-scan { 0% { transform: translateX(-100%);} 100% { transform: translateX(400%);} }`}</style>
      <p className="text-lg font-semibold opacity-80 line-clamp-1">
        {pick(workout, "name")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 opacity-70">
        {pick(workout, "description")}
      </p>
    </div>
  );
}

/** Full result card with profile, zones, metrics and actions. */
function ResultCard({
  workout,
  pick,
  t,
  tStrength,
  onRedraw,
  isDrawing,
}: {
  workout: AnyWorkoutTemplate;
  pick: ReturnType<typeof usePickLang>;
  t: (k: string, o?: Record<string, unknown>) => string;
  tStrength: (k: string) => string;
  onRedraw: () => void;
  isDrawing: boolean;
}) {
  const isStrength = isStrengthWorkout(workout);
  const discipline = getDrawDiscipline(workout);
  const DisciplineIcon = DISCIPLINE_ICONS[discipline];
  const dominantZone = isRunningWorkout(workout)
    ? getDominantZone(workout)
    : 2;
  const zones = getAnyWorkoutZones(workout);
  const duration = getAnyWorkoutDuration(workout);
  const tss = getAnyWorkoutTss(workout);

  const methodLabel = isStrength
    ? tStrength(`categories.${workout.category}`)
    : t(`categories.${workout.category}`);

  return (
    <div
      className={cn(
        "rounded-xl border border-border p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300",
        `zone-${dominantZone} bg-gradient-to-br from-zone-${dominantZone}/15 to-transparent`,
      )}
    >
      {/* Eyebrow: discipline · method · n° */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <DisciplineIcon className="size-3.5" />
        <span>{t(`activityToggle.${discipline}`)}</span>
        <span aria-hidden="true">·</span>
        <span>{methodLabel}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">n°{getWorkoutNumber(workout.id)}</span>
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-xl font-bold leading-snug">
        {pick(workout, "name")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {pick(workout, "description")}
      </p>

      {/* Effort profile (aerobic sports only) */}
      {!isStrength && (
        <div className="mt-4">
          <SessionIntensityBar workout={workout} className="h-1.5" />
        </div>
      )}

      {/* Zone chips */}
      {zones.length > 0 && (
        <div className="mt-3">
          <ZoneBadges zones={zones} size="sm" />
        </div>
      )}

      {/* 4 metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          icon={Clock}
          label={t("draw.metrics.duration")}
          value={formatDurationMinutes(duration)}
        />
        <Metric
          icon={Gauge}
          label={t("draw.metrics.tss")}
          value={tss != null ? String(tss) : "—"}
        />
        <Metric
          icon={Target}
          label={t("draw.metrics.zone")}
          value={zones.length > 0 ? `Z${dominantZone}` : "—"}
        />
        <Metric
          icon={Star}
          label={t("draw.metrics.level")}
          value={t(`difficulty.${workout.difficulty}`)}
        />
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild className="flex-1 sm:flex-none">
          <Link to={`/workout/${workout.id}`}>
            {t("draw.start")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link to={`/workout/${workout.id}`}>{t("draw.viewDetail")}</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={onRedraw}
          disabled={isDrawing}
          className="flex-1 sm:flex-none"
        >
          <RotateCcw className="size-4" />
          {t("draw.redraw")}
        </Button>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums line-clamp-1">
        {value}
      </p>
    </div>
  );
}
