import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Link2,
  Shield,
  BookOpen,
  Sparkles,
  StravaIcon,
  MoreHorizontal,
  SlidersHorizontal,
  Pencil,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ZoneBadge,
  WorkoutCardCompact,
  FavoriteButton,
  ZonePersonalizationCTA,
  WorkoutPaceZonesCard,
  TipCard,
} from "@/components/domain";
import { WorkoutNotFound } from "@/components/domain/WorkoutNotFound";
import { ExportDatePicker } from "@/components/domain/ExportDatePicker";
import { FitTransferGuide } from "@/components/domain/FitTransferGuide";
import { ExportableWorkoutCard } from "@/components/domain/ExportableWorkoutCard";
import { exportToICS, exportToPNG, exportToPDF, exportToFIT } from "@/lib/export";
import { ShareDialog } from "@/components/share/ShareDialog";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/issueBuilder";
import { buildStravaShareText } from "@/lib/export";
import { NutritionRecoverySection } from "@/components/domain/NutritionRecoverySection";
import { ScienceSection } from "@/components/domain/ScienceSection";
import { TARGET_SYSTEM_SCIENCE } from "@/data/science";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { useGlossaryMatcher } from "@/contexts/GlossaryMatcherContext";
import { findContentMatches } from "@/lib/content-matcher";
import { SEOHead } from "@/components/seo";
import { FadeUp } from "@/components/editorial";
import { Section } from "@/components/editorial/Section";
import { SessionTimeline, SessionIntensityBar, transformSessionBlocks, MiniElevationProfile } from "@/components/visualization";
import type { TimelineSegment } from "@/components/visualization";
import { StrengthSessionTimeline } from "@/components/visualization/StrengthSessionTimeline";
import { MuscleDistribution } from "@/components/visualization/MuscleDistribution";
import { MuscleMap } from "@/components/visualization/MuscleMap";
import { MiniSessionTimeline } from "@/components/visualization/MiniSessionTimeline";
import { useWorkout, useRelatedWorkouts, useTips } from "@/hooks";
import { RelatedContent } from "@/components/domain/RelatedContent";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import type { ZoneRange, ZoneNumber, WorkoutTemplate } from "@/types";
import {
  getWorkoutDiscipline,
  getDominantZone,
} from "@/types";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import { MuscleGroupBadges } from "@/components/domain/MuscleGroupBadge";
import { StrengthExerciseList } from "@/components/domain/StrengthExerciseList";
import { loadUserZonePrefs, calculateAllZones } from "@/lib/zones";
import { hasAdjustableParams } from "@/lib/workoutAdjust";
import { createCustomWorkoutId, isCustomWorkoutId } from "@/lib/customWorkoutStorage";
import { publicWorkoutUrl } from "@/lib/share/workoutShare";

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["session", "library", "common"]);
  const pick = usePickLang();
  const pickLangArray = usePickLangArray();
  const glossaryMatcher = useGlossaryMatcher();

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
  const runningWorkout = workout && isRunningWorkout(workout) ? workout : null;
  const isStrength = workout ? isStrengthWorkout(workout) : false;
  const { workouts: relatedWorkouts } = useRelatedWorkouts(runningWorkout);

  // Get contextual tip based on dominant zone (running workouts only)
  const dominantZoneForTip = runningWorkout ? getDominantZone(runningWorkout) : undefined;
  const { tip } = useTips({
    filters: dominantZoneForTip ? { zones: [dominantZoneForTip] } : undefined,
    autoLoad: !!workout && !isStrength,
  });

  // Load user zones from localStorage
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  const [hasUserZones, setHasUserZones] = useState(false);
  const [userVma, setUserVma] = useState<number | undefined>(undefined);

  // Share modal (5 social templates)
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs && (prefs.fcMax || prefs.vma)) {
      const zones = calculateAllZones(prefs);
      setUserZones(zones);
      setHasUserZones(true);
      setUserVma(prefs.vma);
    } else {
      setUserZones([]);
      setHasUserZones(false);
      setUserVma(undefined);
    }
  }, []);

  const timelineCardRef = useRef<HTMLDivElement>(null);
  const timelineScrolledPast = useScrolledPast(timelineCardRef);

  if (isLoading) {
    return (
      <div className="py-8 space-y-8">
        {/* Back button skeleton */}
        <Skeleton className="h-9 w-40 rounded-none" />

        {/* Bento header skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session identity card skeleton */}
          <Skeleton className="lg:col-span-8 h-48 lg:h-60 rounded-none" />

          {/* Summary metrics skeleton (2x2 grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <Skeleton className="h-20 lg:h-28 rounded-none" />
            <Skeleton className="h-20 lg:h-28 rounded-none" />
            <Skeleton className="h-20 lg:h-28 rounded-none" />
            <Skeleton className="h-20 lg:h-28 rounded-none" />
          </div>
        </div>

        {/* Content area skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline skeleton with zone shimmer */}
            <Skeleton variant="zone-shimmer" className="h-40 rounded-none" />
            {/* Structure skeleton */}
            <Skeleton className="h-64 rounded-none" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-none" />
            <Skeleton className="h-32 rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return <WorkoutNotFound id={id} />;
  }

  // ── Strength workout branch ─────────────────────────────────────
  // Narrowing here is what makes `workout` a WorkoutTemplate below.
  if (isStrengthWorkout(workout)) {
    return (
      <StrengthWorkoutDetail
        workout={workout}
        locationState={locationState}
      />
    );
  }

  const dominantZone = getDominantZone(workout);
  const workoutDiscipline = getWorkoutDiscipline(workout);
  // Adjusting means copying: a workout already living in My Workouts is edited
  // in place instead, and one with no number to move has nothing to offer.
  const isOwnWorkout = isCustomWorkoutId(workout.id);
  const canAdjust = !isOwnWorkout && hasAdjustableParams(workout);
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

  // Per-phase descriptions, built from the raw block text (same join the SEO
  // HowTo steps above already use) — no data is invented, only reused.
  const warmupDescription = workout.warmupTemplate.map((b) => pick(b, "description")).filter(Boolean).join(" — ");
  const mainDescription = workout.mainSetTemplate.map((b) => pick(b, "description")).filter(Boolean).join(" — ");
  const cooldownDescription = workout.cooldownTemplate.map((b) => pick(b, "description")).filter(Boolean).join(" — ");

  const tipsAndMistakes = [
    ...pickLangArray<string>(workout, "coachingTips"),
    ...pickLangArray<string>(workout, "commonMistakes"),
  ];

  const science = TARGET_SYSTEM_SCIENCE[workout.targetSystem];
  const scienceLine = science
    ? [
        science.references.map((ref) => `${ref.authors} (${ref.year})`).join(" · "),
        pick(science, "rationale"),
      ].filter(Boolean).join(" — ")
    : null;

  // Glossary chips — the same matcher GlossaryLinkedText uses, applied to the
  // session's own text so "Termes & science" only ever shows terms this
  // specific workout actually mentions.
  const termChips = glossaryMatcher
    ? (() => {
        const text = [pick(workout, "description"), warmupDescription, mainDescription, cooldownDescription, ...tipsAndMistakes].join(" ");
        const seen = new Map<string, string>();
        for (const match of findContentMatches(text, glossaryMatcher)) {
          if (match.content.type !== "glossary") continue;
          const { id } = match.content.data;
          if (!seen.has(id)) seen.set(id, pick(match.content.data, "term"));
        }
        return [...seen.entries()].slice(0, 6).map(([id, label]) => ({ id, label }));
      })()
    : [];

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
            url: `https://zoned.run/workout/${workout.id}`,
            exerciseType: "Running",
            activityDuration: `PT${duration}M`,
            intensity: workout.difficulty,
            isAccessibleForFree: true,
            inLanguage: ["fr-FR", "en-US"],
            audience: {
              "@type": "Audience",
              audienceType: workout.difficulty,
            },
            additionalProperty: [
              { "@type": "PropertyValue", name: "Category", value: workout.category },
              { "@type": "PropertyValue", name: "Target System", value: workout.targetSystem },
              { "@type": "PropertyValue", name: "Difficulty", value: workout.difficulty },
              { "@type": "PropertyValue", name: "Dominant Zone", value: `Z${dominantZone}` },
            ],
            isPartOf: {
              "@type": "CollectionPage",
              name: "Zoned Running Workouts Library",
              url: "https://zoned.run/library",
            },
            publisher: {
              "@type": "Organization",
              name: "Zoned",
              url: "https://zoned.run",
              logo: "https://zoned.run/pwa-512x512.png",
            },
          },
          {
            "@type": "HowTo",
            name: seoTitle,
            description: seoDescription,
            totalTime: `PT${duration}M`,
            estimatedCost: { "@type": "MonetaryAmount", currency: "EUR", value: "0" },
            tool: ["Running shoes", "Heart rate monitor (optional)", "GPS watch (optional)"],
            step: [
              {
                "@type": "HowToStep",
                position: 1,
                name: "Échauffement",
                text:
                  workout.warmupTemplate
                    .map((b) => pick(b, "description"))
                    .filter(Boolean)
                    .join(" — ") || "Échauffement progressif",
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "Corps de séance",
                text:
                  workout.mainSetTemplate
                    .map((b) => pick(b, "description"))
                    .filter(Boolean)
                    .join(" — ") || seoDescription,
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Retour au calme",
                text:
                  workout.cooldownTemplate
                    .map((b) => pick(b, "description"))
                    .filter(Boolean)
                    .join(" — ") || "Retour au calme",
              },
            ],
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
      <div className={`zone-${dominantZone} py-6 md:py-8`}>
        {/* Top strip — back, breadcrumb, optional plan chip. */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
              <ArrowLeft className="mr-1.5 size-4" />
              {t("common:pages.workoutDetail.back")}
            </Button>
            {hasPlanContext && (
              <span className="inline-flex items-center gap-1.5 bg-accent-acid text-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.04em]">
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

        {/* Two-column layout: article (timeline, phases, tips, related) on
            the left, sticky action rail (favourite/share, personal paces,
            distribution, export, route) on the right. Mirrors the Brut
            mockup instead of the previous single-column bento. */}
        <FadeUp as="section">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-16 items-start mt-8">
            {/* ── Main column ───────────────────────────────────────── */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ZoneBadge zone={dominantZone} size="md" showLabel />
                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground px-2 py-1">
                  {t(`library:activityToggle.${workoutDiscipline}`)}
                </span>
                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground px-2 py-1">
                  {t(`library:difficulty.${workout.difficulty}`)}
                </span>
                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground px-2 py-1">
                  {formatDurationMinutes(duration)}
                  {hasPlanContext && duration < baseDuration - 3 && (
                    <span className="ml-1.5 line-through text-muted-foreground/50">
                      {formatDurationMinutes(baseDuration)}
                    </span>
                  )}
                </span>
                {planTargetDistanceKm != null && planTargetDistanceKm > 0 && (
                  <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground px-2 py-1">
                    {workout.category !== "long_run" ? "~" : ""}{planTargetDistanceKm} km
                  </span>
                )}

                {/* Secondary actions — adjusting, editing one's own copy,
                    Strava text and the permalink all live behind this "…"
                    so they don't compete with the title for space. */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ml-auto"
                      aria-label={t("session:actions.moreActions")}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {canAdjust && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/workout/builder/${createCustomWorkoutId()}?from=${workout.id}`)
                        }
                      >
                        <SlidersHorizontal className="size-4" />
                        {t("session:actions.adjust")}
                      </DropdownMenuItem>
                    )}
                    {isOwnWorkout && (
                      <DropdownMenuItem asChild>
                        <Link to={`/workout/builder/${workout.id}`}>
                          <Pencil className="size-4" />
                          {t("session:actions.edit")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={async () => {
                        const ok = await copyToClipboard(buildStravaShareText(workout));
                        if (ok) toast.success(t("session:strava.copied"));
                        else toast.error(t("common:errors.generic"));
                      }}
                    >
                      <StravaIcon className="size-4 text-[#FC4C02]" />
                      {t("session:actions.shareStrava")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        const ok = await copyToClipboard(publicWorkoutUrl(workout));
                        if (ok) toast.success(t("common:actions.linkCopied"));
                        else toast.error(t("common:errors.generic"));
                      }}
                    >
                      <Link2 className="size-4" />
                      {t("common:actions.copyLink")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h1 className="font-sans font-bold uppercase leading-[0.86] tracking-[-0.05em] text-5xl sm:text-6xl lg:text-7xl mt-5">
                {workoutName}
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-[58ch]">
                <GlossaryLinkedText text={pick(workout, "description")} />
              </p>

              {workout.sourceWorkoutId && (
                <WorkoutProvenance sourceId={workout.sourceWorkoutId} />
              )}

              {/* Déroulé — the bar timeline, unchanged from before. */}
              <div ref={timelineCardRef} className="mt-9 border-t border-border pt-4">
                <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                  {t("common:pages.workoutDetail.timeline")}
                </p>
                <div className="mt-4">
                  <SessionTimeline workout={workout} />
                </div>
              </div>

              {/* Trail elevation profile — only when meaningful, not part of
                  the mockup (which has no trail example) but real data a
                  trail runner needs. */}
              {hasTrail && (
                <div className="mt-6">
                  <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
                    {t("session:titles.trailProfile")}
                  </p>
                  <MiniElevationProfile workout={workout} height={64} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {trailMetrics.totalElevationGainM > 0 && <>+{trailMetrics.totalElevationGainM} m</>}
                    {trailMetrics.dominantTerrain && (
                      <> · {t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)}</>
                    )}
                    {trailMetrics.verticalDensityMPerKm > 0 && (
                      <> · {t("library:trail.verticalDensity", { value: trailMetrics.verticalDensityMPerKm })}</>
                    )}
                    {trailMetrics.avgGradientPercent !== 0 && (
                      <> · {t("library:trail.gradientAvg", { value: trailMetrics.avgGradientPercent })}</>
                    )}
                  </p>
                </div>
              )}

              {/* Échauffement / Corps de séance / Retour au calme — flowing
                  sections, not boxed cards: a title line with duration and
                  zone at the right, a description underneath, and (for the
                  main set, when it reduces to simple repeats) the block
                  list. Deliberately lighter than the previous nested-repeat
                  visualisation — see report for what that trades away. */}
              <div className="mt-2">
                <PhaseFlow
                  label={t("session:structure.warmup")}
                  phase="warmup"
                  segments={baseSessionData.segments}
                  description={warmupDescription}
                />
                <PhaseFlow
                  label={t("session:structure.main")}
                  phase="main"
                  segments={baseSessionData.segments}
                  description={mainDescription}
                  isMain
                />
                <PhaseFlow
                  label={t("session:structure.cooldown")}
                  phase="cooldown"
                  segments={baseSessionData.segments}
                  description={cooldownDescription}
                />
              </div>

              {/* Conseils / Termes & science — two compact columns. */}
              <div className="mt-9 grid sm:grid-cols-2 gap-8 sm:gap-10">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground border-b border-border pb-2">
                    {t("coaching.tips")}
                  </p>
                  {tipsAndMistakes.length > 0 && (
                    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground list-disc pl-4">
                      {tipsAndMistakes.map((entry, i) => (
                        <li key={i}>
                          <GlossaryLinkedText text={entry} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {tip && (
                    <div className="mt-4">
                      <TipCard tip={tip} variant="banner" />
                    </div>
                  )}
                </div>
                <div id="glossaire">
                  <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground border-b border-border pb-2">
                    {t("common:pages.workoutDetail.termsAndScience")}
                  </p>
                  {termChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {termChips.map((chip) => (
                        <Link
                          key={chip.id}
                          to={`/glossary/${chip.id}`}
                          className="font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground hover:text-foreground px-2.5 py-1.5 border border-border transition-colors"
                        >
                          {chip.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {scienceLine && (
                    <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                      {scienceLine}
                    </p>
                  )}
                </div>
              </div>

              {/* Séances proches — the 3-card grid the mockup shows. Articles
                  and glossary suggestions (RelatedContent) move to the
                  bottom accordion below: real navigation, but not part of
                  this layout. */}
              {relatedWorkouts.length > 0 && (
                <div className="mt-9 border-t border-border pt-4">
                  <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    {t("session:titles.relatedWorkouts")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
                    {relatedWorkouts.slice(0, 3).map((related) => (
                      <WorkoutCardCompact key={related.id} workout={related} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className="lg:sticky lg:top-24 lg:border-l lg:border-border lg:pl-10 flex flex-col gap-7">
              <div className="flex items-center gap-2">
                <FavoriteButton workoutId={workout.id} showLabel className="rounded-none border-2 border-foreground" />
                <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                  {t("common:share.trigger")}
                </Button>
              </div>

              {/* Discreet zone-personalization CTA when zones are missing;
                  once the runner has a VMA, the same slot shows their
                  personal pace table instead, with this session's own zone
                  highlighted. Guarded on `userVma` specifically (not just
                  `hasUserZones`): an HR-only profile has no pace data to
                  show, and a misleading empty table would be worse than no
                  table. */}
              {hasUserZones && userVma != null && workoutDiscipline === "running" ? (
                <WorkoutPaceZonesCard zones={userZones} vma={userVma} targetZone={dominantZone} />
              ) : (
                <ZonePersonalizationCTA />
              )}

              <div>
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  {t("common:pages.workoutDetail.distribution")}
                </p>
                <SessionIntensityBar workout={workout} className="h-3 mt-3" />
                {baseSessionData.zoneBreakdown.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {baseSessionData.zoneBreakdown
                      .map((z) => `${Math.round(z.percent)}% ${z.zone != null ? `Z${z.zone}` : z.label}`)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <WorkoutExportList workout={workout} />

              {canGenerateRoute && (
                <div className="border-t border-border pt-5">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                    {t("common:pages.workoutDetail.goRun")}
                  </p>
                  <Link
                    to="/routes"
                    state={{ workoutRouteWorkout: workout }}
                    className="mt-3 block text-center border border-border px-3.5 py-3 font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    {t("session:actions.findRoute")}
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </FadeUp>

        <ShareDialog
          workout={workout}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />

        {/* Sticky mini timeline (existing behaviour) */}
        {timelineScrolledPast && (
          <div className="sticky top-12 z-40 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 bg-background border-t-2 border-foreground will-change-[transform,opacity] animate-slide-in-top print:hidden">
            <MiniSessionTimeline
              workout={workout}
              onClickScrollBack={() => {
                timelineCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>
        )}

        {/* Accordions — secondary content not shown in the mockup at all
            (nutrition timing, the full science rationale). Real content, so
            it stays, just folded away below the fold instead of competing
            with the two-column layout above. */}
        <FadeUp>
          <div className="mt-12 border-t border-foreground/15">
            <Section collapsible title={t("session:titles.nutritionRecovery")}>
              <NutritionRecoverySection workout={workout} />
            </Section>
            <Section collapsible title={t("session:titles.scienceMode")}>
              <ScienceSection workout={workout} />
            </Section>
            <Section collapsible title={t("session:titles.continueExploring")}>
              <RelatedContent source={{ type: "workout", id: workout.id }} showTitle={false} />
            </Section>
          </div>
        </FadeUp>
      </div>
    </>
  );
}

/**
 * Where an adjusted copy came from (issue #130). The source is resolved rather
 * than stored on the copy: names are bilingual and would go stale, and the id
 * is the only thing that has to survive.
 */
function WorkoutProvenance({ sourceId }: { sourceId: string }) {
  const { t } = useTranslation("session");
  const pick = usePickLang();
  const { workout: source } = useWorkout(sourceId);

  return (
    <p className="text-sm text-muted-foreground mt-3">
      {t("provenance.adaptedFrom")}{" "}
      <Link
        to={`/workout/${sourceId}`}
        className="underline underline-offset-2 hover:text-foreground transition-colors"
      >
        {source ? pick(source, "name") : sourceId}
      </Link>
    </p>
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
      <dd className="font-sans font-bold text-lg sm:text-xl tabular-nums">
        {value}
        {hint && (
          <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
            {hint}
          </span>
        )}
      </dd>
    </div>
  );
}

/**
 * One flowing phase section — Échauffement / Corps de séance / Retour au
 * calme. Title and a duration · zone summary share a line, the description
 * sits underneath, and for the main set specifically — when it reduces to a
 * simple N × M′ repeat — a "Bloc 1 — 10′ …" list follows. Deliberately not
 * the nested boxed-repeat visualisation `WorkoutStructure` renders: the
 * mockup treats this as prose the runner scans once, not a tree to inspect.
 */
function PhaseFlow({
  label,
  phase,
  segments,
  description,
  isMain = false,
}: {
  label: string;
  phase: "warmup" | "main" | "cooldown";
  segments: TimelineSegment[];
  description: string;
  isMain?: boolean;
}) {
  const { t } = useTranslation("common");
  const phaseSegments = segments.filter((s) => s.type === phase);
  if (phaseSegments.length === 0) return null;

  const totalDurationMin = phaseSegments.reduce((sum, s) => sum + s.durationMin, 0);
  const effortSegments = phaseSegments.filter((s) => !s.isRecovery);
  const zoneCandidates = (effortSegments.length > 0 ? effortSegments : phaseSegments)
    .map((s) => s.zoneNumber)
    .filter((z): z is ZoneNumber => z != null);
  const zone = zoneCandidates.length > 0 ? (Math.max(...zoneCandidates) as ZoneNumber) : null;

  // Simple repeat detection: every effort segment carries a repetitionIndex
  // (e.g. "3 × 10′ seuil"). Deduped by index since a nested repeat can
  // otherwise list the same repetition twice.
  const indexed = effortSegments.filter((s) => s.repetitionIndex != null);
  const blocks = indexed.length > 1
    ? [...new Map(indexed.map((s) => [s.repetitionIndex as number, s.durationMin])).entries()]
      .sort((a, b) => a[0] - b[0])
    : null;

  let headerValue: string;
  if (isMain && blocks && blocks.length > 1) {
    const durations = blocks.map(([, d]) => d);
    const allEqual = durations.every((d) => Math.abs(d - durations[0]) < 0.01);
    headerValue = allEqual
      ? `${blocks.length} × ${formatDurationMinutes(durations[0])}`
      : formatDurationMinutes(totalDurationMin);
  } else {
    headerValue = formatDurationMinutes(totalDurationMin);
  }
  if (zone != null) headerValue += ` · Z${zone}`;

  return (
    <div className="border-t border-border py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-sans font-bold text-xl uppercase tracking-[-0.02em]">{label}</h3>
        <span
          className={`font-mono text-[13px] shrink-0 ${isMain ? "text-accent-acid" : "text-muted-foreground"}`}
        >
          {headerValue}
        </span>
      </div>
      {description && (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          <GlossaryLinkedText text={description} />
        </p>
      )}
      {isMain && blocks && blocks.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
          {blocks.map(([index, durationMin]) => (
            <span key={index}>
              {t("pages.workoutDetail.block", { index })} — {formatDurationMinutes(durationMin)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar export list — same export logic as `ExportMenu` (ICS/PNG/PDF/FIT),
 * reformatted as a vertical stack instead of a dropdown to match the Brut
 * sidebar. Garmin FIT leads, acid-highlighted, since it's the export a
 * runner reaches for most.
 */
function WorkoutExportList({ workout }: { workout: WorkoutTemplate }) {
  const { t } = useTranslation(["common", "session"]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFitGuide, setShowFitGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [renderForExport, setRenderForExport] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const rowClass =
    "w-full text-left border-b border-border py-3 font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50";

  const handleICSExport = async (dateTime: Date) => {
    setShowDatePicker(false);
    setBusy(true);
    const toastId = toast.loading(t("common:export.loading.calendar", t("common:export.title")));
    try {
      await exportToICS(workout, dateTime);
      toast.success(t("common:export.success.calendar"), { id: toastId });
    } catch {
      toast.error(t("common:export.error.calendar"), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handlePNGExport = async () => {
    setBusy(true);
    setRenderForExport(true);
    const toastId = toast.loading(t("common:export.loading.image", t("common:export.title")));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      if (exportCardRef.current) {
        await exportToPNG(exportCardRef.current, workout.id);
        toast.success(t("common:export.success.image"), { id: toastId });
      } else {
        throw new Error("Export card not rendered");
      }
    } catch {
      toast.error(t("common:export.error.image"), { id: toastId });
    } finally {
      setRenderForExport(false);
      setBusy(false);
    }
  };

  const handlePDFExport = async () => {
    setBusy(true);
    const toastId = toast.loading(t("common:export.loading.pdf", t("common:export.title")));
    try {
      await exportToPDF(workout);
      toast.success(t("common:export.success.pdf"), { id: toastId });
    } catch {
      toast.error(t("common:export.error.pdf"), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleFITExport = async () => {
    setBusy(true);
    const toastId = toast.loading(t("common:export.loading.garmin", t("common:export.title")));
    try {
      await exportToFIT(workout);
      toast.success(t("common:export.success.garmin"), { id: toastId });
      setShowFitGuide(true);
    } catch {
      toast.error(t("common:export.error.garmin"), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleStravaExport = async () => {
    const ok = await copyToClipboard(buildStravaShareText(workout));
    if (ok) toast.success(t("session:strava.copied"));
    else toast.error(t("common:errors.generic"));
  };

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
        {t("common:export.title")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleFITExport}
          className="bg-accent-acid text-ink px-3.5 py-3 font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-left hover:brightness-95 transition disabled:opacity-50"
        >
          {t("common:export.garmin")}
        </button>
        <button type="button" disabled={busy} onClick={() => setShowDatePicker(true)} className={rowClass}>
          {t("common:export.calendar")}
        </button>
        <button type="button" disabled={busy} onClick={handlePDFExport} className={rowClass}>
          {t("common:export.pdf")}
        </button>
        <button type="button" disabled={busy} onClick={handlePNGExport} className={rowClass}>
          {t("common:export.image")}
        </button>
        <button type="button" onClick={handleStravaExport} className={`${rowClass} border-b-0`}>
          {t("session:actions.shareStrava")}
        </button>
      </div>

      {showDatePicker && (
        <ExportDatePicker onSelect={handleICSExport} onCancel={() => setShowDatePicker(false)} />
      )}
      <FitTransferGuide open={showFitGuide} onOpenChange={setShowFitGuide} workout={workout} />
      {renderForExport && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1 }}>
          <ExportableWorkoutCard ref={exportCardRef} workout={workout} />
        </div>
      )}
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
              <FavoriteButton workoutId={workout.id} showLabel />
            </span>
          </div>

          <h1 className="font-sans font-bold uppercase leading-[0.94] tracking-[-0.04em] text-[32px] sm:text-[44px] md:text-[52px] mb-3">
            {workoutName}
          </h1>

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
              className="px-4 text-muted-foreground hover:text-foreground"
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
        <FadeUp>
          <Section title={tStrength("detail.sessionTimeline")}>
            <StrengthSessionTimeline workout={workout} />
          </Section>
        </FadeUp>

        <FadeUp>
          <Section title={tStrength("detail.exerciseDetail")}>
            <div className="space-y-6">
              <StrengthExerciseList blocks={workout.warmupBlocks} phase="warmup" />
              <StrengthExerciseList blocks={workout.mainBlocks} phase="main" />
              <StrengthExerciseList blocks={workout.cooldownBlocks} phase="cooldown" />
            </div>
          </Section>
        </FadeUp>

        {/* Muscle distribution + map paired in compact 2-col on md+. */}
        <FadeUp>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <Section title={tStrength("detail.muscleDistribution")}>
              <MuscleDistribution workout={workout} />
            </Section>
            <Section title={tStrength("detail.muscleMap")}>
              <MuscleMap workout={workout} />
            </Section>
          </div>
        </FadeUp>

        {/* Accordions — secondary content collapsed by default. */}
        <FadeUp as="section">
          <div className="border-t border-foreground/15">
            <Section
              collapsible
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
            </Section>

            {workout.suitablePhases.length > 0 && (
              <Section
                collapsible
                title={tSession("titles.suitablePhases")}
              >
                <div className="flex flex-wrap gap-2">
                  {workout.suitablePhases.map((phase) => (
                    <Badge key={phase} variant="outline" className="text-xs capitalize">
                      {tStrength(`trainingPhases.${phase}`)}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {(tips.length > 0 || mistakes.length > 0) && (
              <Section
                collapsible
                title={tSession("titles.coachingTips")}
              >
                <StrengthCoachingTips tips={tips} mistakes={mistakes} />
              </Section>
            )}

            {workout.references && workout.references.length > 0 && (
              <Section
                collapsible
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
              </Section>
            )}
          </div>
        </FadeUp>

        {/* Continue exploring — same pattern as the running variant. */}
        <FadeUp>
          <Section title={tSession("titles.continueExploring")}>
            <RelatedContent source={{ type: "workout", id: workout.id }} showTitle={false} />
          </Section>
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
                className="text-sm text-muted-foreground pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-none before:bg-success/60"
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
                className="text-sm text-muted-foreground pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-none before:bg-destructive/60"
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
