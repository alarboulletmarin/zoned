import { useTranslation } from "react-i18next";
import { Utensils, Target, Flame, ArrowRight } from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { InteractiveCard, StaggerGrid, StaggerItem } from "@/components/editorial";

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
        <div className="mb-8 border-t border-filet pt-5 md:pt-6">
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("guides.subtitle")}
          </p>
          <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[36px] sm:text-[44px] md:text-[52px] mt-2">
            {t("guides.title")}
          </h1>
        </div>

        {/* Guide Cards */}
        <StaggerGrid className={cn("grid gap-4", "grid-cols-1 md:grid-cols-3")}>
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <StaggerItem key={guide.id}>
                <InteractiveCard to={guide.href} className="group block h-full bg-card p-6">
                  <div className="flex flex-col items-center text-center gap-4 h-full">
                    <div className="size-14 flex items-center justify-center shrink-0 bg-secondary">
                      <Icon className="size-7" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h2 className="font-sans font-bold uppercase tracking-tight text-lg">
                        {t(guide.titleKey)}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {t(guide.descriptionKey)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] tracking-wide uppercase text-foreground">
                      {t("explore")}
                      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </InteractiveCard>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </>
  );
}
