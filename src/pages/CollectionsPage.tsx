import { useTranslation } from "react-i18next";
import { Loader2 } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { CollectionCard } from "@/components/domain/CollectionCard";
import { useCollections } from "@/hooks/useCollections";
import { cn } from "@/lib/utils";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem } from "@/components/editorial";

/** Collections grouped into small editorial sections, mirroring the
 *  calculators hub: a mono caption per group + the matching cards. */
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
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2">
            {t("collections.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
            {t("collections.subtitle")}
          </FadeUp>
        </div>

        {/* Collections — grouped by theme. Each group reads as a small
            editorial section: mono caption + matching cards. On mobile
            cards collapse to icon + title; from sm+ they expand to the
            full card with description + badges. */}
        {collections.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-10 sm:space-y-12">
              {COLLECTION_GROUPS.map((group) => {
                const groupItems = group.members
                  .map((slug) => collections.find((c) => c.slug === slug))
                  .filter((c): c is NonNullable<typeof c> => c != null);
                if (groupItems.length === 0) return null;
                return (
                  <section key={group.id} aria-labelledby={`collection-${group.id}`}>
                    <p
                      id={`collection-${group.id}`}
                      className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3 sm:mb-4 flex items-center gap-3"
                    >
                      <span className="inline-block h-px w-8 bg-border" />
                      {t(group.titleKey)}
                    </p>
                    <StaggerGrid className={cn("grid gap-3 sm:gap-4", "grid-cols-2 lg:grid-cols-3")}>
                      {groupItems.map((collection) => (
                        <StaggerItem key={collection.id}>
                          <CollectionCard collection={collection} />
                        </StaggerItem>
                      ))}
                    </StaggerGrid>
                  </section>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-10 sm:mt-12 text-center text-sm text-muted-foreground">
              {`${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
            </div>
          </>
        )}
      </div>
    </>
  );
}
