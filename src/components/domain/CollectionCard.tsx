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
import { usePickLang } from "@/lib/i18n-utils";

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

// Full literal gradient classes per zone. Tailwind only generates utilities
// it can see as complete strings, so these can't be built by interpolation.
const ZONE_GRADIENT: Record<number, string> = {
  1: "from-zone-1/10 dark:from-zone-1/20",
  2: "from-zone-2/10 dark:from-zone-2/20",
  3: "from-zone-3/10 dark:from-zone-3/20",
  4: "from-zone-4/10 dark:from-zone-4/20",
  5: "from-zone-5/10 dark:from-zone-5/20",
  6: "from-zone-6/10 dark:from-zone-6/20",
};
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
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  const Icon = ICON_MAP[collection.icon] ?? Target;
  const name = pick(collection, "name");
  const description = pick(collection, "description");
  const workoutCount = collection.workoutIds.length;

  const zone = getCollectionZone(collection.slug);

  return (
    <Link to={`/collections/${collection.slug}`} className="group block h-full">
      <div
        className={cn(
          "rounded-lg sm:rounded-xl border border-border/50 h-full p-4 sm:p-6",
          `zone-${zone}`,
          "bg-gradient-to-br to-transparent",
          ZONE_GRADIENT[zone],
          "hover:shadow-sm hover:-translate-y-0.5 hover:border-foreground/40 active:translate-y-0 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
          <div className="size-10 sm:size-14 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
            <Icon className="size-5 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5">
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
      </div>
    </Link>
  );
}
