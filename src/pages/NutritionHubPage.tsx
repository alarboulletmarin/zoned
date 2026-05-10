import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import {
  themes,
  dailyChips,
  beforeChips,
  caffeineSteps,
  raceWeek,
  supplements,
} from "@/data/nutrition";
import { NutritionHero } from "@/components/domain/nutrition/NutritionHero";
import { NutritionThemeGrid } from "@/components/domain/nutrition/NutritionThemeGrid";
import { NutritionThemeSection } from "@/components/domain/nutrition/NutritionThemeSection";
import { NutritionTOC } from "@/components/domain/nutrition/NutritionTOC";
import { NutritionCTAStrip } from "@/components/domain/nutrition/NutritionCTAStrip";
import { DosageGrid } from "@/components/domain/nutrition/visuals/DosageGrid";
import { CaffeineTimeline } from "@/components/domain/nutrition/visuals/CaffeineTimeline";
import { WaterMeter } from "@/components/domain/nutrition/visuals/WaterMeter";
import { RaceWeekTimeline } from "@/components/domain/nutrition/visuals/RaceWeekTimeline";
import { CarbsPerHourTable } from "@/components/domain/nutrition/visuals/CarbsPerHourTable";
import { RecoveryWindow } from "@/components/domain/nutrition/visuals/RecoveryWindow";
import { SupplementGrid } from "@/components/domain/nutrition/visuals/SupplementGrid";
import { RatioGauge } from "@/components/domain/nutrition/visuals/RatioGauge";
import { MythBuster } from "@/components/domain/nutrition/visuals/MythBuster";
import { ProteinTimingChart } from "@/components/domain/nutrition/visuals/ProteinTimingChart";
import { ProteinTargetTable } from "@/components/domain/nutrition/visuals/ProteinTargetTable";
import { GutTrainingTimeline } from "@/components/domain/nutrition/visuals/GutTrainingTimeline";
import { WomenInsightGrid } from "@/components/domain/nutrition/visuals/WomenInsightGrid";
import { HeatGrid } from "@/components/domain/nutrition/visuals/HeatGrid";
import { CrampsScience } from "@/components/domain/nutrition/visuals/CrampsScience";

const CAFFEINE_CONTRAINDICATION_KEYS = [
  "hub.caffeine.contraindications.items.evening",
  "hub.caffeine.contraindications.items.sensitive",
  "hub.caffeine.contraindications.items.gi",
  "hub.caffeine.contraindications.items.untested",
  "hub.caffeine.contraindications.items.cyp1a2",
];

export function NutritionHubPage() {
  const { t } = useTranslation("nutrition");

  const tocItems = useMemo(
    () => themes.map((theme) => ({ id: theme.id, label: t(theme.titleKey) })),
    [t]
  );

  const jsonLd = useMemo(
    () => [
      {
        "@type": "Article",
        headline: t("hub.title"),
        description: t("hub.seoDescription"),
        author: { "@type": "Organization", name: "Zoned" },
        publisher: { "@type": "Organization", name: "Zoned" },
        url: "https://zoned.run/nutrition",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t("hub.breadcrumbs.home"), item: "https://zoned.run/" },
          { "@type": "ListItem", position: 2, name: t("hub.pageTitle") },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"].map((q) => ({
          "@type": "Question",
          name: t(`hub.faq.${q}.question`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`hub.faq.${q}.answer`),
          },
        })),
      },
    ],
    [t]
  );

  return (
    <>
      <SEOHead
        title={t("hub.pageTitle")}
        description={t("hub.seoDescription")}
        canonical="/nutrition"
        ogType="article"
        jsonLd={jsonLd}
      />

      <div className="py-6 md:py-8 space-y-12 md:space-y-16 min-w-0">
        <NutritionHero />
        <NutritionThemeGrid themes={themes} />

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12 xl:gap-16 min-w-0">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <NutritionTOC items={tocItems} />
            </div>
          </aside>

          <div className="space-y-12 md:space-y-16 min-w-0">
            <NutritionThemeSection
              id="daily"
              iconName="Utensils"
              accent="primary"
              titleKey="hub.daily.title"
              ledeKey="hub.daily.lede"
            >
              <DosageGrid chips={dailyChips} />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="carbs"
              iconName="Wheat"
              accent="amber"
              titleKey="hub.carbs.title"
              ledeKey="hub.carbs.lede"
            >
              <RatioGauge />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="protein"
              iconName="Activity"
              accent="rose"
              titleKey="hub.protein.title"
              ledeKey="hub.protein.lede"
            >
              <div className="space-y-6">
                <ProteinTargetTable />
                <ProteinTimingChart />
              </div>
            </NutritionThemeSection>

            <NutritionThemeSection
              id="caffeine"
              iconName="Coffee"
              accent="amber"
              titleKey="hub.caffeine.title"
              ledeKey="hub.caffeine.lede"
            >
              <CaffeineTimeline
                steps={caffeineSteps}
                contraindicationsKeys={CAFFEINE_CONTRAINDICATION_KEYS}
              />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="hydration"
              iconName="Droplets"
              accent="blue"
              titleKey="hub.hydration.title"
              ledeKey="hub.hydration.lede"
            >
              <WaterMeter />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="race-week"
              iconName="Flag"
              accent="rose"
              titleKey="hub.raceWeek.title"
              ledeKey="hub.raceWeek.lede"
            >
              <RaceWeekTimeline days={raceWeek} />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="before"
              iconName="Clock"
              accent="primary"
              titleKey="hub.before.title"
              ledeKey="hub.before.lede"
            >
              <DosageGrid chips={beforeChips} />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="during"
              iconName="Zap"
              accent="amber"
              titleKey="hub.during.title"
              ledeKey="hub.during.lede"
            >
              <div className="space-y-6">
                <CarbsPerHourTable />
                <GutTrainingTimeline />
              </div>
            </NutritionThemeSection>

            <NutritionThemeSection
              id="recovery"
              iconName="HeartPulse"
              accent="green"
              titleKey="hub.recovery.title"
              ledeKey="hub.recovery.lede"
            >
              <RecoveryWindow />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="supplements"
              iconName="Pill"
              accent="violet"
              titleKey="hub.supplements.title"
              ledeKey="hub.supplements.lede"
            >
              <div className="space-y-3">
                <SupplementGrid items={supplements} />
                <p className="text-xs text-muted-foreground">{t("hub.supplements.aisFootnote")}</p>
              </div>
            </NutritionThemeSection>

            <NutritionThemeSection
              id="cramps"
              iconName="Zap"
              accent="orange"
              titleKey="hub.cramps.title"
              ledeKey="hub.cramps.lede"
            >
              <CrampsScience />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="heat"
              iconName="Flame"
              accent="rose"
              titleKey="hub.heat.title"
              ledeKey="hub.heat.lede"
            >
              <HeatGrid />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="women"
              iconName="Sparkles"
              accent="violet"
              titleKey="hub.women.title"
              ledeKey="hub.women.lede"
            >
              <WomenInsightGrid />
            </NutritionThemeSection>

            <NutritionThemeSection
              id="myths"
              iconName="AlertTriangle"
              accent="slate"
              titleKey="hub.myths.title"
              ledeKey="hub.myths.lede"
            >
              <MythBuster />
            </NutritionThemeSection>
          </div>
        </div>

        <NutritionCTAStrip />
      </div>
    </>
  );
}
