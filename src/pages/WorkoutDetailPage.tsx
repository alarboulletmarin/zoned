import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Target,
  Circle,
  Mountain,
  TreePine,
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
import { EditorialTitle, FadeUp, DetailAccordion } from "@/components/editorial";
import { SessionTimeline, ZoneDistribution, transformSessionBlocks, MiniElevationProfile } from "@/components/visualization";
import { StrengthSessionTimeline } from "@/components/visualization/StrengthSessionTimeline";
import { MuscleDistribution } from "@/components/visualization/MuscleDistribution";
import { MuscleMap } from "@/components/visualization/MuscleMap";
import { MiniSessionTimeline } from "@/components/visualization/MiniSessionTimeline";
import { useWorkout, useRelatedWorkouts, useTips } from "@/hooks";
import { RelatedContent } from "@/components/domain/RelatedContent";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import type { WorkoutCategory, ZoneRange, AnyWorkoutTemplate } from "@/types";
import {
  getWorkoutDiscipline,
  getDominantZone,
  isStrengthWorkout,
} from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
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
  trail: TreePine,
};

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["session", "library", "common"]);
  const pick = usePickLang();

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
      />
    );
  }

  const dominantZone = getDominantZone(workout);
  const workoutDiscipline = getWorkoutDiscipline(workout);
  const canGenerateRoute = !workout.environment.requiresTrack && (workoutDiscipline === "running" || workoutDiscipline === "cycling");
  // Plan context: duration from plan generation (volume-scaled, may differ for long runs)
  const planWeekNumber = locationState?.weekNumber;
  const planVolumePercent = locationState?.volumePercent;
  const planEstimatedDuration = locationState?.estimatedDurationMin;
  const planTargetDistanceKm = locationState?.targetDistanceKm;
  const hasPlanContext = locationState?.from === "plan" && planEstimatedDuration != null;

  // Base session data from workout template
  const baseSessionData = transformSessionBlocks({
    warmupTemplate: workout.warmupTemplate,
    mainSetTemplate: workout.mainSetTemplate,
    cooldownTemplate: workout.cooldownTemplate,
    warmupStructure: workout.warmupStructure,
    mainSetStructure: workout.mainSetStructure,
    cooldownStructure: workout.cooldownStructure,
    discipline: workout.discipline,
  });
  const baseDuration = Math.round(baseSessionData.totalDurationMin);

  // Always use plan duration when coming from a plan — it's the authoritative value
  // that matches what the calendar shows.
  const planDuration = planEstimatedDuration != null ? Math.round(planEstimatedDuration) : null;
  const duration = (locationState?.from === "plan" && planDuration != null)
    ? planDuration
    : baseDuration;

  const CategoryIcon = CATEGORY_ICONS[workout.category];

  // Breadcrumb trail
  const workoutName = pick(workout, "name");
  const categoryLabel = t(`library:categories.${workout.category}`);
  type BreadcrumbItem = { label: string; to?: string; state?: Record<string, unknown> };
  const breadcrumbs: BreadcrumbItem[] = [{ label: t("common:nav.home"), to: "/" }];

  if (locationState?.from === "plan" && locationState.planId) {
    breadcrumbs.push({ label: t("common:nav.plans"), to: "/plans" });
    breadcrumbs.push({
      label: locationState.planName || t("common:pages.workoutDetail.planFallback"),
      to: `/plan/${locationState.planId}?week=${locationState.weekNumber}`,
      state: { returnScrollY: locationState.scrollY },
    });
  } else if (locationState?.from === "collection" && locationState.collectionSlug) {
    breadcrumbs.push({ label: t("common:collections.title"), to: "/collections" });
    breadcrumbs.push({
      label: locationState.collectionName || t("common:pages.workoutDetail.collectionFallback"),
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

  const seoTitle = pick(workout, "name");
  const seoDescription = pick(workout, "description").slice(0, 155);

  const trailMetrics = computeTrailMetrics(workout);
  const hasTrail =
    trailMetrics.totalElevationGainM > 0 ||
    trailMetrics.totalElevationLossM > 0 ||
    trailMetrics.dominantTerrain != null;

  const envRequirements: { icon: React.ComponentType<{ className?: string }>; text: string }[] = [];
  if (workout.environment.requiresTrack) {
    envRequirements.push({ icon: Circle, text: t("environment.requiresTrack") });
  }
  if (workout.environment.requiresHills && !hasTrail) {
    envRequirements.push({ icon: Mountain, text: t("environment.requiresHills") });
  }
  if (workout.environment.prefersFlat) {
    envRequirements.push({ icon: Route, text: t("environment.prefersFlat") });
  }

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
      <div className={`zone-${dominantZone} py-6 md:py-8 space-y-8`}>
        {/* Top strip — back, breadcrumb, optional plan chip. */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
              <ArrowLeft className="mr-1.5 size-4" />
              {t("common:pages.workoutDetail.back")}
            </Button>
            {hasPlanContext && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <Clock className="size-3" />
                {t("session:planContext.banner", {
                  week: planWeekNumber,
                  volume: planVolumePercent,
                  duration,
                })}
              </span>
            )}
          </div>

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
                      <span className="text-foreground text-sm font-medium truncate max-w-[280px]">{crumb.label}</span>
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

        {/* Hero block — title + badges + description + actions + inline
            stats row. Replaces the previous bento + 5-card summary grid. */}
        <FadeUp as="section">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <ZoneBadge zone={dominantZone} size="md" showLabel />
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
              <CategoryIcon className="size-3.5" />
              {t(`library:categories.${workout.category}`)}
            </Badge>
            <span className="ml-auto">
              <FavoriteButton workoutId={workout.id} />
            </span>
          </div>

          <EditorialTitle as="h1" size="lg" className="mb-3 sm:text-4xl md:text-5xl">
            {pick(workout, "name")}
          </EditorialTitle>

          <p className="text-muted-foreground max-w-2xl leading-relaxed text-base sm:text-lg">
            <GlossaryLinkedText text={pick(workout, "description")} />
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
            {canGenerateRoute && (
              <Button asChild size="sm" className="rounded-full px-4">
                <Link to="/routes" state={{ workoutRouteWorkout: workout }}>
                  <Route className="size-3.5 mr-1.5" />
                  {t("session:actions.findRoute")}
                </Link>
              </Button>
            )}
            <ExportMenu workout={workout} />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-muted-foreground hover:text-foreground"
              onClick={async () => {
                const ok = await copyToClipboard(window.location.href);
                if (ok) toast.success(t("common:actions.linkCopied"));
                else toast.error(t("common:errors.generic"));
              }}
            >
              <Link2 className="size-3.5 mr-1.5" />
              {t("common:actions.copyLink")}
            </Button>
          </div>

          {/* Inline stats row — single horizontal strip. Trail metrics
              fold in naturally when applicable so we don't need a
              separate trail bar. */}
          <dl className="mt-6 grid grid-cols-3 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8 gap-y-3 border-t border-border/60 pt-5">
            <HeroStat
              label={t("session:stats.duration")}
              value={formatDurationMinutes(duration)}
              hint={
                hasPlanContext && duration < baseDuration - 3
                  ? formatDurationMinutes(baseDuration)
                  : undefined
              }
            />
            {planTargetDistanceKm != null && planTargetDistanceKm > 0 && (
              <HeroStat
                label={t("session:stats.distance")}
                value={`${workout.category !== "long_run" ? "~" : ""}${planTargetDistanceKm} km`}
              />
            )}
            <HeroStat
              label={t("session:stats.difficulty")}
              value={t(`library:difficulty.${workout.difficulty}`)}
            />
            <HeroStat
              label={t("session:stats.target")}
              value={t(`targetSystems.${workout.targetSystem}`)}
            />
            {envRequirements.length > 0 && (
              <HeroStat
                label={t("session:stats.environment")}
                value={envLabel}
              />
            )}
            {hasTrail && trailMetrics.totalElevationGainM > 0 && (
              <HeroStat
                label={t("library:trail.elevationGain", { value: "" }).replace(/[\s+0-9]+m?\s*$/, "")}
                value={`+${trailMetrics.totalElevationGainM} m`}
              />
            )}
          </dl>
        </FadeUp>

        {/* Trail elevation profile — only when meaningful. Kept tight. */}
        {hasTrail && (
          <FadeUp as="section">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
              {t("session:titles.trailProfile")}
            </p>
            <MiniElevationProfile workout={workout} height={64} />
            {trailMetrics.dominantTerrain && (
              <p className="text-xs text-muted-foreground mt-2">
                {t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)}
                {trailMetrics.verticalDensityMPerKm > 0 && (
                  <> · {t("library:trail.verticalDensity", { value: trailMetrics.verticalDensityMPerKm })}</>
                )}
                {trailMetrics.avgGradientPercent !== 0 && (
                  <> · {t("library:trail.gradientAvg", { value: trailMetrics.avgGradientPercent })}</>
                )}
              </p>
            )}
          </FadeUp>
        )}

        {/* Discreet zone-personalization CTA — only when zones are missing */}
        {!hasUserZones && <ZonePersonalizationCTA />}

        {/* Sticky mini timeline (existing behaviour) */}
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

        {/* Session viz — the actual workout. Always visible. */}
        <FadeUp as="section">
          <div ref={timelineCardRef}>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
              {t("session:captions.viz")}
            </p>
            <EditorialTitle as="h2" size="md" className="mb-4">
              {t("session:titles.sessionTimeline")}
            </EditorialTitle>
            <SessionTimeline workout={workout} />
          </div>
        </FadeUp>

        <FadeUp as="section">
          <EditorialTitle as="h2" size="md" className="mb-4">
            {t("session:titles.workoutStructure")}
          </EditorialTitle>
          <WorkoutStructure workout={workout} userZones={hasUserZones ? userZones : undefined} />
        </FadeUp>

        {/* Zone distribution + coaching tips paired in a compact 2-col on
            md+, stacked on mobile. */}
        <FadeUp as="section">
          <div className="grid md:grid-cols-[2fr_3fr] gap-6 md:gap-10">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
                {t("session:titles.zoneDistribution")}
              </p>
              <ZoneDistribution workout={workout} />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
                {t("session:titles.coachingTips")}
              </p>
              <CoachingTips workout={workout} />
              {tip && (
                <div className="mt-4">
                  <TipCard tip={tip} variant="banner" />
                </div>
              )}
            </div>
          </div>
        </FadeUp>

        {/* Accordions — secondary content, closed by default so the page
            scans at a glance. Pattern identical to the home FAQ. */}
        <FadeUp as="section">
          <div className="border-t border-foreground/15">
            <DetailAccordion
              caption={t("session:captions.nutrition")}
              title={t("session:titles.nutritionRecovery")}
            >
              <NutritionRecoverySection workout={workout} />
            </DetailAccordion>
            <DetailAccordion
              caption={t("session:captions.science")}
              title={t("session:titles.scienceMode")}
            >
              <ScienceSection workout={workout} />
            </DetailAccordion>
          </div>
        </FadeUp>

        {/* Continue exploring — single block. RelatedContent already
            mixes workouts + articles + glossary terms, so we no longer
            need a separate "similar workouts" card next to it. */}
        <FadeUp as="section">
          <EditorialTitle as="h2" size="md" className="mb-4">
            {t("session:titles.continueExploring")}
          </EditorialTitle>
          <RelatedContent source={{ type: "workout", id: workout.id }} />
          {relatedWorkouts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {relatedWorkouts.slice(0, 3).map((related) => (
                <WorkoutCardCompact key={related.id} workout={related} />
              ))}
            </div>
          )}
        </FadeUp>
      </div>
    </>
  );
}

/** Single inline stat in the hero strip. Mono uppercase label, semibold
 *  italic value, optional grey strikethrough for plan-context volume
 *  scaling. */
function HeroStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="font-sans font-semibold italic text-lg sm:text-xl tabular-nums">
        {value}
        {hint && (
          <span className="ml-2 text-xs not-italic font-normal text-muted-foreground line-through">
            {hint}
          </span>
        )}
      </dd>
    </div>
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
}

function StrengthWorkoutDetail({ workout, locationState }: StrengthWorkoutDetailProps) {
  const navigate = useNavigate();
  const { t: tSession } = useTranslation("session");
  const { t: tStrength } = useTranslation("strength");
  const { t: tCommon } = useTranslation("common");
  const { t: tLib } = useTranslation("library");
  const pick = usePickLang();
  const pickLangArray = usePickLangArray();

  const workoutName = pick(workout, "name");
  const description = pick(workout, "description");

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
  const tips = pickLangArray<string>(workout, "coachingTips");
  const mistakes = pickLangArray<string>(workout, "commonMistakes");

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
      <div className="py-6 md:py-8 space-y-8">
        {/* Top strip — back + breadcrumb. Strength sessions don't have
            plan-context decoration, so we skip the chip slot. */}
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 self-start">
            <ArrowLeft className="mr-1.5 size-4" />
            {tCommon("pages.workoutDetail.back")}
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
                      <span className="text-foreground text-sm font-medium truncate max-w-[280px]">{crumb.label}</span>
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

        {/* Hero block — same shape as the running variant, with strength-
            flavoured badges + stats (frequency, recovery). */}
        <FadeUp as="section">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <IntensityBadge intensity={workout.intensity} size="md" />
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
              <Dumbbell className="size-3.5" />
              {tStrength(`categories.${workout.category}`)}
            </Badge>
            <span className="ml-auto">
              <FavoriteButton workoutId={workout.id} />
            </span>
          </div>

          <EditorialTitle as="h1" size="lg" className="mb-3 sm:text-4xl md:text-5xl">
            {workoutName}
          </EditorialTitle>

          <p className="text-muted-foreground max-w-2xl leading-relaxed text-base sm:text-lg">
            <GlossaryLinkedText text={description} />
          </p>

          {/* Primary muscle groups — inline under description so the user
              sees what the session works without scrolling. */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              {tStrength("detail.targetMuscles")}
            </span>
            <MuscleGroupBadges muscles={workout.primaryMuscleGroups} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-muted-foreground hover:text-foreground"
              onClick={async () => {
                const ok = await copyToClipboard(window.location.href);
                if (ok) toast.success(tCommon("actions.linkCopied"));
                else toast.error(tCommon("errors.generic"));
              }}
            >
              <Link2 className="size-3.5 mr-1.5" />
              {tCommon("actions.copyLink")}
            </Button>
          </div>

          {/* Inline stats row — 3-4 stats max. */}
          <dl className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8 gap-y-3 border-t border-border/60 pt-5">
            <HeroStat
              label={tSession("stats.duration")}
              value={`${formatDurationMinutes(workout.typicalDuration.min)}–${formatDurationMinutes(workout.typicalDuration.max)}`}
            />
            <HeroStat
              label={tSession("stats.difficulty")}
              value={tLib(`difficulty.${workout.difficulty}`)}
            />
            <HeroStat
              label={tSession("stats.frequency")}
              value={tStrength("detail.weeklyMax", { count: workout.weeklyFrequencyMax })}
            />
            <HeroStat
              label={tSession("stats.recovery")}
              value={tStrength("detail.minRecovery", { days: workout.minimumRecoveryDays })}
            />
          </dl>
        </FadeUp>

        {/* Main viz — timeline + exercise list, both always visible. */}
        <FadeUp as="section">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
            {tSession("captions.viz")}
          </p>
          <EditorialTitle as="h2" size="md" className="mb-4">
            {tStrength("detail.sessionTimeline")}
          </EditorialTitle>
          <StrengthSessionTimeline workout={workout} />
        </FadeUp>

        <FadeUp as="section">
          <EditorialTitle as="h2" size="md" className="mb-4">
            {tStrength("detail.exerciseDetail")}
          </EditorialTitle>
          <div className="space-y-6">
            <StrengthExerciseList blocks={workout.warmupBlocks} phase="warmup" />
            <StrengthExerciseList blocks={workout.mainBlocks} phase="main" />
            <StrengthExerciseList blocks={workout.cooldownBlocks} phase="cooldown" />
          </div>
        </FadeUp>

        {/* Muscle distribution + map paired in compact 2-col on md+. */}
        <FadeUp as="section">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
                {tStrength("detail.muscleDistribution")}
              </p>
              <MuscleDistribution workout={workout} />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-3">
                {tStrength("detail.muscleMap")}
              </p>
              <MuscleMap workout={workout} />
            </div>
          </div>
        </FadeUp>

        {/* Accordions — secondary content collapsed by default. */}
        <FadeUp as="section">
          <div className="border-t border-foreground/15">
            <DetailAccordion
              caption={tSession("captions.equipment")}
              title={tSession("titles.equipment")}
            >
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
            </DetailAccordion>

            {workout.suitablePhases.length > 0 && (
              <DetailAccordion
                caption={tSession("captions.phases")}
                title={tSession("titles.suitablePhases")}
              >
                <div className="flex flex-wrap gap-2">
                  {workout.suitablePhases.map((phase) => (
                    <Badge key={phase} variant="outline" className="text-xs capitalize">
                      {tStrength(`trainingPhases.${phase}`)}
                    </Badge>
                  ))}
                </div>
              </DetailAccordion>
            )}

            {(tips.length > 0 || mistakes.length > 0) && (
              <DetailAccordion
                caption={tSession("captions.mistakes")}
                title={tSession("titles.coachingTips")}
              >
                <StrengthCoachingTips tips={tips} mistakes={mistakes} />
              </DetailAccordion>
            )}

            {workout.references && workout.references.length > 0 && (
              <DetailAccordion
                caption={tSession("captions.refs")}
                title={tSession("titles.scientificRefs")}
              >
                <ul className="space-y-2">
                  {workout.references.map((ref, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <BookOpen className="size-4 shrink-0 mt-0.5" />
                      {ref.startsWith("http") ? (
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground underline underline-offset-2 transition-colors break-all"
                        >
                          {ref}
                        </a>
                      ) : (
                        <span>{ref}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </DetailAccordion>
            )}
          </div>
        </FadeUp>

        {/* Continue exploring — same pattern as the running variant. */}
        <FadeUp as="section">
          <EditorialTitle as="h2" size="md" className="mb-4">
            {tSession("titles.continueExploring")}
          </EditorialTitle>
          <RelatedContent source={{ type: "workout", id: workout.id }} />
        </FadeUp>

        {/* Image source credit — small footnote */}
        <p className="text-xs text-muted-foreground/60 mt-8">
          {tCommon("pages.workoutDetail.exerciseCredits")}
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
