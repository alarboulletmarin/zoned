import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Dices,
  ClipboardCheck,
  CalendarRange,
  Shield,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  WorkoutCard,
  CategoryIcon,
  TipCard,
  CollectionCard,
} from "@/components/domain";
import { WorkoutOfTheDay } from "@/components/domain/WorkoutOfTheDay";
import { getCollectionBySlug } from "@/data/collections";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { OnboardingBubbles } from "@/components/domain/OnboardingBubbles";
import { SEOHead } from "@/components/seo";
import { categories, getRandomWorkout } from "@/data/workouts";
import { useWorkouts, useTips } from "@/hooks";
import { usePlans } from "@/hooks/usePlans";
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
  const { plans } = usePlans();
  const hasPlans = plans.length > 0;
  const planLink = hasPlans ? "/plans" : "/plan/new";

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
  const featuredWorkouts = categories
    .slice(0, 6)
    .map((cat) => ({
      category: cat,
      workout: workouts.find((w) => w.category === cat),
    }))
    .filter(
      (
        item,
      ): item is {
        category: WorkoutCategory;
        workout: NonNullable<typeof item.workout>;
      } => item.workout !== undefined,
    );

  const featuredCollections = [
    "debuter-le-running",
    "séances-mythiques",
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
        title={
          isEn
            ? "Scientific Running Workouts"
            : "Séances de Course Scientifiques"
        }
        description={seoDescription}
        canonical="/"
        jsonLd={{
          "@type": "WebSite",
          name: "Zoned",
          url: "https://zoned.run",
          description: seoDescription,
          potentialAction: {
            "@type": "SearchAction",
            target: "https://zoned.run/library?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <div className="space-y-10 md:space-y-16 py-10 md:py-14">
        {/* Onboarding bubbles (first visit only) */}
        <OnboardingBubbles />

        {/* Hero Section - Left-aligned, editorial */}
        <section className="pt-8 md:pt-16">
          <div className="max-w-3xl">
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 block">
              {isEn ? "Performance Lab" : "Laboratoire de Performance"}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-[1.1]">
              {isEn ? (
                <>
                  {workoutCount || 200} science-based running{" "}
                  <span className="text-muted-foreground italic font-light">
                    workouts
                  </span>
                </>
              ) : (
                <>
                  {workoutCount || 200} séances de course{" "}
                  <span className="text-muted-foreground italic font-light">
                    scientifiques
                  </span>
                </>
              )}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-xl mb-6 md:mb-8 leading-relaxed">
              {t("common:app.tagline")}
            </p>
            <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                {t("common:privacy.free")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                {t("common:privacy.noAccount")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                <Shield className="size-3 md:size-3.5" />
                {t("common:privacy.localData")}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 py-3 md:px-8 md:py-4 h-auto text-sm md:text-lg font-bold"
              >
                <Link to="/library">
                  {t("library:title")}
                  <ArrowRight className="ml-2 size-4 md:size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6 py-3 md:px-8 md:py-4 h-auto text-sm md:text-lg font-bold"
              >
                <Link to={planLink}>
                  <CalendarRange className="mr-2 size-4 md:size-5" />
                  {hasPlans
                    ? isEn
                      ? "My plans"
                      : "Mes plans"
                    : isEn
                      ? "Create a plan"
                      : "Créer un plan"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-card p-4 md:p-8 rounded-lg shadow-sm border border-border/10 flex flex-col justify-between h-28 md:h-48 group hover:bg-primary/5 transition-colors">
            <span className="text-primary font-bold text-2xl md:text-4xl">
              {workoutCount || 118}
            </span>
            <div>
              <h4 className="font-bold text-sm md:text-lg">
                {isEn ? "Total Workouts" : "Séances Total"}
              </h4>
              <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                {isEn ? "From sprint to marathon" : "Du sprint au marathon"}
              </p>
            </div>
          </div>
          <div className="bg-card p-4 md:p-8 rounded-lg shadow-sm border border-border/10 flex flex-col justify-between h-28 md:h-48 group hover:bg-zone-3/5 transition-colors">
            <span className="text-zone-3 font-bold text-2xl md:text-4xl">
              {categories.length}
            </span>
            <div>
              <h4 className="font-bold text-sm md:text-lg">
                {t("common:units.categories")}
              </h4>
              <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                {isEn
                  ? "Targeted training variety"
                  : "Variété d'entraînements ciblés"}
              </p>
            </div>
          </div>
          <div className="bg-card p-4 md:p-8 rounded-lg shadow-sm border border-border/10 flex flex-col justify-between h-28 md:h-48 group hover:bg-zone-5/5 transition-colors">
            <span className="text-zone-5 font-bold text-2xl md:text-4xl">
              6
            </span>
            <div>
              <h4 className="font-bold text-sm md:text-lg">
                {t("common:units.zones")}
              </h4>
              <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                {isEn ? "Recovery to sprint" : "Récupération au sprint"}
              </p>
            </div>
          </div>
        </section>

        {/* Workout of the Day */}
        <section>
          <WorkoutOfTheDay />
        </section>

        {/* Featured Collections */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("common:collections.featured")}
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/collections">
                {t("common:collections.viewAll")}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                featured
              />
            ))}
          </div>
        </section>

        {/* CTA Sections */}
        <div className="space-y-6">
          {/* Tip of the Day */}
          {tip && <TipCard tip={tip} variant="banner" />}

          {/* Quiz + Random + Plan */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quiz */}
            <Link to="/quiz" className="group">
              <div className="bg-card border border-border/50 rounded-lg border-t-4 border-t-primary p-6 h-full transition-transform duration-200 group-hover:-translate-y-2">
                <ClipboardCheck className="size-6 text-primary mb-3" />
                <p className="font-bold text-sm sm:text-base">
                  {isEn ? "Find your workout" : "Trouve ta séance"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEn ? "3 quick questions" : "3 questions rapides"}
                </p>
              </div>
            </Link>

            {/* Random */}
            <div className="group cursor-pointer" onClick={handleRandomWorkout}>
              <div className="bg-card border border-border/50 rounded-lg border-t-4 border-t-zone-5 p-6 h-full transition-transform duration-200 group-hover:-translate-y-2">
                <Dices
                  className={`size-6 text-zone-5 mb-3 ${isLoadingRandom ? "animate-spin" : ""}`}
                />
                <p className="font-bold text-sm sm:text-base">
                  {isEn ? "Random workout" : "Séance aléatoire"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEn ? "Surprise me!" : "Surprends-moi !"}
                </p>
              </div>
            </div>

            {/* Training Plan */}
            <Link to={planLink} className="col-span-2 lg:col-span-1 group">
              <div className="bg-card border border-border/50 rounded-lg border-t-4 border-t-zone-3 p-6 h-full transition-transform duration-200 group-hover:-translate-y-2">
                <CalendarRange className="size-6 text-zone-3 mb-3" />
                <p className="font-bold text-sm sm:text-base">
                  {hasPlans
                    ? isEn
                      ? "My plans"
                      : "Mes plans"
                    : isEn
                      ? "Training plan"
                      : "Plan d'entraînement"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasPlans
                    ? isEn
                      ? `${plans.length} plan${plans.length > 1 ? "s" : ""}`
                      : `${plans.length} plan${plans.length > 1 ? "s" : ""}`
                    : isEn
                      ? "5K to Marathon · 8-24 weeks"
                      : "5K au Marathon · 8-24 sem."}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Zone System Preview - Border-top editorial style */}
        <section>
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              {isEn ? "Training Zones" : "Zones d'entraînement"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isEn
                ? "Click a zone to learn more"
                : "Cliquez sur une zone pour en savoir plus"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {([1, 2, 3, 4, 5, 6] as const).map((zone) => {
              const meta = ZONE_META[zone];
              return (
                <div
                  key={zone}
                  className="group cursor-pointer"
                  onClick={() => setSelectedZone(zone)}
                >
                  <div
                    className={`bg-zone-${zone}/10 border-t-4 border-zone-${zone} p-6 h-full rounded-b-lg transition-transform duration-200 group-hover:-translate-y-2`}
                  >
                    <span
                      className={`font-black text-2xl text-zone-${zone} block mb-2`}
                    >
                      Z{zone}
                    </span>
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-3">
                      {isEn ? meta.labelEn : meta.label}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isEn ? meta.descriptionEn : meta.description}
                    </p>
                  </div>
                </div>
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
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              {isEn ? "Featured Workouts" : "Séances en vedette"}
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/library">
                {isEn ? "View all" : "Voir tout"}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-10">
            {isEn ? "Browse by Category" : "Parcourir par catégorie"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
                      <CategoryIcon
                        category={cat}
                        size="lg"
                        className="mx-auto"
                      />
                      <p className="font-bold mt-2">
                        {t(`library:categories.${cat}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isLoading
                          ? "..."
                          : `${count} ${t("common:units.workouts")}`}
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
