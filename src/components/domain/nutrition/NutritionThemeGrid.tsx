import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NUTRITION_ICONS } from "./icons";
import { ACCENT_CLASSES } from "./accents";
import type { ThemeCard } from "@/data/nutrition/types";

interface Props {
  themes: ThemeCard[];
}

export function NutritionThemeGrid({ themes }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {themes.map((theme) => {
        const Icon = NUTRITION_ICONS[theme.iconName];
        const accent = ACCENT_CLASSES[theme.accent];
        return (
          <a
            key={theme.id}
            href={`#${theme.id}`}
            className={cn(
              "group flex flex-col gap-3 rounded-xl border bg-gradient-to-br p-4 md:p-5",
              accent.card,
              "transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <div
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg",
                accent.bg
              )}
            >
              <Icon className={cn("size-5", accent.text)} aria-hidden="true" />
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
