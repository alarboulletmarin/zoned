import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Utensils, Target, Flame, ArrowRight } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";

interface GuideEntry {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descriptionKey: string;
  href: string;
}

const GUIDES: GuideEntry[] = [
  {
    id: "nutrition",
    icon: Utensils,
    titleKey: "nutrition.title",
    descriptionKey: "nutrition.description",
    href: "/guides/nutrition",
  },
  {
    id: "race-prep",
    icon: Target,
    titleKey: "racePrep.title",
    descriptionKey: "racePrep.description",
    href: "/guides/race-prep",
  },
  {
    id: "warmup",
    icon: Flame,
    titleKey: "warmup.title",
    descriptionKey: "warmup.description",
    href: "/guides/warmup",
  },
];

export function GuidesPage() {
  const { t } = useTranslation("guides");

  return (
    <>
      <SEOHead
        title="Guides"
        description={t("guides.seoDescription")}
        canonical="/guides"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: "Guides",
            description: t("guides.seoCollectionDescription"),
            url: "https://zoned.run/guides",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides" },
            ],
          },
        ]}
      />
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2">Guides</EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
            {t("guides.subtitle")}
          </FadeUp>
        </div>

        {/* Guide Cards */}
        <StaggerGrid className={cn("grid gap-4", "grid-cols-1 md:grid-cols-3")}>
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <StaggerItem key={guide.id}>
                <Link to={guide.href} className="group block h-full">
                  <Card interactive className="h-full bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-sm transition-all duration-200">
                    <CardContent className="flex flex-col items-center text-center gap-4 pt-8 pb-6">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="size-7 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">
                          {t(guide.titleKey)}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {t(guide.descriptionKey)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-primary font-medium">
                        {t("explore")}
                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </>
  );
}
