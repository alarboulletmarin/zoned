import { useTranslation } from "react-i18next";
import type { DosageChip } from "@/data/nutrition/types";

/**
 * A row of dosages: label, figure, footnote.
 *
 * That is exactly StatBlock's shape, so the paint is StatBlock's too
 * (.zn-stat, tone "card") rather than a fourth card that looks almost like it.
 */
export function DosageGrid({ chips }: { chips: DosageChip[] }) {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-grid"
      style={{ "--cols": 4, "--cols-md": 2 } as React.CSSProperties}
    >
      {chips.map((chip) => (
        <div key={chip.labelKey} className="zn-stat" data-tone="card" data-size="sm">
          <span className="zn-stat__label">{t(chip.labelKey)}</span>
          <span className="zn-stat__value">{t(chip.valueKey)}</span>
          {chip.helperKey && (
            <span className="zn-stat__foot">{t(chip.helperKey)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
