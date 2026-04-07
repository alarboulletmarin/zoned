import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  MapPin,
  Target,
  Circle,
  Mountain,
  Route,
  Leaf,
  Footprints,
  Zap,
  Flame,
  Rocket,
  Timer,
  Shuffle,
  ClipboardCheck,
  Link2,
  Shield,
  BookOpen,
  Sparkles,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ZoneBadge,
  WorkoutCardCompact,
  FavoriteButton,
  ZonePersonalizationCTA,
  TipCard,
} from "@/components/domain";
import { WorkoutStructure, CoachingTips } from "@/components/domain/WorkoutStructure";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/issueBuilder";
import { NutritionRecoverySection } from "@/components/domain/NutritionRecoverySection";
import { ScienceSection } from "@/components/domain/ScienceSection";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { SEOHead } from "@/components/seo";
import { SessionTimeline, ZoneDistribution, transformSessionBlocks } from "@/components/visualization";
import { StrengthSessionTimeline } from "@/components/visualization/StrengthSessionTimeline";
import { MuscleDistribution } from "@/components/visualization/MuscleDistribution";
import { MuscleMap } from "@/components/visualization/MuscleMap";
import { MiniSessionTimeline } from "@/components/visualization/MiniSessionTimeline";
import { useWorkout, useRelatedWorkouts, useTips } from "@/hooks";
import { RelatedContent } from "@/components/domain/RelatedContent";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import type { WorkoutCategory, ZoneRange, AnyWorkoutTemplate } from "@/types";
import {
  getDominantZone,
  isStrengthWorkout,
} from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { IntensityBadge, INTENSITY_COLORS } from "@/components/domain/IntensityBadge";
import { MuscleGroupBadges } from "@/components/domain/MuscleGroupBadge";
import { StrengthExerciseList } from "@/components/domain/StrengthExerciseList";
import { loadUserZonePrefs, calculateAllZones } from "@/lib/zones";

/** Category icons using Lucide */
const CATEGORY_ICONS: Record<WorkoutCategory, React.ComponentType<{ className?: string }>> = {
  recovery: Leaf,
  endurance: Footprints,
  tempo: Zap,
  threshold: Flame,
  vma_intervals: Rocket,
  long_run: Route,
  hills: Mountain,
  fartlek: Timer,
  race_pace: Target,
  mixed: Shuffle,
  assessment: ClipboardCheck,
};

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["session", "library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;

  const locationState = location.state as {
    from?: string;
    planId?: string;
    planName?: string;
    weekNumber?: number;
    volumePercent?: number;
    estimatedDurationMin?: number;
    targetDistanceKm?: number;
    scrollY?: number;
    collectionSlug?: string;
    collectionName?: string;
  } | null;

  const { workout, isLoading } = useWorkout(id);
  const isStrength = workout ? isStrengthWorkout(workout as AnyWorkoutTemplate) : false;
  const { workouts: relatedWorkouts } = useRelatedWorkouts(isStrength ? null : workout);

  // Get contextual tip based on dominant zone (running workouts only)
  const dominantZoneForTip = workout && !isStrength ? getDominantZone(workout) : undefined;
  const { tip } = useTips({
    filters: dominantZoneForTip ? { zones: [dominantZoneForTip] } : undefined,
    autoLoad: !!workout && !isStrength,
  });

  // Load user zones from localStorage
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  const [hasUserZones, setHasUserZones] = useState(false);

  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs && (prefs.fcMax || prefs.vma)) {
      const zones = calculateAllZones(prefs);
      setUserZones(zones);
      setHasUserZones(true);
    } else {
      setUserZones([]);
      setHasUserZones(false);
    }
  }, []);

  const timelineCardRef = useRef<HTMLDivElement>(null);
  const timelineScrolledPast = useScrolledPast(timelineCardRef);

  if (isLoading) {
    return (
      <div className="py-8 space-y-8">
        {/* Back button skeleton */}
        <Skeleton className="h-9 w-40 rounded-md" />

        {/* Bento header skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session identity card skeleton */}
          <Skeleton className="lg:col-span-8 h-48 lg:h-60 rounded-xl" />

          {/* Summary metrics skeleton (2x2 grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <Skeleton className="h-20 lg:h-28 rounded-lg lg:rounded-xl" />
            <Skeleton className="h-20 lg:h-28 rounded-lg lg:rounded-xl" />
            <Skeleton className="h-20 lg:h-28 rounded-lg lg:rounded-xl" />
            <Skeleton className="h-20 lg:h-28 rounded-lg lg:rounded-xl" />
          </div>
        </div>

        {/* Content area skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline skeleton with zone shimmer */}
            <Skeleton variant="zone-shimmer" className="h-40 rounded-xl" />
            {/* Structure skeleton */}
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("common:errors.workoutNotFound")}</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/library">
            <ArrowLeft className="mr-2 size-4" />
            {t("common:actions.backToLibrary")}
          </Link>
        </Button>
      </div>
    );
  }

  // ── Strength workout branch ─────────────────────────────────────
  if (isStrengthWorkout(workout as AnyWorkoutTemplate)) {
    return (
      <StrengthWorkoutDetail
        workout={workout as unknown as StrengthWorkoutTemplate}
        locationState={locationState}
        isEn={isEn}
      />
    );
  }

  const dominantZone = getDominantZone(workout);
  // Plan context: duration from plan generation (volume-scaled, may differ for long runs)
  const planWeekNumber = locationState?.weekNumber;
  const planVolumePercent = locationState?.volumePercent;
  const planEstimatedDuration = locationState?.estimatedDurationMin;
  const planTargetDistanceKm = locationState?.targetDistanceKm;
  const hasPlanContext = locationState?.from === "plan" && planEstimatedDuration != null;

  // Base session data from workout template
  const baseSessionData = transformSessionBlocks(
    {
      warmup: workout.warmupTemplate,
      mainSet: workout.mainSetTemplate,
      cooldown: workout.cooldownTemplate,
    },
    isEn
  );
  const baseDuration = Math.round(baseSessionData.totalDurationMin);

  // Always use plan duration when coming from a plan — it's the authoritative value
  // that matches what the calendar shows.
  const planDuration = planEstimatedDuration != null ? Math.round(planEstimatedDuration) : null;
  const duration = (locationState?.from === "plan" && planDuration != null)
    ? planDuration
    : baseDuration;

  const CategoryIcon = CATEGORY_ICONS[workout.category];

  // Breadcrumb trail
  const workoutName = isEn ? workout.nameEn : workout.name;
  const categoryLabel = t(`library:categories.${workout.category}`);
  type BreadcrumbItem = { label: string; to?: string; state?: Record<string, unknown> };
  const breadcrumbs: BreadcrumbItem[] = [{ label: t("common:nav.home"), to: "/" }];

  if (locationState?.from === "plan" && locationState.planId) {
    breadcrumbs.push({ label: t("common:nav.plans"), to: "/plans" });
    breadcrumbs.push({
      label: locationState.planName || (isEn ? "Plan" : "Plan"),
      to: `/plan/${locationState.planId}?week=${locationState.weekNumber}`,
      state: { returnScrollY: locationState.scrollY },
    });
  } else if (locationState?.from === "collection" && locationState.collectionSlug) {
    breadcrumbs.push({ label: t("common:collections.title"), to: "/collections" });
    breadcrumbs.push({
      label: locationState.collectionName || (isEn ? "Collection" : "Collection"),
      to: `/collections/${locationState.collectionSlug}`,
    });
  } else if (locationState?.from === "quiz") {
    breadcrumbs.push({ label: t("common:nav.library"), to: "/library" });
    breadcrumbs.push({ label: "Quiz", to: "/quiz" });
  } else {
    breadcrumbs.push({ label: t("common:nav.library"), to: "/library" });
    breadcrumbs.push({
      label: categoryLabel,
      to: `/library?category=${workout.category}`,
    });
  }
  breadcrumbs.push({ label: workoutName });

  // The immediate parent is the second-to-last breadcrumb (for mobile)
  const parentCrumb = breadcrumbs[breadcrumbs.length - 2];

  // Environment requirements
  const envRequirements: { icon: React.ComponentType<{ className?: string }>; text: string }[] = [];
  if (workout.environment.requiresTrack) {
    envRequirements.push({ icon: Circle, text: t("environment.requiresTrack") });
  }
  if (workout.environment.requiresHills) {
    envRequirements.push({ icon: Mountain, text: t("environment.requiresHills") });
  }
  if (workout.environment.prefersFlat) {
    envRequirements.push({ icon: Route, text: t("environment.prefersFlat") });
  }

  const seoTitle = isEn ? workout.nameEn : workout.name;
  const seoDescription = (isEn ? workout.descriptionEn : workout.description).slice(0, 155);

  // Derive the environment label for the metric card
  const envLabel = envRequirements.length > 0
    ? envRequirements.map((r) => r.text).join(", ")
    : t("details.environment");

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`/workout/${workout.id}`}
        ogType="article"
        jsonLd={[
          {
            "@type": "ExercisePlan",
            name: seoTitle,
            description: seoDescription,
            exerciseType: "Running",
            activityDuration: `PT${duration}M`,
            intensity: workout.difficulty,
            additionalProperty: [
              { "@type": "PropertyValue", name: "Category", value: workout.category },
              { "@type": "PropertyValue", name: "Target System", value: workout.targetSystem },
              { "@type": "PropertyValue", name: "Difficulty", value: workout.difficulty },
            ],
            isPartOf: {
              "@type": "CollectionPage",
              name: "Zoned Running Workouts Library",
              url: "https://zoned.run/library",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Bibliothèque", item: "https://zoned.run/library" },
              { "@type": "ListItem", position: 3, name: seoTitle },
            ],
          },
        ]}
      />
      <div className={`zone-${dominantZone} py-8 space-y-8`}>
        {/* Back + Breadcrumb */}
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="self-start">
            <ArrowLeft className="mr-2 size-4" />
            {isEn ? "Back" : "Retour"}
          </Button>

          <nav aria-label="Breadcrumb">
            {/* Desktop: full breadcrumb */}
            <ol className="hidden sm:flex items-center flex-wrap">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={i} className="flex items-center">
                    {i > 0 && (
                      <span className="text-muted-foreground/50 mx-1.5 text-sm">/</span>
                    )}
                    {isLast ? (
                      <span className="text-foreground text-sm font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.to!}
                        state={crumb.state}
                        className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            {/* Mobile: immediate parent + current name */}
            <div className="flex sm:hidden items-center text-sm">
              <Link
                to={parentCrumb.to!}
                state={parentCrumb.state}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {parentCrumb.label}
              </Link>
              <span className="text-muted-foreground/50 mx-1.5">/</span>
              <span className="text-foreground font-medium truncate">{workoutName}</span>
            </div>
          </nav>
        </div>

        {/* Plan context banner — volume reduction or long run target */}
        {hasPlanContext && Math.abs(duration - baseDuration) > 3 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm flex items-center gap-2">
            <Clock className="size-4 text-primary shrink-0" />
            <span>
              {duration > baseDuration && planTargetDistanceKm ? (
                <>
                  {t("session:planContext.longRunBanner", { week: planWeekNumber, distance: planTargetDistanceKm, duration })}
                  <span className="text-muted-foreground ml-1">
                    {t("session:planContext.longRunStructure", { duration: baseDuration })}
                  </span>
                </>
              ) : (
                <>
                  {t("session:planContext.banner", { week: planWeekNumber, volume: planVolumePercent, duration })}
                  <span className="text-muted-foreground ml-1">
                    {t("session:planContext.fullSession", { duration: baseDuration })}
                  </span>
                </>
              )}
            </span>
          </div>
        )}

        {/* Bento Header */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session Identity Card */}
          <div className={`lg:col-span-8 bg-gradient-to-br from-zone-${dominantZone}/10 dark:from-zone-${dominantZone}/20 to-transparent border border-border/50 rounded-xl p-5 sm:p-8 md:p-10 flex flex-col justify-between lg:min-h-[240px]`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ZoneBadge zone={dominantZone} size="lg" showLabel />
                  <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                    <CategoryIcon className="size-3.5" />
                    {t(`library:categories.${workout.category}`)}
                  </Badge>
                </div>
                <FavoriteButton workoutId={workout.id} />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {isEn ? workout.nameEn : workout.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed text-lg">
                <GlossaryLinkedText text={isEn ? workout.descriptionEn : workout.description} />
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
              <ExportMenu workout={workout} />
              <Button
                variant="secondary"
                className="rounded-full px-5 py-2.5 h-auto font-bold"
                onClick={async () => {
                  const ok = await copyToClipboard(window.location.href);
                  if (ok) toast.success(t("common:actions.linkCopied"));
                  else toast.error(t("common:errors.generic"));
                }}
              >
                <Link2 className="size-4 mr-2" />
                {t("common:actions.copyLink")}
              </Button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Clock className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-lg lg:text-2xl font-bold">{duration}</span>
                <span className="text-[10px] lg:text-xs text-muted-foreground">{t("common:units.minutes")}</span>
                {hasPlanContext && (
                  <span className="text-[9px] text-muted-foreground line-through">{baseDuration}</span>
                )}
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Dumbbell className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm lg:text-lg font-bold">{t(`library:difficulty.${workout.difficulty}`)}</span>
                <span className="text-xs text-muted-foreground">{t("details.difficulty")}</span>
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Target className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm font-bold">{t(`targetSystems.${workout.targetSystem}`)}</span>
                <span className="text-xs text-muted-foreground">{t("details.targetSystem")}</span>
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <MapPin className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm font-bold">
                  {envRequirements.length > 0 ? envLabel : (isEn ? "Any" : "Tous")}
                </span>
                <span className="text-xs text-muted-foreground">{t("details.environment")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Zone Personalization CTA - show only if user has no zones configured */}
        {!hasUserZones && <ZonePersonalizationCTA />}

        {timelineScrolledPast && (
          <div className="sticky top-12 z-40 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 bg-background/90 backdrop-blur-sm md:backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_6px_12px_-4px_rgba(0,0,0,0.15)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3),0_6px_12px_-4px_rgba(0,0,0,0.4)] border-b border-border/30 will-change-[transform,opacity] animate-slide-in-top print:hidden">
            <MiniSessionTimeline
              workout={workout}
              onClickScrollBack={() => {
                timelineCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline Visualization */}
            <div ref={timelineCardRef}>
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("titles.sessionTimeline")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionTimeline workout={workout} />
                </CardContent>
              </Card>
            </div>

            {/* Structure */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("titles.workoutStructure")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutStructure workout={workout} userZones={hasUserZones ? userZones : undefined} />
              </CardContent>
            </Card>

            {/* Nutrition & Recovery */}
            <NutritionRecoverySection workout={workout} />

            {/* Science Mode */}
            <ScienceSection workout={workout} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Zone Distribution */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t("titles.zoneDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ZoneDistribution workout={workout} />
              </CardContent>
            </Card>

            {/* Contextual Tip */}
            {tip && (
              <TipCard tip={tip} variant="card" />
            )}

            {/* Related Content (cross-links to articles, workouts, glossary) */}
            <RelatedContent source={{ type: "workout", id: workout.id }} />

            {/* Related Workouts (same category) */}
            {relatedWorkouts.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {t("titles.relatedWorkouts")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedWorkouts.slice(0, 5).map((related) => (
                    <WorkoutCardCompact key={related.id} workout={related} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Coaching Tips */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t("titles.coachingTips")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoachingTips workout={workout} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Strength Workout Detail
// ============================================================================

interface StrengthWorkoutDetailProps {
  workout: StrengthWorkoutTemplate;
  locationState: {
    from?: string;
    planId?: string;
    planName?: string;
    weekNumber?: number;
    volumePercent?: number;
    estimatedDurationMin?: number;
    scrollY?: number;
    collectionSlug?: string;
    collectionName?: string;
  } | null;
  isEn: boolean;
}

function StrengthWorkoutDetail({ workout, locationState, isEn }: StrengthWorkoutDetailProps) {
  const navigate = useNavigate();
  const { t: tSession } = useTranslation("session");
  const { t: tStrength } = useTranslation("strength");
  const { t: tCommon } = useTranslation("common");
  const { t: tLib } = useTranslation("library");

  const workoutName = isEn ? workout.nameEn : workout.name;
  const description = isEn ? workout.descriptionEn : workout.description;
  const intensityColor = INTENSITY_COLORS[workout.intensity];

  // Estimate total duration from typical range
  const duration = Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2);

  // Breadcrumbs
  type BreadcrumbItem = { label: string; to?: string; state?: Record<string, unknown> };
  const breadcrumbs: BreadcrumbItem[] = [{ label: tCommon("nav.home"), to: "/" }];

  if (locationState?.from === "plan" && locationState.planId) {
    breadcrumbs.push({ label: tCommon("nav.plans"), to: "/plans" });
    breadcrumbs.push({
      label: locationState.planName || "Plan",
      to: `/plan/${locationState.planId}`,
      state: { returnToWeek: locationState.weekNumber, returnScrollY: locationState.scrollY },
    });
  } else {
    breadcrumbs.push({ label: tCommon("nav.library"), to: "/library" });
    breadcrumbs.push({
      label: tStrength("categories." + workout.category),
      to: `/library?activity=strength&category=${workout.category}`,
    });
  }
  breadcrumbs.push({ label: workoutName });

  const parentCrumb = breadcrumbs[breadcrumbs.length - 2];

  // Coaching tips (shared shape with running)
  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  const mistakes = isEn ? workout.commonMistakesEn : workout.commonMistakes;

  // Equipment display
  const equipmentList = workout.equipment.filter((e) => e !== "none");
  const hasEquipment = equipmentList.length > 0;

  const seoTitle = workoutName;
  const seoDescription = description.slice(0, 155);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`/workout/${workout.id}`}
        ogType="article"
        jsonLd={[
          {
            "@type": "ExercisePlan",
            name: seoTitle,
            description: seoDescription,
            exerciseType: "Strength Training",
            activityDuration: `PT${duration}M`,
            intensity: workout.difficulty,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Bibliothèque", item: "https://zoned.run/library" },
              { "@type": "ListItem", position: 3, name: seoTitle },
            ],
          },
        ]}
      />
      <div className="py-8 space-y-8">
        {/* Back + Breadcrumbs */}
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="self-start">
            <ArrowLeft className="mr-2 size-4" />
            {isEn ? "Back" : "Retour"}
          </Button>

          <nav aria-label="Breadcrumb">
            <ol className="hidden sm:flex items-center flex-wrap">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={i} className="flex items-center">
                    {i > 0 && (
                      <span className="text-muted-foreground/50 mx-1.5 text-sm">/</span>
                    )}
                    {isLast ? (
                      <span className="text-foreground text-sm font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.to!}
                        state={crumb.state}
                        className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="flex sm:hidden items-center text-sm">
              <Link
                to={parentCrumb.to!}
                state={parentCrumb.state}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {parentCrumb.label}
              </Link>
              <span className="text-muted-foreground/50 mx-1.5">/</span>
              <span className="text-foreground font-medium truncate">{workoutName}</span>
            </div>
          </nav>
        </div>

        {/* Bento Header */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session Identity Card */}
          <div
            className="lg:col-span-8 border border-border/50 rounded-xl p-5 sm:p-8 md:p-10 flex flex-col justify-between lg:min-h-[240px]"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${intensityColor} 10%, transparent), transparent)`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IntensityBadge intensity={workout.intensity} size="lg" />
                  <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                    <Dumbbell className="size-3.5" />
                    {tStrength(`categories.${workout.category}`)}
                  </Badge>
                </div>
                <FavoriteButton workoutId={workout.id} />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {workoutName}
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed text-lg">
                <GlossaryLinkedText text={description} />
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
              <Button
                variant="secondary"
                className="rounded-full px-5 py-2.5 h-auto font-bold"
                onClick={async () => {
                  const ok = await copyToClipboard(window.location.href);
                  if (ok) toast.success(tCommon("actions.linkCopied"));
                  else toast.error(tCommon("errors.generic"));
                }}
              >
                <Link2 className="size-4 mr-2" />
                {tCommon("actions.copyLink")}
              </Button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Clock className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-lg lg:text-2xl font-bold">
                  {workout.typicalDuration.min}-{workout.typicalDuration.max}
                </span>
                <span className="text-[10px] lg:text-xs text-muted-foreground">
                  {tCommon("units.minutes")}
                </span>
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Dumbbell className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm lg:text-lg font-bold">
                  {tLib(`difficulty.${workout.difficulty}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tSession("details.difficulty")}
                </span>
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Target className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm font-bold">
                  {tStrength(`intensity.${workout.intensity}`)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tStrength("detail.intensity")}
                </span>
              </div>
              <div className="bg-muted/50 border rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center text-center">
                <Shield className="size-4 lg:size-5 text-muted-foreground mb-1 lg:mb-2" />
                <span className="text-sm font-bold">
                  {tStrength("detail.weeklyMax", { count: workout.weeklyFrequencyMax })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tStrength("detail.minRecovery", { days: workout.minimumRecoveryDays })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Primary muscle groups */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            {tStrength("detail.targetMuscles")}:
          </span>
          <MuscleGroupBadges muscles={workout.primaryMuscleGroups} size="md" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline Visualization */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  {tStrength("detail.sessionTimeline")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StrengthSessionTimeline workout={workout} />
              </CardContent>
            </Card>

            {/* Exercise Detail */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  {tStrength("detail.exerciseDetail")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StrengthExerciseList blocks={workout.warmupBlocks} phase="warmup" />
                <StrengthExerciseList blocks={workout.mainBlocks} phase="main" />
                <StrengthExerciseList blocks={workout.cooldownBlocks} phase="cooldown" />
              </CardContent>
            </Card>

            {/* Scientific References */}
            {workout.references && workout.references.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="size-4" />
                    {tStrength("detail.references")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {workout.references.map((ref, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {ref.startsWith("http") ? (
                          <a
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground underline underline-offset-2 transition-colors"
                          >
                            {ref}
                          </a>
                        ) : (
                          ref
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Muscle Distribution */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {tStrength("detail.muscleDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MuscleDistribution workout={workout} />
              </CardContent>
            </Card>

            {/* Muscle Map (body visualization) */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {tStrength("detail.muscleMap")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MuscleMap workout={workout} />
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {tStrength("detail.equipmentNeeded")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasEquipment ? (
                  <div className="flex flex-wrap gap-2">
                    {equipmentList.map((eq) => (
                      <Badge key={eq} variant="secondary" className="text-xs">
                        {tStrength(`equipment.${eq}`)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {tStrength("detail.noEquipment")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Suitable Training Phases */}
            {workout.suitablePhases.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {tStrength("detail.suitablePhases")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workout.suitablePhases.map((phase) => (
                      <Badge key={phase} variant="outline" className="text-xs capitalize">
                        {tStrength(`trainingPhases.${phase}`)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Content */}
            <RelatedContent source={{ type: "workout", id: workout.id }} />

            {/* Coaching Tips & Common Mistakes */}
            {(tips.length > 0 || mistakes.length > 0) && (
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {tSession("titles.coachingTips")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StrengthCoachingTips tips={tips} mistakes={mistakes} />
                </CardContent>
              </Card>
            )}
          </aside>
        </div>

        {/* Image source credit */}
        <p className="text-xs text-muted-foreground/60 mt-8">
          {isEn
            ? "Exercise illustrations from free-exercise-db (Public Domain)."
            : "Illustrations des exercices issues de free-exercise-db (Domaine Public)."}
        </p>
      </div>
    </>
  );
}

// ── Strength Coaching Tips (reused shape) ──────────────────────────

function StrengthCoachingTips({
  tips,
  mistakes,
}: {
  tips: string[];
  mistakes: string[];
}) {
  const { t } = useTranslation("session");

  return (
    <div className="space-y-6">
      {tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-success" />
            {t("coaching.tips")}
          </h4>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-success/60"
              >
                <GlossaryLinkedText text={tip} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="size-4 text-destructive" />
            {t("coaching.mistakes")}
          </h4>
          <ul className="space-y-1.5">
            {mistakes.map((mistake, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-destructive/60"
              >
                <GlossaryLinkedText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
