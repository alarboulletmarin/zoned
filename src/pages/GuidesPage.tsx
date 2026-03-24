import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Utensils, Target, Flame, ArrowRight } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";

interface GuideEntry {
  id: string;
  icon: React.ComponentType<IconProps>;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
}

const GUIDES: GuideEntry[] = [
  {
    id: "nutrition",
    icon: Utensils,
    title: "Nutrition",
    titleEn: "Nutrition",
    description: "Alimentation, hydratation et ravitaillement en course",
    descriptionEn: "Nutrition, hydration and race fueling",
    href: "/guides/nutrition",
  },
  {
    id: "race-prep",
    icon: Target,
    title: "Préparation Course",
    titleEn: "Race Preparation",
    description: "Checklist, stratégie, récupération",
    descriptionEn: "Checklist, strategy, recovery",
    href: "/guides/race-prep",
  },
  {
    id: "warmup",
    icon: Flame,
    title: "Échauffement",
    titleEn: "Warm-up",
    description: "Routines d'échauffement et étirements",
    descriptionEn: "Warm-up routines and stretching",
    href: "/guides/warmup",
  },
];

export function GuidesPage() {
  const { i18n } = useTranslation("guides");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title="Guides"
        description={
          isEn
            ? "Running guides: nutrition, race preparation, warm-up routines and more."
            : "Guides de course : nutrition, préparation course, routines d'échauffement et plus."
        }
        canonical="/guides"
        jsonLd={{
          "@type": "CollectionPage",
          name: "Guides",
          description: isEn
            ? "Running guides: nutrition, race preparation, warm-up routines and more."
            : "Guides de course : nutrition, préparation course, routines d'échauffement et plus.",
          url: "https://zoned.run/guides",
        }}
      />
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guides</h1>
          <p className="text-muted-foreground text-lg">
            {isEn ? "Resources to improve" : "Ressources pour progresser"}
          </p>
        </div>

        {/* Guide Cards */}
        <div className={cn("grid gap-4", "grid-cols-1 md:grid-cols-3")}>
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.id} to={guide.href} className="group">
                <Card interactive className="h-full bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent">
                  <CardContent className="flex flex-col items-center text-center gap-4 pt-8 pb-6">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">
                        {isEn ? guide.titleEn : guide.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isEn ? guide.descriptionEn : guide.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                      {isEn ? "Explore" : "Explorer"}
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
