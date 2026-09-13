import type { CSSProperties } from "react";
import { AlertTriangle } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { DateInput } from "@/components/ui/date-input";
import { Segmented } from "@/components/ui/segmented";
import { formatDate } from "@/lib/i18n-utils";
import type { StepContext, StepDef } from "../types";

/** La date de la course, et le départ du plan. */
function DateBody({ form, setForm, uid, t, derived }: StepContext) {
  const {
    minDate,
    minWeeksForDistance,
    weeksCount,
    dateValid,
    dateTooLong,
    recommendedWeeks,
    todayDate,
  } = derived;

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-race-date`}>
          {t("date.raceDate")}
          <span className="zn-contrib-field__req" aria-hidden="true">*</span>
        </label>
        <DateInput
          id={`${uid}-race-date`}
          min={minDate}
          value={form.raceDate}
          onChange={(e) => setForm((f) => ({ ...f, raceDate: e.target.value }))}
          aria-label={t("date.raceDate")}
        />
        {form.raceDate && dateValid && (
          <p className="zn-mono zn-faint">
            {t("date.weeks", { count: weeksCount })}
          </p>
        )}
        {form.raceDate && !dateValid && (
          <p role="alert" className="zn-contrib-field__error">
            <AlertTriangle size={14} />
            {t("date.tooSoon", { min: minWeeksForDistance })}
          </p>
        )}
      </div>

      <div className="zn-contrib-field">
        <span className="zn-contrib-field__label">{t("date.startLabel")}</span>
        <Segmented
          label={t("date.startLabel")}
          value={form.useCustomStartDate ? "custom" : "now"}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              useCustomStartDate: v === "custom",
              startDate: v === "custom" ? f.startDate || todayDate : todayDate,
            }))
          }
          options={[
            { value: "now", label: t("date.startNow") },
            { value: "custom", label: t("date.chooseStartDate") },
          ]}
        />
        {form.useCustomStartDate && (
          <DateInput
            id={`${uid}-start-date`}
            value={form.startDate}
            max={form.raceDate || undefined}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            aria-label={t("date.startLabel")}
          />
        )}
        {form.raceDate && form.useCustomStartDate && (
          <p className="zn-caption zn-faint">
            {t("date.startHint", {
              date: formatDate(form.startDate, { year: "numeric", month: "short", day: "numeric" }),
            })}
          </p>
        )}
      </div>

      {form.raceDate && dateTooLong && (
        <Alert kind="warning" title={t("date.tooLong", { weeks: weeksCount })}>
          {t("date.tooLongDetail", { min: recommendedWeeks.min, max: recommendedWeeks.max })}
        </Alert>
      )}
    </div>
  );
}

export const dateStep: StepDef = {
  id: "date",
  titleKey: "date.title",
  subtitleKey: "date.subtitle",
  subtitleParams: (_form, derived) => ({ min: derived.minWeeksForDistance }),
  Body: DateBody,
  isComplete: (_form, derived) => derived.dateValid,
  nextLabelKey: "nav.continue",
};
