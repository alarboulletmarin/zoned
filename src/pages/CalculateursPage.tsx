import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Target, Gauge, RefreshCw, Route, Timer, ArrowRight, List, Shuffle, Star, Flag, Scale, Zap, Waves } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";

interface CalculateurEntry {
  id: string;
  icon: React.ComponentType<IconProps>;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
  comingSoon?: boolean;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

/** Group ids surfaced in the hub. Each group reads as a small editorial
 *  section with its own mono caption + the matching cards underneath. */
type CalcGroupId = "benchmarks" | "pace" | "race";

interface CalcGroup {
  id: CalcGroupId;
  titleKey: string;
  members: string[];
}

const CALC_GROUPS: CalcGroup[] = [
  {
    id: "benchmarks",
    titleKey: "calculators:calculateurs.groups.benchmarks",
    members: ["zones", "vma", "ftp", "css"],
  },
  {
    id: "pace",
    titleKey: "calculators:calculateurs.groups.pace",
    members: ["allures", "table-allures", "tapis-roulant"],
  },
  {
    id: "race",
    titleKey: "calculators:calculateurs.groups.race",
    members: ["splits", "equivalence", "age-graded", "race-simulator", "what-if"],
  },
];

const CALCULATEURS: CalculateurEntry[] = [
  {
    id: "zones",
    icon: Target,
    title: "Zones d'entraînement",
    titleEn: "Training Zones",
    description: "Calculez vos zones FC et allures depuis votre VMA ou FCmax",
    descriptionEn: "Calculate your HR and pace zones from VMA or max HR",
    href: "/calculators/zones",
    gradient: "from-primary/10 dark:from-primary/20",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    id: "allures",
    icon: Gauge,
    title: "Convertisseur d'allures",
    titleEn: "Pace Converter",
    description: "Convertissez entre min/km, km/h et min/mile en temps réel",
    descriptionEn: "Convert between min/km, km/h and min/mile in real time",
    href: "/calculators/convertisseur",
    gradient: "from-zone-2/10 dark:from-zone-2/20",
    iconBg: "bg-zone-2/15",
    iconColor: "text-zone-2",
  },
  {
    id: "table-allures",
    icon: List,
    title: "Table de référence",
    titleEn: "Pace Reference Table",
    description: "Toutes les allures de 3:00 à 10:00/km avec temps estimés",
    descriptionEn: "All paces from 3:00 to 10:00/km with estimated times",
    href: "/calculators/table-allures",
    gradient: "from-zone-3/10 dark:from-zone-3/20",
    iconBg: "bg-zone-3/15",
    iconColor: "text-zone-3",
  },
  {
    id: "tapis-roulant",
    icon: RefreshCw,
    title: "Convertisseur tapis roulant",
    titleEn: "Treadmill Converter",
    description: "Convertissez vitesse et inclinaison en allure équivalente",
    descriptionEn: "Convert speed and incline to equivalent pace",
    href: "/calculators/tapis-roulant",
    gradient: "from-zone-4/10 dark:from-zone-4/20",
    iconBg: "bg-zone-4/15",
    iconColor: "text-zone-4",
  },
  {
    id: "splits",
    icon: Route,
    title: "Générateur de splits",
    titleEn: "Split Generator",
    description: "Planifiez vos passages pour atteindre votre objectif chrono",
    descriptionEn: "Plan your splits to reach your target time",
    href: "/calculators/splits",
    gradient: "from-zone-5/10 dark:from-zone-5/20",
    iconBg: "bg-zone-5/15",
    iconColor: "text-zone-5",
  },
  {
    id: "vma",
    icon: Timer,
    title: "VMA depuis un chrono",
    titleEn: "VMA from Race Time",
    description: "Estimez votre VMA à partir d'un résultat de course",
    descriptionEn: "Estimate your VMA from a race result",
    href: "/calculators/vma",
    gradient: "from-zone-6/10 dark:from-zone-6/20",
    iconBg: "bg-zone-6/15",
    iconColor: "text-zone-6",
  },
  {
    id: "ftp",
    icon: Zap,
    title: "Test FTP vélo",
    titleEn: "FTP Cycling Test",
    description: "Estimez votre FTP depuis un test 20 minutes ou un ramp test",
    descriptionEn: "Estimate your FTP from a 20-minute or ramp test",
    href: "/calculators/ftp",
    gradient: "from-zone-4/10 dark:from-zone-4/20",
    iconBg: "bg-zone-4/15",
    iconColor: "text-zone-4",
  },
  {
    id: "css",
    icon: Waves,
    title: "Test CSS natation",
    titleEn: "CSS Swimming Test",
    description: "Estimez votre CSS depuis un test 400m + 200m",
    descriptionEn: "Estimate your CSS from a 400m + 200m test",
    href: "/calculators/css",
    gradient: "from-zone-2/10 dark:from-zone-2/20",
    iconBg: "bg-zone-2/15",
    iconColor: "text-zone-2",
  },
  {
    id: "equivalence",
    icon: Shuffle,
    title: "Équivalence entre distances",
    titleEn: "Race Equivalence",
    description: "Prédisez vos temps sur toutes les distances depuis un résultat",
    descriptionEn: "Predict your times across all distances from one result",
    href: "/calculators/equivalence",
    gradient: "from-zone-3/10 dark:from-zone-3/20",
    iconBg: "bg-zone-3/15",
    iconColor: "text-zone-3",
  },
  {
    id: "age-graded",
    icon: Star,
    title: "Performance age-graded",
    titleEn: "Age-Graded Performance",
    description: "Comparez votre performance au record mondial de votre catégorie",
    descriptionEn: "Compare your performance to the world record for your category",
    href: "/calculators/age-graded",
    gradient: "from-zone-2/10 dark:from-zone-2/20",
    iconBg: "bg-zone-2/15",
    iconColor: "text-zone-2",
  },
  {
    id: "race-simulator",
    icon: Flag,
    title: "Simulateur jour de course",
    titleEn: "Race Day Simulator",
    description: "Générez un plan complet pour votre journée de course : horaires, allures, nutrition, mental",
    descriptionEn: "Generate a complete race day plan: schedule, pacing, nutrition, mental cues",
    href: "/race-simulator",
    gradient: "from-zone-4/10 dark:from-zone-4/20",
    iconBg: "bg-zone-4/15",
    iconColor: "text-zone-4",
  },
  {
    id: "what-if",
    icon: Scale,
    title: "Simulateur What-If",
    titleEn: "What-If Simulator",
    description: "Comparez deux scénarios d'entraînement et visualisez les différences",
    descriptionEn: "Compare two training scenarios and visualize the differences",
    href: "/calculators/what-if",
    gradient: "from-primary/10 dark:from-primary/20",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
];

export function CalculateursPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

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
        {/* Header */}
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2">
            {t("calculators:calculateurs.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
            {t("calculators:calculateurs.description")}
          </FadeUp>
        </div>

        {/* Calculateur Cards — grouped by theme. Each group reads as a
            small editorial section: mono caption + matching cards. On
            mobile cards collapse to icon + title + arrow; from sm+ they
            expand to the full card with description + CTA. */}
        <div className="space-y-10 sm:space-y-12">
          {CALC_GROUPS.map((group) => {
            const groupItems = group.members
              .map((memberId) =>
                CALCULATEURS.find((c) => c.id === memberId),
              )
              .filter((c): c is CalculateurEntry => c != null);
            if (groupItems.length === 0) return null;
            return (
              <section key={group.id} aria-labelledby={`calc-${group.id}`}>
                <p
                  id={`calc-${group.id}`}
                  className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3 sm:mb-4 flex items-center gap-3"
                >
                  <span className="inline-block h-px w-8 bg-border" />
                  {t(group.titleKey)}
                </p>
                <StaggerGrid className={cn("grid gap-3 sm:gap-4", "grid-cols-2 lg:grid-cols-3")}>
                  {groupItems.map((item) => {
                    const Icon = item.icon;

                    if (item.comingSoon) {
                      return (
                        <StaggerItem key={item.id}>
                          <div className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-lg sm:rounded-xl border border-border/50 h-full opacity-60 p-4 sm:p-6">
                            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
                              <div className={cn("size-10 sm:size-14 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0", `bg-muted/20`)}>
                                <Icon className="size-5 sm:size-7 text-muted-foreground" />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h2 className="text-sm sm:text-lg font-semibold leading-snug">
                                  {pickLang(item, "title")}
                                </h2>
                                <span className="inline-block bg-muted text-muted-foreground text-[10px] sm:text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-1">
                                  {t("calculators:calculateurs.comingSoon")}
                                </span>
                                <p className="hidden sm:block text-sm text-muted-foreground">
                                  {pickLang(item, "description")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    }

                    return (
                      <StaggerItem key={item.id}>
                        <Link to={item.href} className="group block h-full">
                          <div className={cn(
                            "bg-gradient-to-br to-transparent rounded-lg sm:rounded-xl border border-border/50 h-full p-4 sm:p-6",
                            "hover:shadow-sm hover:-translate-y-0.5 hover:border-foreground/40 transition-all duration-200",
                            item.gradient,
                          )}>
                            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
                              <div className={cn("size-10 sm:size-14 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0", item.iconBg)}>
                                <Icon className={cn("size-5 sm:size-7", item.iconColor)} />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <h2 className="text-sm sm:text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                                  {pickLang(item, "title")}
                                </h2>
                                <p className="hidden sm:block text-sm text-muted-foreground">
                                  {pickLang(item, "description")}
                                </p>
                              </div>
                              <div className={cn("hidden sm:flex items-center gap-1 text-sm font-medium", item.iconColor)}>
                                {t("calculators:calculateurs.explore")}
                                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerGrid>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
