import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Target, Gauge, RefreshCw, Route, Timer, ArrowRight, List } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
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
}

const CALCULATEURS: CalculateurEntry[] = [
  {
    id: "zones",
    icon: Target,
    title: "Zones d'entraînement",
    titleEn: "Training Zones",
    description: "Calculez vos zones FC et allures depuis votre VMA ou FCmax",
    descriptionEn: "Calculate your HR and pace zones from VMA or max HR",
    href: "/calculateurs/zones",
  },
  {
    id: "allures",
    icon: Gauge,
    title: "Convertisseur d'allures",
    titleEn: "Pace Converter",
    description: "Convertissez entre min/km, km/h et min/mile en temps réel",
    descriptionEn: "Convert between min/km, km/h and min/mile in real time",
    href: "/calculateurs/convertisseur",
  },
  {
    id: "table-allures",
    icon: List,
    title: "Table de référence",
    titleEn: "Pace Reference Table",
    description: "Toutes les allures de 3:00 à 10:00/km avec temps estimés",
    descriptionEn: "All paces from 3:00 to 10:00/km with estimated times",
    href: "/calculateurs/table-allures",
  },
  {
    id: "tapis-roulant",
    icon: RefreshCw,
    title: "Convertisseur tapis roulant",
    titleEn: "Treadmill Converter",
    description: "Convertissez vitesse et inclinaison en allure équivalente",
    descriptionEn: "Convert speed and incline to equivalent pace",
    href: "/calculateurs/tapis-roulant",
  },
  {
    id: "splits",
    icon: Route,
    title: "Générateur de splits",
    titleEn: "Split Generator",
    description: "Planifiez vos passages pour atteindre votre objectif chrono",
    descriptionEn: "Plan your splits to reach your target time",
    href: "/calculateurs/splits",
  },
  {
    id: "vma",
    icon: Timer,
    title: "VMA depuis un chrono",
    titleEn: "VMA from Race Time",
    description: "Estimez votre VMA à partir d'un résultat de course",
    descriptionEn: "Estimate your VMA from a race result",
    href: "/calculateurs/vma",
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
        canonical="/calculateurs"
        jsonLd={{
          "@type": "CollectionPage",
          name: isEn ? "Running Calculators" : "Calculateurs Course à Pied",
          description: isEn
            ? "Running calculators: training zones, race paces, treadmill converter, split generator, VMA estimation."
            : "Calculateurs de course à pied : zones d'entraînement, allures, convertisseur tapis roulant, splits, estimation VMA.",
          url: "https://zoned.run/calculateurs",
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
                  <Card className="h-full opacity-60">
                    <CardContent className="flex flex-col items-center text-center gap-4 pt-8 pb-6">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon className="size-7 text-primary" />
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
                    </CardContent>
                  </Card>
                </div>
              );
            }

            return (
              <Link key={item.id} to={item.href} className="group">
                <Card interactive className="h-full">
                  <CardContent className="flex flex-col items-center text-center gap-4 pt-8 pb-6">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">
                        {isEn ? item.titleEn : item.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isEn ? item.descriptionEn : item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      {t("calculateurs.explore")}
                      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
