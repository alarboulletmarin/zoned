import { useState, useCallback } from "react";
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
import { ArrowLeft, ArrowRight, ExternalLink, Copy } from "@/components/icons";
import { BlockListEditor } from "./BlockListEditor";
import { WorkoutPreview } from "./WorkoutPreview";
import { StringListEditor } from "./StringListEditor";
import { submitFullWorkout, copyToClipboard } from "@/lib/issueBuilder";
import { cn } from "@/lib/utils";
import type {
  WorkoutTemplate,
  WorkoutBlock,
  WorkoutCategory,
  SessionType,
  TargetSystem,
  Difficulty,
} from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";
import { SESSION_TYPE_LABELS } from "@/lib/labels";

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
  const { t, i18n } = useTranslation("contribute");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

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

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const step1Valid =
    (data.name?.trim().length ?? 0) > 0 &&
    (data.description?.trim().length ?? 0) > 0;

  const step2Valid = (data.mainSetTemplate?.length ?? 0) > 0;

  const canGoNext = (s: WizardStep): boolean => {
    if (s === 1) return step1Valid;
    if (s === 2) return step2Valid;
    return true;
  };

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
  // Progress bar
  // ---------------------------------------------------------------------------

  const renderProgressBar = () => {
    const stepTitles = [
      t("fullWorkout.step1Title"),
      t("fullWorkout.step2Title"),
      t("fullWorkout.step3Title"),
      t("fullWorkout.step4Title"),
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            {t("steps.step")} {step}/{TOTAL_STEPS} - {stepTitles[step - 1]}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Step 1: Basic Info
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div
      className={cn(
        "space-y-6",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      {/* Name FR */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("fullWorkout.nameLabel")} <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={data.name ?? ""}
          onChange={(e) => update({ name: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>

      {/* Name EN */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t("fullWorkout.nameEnLabel")}
        </label>
        <input
          type="text"
          value={data.nameEn ?? ""}
          onChange={(e) => update({ nameEn: e.target.value })}
          placeholder={t("fullWorkout.nameEnPlaceholder")}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>

      {/* Description FR */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("fullWorkout.descriptionLabel")} <span className="text-destructive">*</span>
        </label>
        <textarea
          value={data.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
        />
      </div>

      {/* Description EN */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t("fullWorkout.descriptionEnLabel")}
        </label>
        <textarea
          value={data.descriptionEn ?? ""}
          onChange={(e) => update({ descriptionEn: e.target.value })}
          placeholder={t("fullWorkout.descriptionEnPlaceholder")}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
        />
      </div>

      {/* Category + Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("quickIdea.categoryLabel")}
          </label>
          <Select
            value={data.category ?? "endurance"}
            onValueChange={(v) => update({ category: v as WorkoutCategory })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <SelectItem key={cat} value={cat}>
                    {isEn ? meta.labelEn : meta.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("quickIdea.difficultyLabel")}
          </label>
          <Select
            value={data.difficulty ?? "intermediate"}
            onValueChange={(v) => update({ difficulty: v as Difficulty })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((diff) => {
                const meta = DIFFICULTY_META[diff];
                return (
                  <SelectItem key={diff} value={diff}>
                    {isEn ? meta.labelEn : meta.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Session Type + Target System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("fullWorkout.sessionTypeLabel")}
          </label>
          <Select
            value={data.sessionType ?? "endurance"}
            onValueChange={(v) => update({ sessionType: v as SessionType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((st) => (
                <SelectItem key={st} value={st}>
                  {isEn ? SESSION_TYPE_LABELS[st].en : SESSION_TYPE_LABELS[st].fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("fullWorkout.targetSystemLabel")}
          </label>
          <Select
            value={data.targetSystem ?? "aerobic_base"}
            onValueChange={(v) => update({ targetSystem: v as TargetSystem })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_SYSTEMS.map((ts) => (
                <SelectItem key={ts} value={ts}>
                  {isEn ? TARGET_SYSTEM_LABELS[ts].en : TARGET_SYSTEM_LABELS[ts].fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("fullWorkout.durationLabel")}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("fullWorkout.durationMin")}
            </label>
            <input
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
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("fullWorkout.durationMax")}
            </label>
            <input
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
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
        </div>
      </div>

      {/* Environment toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          {t("environment.title")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              { key: "requiresHills", label: t("environment.requiresHills") },
              { key: "requiresTrack", label: t("environment.requiresTrack") },
              { key: "prefersFlat", label: t("environment.prefersFlat") },
              { key: "prefersSoft", label: t("environment.prefersSoft") },
            ] as const
          ).map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <label className="text-sm">{label}</label>
              <Switch
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
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 2: Warmup + Main Set
  // ---------------------------------------------------------------------------

  const renderStep2 = () => (
    <div
      className={cn(
        "space-y-8",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <BlockListEditor
        blocks={data.warmupTemplate ?? []}
        onChange={(blocks: WorkoutBlock[]) => update({ warmupTemplate: blocks })}
        label={t("blocks.warmup")}
      />

      <BlockListEditor
        blocks={data.mainSetTemplate ?? []}
        onChange={(blocks: WorkoutBlock[]) => update({ mainSetTemplate: blocks })}
        label={t("blocks.mainSet")}
      />

      {!step2Valid && (data.mainSetTemplate?.length ?? 0) === 0 && (
        <p className="text-sm text-destructive text-center">
          {t("submit.atLeastOneBlock")}
        </p>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 3: Cooldown + Tips
  // ---------------------------------------------------------------------------

  const renderStep3 = () => (
    <div
      className={cn(
        "space-y-8",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <BlockListEditor
        blocks={data.cooldownTemplate ?? []}
        onChange={(blocks: WorkoutBlock[]) => update({ cooldownTemplate: blocks })}
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
      className={cn(
        "space-y-6",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <WorkoutPreview data={data} />

      {/* Submit buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1"
        >
          <ExternalLink className="size-4" />
          {t("submit.generateIssue")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
        >
          <Copy className="size-4" />
          {t("submit.copyDescription")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t("submit.thankYou")}
      </p>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("fullWorkout.subtitle")}
        </p>
      </div>

      {renderProgressBar()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={step === 1}
        >
          <ArrowLeft className="size-4" />
          {t("steps.previous")}
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canGoNext(step)}
          >
            {t("steps.next")}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <div /> // Spacer - submit buttons are in step 4 content
        )}
      </div>
    </div>
  );
}
