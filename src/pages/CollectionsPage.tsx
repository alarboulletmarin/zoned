import { useTranslation } from "react-i18next";
import { Loader2 } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { CollectionCard } from "@/components/domain/CollectionCard";
import { useCollections } from "@/hooks/useCollections";
import { cn } from "@/lib/utils";

export function CollectionsPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const collections = useCollections();

  return (
    <>
      <SEOHead
        title={isEn ? "Collections" : "Collections"}
        description={isEn
          ? "Themed workout paths for every goal. Browse curated running collections."
          : "Des parcours thematiques pour chaque objectif. Parcourez les collections de course a pied."}
        canonical="/collections"
        jsonLd={{
          "@type": "CollectionPage",
          name: "Collections",
          description: isEn
            ? "Themed workout paths for every goal. Browse curated running collections."
            : "Des parcours thematiques pour chaque objectif. Parcourez les collections de course a pied.",
          url: "https://zoned.run/collections",
        }}
      />
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("collections.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("collections.subtitle")}
          </p>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className={cn(
              "grid gap-4",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}>
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {isEn
                ? `${collections.length} collection${collections.length !== 1 ? "s" : ""}`
                : `${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
            </div>
          </>
        )}
      </div>
    </>
  );
}
