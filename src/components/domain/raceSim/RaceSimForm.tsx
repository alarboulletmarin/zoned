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
  /** Raw text, "45:00", "3:30:00", "45". */
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

/** Every field group is a small stack: label, control, hint. */
const GROUP = { "--gap": "var(--sp-4)" } as React.CSSProperties;

/**
 * Race parameters. Lives in the sticky left column on desktop and inside a
 * sheet on mobile, so the CTA sits at the foot of the panel, same pattern as
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
      className={cn("zn-stack", className)}
      style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
      onSubmit={(e) => {
        e.preventDefault();
        if (resolved.valid) onGenerate();
      }}
    >
      {/* Distance */}
      <div className="zn-stack" style={GROUP}>
        <FieldLabel>{t("inputs.distance")}</FieldLabel>
        <div className="zn-rs-form__choices">
          {RACE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("distance", opt.value)}
              aria-pressed={settings.distance === opt.value}
              className="zn-rs-choice"
            >
              {pick(opt, "label")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set("distance", "custom")}
            aria-pressed={settings.distance === "custom"}
            className="zn-rs-choice zn-rs-choice--wide"
          >
            {t("inputs.custom")}
          </button>
        </div>
        {settings.distance === "custom" && (
          <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
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
              className="zn-rs-field zn-rs-field--mono zn-rs-field--short"
            />
            <span className="zn-rs-form__suffix">km</span>
          </div>
        )}
      </div>

      {/* Target time */}
      <div className="zn-stack" style={GROUP}>
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
          className="zn-rs-field zn-rs-field--time"
        />
        <p
          id={`${uid}-time-hint`}
          className="zn-rs-form__hint"
          data-error={resolved.timeError || undefined}
        >
          {resolved.timeError ? t("inputs.timeInvalid") : t("inputs.timeHint")}
        </p>
      </div>

      {/* Start time */}
      <div className="zn-stack" style={GROUP}>
        <label htmlFor={`${uid}-start`}>
          <FieldLabel>{t("inputs.startTime")}</FieldLabel>
        </label>
        <input
          id={`${uid}-start`}
          type="time"
          value={settings.startTime}
          onChange={(e) => set("startTime", e.target.value)}
          className="zn-rs-field zn-rs-field--mono"
        />
      </div>

      {/* Strategy */}
      <div className="zn-stack" style={GROUP}>
        <FieldLabel>{t("inputs.strategy")}</FieldLabel>
        <Segmented
          label={t("inputs.strategy")}
          value={settings.strategy}
          onChange={(value) => set("strategy", value)}
          options={strategyOptions}
        />
        <p className="zn-rs-form__hint">{t(`inputs.${settings.strategy}Desc`)}</p>
      </div>

      {/* Weight */}
      <div className="zn-stack" style={GROUP}>
        <label htmlFor={`${uid}-weight`}>
          <FieldLabel>{t("inputs.weight")}</FieldLabel>
        </label>
        <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
          <input
            id={`${uid}-weight`}
            type="number"
            min={30}
            max={200}
            step={0.5}
            placeholder="70"
            value={settings.weight}
            onChange={(e) => set("weight", e.target.value)}
            className="zn-rs-field zn-rs-field--mono zn-rs-field--short"
          />
          <span className="zn-rs-form__suffix">{t("inputs.weightUnit")}</span>
        </div>
        <p className="zn-rs-form__hint">{t("inputs.weightHint")}</p>
      </div>

      <Button type="submit" disabled={!resolved.valid} className="zn-rs-form__submit">
        <Flag />
        {submitLabel}
      </Button>
    </form>
  );
}
