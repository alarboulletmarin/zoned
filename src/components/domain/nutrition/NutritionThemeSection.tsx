import { useTranslation } from "react-i18next";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { NUTRITION_ICONS } from "./icons";
import type { ThemeAccent, NutritionIconName } from "@/data/nutrition/types";

interface Props {
  id: string;
  iconName: NutritionIconName;
  accent: ThemeAccent;
  titleKey: string;
  ledeKey: string;
  children: React.ReactNode;
}

/**
 * One themed band of the hub: glyph, title, lede, then the visual.
 *
 * `accent` stays in the API and is emitted as `data-accent` so the section
 * still declares which family it belongs to, but nothing reads it for paint —
 * the system has one accent and it is spent on the hero's action.
 */
export function NutritionThemeSection({
  id,
  iconName,
  accent,
  titleKey,
  ledeKey,
  children,
}: Props) {
  const { t } = useTranslation("nutrition");
  const Icon = NUTRITION_ICONS[iconName];

  return (
    <section
      id={id}
      data-accent={accent}
      className="zn-nut-section zn-stack"
      style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
    >
      <header
        className="zn-stack"
        style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
      >
        <div
          className="zn-row"
          style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
        >
          <span className="zn-nut-glyph">
            <Icon aria-hidden="true" />
          </span>
          <h2 className="zn-title zn-fill" data-level="1">
            {t(titleKey)}
          </h2>
        </div>
        <GlossaryLinkedText
          text={t(ledeKey)}
          as="p"
          className="zn-body zn-body--lead zn-measure"
        />
      </header>
      {children}
    </section>
  );
}
