import { useTranslation } from "react-i18next";
import { Zap, Utensils, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";

interface Phase {
  key: "immediate" | "short" | "long";
  Icon: React.ComponentType<IconProps>;
}

const PHASES: Phase[] = [
  { key: "immediate", Icon: Zap },
  { key: "short", Icon: Utensils },
  { key: "long", Icon: Moon },
];

/**
 * The three recovery windows. Ordered by how far they reach past the finish,
 * so the glyphs walk the ink ramp from the first minutes to the next day.
 */
export function RecoveryWindow() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-grid" style={{ "--cols": 3 } as React.CSSProperties}>
      {PHASES.map(({ key, Icon }, idx) => (
        <div key={key} className="zn-nut-card">
          <div
            className="zn-row"
            style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}
          >
            <span
              className="zn-nut-glyph zn-nut-ramp"
              data-size="sm"
              data-step={idx + 1}
            >
              <Icon aria-hidden="true" />
            </span>
            <span className="zn-nut-tag">
              {t(`hub.recovery.phases.${key}.window`)}
            </span>
          </div>
          <h3 className="zn-nut-card__title">
            {t(`hub.recovery.phases.${key}.title`)}
          </h3>
          <p className="zn-nut-card__text">
            {t(`hub.recovery.phases.${key}.detail`)}
          </p>
        </div>
      ))}
    </div>
  );
}
