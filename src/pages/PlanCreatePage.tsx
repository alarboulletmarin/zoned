import { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Timer,
  Route,
  Flag,
  Target,
  Mountain,
  Loader2,
  Heart,
  Footprints,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { useCreatePlan } from "@/hooks/usePlans";
import { loadUserZonePrefs } from "@/lib/zones";
import {
  PHASE_META,
  RACE_DISTANCE_META,
  type RaceDistance,
  type AssistedPlanConfig,
  type PlanPurpose,
  type TrainingGoal,
  type IntermediateGoal,
  type RacePriority,
} from "@/types/plan";
import type { Difficulty, UserZonePreferences } from "@/types";
import { DIFFICULTY_META } from "@/types";
import { PhaseZoneBar } from "@/components/domain/PrebuiltPlanCard";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { usePickLang, formatDate } from "@/lib/i18n-utils";
import { DateInput } from "@/components/ui/date-input";
import { addWeeksToDate, buildRacePlanDateRange, calculateWeeksBetweenDates } from "@/lib/planDates";
import { RECOMMENDED_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import { previewPlanShape, type PlanShapePreview } from "@/lib/planGenerator/preview";
import { validateIntermediateGoals, sortIntermediateGoals } from "@/lib/intermediateGoalValidation";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { usePlanDraft } from "./plan-create/usePlanDraft";

// ── Constants ────────────────────────────────────────────────────────

/**
 * Four named tabs, not twelve sequential screens. Every field the generator
 * reads is still here — they are grouped by the question they answer rather
 * than shown one per viewport, so the persistent preview column on the right
 * can react to any of them.
 */
type TabId = "goal" | "availability" | "volume" | "review";

const TABS: { id: TabId; labelKey: string }[] = [
  { id: "goal", labelKey: "tabs.goal" },
  { id: "availability", labelKey: "tabs.availability" },
  { id: "volume", labelKey: "tabs.volume" },
  { id: "review", labelKey: "tabs.review" },
];

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6, 7] as const;

/** Upper bound of the weekly-volume slider, in km. */
const WEEKLY_KM_SLIDER_MAX = 150;

/**
 * Recommended week ranges per distance — warnings, not hard blocks.
 * Single source of truth: this page used to keep its own, looser copy
 * (marathon min 12 against 14), so the wizard let through plans the generator
 * itself considers too short.
 */
const RECOMMENDED_WEEKS = RECOMMENDED_PLAN_WEEKS;

const RACE_DISTANCE_ICONS: Record<RaceDistance, React.ReactNode> = {
  "5K": <Zap className="size-4" />,
  "10K": <Timer className="size-4" />,
  semi: <Route className="size-4" />,
  marathon: <Flag className="size-4" />,
  trail_short: <Mountain className="size-4" />,
  trail: <Mountain className="size-4" />,
  ultra: <Mountain className="size-4" />,
};

const DURATION_OPTIONS = [4, 6, 8, 10, 12, 16];

const PURPOSE_OPTIONS: { value: PlanPurpose; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  {
    value: "race",
    icon: <Target className="size-4" />,
    labelKey: "purpose.race",
    descKey: "purpose.raceDesc",
  },
  {
    value: "base_building",
    icon: <TrendingUp className="size-4" />,
    labelKey: "purpose.baseBuilding",
    descKey: "purpose.baseBuildingDesc",
  },
  {
    value: "return_from_injury",
    icon: <Heart className="size-4" />,
    labelKey: "purpose.returnFromInjury",
    descKey: "purpose.returnFromInjuryDesc",
  },
  {
    value: "beginner_start",
    icon: <Footprints className="size-4" />,
    labelKey: "purpose.beginnerStart",
    descKey: "purpose.beginnerStartDesc",
  },
];

const GOAL_OPTION_KEYS: { value: TrainingGoal; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  {
    value: "finish",
    icon: <Flag className="size-4" />,
    labelKey: "goal.finish",
    descKey: "goal.finishDesc",
  },
  {
    value: "time",
    icon: <Timer className="size-4" />,
    labelKey: "goal.time",
    descKey: "goal.timeDesc",
  },
  {
    value: "compete",
    icon: <TrendingUp className="size-4" />,
    labelKey: "goal.compete",
    descKey: "goal.competeDesc",
  },
];

const PRIORITY_OPTIONS: { value: RacePriority; labelKey: string; descKey: string }[] = [
  { value: "A", labelKey: "intermediateGoals.priorityA", descKey: "intermediateGoals.priorityADesc" },
  { value: "B", labelKey: "intermediateGoals.priorityB", descKey: "intermediateGoals.priorityBDesc" },
  { value: "C", labelKey: "intermediateGoals.priorityC", descKey: "intermediateGoals.priorityCDesc" },
];

const INTERMEDIATE_GOAL_ERROR_KEYS: Record<string, string> = {
  BEFORE_START: "intermediateGoals.validation.beforeStart",
  AFTER_MAIN_RACE: "intermediateGoals.validation.afterMain",
  TOO_CLOSE_TO_MAIN: "intermediateGoals.validation.tooCloseToMain",
  TOO_CLOSE_TO_EACH_OTHER: "intermediateGoals.validation.tooCloseToOther",
  PRIORITY_A_IN_TAPER_ZONE: "intermediateGoals.validation.priorityAInTaper",
  INVALID_DATE: "intermediateGoals.validation.invalidDate",
  DISTANCE_TOO_LONG_FOR_PRIORITY: "intermediateGoals.validation.distanceTooLongForPriority",
  DISTANCE_LONGER_THAN_MAIN: "intermediateGoals.validation.distanceLongerThanMain",
};

// ── Helpers ──────────────────────────────────────────────────────────

function getTodayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function suggestLevel(vma: number): Difficulty {
  if (vma < 12) return "beginner";
  if (vma <= 15) return "intermediate";
  if (vma <= 18) return "advanced";
  return "elite";
}

function formatPace(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = Math.round(totalSeconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function parsePaceToSeconds(paceStr: string): number | null {
  const match = paceStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const min = parseInt(match[1], 10);
  const sec = parseInt(match[2], 10);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

function estimateFinishTime(
  paceSecondsPerKm: number,
  distanceKm: number
): string {
  const totalSeconds = paceSecondsPerKm * distanceKm;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}min${seconds.toString().padStart(2, "0")}s`;
  }
  return `${minutes}min${seconds.toString().padStart(2, "0")}s`;
}

function parseFinishTimeToSeconds(timeStr: string): number | null {
  // Supports H:MM:SS, H:MM, HH:MM:SS, HH:MM, MM:SS (if no hours)
  const full = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (full) {
    const h = parseInt(full[1], 10);
    const m = parseInt(full[2], 10);
    const s = parseInt(full[3], 10);
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }
  const short = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (short) {
    const a = parseInt(short[1], 10);
    const b = parseInt(short[2], 10);
    if (b >= 60) return null;
    // If a >= 1 and context suggests hours (for marathon-type distances), treat as H:MM
    // We always treat as H:MM if a < 60
    return a * 3600 + b * 60;
  }
  return null;
}

function finishTimeToPaceSeconds(finishTimeSeconds: number, distanceKm: number): number {
  return finishTimeSeconds / distanceKm;
}

function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Form state type ──────────────────────────────────────────────────

interface FormState {
  planPurpose: PlanPurpose;
  trainingGoal: TrainingGoal;
  raceDistance: RaceDistance | null;
  raceDate: string;
  startDate: string;
  useCustomStartDate: boolean;
  raceName: string;
  runnerLevel: Difficulty | null;
  daysPerWeek: number;
  longRunDay: number;
  targetPace: string;
  elevationGain: string;
  totalWeeksOverride: number;
  currentWeeklyKm: string;   // User's current weekly volume
  currentLongRunKm: string;  // User's current longest run
  includeStrength: boolean;
  strengthFrequency: 1 | 2 | 3;
  intermediateGoals: IntermediateGoal[];
}

// ── Component ────────────────────────────────────────────────────────

export function PlanCreatePage() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const { createPlan, isGenerating, error } = useCreatePlan();

  const [tabIndex, setTabIndex] = useState(0);
  const [paceInputMode, setPaceInputMode] = useState<"pace" | "time">("pace");
  const [targetFinishTime, setTargetFinishTime] = useState("");
  const todayDate = useMemo(() => getTodayDateInputValue(), []);
  const [form, setForm] = useState<FormState>(() => {
    const rp = loadRunnerProfile();
    return {
      planPurpose: "race",
      trainingGoal: "time",
      raceDistance: null,
      raceDate: "",
      startDate: todayDate,
      useCustomStartDate: false,
      raceName: "",
      runnerLevel: rp?.runnerLevel ?? null,
      daysPerWeek: 4,
      longRunDay: 6,
      targetPace: "",
      elevationGain: "",
      totalWeeksOverride: 0,
      currentWeeklyKm: rp?.currentWeeklyKm != null ? String(rp.currentWeeklyKm) : "",
      currentLongRunKm: rp?.currentLongRunKm != null ? String(rp.currentLongRunKm) : "",
      includeStrength: false,
      strengthFrequency: 2,
      intermediateGoals: [],
    };
  });

  // Auto-save the wizard so a closed tab / hard reload doesn't lose progress.
  // Persistence stops when the plan is finalized; the banner appears on mount
  // when a previous draft is found and lets the user resume or start fresh.
  const { hasDraft, restoreDraft, clearDraft, finalize } = usePlanDraft<FormState>(
    form,
    setForm,
    tabIndex,
    setTabIndex,
  );

  // Load user zone preferences for VMA suggestion
  const userPrefs: UserZonePreferences | null = useMemo(
    () => loadUserZonePrefs(),
    []
  );

  const isRacePlan = form.planPurpose === "race";
  const currentTab = TABS[tabIndex]?.id ?? "goal";

  // ── Derived values ───────────────────────────────────────────────

  const weeksCount = useMemo(
    () => (form.raceDate ? calculateWeeksBetweenDates(form.startDate || todayDate, form.raceDate) : 0),
    [form.raceDate, form.startDate, todayDate]
  );

  const recommendedWeeks = useMemo(() => {
    return RECOMMENDED_WEEKS[form.raceDistance ?? "10K"] ?? RECOMMENDED_WEEKS["10K"];
  }, [form.raceDistance]);

  const minWeeksForDistance = recommendedWeeks.min;

  // Valid if enough weeks (min is a hard constraint, max is just a warning)
  const dateValid = weeksCount >= minWeeksForDistance;
  const dateTooLong = weeksCount > recommendedWeeks.max;

  const minDate = useMemo(() => {
    return addWeeksToDate(form.startDate || todayDate, minWeeksForDistance);
  }, [form.startDate, minWeeksForDistance, todayDate]);

  const paceSeconds = useMemo(
    () => parsePaceToSeconds(form.targetPace),
    [form.targetPace]
  );

  const suggestedLevel = useMemo(
    () => (userPrefs?.vma ? suggestLevel(userPrefs.vma) : null),
    [userPrefs]
  );

  const distanceKm = form.raceDistance
    ? RACE_DISTANCE_META[form.raceDistance].distanceKm
    : 0;

  const intermediateGoalValidation = useMemo(() => {
    if (form.intermediateGoals.length === 0 || !form.raceDate) return { valid: true, errors: [] };
    return validateIntermediateGoals(
      form.intermediateGoals,
      form.raceDate,
      form.startDate || todayDate,
      form.raceDistance ?? "10K",
    );
  }, [form.intermediateGoals, form.raceDate, form.startDate, form.raceDistance, todayDate]);

  const parsedWeeklyKm = form.currentWeeklyKm
    ? parseInt(form.currentWeeklyKm, 10)
    : undefined;
  // A number field still accepts "e" and "-", so the parse can come back NaN.
  const currentWeeklyKmValue = Number.isFinite(parsedWeeklyKm as number)
    ? parsedWeeklyKm
    : undefined;
  // The slider is a view on the same value: clamped, never NaN.
  const weeklyKmSliderValue = Math.min(
    WEEKLY_KM_SLIDER_MAX,
    Math.max(0, currentWeeklyKmValue ?? 0)
  );

  // ── Live plan shape preview ──────────────────────────────────────
  // Recomputed on every keystroke from whatever the form already knows —
  // no session is built, only the phase split and the volume envelope.

  const preview: PlanShapePreview | null = useMemo(
    () =>
      previewPlanShape({
        planPurpose: form.planPurpose,
        totalWeeks: isRacePlan ? weeksCount : form.totalWeeksOverride,
        raceDistance: form.raceDistance,
        runnerLevel: form.runnerLevel,
        daysPerWeek: form.daysPerWeek,
        trainingGoal: form.trainingGoal,
        currentWeeklyKm: currentWeeklyKmValue,
        targetPaceMinKm: paceSeconds ? paceSeconds / 60 : undefined,
        vma: userPrefs?.vma,
      }),
    [
      form.planPurpose,
      form.raceDistance,
      form.runnerLevel,
      form.daysPerWeek,
      form.trainingGoal,
      form.totalWeeksOverride,
      isRacePlan,
      weeksCount,
      currentWeeklyKmValue,
      paceSeconds,
      userPrefs,
    ]
  );

  // Everything the plan is missing or that deserves a second look, in one list.
  const watchItems = useMemo(() => {
    const items: string[] = [];
    if (isRacePlan && !form.raceDistance) items.push(t("preview.watch.missingDistance"));
    if (isRacePlan && !form.raceDate) items.push(t("preview.watch.missingDate"));
    if (isRacePlan && form.raceDate && !dateValid) {
      items.push(t("preview.watch.tooSoon", { min: minWeeksForDistance }));
    }
    if (isRacePlan && dateTooLong) {
      items.push(t("preview.watch.tooLong", { weeks: weeksCount, max: recommendedWeeks.max }));
    }
    if (!isRacePlan && form.totalWeeksOverride <= 0) items.push(t("preview.watch.missingDuration"));
    if (!form.runnerLevel) items.push(t("preview.watch.missingLevel"));
    if (!intermediateGoalValidation.valid) items.push(t("preview.watch.intermediateGoals"));
    if (!form.currentWeeklyKm) items.push(t("preview.watch.noVolume"));
    if (preview && currentWeeklyKmValue && preview.peakWeeklyKm > currentWeeklyKmValue * 1.8) {
      items.push(
        t("preview.watch.bigJump", {
          peak: preview.peakWeeklyKm,
          current: currentWeeklyKmValue,
        })
      );
    }
    if (preview && preview.demandFactor > 1.05) items.push(t("preview.watch.ambitiousPace"));
    return items;
  }, [
    isRacePlan,
    form.raceDistance,
    form.raceDate,
    form.totalWeeksOverride,
    form.runnerLevel,
    form.currentWeeklyKm,
    dateValid,
    dateTooLong,
    weeksCount,
    minWeeksForDistance,
    recommendedWeeks.max,
    intermediateGoalValidation.valid,
    preview,
    currentWeeklyKmValue,
    t,
  ]);

  const canGenerate =
    !!form.runnerLevel &&
    (isRacePlan
      ? !!form.raceDistance && !!form.raceDate && dateValid && intermediateGoalValidation.valid
      : form.totalWeeksOverride > 0) &&
    (form.targetPace === "" || !!paceSeconds);

  // ── Submit handler ───────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!form.runnerLevel) return;
    if (isRacePlan && (!form.raceDistance || !form.raceDate)) return;

    const effectiveRaceDate = form.raceDate
      || new Date(Date.now() + 86400000 * 7 * (form.totalWeeksOverride || 12)).toISOString();

    const config: AssistedPlanConfig = {
      id: generateId(),
      raceDistance: form.raceDistance ?? "10K",
      raceDate: effectiveRaceDate,
      raceName: form.raceName || undefined,
      runnerLevel: form.runnerLevel,
      daysPerWeek: form.daysPerWeek,
      longRunDay: form.longRunDay,
      vma: userPrefs?.vma,
      targetPaceMinKm: paceSeconds ? paceSeconds / 60 : undefined,
      elevationGain: form.elevationGain
        ? parseInt(form.elevationGain, 10)
        : undefined,
      createdAt: new Date().toISOString(),
      ...buildRacePlanDateRange(form.startDate, effectiveRaceDate),
      planPurpose: form.planPurpose,
      trainingGoal: form.trainingGoal,
      totalWeeksOverride: !isRacePlan ? form.totalWeeksOverride : undefined,
      currentWeeklyKm: form.currentWeeklyKm ? parseInt(form.currentWeeklyKm, 10) : undefined,
      currentLongRunKm: form.currentLongRunKm ? parseInt(form.currentLongRunKm, 10) : undefined,
      includeStrength: form.includeStrength || undefined,
      strengthFrequency: form.includeStrength ? form.strengthFrequency : undefined,
      intermediateGoals: form.intermediateGoals.length > 0
        ? sortIntermediateGoals(form.intermediateGoals)
        : undefined,
    };

    try {
      const plan = await createPlan(config);
      finalize();
      triggerStorageWarning();
      navigate(`/plan/${plan.id}`);
    } catch {
      // Error is exposed via the hook's error state
    }
  }, [form, isRacePlan, userPrefs, paceSeconds, createPlan, navigate, finalize]);

  // ── Intermediate goal editing ────────────────────────────────────

  const addIntermediateGoal = useCallback(() => {
    setForm((f) => {
      if (f.intermediateGoals.length >= 5) return f;
      const newGoal: IntermediateGoal = {
        raceDistance: "10K",
        raceDate: "",
        raceName: "",
        priority: "B",
      };
      return { ...f, intermediateGoals: [...f.intermediateGoals, newGoal] };
    });
  }, []);

  const removeIntermediateGoal = useCallback((index: number) => {
    setForm((f) => ({
      ...f,
      intermediateGoals: f.intermediateGoals.filter((_, i) => i !== index),
    }));
  }, []);

  const updateIntermediateGoal = useCallback(
    (index: number, patch: Partial<IntermediateGoal>) => {
      setForm((f) => ({
        ...f,
        intermediateGoals: f.intermediateGoals.map((g, i) =>
          i === index ? { ...g, ...patch } : g,
        ),
      }));
    },
    [],
  );

  const intermediateGoalMaxDate = useMemo(() => {
    if (!form.raceDate) return undefined;
    // 2 weeks before main race
    const d = new Date(form.raceDate);
    d.setDate(d.getDate() - 14);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, [form.raceDate]);

  // ── Tab: Objectif ────────────────────────────────────────────────

  const renderGoalTab = () => (
    <div className="space-y-8">
      <FormSection title={t("purpose.title")} description={t("purpose.subtitle")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {PURPOSE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={form.planPurpose === opt.value}
              icon={opt.icon}
              label={t(opt.labelKey)}
              description={t(opt.descKey)}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  planPurpose: opt.value,
                  // Set defaults for non-race plans
                  ...(opt.value === "beginner_start" ? { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" as TrainingGoal } : {}),
                  ...(opt.value === "return_from_injury" ? { daysPerWeek: 3, totalWeeksOverride: 10, trainingGoal: "finish" as TrainingGoal } : {}),
                  ...(opt.value === "base_building" ? { totalWeeksOverride: 12, trainingGoal: "time" as TrainingGoal } : {}),
                }))
              }
            />
          ))}
        </div>
      </FormSection>

      {isRacePlan && (
        <FormSection title={t("distance.title")} description={t("distance.subtitle")}>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => {
              const meta = RACE_DISTANCE_META[dist];
              return (
                <OptionCard
                  key={dist}
                  selected={form.raceDistance === dist}
                  icon={RACE_DISTANCE_ICONS[dist]}
                  label={pick(meta, "label")}
                  description={`${meta.distanceKm} km`}
                  onClick={() => setForm((f) => ({ ...f, raceDistance: dist }))}
                />
              );
            })}
          </div>
        </FormSection>
      )}

      {isRacePlan && (
        <FormSection
          title={t("date.title")}
          description={t("date.subtitle", { min: minWeeksForDistance })}
        >
          <div className="max-w-sm space-y-3">
            <DateInput
              min={minDate}
              value={form.raceDate}
              onChange={(e) => setForm((f) => ({ ...f, raceDate: e.target.value }))}
              aria-label={t("date.raceDate")}
              className="px-4 py-3 min-h-[44px] text-base"
            />

            <div className="space-y-2 pt-2">
              <FieldLabel>{t("date.startLabel")}</FieldLabel>
              <div className="flex gap-2">
                <Chip
                  selected={!form.useCustomStartDate}
                  className="flex-1"
                  onClick={() => setForm((f) => ({ ...f, useCustomStartDate: false, startDate: todayDate }))}
                >
                  {t("date.startNow")}
                </Chip>
                <Chip
                  selected={form.useCustomStartDate}
                  className="flex-1"
                  onClick={() => setForm((f) => ({ ...f, useCustomStartDate: true, startDate: f.startDate || todayDate }))}
                >
                  {t("date.chooseStartDate")}
                </Chip>
              </div>
              {form.useCustomStartDate && (
                <DateInput
                  value={form.startDate}
                  max={form.raceDate || undefined}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="px-4 py-3 min-h-[44px] text-base"
                />
              )}
            </div>

            {form.raceDate && dateValid && (
              <p className="font-mono text-[11px] text-muted-foreground">
                {t("date.weeks", { count: weeksCount })}
              </p>
            )}

            {form.raceDate && !dateValid && (
              <p className="font-mono text-[11px] text-poster-red">
                {t("date.tooSoon", { min: minWeeksForDistance })}
              </p>
            )}

            {form.raceDate && form.useCustomStartDate && (
              <p className="font-mono text-[11px] text-muted-foreground">
                {t("date.startHint", {
                  date: formatDate(form.startDate, { year: "numeric", month: "short", day: "numeric" }),
                })}
              </p>
            )}

            {form.raceDate && dateTooLong && (
              <WarningBox>
                <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em]">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {t("date.tooLong", { weeks: weeksCount })}
                </p>
                <p className="mt-1 text-xs leading-[1.5]">
                  {t("date.tooLongDetail", { min: recommendedWeeks.min, max: recommendedWeeks.max })}
                </p>
              </WarningBox>
            )}
          </div>
        </FormSection>
      )}

      {isRacePlan && (
        <FormSection title={t("raceName.title")} description={t("raceName.subtitle")}>
          <div className="max-w-sm">
            <Input
              type="text"
              value={form.raceName}
              onChange={(e) => setForm((f) => ({ ...f, raceName: e.target.value }))}
              placeholder={t("raceName.placeholder")}
              aria-label={t("raceName.label")}
              maxLength={100}
            />
          </div>
        </FormSection>
      )}

      {isRacePlan && (
        <FormSection
          title={t("intermediateGoals.title")}
          description={t("intermediateGoals.subtitle")}
        >
          <div className="max-w-xl space-y-3">
            {form.intermediateGoals.map((goal, idx) => {
              const goalErrors = intermediateGoalValidation.errors.filter(
                (e) => e.goalIndex === idx
              );
              return (
                <div key={idx} className="border-2 border-foreground p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => removeIntermediateGoal(idx)}
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      {t("intermediateGoals.remove")}
                    </Button>
                  </div>

                  <div>
                    <FieldLabel>{t("intermediateGoals.distance")}</FieldLabel>
                    <div className="mt-1.5 grid grid-cols-4 sm:grid-cols-7 gap-1">
                      {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => (
                        <Chip
                          key={dist}
                          selected={goal.raceDistance === dist}
                          onClick={() => updateIntermediateGoal(idx, { raceDistance: dist })}
                        >
                          {pick(RACE_DISTANCE_META[dist], "label")}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>{t("intermediateGoals.date")}</FieldLabel>
                    <DateInput
                      min={form.startDate || todayDate}
                      max={intermediateGoalMaxDate}
                      value={goal.raceDate}
                      onChange={(e) => updateIntermediateGoal(idx, { raceDate: e.target.value })}
                      className="mt-1.5 px-3 py-2 min-h-[40px] text-sm"
                    />
                  </div>

                  <div>
                    <FieldLabel>{t("intermediateGoals.name")}</FieldLabel>
                    <Input
                      type="text"
                      value={goal.raceName ?? ""}
                      onChange={(e) => updateIntermediateGoal(idx, { raceName: e.target.value })}
                      placeholder={t("intermediateGoals.namePlaceholder")}
                      className="mt-1.5"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <FieldLabel>{t("intermediateGoals.priority")}</FieldLabel>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={goal.priority === opt.value}
                          onClick={() => updateIntermediateGoal(idx, { priority: opt.value })}
                          className={cn(
                            "border-2 px-2 py-2 text-left transition-colors",
                            goal.priority === opt.value
                              ? "border-foreground bg-accent-acid/20"
                              : "border-filet hover:bg-secondary"
                          )}
                        >
                          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em]">
                            {t(opt.labelKey)}
                          </span>
                          <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                            {t(opt.descKey)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {goalErrors.length > 0 && (
                    <div className="space-y-1">
                      {goalErrors.map((err, eIdx) => {
                        const key = INTERMEDIATE_GOAL_ERROR_KEYS[err.code];
                        const isWarning =
                          err.code === "DISTANCE_TOO_LONG_FOR_PRIORITY" ||
                          err.code === "DISTANCE_LONGER_THAN_MAIN";
                        return (
                          <p
                            key={eIdx}
                            className={cn(
                              "flex items-center gap-1 font-mono text-[11px]",
                              isWarning ? "text-zone-3" : "text-poster-red"
                            )}
                          >
                            <AlertTriangle className="size-3 shrink-0" />
                            {key ? t(key) : err.message}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {form.intermediateGoals.length < 5 ? (
              <Button variant="outline" className="w-full" onClick={addIntermediateGoal}>
                <Plus className="size-4 mr-1.5" />
                {t("intermediateGoals.add")}
              </Button>
            ) : (
              <p className="font-mono text-[11px] text-muted-foreground">
                {t("intermediateGoals.maxReached")}
              </p>
            )}
          </div>
        </FormSection>
      )}

      <FormSection title={t("level.title")} description={t("level.subtitle")}>
        {userPrefs?.vma && suggestedLevel && (
          <p className="mb-3 border-l-2 border-accent-acid pl-3 font-mono text-[11px] text-muted-foreground">
            {t("level.vmaSuggestion", { vma: userPrefs.vma })}
            <span className="font-bold text-foreground">
              {pick(DIFFICULTY_META[suggestedLevel], "label")}
            </span>
            {t("level.vmaSuggestionSuffix")}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {(["beginner", "intermediate", "advanced", "elite"] as Difficulty[]).map((level) => {
            const meta = DIFFICULTY_META[level];
            return (
              <OptionCard
                key={level}
                selected={form.runnerLevel === level}
                icon={<span className="font-mono text-sm font-bold">{meta.level}</span>}
                label={pick(meta, "label")}
                description={
                  level === suggestedLevel
                    ? `${pick(meta, "desc")} — ${t("level.suggested")}`
                    : pick(meta, "desc")
                }
                onClick={() => setForm((f) => ({ ...f, runnerLevel: level }))}
              />
            );
          })}
        </div>
      </FormSection>

      <FormSection title={t("goal.title")} description={t("goal.subtitle")}>
        <div className="grid gap-2 sm:grid-cols-3">
          {GOAL_OPTION_KEYS.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={form.trainingGoal === opt.value}
              icon={opt.icon}
              label={t(opt.labelKey)}
              description={t(opt.descKey)}
              onClick={() => setForm((f) => ({ ...f, trainingGoal: opt.value }))}
            />
          ))}
        </div>
      </FormSection>
    </div>
  );

  // ── Tab: Disponibilité ───────────────────────────────────────────

  const renderAvailabilityTab = () => (
    <div className="space-y-8">
      {!isRacePlan && (
        <FormSection title={t("duration.title")} description={t("duration.subtitle")}>
          <div className="grid grid-cols-3 gap-2 max-w-xs">
            {DURATION_OPTIONS.map((weeks) => (
              <Chip
                key={weeks}
                selected={form.totalWeeksOverride === weeks}
                className="justify-center py-2"
                onClick={() => setForm((f) => ({ ...f, totalWeeksOverride: weeks }))}
              >
                {weeks} {t("duration.weeksShort")}
              </Chip>
            ))}
          </div>
        </FormSection>
      )}

      <FormSection title={t("schedule.title")} description={t("schedule.subtitle")}>
        <div className="max-w-sm space-y-6">
          <div>
            <FieldLabel>{t("schedule.sessionsPerWeek")}</FieldLabel>
            <div className="mt-2 flex gap-2">
              {DAYS_PER_WEEK_OPTIONS.filter((n) =>
                form.planPurpose === "return_from_injury" ? n <= 4
                  : form.planPurpose === "beginner_start" ? n <= 5
                    : true
              ).map((n) => (
                <Chip
                  key={n}
                  selected={form.daysPerWeek === n}
                  className="flex-1 justify-center py-2"
                  onClick={() => setForm((f) => ({ ...f, daysPerWeek: n }))}
                >
                  {n}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>{t("schedule.longRunDay")}</FieldLabel>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("schedule.longRunDayDesc")}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, idx) => (
                <Chip
                  key={idx}
                  selected={form.longRunDay === idx}
                  className="justify-center px-0 py-2"
                  onClick={() => setForm((f) => ({ ...f, longRunDay: idx }))}
                >
                  {t(`daysShort.${idx}`)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="border-t border-filet pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <label htmlFor="includeStrength" className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.08em]">
                  {t("schedule.includeStrength")}
                </label>
                <p className="text-xs leading-tight text-muted-foreground">
                  {t("schedule.includeStrengthDesc")}
                </p>
              </div>
              <Switch
                id="includeStrength"
                checked={form.includeStrength}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, includeStrength: !!checked }))
                }
              />
            </div>

            {form.includeStrength && (
              <div className="mt-3">
                <FieldLabel>{t("schedule.strengthFrequency")}</FieldLabel>
                <div className="mt-2 flex gap-2">
                  {([1, 2, 3] as const).map((n) => (
                    <Chip
                      key={n}
                      selected={form.strengthFrequency === n}
                      className="flex-1 justify-center py-2"
                      onClick={() => setForm((f) => ({ ...f, strengthFrequency: n }))}
                    >
                      {t("schedule.strengthPerWeek", { n })}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </FormSection>
    </div>
  );

  // ── Tab: Volume ──────────────────────────────────────────────────

  const renderVolumeTab = () => (
    <div className="space-y-8">
      <FormSection title={t("fitness.title")} description={t("fitness.subtitle")}>
        <div className="max-w-sm space-y-6">
          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-[0.08em]" htmlFor="weeklyKm">
              {t("fitness.weeklyKm")}
            </label>
            <p className="mt-1 text-xs text-muted-foreground">{t("fitness.weeklyKmDesc")}</p>
            <div className="mt-3 flex items-center gap-4">
              <Slider
                className="flex-1"
                min={0}
                max={WEEKLY_KM_SLIDER_MAX}
                step={1}
                thumbLabel={t("fitness.weeklyKm")}
                thumbValueText={`${weeklyKmSliderValue} km`}
                value={[weeklyKmSliderValue]}
                onValueChange={([v]) =>
                  // 0 means "unknown", the same as an empty field: the generator
                  // then estimates the starting volume from its own tables
                  // instead of being told the runner covers zero km.
                  setForm((f) => ({ ...f, currentWeeklyKm: v === 0 ? "" : String(v) }))
                }
              />
              <Input
                id="weeklyKm"
                type="number"
                inputMode="numeric"
                min={0}
                max={300}
                placeholder={t("fitness.weeklyKmPlaceholder")}
                value={form.currentWeeklyKm}
                onChange={(e) => setForm((f) => ({ ...f, currentWeeklyKm: e.target.value }))}
                className="w-24 shrink-0"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold uppercase tracking-[0.08em]" htmlFor="longRunKm">
              {t("fitness.longRunKm")}
            </label>
            <p className="mt-1 text-xs text-muted-foreground">{t("fitness.longRunKmDesc")}</p>
            <Input
              id="longRunKm"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              placeholder={t("fitness.longRunKmPlaceholder")}
              value={form.currentLongRunKm}
              onChange={(e) => setForm((f) => ({ ...f, currentLongRunKm: e.target.value }))}
              className="mt-3"
            />
          </div>
        </div>
      </FormSection>

      {isRacePlan && (
        <FormSection title={t("pace.title")} description={t("pace.subtitle")}>
          {(form.raceDistance === "trail_short" || form.raceDistance === "trail" || form.raceDistance === "ultra") && (
            <p className="mb-3 border-l-2 border-accent-acid pl-3 font-mono text-[11px] text-muted-foreground">
              {t("pace.trailHint")}
            </p>
          )}
          <div className="max-w-sm space-y-4">
            <div className="flex gap-2">
              <Chip
                selected={paceInputMode === "pace"}
                className="flex-1 justify-center py-2"
                onClick={() => setPaceInputMode("pace")}
              >
                {t("pace.targetPaceTab")}
              </Chip>
              <Chip
                selected={paceInputMode === "time"}
                className="flex-1 justify-center py-2"
                onClick={() => setPaceInputMode("time")}
              >
                {t("pace.targetTimeTab")}
              </Chip>
            </div>

            {paceInputMode === "pace" ? (
              <div>
                <FieldLabel>{t("pace.targetPaceLabel")}</FieldLabel>
                <Input
                  type="text"
                  value={form.targetPace}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, targetPace: e.target.value }));
                    setTargetFinishTime("");
                  }}
                  placeholder="5:30"
                  className="mt-1.5"
                  error={form.targetPace && !paceSeconds ? t("pace.paceFormatError") : undefined}
                />
                {paceSeconds && distanceKm > 0 && (
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                    {t("pace.estimatedFinish")}
                    <span className="font-bold text-foreground">
                      {estimateFinishTime(paceSeconds, distanceKm)}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div>
                <FieldLabel>{t("pace.targetFinishTimeLabel")}</FieldLabel>
                <Input
                  type="text"
                  value={targetFinishTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetFinishTime(val);
                    const totalSec = parseFinishTimeToSeconds(val);
                    if (totalSec && distanceKm > 0) {
                      const paceSec = finishTimeToPaceSeconds(totalSec, distanceKm);
                      setForm((f) => ({ ...f, targetPace: formatPace(paceSec) }));
                    } else {
                      setForm((f) => ({ ...f, targetPace: "" }));
                    }
                  }}
                  placeholder={t("pace.timePlaceholder")}
                  className="mt-1.5"
                  error={
                    targetFinishTime && !parseFinishTimeToSeconds(targetFinishTime)
                      ? t("pace.timeFormatHint")
                      : undefined
                  }
                />
                {paceSeconds && distanceKm > 0 && parseFinishTimeToSeconds(targetFinishTime) && (
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                    {t("pace.requiredPace")}
                    <span className="font-bold text-foreground">
                      {formatPace(paceSeconds)} min/km
                    </span>
                  </p>
                )}
              </div>
            )}

            <div>
              <FieldLabel>{t("pace.elevation")}</FieldLabel>
              <Input
                type="number"
                value={form.elevationGain}
                onChange={(e) => setForm((f) => ({ ...f, elevationGain: e.target.value }))}
                placeholder={t("pace.elevationPlaceholder")}
                min={0}
                max={10000}
                className="mt-1.5"
              />
            </div>
          </div>
        </FormSection>
      )}
    </div>
  );

  // ── Tab: Relecture ───────────────────────────────────────────────

  const renderReviewTab = () => {
    const distMeta = form.raceDistance ? RACE_DISTANCE_META[form.raceDistance] : null;
    const levelMeta = form.runnerLevel ? DIFFICULTY_META[form.runnerLevel] : null;

    return (
      <div className="space-y-6">
        <FormSection title={t("summary.title")} description={t("summary.subtitle")}>
          <div className="border-2 border-foreground p-4 md:p-5">
            <SummaryRow
              label={t("summary.distance")}
              value={distMeta ? `${pick(distMeta, "label")} (${distMeta.distanceKm} km)` : "-"}
            />
            <SummaryRow
              label={t("summary.date")}
              value={
                form.raceDate
                  ? `${formatDate(form.raceDate)} (${weeksCount} ${t("summary.weeksShort")})`
                  : "-"
              }
            />
            <SummaryRow
              label={t("summary.startDate")}
              value={form.startDate ? formatDate(form.startDate) : "-"}
            />
            {form.raceName && (
              <SummaryRow label={t("summary.name")} value={form.raceName} />
            )}
            {form.intermediateGoals.length > 0 && (
              <div className="space-y-1.5 border-b border-filet py-2">
                <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
                  {t("intermediateGoals.title")}
                </span>
                {sortIntermediateGoals(form.intermediateGoals).map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-2 pl-2 text-sm">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase leading-none",
                      goal.priority === "A" ? "bg-zone-5 text-ink"
                        : goal.priority === "B" ? "bg-zone-4 text-ink"
                          : "bg-zone-2 text-ink"
                    )}>
                      {t(`intermediateGoals.badge.${goal.priority}`)}
                    </span>
                    <span className="font-medium">
                      {pick(RACE_DISTANCE_META[goal.raceDistance], "label")}
                    </span>
                    {goal.raceName && (
                      <span className="truncate text-muted-foreground">— {goal.raceName}</span>
                    )}
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                      {goal.raceDate ? formatDate(goal.raceDate) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <SummaryRow
              label={t("summary.level")}
              value={levelMeta ? pick(levelMeta, "label") : "-"}
            />
            <SummaryRow label={t("summary.days")} value={`${form.daysPerWeek}`} />
            {paceSeconds && (
              <SummaryRow
                label={t("summary.pace")}
                value={`${formatPace(paceSeconds)}/km → ${estimateFinishTime(paceSeconds, distanceKm)}`}
              />
            )}
            {form.elevationGain && (
              <SummaryRow label={t("summary.elevation")} value={`${form.elevationGain} m D+`} />
            )}
            <SummaryRow
              label={t("summary.goal")}
              value={
                form.trainingGoal === "finish" ? t("goal.finish")
                  : form.trainingGoal === "compete" ? t("goal.compete")
                    : t("goal.time")
              }
            />
            {!isRacePlan && (
              <SummaryRow
                label={t("summary.purpose")}
                value={
                  form.planPurpose === "base_building" ? t("summary.purposeBaseBuilding")
                    : form.planPurpose === "return_from_injury" ? t("summary.purposeReturnFromInjury")
                      : t("summary.purposeBeginnerStart")
                }
              />
            )}
            {!isRacePlan && form.totalWeeksOverride > 0 && (
              <SummaryRow
                label={t("summary.duration")}
                value={t("summary.durationValue", { weeks: form.totalWeeksOverride })}
              />
            )}
            {form.currentWeeklyKm && (
              <SummaryRow
                label={t("summary.weeklyKm")}
                value={t("summary.currentVolume", { km: form.currentWeeklyKm })}
              />
            )}
            {form.currentLongRunKm && (
              <SummaryRow
                label={t("fitness.longRunKm")}
                value={`${form.currentLongRunKm} km`}
              />
            )}
            <SummaryRow label={t("summary.longRun")} value={t(`days.${form.longRunDay}`)} />
            {form.includeStrength && (
              <SummaryRow
                label={t("summary.strengthTraining")}
                value={t("schedule.strengthPerWeek", { n: form.strengthFrequency })}
              />
            )}
          </div>
        </FormSection>

        {error && (
          <div className="border-2 border-poster-red p-3 font-mono text-[11px] text-poster-red">
            {error}
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isGenerating || !canGenerate} variant="accent">
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {t("summary.generating")}
            </>
          ) : (
            t("summary.generate")
          )}
        </Button>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
      <SEOHead
        title={t("seo.createTitle")}
        description={t("seo.createDescription")}
        canonical="/plan/create"
      />
      <div className="mx-auto max-w-6xl py-6 md:py-8">
        <div className="pb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plan/new">
              <ArrowLeft className="mr-1 size-4" />
              {t("nav.back")}
            </Link>
          </Button>
        </div>

        <h1 className="font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-3xl md:text-4xl">
          {t("createTitle")}
        </h1>

        {hasDraft && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-2 border-foreground px-4 py-3 text-sm">
            <span className="min-w-0 flex-1">
              {t("draft.found", "Un brouillon de plan a été retrouvé.")}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" onClick={restoreDraft}>
                {t("draft.restore", "Reprendre")}
              </Button>
              <Button size="sm" variant="ghost" onClick={clearDraft}>
                {t("draft.discard", "Repartir de zéro")}
              </Button>
            </div>
          </div>
        )}

        {/* Four named tabs — the high-level navigation of the wizard */}
        <nav
          aria-label={t("tabs.label")}
          className="mt-6 flex gap-5 overflow-x-auto border-b border-filet font-mono text-[11px] tracking-[0.08em] uppercase"
        >
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              aria-current={idx === tabIndex ? "step" : undefined}
              onClick={() => setTabIndex(idx)}
              className={cn(
                "-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2.5 pt-1 transition-colors",
                idx === tabIndex
                  ? "border-accent-acid text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="mr-1.5 opacity-60">{String(idx + 1).padStart(2, "0")}</span>
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {currentTab === "goal" && renderGoalTab()}
            {currentTab === "availability" && renderAvailabilityTab()}
            {currentTab === "volume" && renderVolumeTab()}
            {currentTab === "review" && renderReviewTab()}

            <div className="mt-8 flex justify-between gap-3 border-t border-filet pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTabIndex((i) => Math.max(0, i - 1))}
                disabled={tabIndex === 0}
              >
                <ArrowLeft className="size-4 mr-1" />
                {t("nav.back")}
              </Button>
              <Button
                size="sm"
                onClick={() => setTabIndex((i) => Math.min(TABS.length - 1, i + 1))}
                disabled={tabIndex === TABS.length - 1}
              >
                {t("nav.next")}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>

          <PlanPreviewPanel
            preview={preview}
            daysPerWeek={form.daysPerWeek}
            strengthPerWeek={form.includeStrength ? form.strengthFrequency : 0}
            watchItems={watchItems}
          />
        </div>
      </div>
    </>
  );
}

// ── Preview column ───────────────────────────────────────────────────

/**
 * The plan as it stands, recomputed on every change: phase split, four key
 * numbers, and everything worth a second look. Sticky on desktop, stacked
 * under the form on narrow screens.
 */
function PlanPreviewPanel({
  preview,
  daysPerWeek,
  strengthPerWeek,
  watchItems,
}: {
  preview: PlanShapePreview | null;
  daysPerWeek: number;
  strengthPerWeek: number;
  watchItems: string[];
}) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();

  return (
    <aside className="border-2 border-foreground bg-background p-5 lg:sticky lg:top-20">
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        {t("preview.title")}
      </p>

      {preview ? (
        <>
          <PhaseZoneBar
            phases={preview.phases}
            totalWeeks={preview.totalWeeks}
            className="mt-4 h-2.5"
            titleFor={(phase, weeks) =>
              `${pick(PHASE_META[phase], "label")} (${weeks})`
            }
          />
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
            {preview.phases.map((segment, idx) => (
              <span key={`${segment.phase}-${idx}`}>
                {pick(PHASE_META[segment.phase], "label")}{" "}
                {segment.endWeek - segment.startWeek + 1}
              </span>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-filet pt-5">
            <PreviewStat label={t("preview.weeks")} value={`${preview.totalWeeks}`} />
            <PreviewStat
              label={t("preview.sessionsPerWeek")}
              value={
                strengthPerWeek > 0
                  ? `${daysPerWeek} + ${strengthPerWeek}`
                  : `${daysPerWeek}`
              }
            />
            <PreviewStat label={t("preview.peakVolume")} value={`${preview.peakWeeklyKm} km`} />
            <PreviewStat label={t("preview.totalVolume")} value={`${preview.totalKm} km`} />
          </dl>
        </>
      ) : (
        <p className="mt-4 text-sm leading-[1.5] text-muted-foreground">
          {t("preview.empty")}
        </p>
      )}

      <div className="mt-5 border-t border-filet pt-5">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
          {t("preview.watchTitle")}
        </p>
        {watchItems.length > 0 ? (
          <WarningBox className="mt-2.5">
            <ul className="space-y-1.5">
              {watchItems.map((item, idx) => (
                <li key={idx} className="flex gap-1.5 text-xs leading-[1.45]">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </WarningBox>
        ) : (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            {t("preview.watchNone")}
          </p>
        )}
      </div>
    </aside>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-mono text-2xl leading-none">{value}</dd>
      <dt className="mt-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm leading-[1.5] text-muted-foreground">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em]">
      {children}
    </span>
  );
}

function OptionCard({
  selected,
  icon,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 border-2 p-3 text-left transition-colors",
        selected
          ? "border-foreground bg-accent-acid/20"
          : "border-filet hover:bg-secondary"
      )}
    >
      {icon && (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.06em]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-[1.4] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

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
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center border-2 px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] uppercase transition-colors",
        selected
          ? "border-transparent bg-accent-acid text-ink"
          : "border-foreground bg-transparent text-foreground/80 hover:bg-secondary",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Attention block — 2px zone-3 contour, no fill. */
function WarningBox({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border-2 border-zone-3 p-3", className)}>{children}</div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-filet py-2 last:border-0">
      <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
