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
  Dumbbell,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  WorkoutCard,
  CategoryIcon,
  TipCard,
  CollectionCard,
  StrengthWorkoutCard,
} from "@/components/domain";
import { WorkoutOfTheDay } from "@/components/domain/WorkoutOfTheDay";
import { getCollectionBySlug } from "@/data/collections";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { OnboardingBubbles } from "@/components/domain/OnboardingBubbles";
import { SEOHead } from "@/components/seo";
import { categories, getRandomWorkout } from "@/data/workouts";
import { useWorkouts, useTips } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { usePlans } from "@/hooks/usePlans";
import { ZONE_META, type ZoneNumber, type WorkoutCategory } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

export function HomePage() {
  const { t } = useTranslation(["common", "library"]);
  const pickLang = usePickLang();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const { workouts, isLoading } = useWorkouts();
  const workoutCount = workouts.length;
  const { tip } = useTips();
  const { workouts: strengthWorkouts } = useStrengthWorkouts();
  const { plans } = usePlans();
  const hasPlans = plans.length > 0;
  const planLink = hasPlans ? "/plans" : "/plan/new";
  // Rotating hero accent word — Sprint animation
  const accentWords = useMemo(
    () => t("common:pages.home.accentWords", { returnObjects: true }) as string[],
    [t]
  );
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

  // Pick 3 diverse strength sessions: full body, core, plyometrics/mobility
  const featuredStrength = useMemo(() => {
    if (strengthWorkouts.length === 0) return [];
    return [
      strengthWorkouts.find((s) => s.category === "runner_full_body"),
      strengthWorkouts.find((s) => s.category === "runner_core"),
      strengthWorkouts.find((s) => s.category === "plyometrics") ??
        strengthWorkouts.find((s) => s.category === "mobility"),
    ].filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [strengthWorkouts]);

  const seoDescription = t("common:pages.home.seoDescription", { count: workoutCount || 118 });

  // ─── Trust Badges ───
  const trustBadges = (
    <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
      <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
        {t("content:privacy.free")}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
        {t("content:privacy.noAccount")}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
        <Shield className="size-3 md:size-3.5" />
        {t("content:privacy.localData")}
      </span>
    </div>
  );

  return (
    <>
      <SEOHead
        title={t("common:home.seoTitle")}
        description={seoDescription}
        canonical="/"
        jsonLd={[
          {
            "@type": "WebSite",
            name: "Zoned",
            url: "https://zoned.run",
            description: seoDescription,
            potentialAction: {
              "@type": "SearchAction",
              target: "https://zoned.run/library?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Organization",
            name: "Zoned",
            url: "https://zoned.run",
            logo: "https://zoned.run/og-image.png",
            description:
              "Application gratuite de séances de course à pied scientifiques et génération de plans d'entraînement",
            sameAs: ["https://github.com/alarboulletmarin/zoned"],
          },
          {
            "@type": "SoftwareApplication",
            name: "Zoned",
            operatingSystem: "Web",
            applicationCategory: "HealthApplication",
            url: "https://zoned.run",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            inLanguage: ["fr", "en"],
          },
        ]}
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
                    ? t("common:plans.myPlans")
                    : t("common:plans.createMyPlan")}
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

        {/* Bento Tools Section — no duplicates with hero CTAs */}
        <section className="space-y-3 md:space-y-4">
          {/* Row 1: Quiz (2/3) + Simulator (1/3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link to="/quiz" className="col-span-1 md:col-span-2 group">
              <div className="bg-gradient-to-br from-primary/15 dark:from-primary/25 to-zone-5/5 dark:to-zone-5/10 rounded-xl border border-primary/20 dark:border-primary/30 p-5 md:p-8 h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
                <ClipboardCheck className="size-6 md:size-10 text-primary mb-2 md:mb-4" />
                <p className="font-bold text-base md:text-2xl">
                  {t("common:home.findWorkout")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("common:home.findWorkoutDesc")}
                </p>
                <span className="inline-flex items-center text-xs text-primary/70 mt-auto pt-2 md:pt-3 font-medium">
                  {workoutCount || 200}+ {t("common:units.workouts")}
                  <ArrowRight className="size-3 ml-1" />
                </span>
              </div>
            </Link>
            <Link to="/race-simulator" className="group">
              <div className="bg-gradient-to-br from-zone-4/15 dark:from-zone-4/25 to-zone-5/5 dark:to-zone-5/10 rounded-xl border border-zone-4/20 dark:border-zone-4/30 p-5 md:p-8 h-full flex flex-col transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1">
                <Flag className="size-6 md:size-10 text-zone-4 mb-2 md:mb-4" />
                <p className="font-bold text-base md:text-2xl">
                  {t("common:home.raceSimulator")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("common:home.raceSimulatorSplits")}
                </p>
                <span className="inline-flex items-center text-xs text-zone-4/70 mt-auto pt-2 md:pt-3 font-medium">
                  {t("common:home.planYourRace")}
                  <ArrowRight className="size-3 ml-1" />
                </span>
              </div>
            </Link>
          </div>
          {/* Row 2: Random + Calculators + My Zones */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button
              type="button"
              className="group cursor-pointer text-left"
              onClick={handleRandomWorkout}
            >
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-zone-5/10 dark:group-hover:bg-zone-5/15">
                <Dices
                  className={`size-5 md:size-6 text-zone-5 mb-2 ${isLoadingRandom ? "animate-spin" : ""}`}
                />
                <p className="font-bold text-xs sm:text-sm">
                  {t("common:home.random")}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {t("common:home.surpriseMe")}
                </p>
              </div>
            </button>
            <Link to="/calculators" className="group">
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-zone-3/10 dark:group-hover:bg-zone-3/15">
                <Activity className="size-5 md:size-6 text-zone-3 mb-2" />
                <p className="font-bold text-xs sm:text-sm">
                  {t("common:home.calculators")}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {t("common:home.nineTools")}
                </p>
              </div>
            </Link>
            <Link to="/my-zones" className="group">
              <div className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 p-4 md:p-5 h-full flex flex-col items-center text-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-1 group-hover:bg-zone-2/10 dark:group-hover:bg-zone-2/15">
                <Shield className="size-5 md:size-6 text-zone-2 mb-2" />
                <p className="font-bold text-xs sm:text-sm">
                  {t("common:home.myZones")}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {t("common:home.hrPaceZones")}
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
              {t("common:zones.trainingZones")}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t("common:zones.clickZoneToLearn")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {([1, 2, 3, 4, 5, 6] as const).map((zone) => {
              const meta = ZONE_META[zone];
              return (
                <button
                  type="button"
                  key={zone}
                  className="group cursor-pointer text-left w-full"
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
                    <h3 className="font-bold text-sm uppercase tracking-wide mb-3">
                      {pickLang(meta, "label")}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pickLang(meta, "description")}
                    </p>
                  </div>
                </button>
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
              {t("common:home.featuredWorkouts")}
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/library">
                {t("common:home.viewAll")}
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

        {/* Strength Training Section */}
        {featuredStrength.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="size-5 text-amber-500" />
                <h2 className="text-xl md:text-2xl font-bold">
                  {t("common:home.strengthForRunners")}
                </h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/library?type=strength">
                  {t("common:home.seeAll")}
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("common:home.strengthForRunnersDesc")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredStrength.map((session) => (
                <StrengthWorkoutCard key={session.id} workout={session} />
              ))}
            </div>
          </section>
        )}

        {/* Categories Overview */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-10">
            {t("common:home.browseByCategory")}
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
