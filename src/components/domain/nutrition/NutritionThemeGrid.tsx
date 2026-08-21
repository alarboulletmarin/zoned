import { useTranslation } from "react-i18next";
import { NUTRITION_ICONS } from "./icons";
import type { ThemeCard } from "@/data/nutrition/types";

interface Props {
  themes: ThemeCard[];
}

export function NutritionThemeGrid({ themes }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {themes.map((theme) => {
        const Icon = NUTRITION_ICONS[theme.iconName];
        return (
          <a
            key={theme.id}
            href={`#${theme.id}`}
            className="group flex flex-col gap-3 border-2 border-foreground bg-card p-4 md:p-5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="inline-flex size-10 items-center justify-center bg-secondary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-tight">{t(theme.titleKey)}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {t(theme.taglineKey)}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
