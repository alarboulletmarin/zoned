/**
 * The tunable numbers of a workout adapted from the catalogue (issue #130).
 *
 * The step editor below it can change anything; this panel is the short path
 * for the handful of numbers a runner actually wants to move, how many
 * repetitions, how long the effort lasts, how long the recovery lasts.
 *
 * Two controls per parameter, on purpose. The slider spans what the template
 * *recommends* (its `WorkoutScaling` range, or half to one and a half times
 * what it prescribes) and is the fast, coarse gesture. The field beside it
 * takes any value the kind of parameter admits, so the recommendation stays a
 * guide rather than a wall, asking for twenty repetitions is not a mistake,
 * and having to leave for the step editor to get there would defeat the point.
 * A value outside the recommendation widens the slider to reach it and says so.
 *
 * Slider bounds are frozen by the caller at the moment the draft is seeded, so
 * the scale does not shift under the cursor mid-drag.
 */

import { useEffect, useId, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { useIsEnglish } from "@/lib/i18n-utils";
import { getHardLimits, type AdjustableParam, type AdjustableParamKind } from "@/lib/workoutAdjust";
import type { WorkoutPhaseKey } from "@/types";

interface WorkoutParameterPanelProps {
  params: AdjustableParam[];
  /** Every frame of a drag, renders, but must not land in undo history. */
  onPreview: (paramId: string, value: number) => void;
  /** A released or typed value, one history entry per gesture. */
  onCommit: (paramId: string, value: number) => void;
}

const PHASE_ORDER: readonly WorkoutPhaseKey[] = ["warmup", "main", "cooldown"];

const PHASE_LABEL_KEYS: Record<WorkoutPhaseKey, string> = {
  warmup: "calculators:workoutBuilder.warmup",
  main: "calculators:workoutBuilder.mainSet",
  cooldown: "calculators:workoutBuilder.cooldown",
};

export function WorkoutParameterPanel({ params, onPreview, onCommit }: WorkoutParameterPanelProps) {
  const { t } = useTranslation("common");
  const isEnglish = useIsEnglish();

  if (params.length === 0) return null;

  return (
    <div className="zn-params">
      <div>
        {/* A heading, not a caption: the phase names below are <h3>, and they
            need something to nest under. Styled like the preview card's label
            so the two panels still read as siblings. */}
        <h2 className="zn-params__title">
          {t("calculators:workoutBuilder.parameters.title")}
        </h2>
        <p className="zn-params__hint">
          {t("calculators:workoutBuilder.parameters.hint")}
        </p>
      </div>

      {PHASE_ORDER.map((phase) => {
        const phaseParams = params.filter((param) => param.phase === phase);
        if (phaseParams.length === 0) return null;

        return (
          <div key={phase} className="zn-params__phase">
            <h3 className="zn-params__phase-title">
              {t(PHASE_LABEL_KEYS[phase])}
            </h3>
            {phaseParams.map((param) => (
              <ParameterRow
                key={param.id}
                param={param}
                isEnglish={isEnglish}
                onPreview={onPreview}
                onCommit={onCommit}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ParameterRow({
  param,
  isEnglish,
  onPreview,
  onCommit,
}: {
  param: AdjustableParam;
  isEnglish: boolean;
  onPreview: (paramId: string, value: number) => void;
  onCommit: (paramId: string, value: number) => void;
}) {
  const { t } = useTranslation("common");
  const context = (isEnglish ? param.labelEn ?? param.label : param.label).trim();
  const kindLabel = t(`calculators:workoutBuilder.parameters.kinds.${param.kind}`);
  const printedValue = formatParamValue(param, isEnglish);
  // Several rows share a kind, so the prose is what tells them apart, without
  // it, a screen reader hears "Effort" four times over.
  const fullLabel = context ? `${kindLabel} · ${context}` : kindLabel;
  const offRecommendation =
    param.value < param.recommendedMin || param.value > param.recommendedMax;
  // Up to three controls move the same number, so no single `htmlFor` is
  // honest. A labelled group carries the prose once; each control keeps its own
  // name for when it is read on its own.
  const headingId = useId();

  return (
    <div role="group" aria-labelledby={headingId} className="zn-params__row">
      <div className="zn-params__head">
        <p id={headingId} className="zn-params__label">
          <span>{kindLabel}</span>
          {context && <span className="zn-params__context"> · {context}</span>}
        </p>
        <ParameterFields param={param} label={fullLabel} onCommit={onCommit} />
      </div>

      <Slider
        value={[param.value]}
        min={param.min}
        max={param.max}
        step={param.step}
        onValueChange={([value]) => onPreview(param.id, value)}
        onValueCommit={([value]) => onCommit(param.id, value)}
        thumbLabel={fullLabel}
        thumbValueText={printedValue}
      />

      <p className="zn-params__warning" aria-live="polite">
        {offRecommendation
          ? t("calculators:workoutBuilder.parameters.offRecommendation", {
            range: formatRecommendedRange(param, isEnglish),
          })
          : ""}
      </p>
    </div>
  );
}

/**
 * The typed side of a parameter. Durations get the minutes/seconds pair the
 * step editor below already uses, rather than a raw count of seconds, nobody
 * types 1500 to mean twenty-five minutes.
 */
function ParameterFields({
  param,
  label,
  onCommit,
}: {
  param: AdjustableParam;
  label: string;
  onCommit: (paramId: string, value: number) => void;
}) {
  const limits = getHardLimits(param.kind);

  if (isDuration(param.kind)) {
    const minutes = Math.floor(param.value / 60);
    const seconds = param.value % 60;
    return (
      <div className="zn-params__fields">
        <NumberField
          value={minutes}
          min={0}
          max={Math.floor(limits.max / 60)}
          unit="min"
          label={`${label} · min`}
          onCommit={(next) => onCommit(param.id, next * 60 + seconds)}
        />
        <NumberField
          value={seconds}
          min={0}
          max={59}
          unit="s"
          label={`${label} · s`}
          onCommit={(next) => onCommit(param.id, minutes * 60 + next)}
        />
      </div>
    );
  }

  return (
    <NumberField
      value={param.value}
      min={limits.min}
      max={limits.max}
      unit={param.kind === "distance" ? "m" : undefined}
      label={label}
      onCommit={(next) => onCommit(param.id, next)}
      style={{ "--field-w": "56px" } as CSSProperties}
    />
  );
}

/**
 * A number input that only reports on commit. Held as text while focused so a
 * value can be cleared and retyped; an unreadable or out-of-range entry falls
 * back to the last good one instead of writing a broken workout.
 */
function NumberField({
  value,
  min,
  max,
  unit,
  label,
  onCommit,
  style,
}: {
  value: number;
  min: number;
  max: number;
  unit?: string;
  label: string;
  onCommit: (value: number) => void;
  /** Widens the input via `--field-w` when the value can run long. */
  style?: CSSProperties;
}) {
  const [draft, setDraft] = useState(String(value));

  // Sliders, undo and the step editor all move the same number. Whenever it
  // changes elsewhere, the field follows.
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(parsed)));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    // 36px matches the step editor's own number fields and keeps the hit area
    // usable on a phone. The focus ring lives on the wrapper because the unit
    // sits inside it: focusing the input must light the whole control.
    <span className="zn-numfield" style={style}>
      <input
        type="number"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        value={draft}
        min={min}
        max={max}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className="zn-numfield__input"
      />
      {unit && <span className="zn-numfield__unit">{unit}</span>}
    </span>
  );
}

// ── Formatting ──────────────────────────────────────────────────────

function isCount(kind: AdjustableParamKind): boolean {
  return kind === "sets" || kind === "reps" || kind === "blocks";
}

function isDuration(kind: AdjustableParamKind): boolean {
  return kind === "effortDuration" || kind === "recoveryDuration";
}

/** Counts print bare, durations as the prose does, distances in m or km. */
function formatParamValue(param: AdjustableParam, isEnglish: boolean): string {
  return formatValue(param.kind, param.value, isEnglish);
}

function formatRecommendedRange(param: AdjustableParam, isEnglish: boolean): string {
  return `${formatValue(param.kind, param.recommendedMin, isEnglish)} - ${formatValue(param.kind, param.recommendedMax, isEnglish)}`;
}

function formatValue(kind: AdjustableParamKind, value: number, isEnglish: boolean): string {
  if (isCount(kind)) return String(value);

  if (kind === "distance") {
    if (value < 1000) return `${Math.round(value)} m`;
    const km = value / 1000;
    const printed = Number.isInteger(km) ? String(km) : km.toFixed(1);
    return `${isEnglish ? printed : printed.replace(".", ",")} km`;
  }

  return formatSeconds(value);
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${String(rest).padStart(2, "0")}`;
}
