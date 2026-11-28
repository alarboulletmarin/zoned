import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { usePickLang } from "@/lib/i18n-utils";
import { normalizeVma, parseVma, vmaInput } from "@/lib/paceFields";
import type { PlanForm } from "@/lib/planCreate";
import { DIFFICULTY_META, type Difficulty } from "@/types";
import type { TrainingGoal } from "@/types/plan";
import { DAYS_PER_WEEK_OPTIONS } from "./constants";
import { suggestLevel } from "./helpers";
import { ScreenHead } from "./ScreenHead";

const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const AIMS: TrainingGoal[] = ["finish", "time", "compete"];

interface YouScreenProps {
  form: PlanForm;
  patch: (next: Partial<PlanForm>) => void;
  onContinue: () => void;
}

/**
 * 2.4 Toi et ta semaine, sur mesure seulement. Un seul écran, déjà rempli :
 * le profil et Mes zones d'abord, des valeurs courantes sinon. Deux réponses
 * restent au coureur : son niveau, jamais coché d'office, et ce qu'il court
 * aujourd'hui, d'où le plan démarre.
 */
export function YouScreen({ form, patch, onContinue }: YouScreenProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const uid = useId();
  const isRace = form.planPurpose === "race";
  const typedVma = parseVma(form.vma);
  const suggested = typedVma ? suggestLevel(typedVma) : null;
  // Une reprise et un début de course ne se font pas à sept séances.
  const dayOptions = DAYS_PER_WEEK_OPTIONS.filter((n) =>
    form.planPurpose === "return_from_injury" ? n <= 4 : form.planPurpose === "beginner_start" ? n <= 5 : true,
  );

  return (
    <>
      <ScreenHead title={t("parcours.you.title")} lede={t("parcours.you.lede")} />

      <fieldset className="zn-pc__set">
        <legend>{t("parcours.you.level")}</legend>
        <div className="zn-pc__pills zn-pc__pills--4">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className="zn-pc__pill"
              aria-pressed={form.runnerLevel === level}
              onClick={() => patch({ runnerLevel: level })}
            >
              {pick(DIFFICULTY_META[level], "label")}
            </button>
          ))}
        </div>
        <p className="zn-pc__hint">{t(`parcours.you.levelHint.${form.runnerLevel ?? "none"}`)}</p>
        <div className="zn-pc__inline">
          <label htmlFor={`${uid}-weekly`}>{t("parcours.refine.weeklyKm")}</label>
          <span className="zn-pc__unit">
            <input
              id={`${uid}-weekly`}
              className="zn-pc__input zn-pc__input--short"
              type="number"
              inputMode="numeric"
              min={0}
              max={300}
              placeholder="25"
              value={form.currentWeeklyKm}
              aria-describedby={`${uid}-weekly-hint`}
              onChange={(e) => patch({ currentWeeklyKm: e.target.value })}
            />
            {t("parcours.refine.weeklyKmUnit")}
          </span>
        </div>
        <p id={`${uid}-weekly-hint`} className="zn-pc__hint">{t("parcours.you.weeklyKmHint")}</p>
        <div className="zn-pc__inline">
          <label htmlFor={`${uid}-vma`}>{t("parcours.you.vma")}</label>
          <span className="zn-pc__unit">
            <input
              id={`${uid}-vma`}
              className="zn-pc__input zn-pc__input--short"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={t("level.vmaPlaceholder")}
              value={form.vma}
              aria-describedby={`${uid}-vma-hint`}
              onChange={(e) => patch({ vma: vmaInput(e.target.value) })}
              onBlur={() => patch({ vma: normalizeVma(form.vma) })}
            />
            km/h
          </span>
        </div>
        <p id={`${uid}-vma-hint`} className="zn-pc__hint">
          {suggested ? (
            <>
              {t("level.vmaSuggestion", { vma: form.vma })}
              <strong>{pick(DIFFICULTY_META[suggested], "label")}</strong>
              {t("level.vmaSuggestionSuffix")}
            </>
          ) : (
            <>
              {t("level.vmaHint")} <Link to="/calculators/vma">{t("level.vmaUnknown")}</Link>
            </>
          )}
        </p>
      </fieldset>

      <fieldset className="zn-pc__set">
        <legend>{t("schedule.sessionsPerWeek")}</legend>
        <Segmented
          label={t("schedule.sessionsPerWeek")}
          value={String(form.daysPerWeek)}
          onChange={(v) => patch({ daysPerWeek: Number(v) })}
          options={dayOptions.map((n) => ({ value: String(n), label: String(n) }))}
        />
      </fieldset>

      <fieldset className="zn-pc__set">
        <legend>{t("schedule.longRunDay")}</legend>
        <Segmented
          label={t("schedule.longRunDay")}
          value={String(form.longRunDay)}
          onChange={(v) => patch({ longRunDay: Number(v) })}
          options={Array.from({ length: 7 }, (_, i) => ({
            value: String(i),
            label: t(`days.${i}`).charAt(0),
            title: t(`days.${i}`),
          }))}
        />
      </fieldset>

      <fieldset className="zn-pc__set">
        <legend>{isRace ? t("parcours.you.aim") : t("parcours.you.rhythm")}</legend>
        <div className="zn-pc__pills zn-pc__pills--3">
          {AIMS.map((aim) => (
            <button
              key={aim}
              type="button"
              className="zn-pc__pill"
              aria-pressed={form.trainingGoal === aim}
              onClick={() => patch({ trainingGoal: aim })}
            >
              {t(`parcours.you.aims.${aim}`)}
            </button>
          ))}
        </div>
        <p className="zn-pc__hint">{t(`parcours.you.aimHint.${form.trainingGoal}`)}</p>
      </fieldset>

      <div className="zn-pc__actions">
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!form.runnerLevel}
          aria-describedby={form.runnerLevel ? undefined : `${uid}-ready`}
        >
          {t("parcours.you.see")}
          <ArrowRight />
        </Button>
        {!form.runnerLevel && (
          <p id={`${uid}-ready`} className="zn-pc__hint">{t("parcours.you.chooseLevel")}</p>
        )}
      </div>
    </>
  );
}
