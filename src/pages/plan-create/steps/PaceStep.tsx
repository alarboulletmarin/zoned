import { useState, type CSSProperties } from "react";
import { Segmented } from "@/components/ui/segmented";
import { RACE_DISTANCE_META } from "@/types/plan";
import {
  formatPaceDigits,
  formatTimeDigits,
  normalizePaceDigits,
  paceDigits,
  secondsToPaceDigits,
  timeDigits,
  timeDigitsToSeconds,
} from "@/lib/paceFields";
import { estimateFinishTime, finishTimeToPaceSeconds, formatPace } from "../helpers";
import type { StepContext, StepDef } from "../types";

/**
 * L'allure cible, saisie comme une allure ou comme un chrono d'arrivée.
 *
 * Les deux champs portent le masque du chronomètre (`lib/paceFields.ts`) :
 * les chiffres entrent par la droite, 530 se lit 5:30, et le pavé est celui
 * des CHIFFRES seuls. Ils demandaient avant un deux-points tapé à la main et
 * refusaient tout le reste avec une erreur de format ; plus rien n'est à
 * refuser, 5:75 se range en 6:15 quand le champ est quitté.
 *
 * `form.targetPace` reste la chaîne `M:SS` que le reste du parcours lit. Le
 * mode de saisie et le chrono tapé sont de l'état LOCAL : le brouillon ne les
 * persiste pas, ce qui compte est l'allure.
 */
function PaceBody({ form, setForm, uid, t, derived, goForward }: StepContext) {
  const [paceInputMode, setPaceInputMode] = useState<"pace" | "time">("pace");
  const [finishDigits, setFinishDigits] = useState("");

  const { paceSeconds } = derived;
  const distanceKm = form.raceDistance
    ? RACE_DISTANCE_META[form.raceDistance].distanceKm
    : 0;
  const finishSeconds = timeDigitsToSeconds(finishDigits, distanceKm);
  const isTrail = form.practice === "trail" || form.practice === "ultra";

  const setPaceFromDigits = (digits: string) =>
    setForm((f) => ({ ...f, targetPace: formatPaceDigits(digits) }));

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
            pattern="[0-9]*"
            autoComplete="off"
            data-mono="true"
            className="zn-contrib-input"
            placeholder={t("pace.pacePlaceholder")}
            value={form.targetPace}
            onChange={(e) => {
              setPaceFromDigits(paceDigits(e.target.value));
              setFinishDigits("");
            }}
            onBlur={() => setPaceFromDigits(normalizePaceDigits(paceDigits(form.targetPace)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") goForward();
            }}
          />
          <p className="zn-mono zn-faint">
            {paceSeconds && distanceKm > 0
              ? `${t("pace.estimatedFinish")}${estimateFinishTime(paceSeconds, distanceKm)}`
              : t("pace.paceMaskHint")}
          </p>
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
            pattern="[0-9]*"
            autoComplete="off"
            data-mono="true"
            className="zn-contrib-input"
            placeholder={t("pace.timePlaceholder")}
            value={formatTimeDigits(finishDigits)}
            onChange={(e) => {
              const digits = timeDigits(e.target.value);
              setFinishDigits(digits);
              const totalSec = timeDigitsToSeconds(digits, distanceKm);
              if (totalSec && distanceKm > 0) {
                setPaceFromDigits(
                  secondsToPaceDigits(finishTimeToPaceSeconds(totalSec, distanceKm)),
                );
              } else {
                setForm((f) => ({ ...f, targetPace: "" }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") goForward();
            }}
          />
          <p className="zn-mono zn-faint">
            {finishSeconds && distanceKm > 0
              ? `${t("pace.requiredPace")}${formatPace(finishTimeToPaceSeconds(finishSeconds, distanceKm))} min/km`
              : t("pace.timeMaskHint")}
          </p>
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
