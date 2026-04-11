import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Droplets, Heart } from "@/components/icons";
import { getRecommendations } from "@/data/recommendations";
import type { PhaseRecommendations, RecommendationItem } from "@/data/recommendations";
import type { WorkoutTemplate } from "@/types";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

interface NutritionRecoverySectionProps {
  workout: WorkoutTemplate;
}

function DomainBlock({
  icon: Icon,
  label,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: RecommendationItem[];
}) {
  const pickLang = usePickLang();
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Icon className="size-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <ul className="space-y-1.5 ml-6">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground list-disc">
            <GlossaryLinkedText text={pickLang(item, "text")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhaseContent({
  phase,
  domainLabels,
}: {
  phase: PhaseRecommendations;
  domainLabels: { nutrition: string; hydration: string; recovery: string };
}) {
  const hasNutrition = phase.nutrition.length > 0;
  const hasHydration = phase.hydration.length > 0;
  const hasRecovery = phase.recovery.length > 0;

  if (!hasNutrition && !hasHydration && !hasRecovery) {
    return null;
  }

  return (
    <div className="space-y-4">
      {hasNutrition && (
        <DomainBlock
          icon={Utensils}
          label={domainLabels.nutrition}
          items={phase.nutrition}
        />
      )}
      {hasHydration && (
        <DomainBlock
          icon={Droplets}
          label={domainLabels.hydration}
          items={phase.hydration}
        />
      )}
      {hasRecovery && (
        <DomainBlock
          icon={Heart}
          label={domainLabels.recovery}
          items={phase.recovery}
        />
      )}
    </div>
  );
}

export function NutritionRecoverySection({ workout }: NutritionRecoverySectionProps) {
  const { t } = useTranslation("session");

  const recommendations = getRecommendations(workout);

  const domainLabels = {
    nutrition: t("recommendations.domains.nutrition"),
    hydration: t("recommendations.domains.hydration"),
    recovery: t("recommendations.domains.recovery"),
  };

  const phases = [
    { key: "before", label: t("recommendations.phases.before"), data: recommendations.before },
    ...(recommendations.showDuringPhase && recommendations.during
      ? [{ key: "during", label: t("recommendations.phases.during"), data: recommendations.during }]
      : []),
    { key: "after", label: t("recommendations.phases.after"), data: recommendations.after },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("titles.nutritionRecovery")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="before">
          <TabsList className="w-full">
            {phases.map((phase) => (
              <TabsTrigger key={phase.key} value={phase.key}>
                {phase.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {phases.map((phase) => (
            <TabsContent key={phase.key} value={phase.key} className="pt-4">
              <PhaseContent
                phase={phase.data}
                domainLabels={domainLabels}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
