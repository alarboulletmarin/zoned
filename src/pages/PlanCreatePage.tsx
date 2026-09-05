import {
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
} from "react";
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
  Check,
  Heart,
  Footprints,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  type IconProps,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { StatBlock } from "@/components/domain/StatBlock";
import { SEOHead } from "@/components/seo";
import { useCreatePlan } from "@/hooks/usePlans";
import { loadUserZonePrefs } from "@/lib/zones";
import {
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
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { usePickLang, formatDate } from "@/lib/i18n-utils";
import { DateInput } from "@/components/ui/date-input";
import { addWeeksToDate, buildRacePlanDateRange, calculateWeeksBetweenDates } from "@/lib/planDates";
import { RECOMMENDED_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import { validateIntermediateGoals, sortIntermediateGoals } from "@/lib/intermediateGoalValidation";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { usePlanDraft } from "./plan-create/usePlanDraft";

// ── Constants ────────────────────────────────────────────────────────

// Steps are dynamic based on plan purpose
type StepId = "purpose" | "distance" | "date" | "duration" | "race_name" | "intermediate_goals" | "level" | "goal" | "fitness" | "schedule" | "pace" | "summary";

const RACE_STEPS: StepId[] = ["purpose", "distance", "date", "race_name", "intermediate_goals", "level", "goal", "fitness", "schedule", "pace", "summary"];
const NON_RACE_STEPS: StepId[] = ["purpose", "duration", "level", "goal", "fitness", "schedule", "summary"];

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6, 7] as const;

/**
 * Recommended week ranges per distance — warnings, not hard blocks.
 * Single source of truth: this page used to keep its own, looser copy
 * (marathon min 12 against 14), so the wizard let through plans the generator
 * itself considers too short.
 */
const RECOMMENDED_WEEKS = RECOMMENDED_PLAN_WEEKS;

const RACE_DISTANCE_ICONS: Record<RaceDistance, ComponentType<IconProps>> = {
  "5K": Zap,
  "10K": Timer,
  semi: Route,
  marathon: Flag,
  trail_short: Mountain,
  trail: Mountain,
  ultra: Mountain,
};

const DURATION_OPTIONS = [
  { weeks: 4 },
  { weeks: 6 },
  { weeks: 8 },
  { weeks: 10 },
  { weeks: 12 },
  { weeks: 16 },
];

const GOAL_OPTION_KEYS: { value: TrainingGoal; icon: ComponentType<IconProps>; labelKey: string; descKey: string }[] = [
  {
    value: "finish",
    icon: Flag,
    labelKey: "goal.finish",
    descKey: "goal.finishDesc",
  },
  {
    value: "time",
    icon: Timer,
    labelKey: "goal.time",
    descKey: "goal.timeDesc",
  },
  {
    value: "compete",
    icon: TrendingUp,
    labelKey: "goal.compete",
    descKey: "goal.competeDesc",
  },
];

const PURPOSE_OPTIONS: { value: PlanPurpose; icon: ComponentType<IconProps>; labelKey: string; descKey: string }[] = [
  { value: "race", icon: Target, labelKey: "purpose.race", descKey: "purpose.raceDesc" },
  { value: "base_building", icon: TrendingUp, labelKey: "purpose.baseBuilding", descKey: "purpose.baseBuildingDesc" },
  { value: "return_from_injury", icon: Heart, labelKey: "purpose.returnFromInjury", descKey: "purpose.returnFromInjuryDesc" },
  { value: "beginner_start", icon: Footprints, labelKey: "purpose.beginnerStart", descKey: "purpose.beginnerStartDesc" },
];

const PRIORITY_OPTIONS: { value: RacePriority; labelKey: string; descKey: string }[] = [
  { value: "A", labelKey: "intermediateGoals.priorityA", descKey: "intermediateGoals.priorityADesc" },
  { value: "B", labelKey: "intermediateGoals.priorityB", descKey: "intermediateGoals.priorityBDesc" },
  { value: "C", labelKey: "intermediateGoals.priorityC", descKey: "intermediateGoals.priorityCDesc" },
];

/** Validation code → the sentence that says what to do about it. */
const VALIDATION_KEYS: Record<string, string> = {
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

// ── One answer, drawn ────────────────────────────────────────────────

/**
 * A radio wearing paper. The input stays a real radio — same name, same
 * arrow keys, same checked state — and the label around it is what the eye
 * reads. Chosen is the 2.5px vermillon frame, never a tint.
 */
function Option({
  name,
  checked,
  onSelect,
  title,
  body,
  data,
  glyph: Glyph,
  shape,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  body?: string;
  data?: string;
  glyph?: ComponentType<IconProps>;
  shape?: "tile";
}) {
  return (
    <label className="zn-wiz-opt" data-shape={shape}>
      <input
        type="radio"
        className="sr-only"
        name={name}
        checked={checked}
        onChange={onSelect}
      />
      {Glyph ? (
        <span className="zn-wiz-opt__glyph" aria-hidden="true">
          <Glyph size={18} />
        </span>
      ) : null}
      <span className="zn-wiz-opt__text">
        <span className="zn-wiz-opt__title">{title}</span>
        {body ? <span className="zn-wiz-opt__body">{body}</span> : null}
      </span>
      {data ? <span className="zn-mono zn-wiz-opt__data">{data}</span> : null}
    </label>
  );
}

/** One line of the recap: a term and its value. */
function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <>
      <dt className="zn-wiz-sum__label">{label}</dt>
      <dd className="zn-wiz-sum__value" data-mono={mono ? "true" : undefined}>
        {value}
      </dd>
    </>
  );
}

// ── Component ────────────────────────────────────────────────────────

export function PlanCreatePage() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const navigate = useNavigate();
  const uid = useId();
  const { createPlan, isGenerating, error } = useCreatePlan();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
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
    stepIndex,
    setStepIndex,
  );

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

  /** The stepper only walks backwards: a step ahead has not been answered. */
  const goBackTo = useCallback((index: number) => {
    setDirection("backward");
    setStepIndex(index);
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
  }, [form, userPrefs, paceSeconds, createPlan, navigate, finalize, isRacePlan]);

  // ── Intermediate goals ───────────────────────────────────────────

  const intermediateGoalValidation = useMemo(() => {
    if (form.intermediateGoals.length === 0 || !form.raceDate) return { valid: true, errors: [] };
    return validateIntermediateGoals(
      form.intermediateGoals,
      form.raceDate,
      form.startDate || todayDate,
      form.raceDistance ?? "10K",
    );
  }, [form.intermediateGoals, form.raceDate, form.startDate, form.raceDistance, todayDate]);

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

  // ── Furniture ────────────────────────────────────────────────────

  const questionId = `${uid}-question`;

  /** Previous / next, over the divider that closes the step. */
  const renderNav = (
    canProceed: boolean,
    nextLabel?: string,
    showSkip?: boolean,
  ) => (
    <CardFooter className="zn-wiz__nav">
      <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
        <ArrowLeft />
        {t("nav.back")}
      </Button>
      <span className="zn-push" />
      {showSkip && (
        <Button variant="ghost" onClick={goForward}>
          {t("nav.skip")}
        </Button>
      )}
      <Button onClick={goForward} disabled={!canProceed}>
        {nextLabel ?? t("nav.next")}
        <ArrowRight />
      </Button>
    </CardFooter>
  );

  /** The question, then whatever answers it. */
  const renderQuestion = (title: string, sub: string | null, body: ReactNode) => (
    <CardContent
      className="zn-wiz__pane"
      data-direction={direction}
    >
      <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
        <h2 id={questionId} className="zn-title" data-level="3">
          {title}
        </h2>
        {sub ? <p className="zn-body zn-body--sm zn-muted">{sub}</p> : null}
      </div>
      {body}
    </CardContent>
  );

  const optionStack = (children: ReactNode) => (
    <fieldset
      className="zn-contrib-group zn-stack"
      style={{ "--gap": "var(--sp-5)" } as CSSProperties}
      aria-labelledby={questionId}
    >
      {children}
    </fieldset>
  );

  // ── Step: plan purpose ───────────────────────────────────────────

  const renderPurpose = () => (
    <>
      {renderQuestion(
        t("purpose.title"),
        t("purpose.subtitle"),
        optionStack(
          PURPOSE_OPTIONS.map((opt) => (
            <Option
              key={opt.value}
              name={`${uid}-purpose`}
              glyph={opt.icon}
              checked={form.planPurpose === opt.value}
              title={t(opt.labelKey)}
              body={t(opt.descKey)}
              onSelect={() =>
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
          )),
        ),
      )}
      {renderNav(!!form.planPurpose)}
    </>
  );

  // ── Step: race distance ──────────────────────────────────────────

  const renderDistance = () => (
    <>
      {renderQuestion(
        t("distance.title"),
        t("distance.subtitle"),
        optionStack(
          (Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => {
            const meta = RACE_DISTANCE_META[dist];
            return (
              <Option
                key={dist}
                name={`${uid}-distance`}
                glyph={RACE_DISTANCE_ICONS[dist]}
                checked={form.raceDistance === dist}
                title={pick(meta, "label")}
                data={`${meta.distanceKm} km`}
                onSelect={() => setForm((f) => ({ ...f, raceDistance: dist }))}
              />
            );
          }),
        ),
      )}
      {renderNav(!!form.raceDistance)}
    </>
  );

  // ── Step: plan length (non-race plans) ───────────────────────────

  const renderDuration = () => (
    <>
      {renderQuestion(
        t("duration.title"),
        t("duration.subtitle"),
        <fieldset
          className="zn-contrib-group zn-grid zn-wiz__tiles"
          style={{ "--gap": "var(--sp-5)" } as CSSProperties}
          aria-labelledby={questionId}
        >
          {DURATION_OPTIONS.map((opt) => (
            <Option
              key={opt.weeks}
              name={`${uid}-duration`}
              shape="tile"
              checked={form.totalWeeksOverride === opt.weeks}
              title={String(opt.weeks)}
              body={t("duration.weeks")}
              onSelect={() =>
                setForm((f) => ({ ...f, totalWeeksOverride: opt.weeks }))
              }
            />
          ))}
        </fieldset>,
      )}
      {renderNav(form.totalWeeksOverride > 0)}
    </>
  );

  // ── Step: race date ──────────────────────────────────────────────

  const renderDate = () => (
    <>
      {renderQuestion(
        t("date.title"),
        t("date.subtitle", { min: minWeeksForDistance }),
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-race-date`}>
              {t("date.raceDate")}
              <span className="zn-contrib-field__req" aria-hidden="true">*</span>
            </label>
            <DateInput
              id={`${uid}-race-date`}
              min={minDate}
              value={form.raceDate}
              onChange={(e) => setForm((f) => ({ ...f, raceDate: e.target.value }))}
              aria-label={t("date.raceDate")}
            />
            {form.raceDate && dateValid && (
              <p className="zn-mono zn-faint">
                {t("date.weeks", { count: weeksCount })}
              </p>
            )}
            {form.raceDate && !dateValid && (
              <p role="alert" className="zn-contrib-field__error">
                <AlertTriangle size={14} />
                {t("date.tooSoon", { min: minWeeksForDistance })}
              </p>
            )}
          </div>

          <div className="zn-contrib-field">
            <span className="zn-contrib-field__label">{t("date.startLabel")}</span>
            <Segmented
              label={t("date.startLabel")}
              value={form.useCustomStartDate ? "custom" : "now"}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  useCustomStartDate: v === "custom",
                  startDate: v === "custom" ? f.startDate || todayDate : todayDate,
                }))
              }
              options={[
                { value: "now", label: t("date.startNow") },
                { value: "custom", label: t("date.chooseStartDate") },
              ]}
            />
            {form.useCustomStartDate && (
              <DateInput
                id={`${uid}-start-date`}
                value={form.startDate}
                max={form.raceDate || undefined}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                aria-label={t("date.startLabel")}
              />
            )}
            {form.raceDate && form.useCustomStartDate && (
              <p className="zn-caption zn-faint">
                {t("date.startHint", {
                  date: formatDate(form.startDate, { year: "numeric", month: "short", day: "numeric" }),
                })}
              </p>
            )}
          </div>

          {form.raceDate && dateTooLong && (
            <Alert kind="warning" title={t("date.tooLong", { weeks: weeksCount })}>
              {t("date.tooLongDetail", { min: recommendedWeeks.min, max: recommendedWeeks.max })}
            </Alert>
          )}
        </div>,
      )}
      {renderNav(dateValid, t("nav.continue"))}
    </>
  );

  // ── Step: race name (optional) ───────────────────────────────────

  const renderRaceName = () => (
    <>
      {renderQuestion(
        t("raceName.title"),
        t("raceName.subtitle"),
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-race-name`}>
            {t("raceName.label")}
          </label>
          <input
            id={`${uid}-race-name`}
            type="text"
            className="zn-contrib-input"
            value={form.raceName}
            onChange={(e) => setForm((f) => ({ ...f, raceName: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") goForward();
            }}
            placeholder={t("raceName.placeholder")}
            maxLength={100}
          />
        </div>,
      )}
      {renderNav(true, t("nav.continue"), true)}
    </>
  );

  // ── Step: prep races (optional) ──────────────────────────────────

  const renderIntermediateGoals = () => {
    const errorsForGoal = (idx: number) =>
      intermediateGoalValidation.errors.filter((e) => e.goalIndex === idx);

    return (
      <>
        {renderQuestion(
          t("intermediateGoals.title"),
          t("intermediateGoals.subtitle"),
          <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
            {form.intermediateGoals.map((goal, idx) => {
              const goalErrors = errorsForGoal(idx);
              return (
                <Card key={idx} size="compact" className="zn-wiz-race">
                  <CardContent
                    className="zn-stack"
                    style={{ "--gap": "var(--sp-8)" } as CSSProperties}
                  >
                    <div className="zn-row zn-row--split">
                      <span className="zn-mono zn-faint">{`#${idx + 1}`}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="zn-wiz-race__remove"
                        onClick={() => removeIntermediateGoal(idx)}
                      >
                        <Trash2 />
                        {t("intermediateGoals.remove")}
                      </Button>
                    </div>

                    <div className="zn-contrib-field">
                      <span
                        className="zn-contrib-field__label"
                        id={`${uid}-goal-${idx}-distance-label`}
                      >
                        {t("intermediateGoals.distance")}
                      </span>
                      <div
                        className="zn-cluster"
                        role="radiogroup"
                        aria-labelledby={`${uid}-goal-${idx}-distance-label`}
                      >
                        {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => (
                          <button
                            key={dist}
                            type="button"
                            role="radio"
                            aria-checked={goal.raceDistance === dist}
                            className="zn-chip"
                            onClick={() => updateIntermediateGoal(idx, { raceDistance: dist })}
                          >
                            {pick(RACE_DISTANCE_META[dist], "label")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="zn-contrib-field">
                      <label
                        className="zn-contrib-field__label"
                        htmlFor={`${uid}-goal-${idx}-date`}
                      >
                        {t("intermediateGoals.date")}
                      </label>
                      <DateInput
                        id={`${uid}-goal-${idx}-date`}
                        min={form.startDate || todayDate}
                        max={intermediateGoalMaxDate}
                        value={goal.raceDate}
                        onChange={(e) => updateIntermediateGoal(idx, { raceDate: e.target.value })}
                        aria-label={t("intermediateGoals.date")}
                      />
                    </div>

                    <div className="zn-contrib-field">
                      <label
                        className="zn-contrib-field__label"
                        htmlFor={`${uid}-goal-${idx}-name`}
                      >
                        {t("intermediateGoals.name")}
                      </label>
                      <input
                        id={`${uid}-goal-${idx}-name`}
                        type="text"
                        className="zn-contrib-input"
                        value={goal.raceName ?? ""}
                        onChange={(e) => updateIntermediateGoal(idx, { raceName: e.target.value })}
                        placeholder={t("intermediateGoals.namePlaceholder")}
                        maxLength={100}
                      />
                    </div>

                    <fieldset className="zn-contrib-group">
                      <legend className="zn-contrib-group__legend">
                        {t("intermediateGoals.priority")}
                      </legend>
                      <div
                        className="zn-stack"
                        style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <Option
                            key={opt.value}
                            name={`${uid}-priority-${idx}`}
                            checked={goal.priority === opt.value}
                            title={t(opt.labelKey)}
                            body={t(opt.descKey)}
                            data={t(`intermediateGoals.badge.${opt.value}`)}
                            onSelect={() => updateIntermediateGoal(idx, { priority: opt.value })}
                          />
                        ))}
                      </div>
                    </fieldset>

                    {goalErrors.length > 0 && (
                      <div className="zn-stack" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
                        {goalErrors.map((err, eIdx) => {
                          const key = VALIDATION_KEYS[err.code];
                          return (
                            <p key={eIdx} role="alert" className="zn-contrib-field__error">
                              <AlertTriangle size={14} />
                              {key ? t(key) : err.message}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {form.intermediateGoals.length < 5 ? (
              <Button variant="outline" onClick={addIntermediateGoal}>
                <Plus />
                {t("intermediateGoals.add")}
              </Button>
            ) : (
              <p className="zn-mono zn-faint">{t("intermediateGoals.maxReached")}</p>
            )}
          </div>,
        )}
        {renderNav(
          form.intermediateGoals.length === 0 || intermediateGoalValidation.valid,
          t("nav.continue"),
          true,
        )}
      </>
    );
  };

  // ── Step: runner level ───────────────────────────────────────────

  const renderLevel = () => {
    const levels: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

    return (
      <>
        {renderQuestion(
          t("level.title"),
          t("level.subtitle"),
          <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
            {userPrefs?.vma && suggestedLevel && (
              <p className="zn-mono zn-faint">
                {t("level.vmaSuggestion", { vma: userPrefs.vma })}
                <span className="zn-accent">
                  {pick(DIFFICULTY_META[suggestedLevel], "label")}
                </span>
                {t("level.vmaSuggestionSuffix")}
              </p>
            )}
            {optionStack(
              levels.map((level) => {
                const meta = DIFFICULTY_META[level];
                return (
                  <Option
                    key={level}
                    name={`${uid}-level`}
                    checked={form.runnerLevel === level}
                    title={pick(meta, "label")}
                    body={pick(meta, "desc")}
                    data={level === suggestedLevel ? t("level.suggested") : undefined}
                    onSelect={() => setForm((f) => ({ ...f, runnerLevel: level }))}
                  />
                );
              }),
            )}
          </div>,
        )}
        {renderNav(!!form.runnerLevel)}
      </>
    );
  };

  // ── Step: training mindset ───────────────────────────────────────

  const renderGoal = () => (
    <>
      {renderQuestion(
        t("goal.title"),
        t("goal.subtitle"),
        optionStack(
          GOAL_OPTION_KEYS.map((opt) => (
            <Option
              key={opt.value}
              name={`${uid}-goal`}
              glyph={opt.icon}
              checked={form.trainingGoal === opt.value}
              title={t(opt.labelKey)}
              body={t(opt.descKey)}
              onSelect={() => setForm((f) => ({ ...f, trainingGoal: opt.value }))}
            />
          )),
        ),
      )}
      {renderNav(!!form.trainingGoal)}
    </>
  );

  // ── Step: current fitness (optional) ─────────────────────────────

  const renderFitness = () => (
    <>
      {renderQuestion(
        t("fitness.title"),
        t("fitness.subtitle"),
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-weekly-km`}>
              {t("fitness.weeklyKm")}
            </label>
            <input
              id={`${uid}-weekly-km`}
              type="number"
              inputMode="numeric"
              min={0}
              max={300}
              data-mono="true"
              className="zn-contrib-input"
              placeholder={t("fitness.weeklyKmPlaceholder")}
              value={form.currentWeeklyKm}
              aria-describedby={`${uid}-weekly-km-hint`}
              onChange={(e) => setForm((f) => ({ ...f, currentWeeklyKm: e.target.value }))}
            />
            <p id={`${uid}-weekly-km-hint`} className="zn-caption zn-faint">
              {t("fitness.weeklyKmDesc")}
            </p>
          </div>

          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-long-run-km`}>
              {t("fitness.longRunKm")}
            </label>
            <input
              id={`${uid}-long-run-km`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              data-mono="true"
              className="zn-contrib-input"
              placeholder={t("fitness.longRunKmPlaceholder")}
              value={form.currentLongRunKm}
              aria-describedby={`${uid}-long-run-km-hint`}
              onChange={(e) => setForm((f) => ({ ...f, currentLongRunKm: e.target.value }))}
            />
            <p id={`${uid}-long-run-km-hint`} className="zn-caption zn-faint">
              {t("fitness.longRunKmDesc")}
            </p>
          </div>
        </div>,
      )}
      {renderNav(true, t("nav.continue"), true)}
    </>
  );

  // ── Step: the typical week ───────────────────────────────────────

  const renderSchedule = () => {
    const dayOptions = DAYS_PER_WEEK_OPTIONS.filter((n) =>
      form.planPurpose === "return_from_injury" ? n <= 4
        : form.planPurpose === "beginner_start" ? n <= 5
          : true
    );

    return (
      <>
        {renderQuestion(
          t("schedule.title"),
          t("schedule.subtitle"),
          <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
            <div className="zn-contrib-field">
              <span className="zn-contrib-field__label">
                {t("schedule.sessionsPerWeek")}
              </span>
              <Segmented
                label={t("schedule.sessionsPerWeek")}
                value={String(form.daysPerWeek)}
                onChange={(v) => setForm((f) => ({ ...f, daysPerWeek: parseInt(v, 10) }))}
                options={dayOptions.map((n) => ({ value: String(n), label: String(n) }))}
              />
            </div>

            <div className="zn-contrib-field">
              <span className="zn-contrib-field__label">
                {t("schedule.longRunDay")}
              </span>
              <Segmented
                label={t("schedule.longRunDay")}
                value={String(form.longRunDay)}
                onChange={(v) => setForm((f) => ({ ...f, longRunDay: parseInt(v, 10) }))}
                options={Array.from({ length: 7 }, (_, idx) => ({
                  value: String(idx),
                  label: t(`daysShort.${idx}`),
                  title: t(`days.${idx}`),
                }))}
              />
              <p className="zn-caption zn-faint">{t("schedule.longRunDayDesc")}</p>
            </div>

            <div className="zn-contrib-toggle">
              <label className="zn-contrib-toggle__label" htmlFor={`${uid}-strength`}>
                {t("schedule.includeStrength")}
              </label>
              <Switch
                id={`${uid}-strength`}
                checked={form.includeStrength}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, includeStrength: !!checked }))
                }
              />
            </div>
            <p className="zn-caption zn-faint">{t("schedule.includeStrengthDesc")}</p>

            {form.includeStrength && (
              <div className="zn-contrib-field">
                <span className="zn-contrib-field__label">
                  {t("schedule.strengthFrequency")}
                </span>
                <Segmented
                  label={t("schedule.strengthFrequency")}
                  value={String(form.strengthFrequency)}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      strengthFrequency: parseInt(v, 10) as 1 | 2 | 3,
                    }))
                  }
                  options={[1, 2, 3].map((n) => ({
                    value: String(n),
                    label: t("schedule.strengthPerWeek", { n }),
                  }))}
                />
              </div>
            )}
          </div>,
        )}
        {renderNav(true, t("nav.continue"))}
      </>
    );
  };

  // ── Step: target pace and elevation (optional) ───────────────────

  const renderPace = () => {
    const distanceKm = form.raceDistance
      ? RACE_DISTANCE_META[form.raceDistance].distanceKm
      : 0;
    const finishSeconds = parseFinishTimeToSeconds(targetFinishTime);
    const isTrail =
      form.raceDistance === "trail_short" ||
      form.raceDistance === "trail" ||
      form.raceDistance === "ultra";

    return (
      <>
        {renderQuestion(
          t("pace.title"),
          t("pace.subtitle"),
          <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
            {isTrail && <p className="zn-caption zn-faint">{t("pace.trailHint")}</p>}

            <Segmented
              label={t("pace.title")}
              value={paceInputMode}
              onChange={(v) => setPaceInputMode(v as "pace" | "time")}
              options={[
                { value: "pace", label: t("pace.targetPaceTab") },
                { value: "time", label: t("pace.targetTimeTab") },
              ]}
            />

            {paceInputMode === "pace" ? (
              <div className="zn-contrib-field">
                <label className="zn-contrib-field__label" htmlFor={`${uid}-pace`}>
                  {t("pace.targetPaceLabel")}
                </label>
                <input
                  id={`${uid}-pace`}
                  type="text"
                  inputMode="numeric"
                  data-mono="true"
                  className="zn-contrib-input"
                  placeholder={t("pace.pacePlaceholder")}
                  value={form.targetPace}
                  aria-invalid={(!!form.targetPace && !paceSeconds) || undefined}
                  aria-describedby={
                    form.targetPace && !paceSeconds ? `${uid}-pace-error` : undefined
                  }
                  onChange={(e) => {
                    setForm((f) => ({ ...f, targetPace: e.target.value }));
                    setTargetFinishTime("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (paceSeconds || !form.targetPace)) goForward();
                  }}
                />
                {paceSeconds && distanceKm > 0 && (
                  <p className="zn-mono zn-faint">
                    {t("pace.estimatedFinish")}
                    {estimateFinishTime(paceSeconds, distanceKm)}
                  </p>
                )}
                {form.targetPace && !paceSeconds && (
                  <p id={`${uid}-pace-error`} role="alert" className="zn-contrib-field__error">
                    <AlertTriangle size={14} />
                    {t("pace.paceFormatError")}
                  </p>
                )}
              </div>
            ) : (
              <div className="zn-contrib-field">
                <label className="zn-contrib-field__label" htmlFor={`${uid}-finish`}>
                  {t("pace.targetFinishTimeLabel")}
                </label>
                <input
                  id={`${uid}-finish`}
                  type="text"
                  inputMode="numeric"
                  data-mono="true"
                  className="zn-contrib-input"
                  placeholder={t("pace.timePlaceholder")}
                  value={targetFinishTime}
                  aria-invalid={(!!targetFinishTime && !finishSeconds) || undefined}
                  aria-describedby={
                    targetFinishTime && !finishSeconds ? `${uid}-finish-error` : undefined
                  }
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
                    if (e.key === "Enter" && (finishSeconds || !targetFinishTime)) goForward();
                  }}
                />
                {finishSeconds && distanceKm > 0 && (
                  <p className="zn-mono zn-faint">
                    {t("pace.requiredPace")}
                    {`${formatPace(finishTimeToPaceSeconds(finishSeconds, distanceKm))} min/km`}
                  </p>
                )}
                {targetFinishTime && !finishSeconds && (
                  <p id={`${uid}-finish-error`} role="alert" className="zn-contrib-field__error">
                    <AlertTriangle size={14} />
                    {t("pace.timeFormatHint")}
                  </p>
                )}
              </div>
            )}

            <div className="zn-contrib-field">
              <label className="zn-contrib-field__label" htmlFor={`${uid}-elevation`}>
                {t("pace.elevation")}
              </label>
              <input
                id={`${uid}-elevation`}
                type="number"
                inputMode="numeric"
                min={0}
                max={10000}
                data-mono="true"
                className="zn-contrib-input"
                placeholder={t("pace.elevationPlaceholder")}
                value={form.elevationGain}
                onChange={(e) => setForm((f) => ({ ...f, elevationGain: e.target.value }))}
              />
            </div>
          </div>,
        )}
        {renderNav(form.targetPace === "" || !!paceSeconds, t("nav.continue"), true)}
      </>
    );
  };

  // ── Step: the recap ──────────────────────────────────────────────

  const renderSummary = () => {
    const distMeta = form.raceDistance ? RACE_DISTANCE_META[form.raceDistance] : null;
    const levelMeta = form.runnerLevel ? DIFFICULTY_META[form.runnerLevel] : null;
    const distanceKm = distMeta?.distanceKm ?? 0;
    const planWeeks = isRacePlan ? weeksCount : form.totalWeeksOverride;

    const stats: {
      value: string;
      label: string;
      footnote?: string;
      tone: "card" | "ink";
    }[] = [];
    if (isRacePlan && distMeta) {
      stats.push({ value: pick(distMeta, "label"), label: t("summary.distance"), tone: "card" });
    }
    if (planWeeks > 0) {
      stats.push({
        value: String(planWeeks),
        label: t("duration.weeks"),
        footnote: form.raceDate
          ? formatDate(form.raceDate, { month: "short", day: "numeric" })
          : undefined,
        tone: "card",
      });
    }
    stats.push({ value: String(form.daysPerWeek), label: t("summary.days"), tone: "card" });
    if (form.currentWeeklyKm) {
      stats.push({
        value: `${form.currentWeeklyKm} km`,
        label: t("summary.weeklyKm"),
        tone: "ink",
      });
    }

    return (
      <>
        <CardContent className="zn-wiz__pane" data-direction={direction}>
          <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
            <h2 id={questionId} className="zn-title" data-level="3">
              {t("summary.title")}
            </h2>
            <p className="zn-body zn-body--sm zn-muted">{t("summary.subtitle")}</p>
          </div>

          {/* The plan in numbers, before the line-by-line recap. Only the ones
              the athlete actually answered: a stat block reading "—" is a
              hole, and a hole is not a measure. */}
          <div
            className="zn-grid"
            style={{ "--cols": stats.length, "--gap": "var(--sp-6)" } as CSSProperties}
          >
            {stats.map((stat) => (
              <StatBlock key={stat.label} size="sm" {...stat} />
            ))}
          </div>

          <dl className="zn-wiz-sum">
            {distMeta && (
              <SummaryRow
                label={t("summary.distance")}
                value={`${pick(distMeta, "label")} · ${distMeta.distanceKm} km`}
              />
            )}
            {form.raceDate && (
              <SummaryRow
                label={t("summary.date")}
                value={`${formatDate(form.raceDate)} · ${weeksCount} ${t("summary.weeksShort")}`}
              />
            )}
            {form.startDate && (
              <SummaryRow
                label={t("summary.startDate")}
                value={formatDate(form.startDate)}
              />
            )}
            {form.raceName && (
              <SummaryRow label={t("summary.name")} value={form.raceName} />
            )}

            {form.intermediateGoals.length > 0 && (
              <>
                <dt className="zn-wiz-sum__label">{t("intermediateGoals.title")}</dt>
                <dd className="zn-wiz-sum__nest">
                  <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
                    {sortIntermediateGoals(form.intermediateGoals).map((goal, idx) => (
                      <div key={idx} className="zn-row" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
                        <span className="zn-mono zn-accent zn-fixed">
                          {t(`intermediateGoals.badge.${goal.priority}`)}
                        </span>
                        <span className="zn-body zn-body--sm zn-truncate zn-fill">
                          {pick(RACE_DISTANCE_META[goal.raceDistance], "label")}
                          {goal.raceName ? ` · ${goal.raceName}` : ""}
                        </span>
                        <span className="zn-mono zn-faint zn-fixed">
                          {goal.raceDate ? formatDate(goal.raceDate, { month: "short", day: "numeric" }) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </dd>
              </>
            )}

            {levelMeta && (
              <SummaryRow label={t("summary.level")} value={pick(levelMeta, "label")} />
            )}
            <SummaryRow label={t("summary.days")} value={String(form.daysPerWeek)} mono />
            {!!paceSeconds && (
              <SummaryRow
                label={t("summary.pace")}
                mono
                value={`${formatPace(paceSeconds)}/km → ${estimateFinishTime(paceSeconds, distanceKm)}`}
              />
            )}
            {form.elevationGain && (
              <SummaryRow
                label={t("summary.elevation")}
                value={`${form.elevationGain} m D+`}
                mono
              />
            )}
            <SummaryRow
              label={t("summary.goal")}
              value={
                form.trainingGoal === "finish" ? t("goal.finish")
                  : form.trainingGoal === "compete" ? t("goal.compete")
                    : t("goal.time")
              }
            />
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
            {form.planPurpose !== "race" && form.totalWeeksOverride > 0 && (
              <SummaryRow
                label={t("summary.duration")}
                value={t("summary.durationValue", { weeks: form.totalWeeksOverride })}
                mono
              />
            )}
            {form.currentWeeklyKm && (
              <SummaryRow
                label={t("summary.weeklyKm")}
                value={t("summary.currentVolume", { km: form.currentWeeklyKm })}
                mono
              />
            )}
            <SummaryRow
              label={t("summary.longRun")}
              value={t(`days.${form.longRunDay}`)}
            />
            {form.includeStrength && (
              <SummaryRow
                label={t("summary.strengthTraining")}
                value={t("schedule.strengthPerWeek", { n: form.strengthFrequency })}
                mono
              />
            )}
          </dl>

          {error && (
            <Alert kind="error" title={t("wizard.errorTitle")}>
              {error} {t("wizard.errorHint")}
            </Alert>
          )}
        </CardContent>

        <CardFooter className="zn-wiz__nav">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft />
            {t("nav.back")}
          </Button>
          <span className="zn-push" />
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Spinner size={16} inline />
                {t("summary.generating")}
              </>
            ) : (
              <>
                <Check />
                {t("summary.generate")}
              </>
            )}
          </Button>
        </CardFooter>
      </>
    );
  };

  // ── Render ───────────────────────────────────────────────────────

  const STEP_RENDERERS: Record<StepId, () => ReactNode> = {
    purpose: renderPurpose,
    distance: renderDistance,
    date: renderDate,
    duration: renderDuration,
    race_name: renderRaceName,
    intermediate_goals: renderIntermediateGoals,
    level: renderLevel,
    goal: renderGoal,
    fitness: renderFitness,
    schedule: renderSchedule,
    pace: renderPace,
    summary: renderSummary,
  };

  return (
    <>
      <SEOHead
        title={t("seo.createTitle")}
        description={t("seo.createDescription")}
        canonical="/plan/create"
      />

      <div className="zn-wiz">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          {stepIndex === 0 && (
            <Button variant="ghost" size="sm" asChild className="zn-wiz__lone">
              <Link to="/plan/new">
                <ArrowLeft />
                {t("nav.back")}
              </Link>
            </Button>
          )}

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <span className="zn-kicker">{t("wizard.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("wizard.title")}
            </h1>
          </div>

          {/* The promise and its limits are stated once, on the first step —
              past that the question on screen is what matters. */}
          {stepIndex === 0 && (
            <div
              className="zn-split"
              style={{ "--split": "1fr 340px", "--gap": "var(--sp-14)" } as CSSProperties}
            >
              <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                <p className="zn-body zn-body--lead">{t("wizard.lede")}</p>
                <p className="zn-source">{t("wizard.source")}</p>
              </div>
              <Card size="compact">
                <CardContent
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                >
                  <span className="zn-kicker zn-kicker--inline">
                    {t("wizard.limitsKicker")}
                  </span>
                  <p className="zn-body zn-body--sm zn-muted">{t("wizard.limitsBody")}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <section className="zn-wiz__band">
          {hasDraft && stepIndex === 0 && (
            <Alert
              kind="info"
              title={t("draft.found")}
              action={
                <span
                  className="zn-cluster"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <Button size="sm" variant="outline" onClick={restoreDraft}>
                    {t("draft.restore")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearDraft}>
                    {t("draft.discard")}
                  </Button>
                </span>
              }
            >
              {t("wizard.draftBody")}
            </Alert>
          )}

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <ol className="zn-stepper zn-wiz__steps">
              {steps.map((id, index) => {
                const done = index < stepIndex;
                const current = index === stepIndex;
                return (
                  <li key={id} className="zn-stepper__item">
                    <button
                      type="button"
                      className="zn-stepper__step"
                      data-state={done ? "done" : current ? "current" : "todo"}
                      aria-current={current ? "step" : undefined}
                      disabled={!done}
                      onClick={() => goBackTo(index)}
                    >
                      <span className="zn-stepper__rail" aria-hidden="true" />
                      <span className="zn-stepper__name">
                        <span className="zn-stepper__num">
                          {done ? <Check size={12} /> : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="zn-stepper__label">{t(`wizard.step.${id}`)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="zn-mono zn-wiz__where">
              {t("wizard.where", { current: stepIndex + 1, total: totalSteps })}
            </p>
          </div>

          <Card className="zn-wiz__col">{STEP_RENDERERS[currentStep]()}</Card>
        </section>
      </div>
    </>
  );
}
