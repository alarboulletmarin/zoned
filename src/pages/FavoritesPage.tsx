import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { useFavorites } from "@/hooks";
import { getWorkoutById } from "@/data/workouts";

export function FavoritesPage() {
  const { t, i18n } = useTranslation(["common", "library"]);
  const isEn = i18n.language === "en";
  const { favorites } = useFavorites();

  // Get workout objects for all favorites
  const favoriteWorkouts = favorites
    .map((id) => getWorkoutById(id))
    .filter((w) => w !== undefined);

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
      {favoriteWorkouts.length > 0 ? (
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
