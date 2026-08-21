import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Target, Gauge, RefreshCw, Route, Timer, List, Shuffle, Star, Zap, Pool } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import { loadUserZonePrefs } from "@/lib/zones";
import { CalculatorOfflineNote } from "@/components/calculators";

interface CalculateurEntry {
  id: string;
  icon: React.ComponentType<IconProps>;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  /** One-line worked example, "input → output", read on the card itself. */
  example: string;
  exampleEn: string;
  href: string;
}

/** Group ids surfaced in the hub — three families of four, matching the
 *  question each tool answers rather than the formula it runs. */
type CalcGroupId = "zonesAllures" | "performance" | "terrain";

interface CalcGroup {
  id: CalcGroupId;
  titleKey: string;
  members: string[];
}

const CALC_GROUPS: CalcGroup[] = [
  {
    id: "zonesAllures",
    titleKey: "calculators:calculateurs.groups.zonesAllures",
    members: ["zones", "allures", "convertisseur", "table-allures"],
  },
  {
    id: "performance",
    titleKey: "calculators:calculateurs.groups.performance",
    members: ["vma", "ftp", "css", "equivalence"],
  },
  {
    id: "terrain",
    titleKey: "calculators:calculateurs.groups.terrain",
    members: ["tapis-roulant", "splits", "age-graded", "what-if"],
  },
];

export const CALCULATEURS: CalculateurEntry[] = [
  {
    id: "zones",
    icon: Target,
    title: "Zones d'entraînement",
    titleEn: "Training Zones",
    description: "Calculez vos zones FC et allures depuis votre VMA ou FCmax",
    descriptionEn: "Calculate your HR and pace zones from VMA or max HR",
    example: "VMA 16,5 → 6 fourchettes",
    exampleEn: "VMA 16.5 → 6 pace ranges",
    href: "/calculators/zones",
  },
  {
    id: "allures",
    icon: Gauge,
    title: "Calculateur d'allures",
    titleEn: "Pace Calculator",
    description: "Estimez vos temps de course du 5 km au marathon depuis votre VMA",
    descriptionEn: "Estimate your race times from 5K to marathon from your VMA",
    example: "VMA 16,5 → 10 km 43:20",
    exampleEn: "VMA 16.5 → 10K 43:20",
    href: "/calculators/allures",
  },
  {
    id: "convertisseur",
    icon: RefreshCw,
    title: "Convertisseur d'allures",
    titleEn: "Pace Converter",
    description: "Convertissez entre min/km, km/h et min/mile en temps réel",
    descriptionEn: "Convert between min/km, km/h and min/mile in real time",
    example: "4:12/km ↔ 14,3 km/h",
    exampleEn: "4:12/km ↔ 8.9 mph",
    href: "/calculators/convertisseur",
  },
  {
    id: "table-allures",
    icon: List,
    title: "Table de référence",
    titleEn: "Pace Reference Table",
    description: "Toutes les allures de 3:00 à 10:00/km avec temps estimés",
    descriptionEn: "All paces from 3:00 to 10:00/km with estimated times",
    example: "3:00 → 10:00 /km",
    exampleEn: "3:00 → 10:00 /km",
    href: "/calculators/table-allures",
  },
  {
    id: "vma",
    icon: Timer,
    title: "VMA depuis un chrono",
    titleEn: "VMA from Race Time",
    description: "Estimez votre VMA à partir d'un résultat de course",
    descriptionEn: "Estimate your VMA from a race result",
    example: "10 km 43:20 → 16,5 km/h",
    exampleEn: "10K 43:20 → 16.5 km/h",
    href: "/calculators/vma",
  },
  {
    id: "ftp",
    icon: Zap,
    title: "Test FTP vélo",
    titleEn: "FTP Cycling Test",
    description: "Estimez votre FTP depuis un test 20 minutes ou un ramp test",
    descriptionEn: "Estimate your FTP from a 20-minute or ramp test",
    example: "20 min 250 W → FTP 238 W",
    exampleEn: "20 min 250 W → FTP 238 W",
    href: "/calculators/ftp",
  },
  {
    id: "css",
    icon: Pool,
    title: "Test CSS natation",
    titleEn: "CSS Swimming Test",
    description: "Estimez votre CSS depuis un test 400m + 200m",
    descriptionEn: "Estimate your CSS from a 400m + 200m test",
    example: "400 m + 200 m → CSS 1:38/100m",
    exampleEn: "400 m + 200 m → CSS 1:38/100m",
    href: "/calculators/css",
  },
  {
    id: "equivalence",
    icon: Shuffle,
    title: "Équivalence entre distances",
    titleEn: "Race Equivalence",
    description: "Prédisez vos temps sur toutes les distances depuis un résultat",
    descriptionEn: "Predict your times across all distances from one result",
    example: "10 km 43:20 → semi 1:35:40",
    exampleEn: "10K 43:20 → half 1:35:40",
    href: "/calculators/equivalence",
  },
  {
    id: "tapis-roulant",
    icon: RefreshCw,
    title: "Convertisseur tapis roulant",
    titleEn: "Treadmill Converter",
    description: "Convertissez vitesse et inclinaison en allure équivalente",
    descriptionEn: "Convert speed and incline to equivalent pace",
    example: "12 km/h à 2% → 4:35/km",
    exampleEn: "12 km/h at 2% → 4:35/km",
    href: "/calculators/tapis-roulant",
  },
  {
    id: "splits",
    icon: Route,
    title: "Générateur de splits",
    titleEn: "Split Generator",
    description: "Planifiez vos passages pour atteindre votre objectif chrono",
    descriptionEn: "Plan your splits to reach your target time",
    example: "Semi en 1:35 → splits au km",
    exampleEn: "Half in 1:35 → per-km splits",
    href: "/calculators/splits",
  },
  {
    id: "age-graded",
    icon: Star,
    title: "Performance age-graded",
    titleEn: "Age-Graded Performance",
    description: "Comparez votre performance au record mondial de votre catégorie",
    descriptionEn: "Compare your performance to the world record for your category",
    example: "10 km 43:20 → score 71 %",
    exampleEn: "10K 43:20 → 71% score",
    href: "/calculators/age-graded",
  },
  {
    id: "what-if",
    icon: RefreshCw,
    title: "Simulateur What-If",
    titleEn: "What-If Simulator",
    description: "Comparez deux scénarios d'entraînement et visualisez les différences",
    descriptionEn: "Compare two training scenarios and visualize the differences",
    example: "3x vs 5x/sem → écart de charge",
    exampleEn: "3x vs 5x/week → load gap",
    href: "/calculators/what-if",
  },
];

const TOTAL_TOOLS = CALCULATEURS.length;

export function CalculateursPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const savedValues = loadUserZonePrefs();
  const hasSavedValues = Boolean(savedValues?.vma || savedValues?.fcMax);

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.hub.seoTitle")}
        description={t("calculators:calculateurs.hub.seoDescription")}
        canonical="/calculators"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: t("calculators:calculateurs.hub.seoCollectionName"),
            description: t("calculators:calculateurs.hub.seoDescription"),
            url: "https://zoned.run/calculators",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8">
        {/* Header — big count + lead, saved-values panel on the side */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
          <div>
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("calculators:calculateurs.breadcrumb")}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[32px] sm:text-[42px] md:text-[52px] mt-3">
              {t("calculators:calculateurs.hub.toolCount", { count: TOTAL_TOOLS })}
            </h1>
            <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-foreground/80 max-w-[56ch]">
              {t("calculators:calculateurs.hub.lead")}
            </p>
          </div>

          <div className="border-2 border-foreground px-4 py-4 sm:px-[18px] sm:py-[18px] shrink-0 md:w-[260px]">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("calculators:calculateurs.hub.savedValuesLabel")}
            </p>
            {hasSavedValues ? (
              <div className="flex gap-6 mt-3 font-mono">
                {savedValues?.vma && (
                  <div>
                    <div className="text-xl sm:text-2xl">{savedValues.vma.toLocaleString("fr-FR")}</div>
                    <div className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                      {t("calculators:calculateurs.hub.vmaUnit")}
                    </div>
                  </div>
                )}
                {savedValues?.fcMax && (
                  <div>
                    <div className="text-xl sm:text-2xl">{savedValues.fcMax}</div>
                    <div className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                      {t("calculators:calculateurs.hub.fcMaxUnit")}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
                {t("calculators:calculateurs.hub.savedValuesEmpty")}
              </p>
            )}
            <Link
              to="/calculators/vma"
              className="block mt-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {t("calculators:calculateurs.hub.savedValuesEdit")}
            </Link>
          </div>
        </div>

        {/* Grouped grid — three families of four */}
        <div className="space-y-10 sm:space-y-12">
          {CALC_GROUPS.map((group) => {
            const groupItems = group.members
              .map((memberId) => CALCULATEURS.find((c) => c.id === memberId))
              .filter((c): c is CalculateurEntry => c != null);
            if (groupItems.length === 0) return null;
            return (
              <section key={group.id} aria-labelledby={`calc-${group.id}`}>
                <p
                  id={`calc-${group.id}`}
                  className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-primary-text mb-3 sm:mb-4"
                >
                  {t(group.titleKey)} · {groupItems.length}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.id} to={item.href} className="group block h-full">
                        <div
                          className={cn(
                            "bg-card h-full p-4 sm:p-[18px] transition-colors",
                            "hover:bg-secondary",
                          )}
                        >
                          <Icon className="size-4 text-muted-foreground" />
                          <h2 className="font-sans font-bold uppercase leading-[1.05] tracking-[-0.03em] text-lg sm:text-[22px] mt-2.5">
                            {pickLang(item, "title")}
                          </h2>
                          <p className="font-mono text-[11px] sm:text-xs text-muted-foreground mt-3 sm:mt-3.5">
                            {pickLang(item, "example")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer bar — trust signals + methodology link */}
        <div className="mt-10 md:mt-12 border-t border-border pt-5 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-7 font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground">
          <span>{t("calculators:calculateurs.hub.footerLocal")}</span>
          <span>{t("calculators:calculateurs.hub.footerFormulas")}</span>
          <Link
            to="/methodology"
            className="sm:ml-auto text-foreground/80 hover:text-foreground underline underline-offset-2"
          >
            {t("calculators:calculateurs.hub.footerMethodology")} →
          </Link>
        </div>

        <CalculatorOfflineNote className="mt-4 inline-block" />

        {/* Why this index — editorial 3-column block, mirrors the design mockup */}
        <div className="border-2 border-foreground bg-card p-6 md:p-10 mt-10 md:mt-12">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("calculators:calculateurs.hub.whyIndex.eyebrow")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7 mt-4 text-sm leading-[1.6] text-foreground/75">
            {(["example", "families", "savedValues"] as const).map((key) => (
              <p key={key}>
                <strong className="font-semibold text-foreground">
                  {t(`calculators:calculateurs.hub.whyIndex.${key}.title`)}
                </strong>{" "}
                {t(`calculators:calculateurs.hub.whyIndex.${key}.body`)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
