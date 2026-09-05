import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import { heatProtocols } from "@/data/nutrition";

export function HeatGrid() {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-grid"
      style={{ "--cols": 4, "--cols-md": 2 } as React.CSSProperties}
    >
      {heatProtocols.map((p) => {
        const Icon = NUTRITION_ICONS[p.iconName];
        return (
          <div key={p.titleKey} className="zn-nut-card">
            <div
              className="zn-row"
              style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}
            >
              <span className="zn-nut-glyph" data-size="sm">
                <Icon aria-hidden="true" />
              </span>
              <span className="zn-nut-tag">{t(p.durationKey)}</span>
            </div>
            <p className="zn-nut-card__title">{t(p.titleKey)}</p>
            <p className="zn-nut-card__text">{t(p.detailKey)}</p>
          </div>
        );
      })}
    </div>
  );
}
