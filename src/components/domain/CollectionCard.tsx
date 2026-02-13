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

/** Map collection icon strings to actual icon components */
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
    <Link to={`/collections/${collection.slug}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-br",
          collection.gradient,
          "text-white transition-all duration-200",
          "hover:shadow-lg hover:scale-[1.02]",
          featured ? "p-6" : "p-4"
        )}
      >
        {/* Background decoration */}
        <div className="absolute -right-4 -top-4 opacity-10">
          <Icon className={featured ? "size-28" : "size-20"} />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-2">
          {/* Icon */}
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-lg bg-white/20",
              featured ? "p-2.5" : "p-2"
            )}
          >
            <Icon className={featured ? "size-6" : "size-5"} />
          </div>

          {/* Name */}
          <h3
            className={cn(
              "font-bold leading-tight",
              featured ? "text-lg" : "text-base"
            )}
          >
            {name}
          </h3>

          {/* Description */}
          <p
            className={cn(
              "text-white/80 line-clamp-2",
              featured ? "text-sm" : "text-xs"
            )}
          >
            {description}
          </p>

          {/* Footer: badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-transparent text-xs hover:bg-white/20"
            >
              {t("collections.workoutCount", { count: workoutCount })}
            </Badge>
            <Badge
              variant="outline"
              className="border-white/30 text-white text-xs hover:bg-transparent"
            >
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
