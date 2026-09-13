import type { CSSProperties } from "react";
import { AlertTriangle, Plus, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { Option } from "../Option";
import { RACE_DISTANCE_META, type RaceDistance } from "@/types/plan";
import { PRIORITY_OPTIONS, VALIDATION_KEYS } from "../constants";
import type { StepContext, StepDef } from "../types";

/**
 * Les courses de préparation. Facultatif, jusqu'à cinq.
 *
 * Les mutateurs vivent dans la coquille (`goals.add` / `.remove` / `.update`)
 * parce qu'ils touchent `form.intermediateGoals` et que la validation croisée
 * des dates est dérivée là-haut.
 */
function IntermediateGoalsBody({
  form,
  uid,
  t,
  pick,
  derived,
  goals,
}: StepContext) {
  const { intermediateGoalValidation, intermediateGoalMaxDate, todayDate } = derived;
  const errorsForGoal = (idx: number) =>
    intermediateGoalValidation.errors.filter((e) => e.goalIndex === idx);

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
                {form.intermediateGoals.map((goal, idx) => {
                  const goalErrors = errorsForGoal(idx);
                  return (
                    <Card key={idx} size="compact" className="zn-wiz-race">
                      <CardContent
                        className="zn-stack"
                        style={{ "--gap": "var(--sp-8)" } as CSSProperties}
                      >
                        <div className="zn-row zn-row--split">
                          <span className="zn-mono zn-faint">{`#${idx + 1}`}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="zn-wiz-race__remove"
                            onClick={() => goals.remove(idx)}
                          >
                            <Trash2 />
                            {t("intermediateGoals.remove")}
                          </Button>
                        </div>

                        <div className="zn-contrib-field">
                          <span
                            className="zn-contrib-field__label"
                            id={`${uid}-goal-${idx}-distance-label`}
                          >
                            {t("intermediateGoals.distance")}
                          </span>
                          <div
                            className="zn-cluster"
                            role="radiogroup"
                            aria-labelledby={`${uid}-goal-${idx}-distance-label`}
                          >
                            {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => (
                              <button
                                key={dist}
                                type="button"
                                role="radio"
                                aria-checked={goal.raceDistance === dist}
                                className="zn-chip"
                                onClick={() => goals.update(idx, { raceDistance: dist })}
                              >
                                {pick(RACE_DISTANCE_META[dist], "label")}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="zn-contrib-field">
                          <label
                            className="zn-contrib-field__label"
                            htmlFor={`${uid}-goal-${idx}-date`}
                          >
                            {t("intermediateGoals.date")}
                          </label>
                          <DateInput
                            id={`${uid}-goal-${idx}-date`}
                            min={form.startDate || todayDate}
                            max={intermediateGoalMaxDate}
                            value={goal.raceDate}
                            onChange={(e) => goals.update(idx, { raceDate: e.target.value })}
                            aria-label={t("intermediateGoals.date")}
                          />
                        </div>

                        <div className="zn-contrib-field">
                          <label
                            className="zn-contrib-field__label"
                            htmlFor={`${uid}-goal-${idx}-name`}
                          >
                            {t("intermediateGoals.name")}
                          </label>
                          <input
                            id={`${uid}-goal-${idx}-name`}
                            type="text"
                            className="zn-contrib-input"
                            value={goal.raceName ?? ""}
                            onChange={(e) => goals.update(idx, { raceName: e.target.value })}
                            placeholder={t("intermediateGoals.namePlaceholder")}
                            maxLength={100}
                          />
                        </div>

                        <fieldset className="zn-contrib-group">
                          <legend className="zn-contrib-group__legend">
                            {t("intermediateGoals.priority")}
                          </legend>
                          <div
                            className="zn-stack"
                            style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                          >
                            {PRIORITY_OPTIONS.map((opt) => (
                              <Option
                                key={opt.value}
                                name={`${uid}-priority-${idx}`}
                                checked={goal.priority === opt.value}
                                title={t(opt.labelKey)}
                                body={t(opt.descKey)}
                                data={t(`intermediateGoals.badge.${opt.value}`)}
                                onSelect={() => goals.update(idx, { priority: opt.value })}
                              />
                            ))}
                          </div>
                        </fieldset>

                        {goalErrors.length > 0 && (
                          <div className="zn-stack" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
                            {goalErrors.map((err, eIdx) => {
                              const key = VALIDATION_KEYS[err.code];
                              return (
                                <p key={eIdx} role="alert" className="zn-contrib-field__error">
                                  <AlertTriangle size={14} />
                                  {key ? t(key) : err.message}
                                </p>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {form.intermediateGoals.length < 5 ? (
                  <Button variant="outline" onClick={goals.add}>
                    <Plus />
                    {t("intermediateGoals.add")}
                  </Button>
                ) : (
                  <p className="zn-mono zn-faint">{t("intermediateGoals.maxReached")}</p>
                )}
              </div>
  );
}

export const intermediateGoalsStep: StepDef = {
  id: "intermediate_goals",
  titleKey: "intermediateGoals.title",
  subtitleKey: "intermediateGoals.subtitle",
  Body: IntermediateGoalsBody,
  isComplete: (form, derived) =>
    form.intermediateGoals.length === 0 || derived.intermediateGoalValidation.valid,
  nextLabelKey: "nav.continue",
  showSkip: true,
};
