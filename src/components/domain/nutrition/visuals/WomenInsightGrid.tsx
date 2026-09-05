import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import { womenInsights } from "@/data/nutrition";

export function WomenInsightGrid() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-grid" style={{ "--cols": 2 } as React.CSSProperties}>
      {womenInsights.map((item) => {
        const Icon = NUTRITION_ICONS[item.iconName];
        return (
          <div key={item.titleKey} className="zn-nut-card">
            <div
              className="zn-row zn-row--start"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <span className="zn-nut-glyph">
                <Icon aria-hidden="true" />
              </span>
              <div
                className="zn-stack zn-fill"
                style={{ "--gap": "var(--sp-2)" } as React.CSSProperties}
              >
                <p className="zn-nut-card__title">{t(item.titleKey)}</p>
                <p className="zn-nut-card__text">{t(item.detailKey)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
