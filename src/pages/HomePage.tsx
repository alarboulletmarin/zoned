import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Activity,
  Dices,
  ClipboardCheck,
  CalendarRange,
  Shield,
  Flag,
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
  // Rotating hero accent word — Sprint animation
  const accentWords = useMemo(() => isEn
    ? ["5K", "10K", "half-marathon", "marathon", "trail", "ultra"]
    : ["5K", "10K", "semi", "marathon", "trail", "ultra"], [isEn]);
  const [accentIndex, setAccentIndex] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exit" | "enter">("visible");

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimState("exit");
      setTimeout(() => {
        setAccentIndex((prev) => (prev + 1) % accentWords.length);
        setAnimState("enter");
        setTimeout(() => setAnimState("visible"), 50);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [accentWords.length]);

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
              {t("common:app.heroTitle")}
              <br className="md:hidden" />{" "}
              <span
                className={`inline-block text-primary italic font-light pr-1 pt-0.5 transition-all duration-300 ${
                  animState === "exit"
                    ? "translate-x-6 md:translate-x-16 opacity-0 md:blur-[2px] [transition-timing-function:cubic-bezier(0.55,0,1,0.45)]"
                    : animState === "enter"
                      ? "-translate-x-6 md:-translate-x-16 opacity-0 md:blur-[2px]"
                      : "translate-x-0 opacity-100 blur-0 [transition-timing-function:cubic-bezier(0,0,0.2,1)]"
                }`}
              >
                {accentWords[accentIndex]}
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
        <section className="space-y-3 md:space-y-4">
          {/* Primary row: Library (hero card) + Plan (secondary hero) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <Link to="/library" className="col-span-1 md:col-span-3 group">
              <div className="bg-gradient-to-br from-primary/15 dark:from-primary/25 to-zone-5/5 dark:to-zone-5/10 rounded-xl border border-primary/20 dark:border-primary/30 p-4 md:p-8 h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
                <Activity className="size-6 md:size-10 text-primary mb-2 md:mb-4" />
                <p className="font-bold text-base md:text-2xl">
                  {workoutCount || 200}+ {isEn ? "workouts" : "séances"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                  {isEn
                    ? "Recovery, endurance, threshold, VO2max, hills, fartlek..."
                    : "Récupération, endurance, seuil, VMA, côtes, fartlek..."}
                </p>
                <span className="inline-flex items-center text-xs text-primary/70 mt-auto pt-2 md:pt-3 font-medium">
                  {isEn ? "Browse" : "Explorer"}
                  <ArrowRight className="size-3 ml-1" />
                </span>
              </div>
            </Link>
            <Link to={planLink} className="col-span-1 md:col-span-2 group">
              <div className="bg-gradient-to-br from-zone-2/15 dark:from-zone-2/25 to-zone-3/5 dark:to-zone-3/10 rounded-xl border border-zone-2/20 dark:border-zone-2/30 p-4 md:p-8 h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
                <CalendarRange className="size-6 md:size-10 text-zone-2 mb-2 md:mb-4" />
                <p className="font-bold text-base md:text-2xl">
                  {hasPlans
                    ? isEn
                      ? "My plans"
                      : "Mes plans"
                    : isEn
                      ? "Training plan"
                      : "Plan"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                  {hasPlans
                    ? `${plans.length} plan${plans.length > 1 ? "s" : ""}`
                    : isEn
                      ? "5K to Marathon · 8-24 weeks"
                      : "5K au Marathon · 8-24 sem."}
                </p>
                <span className="inline-flex items-center text-xs text-zone-2/70 mt-auto pt-2 md:pt-3 font-medium">
                  {hasPlans
                    ? isEn ? "View my plans" : "Voir mes plans"
                    : isEn ? "Assisted, free or pre-built" : "Assisté, libre ou prêt-à-l'emploi"}
                  <ArrowRight className="size-3 ml-1" />
                </span>
              </div>
            </Link>
          </div>
          {/* Secondary row: Quiz, Random, Simulator */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Link to="/quiz" className="group">
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-primary/10 dark:group-hover:bg-primary/15">
                <ClipboardCheck className="size-5 md:size-6 text-primary mb-2" />
                <p className="font-bold text-xs sm:text-sm">
                  {isEn ? "Quiz" : "Quiz"}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {isEn ? "5 quick questions" : "5 questions rapides"}
                </p>
              </div>
            </Link>
            <div
              className="group cursor-pointer"
              onClick={handleRandomWorkout}
            >
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-zone-5/10 dark:group-hover:bg-zone-5/15">
                <Dices
                  className={`size-5 md:size-6 text-zone-5 mb-2 ${isLoadingRandom ? "animate-spin" : ""}`}
                />
                <p className="font-bold text-xs sm:text-sm">
                  {isEn ? "Random" : "Aléatoire"}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {isEn ? "Surprise me!" : "Surprends-moi !"}
                </p>
              </div>
            </div>
            <Link to="/race-simulator" className="group">
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-zone-4/10 dark:group-hover:bg-zone-4/15">
                <Flag className="size-5 md:size-6 text-zone-4 mb-2" />
                <p className="font-bold text-xs sm:text-sm">
                  {isEn ? "Simulator" : "Simulateur"}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {isEn ? "Race day plan" : "Plan jour-J"}
                </p>
              </div>
            </Link>
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
