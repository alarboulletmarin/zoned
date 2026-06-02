import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
import { PolarizationGauge, WeekRhythmChart, WeekDayCard } from "@/components/weekly";
import { DISCIPLINES, type DrawDiscipline } from "@/lib/workoutFilters";
import { generateWeek, rerollSlot } from "@/lib/weekGenerator";
import { computeWeekStats } from "@/lib/weekStats";
import { WEEK_PRESETS } from "@/lib/weekPresets";
import { createWeekPlanFromGenerated } from "@/lib/weekToPlan";
import { savePlan } from "@/lib/planStorage";
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
} from "@/types/week";

const VOLUME_MIN = 3;
const VOLUME_MAX = 12;
const SESSION_OPTIONS: SessionCount[] = [3, 4, 5, 6];
const QUALITY_OPTIONS: QualityType[] = ["random", "tempo", "threshold", "vo2vma"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

const DISCIPLINE_ICONS: Record<
  DrawDiscipline,
  React.ComponentType<{ className?: string }>
> = {
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  strength: Dumbbell,
};

function sample<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function WeekGeneratePage() {
  usePageHint("weekly", "hints.weekly.title", "hints.weekly.description");
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const navigate = useNavigate();

  const { workouts: running } = useWorkouts();
  const { workouts: strength } = useStrengthWorkouts();
  const { workouts: cycling } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimming } = useCrossDisciplineWorkouts("swimming");
  const catalog: AnyWorkoutTemplate[] = useMemo(
    () => [...running, ...cycling, ...swimming, ...strength],
    [running, cycling, swimming, strength],
  );

  const [settings, setSettings] = useState<WeekSettings>(DEFAULT_WEEK_SETTINGS);
  const [week, setWeek] = useState<GeneratedWeek | null>(null);
  const [name, setName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Full-week generation flash + single-slot reroll scan.
  const [genFlash, setGenFlash] = useState<AnyWorkoutTemplate | null>(null);
  const [scan, setScan] = useState<{ day: DayIndex; workout: AnyWorkoutTemplate } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  // First generation once the catalog is loaded.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || catalog.length === 0) return;
    didInit.current = true;
    setWeek(generateWeek(DEFAULT_WEEK_SETTINGS, catalog));
  }, [catalog]);

  /** Generate with the "draw" flash animation when a week already exists. */
  function runGenerate(next: WeekSettings) {
    if (catalog.length === 0) return;
    const final = generateWeek(next, catalog);
    if (!week) {
      setWeek(final);
      return;
    }
    clearTimers();
    const times: number[] = [];
    let elapsed = 0;
    let gap = 50;
    while (elapsed < 750) {
      times.push(elapsed);
      elapsed += gap;
      gap *= 1.18;
    }
    times.forEach((at, i) => {
      const isLast = i === times.length - 1;
      timers.current.push(
        setTimeout(() => {
          if (isLast) {
            clearTimers();
            setGenFlash(null);
            setWeek(final);
          } else {
            setGenFlash(sample(catalog));
          }
        }, at),
      );
    });
  }

  function applySettings(patch: Partial<WeekSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    runGenerate(next);
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
      levels: has ? settings.levels.filter((x) => x !== l) : [...settings.levels, l],
    });
  }

  function handleReroll(day: DayIndex) {
    if (!week || scan || genFlash || catalog.length === 0) return;
    clearTimers();
    const times: number[] = [];
    let elapsed = 0;
    let gap = 45;
    while (elapsed < 800) {
      times.push(elapsed);
      elapsed += gap;
      gap *= 1.16;
    }
    times.forEach((at, i) => {
      const isLast = i === times.length - 1;
      timers.current.push(
        setTimeout(() => {
          if (isLast) {
            clearTimers();
            setScan(null);
            setWeek((prev) => (prev ? rerollSlot(prev, day, catalog) : prev));
          } else {
            setScan({ day, workout: sample(catalog) });
          }
        }, at),
      );
    });
  }

  function handleCreate() {
    if (!week) return;
    const plan = createWeekPlanFromGenerated(
      name.trim() || t("weekly.generate.defaultName"),
      week,
    );
    savePlan(plan);
    navigate(`/plan/${plan.id}`);
  }

  const stats = useMemo(() => (week ? computeWeekStats(week.slots) : null), [week]);

  return (
    <>
      <SEOHead noindex title={t("weekly.generate.title")} canonical="/weeks/new/generate" />
      <div className="py-8 max-w-7xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/weeks/new">
            <ArrowLeft className="mr-2 size-4" />
            {t("weekly.new.title")}
          </Link>
        </Button>

        <div className="mb-6">
          <EditorialTitle as="h1" size="md">
            {t("weekly.generate.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
            {t("weekly.generate.subtitle")}
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Settings (collapsible) */}
          <aside className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-full justify-between lg:hidden"
            >
              {settingsOpen ? t("weekly.settings.hide") : t("weekly.settings.show")}
              {settingsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>

            <div className={cn("space-y-4", !settingsOpen && "hidden lg:block")}>
              {/* Presets */}
              <Card className="p-4 space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("weekly.presets.title")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {WEEK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSettings(preset.settings);
                        runGenerate(preset.settings);
                      }}
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

                <Field label={t("weekly.settings.sessions")}>
                  <Segmented
                    value={String(settings.sessions)}
                    onChange={(v) => applySettings({ sessions: Number(v) as SessionCount })}
                    options={SESSION_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                  />
                </Field>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium">{t("weekly.settings.volume")}</label>
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

                <Field label={t("weekly.settings.quality")}>
                  <Segmented
                    value={settings.quality}
                    onChange={(v) => applySettings({ quality: v as QualityType })}
                    className="grid-cols-2"
                    options={QUALITY_OPTIONS.map((q) => ({
                      value: q,
                      label: t(`weekly.settings.qualityOptions.${q}`),
                    }))}
                  />
                </Field>

                <Field label={t("weekly.settings.longRunDay")}>
                  <Segmented
                    value={String(settings.longRunDay)}
                    onChange={(v) => applySettings({ longRunDay: Number(v) as DayIndex })}
                    className="grid-cols-7"
                    options={DAYS.map((d) => ({
                      value: String(d),
                      label: t(`weekly.daysShort.${d}`),
                    }))}
                  />
                </Field>

                <Field label={t("weekly.settings.disciplines")}>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map((d) => {
                      const Icon = DISCIPLINE_ICONS[d];
                      const active = settings.disciplines.includes(d);
                      return (
                        <Chip key={d} active={active} onClick={() => toggleDiscipline(d)}>
                          <Icon className="size-4" />
                          {t(`activityToggle.${d}`)}
                        </Chip>
                      );
                    })}
                  </div>
                </Field>

                <Field label={t("weekly.settings.levels")}>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <Chip key={l} active={settings.levels.includes(l)} onClick={() => toggleLevel(l)}>
                        {pick(DIFFICULTY_META[l], "label")}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </Card>

              <Button onClick={() => runGenerate(settings)} className="w-full">
                <RefreshCw className="size-4" />
                {t("weekly.generate.action")}
              </Button>
            </div>
          </aside>

          {/* Preview + create */}
          <div className="space-y-5">
            {stats && (
              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Metric label={t("weekly.summary.sessions")} value={String(stats.sessions)} />
                  <Metric label={t("weekly.summary.volume")} value={`${stats.totalHours.toFixed(1)} h`} />
                  <Metric label={t("weekly.summary.load")} value={`${stats.totalTss} TSS`} />
                  <Metric label={t("weekly.summary.hard")} value={String(stats.hardSessions)} />
                </div>
                <PolarizationGauge polarised={stats.polarised} />
              </Card>
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
                        genFlash && slot.kind !== "rest"
                          ? genFlash
                          : scan?.day === slot.day
                            ? scan.workout
                            : null
                      }
                      onToggleLock={() => {
                        setWeek((prev) =>
                          prev
                            ? {
                                ...prev,
                                slots: prev.slots.map((s) =>
                                  s.day === slot.day ? { ...s, locked: !s.locked } : s,
                                ),
                              }
                            : prev,
                        );
                      }}
                      onReroll={() => handleReroll(slot.day)}
                    />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}

            {/* Create */}
            {week && (
              <Card className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("weekly.generate.namePlaceholder")}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleCreate} className="sm:w-auto">
                  <Sparkles className="size-4" />
                  {t("weekly.generate.create")}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
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
