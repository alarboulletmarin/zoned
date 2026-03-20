import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Loader2,
  Footprints,
  Leaf,
  Shield,
  RefreshCw,
  Flag,
  Star,
  Target,
  Route,
  Mountain,
  Rocket,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { useCollection } from "@/hooks/useCollections";
import { cn } from "@/lib/utils";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

/** Map collection icon strings to actual icon components (same as CollectionCard) */
const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Footprints,
  Leaf,
  Shield,
  RefreshCw,
  Flag,
  Star,
  Target,
  Route,
  Mountain,
  Rocket,
};

const ZONE_MAP: Record<string, number> = {
  "debuter-le-running": 1,
  "anti-stress": 1,
  "retour-de-blessure": 1,
  "post-course": 1,
  "pre-course": 3,
  "seances-mythiques": 5,
  "objectif-5k": 5,
  "objectif-10k": 4,
  "objectif-semi": 4,
  "objectif-marathon": 4,
  "objectif-ultra": 3,
  "progresser-vma": 5,
};

function getCollectionZone(slug: string): number {
  return ZONE_MAP[slug] ?? 3;
}

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { collection, workouts, isLoading } = useCollection(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 404 state
  if (!collection) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {isEn ? "Collection not found" : "Collection introuvable"}
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/collections">
            <ArrowLeft className="mr-2 size-4" />
            {t("collections.backToCollections")}
          </Link>
        </Button>
      </div>
    );
  }

  const Icon = ICON_MAP[collection.icon] ?? Target;
  const name = isEn ? collection.nameEn : collection.name;
  const description = isEn ? collection.descriptionEn : collection.description;
  const workoutCount = collection.workoutIds.length;

  return (
    <>
      <SEOHead
        title={name}
        description={description.slice(0, 155)}
        canonical={`/collections/${collection.slug}`}
        jsonLd={[
          {
            "@type": "ItemList",
            name,
            description: description.slice(0, 155),
            url: `https://zoned.run/collections/${collection.slug}`,
            numberOfItems: workouts.length,
            itemListElement: workouts.map((w, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: isEn ? w.nameEn : w.name,
              url: `https://zoned.run/workout/${w.id}`,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Collections", item: "https://zoned.run/collections" },
              { "@type": "ListItem", position: 3, name },
            ],
          },
        ]}
      />
      <div className="py-8 space-y-6">
        {/* Back Link */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/collections">
            <ArrowLeft className="mr-2 size-4" />
            {t("collections.backToCollections")}
          </Link>
        </Button>

        {/* Hero Section */}
        <div
          className={cn(
            "rounded-2xl border border-t-4 bg-card shadow-sm",
            `zone-${getCollectionZone(collection.slug)}`,
            `border-t-zone-${getCollectionZone(collection.slug)}`,
            "p-8 md:p-10"
          )}
        >
          {/* Content */}
          <div className="space-y-4 max-w-2xl">
            {/* Icon */}
            <div className="inline-flex items-center justify-center rounded-xl bg-secondary p-3">
              <Icon className="size-8" />
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {name}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed">
              <GlossaryLinkedText text={description} />
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="secondary">
                {t("collections.workoutCount", { count: workoutCount })}
              </Badge>
              <Badge variant="outline">
                {collection.isProgression
                  ? t("collections.progression")
                  : t("collections.freeSelection")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout, index) => (
            <div key={workout.id} className="relative">
              {/* Step number for progression collections */}
              {collection.isProgression && (
                <div className="absolute -top-2 -left-2 z-10 size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
              )}
              <WorkoutCard workout={workout} />
            </div>
          ))}
        </div>

        {/* Empty state if workouts failed to resolve */}
        {workouts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isEn
                ? "No workouts found for this collection."
                : "Aucune séance trouvée pour cette collection."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
