import { useTranslation } from "react-i18next";
import { Sun, Utensils, Coffee, HeartPulse, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { proteinTimeline } from "@/data/nutrition";

const ICONS: Array<React.ComponentType<IconProps>> = [Sun, Utensils, Coffee, HeartPulse, Moon];

/**
 * Five protein doses across the day. Ordered by the clock, so the glyphs climb
 * the ink ramp from waking to bedtime.
 */
export function ProteinTimingChart() {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
    >
      <ol
        className="zn-grid zn-nut-list"
        style={{ "--cols": 5, "--cols-md": 2 } as React.CSSProperties}
      >
        {proteinTimeline.map((step, i) => {
          const Icon = ICONS[i] ?? Utensils;
          return (
            <li key={step.labelKey} className="zn-nut-card">
              <div
                className="zn-row"
                style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}
              >
                <span
                  className="zn-nut-glyph zn-nut-ramp"
                  data-size="sm"
                  data-step={Math.min(i + 1, 6)}
                >
                  <Icon aria-hidden="true" />
                </span>
                <span className="zn-kicker">{t(step.labelKey)}</span>
              </div>
              <p className="zn-nut-figure" data-size="sm">
                {t(step.valueKey)}
              </p>
              {step.helperKey && (
                <p className="zn-nut-card__text">{t(step.helperKey)}</p>
              )}
            </li>
          );
        })}
      </ol>
      <p className="zn-source zn-nut-foot">{t("hub.protein.timeline.footnote")}</p>
    </div>
  );
}
