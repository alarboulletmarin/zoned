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
            "relative overflow-hidden rounded-2xl bg-gradient-to-br",
            collection.gradient,
            "text-white p-8 md:p-10"
          )}
        >
          {/* Background decoration */}
          <div className="absolute -right-8 -top-8 opacity-10">
            <Icon className="size-48" />
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-4 max-w-2xl">
            {/* Icon */}
            <div className="inline-flex items-center justify-center rounded-xl bg-white/20 p-3">
              <Icon className="size-8" />
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {name}
            </h1>

            {/* Description */}
            <p className="text-white/85 text-lg leading-relaxed">
              {description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-transparent hover:bg-white/20"
              >
                {t("collections.workoutCount", { count: workoutCount })}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 text-white hover:bg-transparent"
              >
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
                : "Aucune seance trouvee pour cette collection."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
