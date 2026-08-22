import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InteractiveCard } from "@/components/editorial";
import { cn } from "@/lib/utils";
import type { Collection } from "@/data/collections/types";
import { usePickLang } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { getAnyWorkoutZones } from "@/lib/workoutFilters";
import { zoneClass } from "@/lib/zoneColors";

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

  const name = pick(collection, "name");
  const description = pick(collection, "description");
  const workoutCount = collection.workoutIds.length;

  const zoneMix = useMemo(
    () =>
      workoutsById ? computeZoneMix(collection.workoutIds, workoutsById) : [],
    [collection.workoutIds, workoutsById]
  );

  const zoneRange =
    zoneMix.length > 0
      ? zoneMix[0].zone === zoneMix[zoneMix.length - 1].zone
        ? `Z${zoneMix[0].zone}`
        : `Z${zoneMix[0].zone}–Z${zoneMix[zoneMix.length - 1].zone}`
      : null;
  const caption = `${t("collections.workoutCount", { count: workoutCount })}${
    zoneRange ? ` · ${zoneRange}` : ""
  }`;

  return (
    <Link to={`/collections/${collection.slug}`} className="block h-full">
      <InteractiveCard
        className={cn(
          "bg-card border-t border-filet h-full pt-4 sm:pt-5",
          "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        )}
      >
        <div className="flex flex-col gap-2.5 sm:gap-3 h-full min-w-0">
          <h3 className="font-sans font-bold uppercase tracking-tight leading-[1.05] text-base sm:text-xl">
            {name}
          </h3>
          <p className="hidden sm:line-clamp-2 text-sm text-muted-foreground min-w-0">
            {description}
          </p>
          {zoneMix.length > 0 && (
            <div
              className="hidden sm:flex h-1.5 w-full gap-[3px] mt-1"
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
          <p className="hidden sm:block font-mono text-[11px] text-muted-foreground">
            {caption}
          </p>
        </div>
      </InteractiveCard>
    </Link>
  );
}
