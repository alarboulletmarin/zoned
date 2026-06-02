import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  RefreshCw,
  LockOpen,
  AlertTriangle,
  Download,
  Save,
  Trash2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";
import { usePageHint } from "@/hooks/usePageHint";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import {
  PolarizationGauge,
  WeekRhythmChart,
  WeekDayCard,
} from "@/components/weekly";
import { DISCIPLINES, type DrawDiscipline } from "@/lib/workoutFilters";
import {
  generateWeek,
  regenerateUnlocked,
  rerollSlot,
} from "@/lib/weekGenerator";
import { computeWeekStats } from "@/lib/weekStats";
import {
  exportWeekToICS,
  exportWeekToPDF,
  exportWeekToJSON,
} from "@/lib/export";
import {
  listSavedWeeks,
  saveWeek,
  deleteSavedWeek,
  duplicateSavedWeek,
  type SavedWeek,
} from "@/lib/weekStorage";
import { WEEK_PRESETS } from "@/lib/weekPresets";
import { toast } from "sonner";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate, Difficulty } from "@/types";
import { DIFFICULTY_META } from "@/types";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type GeneratedWeek,
  type QualityType,
  type SessionCount,
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

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export function WeeklyPlannerPage() {
  usePageHint("weekly", "hints.weekly.title", "hints.weekly.description");
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

  function applyPreset(next: WeekSettings) {
    applySettings(next);
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

  // ── Re-roll with the "draw a session" scan animation ─────────────────────
  const [scan, setScan] = useState<{
    day: DayIndex;
    workout: AnyWorkoutTemplate;
  } | null>(null);
  const scanTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => scanTimers.current.forEach(clearTimeout),
    [],
  );

  function handleReroll(day: DayIndex) {
    if (!week || scan || catalog.length === 0) return;
    // Flash random candidates while decelerating (ease-out), then settle —
    // the same archive-drawer feel as the draw page, scoped to one slot.
    const total = 900;
    const times: number[] = [];
    let elapsed = 0;
    let gap = 45;
    while (elapsed < total) {
      times.push(elapsed);
      elapsed += gap;
      gap *= 1.16;
    }
    times.forEach((at, i) => {
      const isLast = i === times.length - 1;
      scanTimers.current.push(
        setTimeout(() => {
          if (isLast) {
            scanTimers.current = [];
            setScan(null);
            setWeek((prev) => (prev ? rerollSlot(prev, day, catalog) : prev));
          } else {
            setScan({
              day,
              workout: catalog[Math.floor(Math.random() * catalog.length)],
            });
          }
        }, at),
      );
    });
  }

  // ── Saved weeks + export ─────────────────────────────────────────────────
  const [saved, setSaved] = useState<SavedWeek[]>(() => listSavedWeeks());

  function handleSave() {
    if (!week) return;
    saveWeek(week);
    setSaved(listSavedWeeks());
    toast.success(t("weekly.toast.saved"));
  }

  function handleDelete(id: string) {
    deleteSavedWeek(id);
    setSaved(listSavedWeeks());
  }

  function handleDuplicate(id: string) {
    duplicateSavedWeek(id, t("weekly.saved.copySuffix"));
    setSaved(listSavedWeeks());
  }

  function handleRestore(entry: SavedWeek) {
    setSettings(entry.week.settings);
    setWeek(entry.week);
  }

  async function handleExport(fmt: "ics" | "pdf" | "json") {
    if (!week) return;
    try {
      if (fmt === "ics") await exportWeekToICS(week);
      else if (fmt === "pdf") await exportWeekToPDF(week);
      else exportWeekToJSON(week);
      toast.success(t("weekly.toast.exported"));
    } catch {
      toast.error(t("weekly.toast.exportError"));
    }
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
            {/* Template weeks (presets) */}
            <Card className="p-4 space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("weekly.presets.title")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {WEEK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.settings)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {t(`weekly.presets.options.${preset.id}`)}
                  </button>
                ))}
              </div>
            </Card>

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
              <StaggerGrid className="space-y-3">
                {week.slots.map((slot) => (
                  <StaggerItem key={slot.day}>
                    <WeekDayCard
                      slot={slot}
                      flashWorkout={
                        scan?.day === slot.day ? scan.workout : null
                      }
                      onToggleLock={() => toggleLock(slot.day)}
                      onReroll={() => handleReroll(slot.day)}
                    />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}

            {/* Footer: export + save */}
            {week && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-1">
                <Button variant="outline" onClick={() => handleExport("ics")}>
                  <Download className="size-4" />
                  {t("weekly.actions.exportIcs")}
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="size-4" />
                  {t("weekly.actions.exportPdf")}
                </Button>
                <Button variant="outline" onClick={() => handleExport("json")}>
                  <Download className="size-4" />
                  {t("weekly.actions.exportJson")}
                </Button>
                <Button onClick={handleSave} className="sm:ml-auto">
                  <Save className="size-4" />
                  {t("weekly.actions.save")}
                </Button>
              </div>
            )}

            {/* Saved weeks */}
            {saved.length > 0 && (
              <Card className="p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t("weekly.saved.title")}
                </h2>
                <ul className="divide-y divide-border">
                  {saved.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {entry.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(entry)}
                        >
                          {t("weekly.saved.restore")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(entry.id)}
                        >
                          {t("weekly.saved.duplicate")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(entry.id)}
                          aria-label={t("weekly.saved.delete")}
                          title={t("weekly.saved.delete")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
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
