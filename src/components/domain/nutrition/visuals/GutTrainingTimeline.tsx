import { useTranslation } from "react-i18next";
import { gutTraining } from "@/data/nutrition";

/**
 * Train your gut: four phases, 30 g/h to 90 g/h.
 *
 * A progression, so it rides the zone ink ramp and says the same thing twice,
 * ink density and bar height, exactly as a session profile does.
 */
export function GutTrainingTimeline() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-nut-panel">
      <p className="zn-kicker">{t("hub.during.gut.heading")}</p>
      <ol
        className="zn-grid zn-nut-list"
        style={{ "--cols": 4, "--cols-md": 2 } as React.CSSProperties}
      >
        {gutTraining.map((phase, idx) => {
          const step = Math.min(idx + 1, 6);
          return (
            <li key={phase.weekRangeKey} className="zn-nut-phase">
              <div
                className="zn-row"
                style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}
              >
                <span className="zn-nut-phase__index zn-nut-ramp" data-step={step}>
                  {idx + 1}
                </span>
                <span className="zn-kicker">{t(phase.weekRangeKey)}</span>
              </div>
              <p className="zn-nut-figure">
                {phase.carbsPerHour}
                <span className="zn-nut-figure__unit">g/h</span>
              </p>
              <span className="zn-nut-bar" aria-hidden="true">
                <span className="zn-nut-bar__fill" data-step={step} />
              </span>
              <p className="zn-nut-card__text">{t(phase.detailKey)}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
