import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ChevronDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SEOHead } from "@/components/seo";
import { savePlan } from "@/lib/planStorage";
import { createFreePlan } from "@/lib/createFreePlan";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/i18n-utils";
import { DateInput } from "@/components/ui/date-input";
import type { TrainingGoal, PlanPurpose } from "@/types/plan";

const MIN_WEEKS = 4;
const MAX_WEEKS = 52;
const DEFAULT_WEEKS = 12;
const MIN_DAYS = 3;
const MAX_DAYS = 7;
const DEFAULT_DAYS = 4;

const DAYS_OPTIONS = Array.from(
  { length: MAX_DAYS - MIN_DAYS + 1 },
  (_, i) => MIN_DAYS + i
);

const GOAL_OPTIONS: TrainingGoal[] = ["finish", "time", "compete"];

const PURPOSE_OPTIONS: { value: PlanPurpose; labelKey: string }[] = [
  { value: "race", labelKey: "race" },
  { value: "base_building", labelKey: "baseBuilding" },
  { value: "return_from_injury", labelKey: "returnFromInjury" },
  { value: "beginner_start", labelKey: "beginnerStart" },
];

export function FreePlanCreatePage() {
  const { t } = useTranslation(["calculators", "plan"]);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS);
  const [startDate, setStartDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal | undefined>();
  const [planPurpose, setPlanPurpose] = useState<PlanPurpose | undefined>();

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const plan = createFreePlan(name.trim(), weeks, startDate || undefined, {
      daysPerWeek,
      trainingGoal,
      planPurpose,
    });
    if (!savePlan(plan)) {
      toast.error(t("errors.planSaveFailed"));
      return;
    }
    triggerStorageWarning();
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead
        title={t("calculators:freePlan.title")}
        description={t("calculators:freePlan.seoDescription")}
        canonical="/plan/new/free"
      />
      <div className="mx-auto max-w-xl py-6 md:py-8">
        <div className="pb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plan/new">
              <ArrowLeft className="mr-1 size-4" />
              {t("calculators:freePlan.back")}
            </Link>
          </Button>
        </div>

        <h1 className="font-sans font-bold uppercase leading-[1.02] tracking-[-0.03em] text-3xl md:text-4xl">
          {t("calculators:freePlan.title")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-[1.5] text-muted-foreground">
          {t("calculators:freePlan.subtitle")}
        </p>

        <div className="mt-8 space-y-8">
          <FormSection title={t("calculators:freePlan.planName")}>
            <div className="max-w-sm">
              <Input
                id="plan-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) handleSubmit();
                }}
                placeholder={t("calculators:freePlan.namePlaceholder")}
                maxLength={100}
                autoFocus
              />
            </div>
          </FormSection>

          <FormSection
            title={t("calculators:freePlan.numberOfWeeks")}
            description={`${MIN_WEEKS} - ${MAX_WEEKS} ${t("calculators:freePlan.weeks")}`}
          >
            <div className="flex max-w-sm items-center gap-4">
              <Slider
                className="flex-1"
                min={MIN_WEEKS}
                max={MAX_WEEKS}
                step={1}
                thumbLabel={t("calculators:freePlan.numberOfWeeks")}
                thumbValueText={`${weeks} ${t("calculators:freePlan.weeks")}`}
                value={[weeks]}
                onValueChange={([v]) => setWeeks(v)}
              />
              <Input
                id="plan-weeks"
                type="number"
                inputMode="numeric"
                min={MIN_WEEKS}
                max={MAX_WEEKS}
                value={weeks}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= MIN_WEEKS && v <= MAX_WEEKS) {
                    setWeeks(v);
                  }
                }}
                className="w-20 shrink-0"
              />
            </div>
          </FormSection>

          <FormSection
            title={t("calculators:freePlan.daysPerWeek")}
            description={t("calculators:freePlan.daysPerWeekHint")}
          >
            <div className="flex max-w-sm gap-2">
              {DAYS_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  selected={daysPerWeek === n}
                  className="flex-1 justify-center py-2"
                  onClick={() => setDaysPerWeek(n)}
                >
                  {n}
                </Chip>
              ))}
            </div>
          </FormSection>

          <section>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  showAdvanced && "rotate-180"
                )}
              />
              {t("calculators:freePlan.advancedOptions")}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-6 border-l-2 border-filet pl-4">
                <div>
                  <FieldLabel>{t("plan:goal.title")}</FieldLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <Chip
                        key={goal}
                        selected={trainingGoal === goal}
                        onClick={() =>
                          setTrainingGoal(trainingGoal === goal ? undefined : goal)
                        }
                      >
                        {t(`plan:goal.${goal}`)}
                      </Chip>
                    ))}
                    <Chip
                      selected={trainingGoal === undefined}
                      onClick={() => setTrainingGoal(undefined)}
                    >
                      {t("calculators:freePlan.noneSelected")}
                    </Chip>
                  </div>
                </div>

                <div>
                  <FieldLabel>{t("plan:purpose.title")}</FieldLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PURPOSE_OPTIONS.map(({ value, labelKey }) => (
                      <Chip
                        key={value}
                        selected={planPurpose === value}
                        onClick={() =>
                          setPlanPurpose(planPurpose === value ? undefined : value)
                        }
                      >
                        {t(`plan:purpose.${labelKey}`)}
                      </Chip>
                    ))}
                    <Chip
                      selected={planPurpose === undefined}
                      onClick={() => setPlanPurpose(undefined)}
                    >
                      {t("calculators:freePlan.noneSelected")}
                    </Chip>
                  </div>
                </div>
              </div>
            )}
          </section>

          <FormSection title={t("calculators:freePlan.startDate")}>
            <div className="max-w-sm space-y-3">
              <div className="flex gap-2">
                <Chip
                  selected={!useCustomDate}
                  className="flex-1 justify-center py-2"
                  onClick={() => {
                    setUseCustomDate(false);
                    setStartDate("");
                  }}
                >
                  {t("calculators:freePlan.startNow")}
                </Chip>
                <Chip
                  selected={useCustomDate}
                  className="flex-1 justify-center py-2"
                  onClick={() => {
                    setUseCustomDate(true);
                    setStartDate(new Date().toISOString().split("T")[0]);
                  }}
                >
                  {t("calculators:freePlan.chooseDate")}
                </Chip>
              </div>
              {useCustomDate && (
                <DateInput
                  id="plan-start"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 min-h-[44px] text-base"
                />
              )}
              {startDate && (
                <p className="font-mono text-[11px] text-muted-foreground">
                  {t("calculators:freePlan.endDate")}:{" "}
                  {(() => {
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + weeks * 7);
                    return formatDate(d);
                  })()}
                </p>
              )}
            </div>
          </FormSection>
        </div>

        <div className="mt-8 border-t border-filet pt-5">
          <Button
            size="lg"
            variant="accent"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {t("calculators:freePlan.create")}
          </Button>
        </div>
      </div>
    </>
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
