import { useState, type CSSProperties } from "react";
import { AlertTriangle } from "@/components/icons";
import { Segmented } from "@/components/ui/segmented";
import { RACE_DISTANCE_META } from "@/types/plan";
import {
  estimateFinishTime,
  finishTimeToPaceSeconds,
  formatPace,
  parseFinishTimeToSeconds,
} from "../helpers";
import type { StepContext, StepDef } from "../types";

/**
 * L'allure cible, saisie comme une allure ou comme un chrono d'arrivée.
 *
 * Le mode de saisie et le chrono tapé sont de l'état LOCAL : ils ne sortaient
 * jamais de cette étape, et les garder dans la page en faisait deux `useState`
 * de plus au sommet du parcours. Le brouillon ne les persiste pas non plus,
 * ce qui compte est l'allure, et elle vit dans `form.targetPace`.
 */
function PaceBody({ form, setForm, uid, t, derived, goForward }: StepContext) {
  const [paceInputMode, setPaceInputMode] = useState<"pace" | "time">("pace");
  const [targetFinishTime, setTargetFinishTime] = useState("");

  const { paceSeconds } = derived;
  const distanceKm = form.raceDistance
    ? RACE_DISTANCE_META[form.raceDistance].distanceKm
    : 0;
  const finishSeconds = parseFinishTimeToSeconds(targetFinishTime);
  // `isTrail` ne gouvernait qu'une phrase d'aide, et le champ dénivelé qui
  // vivait ici rendait SANS CONDITION, un coureur de 5 km sur route se
  // faisait demander un D+. Le dénivelé est parti dans l'étape terrain, qui
  // n'apparaît qu'en trail et en ultra ; et la pratique est maintenant la
  // source, au lieu d'une devinette sur la distance.
  const isTrail = form.practice === "trail" || form.practice === "ultra";

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
                {isTrail && <p className="zn-caption zn-faint">{t("pace.trailHint")}</p>}

                <Segmented
                  label={t("pace.title")}
                  value={paceInputMode}
                  onChange={(v) => setPaceInputMode(v as "pace" | "time")}
                  options={[
                    { value: "pace", label: t("pace.targetPaceTab") },
                    { value: "time", label: t("pace.targetTimeTab") },
                  ]}
                />

                {paceInputMode === "pace" ? (
                  <div className="zn-contrib-field">
                    <label className="zn-contrib-field__label" htmlFor={`${uid}-pace`}>
                      {t("pace.targetPaceLabel")}
                    </label>
                    <input
                      id={`${uid}-pace`}
                      type="text"
                      inputMode="numeric"
                      data-mono="true"
                      className="zn-contrib-input"
                      placeholder={t("pace.pacePlaceholder")}
                      value={form.targetPace}
                      aria-invalid={(!!form.targetPace && !paceSeconds) || undefined}
                      aria-describedby={
                        form.targetPace && !paceSeconds ? `${uid}-pace-error` : undefined
                      }
                      onChange={(e) => {
                        setForm((f) => ({ ...f, targetPace: e.target.value }));
                        setTargetFinishTime("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (paceSeconds || !form.targetPace)) goForward();
                      }}
                    />
                    {paceSeconds && distanceKm > 0 && (
                      <p className="zn-mono zn-faint">
                        {t("pace.estimatedFinish")}
                        {estimateFinishTime(paceSeconds, distanceKm)}
                      </p>
                    )}
                    {form.targetPace && !paceSeconds && (
                      <p id={`${uid}-pace-error`} role="alert" className="zn-contrib-field__error">
                        <AlertTriangle size={14} />
                        {t("pace.paceFormatError")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="zn-contrib-field">
                    <label className="zn-contrib-field__label" htmlFor={`${uid}-finish`}>
                      {t("pace.targetFinishTimeLabel")}
                    </label>
                    <input
                      id={`${uid}-finish`}
                      type="text"
                      inputMode="numeric"
                      data-mono="true"
                      className="zn-contrib-input"
                      placeholder={t("pace.timePlaceholder")}
                      value={targetFinishTime}
                      aria-invalid={(!!targetFinishTime && !finishSeconds) || undefined}
                      aria-describedby={
                        targetFinishTime && !finishSeconds ? `${uid}-finish-error` : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setTargetFinishTime(val);
                        const totalSec = parseFinishTimeToSeconds(val);
                        if (totalSec && distanceKm > 0) {
                          const paceSec = finishTimeToPaceSeconds(totalSec, distanceKm);
                          setForm((f) => ({ ...f, targetPace: formatPace(paceSec) }));
                        } else {
                          setForm((f) => ({ ...f, targetPace: "" }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (finishSeconds || !targetFinishTime)) goForward();
                      }}
                    />
                    {finishSeconds && distanceKm > 0 && (
                      <p className="zn-mono zn-faint">
                        {t("pace.requiredPace")}
                        {`${formatPace(finishTimeToPaceSeconds(finishSeconds, distanceKm))} min/km`}
                      </p>
                    )}
                    {targetFinishTime && !finishSeconds && (
                      <p id={`${uid}-finish-error`} role="alert" className="zn-contrib-field__error">
                        <AlertTriangle size={14} />
                        {t("pace.timeFormatHint")}
                      </p>
                    )}
                  </div>
                )}
              </div>
  );
}

export const paceStep: StepDef = {
  id: "pace",
  titleKey: "pace.title",
  subtitleKey: "pace.subtitle",
  Body: PaceBody,
  isComplete: (form, derived) => form.targetPace === "" || !!derived.paceSeconds,
  nextLabelKey: "nav.continue",
  showSkip: true,
};
