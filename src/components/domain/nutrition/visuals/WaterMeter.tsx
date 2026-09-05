import { useTranslation } from "react-i18next";
import { Droplets, Sun, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";

const MOMENTS: Array<{
  key: "morning" | "day" | "evening";
  Icon: React.ComponentType<IconProps>;
}> = [
  { key: "morning", Icon: Sun },
  { key: "day", Icon: Droplets },
  { key: "evening", Icon: Moon },
];

/** Morning, day, evening — ordered by the clock, so the glyphs walk the ramp. */
export function WaterMeter() {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
    >
      <div className="zn-grid" style={{ "--cols": 3 } as React.CSSProperties}>
        {MOMENTS.map(({ key, Icon }, idx) => (
          <div key={key} className="zn-nut-card">
            <div
              className="zn-row zn-row--start"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <span
                className="zn-nut-glyph zn-nut-ramp"
                data-size="sm"
                data-step={idx + 1}
              >
                <Icon aria-hidden="true" />
              </span>
              <div
                className="zn-stack zn-fill"
                style={{ "--gap": "var(--sp-2)" } as React.CSSProperties}
              >
                <span className="zn-kicker">
                  {t(`hub.hydration.${key}.label`)}
                </span>
                <p className="zn-nut-card__title">
                  {t(`hub.hydration.${key}.value`)}
                </p>
                <p className="zn-nut-card__text">
                  {t(`hub.hydration.${key}.helper`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="zn-source zn-nut-foot">{t("hub.hydration.footnote")}</p>
    </div>
  );
}
