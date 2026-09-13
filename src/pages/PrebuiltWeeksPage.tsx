import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { PrebuiltWeekCard } from "@/components/domain/PrebuiltWeekCard";
import { getAllPrebuiltWeeks } from "@/data/prebuilt-weeks";

/**
 * The ten ready-made weeks, as a catalogue, the same shape as the prebuilt
 * plans index and as the library: count, title, one sentence, card grid.
 */
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

      <div className="zn-pw">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/weeks/new">
            <ArrowLeft size={16} />
            {t("weekly.prebuilt.back")}
          </Link>
        </Button>

        <section className="zn-pw__band">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <span className="zn-kicker">
              {t("weekly.prebuilt.available", { count: weeks.length })}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("weekly.prebuilt.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-pw__lede">
              {t("weekly.prebuilt.subtitle")}
            </p>
          </div>
        </section>

        <section className="zn-pw__band">
          <div className="zn-grid">
            {weeks.map((week) => (
              <PrebuiltWeekCard key={week.id} week={week} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
