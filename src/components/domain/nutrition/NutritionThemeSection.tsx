import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { NUTRITION_ICONS } from "./icons";
import { ACCENT_CLASSES } from "./accents";
import type { ThemeAccent, NutritionIconName } from "@/data/nutrition/types";

interface Props {
  id: string;
  iconName: NutritionIconName;
  accent: ThemeAccent;
  titleKey: string;
  ledeKey: string;
  children: React.ReactNode;
}

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
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <section id={id} className="scroll-mt-24 space-y-5 md:space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
              accentClasses.bg
            )}
          >
            <Icon className={cn("size-5", accentClasses.text)} aria-hidden="true" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t(titleKey)}
          </h2>
        </div>
        <GlossaryLinkedText
          text={t(ledeKey)}
          as="p"
          className="text-muted-foreground md:text-lg max-w-3xl"
        />
      </header>
      {children}
    </section>
  );
}
