import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  Clock,
  Gauge,
  Target,
  RefreshCw,
  Lock,
  LockOpen,
  Shuffle,
  AlertTriangle,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { formatDurationMinutes } from "@/components/visualization";
import { PolarizationGauge, WeekRhythmChart } from "@/components/weekly";
import {
  DISCIPLINES,
  getAnyWorkoutDuration,
  getAnyWorkoutTss,
  type DrawDiscipline,
} from "@/lib/workoutFilters";
import {
  generateWeek,
  regenerateUnlocked,
  rerollSlot,
} from "@/lib/weekGenerator";
import { computeWeekStats } from "@/lib/weekStats";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate, Difficulty } from "@/types";
import {
  DIFFICULTY_META,
  getDominantZone,
  isStrengthWorkout,
} from "@/types";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type GeneratedWeek,
  type QualityType,
  type SessionCount,
  type SlotKind,
  type WeekSettings,
  type WeekSlot,
} from "@/types/week";

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const VOLUME_MIN = 3;
const VOLUME_MAX = 12;

const SESSION_OPTIONS: SessionCount[] = [3, 4, 5, 6];
const QUALITY_OPTIONS: QualityType[] = [
  "random",
  "tempo",
  "threshold",
  "vo2vma",
];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

const DISCIPLINE_ICONS: Record<
  DrawDiscipline,
  React.ComponentType<{ className?: string }>
> = {
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  strength: Dumbbell,
};

const STORAGE_KEY = "zoned-week-state";

interface WeekSnapshot {
  settings: WeekSettings;
  slots: WeekSlot[];
}

function readSnapshot(): Partial<WeekSnapshot> {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<WeekSnapshot>) : {};
  } catch {
    return {};
  }
}

function writeSnapshot(snap: WeekSnapshot): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* storage unavailable or full (non-critical) */
  }
}

/** Accent zone for a slot — strength/rest have no aerobic zone. */
function slotZone(w: AnyWorkoutTemplate | null): number | null {
  if (!w || isStrengthWorkout(w)) return null;
  return getDominantZone(w);
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export function WeeklyPlannerPage() {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();

  const { workouts: running } = useWorkouts();
  const { workouts: strength } = useStrengthWorkouts();
  const { workouts: cycling } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimming } = useCrossDisciplineWorkouts("swimming");

  const catalog: AnyWorkoutTemplate[] = useMemo(
    () => [...running, ...cycling, ...swimming, ...strength],
    [running, cycling, swimming, strength],
  );

  const restored = useMemo(readSnapshot, []);
  const [settings, setSettings] = useState<WeekSettings>(
    () => restored.settings ?? DEFAULT_WEEK_SETTINGS,
  );
  const [week, setWeek] = useState<GeneratedWeek | null>(() =>
    restored.slots
      ? {
          slots: restored.slots,
          settings: restored.settings ?? DEFAULT_WEEK_SETTINGS,
        }
      : null,
  );

  // First generation once the catalog is loaded (and nothing was restored).
  const didInit = useRef(week !== null);
  useEffect(() => {
    if (didInit.current || catalog.length === 0) return;
    didInit.current = true;
    setWeek(generateWeek(settings, catalog));
  }, [catalog, settings]);

  // Persist the current week across navigation.
  useEffect(() => {
    if (week) writeSnapshot({ settings: week.settings, slots: week.slots });
  }, [week]);

  // Changing a setting regenerates a fresh week (locks reset).
  function applySettings(patch: Partial<WeekSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (catalog.length > 0) setWeek(generateWeek(next, catalog));
  }

  function toggleDiscipline(d: DrawDiscipline) {
    const has = settings.disciplines.includes(d);
    applySettings({
      disciplines: has
        ? settings.disciplines.filter((x) => x !== d)
        : [...settings.disciplines, d],
    });
  }

  function toggleLevel(l: Difficulty) {
    const has = settings.levels.includes(l);
    applySettings({
      levels: has
        ? settings.levels.filter((x) => x !== l)
        : [...settings.levels, l],
    });
  }

  function handleRegenerate() {
    if (week) setWeek(regenerateUnlocked(week, catalog));
  }

  function handleUnlockAll() {
    if (!week) return;
    setWeek({
      ...week,
      slots: week.slots.map((s) => ({ ...s, locked: false })),
    });
  }

  function toggleLock(day: DayIndex) {
    if (!week) return;
    setWeek({
      ...week,
      slots: week.slots.map((s) =>
        s.day === day ? { ...s, locked: !s.locked } : s,
      ),
    });
  }

  function handleReroll(day: DayIndex) {
    if (week) setWeek(rerollSlot(week, day, catalog));
  }

  const stats = useMemo(
    () => (week ? computeWeekStats(week.slots) : null),
    [week],
  );
  const hasLocks = week?.slots.some((s) => s.locked) ?? false;
  const overBudget = stats ? stats.totalHours > settings.targetVolumeH + 0.25 : false;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEOHead
        title={t("weekly.title")}
        description={t("weekly.subtitle")}
        canonical="/library/weekly"
      />
      <div className="py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <EditorialTitle as="h1" size="md">
            {t("weekly.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
            {t("weekly.subtitle")}
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Settings */}
          <aside className="space-y-5">
            <Card className="p-4 space-y-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("weekly.settings.title")}
              </h2>

              {/* Sessions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("weekly.settings.sessions")}
                </label>
                <Segmented
                  value={String(settings.sessions)}
                  onChange={(v) =>
                    applySettings({ sessions: Number(v) as SessionCount })
                  }
                  options={SESSION_OPTIONS.map((n) => ({
                    value: String(n),
                    label: String(n),
                  }))}
                />
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium">
                    {t("weekly.settings.volume")}
                  </label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {settings.targetVolumeH} h
                  </span>
                </div>
                <Slider
                  min={VOLUME_MIN}
                  max={VOLUME_MAX}
                  step={1}
                  value={[settings.targetVolumeH]}
                  onValueChange={([v]) => setSettings((s) => ({ ...s, targetVolumeH: v }))}
                  onValueCommit={([v]) => applySettings({ targetVolumeH: v })}
                />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("weekly.settings.quality")}
                </label>
                <Segmented
                  value={settings.quality}
                  onChange={(v) => applySettings({ quality: v as QualityType })}
                  className="grid-cols-2"
                  options={QUALITY_OPTIONS.map((q) => ({
                    value: q,
                    label: t(`weekly.settings.qualityOptions.${q}`),
                  }))}
                />
              </div>

              {/* Disciplines */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("weekly.settings.disciplines")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map((d) => {
                    const Icon = DISCIPLINE_ICONS[d];
                    const active = settings.disciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        {t(`common:disciplines.${d}`, { defaultValue: d })}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Levels */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("weekly.settings.levels")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => {
                    const active = settings.levels.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleLevel(l)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {pick(DIFFICULTY_META[l], "label")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={handleRegenerate} className="w-full">
                <RefreshCw className="size-4" />
                {t("weekly.actions.regenerate")}
              </Button>
              {hasLocks && (
                <Button
                  variant="outline"
                  onClick={handleUnlockAll}
                  className="w-full"
                >
                  <LockOpen className="size-4" />
                  {t("weekly.actions.unlockAll")}
                </Button>
              )}
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-5">
            {stats && (
              <SummaryCard
                stats={stats}
                target={settings.targetVolumeH}
                overBudget={overBudget}
              />
            )}

            {week && (
              <Card className="p-4">
                <WeekRhythmChart slots={week.slots} />
              </Card>
            )}

            {week && (
              <div className="space-y-3">
                {week.slots.map((slot) => (
                  <SlotRow
                    key={slot.day}
                    slot={slot}
                    onToggleLock={() => toggleLock(slot.day)}
                    onReroll={() => handleReroll(slot.day)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Summary card (basic — the polarisation gauge lands in #87)
// ────────────────────────────────────────────────────────────────────────────

function SummaryCard({
  stats,
  target,
  overBudget,
}: {
  stats: ReturnType<typeof computeWeekStats>;
  target: number;
  overBudget: boolean;
}) {
  const { t } = useTranslation("library");

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("weekly.summary.title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label={t("weekly.summary.sessions")} value={String(stats.sessions)} />
        <Metric
          label={t("weekly.summary.volume")}
          value={`${stats.totalHours.toFixed(1)} h`}
        />
        <Metric label={t("weekly.summary.load")} value={`${stats.totalTss} TSS`} />
        <Metric label={t("weekly.summary.hard")} value={String(stats.hardSessions)} />
      </div>

      <PolarizationGauge polarised={stats.polarised} className="mt-4" />

      {overBudget && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-4" />
          {t("weekly.summary.overBudget", { target })}
        </p>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Day row (basic — the rhythm chart & rich cards land in #88/#89)
// ────────────────────────────────────────────────────────────────────────────

const KIND_TAG: Record<Exclude<SlotKind, "rest">, string> = {
  easy: "weekly.kinds.easy",
  quality: "weekly.kinds.quality",
  long: "weekly.kinds.long",
};

function SlotRow({
  slot,
  onToggleLock,
  onReroll,
}: {
  slot: WeekSlot;
  onToggleLock: () => void;
  onReroll: () => void;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const w = slot.workout;
  const zone = slotZone(w);

  return (
    <Card
      className={cn(
        "p-3 flex items-center gap-3",
        slot.kind === "rest" && "opacity-60",
      )}
    >
      {/* Day + accent */}
      <div className="flex items-center gap-3 w-28 shrink-0">
        <span
          className="h-9 w-1.5 rounded-full bg-muted"
          style={zone ? { backgroundColor: `var(--zone-${zone})` } : undefined}
          aria-hidden
        />
        <div>
          <div className="text-sm font-medium">{t(`weekly.days.${slot.day}`)}</div>
          {slot.kind !== "rest" && (
            <div className="text-xs text-muted-foreground">
              {t(KIND_TAG[slot.kind])}
            </div>
          )}
        </div>
      </div>

      {/* Workout */}
      {slot.kind === "rest" || !w ? (
        <div className="flex-1 text-sm text-muted-foreground">
          {t("weekly.slot.rest")}
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <Link
              to={`/workout/${w.id}`}
              className="text-sm font-medium hover:underline line-clamp-1"
            >
              {pick(w, "name")}
            </Link>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatDurationMinutes(getAnyWorkoutDuration(w))}
              </span>
              {getAnyWorkoutTss(w) != null && (
                <span className="inline-flex items-center gap-1">
                  <Gauge className="size-3.5" />
                  {getAnyWorkoutTss(w)} TSS
                </span>
              )}
              {zone && (
                <span className="inline-flex items-center gap-1">
                  <Target className="size-3.5" />Z{zone}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReroll}
              aria-label={t("weekly.slot.reroll")}
              title={t("weekly.slot.reroll")}
            >
              <Shuffle className="size-4" />
            </Button>
            <Button
              variant={slot.locked ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleLock}
              aria-pressed={slot.locked}
              aria-label={t(slot.locked ? "weekly.slot.unlock" : "weekly.slot.lock")}
              title={t(slot.locked ? "weekly.slot.unlock" : "weekly.slot.lock")}
            >
              {slot.locked ? (
                <Lock className="size-4" />
              ) : (
                <LockOpen className="size-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
