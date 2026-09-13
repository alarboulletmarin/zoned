import { useMemo, type CSSProperties } from "react";
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
import EasyRun from "@/assets/doodles/easy-run.svg?react";

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

      <div className="zn-guide">
        {/* The hero and the fourteen doors: one band, above the first rule. */}
        <section
          className="zn-stack zn-guide__head zn-guide__head--figure"
          style={{ "--gap": "var(--sp-14)" } as CSSProperties}
        >
          <NutritionHero />
          <NutritionThemeGrid themes={themes} />

          {/* L'allure qu'on tient des heures. Le dessin a été fait pour cette
              surface et pour aucune autre, scripts/doodles/effort.mjs : Elle
              sert les surfaces de nutrition : c'est la TENUE dans la durée qui
              parle, pas un objet (la règle 2 interdit la gourde et l'assiette).
              Une page de nutrition attrape mécaniquement une gourde ou une
              assiette ; un objet dessiné perd contre les glyphes Material. Cette
              figure dit le POURQUOI au lieu du QUOI, avec un corps.

              Elle se pose sur le filet qui ferme l'en-tête, comme l'étirement de
              /guides/warmup : son fichier n'a plus de sol, le bas de sa boîte est
              sa ligne d'appui, et .zn-guide__art la descend de --rule-bite pour
              que ses deux semelles le mordent. C'est le seul hub qui en porte
              une, comme l'échauffement est le seul guide, l'interdiction porte
              sur la répétition, pas sur la classe CSS. */}
          <EasyRun
            className="zn-guide__art"
            aria-hidden="true"
            focusable="false"
          />
        </section>

        {/* The reading band: the themed sections, with the table of contents
            sticky beside them. The rail is hidden below the split's breakpoint
            because the theme grid above is already that same index in card
            form, repeating it would be a second table of contents. */}
        <div
          className="zn-split zn-guide__band"
          style={
            {
              "--split": "200px minmax(0, 1fr)",
              "--gap": "var(--sp-17)",
            } as CSSProperties
          }
        >
          <aside className="zn-guide__rail">
            <NutritionTOC items={tocItems} />
          </aside>

          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-18)" } as CSSProperties}
          >
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
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
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
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
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
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-8)" } as CSSProperties}
              >
                <SupplementGrid items={supplements} />
                <p className="zn-source">{t("hub.supplements.aisFootnote")}</p>
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

        <section className="zn-guide__band">
          <NutritionCTAStrip />
        </section>
      </div>
    </>
  );
}
