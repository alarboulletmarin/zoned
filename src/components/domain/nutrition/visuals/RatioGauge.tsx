import { useTranslation } from "react-i18next";
import { carbRatios } from "@/data/nutrition";

/**
 * Glucose-to-fructose ratios and what each one lets the gut absorb.
 *
 * The recommended ratio wears the 2.5px vermillon frame, and its label is
 * vermillon type on the frame, a mark, not a second accent fill.
 */
export function RatioGauge() {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
    >
      <div className="zn-grid" style={{ "--cols": 3 } as React.CSSProperties}>
        {carbRatios.map((row) => (
          <div
            key={row.ratio}
            className="zn-nut-card"
            data-emphasis={row.highlight ? "accent" : undefined}
          >
            {row.highlight && (
              <span className="zn-nut-card__flag">
                {t("hub.carbs.ratios.recommended")}
              </span>
            )}
            <span className="zn-kicker">{t(row.labelKey)}</span>
            <p className="zn-nut-figure" data-size="lg">
              {row.ratio}
            </p>
            <p className="zn-nut-card__title">{t(row.capacityKey)}</p>
          </div>
        ))}
      </div>
      <p className="zn-source zn-nut-foot">{t("hub.carbs.ratios.footnote")}</p>
    </div>
  );
}
