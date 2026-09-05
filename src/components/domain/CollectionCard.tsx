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
import { cn } from "@/lib/utils";
import type { Collection } from "@/data/collections/types";
import { usePickLang } from "@/lib/i18n-utils";

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
  className?: string;
}

/** One curated collection in the index. The whole card is the target. */
export function CollectionCard({ collection, className }: CollectionCardProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  const Icon = ICON_MAP[collection.icon] ?? Target;

  return (
    <Link
      to={`/collections/${collection.slug}`}
      className={cn("zn-ecard", className)}
    >
      <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
        <Icon className="zn-ecard__icon" />
        <span className="zn-kicker zn-kicker--inline">
          {collection.isProgression
            ? t("collections.progression")
            : t("collections.freeSelection")}
        </span>
      </div>

      <h3 className="zn-ecard__title">{pick(collection, "name")}</h3>

      <p className="zn-ecard__desc">{pick(collection, "description")}</p>

      <div className="zn-ecard__meta">
        <span className="zn-ecard__fact">
          {t("collections.workoutCount", { count: collection.workoutIds.length })}
        </span>
      </div>
    </Link>
  );
}
