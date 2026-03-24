import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Target, Gauge, RefreshCw, Route, Timer, ArrowRight, List, Shuffle, Star, Flag } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";

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
];

export function CalculateursPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Calculators — Running Tools" : "Calculateurs — Outils de Course"}
        description={
          isEn
            ? "Running calculators: training zones, race paces, treadmill converter, split generator, VMA estimation."
            : "Calculateurs de course à pied : zones d'entraînement, allures, convertisseur tapis roulant, splits, estimation VMA."
        }
        canonical="/calculators"
        jsonLd={{
          "@type": "CollectionPage",
          name: isEn ? "Running Calculators" : "Calculateurs Course à Pied",
          description: isEn
            ? "Running calculators: training zones, race paces, treadmill converter, split generator, VMA estimation."
            : "Calculateurs de course à pied : zones d'entraînement, allures, convertisseur tapis roulant, splits, estimation VMA.",
          url: "https://zoned.run/calculators",
        }}
      />
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("calculateurs.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("calculateurs.description")}
          </p>
        </div>

        {/* Calculateur Cards */}
        <div className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {CALCULATEURS.map((item) => {
            const Icon = item.icon;

            if (item.comingSoon) {
              return (
                <div key={item.id}>
                  <div className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50 h-full opacity-60 p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className={cn("size-14 rounded-2xl flex items-center justify-center", `bg-muted/20`)}>
                        <Icon className="size-7 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-lg font-semibold">
                            {isEn ? item.titleEn : item.title}
                          </h2>
                          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                            {t("calculateurs.comingSoon")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isEn ? item.descriptionEn : item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={item.id} to={item.href} className="group">
                <div className={cn(
                  "bg-gradient-to-br to-transparent rounded-xl border border-border/50 h-full p-6",
                  "hover:shadow-md hover:-translate-y-1 transition-all duration-200",
                  item.gradient,
                )}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center", item.iconBg)}>
                      <Icon className={cn("size-7", item.iconColor)} />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">
                        {isEn ? item.titleEn : item.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isEn ? item.descriptionEn : item.description}
                      </p>
                    </div>
                    <div className={cn("flex items-center gap-1 text-sm font-medium", item.iconColor)}>
                      {t("calculateurs.explore")}
                      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
