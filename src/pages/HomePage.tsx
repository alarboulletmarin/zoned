import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Zap, Target, Clock, Dices, ClipboardCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutCard, CategoryIcon, TipCard, CollectionCard } from "@/components/domain";
import { WorkoutOfTheDay } from "@/components/domain/WorkoutOfTheDay";
import { getCollectionBySlug } from "@/data/collections";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { SEOHead } from "@/components/seo";
import { categories, getRandomWorkout } from "@/data/workouts";
import { useWorkouts, useTips } from "@/hooks";
import { ZONE_META, type ZoneNumber, type WorkoutCategory } from "@/types";

export function HomePage() {
  const { t, i18n } = useTranslation(["common", "library"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const { workouts, isLoading } = useWorkouts();
  const workoutCount = workouts.length;
  const { tip } = useTips();

  const handleRandomWorkout = async () => {
    if (isLoadingRandom) return;
    setIsLoadingRandom(true);
    try {
      const workout = await getRandomWorkout();
      navigate(`/workout/${workout.id}`);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Get one featured workout per category (first one of each)
  const featuredWorkouts = categories.slice(0, 6).map((cat) => ({
    category: cat,
    workout: workouts.find((w) => w.category === cat),
  })).filter((item): item is { category: WorkoutCategory; workout: NonNullable<typeof item.workout> } =>
    item.workout !== undefined
  );

  const featuredCollections = [
    "debuter-le-running",
    "seances-mythiques",
    "objectif-marathon",
    "progresser-vma",
  ]
    .map((slug) => getCollectionBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const seoDescription = isEn
    ? `${workoutCount || 118} science-based running workouts organized by training zones. Free workout library for runners of all levels.`
    : `${workoutCount || 118} séances de course à pied scientifiques organisées par zones d'entraînement. Bibliothèque gratuite pour coureurs de tous niveaux.`;

  return (
    <>
      <SEOHead
        title={isEn ? "Scientific Running Workouts" : "Séances de Course Scientifiques"}
        description={seoDescription}
        canonical="/"
        jsonLd={{
          "@type": "WebSite",
          name: "Zoned",
          url: "https://zoned.run",
          description: seoDescription,
          potentialAction: {
            "@type": "SearchAction",
            target: "https://zoned.run/library?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
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
            <span className="text-2xl font-bold">{workoutCount || 118}</span>
            <span className="text-muted-foreground">{t("common:units.workouts")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="size-5 text-zone-3" />
            <span className="text-2xl font-bold">{categories.length}</span>
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

      {/* Featured Collections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("common:collections.featured")}
          </h2>
          <Button variant="ghost" asChild>
            <Link to="/collections">
              {t("common:collections.viewAll")}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} featured />
          ))}
        </div>
      </section>

      {/* CTA Sections - Compact layout */}
      <div className="space-y-3">
        {/* Tip of the Day */}
        {tip && <TipCard tip={tip} variant="banner" />}

        {/* Quiz + Random - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quiz */}
          <Link to="/quiz">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 h-full hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center gap-2.5 py-5 sm:py-6 text-center">
                <div className="rounded-full bg-primary/10 p-2.5 sm:p-3">
                  <ClipboardCheck className="size-5 sm:size-6 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm sm:text-base font-semibold">
                    {isEn ? "Find your workout" : "Trouve ta séance"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? "3 quick questions" : "3 questions rapides"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Random */}
          <Card
            className="bg-gradient-to-r from-zone-5/10 to-zone-6/10 border-zone-5/20 h-full hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleRandomWorkout}
          >
            <CardContent className="flex flex-col items-center justify-center gap-2.5 py-5 sm:py-6 text-center">
              <div className="rounded-full bg-zone-5/10 p-2.5 sm:p-3">
                <Dices className={`size-5 sm:size-6 text-zone-5 ${isLoadingRandom ? "animate-spin" : ""}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm sm:text-base font-semibold">
                  {isEn ? "Random workout" : "Séance aléatoire"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isEn ? "Surprise me!" : "Surprends-moi !"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zone System Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {isEn ? "Training Zones" : "Zones d'entrainement"}
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          {isEn ? "Click a zone to learn more" : "Cliquez sur une zone pour en savoir plus"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {([1, 2, 3, 4, 5, 6] as const).map((zone) => {
            const meta = ZONE_META[zone];
            return (
              <Card
                key={zone}
                className={`zone-${zone} zone-stripe pl-2 cursor-pointer transition-transform hover:scale-105`}
                size="compact"
                interactive
                onClick={() => setSelectedZone(zone)}
              >
                <CardHeader className="pb-2 px-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="zone-badge">Z{zone}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    {isEn ? meta.labelEn : meta.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Zone Detail Modal */}
      <ZoneDetailModal
        zone={selectedZone}
        zoneMeta={selectedZone ? ZONE_META[selectedZone] : null}
        open={selectedZone !== null}
        onOpenChange={(open) => !open && setSelectedZone(null)}
      />

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
            const count = workouts.filter((w) => w.category === cat).length;
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
                      {isLoading ? "..." : `${count} ${t("common:units.workouts")}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
    </>
  );
}
