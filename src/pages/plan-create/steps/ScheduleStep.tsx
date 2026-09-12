import type { CSSProperties } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { DAYS_PER_WEEK_OPTIONS } from "../constants";
import type { StepContext, StepDef } from "../types";

/** La semaine type : combien de séances, quel jour la longue, du renfort. */
function ScheduleBody({ form, setForm, uid, t }: StepContext) {
  // Une reprise et un début de course ne se font pas à sept séances.
  const dayOptions = DAYS_PER_WEEK_OPTIONS.filter((n) =>
    form.planPurpose === "return_from_injury" ? n <= 4
      : form.planPurpose === "beginner_start" ? n <= 5
        : true
  );

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
                <div className="zn-contrib-field">
                  <span className="zn-contrib-field__label">
                    {t("schedule.sessionsPerWeek")}
                  </span>
                  <Segmented
                    label={t("schedule.sessionsPerWeek")}
                    value={String(form.daysPerWeek)}
                    onChange={(v) => setForm((f) => ({ ...f, daysPerWeek: parseInt(v, 10) }))}
                    options={dayOptions.map((n) => ({ value: String(n), label: String(n) }))}
                  />
                </div>

                <div className="zn-contrib-field">
                  <span className="zn-contrib-field__label">
                    {t("schedule.longRunDay")}
                  </span>
                  <Segmented
                    label={t("schedule.longRunDay")}
                    value={String(form.longRunDay)}
                    onChange={(v) => setForm((f) => ({ ...f, longRunDay: parseInt(v, 10) }))}
                    options={Array.from({ length: 7 }, (_, idx) => ({
                      value: String(idx),
                      label: t(`daysShort.${idx}`),
                      title: t(`days.${idx}`),
                    }))}
                  />
                  <p className="zn-caption zn-faint">{t("schedule.longRunDayDesc")}</p>
                </div>

                <div className="zn-contrib-toggle">
                  <label className="zn-contrib-toggle__label" htmlFor={`${uid}-strength`}>
                    {t("schedule.includeStrength")}
                  </label>
                  <Switch
                    id={`${uid}-strength`}
                    checked={form.includeStrength}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, includeStrength: !!checked }))
                    }
                  />
                </div>
                <p className="zn-caption zn-faint">{t("schedule.includeStrengthDesc")}</p>

                {form.includeStrength && (
                  <div className="zn-contrib-field">
                    <span className="zn-contrib-field__label">
                      {t("schedule.strengthFrequency")}
                    </span>
                    <Segmented
                      label={t("schedule.strengthFrequency")}
                      value={String(form.strengthFrequency)}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          strengthFrequency: parseInt(v, 10) as 1 | 2 | 3,
                        }))
                      }
                      options={[1, 2, 3].map((n) => ({
                        value: String(n),
                        label: t("schedule.strengthPerWeek", { n }),
                      }))}
                    />
                  </div>
                )}
              </div>
  );
}

export const scheduleStep: StepDef = {
  id: "schedule",
  titleKey: "schedule.title",
  subtitleKey: "schedule.subtitle",
  Body: ScheduleBody,
  isComplete: () => true,
  nextLabelKey: "nav.continue",
};
