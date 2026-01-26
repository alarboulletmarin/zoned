import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Zap, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutCard, WorkoutOfTheDay, CategoryIcon } from "@/components/domain";
import { totalWorkoutCount, categories, workoutsByCategory } from "@/data/workouts";

export function HomePage() {
  const { t, i18n } = useTranslation(["common", "library"]);
  const isEn = i18n.language === "en";

  // Get one featured workout per category (first one of each)
  const featuredWorkouts = categories.slice(0, 6).map((cat) => ({
    category: cat,
    workout: workoutsByCategory[cat][0],
  }));

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isEn ? "Running Workouts" : "Entraînements"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("common:app.tagline")}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 py-6">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            <span className="text-2xl font-bold">{totalWorkoutCount}</span>
            <span className="text-muted-foreground">{t("common:units.workouts")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="size-5 text-zone-3" />
            <span className="text-2xl font-bold">10</span>
            <span className="text-muted-foreground">{t("common:units.categories")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-zone-5" />
            <span className="text-2xl font-bold">6</span>
            <span className="text-muted-foreground">{t("common:units.zones")}</span>
          </div>
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="mt-4">
          <Link to="/library">
            {t("library:title")}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </section>

      {/* Workout of the Day */}
      <WorkoutOfTheDay />

      {/* Quiz Teaser */}
      <section>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isEn ? "Not sure what to do?" : "Pas sûr de ta séance ?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isEn
                    ? "3 quick questions to find a suitable workout."
                    : "3 questions rapides pour trouver une séance adaptée."}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/quiz">
                {isEn ? "Take the quiz" : "Faire le quiz"}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Zone System Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {isEn ? "Training Zones" : "Zones d'entraînement"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {([1, 2, 3, 4, 5, 6] as const).map((zone) => (
            <Card
              key={zone}
              className={`zone-${zone} zone-stripe pl-2`}
              size="compact"
            >
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="zone-badge">Z{zone}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pt-0">
                <p className="text-xs text-muted-foreground">
                  {isEn
                    ? ["Recovery", "Endurance", "Tempo", "Threshold", "VO2max", "Sprint"][zone - 1]
                    : ["Récupération", "Endurance", "Tempo", "Seuil", "VO2max", "Sprint"][zone - 1]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Workouts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isEn ? "Featured Workouts" : "Séances en vedette"}
          </h2>
          <Button variant="ghost" asChild>
            <Link to="/library">
              {isEn ? "View all" : "Voir tout"}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredWorkouts.map(({ category, workout }) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon category={category} size="sm" />
                <span>{t(`library:categories.${category}`)}</span>
              </div>
              <WorkoutCard workout={workout} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {isEn ? "Browse by Category" : "Parcourir par catégorie"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const count = workoutsByCategory[cat].length;
            return (
              <Link
                key={cat}
                to={`/library?category=${cat}`}
                className="group"
              >
                <Card
                  interactive
                  size="compact"
                  className="text-center h-full"
                >
                  <CardContent className="pt-4">
                    <CategoryIcon category={cat} size="lg" className="mx-auto" />
                    <p className="font-medium mt-2">
                      {t(`library:categories.${cat}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {count} {t("common:units.workouts")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
