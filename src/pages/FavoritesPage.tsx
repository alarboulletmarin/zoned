import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { useFavorites, useWorkouts } from "@/hooks";

export function FavoritesPage() {
  const { t, i18n } = useTranslation(["common", "library"]);
  const isEn = i18n.language === "en";
  const { favorites } = useFavorites();
  const { workouts, isLoading } = useWorkouts();

  // Get workout objects for all favorites
  const favoriteWorkouts = useMemo(() => {
    if (isLoading) return [];
    return favorites
      .map((id) => workouts.find((w) => w.id === id))
      .filter((w) => w !== undefined);
  }, [favorites, workouts, isLoading]);

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
          <h1 className="text-2xl font-bold">
            {isEn ? "My Favorites" : "Mes Favoris"}
          </h1>
          <p className="text-muted-foreground">
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
          <Heart className="size-16 mx-auto text-muted-foreground/30" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isEn ? "No favorites yet" : "Pas encore de favoris"}
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isEn
                ? "Browse the library and tap the heart icon to save your favorite workouts here."
                : "Parcourez la bibliothèque et appuyez sur l'icône cœur pour sauvegarder vos séances préférées ici."}
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
