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
  Calendar,
  Target,
  Mountain,
  CheckIcon,
  Loader2,
  Heart,
  Footprints,
  TrendingUp,
  AlertTriangle,
  Dumbbell,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { useCreatePlan } from "@/hooks/usePlans";
import { loadUserZonePrefs } from "@/lib/zones";
import {
  RACE_DISTANCE_META,
  type RaceDistance,
  type AssistedPlanConfig,
  type PlanPurpose,
  type TrainingGoal,
} from "@/types/plan";
import type { Difficulty, UserZonePreferences } from "@/types";
import { DIFFICULTY_META } from "@/types";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import { buildRacePlanDateRange, calculateWeeksBetweenDates } from "@/lib/planDates";

// ── Constants ────────────────────────────────────────────────────────

// Steps are dynamic based on plan purpose
type StepId = "purpose" | "distance" | "date" | "duration" | "race_name" | "level" | "goal" | "fitness" | "schedule" | "pace" | "summary";

const RACE_STEPS: StepId[] = ["purpose", "distance", "date", "race_name", "level", "goal", "fitness", "schedule", "pace", "summary"];
const NON_RACE_STEPS: StepId[] = ["purpose", "duration", "level", "goal", "fitness", "schedule", "summary"];

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6, 7] as const;

/** Recommended week ranges per distance — warnings, not hard blocks */
const RECOMMENDED_WEEKS: Record<string, { min: number; max: number }> = {
  "5K":         { min: 4,  max: 16 },
  "10K":        { min: 6,  max: 20 },
  semi:         { min: 8,  max: 24 },
  marathon:     { min: 12, max: 30 },
  trail_short:  { min: 8,  max: 24 },
  trail:        { min: 12, max: 36 },
  ultra:        { min: 14, max: 52 },
};

const RACE_DISTANCE_ICONS: Record<RaceDistance, React.ReactNode> = {
  "5K": <Zap className="size-5 md:size-6 text-primary" />,
  "10K": <Timer className="size-5 md:size-6 text-primary" />,
  semi: <Route className="size-5 md:size-6 text-primary" />,
  marathon: <Flag className="size-5 md:size-6 text-primary" />,
  trail_short: <Mountain className="size-5 md:size-6 text-primary" />,
  trail: <Mountain className="size-5 md:size-6 text-primary" />,
  ultra: <Mountain className="size-5 md:size-6 text-primary" />,
};

const DURATION_OPTIONS = [
  { weeks: 4 },
  { weeks: 6 },
  { weeks: 8 },
  { weeks: 10 },
  { weeks: 12 },
  { weeks: 16 },
];

const GOAL_OPTION_KEYS: { value: TrainingGoal; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  {
    value: "finish",
    icon: <Flag className="size-5 text-zone-2" />,
    labelKey: "goal.finish",
    descKey: "goal.finishDesc",
  },
  {
    value: "time",
    icon: <Timer className="size-5 text-primary" />,
    labelKey: "goal.time",
    descKey: "goal.timeDesc",
  },
  {
    value: "compete",
    icon: <TrendingUp className="size-5 text-zone-5" />,
    labelKey: "goal.compete",
    descKey: "goal.competeDesc",
  },
];

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
}

// ── Component ────────────────────────────────────────────────────────

export function PlanCreatePage() {
  const { t } = useTranslation("plan");
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const navigate = useNavigate();
  const { createPlan, isGenerating, error } = useCreatePlan();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [paceInputMode, setPaceInputMode] = useState<"pace" | "time">("pace");
  const [targetFinishTime, setTargetFinishTime] = useState("");
  const todayDate = useMemo(() => getTodayDateInputValue(), []);
  const [form, setForm] = useState<FormState>({
    planPurpose: "race",
    trainingGoal: "time",
    raceDistance: null,
    raceDate: "",
    startDate: todayDate,
    useCustomStartDate: false,
    raceName: "",
    runnerLevel: null,
    daysPerWeek: 4,
    longRunDay: 6,
    targetPace: "",
    elevationGain: "",
    totalWeeksOverride: 0,
    currentWeeklyKm: "",
    currentLongRunKm: "",
    includeStrength: false,
    strengthFrequency: 2,
  });

  // Load user zone preferences for VMA suggestion
  const userPrefs: UserZonePreferences | null = useMemo(
    () => loadUserZonePrefs(),
    []
  );

  // ── Dynamic step flow ────────────────────────────────────────────

  const isRacePlan = form.planPurpose === "race";
  const steps = isRacePlan ? RACE_STEPS : NON_RACE_STEPS;
  const currentStep = steps[stepIndex] ?? "purpose";
  const totalSteps = steps.length;

  // ── Navigation ───────────────────────────────────────────────────

  const goForward = useCallback(() => {
    setDirection("forward");
    setStepIndex((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const goBack = useCallback(() => {
    setDirection("backward");
    setStepIndex((s) => Math.max(s - 1, 0));
  }, []);

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
    const d = new Date();
    d.setDate(d.getDate() + minWeeksForDistance * 7);
    return d.toISOString().split("T")[0];
  }, [minWeeksForDistance]);

  const paceSeconds = useMemo(
    () => parsePaceToSeconds(form.targetPace),
    [form.targetPace]
  );

  const suggestedLevel = useMemo(
    () => (userPrefs?.vma ? suggestLevel(userPrefs.vma) : null),
    [userPrefs]
  );

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
    };

    try {
      const plan = await createPlan(config);
      triggerStorageWarning();
      navigate(`/plan/${plan.id}`);
    } catch {
      // Error is exposed via the hook's error state
    }
  }, [form, userPrefs, paceSeconds, createPlan, navigate]);

  // ── Step indicator (dots + step number) ────────────────────────

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "size-2 rounded-full transition-all duration-300",
            i === stepIndex
              ? "bg-primary scale-125"
              : i < stepIndex
                ? "bg-primary/50"
                : "bg-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );

  // ── Navigation buttons ────────────────────────────────────────

  const renderNavButtons = (
    canProceed: boolean,
    nextLabel?: string,
    showSkip?: boolean,
  ) => (
    <div className="py-4 flex justify-between gap-3">
      <Button variant="ghost" size="sm" onClick={goBack} disabled={stepIndex === 0}>
        <ArrowLeft className="size-4 mr-1" />
        {t("nav.back")}
      </Button>
      <div className="flex gap-2">
        {showSkip && (
          <Button variant="ghost" size="sm" onClick={goForward}>
            {t("nav.skip")}
          </Button>
        )}
        <Button size="sm" onClick={goForward} disabled={!canProceed}>
          {nextLabel ?? t("nav.next")}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // ── Purpose options for Step 1 ────────────────────────────────────
  const PURPOSE_OPTIONS: { value: PlanPurpose; icon: React.ReactNode; ringClass: string; bgClass: string; iconBgClass: string; labelKey: string; descKey: string }[] = [
    {
      value: "race",
      icon: <Target className="size-5 sm:size-6 text-primary" />,
      ringClass: "ring-primary bg-primary/5",
      bgClass: "hover:bg-muted/50",
      iconBgClass: "bg-primary/10",
      labelKey: "purpose.race",
      descKey: "purpose.raceDesc",
    },
    {
      value: "base_building",
      icon: <TrendingUp className="size-5 sm:size-6 text-zone-2" />,
      ringClass: "ring-zone-2 bg-zone-2/5",
      bgClass: "hover:bg-muted/50",
      iconBgClass: "bg-zone-2/10",
      labelKey: "purpose.baseBuilding",
      descKey: "purpose.baseBuildingDesc",
    },
    {
      value: "return_from_injury",
      icon: <Heart className="size-5 sm:size-6 text-zone-1" />,
      ringClass: "ring-zone-1 bg-zone-1/5",
      bgClass: "hover:bg-muted/50",
      iconBgClass: "bg-zone-1/10",
      labelKey: "purpose.returnFromInjury",
      descKey: "purpose.returnFromInjuryDesc",
    },
    {
      value: "beginner_start",
      icon: <Footprints className="size-5 sm:size-6 text-zone-3" />,
      ringClass: "ring-zone-3 bg-zone-3/5",
      bgClass: "hover:bg-muted/50",
      iconBgClass: "bg-zone-3/10",
      labelKey: "purpose.beginnerStart",
      descKey: "purpose.beginnerStartDesc",
    },
  ];

  // ── Step 1: Plan Purpose ────────────────────────────────────────

  const renderStep1 = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Zap className="size-6 md:size-8 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("purpose.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("purpose.subtitle")}
        </p>

        <div className="w-full max-w-md grid grid-cols-1 gap-2 mt-6">
          {PURPOSE_OPTIONS.map((opt) => (
            <Card
              key={opt.value}
              interactive
              className={cn(
                "cursor-pointer border-border/50 transition-all duration-200",
                form.planPurpose === opt.value
                  ? `ring-2 ${opt.ringClass}`
                  : opt.bgClass
              )}
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  planPurpose: opt.value,
                  // Set defaults for non-race plans
                  ...(opt.value === "beginner_start" ? { daysPerWeek: 3, totalWeeksOverride: 8, trainingGoal: "finish" as TrainingGoal } : {}),
                  ...(opt.value === "return_from_injury" ? { daysPerWeek: 3, totalWeeksOverride: 10, trainingGoal: "finish" as TrainingGoal } : {}),
                  ...(opt.value === "base_building" ? { totalWeeksOverride: 12, trainingGoal: "time" as TrainingGoal } : {}),
                }));
                goForward();
              }}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", opt.iconBgClass)}>
                  {opt.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t(opt.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(opt.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {renderNavButtons(!!form.planPurpose)}
    </div>
  );

  // ── Step 2: Race Distance (or Duration for non-race) ───────────

  const renderStep2 = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Target className="size-6 md:size-8 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("distance.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("distance.subtitle")}
        </p>
        <div className="w-full max-w-md grid grid-cols-2 gap-2 mt-6">
          {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => {
            const meta = RACE_DISTANCE_META[dist];
            return (
              <Card
                key={dist}
                interactive
                className={cn(
                  "cursor-pointer border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200",
                  form.raceDistance === dist
                    ? "bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent ring-2 ring-primary"
                    : "hover:bg-gradient-to-br hover:from-primary/5 dark:hover:from-primary/10 hover:to-transparent"
                )}
                onClick={() => {
                  setForm((f) => ({ ...f, raceDistance: dist }));
                  goForward();
                }}
              >
                <CardContent className="p-3 md:p-4 flex items-center gap-3">
                  <div className="size-9 md:size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {RACE_DISTANCE_ICONS[dist]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm md:text-base leading-tight">
                      {pick(meta, "label")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {meta.distanceKm} km
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {renderNavButtons(!!form.raceDistance)}
    </div>
  );

  // ── Step Duration: Choose plan length (non-race plans) ──────────

  const renderStepDuration = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-zone-2/10 flex items-center justify-center mb-4">
          <Calendar className="size-6 md:size-8 text-zone-2" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("duration.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("duration.subtitle")}
        </p>
        <div className="w-full max-w-xs grid grid-cols-3 gap-2 mt-6">
          {DURATION_OPTIONS.map((opt) => (
            <Card
              key={opt.weeks}
              interactive
              className={cn(
                "cursor-pointer border-border/50 transition-all duration-200",
                form.totalWeeksOverride === opt.weeks
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              )}
              onClick={() => {
                setForm((f) => ({ ...f, totalWeeksOverride: opt.weeks }));
                goForward();
              }}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{opt.weeks}</span>
                <span className="text-xs text-muted-foreground">
                  {t("duration.weeks")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {renderNavButtons(form.totalWeeksOverride > 0)}
    </div>
  );

  // ── Step 3: Race Date (or Duration for non-race) ────────────────

  const renderStep3 = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="size-6 md:size-8 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("date.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("date.subtitle", { min: minWeeksForDistance })}
        </p>

        <div className="w-full max-w-sm mt-6 space-y-3">
          <input
            type="date"
            lang={isEn ? "en" : "fr"}
            min={minDate}
            value={form.raceDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, raceDate: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && dateValid) goForward();
            }}
            aria-label={t("date.raceDate")}
            className="w-full rounded-md border bg-background px-4 py-3 min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-center">{t("date.startLabel")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, useCustomStartDate: false, startDate: todayDate }))}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-sm transition-colors",
                  !form.useCustomStartDate ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/50"
                )}
              >
                {t("date.startNow")}
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, useCustomStartDate: true, startDate: f.startDate || todayDate }))}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-sm transition-colors",
                  form.useCustomStartDate ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/50"
                )}
              >
                {t("date.chooseStartDate")}
              </button>
            </div>
            {form.useCustomStartDate && (
              <input
                type="date"
                lang={isEn ? "en" : "fr"}
                value={form.startDate}
                max={form.raceDate || undefined}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-md border bg-background px-4 py-3 min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {form.raceDate && dateValid && (
            <p className="text-sm text-muted-foreground text-center">
              {t("date.weeks", { count: weeksCount })}
            </p>
          )}

          {form.raceDate && !dateValid && (
            <p className="text-sm text-destructive text-center">
              {t("date.tooSoon", { min: minWeeksForDistance })}
            </p>
          )}

          {form.raceDate && form.useCustomStartDate && (
            <p className="text-xs text-muted-foreground text-center">
              {t("date.startHint", {
                date: new Date(form.startDate).toLocaleDateString(isEn ? "en-US" : "fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              })}
            </p>
          )}

          {form.raceDate && dateTooLong && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300 text-center space-y-1">
              <p className="font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" />
                {t("date.tooLong", { weeks: weeksCount })}
              </p>
              <p className="text-xs">
                {t("date.tooLongDetail", { min: recommendedWeeks.min, max: recommendedWeeks.max })}
              </p>
            </div>
          )}
        </div>
      </div>
      {renderNavButtons(dateValid, t("nav.continue"))}
    </div>
  );

  // ── Step 4: Race Name (optional) ─────────────────────────────────

  const renderStep4 = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Flag className="size-6 md:size-8 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("raceName.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("raceName.subtitle")}
        </p>

        <div className="w-full max-w-sm mt-6">
          <input
            type="text"
            value={form.raceName}
            onChange={(e) =>
              setForm((f) => ({ ...f, raceName: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") goForward();
            }}
            placeholder={t("raceName.placeholder")}
            aria-label={t("raceName.label")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={100}
          />
        </div>
      </div>
      {renderNavButtons(true, t("nav.continue"), true)}
    </div>
  );

  // ── Step 5: Runner Level ─────────────────────────────────────────

  const renderStep5 = () => {
    const levels: Difficulty[] = [
      "beginner",
      "intermediate",
      "advanced",
      "elite",
    ];

    return (
      <div
        className={cn(
          "flex-1 flex flex-col",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Target className="size-6 md:size-8 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-center">
            {t("level.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {t("level.subtitle")}
          </p>

          {userPrefs?.vma && suggestedLevel && (
            <div className="rounded-lg border bg-primary/5 p-2 text-xs text-center mt-3 max-w-sm w-full">
              {t("level.vmaSuggestion", { vma: userPrefs.vma })}
              <span className="font-semibold">
                {pick(DIFFICULTY_META[suggestedLevel], "label")}
              </span>
              {t("level.vmaSuggestionSuffix")}
            </div>
          )}

          <div className="w-full max-w-md grid grid-cols-2 gap-2 mt-6">
            {levels.map((level) => {
              const meta = DIFFICULTY_META[level];
              const isSuggested = level === suggestedLevel;
              return (
                <Card
                  key={level}
                  interactive
                  className={cn(
                    "cursor-pointer border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200",
                    form.runnerLevel === level
                      ? "bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent ring-2 ring-primary"
                      : "hover:bg-gradient-to-br hover:from-primary/5 dark:hover:from-primary/10 hover:to-transparent",
                    isSuggested &&
                      form.runnerLevel !== level &&
                      "border-primary/40"
                  )}
                  onClick={() => {
                    setForm((f) => ({ ...f, runnerLevel: level }));
                    goForward();
                  }}
                >
                  <CardContent className="p-3 md:p-4 flex items-center gap-3">
                    <div className="size-9 md:size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-base md:text-lg font-bold text-primary">
                        {meta.level}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm md:text-base leading-tight">
                        {pick(meta, "label")}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {pick(meta, "desc")}
                      </div>
                      {isSuggested && (
                        <div className="text-xs text-primary">
                          {t("level.suggested")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        <div className="py-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="size-4 mr-1" />
            {t("nav.back")}
          </Button>
        </div>
      </div>
    );
  };

  // ── Step Goal: Training mindset (finish/time/compete) ────────────

  const renderStepGoal = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("goal.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("goal.subtitle")}
        </p>
        <div className="w-full max-w-sm grid grid-cols-1 gap-2 mt-6">
          {GOAL_OPTION_KEYS.map((opt) => (
            <Card
              key={opt.value}
              interactive
              className={cn(
                "cursor-pointer border-border/50 transition-all duration-200",
                form.trainingGoal === opt.value
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              )}
              onClick={() => {
                setForm((f) => ({ ...f, trainingGoal: opt.value }));
                goForward();
              }}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="size-9 rounded-full bg-secondary/80 flex items-center justify-center shrink-0">
                  {opt.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t(opt.labelKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(opt.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {renderNavButtons(!!form.trainingGoal)}
    </div>
  );

  // ── Step Fitness: Current fitness evaluation ───────────────────────

  const renderStepFitness = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("fitness.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
          {t("fitness.subtitle")}
        </p>
        <div className="w-full max-w-sm space-y-4 mt-6">
          {/* Current weekly km */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="weeklyKm">
              {t("fitness.weeklyKm")}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("fitness.weeklyKmDesc")}
            </p>
            <input
              id="weeklyKm"
              type="number"
              inputMode="numeric"
              min={0}
              max={300}
              placeholder={t("fitness.weeklyKmPlaceholder")}
              value={form.currentWeeklyKm}
              onChange={(e) => setForm((f) => ({ ...f, currentWeeklyKm: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>

          {/* Current long run */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="longRunKm">
              {t("fitness.longRunKm")}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("fitness.longRunKmDesc")}
            </p>
            <input
              id="longRunKm"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              placeholder={t("fitness.longRunKmPlaceholder")}
              value={form.currentLongRunKm}
              onChange={(e) => setForm((f) => ({ ...f, currentLongRunKm: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
      </div>
      {renderNavButtons(true, t("nav.continue"), true)}
    </div>
  );

  // ── Step 6: Training Configuration ───────────────────────────────

  const renderStep6 = () => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="size-6 md:size-8 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">
          {t("schedule.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("schedule.subtitle")}
        </p>

        <div className="w-full max-w-sm mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block text-center">
              {t("schedule.sessionsPerWeek")}
            </label>
            <div className="flex gap-2">
              {DAYS_PER_WEEK_OPTIONS.filter((n) =>
                form.planPurpose === "return_from_injury" ? n <= 4
                  : form.planPurpose === "beginner_start" ? n <= 5
                    : true
              ).map((n) => (
                <Button
                  key={n}
                  variant={form.daysPerWeek === n ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setForm((f) => ({ ...f, daysPerWeek: n }))}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Long run day picker */}
          <div>
            <label className="text-sm font-medium mb-2 block text-center">
              {t("schedule.longRunDay")}
            </label>
            <p className="text-xs text-muted-foreground text-center mb-3">
              {t("schedule.longRunDayDesc")}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, idx) => (
                <Button
                  key={idx}
                  variant={form.longRunDay === idx ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-0"
                  onClick={() => setForm((f) => ({ ...f, longRunDay: idx }))}
                >
                  {t(`daysShort.${idx}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Strength training toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="size-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <label htmlFor="includeStrength" className="text-sm font-medium cursor-pointer">
                    {t("schedule.includeStrength")}
                  </label>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {t("schedule.includeStrengthDesc")}
                  </p>
                </div>
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
              <div className="mt-3 ml-10">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  {t("schedule.strengthFrequency")}
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((n) => (
                    <Button
                      key={n}
                      variant={form.strengthFrequency === n ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setForm((f) => ({ ...f, strengthFrequency: n }))}
                    >
                      {t("schedule.strengthPerWeek", { n })}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderNavButtons(true, t("nav.continue"))}
    </div>
  );

  // ── Step 7: Pace & Elevation (optional) ──────────────────────────

  const renderStep7 = () => {
    const distanceKm = form.raceDistance
      ? RACE_DISTANCE_META[form.raceDistance].distanceKm
      : 0;

    return (
      <div
        className={cn(
          "flex-1 flex flex-col",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mountain className="size-6 md:size-8 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-center">
            {t("pace.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {t("pace.subtitle")}
          </p>
          {(form.raceDistance === "trail_short" || form.raceDistance === "trail" || form.raceDistance === "ultra") && (
            <p className="text-xs text-primary text-center mt-1">
              {t("pace.trailHint")}
            </p>
          )}

          <div className="w-full max-w-sm mt-6 space-y-4">
            {/* Pace input mode toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                type="button"
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium transition-colors",
                  paceInputMode === "pace" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                )}
                onClick={() => setPaceInputMode("pace")}
              >
                {t("pace.targetPaceTab")}
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium transition-colors",
                  paceInputMode === "time" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                )}
                onClick={() => setPaceInputMode("time")}
              >
                {t("pace.targetTimeTab")}
              </button>
            </div>

            {/* Target pace or finish time */}
            {paceInputMode === "pace" ? (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("pace.targetPaceLabel")}
                </label>
                <input
                  type="text"
                  value={form.targetPace}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, targetPace: e.target.value }));
                    setTargetFinishTime("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (paceSeconds || !form.targetPace)) goForward();
                  }}
                  placeholder="5:30"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {paceSeconds && distanceKm > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("pace.estimatedFinish")}
                    <span className="font-medium">
                      {estimateFinishTime(paceSeconds, distanceKm)}
                    </span>
                  </p>
                )}
                {form.targetPace && !paceSeconds && (
                  <p className="text-xs text-destructive mt-1">
                    {t("pace.paceFormatError")}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("pace.targetFinishTimeLabel")}
                </label>
                <input
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const totalSec = parseFinishTimeToSeconds(targetFinishTime);
                      if (totalSec || !targetFinishTime) goForward();
                    }
                  }}
                  placeholder={t("pace.timePlaceholder")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {(() => {
                  const totalSec = parseFinishTimeToSeconds(targetFinishTime);
                  if (totalSec && distanceKm > 0) {
                    const paceSec = finishTimeToPaceSeconds(totalSec, distanceKm);
                    return (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("pace.requiredPace")}
                        <span className="font-medium">{formatPace(paceSec)} min/km</span>
                      </p>
                    );
                  }
                  if (targetFinishTime && !totalSec) {
                    return (
                      <p className="text-xs text-destructive mt-1">
                        {t("pace.timeFormatHint")}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Elevation gain */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("pace.elevation")}
              </label>
              <input
                type="number"
                value={form.elevationGain}
                onChange={(e) =>
                  setForm((f) => ({ ...f, elevationGain: e.target.value }))
                }
                placeholder={t("pace.elevationPlaceholder")}
                min={0}
                max={10000}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        {renderNavButtons(
          form.targetPace === "" || !!paceSeconds,
          t("nav.continue"),
          true
        )}
      </div>
    );
  };

  // ── Step 8: Summary & Generate ───────────────────────────────────

  const renderStep8 = () => {
    const distMeta = form.raceDistance
      ? RACE_DISTANCE_META[form.raceDistance]
      : null;
    const levelMeta = form.runnerLevel
      ? DIFFICULTY_META[form.runnerLevel]
      : null;
    const distanceKm = distMeta?.distanceKm ?? 0;

    return (
      <div
        className={cn(
          "space-y-4",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="text-center mb-4">
          <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CheckIcon className="size-6 md:size-8 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">
            {t("summary.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("summary.subtitle")}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6 space-y-2">
            {/* Distance */}
            <SummaryRow
              label={t("summary.distance")}
              value={
                distMeta
                  ? `${pick(distMeta, "label")} (${distMeta.distanceKm} km)`
                  : "-"
              }
            />
            {/* Race date */}
            <SummaryRow
              label={t("summary.date")}
              value={
                form.raceDate
                  ? `${new Date(form.raceDate).toLocaleDateString(
                      isEn ? "en-US" : "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )} (${weeksCount} ${t("summary.weeksShort")})`
                  : "-"
              }
            />
            <SummaryRow
              label={t("summary.startDate")}
              value={
                form.startDate
                  ? new Date(form.startDate).toLocaleDateString(
                      isEn ? "en-US" : "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "-"
              }
            />
            {/* Race name */}
            {form.raceName && (
              <SummaryRow
                label={t("summary.name")}
                value={form.raceName}
              />
            )}
            {/* Level */}
            <SummaryRow
              label={t("summary.level")}
              value={
                levelMeta ? pick(levelMeta, "label") : "-"
              }
            />
            {/* Days */}
            <SummaryRow
              label={t("summary.days")}
              value={`${form.daysPerWeek}`}
            />
            {/* Pace */}
            {paceSeconds && (
              <SummaryRow
                label={t("summary.pace")}
                value={`${formatPace(paceSeconds)}/km → ${estimateFinishTime(paceSeconds, distanceKm)}`}
              />
            )}
            {/* Elevation */}
            {form.elevationGain && (
              <SummaryRow
                label={t("summary.elevation")}
                value={`${form.elevationGain} m D+`}
              />
            )}
            {/* v2: Goal */}
            <SummaryRow
              label={t("summary.goal")}
              value={
                form.trainingGoal === "finish" ? t("goal.finish")
                  : form.trainingGoal === "compete" ? t("goal.compete")
                    : t("goal.time")
              }
            />
            {/* v2: Purpose (non-race only) */}
            {form.planPurpose !== "race" && (
              <SummaryRow
                label={t("summary.purpose")}
                value={
                  form.planPurpose === "base_building" ? t("summary.purposeBaseBuilding")
                    : form.planPurpose === "return_from_injury" ? t("summary.purposeReturnFromInjury")
                      : t("summary.purposeBeginnerStart")
                }
              />
            )}
            {/* v2: Duration (non-race) */}
            {form.planPurpose !== "race" && form.totalWeeksOverride > 0 && (
              <SummaryRow
                label={t("summary.duration")}
                value={t("summary.durationValue", { weeks: form.totalWeeksOverride })}
              />
            )}
            {/* v2: Fitness */}
            {form.currentWeeklyKm && (
              <SummaryRow
                label={t("summary.weeklyKm")}
                value={t("summary.currentVolume", { km: form.currentWeeklyKm })}
              />
            )}
            {/* v2: Long run day */}
            <SummaryRow
              label={t("summary.longRun")}
              value={t(`days.${form.longRunDay}`)}
            />
            {/* v2: Strength training */}
            {form.includeStrength && (
              <SummaryRow
                label={t("summary.strengthTraining")}
                value={t("schedule.strengthPerWeek", { n: form.strengthFrequency })}
              />
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="size-4 mr-1" />
            {t("nav.back")}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t("summary.generating")}
              </>
            ) : (
              <>
                {t("summary.generate")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────

  // Summary step can scroll; other steps use full viewport layout
  const isFullViewportStep = currentStep !== "summary";

  return (
    <>
      <SEOHead
        title={t("seo.createTitle")}
        description={t("seo.createDescription")}
        canonical="/plan/create"
      />
      <div className={cn(
        "max-w-2xl mx-auto",
        isFullViewportStep
          ? "flex flex-col min-h-[calc(100dvh-8rem)] md:min-h-0 md:py-8"
          : "py-8"
      )}>
        {/* Back to plan selection */}
        {stepIndex === 0 && (
          <div className="pt-1 pb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/plan/new">
                <ArrowLeft className="mr-1 size-4" />
                {t("nav.back")}
              </Link>
            </Button>
          </div>
        )}
        {renderStepIndicator()}
        {currentStep === "purpose" && renderStep1()}
        {currentStep === "distance" && renderStep2()}
        {currentStep === "date" && renderStep3()}
        {currentStep === "duration" && renderStepDuration()}
        {currentStep === "race_name" && renderStep4()}
        {currentStep === "level" && renderStep5()}
        {currentStep === "goal" && renderStepGoal()}
        {currentStep === "fitness" && renderStepFitness()}
        {currentStep === "schedule" && renderStep6()}
        {currentStep === "pace" && renderStep7()}
        {currentStep === "summary" && renderStep8()}
      </div>
    </>
  );
}

// ── Helper component ─────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
