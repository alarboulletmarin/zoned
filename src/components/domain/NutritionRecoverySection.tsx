import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Utensils, Droplets, Heart } from "@/components/icons";
import { getRecommendations } from "@/data/recommendations";
import type { PhaseRecommendations, RecommendationItem } from "@/data/recommendations";
import { getWorkoutDiscipline } from "@/types";
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
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
    >
      <div
        className="zn-row zn-nut-rec__label"
        style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
      >
        <Icon />
        <span className="zn-label">{label}</span>
      </div>
      <ul className="zn-nut-rec__list">
        {items.map((item, i) => (
          <li key={i}>
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
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
    >
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

  // No card, no title: the enclosing Section owns the heading. The tabs below
  // already say before/during/after, so an eyebrow saying the same was the
  // third copy of the same words.
  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
    >
        {getWorkoutDiscipline(workout) !== "running" && (
          <div className="zn-nut-note">
            <p className="zn-nut-note__title">
              {t("recommendations.crossDisciplineNote")}
            </p>
          </div>
        )}
        <Tabs defaultValue="before">
          <TabsList>
            {phases.map((phase) => (
              <TabsTrigger key={phase.key} value={phase.key}>
                {phase.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {phases.map((phase) => (
            <TabsContent key={phase.key} value={phase.key} className="zn-nut-rec__panel">
              <PhaseContent
                phase={phase.data}
                domainLabels={domainLabels}
              />
            </TabsContent>
          ))}
        </Tabs>
    </div>
  );
}
