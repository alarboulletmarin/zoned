import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Library } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { CollectionCard } from "@/components/domain/CollectionCard";
import { useCollections } from "@/hooks/useCollections";
import { useAppStats } from "@/hooks/useAppStats";

/** Collections grouped into small editorial sections, mirroring the
 *  calculators hub: one band per theme, each opened by a full-width ink rule. */
const COLLECTION_GROUPS: { id: string; titleKey: string; members: string[] }[] = [
  {
    id: "starter",
    titleKey: "collections.groups.starter",
    members: [
      "debuter-le-running",
      "anti-stress",
      "retour-de-blessure",
      "post-course",
      "pre-course",
    ],
  },
  {
    id: "race",
    titleKey: "collections.groups.race",
    members: [
      "objectif-5k",
      "objectif-10k",
      "objectif-semi",
      "objectif-marathon",
      "objectif-ultra",
    ],
  },
  {
    id: "speed",
    titleKey: "collections.groups.speed",
    members: ["progresser-vma", "séances-mythiques"],
  },
  {
    id: "strength",
    titleKey: "collections.groups.strength",
    members: [
      "force-pour-coureurs",
      "core-stability-coureur",
      "prevention-blessures",
    ],
  },
];

export function CollectionsPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const collections = useCollections();
  const stats = useAppStats();

  return (
    <>
      <SEOHead
        title={t("collections.title")}
        description={t("seo.collectionsDesc")}
        canonical="/collections"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: "Collections",
            description: isEn
              ? "Themed workout paths for every goal. Browse curated running collections."
              : "Des parcours thématiques pour chaque objectif. Parcourez les collections de course à pied.",
            url: "https://zoned.run/collections",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Collections" },
            ],
          },
        ]}
      />

      <div className="zn-disc">
        {/* 1, the shelf, named and counted */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("collections.kicker", {
              collections: collections.length,
              groups: COLLECTION_GROUPS.length,
            })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("collections.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-disc__lede">
            {t("collections.subtitle")}
          </p>
        </section>

        {/* 2, one theme per band, each on its own ink rule */}
        {collections.length === 0 ? (
          <section className="zn-disc__results">
            <EmptyState
              variant="no-results"
              icon={Library}
              title={t("collections.emptyTitle")}
              description={t("collections.emptyDescription", {
                workouts: stats.workouts,
              })}
              action={
                <Button variant="outline" asChild>
                  <Link to="/library">{t("collections.emptyAction")}</Link>
                </Button>
              }
            />
          </section>
        ) : (
          COLLECTION_GROUPS.map((group) => {
            const groupItems = group.members
              .map((slug) => collections.find((c) => c.slug === slug))
              .filter((c): c is NonNullable<typeof c> => c != null);
            if (groupItems.length === 0) return null;

            return (
              <section
                key={group.id}
                className="zn-disc__group"
                aria-labelledby={`collection-${group.id}`}
              >
                <div className="zn-row zn-row--split zn-disc__grouphead">
                  <h2
                    id={`collection-${group.id}`}
                    className="zn-title"
                    data-level="3"
                  >
                    {t(group.titleKey)}
                  </h2>
                  <span className="zn-mono zn-faint">
                    {t("collections.groupCount", { count: groupItems.length })}
                  </span>
                </div>

                <div className="zn-grid">
                  {groupItems.map((collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
