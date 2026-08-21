import { useMemo } from "react";
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
import { InteractiveCard } from "@/components/editorial";
import { cn } from "@/lib/utils";
import type { Collection } from "@/data/collections/types";
import { usePickLang } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { getAnyWorkoutZones } from "@/lib/workoutFilters";
import { zoneClass } from "@/lib/zoneColors";

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

/** Zone mix across a collection's sessions: each workout contributes one
 *  count per distinct zone it touches (`getAnyWorkoutZones`), strength
 *  sessions contribute none since they carry no aerobic zone. */
function computeZoneMix(
  workoutIds: string[],
  workoutsById: Map<string, AnyWorkoutTemplate>
): { zone: ZoneNumber; percent: number }[] {
  const counts = new Map<ZoneNumber, number>();
  for (const id of workoutIds) {
    const workout = workoutsById.get(id);
    if (!workout) continue;
    for (const zone of getAnyWorkoutZones(workout)) {
      counts.set(zone, (counts.get(zone) ?? 0) + 1);
    }
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([zone, n]) => ({ zone, percent: (n / total) * 100 }));
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
  /** Catalogue lookup used to compute the zone mix bar. Optional so the
   *  card still renders (without the bar) if the caller hasn't resolved
   *  the workouts yet. */
  workoutsById?: Map<string, AnyWorkoutTemplate>;
}

export function CollectionCard({ collection, workoutsById }: CollectionCardProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  const Icon = ICON_MAP[collection.icon] ?? Target;
  const name = pick(collection, "name");
  const description = pick(collection, "description");
  const workoutCount = collection.workoutIds.length;

  const zone = getCollectionZone(collection.slug);

  const zoneMix = useMemo(
    () =>
      workoutsById ? computeZoneMix(collection.workoutIds, workoutsById) : [],
    [collection.workoutIds, workoutsById]
  );

  return (
    <Link to={`/collections/${collection.slug}`} className="block h-full">
      <InteractiveCard
        accent={`var(--zone-${zone})`}
        className={cn(
          "bg-card border-t border-filet h-full p-4 sm:p-6",
          "hover:shadow-[6px_6px_0_var(--shadow-hard)] transition-shadow duration-150 ease-out",
          "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        )}
      >
        <div className="flex flex-col items-center text-center gap-3 sm:gap-4 h-full">
          <div
            className="size-10 sm:size-14 flex items-center justify-center shrink-0"
            style={{ backgroundColor: `var(--zone-${zone})`, color: `var(--zone-${zone}-text)` }}
          >
            <Icon className="size-5 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-sans font-bold uppercase tracking-tight leading-snug text-sm sm:text-lg">
              {name}
            </h3>
            <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          {zoneMix.length > 0 && (
            <div
              className="hidden sm:flex h-1.5 w-full gap-[3px]"
              role="img"
              aria-label={t("collections.zoneMix", {
                zones: zoneMix.map((entry) => `Z${entry.zone}`).join(", "),
              })}
            >
              {zoneMix.map((entry) => (
                <div
                  key={entry.zone}
                  className={zoneClass(entry.zone, "bg")}
                  style={{ flex: entry.percent }}
                />
              ))}
            </div>
          )}
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
      </InteractiveCard>
    </Link>
  );
}
