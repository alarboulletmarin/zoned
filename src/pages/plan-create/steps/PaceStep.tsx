import { useState, type CSSProperties } from "react";
import { ChronoInput } from "@/components/ui/chrono-input";
import { RACE_DISTANCE_META } from "@/types/plan";
import {
  formatPaceDigits,
  paceDigits,
  paceDigitsToSeconds,
  secondsToPaceDigits,
  secondsToTimeDigits,
  timeDigitsToSeconds,
} from "@/lib/paceFields";
import { useIsEnglish } from "@/lib/i18n-utils";
import { formatReadableTime } from "@/lib/splits";
import type { StepContext, StepDef } from "../types";

/**
 * L'allure cible et le temps cible, sur le même écran, liés.
 *
 * C'étaient deux onglets : taper un temps cachait l'allure qu'il donnait, et
 * repasser sur l'allure effaçait le temps. Les deux champs sont maintenant
 * côte à côte et chacun SUIT l'autre, comme sur le convertisseur d'allure :
 * on remplit celui que l'on connaît, on lit l'autre.
 *
 * Les deux portent le masque du chronomètre (`ChronoInput`) : les chiffres
 * entrent par la droite, 430 se lit 4:30, 33000 se lit 3:30:00, et la
 * distance départage minutes et heures sur quatre chiffres. Sous chacun, la
 * lecture en clair : la vitesse sous l'allure, le temps en mots sous le
 * chrono, pour que 3:30 ne laisse aucun doute.
 *
 * `form.targetPace` reste la chaîne `M:SS` que le reste du parcours lit. Le
 * chrono est de l'état LOCAL, rederivé de l'allure à l'ouverture : le
 * brouillon ne persiste que l'allure, ce qui compte pour le plan.
 */
function PaceBody({ form, setForm, uid, t, pick, goForward }: StepContext) {
  const isEn = useIsEnglish();
  const meta = form.raceDistance ? RACE_DISTANCE_META[form.raceDistance] : null;
  const distanceKm = meta?.distanceKm ?? 0;
  const isTrail = form.practice === "trail" || form.practice === "ultra";

  const paceSeconds = paceDigitsToSeconds(paceDigits(form.targetPace));
  const finishFromPace = (seconds: number | undefined) =>
    seconds && distanceKm > 0
      ? secondsToTimeDigits(Math.round(seconds * distanceKm), distanceKm)
      : "";

  const [finishDigits, setFinishDigits] = useState(() => finishFromPace(paceSeconds));
  const finishSeconds = timeDigitsToSeconds(finishDigits, distanceKm);

  const onPaceDigits = (digits: string) => {
    setForm((f) => ({ ...f, targetPace: formatPaceDigits(digits) }));
    setFinishDigits(finishFromPace(paceDigitsToSeconds(digits)));
  };

  const onFinishDigits = (digits: string) => {
    setFinishDigits(digits);
    const total = timeDigitsToSeconds(digits, distanceKm);
    const pace =
      total && distanceKm > 0 ? formatPaceDigits(secondsToPaceDigits(total / distanceKm)) : "";
    setForm((f) => ({ ...f, targetPace: pace }));
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goForward();
  };

  const speed =
    paceSeconds && paceSeconds > 0
      ? (3600 / paceSeconds).toFixed(1).replace(".", isEn ? "." : ",")
      : null;

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      {isTrail && <p className="zn-caption zn-faint">{t("pace.trailHint")}</p>}
      <p className="zn-caption zn-faint">{t("pace.linkedHint")}</p>

      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-pace`}>
          {t("pace.targetPaceLabel")}
        </label>
        <span className="zn-chrono">
          <ChronoInput
            id={`${uid}-pace`}
            format="ms"
            placeholder="0:00"
            aria-describedby={speed ? `${uid}-pace-reading` : undefined}
            digits={paceDigits(form.targetPace)}
            onDigitsChange={onPaceDigits}
            onKeyDown={onEnter}
            className="zn-chrono__input"
          />
          <span className="zn-chrono__unit" aria-hidden="true">
            min/km
          </span>
        </span>
        {speed && (
          <p id={`${uid}-pace-reading`} className="zn-chrono__reading">
            {t("pace.speedReading", { speed })}
          </p>
        )}
      </div>

      {meta && (
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-finish`}>
            {t("pace.targetFinishTimeLabel", { distance: pick(meta, "label") })}
          </label>
          <span className="zn-chrono">
            <ChronoInput
              id={`${uid}-finish`}
              format="hms"
              distanceKm={distanceKm}
              placeholder="0:00:00"
              aria-describedby={finishSeconds ? `${uid}-finish-reading` : undefined}
              digits={finishDigits}
              onDigitsChange={onFinishDigits}
              onKeyDown={onEnter}
              className="zn-chrono__input"
            />
          </span>
          {finishSeconds ? (
            <p id={`${uid}-finish-reading`} className="zn-chrono__reading">
              {t("pace.timeReading", { time: formatReadableTime(finishSeconds) })}
            </p>
          ) : null}
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
