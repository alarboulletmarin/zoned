import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "../icons";
import type { SupplementEntry } from "@/data/nutrition/types";

interface Props {
  items: SupplementEntry[];
}

/**
 * The AIS supplement ladder, seventeen entries.
 *
 * A to D is an ordered scale of evidence, so it is painted on the zone ink
 * ramp: A is solid ink, C is faint, and D, "no evidence", takes the 45
 * degree hatch the system reserves for the unmeasured. The verdict keeps its
 * words and loses its coloured dot, which said nothing the words did not.
 */
export function SupplementGrid({ items }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-grid" style={{ "--cols": 3 } as React.CSSProperties}>
      {items.map((item) => {
        const Icon = NUTRITION_ICONS[item.iconName];
        const card = (
          <div className="zn-nut-card">
            <div
              className="zn-row zn-row--split"
              style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
            >
              <span className="zn-nut-glyph" data-size="sm">
                <Icon aria-hidden="true" />
              </span>
              <span
                className="zn-cluster zn-fixed"
                style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
              >
                <span
                  className="zn-nut-ais"
                  data-ais={item.aisCategory}
                  title={t(`hub.supplements.aisLabel.${item.aisCategory}`)}
                >
                  {item.aisCategory}
                </span>
                <span className="zn-nut-tag">
                  {t(`hub.supplements.verdicts.${item.verdict}`)}
                </span>
              </span>
            </div>
            <p className="zn-nut-card__title">{t(item.nameKey)}</p>
            <p className="zn-nut-card__text">{t(item.rationaleKey)}</p>
            <div className="zn-nut-supp__facts">
              <div className="zn-nut-supp__fact">
                <span className="zn-kicker zn-kicker--xs">
                  {t("hub.supplements.doseLabel")}
                </span>
                <p className="zn-nut-supp__value">{t(item.doseKey)}</p>
              </div>
              <div className="zn-nut-supp__fact">
                <span className="zn-kicker zn-kicker--xs">
                  {t("hub.supplements.whenLabel")}
                </span>
                <p className="zn-nut-supp__value">{t(item.whenKey)}</p>
              </div>
            </div>
          </div>
        );

        return item.glossaryTermId ? (
          <Link
            key={item.id}
            to={`/glossary/${item.glossaryTermId}`}
            className="zn-nut-supp-link"
          >
            {card}
          </Link>
        ) : (
          <div key={item.id}>{card}</div>
        );
      })}
    </div>
  );
}
