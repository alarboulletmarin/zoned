import { useId } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { usePickLang } from "@/lib/i18n-utils";
import { addDaysToDate, isoDateOnly } from "@/lib/planDates";
import { MAX_PLAN_WEEKS, RECOMMENDED_PLAN_WEEKS } from "@/lib/planGenerator/constants";
import {
  OPEN_WEEK_OPTIONS,
  earliestRaceDate,
  planMondayOf,
  type PlanForm,
} from "@/lib/planCreate";
import type { PrebuiltPlan } from "@/data/prebuilt-plans";
import { ScreenHead } from "./ScreenHead";

interface DateScreenProps {
  form: PlanForm;
  patch: (next: Partial<PlanForm>) => void;
  today: string;
  goalLabel: string;
  /** Le nombre de semaines, la même source que le plan (`planWeeksOf`). */
  weeks: number;
  start: string;
  end: string;
  dateOk: boolean;
  /** Un plan prêt sans course déjà choisi : sa durée est la sienne. */
  prebuilt: PrebuiltPlan | null;
  onContinue: () => void;
}

const fromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** 2.2 La date de la course, ou la durée d'un plan sans course. */
export function DateScreen(props: DateScreenProps) {
  return props.form.planPurpose === "race" ? <RaceDate {...props} /> : <OpenDuration {...props} />;
}

function RaceDate({ form, patch, today, goalLabel, weeks, start, dateOk, onContinue }: DateScreenProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const uid = useId();
  const rec = RECOMMENDED_PLAN_WEEKS[form.raceDistance ?? "10K"];
  const earliest = earliestRaceDate(rec.min, today, form.startThisWeek);
  const latest = addDaysToDate(planMondayOf(form, today), MAX_PLAN_WEEKS * 7 - 1);
  const selected = form.raceDate ? fromIso(form.raceDate) : undefined;

  return (
    <>
      <ScreenHead
        title={t("parcours.date.title")}
        lede={t("parcours.date.lede", { goal: goalLabel, min: rec.min })}
      />
      <div className="zn-pc__cal">
        <Calendar
          mode="single"
          aria-label={t("parcours.date.calendar")}
          selected={selected}
          onSelect={(d) => d && patch({ raceDate: isoDateOnly(d) })}
          defaultMonth={selected ?? fromIso(earliest)}
          startMonth={fromIso(earliest)}
          endMonth={fromIso(latest)}
          disabled={[{ before: fromIso(earliest) }, { after: fromIso(latest) }]}
        />
      </div>
      <p className="zn-pc__live" aria-live="polite">
        {form.raceDate && dateOk ? (
          <>
            <strong>{t("parcours.date.weeks", { count: weeks })}</strong>
            {t("parcours.date.live", { start: f.dayDate(start), end: f.dayDate(form.raceDate) })}
          </>
        ) : form.raceDate ? (
          t("date.tooSoon", { min: rec.min })
        ) : (
          t("parcours.date.pick")
        )}
      </p>
      {form.raceDate && weeks > rec.max && (
        <Alert kind="warning" title={t("date.tooLong", { weeks })}>
          {t("date.tooLongDetail", { min: rec.min, max: rec.max })}
        </Alert>
      )}
      <div className="zn-pc__field">
        <label htmlFor={`${uid}-name`}>
          {t("parcours.date.name")} <em>{t("parcours.date.optional")}</em>
        </label>
        <input
          id={`${uid}-name`}
          className="zn-pc__input"
          value={form.raceName}
          maxLength={100}
          placeholder={t("parcours.date.namePlaceholder")}
          onChange={(e) => patch({ raceName: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && dateOk) onContinue();
          }}
        />
      </div>
      <div className="zn-pc__actions">
        <Button size="lg" disabled={!dateOk} onClick={onContinue}>
          {t("nav.continue")}
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}

function OpenDuration({ form, patch, goalLabel, start, end, prebuilt, onContinue }: DateScreenProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const pick = usePickLang();

  return (
    <>
      <ScreenHead
        title={t("parcours.duration.title")}
        lede={
          prebuilt
            ? `${goalLabel}. ${t("parcours.duration.prebuilt", { name: pick(prebuilt, "name"), count: prebuilt.totalWeeks })}`
            : t("parcours.duration.lede", { goal: goalLabel })
        }
      />
      {!prebuilt && (
        <fieldset className="zn-pc__set">
          <legend className="sr-only">{t("parcours.duration.title")}</legend>
          <div className="zn-pc__weeks">
            {OPEN_WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                className="zn-pc__tile zn-pc__tile--num"
                aria-pressed={form.totalWeeksOverride === w}
                onClick={() => patch({ totalWeeksOverride: w })}
              >
                <span className="zn-pc__num">{w}</span>
                <span className="zn-pc__tile-sub">{t("parcours.duration.weeks")}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <p className="zn-pc__live" aria-live="polite">
        {t("parcours.duration.range", { start: f.dayDate(start), end: f.dayDate(end) })}
      </p>
      <div className="zn-pc__actions">
        <Button size="lg" onClick={onContinue}>
          {t("nav.continue")}
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}
