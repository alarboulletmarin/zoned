import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { PrebuiltWeekCard } from "@/components/domain/PrebuiltWeekCard";
import { getAllPrebuiltWeeks } from "@/data/prebuilt-weeks";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";

export function PrebuiltWeeksPage() {
  const { t } = useTranslation("library");

  const weeks = getAllPrebuiltWeeks();

  return (
    <>
      <SEOHead
        title={t("weekly.prebuilt.title")}
        description={t("weekly.prebuilt.subtitle")}
        canonical="/weeks/new/prebuilt"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: "Semaines", item: "https://zoned.run/weeks" },
            { "@type": "ListItem", position: 3, name: t("weekly.prebuilt.title") },
          ],
        }}
      />
      <div className="py-8">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/weeks/new">
            <ArrowLeft className="mr-2 size-4" />
            {t("weekly.prebuilt.back")}
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2">
            {t("weekly.prebuilt.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg max-w-2xl">
            {t("weekly.prebuilt.subtitle")}
          </FadeUp>
        </div>

        {/* Grid — mobile-first: 1 column, then 2 from sm. */}
        <StaggerGrid
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {weeks.map((week) => (
            <StaggerItem key={week.id}>
              <PrebuiltWeekCard week={week} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Stats */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t("weekly.prebuilt.available", { count: weeks.length })}
        </div>
      </div>
    </>
  );
}
