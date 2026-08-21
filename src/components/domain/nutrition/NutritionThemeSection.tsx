import { useTranslation } from "react-i18next";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { Section } from "@/components/editorial/Section";
import { NUTRITION_ICONS } from "./icons";
import type { NutritionIconName } from "@/data/nutrition/types";

interface Props {
  id: string;
  iconName: NutritionIconName;
  titleKey: string;
  ledeKey: string;
  children: React.ReactNode;
}

export function NutritionThemeSection({ id, iconName, titleKey, ledeKey, children }: Props) {
  const { t } = useTranslation("nutrition");
  const Icon = NUTRITION_ICONS[iconName];

  return (
    <Section
      id={id}
      className="scroll-mt-24"
      title={
        <span className="inline-flex items-center gap-3">
          <Icon className="size-6 shrink-0" aria-hidden="true" />
          {t(titleKey)}
        </span>
      }
      description={<GlossaryLinkedText text={t(ledeKey)} />}
    >
      {children}
    </Section>
  );
}
