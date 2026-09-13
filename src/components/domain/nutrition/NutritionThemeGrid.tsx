import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "./icons";
import type { ThemeCard } from "@/data/nutrition/types";

interface Props {
  themes: ThemeCard[];
}

/**
 * The fourteen doors to the sections below.
 *
 * `theme.accent` still travels with the data and is still read by
 * NutritionThemeSection, but it no longer paints anything: nine hues of
 * gradient card is precisely what the ink-on-paper system replaces. The tiles
 * are told apart by their glyph and their words, like every other card here.
 */
export function NutritionThemeGrid({ themes }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div
      className="zn-grid"
      style={{ "--cols": 4, "--cols-md": 2 } as React.CSSProperties}
    >
      {themes.map((theme) => {
        const Icon = NUTRITION_ICONS[theme.iconName];
        return (
          <a key={theme.id} href={`#${theme.id}`} className="zn-nut-theme">
            <span className="zn-nut-glyph" data-size="sm">
              <Icon aria-hidden="true" />
            </span>
            <h3 className="zn-nut-theme__title">{t(theme.titleKey)}</h3>
            <p className="zn-nut-theme__tagline zn-clamp">
              {t(theme.taglineKey)}
            </p>
          </a>
        );
      })}
    </div>
  );
}
