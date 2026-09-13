import { useCallback, useId, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Copy,
} from "@/components/icons";
import { WorkoutStepListEditor } from "./WorkoutStepListEditor";
import { WorkoutPreview } from "./WorkoutPreview";
import { StringListEditor } from "./StringListEditor";
import { submitFullWorkout, copyToClipboard } from "@/lib/issueBuilder";
import { replaceWorkoutPhaseSteps } from "@/lib/workoutStructure";
import type {
  WorkoutTemplate,
  WorkoutCategory,
  SessionType,
  TargetSystem,
  Difficulty,
  WorkoutStep,
} from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WizardStep = 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4;

const CATEGORIES = Object.keys(CATEGORY_META) as WorkoutCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_META) as Difficulty[];

const SESSION_TYPES: SessionType[] = [
  "recovery",
  "endurance",
  "tempo",
  "threshold",
  "vo2max",
  "speed",
  "long_run",
  "hills",
  "fartlek",
  "race_specific",
];

const TARGET_SYSTEMS: TargetSystem[] = [
  "aerobic_base",
  "aerobic_power",
  "lactate_threshold",
  "vo2max",
  "speed",
  "strength",
  "race_specific",
];

const TARGET_SYSTEM_LABELS: Record<TargetSystem, { fr: string; en: string }> = {
  aerobic_base: { fr: "Base aérobie", en: "Aerobic Base" },
  aerobic_power: { fr: "Puissance aérobie", en: "Aerobic Power" },
  aerobic_threshold: { fr: "Seuil aérobie", en: "Aerobic Threshold" },
  lactate_threshold: { fr: "Seuil lactique", en: "Lactate Threshold" },
  lactate_tolerance: { fr: "Tolérance au lactate", en: "Lactate Tolerance" },
  mixed: { fr: "Mixte", en: "Mixed" },
  neuromuscular: { fr: "Neuromusculaire", en: "Neuromuscular" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  strength: { fr: "Force", en: "Strength" },
  race_specific: { fr: "Spécifique course", en: "Race Specific" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FullWorkoutWizard() {
  const { t } = useTranslation("contribute");
  const pickLang = usePickLang();
  const pickLocale = usePickLocale();
  const uid = useId();

  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  // A required field only states its reason once the writer has left it.
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});

  // Full workout state
  const [data, setData] = useState<Partial<WorkoutTemplate>>({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    category: "endurance",
    sessionType: "endurance",
    targetSystem: "aerobic_base",
    difficulty: "intermediate",
    typicalDuration: { min: 30, max: 60 },
    environment: {
      requiresHills: false,
      requiresTrack: false,
      prefersFlat: false,
      prefersSoft: false,
    },
    warmupTemplate: [],
    mainSetTemplate: [],
    cooldownTemplate: [],
    warmupStructure: [],
    mainSetStructure: [],
    cooldownStructure: [],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
  });

  const update = useCallback(
    (partial: Partial<WorkoutTemplate>) => {
      setData((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const updatePhaseSteps = useCallback((phase: "warmup" | "main" | "cooldown", steps: WorkoutStep[]) => {
    setData((prev) => replaceWorkoutPhaseSteps({
      ...prev,
      warmupTemplate: prev.warmupTemplate ?? [],
      mainSetTemplate: prev.mainSetTemplate ?? [],
      cooldownTemplate: prev.cooldownTemplate ?? [],
    } as WorkoutTemplate, phase, steps));
  }, []);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const step1Valid =
    (data.name?.trim().length ?? 0) > 0 &&
    (data.description?.trim().length ?? 0) > 0;

  const step2Valid = (data.mainSetStructure?.length ?? data.mainSetTemplate?.length ?? 0) > 0;

  const canGoNext = (s: WizardStep): boolean => {
    if (s === 1) return step1Valid;
    if (s === 2) return step2Valid;
    return true;
  };

  const nameInvalid = touched.name === true && (data.name?.trim().length ?? 0) === 0;
  const descriptionInvalid =
    touched.description === true && (data.description?.trim().length ?? 0) === 0;

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setDirection("forward");
      setStep((s) => (s + 1) as WizardStep);
    }
  }, [step]);

  const goPrev = useCallback(() => {
    if (step > 1) {
      setDirection("backward");
      setStep((s) => (s - 1) as WizardStep);
    }
  }, [step]);

  // A step already answered stays reachable, which is what the design's Stepper
  // promises: the trail is navigation, not decoration.
  const goBackTo = useCallback((target: WizardStep) => {
    setDirection("backward");
    setStep(target);
  }, []);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const { url, markdown } = submitFullWorkout(data);

    if (url) {
      window.open(url, "_blank");
      toast.success(t("submit.success"));
    } else {
      const copied = await copyToClipboard(markdown);
      if (copied) {
        toast.success(t("submit.urlTooLong"));
      }
    }
  };

  const handleCopy = async () => {
    const { markdown } = submitFullWorkout(data);
    const copied = await copyToClipboard(markdown);
    if (copied) {
      toast.success(t("submit.copied"));
    }
  };

  // ---------------------------------------------------------------------------
  // Stepper
  // ---------------------------------------------------------------------------

  const renderStepper = () => {
    const stepTitles = [
      t("fullWorkout.step1Title"),
      t("fullWorkout.step2Title"),
      t("fullWorkout.step3Title"),
      t("fullWorkout.step4Title"),
    ];

    return (
      <ol className="zn-stepper">
        {stepTitles.map((title, index) => {
          const position = (index + 1) as WizardStep;
          const done = position < step;
          const current = position === step;

          return (
            <li key={position} className="zn-stepper__item">
              <button
                type="button"
                className="zn-stepper__step"
                data-state={done ? "done" : current ? "current" : "todo"}
                aria-current={current ? "step" : undefined}
                disabled={!done && !current}
                onClick={() => done && goBackTo(position)}
              >
                <span className="zn-stepper__rail" aria-hidden="true" />
                <span className="zn-stepper__name">
                  <span className="zn-stepper__num">
                    {done ? <Check size={12} /> : String(position).padStart(2, "0")}
                  </span>
                  <span className="zn-stepper__label">{title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    );
  };

  // ---------------------------------------------------------------------------
  // Step 1: Basic Info
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div
      className="zn-stack zn-contrib__pane"
      data-direction={direction}
      style={{ "--gap": "var(--sp-11)" } as CSSProperties}
    >
      {/* Name FR */}
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-name`}>
          {t("fullWorkout.nameLabel")}
          <span className="zn-contrib-field__req" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-name`}
          type="text"
          required
          value={data.name ?? ""}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          aria-invalid={nameInvalid || undefined}
          aria-describedby={nameInvalid ? `${uid}-name-error` : undefined}
          className="zn-contrib-input"
        />
        {nameInvalid && (
          <p id={`${uid}-name-error`} role="alert" className="zn-contrib-field__error">
            <AlertTriangle size={14} />
            {t("submit.required")}
          </p>
        )}
      </div>

      {/* Name EN */}
      <div className="zn-contrib-field">
        <label
          className="zn-contrib-field__label"
          data-optional="true"
          htmlFor={`${uid}-name-en`}
        >
          {t("fullWorkout.nameEnLabel")}
        </label>
        <input
          id={`${uid}-name-en`}
          type="text"
          value={data.nameEn ?? ""}
          onChange={(e) => update({ nameEn: e.target.value })}
          placeholder={t("fullWorkout.nameEnPlaceholder")}
          className="zn-contrib-input"
        />
      </div>

      {/* Description FR */}
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-description`}>
          {t("fullWorkout.descriptionLabel")}
          <span className="zn-contrib-field__req" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-description`}
          required
          value={data.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          rows={3}
          aria-invalid={descriptionInvalid || undefined}
          aria-describedby={descriptionInvalid ? `${uid}-description-error` : undefined}
          className="zn-contrib-input"
        />
        {descriptionInvalid && (
          <p
            id={`${uid}-description-error`}
            role="alert"
            className="zn-contrib-field__error"
          >
            <AlertTriangle size={14} />
            {t("submit.required")}
          </p>
        )}
      </div>

      {/* Description EN */}
      <div className="zn-contrib-field">
        <label
          className="zn-contrib-field__label"
          data-optional="true"
          htmlFor={`${uid}-description-en`}
        >
          {t("fullWorkout.descriptionEnLabel")}
        </label>
        <textarea
          id={`${uid}-description-en`}
          value={data.descriptionEn ?? ""}
          onChange={(e) => update({ descriptionEn: e.target.value })}
          placeholder={t("fullWorkout.descriptionEnPlaceholder")}
          rows={2}
          data-size="sm"
          className="zn-contrib-input"
        />
      </div>

      {/* Category + Difficulty */}
      <div
        className="zn-grid"
        style={{ "--cols": 2, "--gap": "var(--sp-8)" } as CSSProperties}
      >
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-category`}>
            {t("quickIdea.categoryLabel")}
          </label>
          <Select
            value={data.category ?? "endurance"}
            onValueChange={(v) => update({ category: v as WorkoutCategory })}
          >
            <SelectTrigger id={`${uid}-category`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <SelectItem key={cat} value={cat}>
                    {pickLang(meta, "label")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-difficulty`}>
            {t("quickIdea.difficultyLabel")}
          </label>
          <Select
            value={data.difficulty ?? "intermediate"}
            onValueChange={(v) => update({ difficulty: v as Difficulty })}
          >
            <SelectTrigger id={`${uid}-difficulty`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((diff) => {
                const meta = DIFFICULTY_META[diff];
                return (
                  <SelectItem key={diff} value={diff}>
                    {pickLang(meta, "label")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Session Type + Target System */}
      <div
        className="zn-grid"
        style={{ "--cols": 2, "--gap": "var(--sp-8)" } as CSSProperties}
      >
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-session-type`}>
            {t("fullWorkout.sessionTypeLabel")}
          </label>
          <Select
            value={data.sessionType ?? "endurance"}
            onValueChange={(v) => update({ sessionType: v as SessionType })}
          >
            <SelectTrigger id={`${uid}-session-type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((st) => (
                <SelectItem key={st} value={st}>
                  {pickLocale(SESSION_TYPE_LABELS[st])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-target-system`}>
            {t("fullWorkout.targetSystemLabel")}
          </label>
          <Select
            value={data.targetSystem ?? "aerobic_base"}
            onValueChange={(v) => update({ targetSystem: v as TargetSystem })}
          >
            <SelectTrigger id={`${uid}-target-system`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_SYSTEMS.map((ts) => (
                <SelectItem key={ts} value={ts}>
                  {pickLocale(TARGET_SYSTEM_LABELS[ts])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration Range, a fieldset, so "Min" is heard as part of the range */}
      <fieldset className="zn-contrib-group">
        <legend className="zn-contrib-group__legend">
          {t("fullWorkout.durationLabel")}
        </legend>
        <div
          className="zn-grid"
          style={{ "--cols": 2, "--cols-md": 2, "--gap": "var(--sp-8)" } as CSSProperties}
        >
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-duration-min`}>
              {t("fullWorkout.durationMin")}
            </label>
            <input
              id={`${uid}-duration-min`}
              type="number"
              min={0}
              value={data.typicalDuration?.min ?? 30}
              onChange={(e) =>
                update({
                  typicalDuration: {
                    min: Number(e.target.value),
                    max: data.typicalDuration?.max ?? 60,
                  },
                })
              }
              className="zn-contrib-input"
            />
          </div>
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-duration-max`}>
              {t("fullWorkout.durationMax")}
            </label>
            <input
              id={`${uid}-duration-max`}
              type="number"
              min={0}
              value={data.typicalDuration?.max ?? 60}
              onChange={(e) =>
                update({
                  typicalDuration: {
                    min: data.typicalDuration?.min ?? 30,
                    max: Number(e.target.value),
                  },
                })
              }
              className="zn-contrib-input"
            />
          </div>
        </div>
      </fieldset>

      {/* Environment toggles */}
      <fieldset className="zn-contrib-group">
        <legend className="zn-contrib-group__legend">{t("environment.title")}</legend>
        <div
          className="zn-grid"
          style={{ "--cols": 2, "--gap": "var(--sp-6)" } as CSSProperties}
        >
          {(
            [
              { key: "requiresHills", label: t("environment.requiresHills") },
              { key: "requiresTrack", label: t("environment.requiresTrack") },
              { key: "prefersFlat", label: t("environment.prefersFlat") },
              { key: "prefersSoft", label: t("environment.prefersSoft") },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="zn-contrib-toggle">
              <label className="zn-contrib-toggle__label" htmlFor={`${uid}-${key}`}>
                {label}
              </label>
              <Switch
                id={`${uid}-${key}`}
                checked={data.environment?.[key] ?? false}
                onCheckedChange={(checked) =>
                  update({
                    environment: {
                      ...data.environment!,
                      [key]: checked,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 2: Warmup + Main Set
  // ---------------------------------------------------------------------------

  const renderStep2 = () => (
    <div
      className="zn-stack zn-contrib__pane"
      data-direction={direction}
      style={{ "--gap": "var(--sp-17)" } as CSSProperties}
    >
      <WorkoutStepListEditor
        steps={data.warmupStructure ?? []}
        onChange={(steps) => updatePhaseSteps("warmup", steps)}
        label={t("blocks.warmup")}
      />

      <WorkoutStepListEditor
        steps={data.mainSetStructure ?? []}
        onChange={(steps) => updatePhaseSteps("main", steps)}
        label={t("blocks.mainSet")}
      />

      <div aria-live="polite">
        {!step2Valid && (data.mainSetStructure?.length ?? 0) === 0 && (
          <p className="zn-contrib-field__error">
            <AlertTriangle size={14} />
            {t("submit.atLeastOneBlock")}
          </p>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 3: Cooldown + Tips
  // ---------------------------------------------------------------------------

  const renderStep3 = () => (
    <div
      className="zn-stack zn-contrib__pane"
      data-direction={direction}
      style={{ "--gap": "var(--sp-17)" } as CSSProperties}
    >
      <WorkoutStepListEditor
        steps={data.cooldownStructure ?? []}
        onChange={(steps) => updatePhaseSteps("cooldown", steps)}
        label={t("blocks.cooldown")}
      />

      {/* Coaching Tips FR */}
      <StringListEditor
        items={data.coachingTips ?? []}
        onChange={(items) => update({ coachingTips: items })}
        label={t("tips.coachingLabel")}
        placeholder={t("tips.coachingPlaceholder")}
        addLabel={t("tips.addTip")}
        removeLabel={t("tips.removeTip")}
      />

      {/* Coaching Tips EN */}
      <StringListEditor
        items={data.coachingTipsEn ?? []}
        onChange={(items) => update({ coachingTipsEn: items })}
        label={t("tips.coachingEnLabel")}
        placeholder={t("tips.coachingPlaceholder")}
        addLabel={t("tips.addTip")}
        removeLabel={t("tips.removeTip")}
      />

      {/* Common Mistakes FR */}
      <StringListEditor
        items={data.commonMistakes ?? []}
        onChange={(items) => update({ commonMistakes: items })}
        label={t("tips.mistakesLabel")}
        placeholder={t("tips.mistakesPlaceholder")}
        addLabel={t("tips.addTip")}
        removeLabel={t("tips.removeTip")}
      />

      {/* Common Mistakes EN */}
      <StringListEditor
        items={data.commonMistakesEn ?? []}
        onChange={(items) => update({ commonMistakesEn: items })}
        label={t("tips.mistakesEnLabel")}
        placeholder={t("tips.mistakesPlaceholder")}
        addLabel={t("tips.addTip")}
        removeLabel={t("tips.removeTip")}
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 4: Preview + Submit
  // ---------------------------------------------------------------------------

  const renderStep4 = () => (
    <div
      className="zn-stack zn-contrib__pane"
      data-direction={direction}
      style={{ "--gap": "var(--sp-11)" } as CSSProperties}
    >
      <WorkoutPreview data={data} />

      {/* Submit buttons */}
      <div
        className="zn-row zn-contrib__actions"
        style={{ "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <Button type="button" onClick={handleSubmit}>
          <ExternalLink />
          {t("submit.generateIssue")}
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy}>
          <Copy />
          {t("submit.copyDescription")}
        </Button>
      </div>

      <p className="zn-caption zn-faint zn-contrib__note">{t("submit.thankYou")}</p>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      <p className="zn-body zn-body--sm zn-muted zn-contrib__lead">
        {t("fullWorkout.subtitle")}
      </p>

      {renderStepper()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Navigation buttons */}
      <div className="zn-row zn-row--split zn-contrib__nav">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={step === 1}
        >
          <ArrowLeft />
          {t("steps.previous")}
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canGoNext(step)}
          >
            {t("steps.next")}
            <ArrowRight />
          </Button>
        ) : (
          <div /> // Spacer - submit buttons are in step 4 content
        )}
      </div>
    </div>
  );
}
