import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Dices,
  ClipboardCheck,
  CalendarRange,
  Shield,
  Flag,
  Calculator,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
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

  // ─── Trust Badges ───
  const trustBadges = (
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
  );

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
      <div className="space-y-10 md:space-y-16 py-4 md:py-8">
        {/* Onboarding bubbles (first visit only) */}
        <OnboardingBubbles />

        {/* Hero Section */}
        <section className="pt-0 md:pt-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-[1.1]">
              {t("common:app.heroTitle")
                .replace(t("common:app.heroTitleAccent"), "")
                .trim()}{" "}
              <span className="text-muted-foreground italic font-light">
                {t("common:app.heroTitleAccent")}
              </span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-xl mb-6 md:mb-8 leading-relaxed">
              {t("common:app.tagline")}
            </p>
            {trustBadges}
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 py-3 md:px-8 md:py-4 h-auto text-sm md:text-lg font-bold"
              >
                <Link to={planLink}>
                  <CalendarRange className="mr-2 size-4 md:size-5" />
                  {hasPlans
                    ? isEn
                      ? "My plans"
                      : "Mes plans"
                    : isEn
                      ? "Create my plan"
                      : "Créer mon plan"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6 py-3 md:px-8 md:py-4 h-auto text-sm md:text-lg font-bold"
              >
                <Link to="/library">
                  {t("library:title")}
                  <ArrowRight className="ml-2 size-4 md:size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Tools Section */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* Row 1: Quiz (col-span-2) + Library (col-span-1) */}
          <Link to="/quiz" className="col-span-2 md:col-span-2 group">
            <div className="bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent rounded-xl border border-border/50 p-5 md:p-6 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
              <ClipboardCheck className="size-6 md:size-8 text-primary mb-3" />
              <p className="font-bold text-sm sm:text-base md:text-lg">
                {isEn ? "Find your workout" : "Trouve ta séance"}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {isEn ? "5 quick questions" : "5 questions rapides"}
              </p>
              <span className="inline-flex items-center text-xs text-muted-foreground mt-auto pt-2 bg-muted/50 rounded-full px-2 py-0.5 w-fit">
                {workoutCount || 200}+ {t("common:units.workouts")}
              </span>
            </div>
          </Link>
          <Link to="/library" className="col-span-2 md:col-span-1 group">
            <div className="bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent rounded-xl border border-border/50 p-5 md:p-6 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
              <ArrowRight className="size-6 md:size-8 text-zone-2 mb-3" />
              <p className="font-bold text-sm sm:text-base">
                {t("library:title")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isEn ? "Browse all" : "Tout parcourir"}
              </p>
              <span className="inline-flex items-center text-xs text-muted-foreground mt-auto pt-2 bg-muted/50 rounded-full px-2 py-0.5 w-fit">
                {workoutCount || 200}+ {t("common:units.workouts")}
              </span>
            </div>
          </Link>
          {/* Row 2: Random + Plan + Simulator */}
          <div
            className="col-span-1 group cursor-pointer"
            onClick={handleRandomWorkout}
          >
            <div className="bg-gradient-to-br from-zone-5/10 dark:from-zone-5/20 to-transparent rounded-xl border border-border/50 p-5 md:p-6 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
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
          <Link to={planLink} className="col-span-1 group">
            <div className="bg-gradient-to-br from-zone-3/10 dark:from-zone-3/20 to-transparent rounded-xl border border-border/50 p-5 md:p-6 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
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
                  ? `${plans.length} plan${plans.length > 1 ? "s" : ""}`
                  : isEn
                    ? "5K to Marathon"
                    : "5K au Marathon"}
              </p>
              <span className="inline-flex items-center text-xs text-muted-foreground mt-auto pt-2 bg-muted/50 rounded-full px-2 py-0.5 w-fit">
                <Calculator className="size-3 mr-1" />
                {isEn ? "9 calculators" : "9 calculateurs"}
              </span>
            </div>
          </Link>
          <Link to="/race-simulator" className="col-span-2 md:col-span-1 group">
            <div className="bg-gradient-to-br from-zone-4/10 dark:from-zone-4/20 to-transparent rounded-xl border border-border/50 p-5 md:p-6 h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
              <Flag className="size-6 text-zone-4 mb-3" />
              <p className="font-bold text-sm sm:text-base">
                {t("common:simulator.ctaTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("common:simulator.ctaSubtitle")}
              </p>
            </div>
          </Link>
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

        {/* Tip of the Day */}
        {tip && <TipCard tip={tip} variant="banner" />}

        {/* Zone System Preview */}
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
                    className={`bg-gradient-to-br from-zone-${zone}/10 dark:from-zone-${zone}/20 to-transparent rounded-xl border border-border/50 p-6 h-full transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1`}
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
                  <div className="bg-gradient-to-br from-muted/50 dark:from-muted/70 to-transparent rounded-xl border border-border/50 text-center h-full p-4 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1">
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
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
