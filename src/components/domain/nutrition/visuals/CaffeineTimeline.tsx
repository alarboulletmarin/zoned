import { useTranslation } from "react-i18next";
import { AlertTriangle, Coffee } from "@/components/icons";
import type { CaffeineStep } from "@/data/nutrition/types";

interface Props {
  steps: CaffeineStep[];
  contraindicationsKeys?: string[];
}

/**
 * The caffeine protocol, T-90 to the gun.
 *
 * An ordered scale, so the marks climb the zone ink ramp: the closer to the
 * start, the more ink. Six steps is the ramp's range, which is more than the
 * four this protocol has.
 */
export function CaffeineTimeline({ steps, contraindicationsKeys = [] }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
    >
      <div className="zn-nut-panel">
        <ol className="zn-nut-steps">
          {steps.map((step, idx) => (
            <li key={step.timeLabelKey} className="zn-nut-step">
              <span
                className="zn-nut-step__mark zn-nut-ramp"
                data-step={Math.min(idx + 1, 6)}
              >
                <Coffee aria-hidden="true" />
              </span>
              <div className="zn-nut-step__body">
                <p className="zn-nut-step__time">{t(step.timeLabelKey)}</p>
                <p className="zn-nut-step__text">{t(step.actionKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {contraindicationsKeys.length > 0 && (
        <div className="zn-nut-note">
          <AlertTriangle className="zn-nut-note__glyph" aria-hidden="true" />
          <div className="zn-nut-note__body">
            <p className="zn-nut-note__title">
              {t("hub.caffeine.contraindications.heading")}
            </p>
            <ul className="zn-nut-note__list">
              {contraindicationsKeys.map((k) => (
                <li key={k}>{t(k)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
