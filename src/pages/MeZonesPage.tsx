import { useState, useEffect, useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  UserRound,
  Save,
  Trash2,
  Plus,
  Target,
  TrendingUp,
  Flag,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { cn } from "@/lib/utils";
import {
  getRunnerProfileOrMigrate,
  saveRunnerProfile,
  loadRunnerProfile,
  updateBaseData,
  setPerformanceReference,
  removePerformanceReference,
  addBenchmark,
  deleteBenchmark,
  addPersonalRecord,
  deletePersonalRecord,
} from "@/lib/runnerProfile";
import { saveUserZonePrefs, loadUserZonePrefs } from "@/lib/zones";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { zoneClass } from "@/lib/zoneColors";
import { loadAllWorkouts } from "@/data/workouts";
import { CommuteSection } from "@/components/domain/CommuteSection";
import { ZoneAdjustmentPanel } from "@/components/domain/ZoneAdjustmentPanel";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { usePlans } from "@/hooks/usePlans";
import type {
  RunnerProfile,
  BenchmarkType,
  BenchmarkEntry,
} from "@/types/runner-profile";
import type { RaceDistance } from "@/types/plan";
import type { Difficulty, ZoneNumber } from "@/types";
import { DIFFICULTY_META, parseZoneSpan } from "@/types";
import { RACE_DISTANCE_META } from "@/types/plan";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h}h${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function deriveVma(type: BenchmarkType, result: number): number | undefined {
  if (type === "half_cooper" && result > 0)
    return Math.round((result / 100) * 10) / 10;
  if (type === "cooper_12min" && result > 0)
    return Math.round((result / 200) * 10) / 10;
  if (type === "lab_test" && result > 0)
    return Math.round(result * 10) / 10;
  return undefined;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const INPUT_CLASS = cn(
  "flex h-9 w-full rounded-none border-2 border-foreground bg-transparent px-3 py-1 font-mono text-sm",
  "transition-[border-color] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring",
);

const RACE_DISTANCES = Object.keys(RACE_DISTANCE_META) as RaceDistance[];
const DIFFICULTY_KEYS: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];
/** Tabs beyond the main values-and-zones flow, addressable via `?tab=`. */
const SECONDARY_TABS = ["references", "benchmarks", "records", "commute"];
const BENCHMARK_TYPES: BenchmarkType[] = [
  "half_cooper",
  "cooper_12min",
  "lab_test",
  "critical_velocity",
  "time_trial",
  "other",
];

// ---------------------------------------------------------------------------
// TimeInputs (reusable sub-component)
// ---------------------------------------------------------------------------

function TimeInputs({
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  hLabel,
  mLabel,
  sLabel,
}: {
  hours: string;
  minutes: string;
  seconds: string;
  onHoursChange: (v: string) => void;
  onMinutesChange: (v: string) => void;
  onSecondsChange: (v: string) => void;
  hLabel: string;
  mLabel: string;
  sLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        max={9}
        value={hours}
        onChange={(e) => onHoursChange(e.target.value)}
        className={cn(INPUT_CLASS, "w-12 border-input focus-visible:ring-ring/50")}
        aria-label={hLabel}
      />
      <span className="text-xs text-muted-foreground">{hLabel}</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={(e) => onMinutesChange(e.target.value)}
        className={cn(INPUT_CLASS, "w-14 border-input focus-visible:ring-ring/50")}
        aria-label={mLabel}
      />
      <span className="text-xs text-muted-foreground">{mLabel}</span>
      <input
        type="number"
        min={0}
        max={59}
        value={seconds}
        onChange={(e) => onSecondsChange(e.target.value)}
        className={cn(INPUT_CLASS, "w-14 border-input focus-visible:ring-ring/50")}
        aria-label={sLabel}
      />
      <span className="text-xs text-muted-foreground">{sLabel}</span>
    </div>
  );
}

function timeToFields(totalSeconds: number | undefined): {
  h: string;
  m: string;
  s: string;
} {
  if (!totalSeconds) return { h: "", m: "", s: "" };
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h: h > 0 ? String(h) : "", m: String(m), s: s > 0 ? String(s) : "" };
}

function fieldsToSeconds(h: string, m: string, s: string): number {
  return (
    (parseInt(h, 10) || 0) * 3600 +
    (parseInt(m, 10) || 0) * 60 +
    (parseInt(s, 10) || 0)
  );
}

// ---------------------------------------------------------------------------
// Tab 1: ValuesAndZonesSection — the editorial flow: values → zones → impact
// ---------------------------------------------------------------------------

/** How many catalogue running workouts touch each zone. Real counts, read from
 *  the workout blocks themselves rather than estimated. */
function useZoneSessionCounts(): Partial<Record<ZoneNumber, number>> {
  const [counts, setCounts] = useState<Partial<Record<ZoneNumber, number>>>({});

  useEffect(() => {
    let cancelled = false;
    loadAllWorkouts().then((workouts) => {
      if (cancelled) return;
      const tally: Partial<Record<ZoneNumber, number>> = {};
      for (const workout of workouts) {
        const touched = new Set<ZoneNumber>();
        for (const block of [
          ...workout.warmupTemplate,
          ...workout.mainSetTemplate,
          ...workout.cooldownTemplate,
        ]) {
          const span = parseZoneSpan(block.zone);
          if (!span) continue;
          for (let z = span.min; z <= span.max; z++) touched.add(z as ZoneNumber);
        }
        for (const zone of touched) tally[zone] = (tally[zone] ?? 0) + 1;
      }
      setCounts(tally);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}

/** One big underlined mono number — the mockup's editing gesture. */
function BigValueField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  accent,
  error,
  errorText,
  hint,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step?: number;
  /** The primary value of the page (VMA) gets the heavier rule + acid tick. */
  accent?: boolean;
  error?: boolean;
  errorText?: string;
  hint?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2"
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-baseline gap-2 px-0.5 py-2.5 border-b-2",
          accent ? "border-b-[3px] border-foreground" : "border-border",
          error && "border-destructive",
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
        )}
      >
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-24 shrink bg-transparent border-0 p-0 font-mono text-[28px] leading-none",
            "focus:outline-none [appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          )}
        />
        {accent && <span className="h-6 w-0.5 bg-accent-acid shrink-0" aria-hidden />}
        <span className="ml-auto font-mono text-xs text-muted-foreground">{unit}</span>
      </div>
      {error && errorText ? (
        <p className="mt-2 font-mono text-[11px] text-destructive">{errorText}</p>
      ) : hint ? (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Right-hand rail: what a zone change touches, and the VMA series. */
function ImpactRail({
  profile,
  zoneSessionCounts,
}: {
  profile: RunnerProfile | null;
  zoneSessionCounts: Partial<Record<ZoneNumber, number>>;
}) {
  const { t } = useTranslation("profile");
  const isEnglish = useIsEnglish();
  const { plans } = usePlans();

  const openPlan = plans.find((p) => !p.config.isSingleWeek);
  const planSessionCount = openPlan
    ? openPlan.weeks.reduce((sum, w) => sum + w.sessions.length, 0)
    : 0;

  // Every zoned workout in the catalogue reads its paces from the VMA, so the
  // headline count is the number of workouts that carry at least one zone.
  const zonedWorkouts = Math.max(
    0,
    ...Object.values(zoneSessionCounts).map((n) => n ?? 0),
  );

  const history = useMemo(
    () =>
      (profile?.benchmarks ?? [])
        .filter((b) => b.derivedVma !== undefined)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [profile?.benchmarks],
  );
  const historyMax = Math.max(...history.map((b) => b.derivedVma ?? 0), 1);

  const rows: Array<{ label: string; value: string }> = [
    {
      label: t("me.zones.impactWorkouts"),
      value: zonedWorkouts > 0 ? String(zonedWorkouts) : t("me.zones.impactWorkoutsScope"),
    },
    {
      label: t("me.zones.impactPlan"),
      value: openPlan
        ? t("me.zones.impactPlanScope", { count: planSessionCount })
        : t("me.zones.impactPlanNone"),
    },
    {
      label: t("me.zones.impactCalculators"),
      value: t("me.zones.impactCalculatorsScope"),
    },
    {
      label: t("me.zones.impactExports"),
      value: t("me.zones.impactExportsScope"),
    },
  ];

  return (
    <aside className="space-y-7 lg:border-l lg:border-border lg:pl-7">
      <div>
        <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
          {t("me.zones.impactTitle")}
        </h2>
        <div className="mt-3 flex flex-col">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-baseline justify-between gap-3 py-2.5 border-t border-border",
                i === rows.length - 1 && "border-b",
              )}
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t("me.zones.impactNote")}
        </p>
      </div>

      <div className="border-t border-border pt-5">
        <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
          {t("me.zones.historyTitle")}
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {t("me.zones.historyEmpty")}
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-col font-mono text-xs">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-baseline justify-between gap-3 py-2.5 border-t border-border"
                >
                  <span className="text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString(
                      isEnglish ? "en-GB" : "fr-FR",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                  <span className="text-foreground">
                    {t("me.zones.historyVma", { value: entry.derivedVma })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-14 items-end gap-1.5" aria-hidden>
              {[...history].reverse().map((entry, i, all) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex-1",
                    i === all.length - 1 ? zoneClass(2, "bg") : zoneClass(1, "bg"),
                  )}
                  style={{
                    height: `${Math.round(((entry.derivedVma ?? 0) / historyMax) * 100)}%`,
                  }}
                />
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              {t("me.zones.historyNote")}
            </p>
          </>
        )}
      </div>

      <div className="border border-border p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {t("me.zones.privacyNote")}
      </div>
    </aside>
  );
}

function ValuesAndZonesSection({
  profile,
  onSave,
}: {
  profile: RunnerProfile | null;
  onSave: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();
  const zoneSessionCounts = useZoneSessionCounts();

  const [fcMax, setFcMax] = useState("");
  const [vma, setVma] = useState("");
  const [weeklyKm, setWeeklyKm] = useState("");
  const [longRunKm, setLongRunKm] = useState("");
  const [runnerLevel, setRunnerLevel] = useState("");
  const [vmaWarningDismissed, setVmaWarningDismissed] = useState(false);
  const [zonesRefreshKey, setZonesRefreshKey] = useState(0);

  // Sync from profile when it changes
  useEffect(() => {
    if (!profile) return;
    setFcMax(profile.fcMax != null ? String(profile.fcMax) : "");
    setVma(profile.vma != null ? String(profile.vma) : "");
    setWeeklyKm(
      profile.currentWeeklyKm != null ? String(profile.currentWeeklyKm) : "",
    );
    setLongRunKm(
      profile.currentLongRunKm != null ? String(profile.currentLongRunKm) : "",
    );
    setRunnerLevel(profile.runnerLevel ?? "");
  }, [profile]);

  const parsedFcMax = fcMax !== "" ? Number(fcMax) : undefined;
  const parsedVma = vma !== "" ? Number(vma) : undefined;
  const parsedWeekly = weeklyKm !== "" ? Number(weeklyKm) : undefined;
  const parsedLong = longRunKm !== "" ? Number(longRunKm) : undefined;

  const fcMaxError =
    parsedFcMax !== undefined && (parsedFcMax < 100 || parsedFcMax > 250);
  const vmaError = parsedVma !== undefined && (parsedVma < 8 || parsedVma > 30);
  const weeklyError =
    parsedWeekly !== undefined && (parsedWeekly < 0 || parsedWeekly > 500);
  const longError =
    parsedLong !== undefined && (parsedLong < 0 || parsedLong > 200);

  const hasError = fcMaxError || vmaError || weeklyError || longError;

  // Soft, non-blocking warning: a VMA above 20 km/h is a very high level —
  // often a sign the value was entered in the wrong unit. Still inside the
  // hard 8-30 bounds, so it never blocks saving.
  const vmaSuspicious =
    parsedVma !== undefined &&
    !vmaError &&
    parsedVma > 20 &&
    !vmaWarningDismissed;

  function handleSave() {
    if (hasError) return;
    const updated: RunnerProfile = {
      ...(profile ?? {
        version: 1 as const,
        performanceReferences: {},
        benchmarks: [],
        personalRecords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      fcMax: parsedFcMax,
      vma: parsedVma,
      currentWeeklyKm: parsedWeekly,
      currentLongRunKm: parsedLong,
      runnerLevel: (runnerLevel || undefined) as Difficulty | undefined,
    };
    saveRunnerProfile(updated);
    // Recomputes the zone table from the new values; manual overrides survive
    // because `saveUserZonePrefs` merges onto what is already stored.
    if (parsedFcMax !== undefined || parsedVma !== undefined) {
      saveUserZonePrefs({ fcMax: parsedFcMax, vma: parsedVma });
    }
    onSave(loadRunnerProfile()!);
    setZonesRefreshKey((n) => n + 1);
    toast.success(t("base.saved"));
  }

  const prefs = loadUserZonePrefs();
  const hasZoneBasis =
    prefs !== null && (prefs.vma !== undefined || prefs.fcMax !== undefined);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-10">
        {/* ── Values ─────────────────────────────────────────────── */}
        <div className="grid gap-7 sm:grid-cols-2">
          <BigValueField
            label={t("base.vma")}
            unit={t("base.vmaUnit")}
            value={vma}
            onChange={(v) => {
              setVma(v);
              setVmaWarningDismissed(false);
            }}
            min={8}
            max={30}
            step={0.1}
            accent
            error={vmaError}
            errorText={t("base.vmaError")}
            hint={
              <Link to="/calculators/vma" className="underline underline-offset-2">
                {t("me.zones.vmaFromTime")}
              </Link>
            }
          />
          <BigValueField
            label={t("base.fcMax")}
            unit={t("base.fcMaxUnit")}
            value={fcMax}
            onChange={setFcMax}
            min={100}
            max={250}
            error={fcMaxError}
            errorText={t("base.fcMaxError")}
            hint={t("me.zones.fcMaxHint")}
          />
          <BigValueField
            label={t("base.weeklyKm")}
            unit={t("base.weeklyKmUnit")}
            value={weeklyKm}
            onChange={setWeeklyKm}
            min={0}
            max={500}
            error={weeklyError}
            errorText={t("base.weeklyKmError")}
            hint={t("me.zones.weeklyKmHint")}
          />
          <BigValueField
            label={t("base.longRunKm")}
            unit={t("base.longRunKmUnit")}
            value={longRunKm}
            onChange={setLongRunKm}
            min={0}
            max={200}
            error={longError}
            errorText={t("base.longRunKmError")}
            hint={t("me.zones.longRunKmHint")}
          />
        </div>

        {vmaSuspicious && (
          <div className={cn("border-2 p-4 space-y-2", zoneClass(3, "border"))}>
            <p className="text-sm text-foreground">
              {t("me.zones.suspiciousVma", { value: parsedVma })}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVmaWarningDismissed(true)}
            >
              {t("me.zones.keepValue", { value: parsedVma })}
            </Button>
          </div>
        )}

        <div className="max-w-sm">
          <label className="block font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
            {t("base.runnerLevel")}
          </label>
          <Select value={runnerLevel} onValueChange={setRunnerLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("base.selectLevel")} />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_KEYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {pickLang(DIFFICULTY_META[d], "label")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={handleSave} disabled={hasError}>
            <Save className="size-4 mr-2" />
            {t("me.zones.save")}
          </Button>
          <p className="font-mono text-[11px] text-muted-foreground">
            {t("me.zones.autoSaved")}
          </p>
        </div>

        {/* ── Zone model ─────────────────────────────────────────── */}
        <div className="border-t-2 border-foreground pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("me.zones.modelTitle")}
            </h2>
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("me.zones.modelHint")}
              {" · "}
              <Link to="/methodology" className="underline underline-offset-2">
                {t("me.zones.modelLink")}
              </Link>
            </p>
          </div>

          <div className="mt-6">
            {hasZoneBasis ? (
              <ZoneAdjustmentPanel
                key={zonesRefreshKey}
                prefs={prefs}
                onChange={() => setZonesRefreshKey((n) => n + 1)}
                zoneSessionCounts={zoneSessionCounts}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("me.dashboard.zonesEmpty")}
              </p>
            )}
          </div>
        </div>

        <PaceCalculator />
      </div>

      <ImpactRail profile={profile} zoneSessionCounts={zoneSessionCounts} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: PerformanceReferencesSection
// ---------------------------------------------------------------------------

function ReferenceRow({
  distance,
  initialRef,
  onSave,
  onClear,
}: {
  distance: RaceDistance;
  initialRef?: { totalSeconds: number; date?: string; label?: string };
  onSave: (
    distance: RaceDistance,
    data: { totalSeconds: number; date?: string; label?: string },
  ) => void;
  onClear: (distance: RaceDistance) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();
  const meta = RACE_DISTANCE_META[distance];

  const init = timeToFields(initialRef?.totalSeconds);
  const [hours, setHours] = useState(init.h);
  const [minutes, setMinutes] = useState(init.m);
  const [seconds, setSeconds] = useState(init.s);
  const [date, setDate] = useState(initialRef?.date ?? "");
  const [label, setLabel] = useState(initialRef?.label ?? "");

  // Re-sync if parent profile changes
  useEffect(() => {
    const f = timeToFields(initialRef?.totalSeconds);
    setHours(f.h);
    setMinutes(f.m);
    setSeconds(f.s);
    setDate(initialRef?.date ?? "");
    setLabel(initialRef?.label ?? "");
  }, [initialRef?.totalSeconds, initialRef?.date, initialRef?.label]);

  const totalSec = fieldsToSeconds(hours, minutes, seconds);

  function handleSave() {
    if (totalSec <= 0) return;
    onSave(distance, {
      totalSeconds: totalSec,
      date: date || undefined,
      label: label || undefined,
    });
  }

  return (
    <div className="border-2 border-foreground p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{pickLang(meta, "label")}</span>
        {initialRef && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClear(distance)}
            aria-label={t("references.clear")}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            {t("references.time")}
          </label>
          <TimeInputs
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            onHoursChange={setHours}
            onMinutesChange={setMinutes}
            onSecondsChange={setSeconds}
            hLabel={t("references.hours")}
            mLabel={t("references.minutes")}
            sLabel={t("references.seconds")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t("references.date")}
            </label>
            <DateInput
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={TODAY_ISO}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t("references.label")}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("references.labelPlaceholder")}
              className={cn(INPUT_CLASS, "border-input focus-visible:ring-ring/50")}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleSave} disabled={totalSec <= 0}>
          <Save className="size-4 mr-2" />
          {t("references.save")}
        </Button>
      </div>
    </div>
  );
}

function PerformanceReferencesSection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");

  function handleSaveRef(
    distance: RaceDistance,
    data: { totalSeconds: number; date?: string; label?: string },
  ) {
    setPerformanceReference(distance, data);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("references.saved"));
  }

  function handleClear(distance: RaceDistance) {
    removePerformanceReference(distance);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("references.cleared"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="size-5" />
          {t("references.title")}
        </CardTitle>
        <CardDescription>{t("references.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {RACE_DISTANCES.map((distance) => (
          <ReferenceRow
            key={distance}
            distance={distance}
            initialRef={profile?.performanceReferences[distance]}
            onSave={handleSaveRef}
            onClear={handleClear}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: BenchmarkHistorySection
// ---------------------------------------------------------------------------

function BenchmarkHistorySection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bmType, setBmType] = useState<BenchmarkType>("half_cooper");
  const [bmDate, setBmDate] = useState(TODAY_ISO);
  const [bmResult, setBmResult] = useState("");
  const [bmNotes, setBmNotes] = useState("");

  const benchmarks = [...(profile?.benchmarks ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  function resetDialog() {
    setBmType("half_cooper");
    setBmDate(TODAY_ISO);
    setBmResult("");
    setBmNotes("");
  }

  function handleAdd() {
    const result = Number(bmResult);
    if (!result || result <= 0) return;
    const derived = deriveVma(bmType, result);
    addBenchmark({
      type: bmType,
      date: bmDate,
      result,
      derivedVma: derived,
      notes: bmNotes || undefined,
    });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.added"));
    setDialogOpen(false);
    resetDialog();
  }

  function handleDelete(id: string) {
    deleteBenchmark(id);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.deleted"));
  }

  function handleUseVma(vma: number) {
    updateBaseData({ vma });
    saveUserZonePrefs({ vma });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.vmaUpdated", { vma }));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              {t("benchmarks.title")}
            </CardTitle>
            <CardDescription>{t("benchmarks.description")}</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetDialog();
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            {t("benchmarks.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {benchmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("benchmarks.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {benchmarks.map((bm) => (
              <BenchmarkCard
                key={bm.id}
                benchmark={bm}
                onDelete={handleDelete}
                onUseVma={handleUseVma}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("benchmarks.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("benchmarks.type")}
              </label>
              <Select
                value={bmType}
                onValueChange={(v) => setBmType(v as BenchmarkType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("benchmarks.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {BENCHMARK_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {t(`benchmarks.types.${bt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("benchmarks.date")}
              </label>
              <DateInput
                value={bmDate}
                onChange={(e) => setBmDate(e.target.value)}
                max={TODAY_ISO}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("benchmarks.result")}
                {t(`benchmarks.resultUnits.${bmType}`) && (
                  <span className="text-muted-foreground font-normal ml-1">
                    ({t(`benchmarks.resultUnits.${bmType}`)})
                  </span>
                )}
              </label>
              <input
                type="number"
                min={0}
                step={bmType === "lab_test" ? 0.1 : 1}
                value={bmResult}
                onChange={(e) => setBmResult(e.target.value)}
                placeholder={t(`benchmarks.resultPlaceholders.${bmType}`)}
                className={cn(
                  INPUT_CLASS,
                  "border-input focus-visible:ring-ring/50",
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("benchmarks.notes")}
              </label>
              <input
                type="text"
                value={bmNotes}
                onChange={(e) => setBmNotes(e.target.value)}
                placeholder={t("benchmarks.notesPlaceholder")}
                className={cn(
                  INPUT_CLASS,
                  "border-input focus-visible:ring-ring/50",
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("benchmarks.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!bmResult || Number(bmResult) <= 0}
            >
              <Save className="size-4 mr-2" />
              {t("benchmarks.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function BenchmarkCard({
  benchmark,
  onDelete,
  onUseVma,
}: {
  benchmark: BenchmarkEntry;
  onDelete: (id: string) => void;
  onUseVma: (vma: number) => void;
}) {
  const { t } = useTranslation("profile");

  return (
    <div className="border-2 border-foreground p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {t(`benchmarks.types.${benchmark.type}`)}
          </Badge>
          <span className="text-sm text-muted-foreground">{benchmark.date}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(benchmark.id)}
          aria-label={t("benchmarks.delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="mt-2 text-sm">
        <span className="font-medium">{benchmark.result}</span>
        {t(`benchmarks.resultUnits.${benchmark.type}`) && (
          <span className="text-muted-foreground ml-1">
            {t(`benchmarks.resultUnits.${benchmark.type}`)}
          </span>
        )}
      </div>
      {benchmark.derivedVma && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm">
            {t("benchmarks.derivedVma")}: {benchmark.derivedVma} km/h
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUseVma(benchmark.derivedVma!)}
          >
            {t("benchmarks.useVma")}
          </Button>
        </div>
      )}
      {benchmark.notes && (
        <p className="mt-1 text-xs text-muted-foreground">{benchmark.notes}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: PersonalRecordsSection
// ---------------------------------------------------------------------------

function PersonalRecordsSection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [prDistance, setPrDistance] = useState<string>("10K");
  const [prCustom, setPrCustom] = useState("");
  const [prHours, setPrHours] = useState("");
  const [prMinutes, setPrMinutes] = useState("");
  const [prSeconds, setPrSeconds] = useState("");
  const [prDate, setPrDate] = useState("");
  const [prLabel, setPrLabel] = useState("");

  // Sort records by RACE_DISTANCE_META order, custom distances last
  const records = [...(profile?.personalRecords ?? [])].sort((a, b) => {
    const aIdx = RACE_DISTANCES.indexOf(a.distance as RaceDistance);
    const bIdx = RACE_DISTANCES.indexOf(b.distance as RaceDistance);
    const aOrder = aIdx >= 0 ? aIdx : 999;
    const bOrder = bIdx >= 0 ? bIdx : 999;
    return aOrder - bOrder;
  });

  function resetDialog() {
    setPrDistance("10K");
    setPrCustom("");
    setPrHours("");
    setPrMinutes("");
    setPrSeconds("");
    setPrDate("");
    setPrLabel("");
  }

  function handleAdd() {
    const totalSec = fieldsToSeconds(prHours, prMinutes, prSeconds);
    if (totalSec <= 0) return;
    const distance = prDistance === "other" ? prCustom : prDistance;
    if (!distance) return;
    addPersonalRecord({
      distance,
      timeSeconds: totalSec,
      date: prDate || undefined,
      label: prLabel || undefined,
      provenance: "manual",
    });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("records.added"));
    setDialogOpen(false);
    resetDialog();
  }

  function handleDelete(index: number) {
    deletePersonalRecord(index);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("records.deleted"));
  }

  // We need the original index for deletion (since we sort for display)
  // Map sorted records back to their original indices
  const originalRecords = profile?.personalRecords ?? [];
  const sortedWithIndex = records.map((r) => ({
    record: r,
    originalIndex: originalRecords.indexOf(r),
  }));

  function getDistanceLabel(distance: string): string {
    const meta = RACE_DISTANCE_META[distance as RaceDistance];
    if (meta) return pickLang(meta, "label");
    return distance;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              {t("records.title")}
            </CardTitle>
            <CardDescription>{t("records.description")}</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetDialog();
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            {t("records.add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedWithIndex.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("records.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {sortedWithIndex.map(({ record, originalIndex }) => (
              <div
                key={`${record.distance}-${originalIndex}`}
                className="border-2 border-foreground p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {getDistanceLabel(record.distance)}
                    </span>
                    <Badge variant="outline">
                      {t(`records.provenances.${record.provenance}`)}
                    </Badge>
                  </div>
                  <div className="text-sm mt-1">
                    {formatTime(record.timeSeconds)}
                    {record.date && (
                      <span className="text-muted-foreground ml-2">
                        {record.date}
                      </span>
                    )}
                    {record.label && (
                      <span className="text-muted-foreground ml-2">
                        &middot; {record.label}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(originalIndex)}
                  aria-label={t("records.delete")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("records.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("records.distance")}
              </label>
              <Select value={prDistance} onValueChange={setPrDistance}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("records.selectDistance")} />
                </SelectTrigger>
                <SelectContent>
                  {RACE_DISTANCES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {pickLang(RACE_DISTANCE_META[d], "label")}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    {t("records.customDistance")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {prDistance === "other" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("records.customDistance")}
                </label>
                <input
                  type="text"
                  value={prCustom}
                  onChange={(e) => setPrCustom(e.target.value)}
                  placeholder={t("records.customDistancePlaceholder")}
                  className={cn(
                    INPUT_CLASS,
                    "border-input focus-visible:ring-ring/50",
                  )}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("records.time")}
              </label>
              <TimeInputs
                hours={prHours}
                minutes={prMinutes}
                seconds={prSeconds}
                onHoursChange={setPrHours}
                onMinutesChange={setPrMinutes}
                onSecondsChange={setPrSeconds}
                hLabel={t("records.hours")}
                mLabel={t("records.minutes")}
                sLabel={t("records.seconds")}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("records.date")}
              </label>
              <DateInput
                value={prDate}
                onChange={(e) => setPrDate(e.target.value)}
                max={TODAY_ISO}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t("records.label")}
              </label>
              <input
                type="text"
                value={prLabel}
                onChange={(e) => setPrLabel(e.target.value)}
                placeholder={t("records.labelPlaceholder")}
                className={cn(
                  INPUT_CLASS,
                  "border-input focus-visible:ring-ring/50",
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("records.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                fieldsToSeconds(prHours, prMinutes, prSeconds) <= 0 ||
                (prDistance === "other" && !prCustom.trim())
              }
            >
              <Save className="size-4 mr-2" />
              {t("records.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function MeZonesPage() {
  const { t } = useTranslation("profile");
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam && SECONDARY_TABS.includes(tabParam) ? tabParam : "base";

  const [profile, setProfile] = useState<RunnerProfile | null>(null);

  useEffect(() => {
    const existedBefore =
      localStorage.getItem("zoned-runner-profile") !== null;
    const p = getRunnerProfileOrMigrate();
    if (p) {
      setProfile(p);
      if (!existedBefore) toast.success(t("base.migrated"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadProfile = () => {
    const updated = loadRunnerProfile();
    if (updated) setProfile(updated);
  };

  return (
    <>
      <SEOHead
        title={t("me.zones.seoTitle")}
        description={t("me.zones.seoDescription")}
        noindex={true}
      />
      <div className="py-8 max-w-6xl mx-auto">
        <p className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">
          <Link to="/me" className="underline underline-offset-2">
            {t("me.zones.breadcrumb")}
          </Link>
          {" · "}
          {t("me.zones.here")}
        </p>
        <div className="flex items-center gap-3 mb-2 mt-3">
          <UserRound className="size-7 text-primary shrink-0" />
          <EditorialTitle as="h1" size="md">{t("title")}</EditorialTitle>
        </div>
        <FadeUp as="p" delay={0.1} className="text-muted-foreground mb-6">
          {t("description")}
        </FadeUp>

        <Tabs defaultValue={initialTab}>
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 mb-6">
            <TabsTrigger value="base">{t("tabs.base")}</TabsTrigger>
            <TabsTrigger value="references">{t("tabs.references")}</TabsTrigger>
            <TabsTrigger value="benchmarks">{t("tabs.benchmarks")}</TabsTrigger>
            <TabsTrigger value="records">{t("tabs.records")}</TabsTrigger>
            <TabsTrigger value="commute">{t("tabs.commute")}</TabsTrigger>
          </TabsList>

          <TabsContent value="base">
            <ValuesAndZonesSection
              profile={profile}
              onSave={(p) => setProfile(p)}
            />
          </TabsContent>

          <TabsContent value="references">
            <PerformanceReferencesSection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="benchmarks">
            <BenchmarkHistorySection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="records">
            <PersonalRecordsSection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="commute">
            <CommuteSection />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
