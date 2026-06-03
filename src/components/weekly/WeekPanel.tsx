import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Footprints,
  Bike,
  Waves,
  Dumbbell,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { PolarizationGauge, WeekRhythmChart } from "@/components/weekly";
import { DISCIPLINES, type DrawDiscipline } from "@/lib/workoutFilters";
import { computeWeekStats } from "@/lib/weekStats";
import { WEEK_PRESETS } from "@/lib/weekPresets";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { DIFFICULTY_META, type Difficulty } from "@/types";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type QualityType,
  type SessionCount,
  type WeekSettings,
  type WeekSlot,
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
> = { running: Footprints, cycling: Bike, swimming: Waves, strength: Dumbbell };

/**
 * The week-specific panel shown alongside the calendar editor (Epic #83):
 * generator settings + a Generate button, plus live 80/20 statistics computed
 * from the week's actual sessions — so the numbers update whether the week was
 * generated or built by hand.
 */
export function WeekPanel({
  slots,
  defaultLongRunDay = 5,
  busy = false,
  onGenerate,
}: {
  slots: WeekSlot[];
  defaultLongRunDay?: DayIndex;
  busy?: boolean;
  onGenerate: (settings: WeekSettings) => void;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<WeekSettings>({
    ...DEFAULT_WEEK_SETTINGS,
    longRunDay: defaultLongRunDay,
  });

  const stats = useMemo(() => computeWeekStats(slots), [slots]);
  const set = (patch: Partial<WeekSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));
  const toggle = <K extends "disciplines" | "levels">(
    key: K,
    value: WeekSettings[K][number],
  ) =>
    setSettings((s) => {
      const arr = s[key] as unknown[];
      const has = arr.includes(value);
      return {
        ...s,
        [key]: has ? arr.filter((x) => x !== value) : [...arr, value],
      } as WeekSettings;
    });

  return (
    <div className="space-y-4">
      {/* Live statistics */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Metric label={t("weekly.summary.sessions")} value={String(stats.sessions)} />
          <Metric label={t("weekly.summary.volume")} value={`${stats.totalHours.toFixed(1)} h`} />
          <Metric label={t("weekly.summary.load")} value={`${stats.totalTss} TSS`} />
          <Metric label={t("weekly.summary.hard")} value={String(stats.hardSessions)} />
        </div>
        {stats.polarised.zonedMinutes > 0 && (
          <PolarizationGauge polarised={stats.polarised} />
        )}
        <WeekRhythmChart slots={slots} />
      </Card>

      {/* Generator */}
      <Card className="p-4 space-y-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("weekly.generate.title")}
          </span>
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {open && (
          <div className="space-y-5">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {WEEK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSettings(preset.settings)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {t(`weekly.presets.options.${preset.id}`)}
                </button>
              ))}
            </div>

            <Field label={t("weekly.settings.sessions")}>
              <Segmented
                value={String(settings.sessions)}
                onChange={(v) => set({ sessions: Number(v) as SessionCount })}
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
                onValueChange={([v]) => set({ targetVolumeH: v })}
              />
            </div>

            <Field label={t("weekly.settings.quality")}>
              <Segmented
                value={settings.quality}
                onChange={(v) => set({ quality: v as QualityType })}
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
                onChange={(v) => set({ longRunDay: Number(v) as DayIndex })}
                className="grid-cols-7"
                options={DAYS.map((d) => ({ value: String(d), label: t(`weekly.daysShort.${d}`) }))}
              />
            </Field>

            <Field label={t("weekly.settings.disciplines")}>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINES.map((d) => {
                  const Icon = DISCIPLINE_ICONS[d];
                  return (
                    <Chip key={d} active={settings.disciplines.includes(d)} onClick={() => toggle("disciplines", d)}>
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
                  <Chip key={l} active={settings.levels.includes(l)} onClick={() => toggle("levels", l)}>
                    {pick(DIFFICULTY_META[l], "label")}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        <Button onClick={() => onGenerate(settings)} disabled={busy} className="w-full">
          <Sparkles className="size-4" />
          {t("weekly.generate.action")}
        </Button>
      </Card>
    </div>
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
