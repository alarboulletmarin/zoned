import { useId, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, ChevronDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { SEOHead } from "@/components/seo";
import { savePlan } from "@/lib/planStorage";
import { createFreePlan } from "@/lib/createFreePlan";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { formatDate } from "@/lib/i18n-utils";
import { DateInput } from "@/components/ui/date-input";
import type { TrainingGoal, PlanPurpose } from "@/types/plan";

const MIN_WEEKS = 4;
const MAX_WEEKS = 52;
const DEFAULT_WEEKS = 12;
const MIN_DAYS = 3;
const MAX_DAYS = 7;
const DEFAULT_DAYS = 4;

const DAY_OPTIONS = Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) =>
  String(MIN_DAYS + i),
);

const GOALS: TrainingGoal[] = ["finish", "time", "compete"];

const PURPOSES: { value: PlanPurpose; key: string }[] = [
  { value: "race", key: "race" },
  { value: "base_building", key: "baseBuilding" },
  { value: "return_from_injury", key: "returnFromInjury" },
  { value: "beginner_start", key: "beginnerStart" },
];

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * The blank plan: a name, a length, a rhythm, and nothing generated.
 *
 * Every control here is a ported primitive, a slider for the length, a
 * segmented strip for the exclusive choices, chips for the two optional tags.
 * The one vermillon fill on the screen is the create button at the foot.
 */
/**
 * A `radiogroup` promises a keyboard contract that plain buttons do not keep:
 * ONE tab stop for the whole group, with the arrows moving the selection inside
 * it. Declaring the role without that is worse than declaring nothing, a
 * screen-reader user is told to press an arrow and nothing happens.
 */
function useRadioGroup<T>(values: readonly T[], current: T | undefined, onPick: (v: T) => void) {
  const index = current === undefined ? 0 : Math.max(0, values.indexOf(current));
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    let next = -1;
    if (step !== 0) next = (index + step + values.length) % values.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = values.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onPick(values[next]);
    e.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [next]?.focus();
  };
  return { onKeyDown, tabIndexFor: (i: number) => (i === index ? 0 : -1) };
}

export function FreePlanCreatePage() {
  const { t } = useTranslation(["plan", "common"]);
  const navigate = useNavigate();
  const uid = useId();

  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS);
  const [startDate, setStartDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal | undefined>();
  const [planPurpose, setPlanPurpose] = useState<PlanPurpose | undefined>();

  // Both tag groups declare role="radiogroup", so they owe the arrow keys and
  // the single tab stop that role promises. `undefined` is a real option here
  // ("none selected"), so it takes part in the ring.
  const goalOptions = [...GOALS, undefined] as (TrainingGoal | undefined)[];
  const goalKeys = useRadioGroup(goalOptions, trainingGoal, setTrainingGoal);
  const purposeOptions = [
    ...PURPOSES.map((p) => p.value),
    undefined,
  ] as (PlanPurpose | undefined)[];
  const purposeKeys = useRadioGroup(purposeOptions, planPurpose, setPlanPurpose);

  const isValid = name.trim().length > 0;
  const nameInvalid = nameTouched && !isValid;

  const endDate = (() => {
    if (!startDate) return null;
    const d = new Date(startDate);
    d.setDate(d.getDate() + weeks * 7);
    return formatDate(d);
  })();

  const handleSubmit = () => {
    if (!isValid) {
      setNameTouched(true);
      return;
    }

    const plan = createFreePlan(name.trim(), weeks, startDate || undefined, {
      daysPerWeek,
      trainingGoal,
      planPurpose,
    });
    if (!savePlan(plan)) {
      toast.error(t("common:errors.planSaveFailed"));
      return;
    }
    triggerStorageWarning();
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead
        title={t("freePlan.title")}
        description={t("freePlan.seoDescription")}
        canonical="/plan/new/free"
      />

      <div className="zn-wiz">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <Button variant="ghost" size="sm" asChild className="zn-wiz__lone">
            <Link to="/plan/new">
              <ArrowLeft />
              {t("freePlan.back")}
            </Link>
          </Button>

          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <span className="zn-kicker">
              {t("freePlan.kicker", { min: MIN_WEEKS, max: MAX_WEEKS })}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("freePlan.heading")}
            </h1>
            <p
              className="zn-body zn-body--lead zn-measure"
              style={{ "--measure": "54ch" } as CSSProperties}
            >
              {t("freePlan.subtitle")}
            </p>
          </div>
        </div>

        <section className="zn-wiz__band">
          <Card className="zn-wiz__col">
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-11)" } as CSSProperties}
            >
              {/* Name, the only required answer on the screen. */}
              <div className="zn-contrib-field">
                <label className="zn-contrib-field__label" htmlFor={`${uid}-name`}>
                  {t("freePlan.planName")}
                  <span className="zn-contrib-field__req" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id={`${uid}-name`}
                  type="text"
                  required
                  autoFocus
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) handleSubmit();
                  }}
                  placeholder={t("freePlan.namePlaceholder")}
                  aria-invalid={nameInvalid || undefined}
                  aria-describedby={nameInvalid ? `${uid}-name-error` : undefined}
                  className="zn-contrib-input"
                />
                {nameInvalid && (
                  <p
                    id={`${uid}-name-error`}
                    role="alert"
                    className="zn-contrib-field__error"
                  >
                    <AlertTriangle size={14} />
                    {t("freePlan.nameRequired")}
                  </p>
                )}
              </div>

              {/* Length */}
              <div className="zn-contrib-field">
                <span className="zn-contrib-field__label">
                  {t("freePlan.numberOfWeeks")}
                </span>
                <div className="zn-wiz__range">
                  <Slider
                    min={MIN_WEEKS}
                    max={MAX_WEEKS}
                    step={1}
                    value={[weeks]}
                    onValueChange={([v]) => setWeeks(v)}
                    thumbLabel={t("freePlan.numberOfWeeks")}
                    thumbValueText={t("freePlan.weeksValue", { n: weeks })}
                  />
                  <span className="zn-mono zn-wiz__range-value" aria-hidden="true">
                    {t("freePlan.weeksValue", { n: weeks })}
                  </span>
                </div>
                <p className="zn-caption zn-faint">
                  {t("freePlan.weeksHint", { min: MIN_WEEKS, max: MAX_WEEKS })}
                </p>
              </div>

              {/* Rhythm */}
              <div className="zn-contrib-field">
                <span className="zn-contrib-field__label">
                  {t("freePlan.daysPerWeek")}
                </span>
                <Segmented
                  label={t("freePlan.daysPerWeek")}
                  value={String(daysPerWeek)}
                  onChange={(v) => setDaysPerWeek(parseInt(v, 10))}
                  options={DAY_OPTIONS.map((d) => ({ value: d, label: d }))}
                />
                <p className="zn-caption zn-faint">{t("freePlan.daysPerWeekHint")}</p>
              </div>

              {/* Start date */}
              <div className="zn-contrib-field">
                <span className="zn-contrib-field__label">
                  {t("freePlan.startDate")}
                </span>
                <Segmented
                  label={t("freePlan.startDate")}
                  value={useCustomDate ? "custom" : "now"}
                  onChange={(v) => {
                    const custom = v === "custom";
                    setUseCustomDate(custom);
                    setStartDate(custom ? todayIso() : "");
                  }}
                  options={[
                    { value: "now", label: t("freePlan.startNow") },
                    { value: "custom", label: t("freePlan.chooseDate") },
                  ]}
                />
                {useCustomDate && (
                  <DateInput
                    id={`${uid}-start`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label={t("freePlan.startDate")}
                  />
                )}
                {endDate && (
                  <p className="zn-mono zn-faint">
                    {t("freePlan.endsOn", { date: endDate })}
                  </p>
                )}
              </div>

              {/* The two tags almost nobody sets on a blank plan. */}
              <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="zn-wiz__lone"
                  aria-expanded={showAdvanced}
                  aria-controls={`${uid}-advanced`}
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  <ChevronDown className="zn-wiz__chev" />
                  {t("freePlan.advancedOptions")}
                </Button>

                <div
                  id={`${uid}-advanced`}
                  hidden={!showAdvanced}
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-11)" } as CSSProperties}
                >
                  <div className="zn-contrib-field">
                    <span className="zn-contrib-field__label" id={`${uid}-goal-label`}>
                      {t("goal.title")}
                    </span>
                    <div
                      className="zn-cluster"
                      role="radiogroup"
                      aria-labelledby={`${uid}-goal-label`}
                      onKeyDown={goalKeys.onKeyDown}
                    >
                      {GOALS.map((goal, i) => (
                        <button
                          key={goal}
                          type="button"
                          role="radio"
                          aria-checked={trainingGoal === goal}
                          tabIndex={goalKeys.tabIndexFor(i)}
                          className="zn-chip"
                          onClick={() => setTrainingGoal(goal)}
                        >
                          {t(`goal.${goal}`)}
                        </button>
                      ))}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={trainingGoal === undefined}
                        tabIndex={goalKeys.tabIndexFor(GOALS.length)}
                        className="zn-chip"
                        onClick={() => setTrainingGoal(undefined)}
                      >
                        {t("freePlan.noneSelected")}
                      </button>
                    </div>
                  </div>

                  <div className="zn-contrib-field">
                    <span className="zn-contrib-field__label" id={`${uid}-purpose-label`}>
                      {t("purpose.title")}
                    </span>
                    <div
                      className="zn-cluster"
                      role="radiogroup"
                      aria-labelledby={`${uid}-purpose-label`}
                      onKeyDown={purposeKeys.onKeyDown}
                    >
                      {PURPOSES.map((purpose, i) => (
                        <button
                          key={purpose.value}
                          type="button"
                          role="radio"
                          aria-checked={planPurpose === purpose.value}
                          tabIndex={purposeKeys.tabIndexFor(i)}
                          className="zn-chip"
                          onClick={() => setPlanPurpose(purpose.value)}
                        >
                          {t(`purpose.${purpose.key}`)}
                        </button>
                      ))}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={planPurpose === undefined}
                        tabIndex={purposeKeys.tabIndexFor(PURPOSES.length)}
                        className="zn-chip"
                        onClick={() => setPlanPurpose(undefined)}
                      >
                        {t("freePlan.noneSelected")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The screen's single vermillon fill. */}
          <div
            className="zn-cluster zn-wiz__col"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <Button size="lg" onClick={handleSubmit} disabled={!isValid}>
              {t("freePlan.create")}
            </Button>
            <span className="zn-mono zn-faint">
              {t("freePlan.createNote", { n: weeks })}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
