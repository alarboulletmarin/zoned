import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Heart,
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
  Dumbbell,
  HeartPulse,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useCollection } from "@/hooks/useCollections";
import { useFavorites } from "@/hooks/useFavorites";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import {
  transformSessionBlocks,
  getWorkoutDuration,
  formatDurationMinutes,
} from "@/components/visualization";
import { exportCollectionToPDF } from "@/lib/export";
import { zoneClass } from "@/lib/zoneColors";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

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
  Dumbbell,
  HeartPulse,
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

/**
 * Duration a row shows: the real block total for running-family sessions, the
 * midpoint of the announced range for strength, which has no timed blocks.
 */
function rowDurationMin(workout: AnyWorkoutTemplate): number {
  return isStrengthWorkout(workout)
    ? Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2)
    : getWorkoutDuration(workout);
}

/** Dominant zone, or `null` for strength sessions, which carry none. */
function rowZone(workout: AnyWorkoutTemplate): ZoneNumber | null {
  return isStrengthWorkout(workout) ? null : getDominantZone(workout);
}

/**
 * Zone split of the whole collection, read from the workouts' own blocks
 * through `transformSessionBlocks` so it can never disagree with the per-session
 * timelines. Strength sessions carry no zone and stay out of the denominator
 * rather than being lumped into Z1.
 */
function computeZoneMix(
  workouts: AnyWorkoutTemplate[],
): { zone: ZoneNumber; percent: number }[] {
  const minutes = new Map<ZoneNumber, number>();

  for (const workout of workouts) {
    if (isStrengthWorkout(workout)) continue;
    for (const item of transformSessionBlocks(workout).zoneBreakdown) {
      if (item.zone == null) continue;
      minutes.set(item.zone, (minutes.get(item.zone) ?? 0) + item.durationMin);
    }
  }

  const total = [...minutes.values()].reduce((sum, min) => sum + min, 0);
  if (total === 0) return [];

  return [...minutes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([zone, min]) => ({ zone, percent: (min / total) * 100 }));
}

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const { collection, workouts, isLoading } = useCollection(slug);
  const { favorites, addFavorite } = useFavorites();
  const [isExporting, setIsExporting] = useState(false);

  const zoneMix = useMemo(() => computeZoneMix(workouts), [workouts]);

  const allFavorited =
    workouts.length > 0 && workouts.every((w) => favorites.includes(w.id));

  const handleFavoriteAll = () => {
    for (const workout of workouts) {
      addFavorite(workout.id);
    }
  };

  const handleExportPdf = async () => {
    if (!collection) return;
    setIsExporting(true);
    try {
      await exportCollectionToPDF({
        slug: collection.slug,
        name: pickLang(collection, "name"),
        description: pickLang(collection, "description"),
        rows: workouts.map((workout) => ({
          name: pickLang(workout, "name"),
          zone: rowZone(workout),
          durationLabel: formatDurationMinutes(rowDurationMin(workout)),
        })),
        zoneMix: zoneMix
          .filter((entry) => Math.round(entry.percent) >= 1)
          .map((entry) => ({ zone: entry.zone, percent: Math.round(entry.percent) })),
      });
    } finally {
      setIsExporting(false);
    }
  };

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
          {t("collectionsDetail.collectionNotFound")}
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
  const name = pickLang(collection, "name");
  const description = pickLang(collection, "description");
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
              name: pickLang(w, "name"),
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
        <div className="border-2 border-foreground bg-card p-6 md:p-10">
          {/* Content */}
          <div className="space-y-4 max-w-2xl">
            {/* Icon */}
            <div
              className="inline-flex items-center justify-center p-3"
              style={{
                backgroundColor: `var(--zone-${getCollectionZone(collection.slug)})`,
                color: `var(--zone-${getCollectionZone(collection.slug)}-text)`,
              }}
            >
              <Icon className="size-8" />
            </div>

            {/* Name */}
            <h1 className="font-sans font-bold uppercase leading-[0.94] tracking-[-0.04em] text-[32px] sm:text-[40px] md:text-[48px]">
              {name}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
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

            {/* Zone mix, read from the collection's own sessions */}
            {zoneMix.length > 0 && (
              <div className="pt-4 space-y-2">
                <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                  {t("collectionsDetail.zoneMix")}
                </h2>
                <div className="flex h-2.5 w-full border border-foreground">
                  {zoneMix.map((entry) => (
                    <div
                      key={entry.zone}
                      className={zoneClass(entry.zone, "bg")}
                      style={{ width: `${entry.percent}%` }}
                    />
                  ))}
                </div>
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {/* The bar keeps every zone so it always fills; the legend
                      drops the slivers that would read "0% Z6". */}
                  {zoneMix
                    .filter((entry) => Math.round(entry.percent) >= 1)
                    .map((entry) => `${Math.round(entry.percent)}% Z${entry.zone}`)
                    .join(" · ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Numbered session table */}
        {workouts.length > 0 && (
          <div className="border-2 border-foreground">
            <div className="grid grid-cols-[2.5rem_1fr_3.25rem_4rem] md:grid-cols-[3.5rem_1fr_4rem_5rem_6.5rem] bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase">
              <div className="px-2 py-2 text-center">
                {t("collectionsDetail.colNumber")}
              </div>
              <div className="px-2 py-2">{t("collectionsDetail.colSession")}</div>
              <div className="px-2 py-2 text-center">
                {t("collectionsDetail.colZone")}
              </div>
              <div className="px-2 py-2 text-center">
                {t("collectionsDetail.colDuration")}
              </div>
              <div className="hidden md:block px-2 py-2 text-right">
                {t("collectionsDetail.colOpen")}
              </div>
            </div>

            {workouts.map((workout, index) => {
              const zone = rowZone(workout);
              return (
                <Link
                  key={workout.id}
                  to={`/workout/${workout.id}`}
                  className="grid grid-cols-[2.5rem_1fr_3.25rem_4rem] md:grid-cols-[3.5rem_1fr_4rem_5rem_6.5rem] items-center border-t border-filet hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring transition-colors"
                >
                  <div className="px-2 py-3 text-center font-mono text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="px-2 py-3 font-sans font-bold uppercase leading-tight tracking-tight text-sm truncate">
                    {pickLang(workout, "name")}
                  </div>
                  <div className="px-2 py-3 flex justify-center">
                    {zone != null ? (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 font-mono text-[10px] font-bold",
                          zoneClass(zone, "bg"),
                          zoneClass(zone, "textOn"),
                        )}
                      >
                        Z{zone}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-3 text-center font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDurationMinutes(rowDurationMin(workout))}
                  </div>
                  <div className="hidden md:flex px-2 py-3 items-center justify-end gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase">
                    {t("collectionsDetail.colOpen")}
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bulk actions */}
        {workouts.length > 0 && (
          <div className="border-2 border-foreground p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("collectionsDetail.bulkActions")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="accent"
                onClick={handleFavoriteAll}
                disabled={allFavorited}
              >
                <Heart filled={allFavorited} className="size-4" />
                {allFavorited
                  ? t("collectionsDetail.allFavorited")
                  : t("collectionsDetail.favoriteAll")}
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleExportPdf()}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {t("collectionsDetail.exportPdf")}
              </Button>
            </div>
          </div>
        )}

        {/* Empty state if workouts failed to resolve */}
        {workouts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("collectionsDetail.noWorkoutsFound")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
