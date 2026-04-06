import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { useFavorites, useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import type { AnyWorkoutTemplate } from "@/types";

export function FavoritesPage() {
  const { t, i18n } = useTranslation(["common", "library"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { favorites } = useFavorites();
  const { workouts, isLoading: isLoadingRunning } = useWorkouts();
  const { workouts: strengthWorkouts, isLoading: isLoadingStrength } = useStrengthWorkouts();
  const isLoading = isLoadingRunning || isLoadingStrength;

  // Get workout objects for all favorites (running + strength)
  const favoriteWorkouts = useMemo(() => {
    if (isLoading) return [];
    const allWorkouts: AnyWorkoutTemplate[] = [...workouts, ...strengthWorkouts as AnyWorkoutTemplate[]];
    return favorites
      .map((id) => allWorkouts.find((w) => w.id === id))
      .filter((w) => w !== undefined);
  }, [favorites, workouts, strengthWorkouts, isLoading]);

  return (
    <>
      <SEOHead
        noindex={true}
        title={isEn ? "My Favorites" : "Mes Favoris"}
        canonical="/favorites"
      />
      <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart className="size-6 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEn ? "My Favorites" : "Mes Favoris"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEn
              ? `${favoriteWorkouts.length} saved workout${favoriteWorkouts.length !== 1 ? "s" : ""}`
              : `${favoriteWorkouts.length} séance${favoriteWorkouts.length !== 1 ? "s" : ""} sauvegardée${favoriteWorkouts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : favoriteWorkouts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          {/* Animated beating heart SVG */}
          <div className="mx-auto w-16 h-16">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <style>{`
                  @keyframes fav-heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .fav-heart-group { animation: none !important; }
                  }
                `}</style>
              </defs>
              <g
                className="fav-heart-group"
                style={{
                  transformOrigin: "32px 30px",
                  animation: "fav-heartbeat 3s ease-in-out infinite",
                }}
              >
                <path
                  d="M32 50 C32 50, 12 36, 12 22 C12 16, 17 10, 23 10 C27 10, 30 12, 32 16 C34 12, 37 10, 41 10 C47 10, 52 16, 52 22 C52 36, 32 50, 32 50Z"
                  fill="var(--zone-5)"
                  opacity="0.3"
                />
                <path
                  d="M32 50 C32 50, 12 36, 12 22 C12 16, 17 10, 23 10 C27 10, 30 12, 32 16 C34 12, 37 10, 41 10 C47 10, 52 16, 52 22 C52 36, 32 50, 32 50Z"
                  fill="none"
                  stroke="var(--zone-5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </g>
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isEn ? "No favorites yet" : "Pas encore de favoris"}
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isEn
                ? "Browse the library and tap the heart icon to save your favorite workouts here."
                : "Parcourez la biblioth\u00e8que et appuyez sur l'ic\u00f4ne c\u0153ur pour sauvegarder vos s\u00e9ances pr\u00e9f\u00e9r\u00e9es ici."}
            </p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/library">
              {t("library:title")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
