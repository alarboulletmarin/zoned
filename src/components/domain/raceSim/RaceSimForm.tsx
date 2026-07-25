import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Flag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { usePickLang } from "@/lib/i18n-utils";
import type { SplitStrategy } from "@/lib/splits";
import { cn } from "@/lib/utils";
import { parseTargetTime } from "./utils";
import { FieldLabel } from "./RaceSimSection";

export interface RaceSimSettings {
  /** A RACE_OPTIONS value, or "custom". */
  distance: string;
  customDistance: string;
  /** Raw text — "45:00", "3:30:00", "45". */
  targetTime: string;
  startTime: string;
  strategy: SplitStrategy;
  /** Empty means "not provided": the plan falls back to 70 kg internally. */
  weight: string;
}

export interface RaceOption {
  label: string;
  labelEn: string;
  value: string;
  distanceKm: number;
}

export const RACE_OPTIONS: RaceOption[] = [
  { label: "5K", labelEn: "5K", value: "5", distanceKm: 5 },
  { label: "10K", labelEn: "10K", value: "10", distanceKm: 10 },
  { label: "Semi", labelEn: "Half", value: "21.1", distanceKm: 21.1 },
  { label: "Marathon", labelEn: "Marathon", value: "42.195", distanceKm: 42.195 },
];

export const DEFAULT_SETTINGS: RaceSimSettings = {
  distance: "10",
  customDistance: "",
  targetTime: "45:00",
  startTime: "08:30",
  strategy: "even",
  weight: "",
};

export interface ResolvedSettings {
  distanceKm: number;
  targetSeconds: number | null;
  /** True when the time field holds something, but nothing parseable. */
  timeError: boolean;
  valid: boolean;
}

export function resolveSettings(s: RaceSimSettings): ResolvedSettings {
  const distanceKm =
    s.distance === "custom"
      ? parseFloat(s.customDistance) || 0
      : parseFloat(s.distance);
  const targetSeconds = parseTargetTime(s.targetTime);
  return {
    distanceKm,
    targetSeconds,
    timeError: s.targetTime.trim() !== "" && targetSeconds === null,
    valid: distanceKm > 0 && targetSeconds !== null && targetSeconds > 0,
  };
}

const FIELD =
  "h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Native steppers are tiny targets and look dated; the value is typed, not nudged.
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/**
 * Race parameters. Lives in the sticky left column on desktop and inside a
 * sheet on mobile, so the CTA sits at the foot of the panel — same pattern as
 * the "Ma semaine" generator rather than a button buried in a settings card.
 */
export function RaceSimForm({
  settings,
  onChange,
  onGenerate,
  submitLabel,
  className,
}: {
  settings: RaceSimSettings;
  onChange: (next: RaceSimSettings) => void;
  onGenerate: () => void;
  submitLabel: string;
  className?: string;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();
  const uid = useId();
  const resolved = resolveSettings(settings);

  const set = <K extends keyof RaceSimSettings>(
    key: K,
    value: RaceSimSettings[K],
  ) => onChange({ ...settings, [key]: value });

  const strategyOptions = (
    ["even", "negative", "positive"] as const
  ).map((value) => ({ value, label: t(`inputs.${value}`) }));

  return (
    <form
      className={cn("space-y-5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (resolved.valid) onGenerate();
      }}
    >
      {/* Distance */}
      <div>
        <FieldLabel>{t("inputs.distance")}</FieldLabel>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {RACE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("distance", opt.value)}
              aria-pressed={settings.distance === opt.value}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                settings.distance === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-muted",
              )}
            >
              {pick(opt, "label")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set("distance", "custom")}
            aria-pressed={settings.distance === "custom"}
            className={cn(
              "col-span-2 rounded-md border px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              settings.distance === "custom"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-muted",
            )}
          >
            {t("inputs.custom")}
          </button>
        </div>
        {settings.distance === "custom" && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={0.5}
              max={200}
              step={0.1}
              autoFocus
              placeholder="15"
              aria-label={t("inputs.custom")}
              value={settings.customDistance}
              onChange={(e) => set("customDistance", e.target.value)}
              className={cn(FIELD, NO_SPINNER, "max-w-[8rem] tabular-nums")}
            />
            <span className="text-sm text-muted-foreground">km</span>
          </div>
        )}
      </div>

      {/* Target time */}
      <div>
        <label htmlFor={`${uid}-time`}>
          <FieldLabel>{t("inputs.targetTime")}</FieldLabel>
        </label>
        <input
          id={`${uid}-time`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="45:00"
          aria-invalid={resolved.timeError || undefined}
          aria-describedby={`${uid}-time-hint`}
          value={settings.targetTime}
          onChange={(e) => set("targetTime", e.target.value)}
          className={cn(
            FIELD,
            "mt-2 font-mono text-lg tabular-nums tracking-tight",
            resolved.timeError && "border-destructive",
          )}
        />
        <p
          id={`${uid}-time-hint`}
          className={cn(
            "mt-1 text-xs",
            resolved.timeError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {resolved.timeError ? t("inputs.timeInvalid") : t("inputs.timeHint")}
        </p>
      </div>

      {/* Start time */}
      <div>
        <label htmlFor={`${uid}-start`}>
          <FieldLabel>{t("inputs.startTime")}</FieldLabel>
        </label>
        <input
          id={`${uid}-start`}
          type="time"
          value={settings.startTime}
          onChange={(e) => set("startTime", e.target.value)}
          className={cn(FIELD, "mt-2 font-mono tabular-nums")}
        />
      </div>

      {/* Strategy */}
      <div>
        <FieldLabel>{t("inputs.strategy")}</FieldLabel>
        <Segmented
          className="mt-2"
          label={t("inputs.strategy")}
          value={settings.strategy}
          onChange={(value) => set("strategy", value)}
          options={strategyOptions}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t(`inputs.${settings.strategy}Desc`)}
        </p>
      </div>

      {/* Weight */}
      <div>
        <label htmlFor={`${uid}-weight`}>
          <FieldLabel>{t("inputs.weight")}</FieldLabel>
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id={`${uid}-weight`}
            type="number"
            min={30}
            max={200}
            step={0.5}
            placeholder="70"
            value={settings.weight}
            onChange={(e) => set("weight", e.target.value)}
            className={cn(FIELD, NO_SPINNER, "max-w-[8rem] tabular-nums")}
          />
          <span className="text-sm text-muted-foreground">
            {t("inputs.weightUnit")}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("inputs.weightHint")}
        </p>
      </div>

      <Button type="submit" disabled={!resolved.valid} className="w-full">
        <Flag className="size-4" />
        {submitLabel}
      </Button>
    </form>
  );
}
