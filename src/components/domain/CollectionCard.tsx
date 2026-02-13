import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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
import { cn } from "@/lib/utils";
import type { Collection } from "@/data/collections/types";

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

interface CollectionCardProps {
  collection: Collection;
  /** Larger size for homepage featured display */
  featured?: boolean;
}

export function CollectionCard({ collection, featured = false }: CollectionCardProps) {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const Icon = ICON_MAP[collection.icon] ?? Target;
  const name = isEn ? collection.nameEn : collection.name;
  const description = isEn ? collection.descriptionEn : collection.description;
  const workoutCount = collection.workoutIds.length;

  return (
    <Link to={`/collections/${collection.slug}`} className="group block h-full">
      <div
        className={cn(
          "zone-stripe pl-2 rounded-xl border bg-card shadow-sm h-full flex flex-col",
          `zone-${getCollectionZone(collection.slug)}`,
          "hover:shadow-md hover:-translate-y-0.5 transition-all",
          featured ? "p-6" : "p-4"
        )}
      >
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "inline-flex items-center justify-center rounded-lg bg-secondary",
                featured ? "p-2.5" : "p-2"
              )}
            >
              <Icon className={featured ? "size-6" : "size-5"} />
            </div>
            <h3
              className={cn(
                "font-semibold leading-tight",
                featured ? "text-lg" : "text-base"
              )}
            >
              {name}
            </h3>
          </div>

          <p
            className={cn(
              "text-muted-foreground line-clamp-2",
              featured ? "text-sm" : "text-sm"
            )}
          >
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <Badge variant="secondary" className="text-xs">
            {t("collections.workoutCount", { count: workoutCount })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {collection.isProgression
              ? t("collections.progression")
              : t("collections.freeSelection")}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
