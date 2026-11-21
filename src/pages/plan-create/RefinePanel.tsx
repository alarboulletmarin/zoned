import { useId, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ChevronDown, Plus, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ChronoInput } from "@/components/ui/chrono-input";
import { DateInput } from "@/components/ui/date-input";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import {
  formatPaceDigits,
  paceDigits,
  paceDigitsToSeconds,
  secondsToPaceDigits,
  secondsToTimeDigits,
  timeDigitsToSeconds,
} from "@/lib/paceFields";
import { formatReadableTime } from "@/lib/splits";
import { addDaysToDate, isoDayOfWeek, mondayOfDate } from "@/lib/planDates";
import type { ValidationResult } from "@/lib/intermediateGoalValidation";
import type { PlanForm } from "@/lib/planCreate";
import type { TerrainType } from "@/types";
import { RACE_DISTANCE_META, type IntermediateGoal, type RaceDistance } from "@/types/plan";
import { Option } from "./Option";
import { PRIORITY_OPTIONS, VALIDATION_KEYS } from "./constants";

const TERRAINS: TerrainType[] = ["trail_runnable", "trail_technical", "mountain"];
const MAX_PREP_RACES = 5;

interface RefinePanelProps {
  form: PlanForm;
  patch: (next: Partial<PlanForm>) => void;
  today: string;
  /** Le premier jour du plan. */
  start: string;
  isTrail: boolean;
  goalsValidation: ValidationResult;
}

/**
 * Affiner, replié par défaut, sur mesure seulement : ce que le parcours
 * demandait sur quatre écrans et que la plupart des gens n'ont pas besoin de
 * toucher. Chaque changement régénère l'aperçu (les champs tapés après
 * 150 ms, les boutons tout de suite).
 */
export function RefinePanel({ form, patch, today, start, isTrail, goalsValidation }: RefinePanelProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const uid = useId();
  // Ouvert d'office quand il porte déjà quelque chose qui peut être faux.
  const [open, setOpen] = useState(form.intermediateGoals.length > 0);
  const isMonday = isoDayOfWeek(today) === 0;

  const updateGoal = (index: number, next: Partial<IntermediateGoal>) =>
    patch({
      intermediateGoals: form.intermediateGoals.map((g, i) => (i === index ? { ...g, ...next } : g)),
    });

  return (
    <section className="zn-pc__refine">
      <button
        type="button"
        className="zn-pc__refine-head"
        aria-expanded={open}
        aria-controls={`${uid}-refine`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{t("parcours.refine.title")}</span>
        <span className="zn-pc__tile-sub zn-pc__refine-sum">
          {isTrail ? t("parcours.refine.summaryTrail") : t("parcours.refine.summaryRoad")}
        </span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div id={`${uid}-refine`} className="zn-pc__refine-body">
          {!isMonday && (
            <div className="zn-pc__set">
              <div className="zn-pc__switch">
                <label htmlFor={`${uid}-this-week`}>{t("parcours.refine.thisWeek")}</label>
                <Switch
                  id={`${uid}-this-week`}
                  checked={form.startThisWeek}
                  onCheckedChange={(checked) => patch({ startThisWeek: !!checked })}
                />
              </div>
              <p className="zn-pc__hint">
                {t("parcours.refine.thisWeekHint", { date: f.dayDate(mondayOfDate(today)) })}
              </p>
            </div>
          )}

          <div className="zn-pc__set">
            <div className="zn-pc__switch">
              <label htmlFor={`${uid}-strength`}>{t("parcours.refine.strength")}</label>
              <Switch
                id={`${uid}-strength`}
                checked={form.includeStrength}
                onCheckedChange={(checked) => patch({ includeStrength: !!checked })}
              />
            </div>
            {form.includeStrength && (
              <Segmented
                label={t("parcours.refine.strengthFreq")}
                value={String(form.strengthFrequency)}
                onChange={(v) => patch({ strengthFrequency: Number(v) as 1 | 2 })}
                options={[1, 2].map((n) => ({
                  value: String(n),
                  label: t("parcours.refine.strengthPerWeek", { count: n }),
                }))}
              />
            )}
          </div>

          <NumberRow
            id={`${uid}-weekly`}
            label={t("parcours.refine.weeklyKm")}
            unit={t("parcours.refine.weeklyKmUnit")}
            value={form.currentWeeklyKm}
            max={300}
            placeholder="30"
            onChange={(v) => patch({ currentWeeklyKm: v })}
          />
          <NumberRow
            id={`${uid}-long`}
            label={t("parcours.refine.longRunKm")}
            unit={t("parcours.refine.longRunKmUnit")}
            value={form.currentLongRunKm}
            max={100}
            placeholder="12"
            onChange={(v) => patch({ currentLongRunKm: v })}
          />

          {isTrail ? (
            <>
              <fieldset className="zn-pc__set">
                <legend>{t("terrain.kind")}</legend>
                {/* Des puces qui passent à la ligne : en segments, Sentier roulant est coupé à 390 px. */}
                <div className="zn-cluster">
                  {TERRAINS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={form.terrain === kind}
                      className="zn-chip"
                      onClick={() => patch({ terrain: kind })}
                    >
                      {t(`terrain.kinds.${kind}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <NumberRow
                id={`${uid}-dplus`}
                label={t("terrain.elevation")}
                unit={t("parcours.refine.elevationUnit")}
                value={form.elevationGain}
                max={10000}
                placeholder="1200"
                onChange={(v) => patch({ elevationGain: v })}
              />
            </>
          ) : (
            form.planPurpose === "race" && <PaceFields form={form} patch={patch} />
          )}

          {form.planPurpose === "race" && form.raceDate && (
            <fieldset className="zn-pc__set">
              <legend>{t("parcours.refine.prep")}</legend>
              {form.intermediateGoals.map((goal, index) => (
                <PrepRace
                  key={index}
                  index={index}
                  goal={goal}
                  min={start}
                  max={addDaysToDate(form.raceDate, -14)}
                  errors={goalsValidation.errors.filter((e) => e.goalIndex === index)}
                  onChange={(next) => updateGoal(index, next)}
                  onRemove={() =>
                    patch({ intermediateGoals: form.intermediateGoals.filter((_, i) => i !== index) })
                  }
                />
              ))}
              {form.intermediateGoals.length < MAX_PREP_RACES ? (
                <Button
                  variant="outline"
                  className="zn-pc__add"
                  onClick={() =>
                    patch({
                      intermediateGoals: [
                        ...form.intermediateGoals,
                        { raceDistance: "10K", raceDate: "", raceName: "", priority: "B" },
                      ],
                    })
                  }
                >
                  <Plus />
                  {t("intermediateGoals.add")}
                </Button>
              ) : (
                <p className="zn-pc__hint">{t("intermediateGoals.maxReached")}</p>
              )}
            </fieldset>
          )}
        </div>
      )}
    </section>
  );
}

function NumberRow(props: {
  id: string;
  label: string;
  unit: string;
  value: string;
  max: number;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="zn-pc__inline">
      <label htmlFor={props.id}>{props.label}</label>
      <span className="zn-pc__unit">
        <input
          id={props.id}
          className="zn-pc__input zn-pc__input--short"
          type="number"
          inputMode="numeric"
          min={0}
          max={props.max}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        {props.unit}
      </span>
    </div>
  );
}

/**
 * L'allure cible et le temps visé, liés : on remplit celui qu'on connaît, on
 * lit l'autre. Route seulement : en trail, l'allure ne veut pas dire grand-chose.
 */
function PaceFields({ form, patch }: { form: PlanForm; patch: (next: Partial<PlanForm>) => void }) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const uid = useId();
  const meta = form.raceDistance ? RACE_DISTANCE_META[form.raceDistance] : null;
  const distanceKm = meta?.distanceKm ?? 0;
  const paceSeconds = paceDigitsToSeconds(paceDigits(form.targetPace));
  const finishFromPace = (seconds: number | undefined) =>
    seconds && distanceKm > 0 ? secondsToTimeDigits(Math.round(seconds * distanceKm), distanceKm) : "";
  const [finishDigits, setFinishDigits] = useState(() => finishFromPace(paceSeconds));
  const finishSeconds = timeDigitsToSeconds(finishDigits, distanceKm);
  const speed =
    paceSeconds && paceSeconds > 0 ? (3600 / paceSeconds).toFixed(1).replace(".", isEn ? "." : ",") : null;

  return (
    <div className="zn-pc__set">
      <p className="zn-pc__hint">{t("pace.linkedHint")}</p>
      <div className="zn-pc__inline">
        <label htmlFor={`${uid}-pace`}>{t("pace.targetPaceLabel")}</label>
        <span className="zn-chrono">
          <ChronoInput
            id={`${uid}-pace`}
            format="ms"
            placeholder="0:00"
            digits={paceDigits(form.targetPace)}
            onDigitsChange={(digits) => {
              patch({ targetPace: formatPaceDigits(digits) });
              setFinishDigits(finishFromPace(paceDigitsToSeconds(digits)));
            }}
            className="zn-chrono__input"
          />
          <span className="zn-chrono__unit" aria-hidden="true">
            min/km
          </span>
        </span>
      </div>
      {speed && <p className="zn-pc__hint">{t("pace.speedReading", { speed })}</p>}
      {meta && (
        <div className="zn-pc__inline">
          <label htmlFor={`${uid}-finish`}>
            {t("pace.targetFinishTimeLabel", { distance: pick(meta, "label") })}
          </label>
          <span className="zn-chrono">
            <ChronoInput
              id={`${uid}-finish`}
              format="hms"
              distanceKm={distanceKm}
              placeholder="0:00:00"
              digits={finishDigits}
              onDigitsChange={(digits) => {
                setFinishDigits(digits);
                const total = timeDigitsToSeconds(digits, distanceKm);
                patch({
                  targetPace:
                    total && distanceKm > 0 ? formatPaceDigits(secondsToPaceDigits(total / distanceKm)) : "",
                });
              }}
              className="zn-chrono__input"
            />
          </span>
        </div>
      )}
      {finishSeconds ? (
        <p className="zn-pc__hint">{t("pace.timeReading", { time: formatReadableTime(finishSeconds) })}</p>
      ) : null}
    </div>
  );
}

/** Une course de préparation, avec la validation du parcours d'avant. */
function PrepRace(props: {
  index: number;
  goal: IntermediateGoal;
  min: string;
  max: string;
  errors: ValidationResult["errors"];
  onChange: (next: Partial<IntermediateGoal>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const uid = useId();
  const { goal } = props;

  return (
    <div className="zn-pc__prep">
      <div className="zn-pc__prep-head">
        <span className="zn-mono zn-faint">{`#${props.index + 1}`}</span>
        <Button variant="ghost" size="sm" onClick={props.onRemove}>
          <Trash2 />
          {t("intermediateGoals.remove")}
        </Button>
      </div>
      <div className="zn-pc__field">
        <span id={`${uid}-dist`} className="zn-pc__field-label">
          {t("intermediateGoals.distance")}
        </span>
        <div className="zn-cluster" role="radiogroup" aria-labelledby={`${uid}-dist`}>
          {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => (
            <button
              key={dist}
              type="button"
              role="radio"
              aria-checked={goal.raceDistance === dist}
              className="zn-chip"
              onClick={() => props.onChange({ raceDistance: dist })}
            >
              {pick(RACE_DISTANCE_META[dist], "label")}
            </button>
          ))}
        </div>
      </div>
      <div className="zn-pc__field">
        <label htmlFor={`${uid}-date`}>{t("intermediateGoals.date")}</label>
        <DateInput
          id={`${uid}-date`}
          min={props.min}
          max={props.max}
          value={goal.raceDate}
          onChange={(e) => props.onChange({ raceDate: e.target.value })}
          aria-label={t("intermediateGoals.date")}
        />
      </div>
      <div className="zn-pc__field">
        <label htmlFor={`${uid}-name`}>{t("intermediateGoals.name")}</label>
        <input
          id={`${uid}-name`}
          className="zn-pc__input"
          value={goal.raceName ?? ""}
          maxLength={100}
          placeholder={t("intermediateGoals.namePlaceholder")}
          onChange={(e) => props.onChange({ raceName: e.target.value })}
        />
      </div>
      <fieldset className="zn-pc__set">
        <legend>{t("intermediateGoals.priority")}</legend>
        <div className="zn-stack" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          {PRIORITY_OPTIONS.map((opt) => (
            <Option
              key={opt.value}
              name={`${uid}-priority`}
              checked={goal.priority === opt.value}
              title={t(opt.labelKey)}
              body={t(opt.descKey)}
              data={t(`intermediateGoals.badge.${opt.value}`)}
              onSelect={() => props.onChange({ priority: opt.value })}
            />
          ))}
        </div>
      </fieldset>
      {props.errors.map((err, i) => {
        const key = VALIDATION_KEYS[err.code];
        return (
          <p key={i} role="alert" className="zn-pc__error">
            <AlertTriangle size={14} />
            {key ? t(key) : err.message}
          </p>
        );
      })}
    </div>
  );
}
