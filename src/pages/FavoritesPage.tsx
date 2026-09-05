import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { ZoneScale } from "@/components/visualization";
import { useFavorites, useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useAppStats } from "@/hooks/useAppStats";
import type { AnyWorkoutTemplate } from "@/types";

export function FavoritesPage() {
  const { t } = useTranslation(["common", "library"]);
  const { favorites } = useFavorites();
  const { workouts, isLoading: isLoadingRunning } = useWorkouts();
  const { workouts: strengthWorkouts, isLoading: isLoadingStrength } = useStrengthWorkouts();
  const stats = useAppStats();
  const isLoading = isLoadingRunning || isLoadingStrength;

  // Get workout objects for all favorites (running + strength)
  const favoriteWorkouts = useMemo(() => {
    if (isLoading) return [];
    const allWorkouts: AnyWorkoutTemplate[] = [...workouts, ...strengthWorkouts];
    return favorites
      .map((id) => allWorkouts.find((w) => w.id === id))
      .filter((w) => w !== undefined);
  }, [favorites, workouts, strengthWorkouts, isLoading]);

  return (
    <>
      <SEOHead
        noindex={true}
        title={t("common:favorites.title")}
        canonical="/favorites"
      />

      <div className="zn-disc">
        {/* 1 — what is kept, counted against the catalogue */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("common:favorites.kicker", {
              count: favoriteWorkouts.length,
              total: stats.workouts,
            })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("common:favorites.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-disc__lede">
            {t("common:favorites.subtitle")}
          </p>
        </section>

        {/* 2 — the ink ramp orders the zones, it does not name them */}
        {favoriteWorkouts.length > 0 && (
          <div className="zn-disc__legend">
            <ZoneScale />
          </div>
        )}

        {/* 3 — the sessions */}
        <section className="zn-disc__results" aria-busy={isLoading}>
          {isLoading ? (
            <div className="zn-disc__wait">
              <Spinner size={22} label={t("common:status.loading")} />
            </div>
          ) : favoriteWorkouts.length > 0 ? (
            <div className="zn-grid">
              {favoriteWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="no-results"
              icon={Heart}
              title={t("common:favorites.noFavoritesYet")}
              description={t("common:favorites.emptyDescription", {
                total: stats.workouts,
              })}
              action={
                <Button variant="outline" asChild>
                  <Link to="/library">{t("common:favorites.emptyAction")}</Link>
                </Button>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
