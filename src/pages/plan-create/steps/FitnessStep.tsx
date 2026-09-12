import type { CSSProperties } from "react";
import type { StepContext, StepDef } from "../types";

/** Où j'en suis : volume et sortie longue actuels. Facultatif. */
function FitnessBody({ form, setForm, uid, t }: StepContext) {
  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
              <div className="zn-contrib-field">
                <label className="zn-contrib-field__label" htmlFor={`${uid}-weekly-km`}>
                  {t("fitness.weeklyKm")}
                </label>
                <input
                  id={`${uid}-weekly-km`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={300}
                  data-mono="true"
                  className="zn-contrib-input"
                  placeholder={t("fitness.weeklyKmPlaceholder")}
                  value={form.currentWeeklyKm}
                  aria-describedby={`${uid}-weekly-km-hint`}
                  onChange={(e) => setForm((f) => ({ ...f, currentWeeklyKm: e.target.value }))}
                />
                <p id={`${uid}-weekly-km-hint`} className="zn-caption zn-faint">
                  {t("fitness.weeklyKmDesc")}
                </p>
              </div>

              <div className="zn-contrib-field">
                <label className="zn-contrib-field__label" htmlFor={`${uid}-long-run-km`}>
                  {t("fitness.longRunKm")}
                </label>
                <input
                  id={`${uid}-long-run-km`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  data-mono="true"
                  className="zn-contrib-input"
                  placeholder={t("fitness.longRunKmPlaceholder")}
                  value={form.currentLongRunKm}
                  aria-describedby={`${uid}-long-run-km-hint`}
                  onChange={(e) => setForm((f) => ({ ...f, currentLongRunKm: e.target.value }))}
                />
                <p id={`${uid}-long-run-km-hint`} className="zn-caption zn-faint">
                  {t("fitness.longRunKmDesc")}
                </p>
              </div>
            </div>
  );
}

export const fitnessStep: StepDef = {
  id: "fitness",
  titleKey: "fitness.title",
  subtitleKey: "fitness.subtitle",
  Body: FitnessBody,
  isComplete: () => true,
  nextLabelKey: "nav.continue",
  showSkip: true,
};
