import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Dumbbell,
  Link2,
  Route,
  Share,
  StravaIcon,
  MoreHorizontal,
  SlidersHorizontal,
  Pencil,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  TipCard,
} from "@/components/domain";
import {
  WorkoutStructure,
  CoachingTips,
} from "@/components/domain/WorkoutStructure";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { Annotation } from "@/components/domain/Annotation";
import Runner from "@/assets/doodles/runner.svg?react";
import { ZoneRow } from "@/components/domain/ZoneRow";
import { ShareDialog } from "@/components/share/ShareDialog";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/issueBuilder";
import { buildStravaShareText } from "@/lib/export";
import { NutritionRecoverySection } from "@/components/domain/NutritionRecoverySection";
import { ScienceSection } from "@/components/domain/ScienceSection";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { SEOHead } from "@/components/seo";
import { Section } from "@/components/editorial/Section";
import {
  ZoneBar,
  toZoneBarBlocks,
  transformSessionBlocks,
  formatDurationMinutes,
  MiniElevationProfile,
  type ZoneNumber,
} from "@/components/visualization";
import { StrengthSessionTimeline } from "@/components/visualization/StrengthSessionTimeline";
import { MuscleDistribution } from "@/components/visualization/MuscleDistribution";
import { MuscleMap } from "@/components/visualization/MuscleMap";
import { useWorkout, useRelatedWorkouts, useTips } from "@/hooks";
import { RelatedContent } from "@/components/domain/RelatedContent";
import type { ZoneRange } from "@/types";
import { getWorkoutDiscipline, getDominantZone } from "@/types";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";
import { getWorkoutPhaseSteps } from "@/lib/workoutStructure";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import { MuscleGroupBadges } from "@/components/domain/MuscleGroupBadge";
import { StrengthExerciseList } from "@/components/domain/StrengthExerciseList";
import { CATEGORY_ICONS } from "@/components/domain/CategoryIcon";
import { loadUserZonePrefs, calculateAllZones } from "@/lib/zones";
import { hasAdjustableParams } from "@/lib/workoutAdjust";
import {
  createCustomWorkoutId,
  isCustomWorkoutId,
} from "@/lib/customWorkoutStorage";
import { publicWorkoutUrl } from "@/lib/share/workoutShare";

const PHASE_KEYS = ["warmup", "main", "cooldown"] as const;

type BreadcrumbItem = {
  label: string;
  to?: string;
  state?: Record<string, unknown>;
};

interface Fact {
  label: string;
  value: string;
  /** The value this one replaced — printed struck through beside it. */
  was?: string;
}

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
  const runningWorkout = workout && isRunningWorkout(workout) ? workout : null;
  const isStrength = workout ? isStrengthWorkout(workout) : false;
  const { workouts: relatedWorkouts } = useRelatedWorkouts(runningWorkout);

  // Get contextual tip based on dominant zone (running workouts only)
  const dominantZoneForTip = runningWorkout
    ? getDominantZone(runningWorkout)
    : undefined;
  const { tip } = useTips({
    filters: dominantZoneForTip ? { zones: [dominantZoneForTip] } : undefined,
    autoLoad: !!workout && !isStrength,
  });

  // Load user zones from localStorage
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  const [hasUserZones, setHasUserZones] = useState(false);

  // Share modal (5 social templates)
  const [shareOpen, setShareOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="zn-session__loading" aria-busy="true">
        <Skeleton className="zn-session__loading-title" />
        <Skeleton className="zn-session__loading-line" />
        <Skeleton className="zn-session__loading-facts" />
        <Skeleton variant="zone-shimmer" className="zn-session__loading-bar" />
      </div>
    );
  }

  // A dead end with a way out of it: the id is gone, everything the athlete
  // saved is not, and the catalogue is one click away.
  if (!workout) {
    return (
      <div className="zn-session__missing">
        <Alert
          kind="error"
          title={t("session:screen.notFoundTitle")}
          action={
            <Button variant="outline" asChild>
              <Link to="/library">
                <ArrowLeft />
                {t("common:actions.backToLibrary")}
              </Link>
            </Button>
          }
        >
          {t("session:screen.notFoundBody")}
        </Alert>
      </div>
    );
  }

  // ── Strength workout branch ─────────────────────────────────────
  // Narrowing here is what makes `workout` a WorkoutTemplate below.
  if (isStrengthWorkout(workout)) {
    return (
      <StrengthWorkoutDetail workout={workout} locationState={locationState} />
    );
  }

  const dominantZone = getDominantZone(workout);
  const workoutDiscipline = getWorkoutDiscipline(workout);
  // Adjusting means copying: a workout already living in My Workouts is edited
  // in place instead, and one with no number to move has nothing to offer.
  const isOwnWorkout = isCustomWorkoutId(workout.id);
  const canAdjust = !isOwnWorkout && hasAdjustableParams(workout);
  const canGenerateRoute =
    !workout.environment.requiresTrack &&
    (workoutDiscipline === "running" || workoutDiscipline === "cycling");
  // Plan context: duration from plan generation (volume-scaled, may differ for long runs)
  const planWeekNumber = locationState?.weekNumber;
  const planVolumePercent = locationState?.volumePercent;
  const planEstimatedDuration = locationState?.estimatedDurationMin;
  const planTargetDistanceKm = locationState?.targetDistanceKm;
  const hasPlanContext =
    locationState?.from === "plan" && planEstimatedDuration != null;

  // Base session data from workout template. One call, reused three times: the
  // profile bar, the zone split and the durations all read the same segments.
  const sessionData = transformSessionBlocks({
    warmupTemplate: workout.warmupTemplate,
    mainSetTemplate: workout.mainSetTemplate,
    cooldownTemplate: workout.cooldownTemplate,
    warmupStructure: workout.warmupStructure,
    mainSetStructure: workout.mainSetStructure,
    cooldownStructure: workout.cooldownStructure,
    discipline: workout.discipline,
  });
  const baseDuration = Math.round(sessionData.totalDurationMin);

  // Always use plan duration when coming from a plan — it's the authoritative value
  // that matches what the calendar shows.
  const planDuration =
    planEstimatedDuration != null ? Math.round(planEstimatedDuration) : null;
  const duration =
    locationState?.from === "plan" && planDuration != null
      ? planDuration
      : baseDuration;

  const profileBlocks = toZoneBarBlocks(workout);
  const phaseCount = PHASE_KEYS.filter(
    (key) => getWorkoutPhaseSteps(workout, key).length > 0,
  ).length;
  const zonedRows = sessionData.zoneBreakdown.filter(
    (row): row is typeof row & { zone: ZoneNumber } => row.zone != null,
  );
  const unzonedRow = sessionData.zoneBreakdown.find((row) => row.zone == null);

  const CategoryIcon = CATEGORY_ICONS[workout.category];

  // Breadcrumb trail
  const workoutName = pick(workout, "name");
  const categoryLabel = t(`library:categories.${workout.category}`);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t("common:nav.home"), to: "/" },
  ];

  if (locationState?.from === "plan" && locationState.planId) {
    breadcrumbs.push({ label: t("common:nav.plans"), to: "/plans" });
    breadcrumbs.push({
      label:
        locationState.planName || t("common:pages.workoutDetail.planFallback"),
      to: `/plan/${locationState.planId}?week=${locationState.weekNumber}`,
      state: { returnScrollY: locationState.scrollY },
    });
  } else if (
    locationState?.from === "collection" &&
    locationState.collectionSlug
  ) {
    breadcrumbs.push({
      label: t("common:collections.title"),
      to: "/collections",
    });
    breadcrumbs.push({
      label:
        locationState.collectionName ||
        t("common:pages.workoutDetail.collectionFallback"),
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

  const seoTitle = pick(workout, "name");
  const seoDescription = pick(workout, "description").slice(0, 155);

  const trailMetrics = computeTrailMetrics(workout);
  const hasTrail =
    trailMetrics.totalElevationGainM > 0 ||
    trailMetrics.totalElevationLossM > 0 ||
    trailMetrics.dominantTerrain != null;

  const envRequirements: string[] = [];
  if (workout.environment.requiresTrack) {
    envRequirements.push(t("session:environment.requiresTrack"));
  }
  if (workout.environment.requiresHills && !hasTrail) {
    envRequirements.push(t("session:environment.requiresHills"));
  }
  if (workout.environment.prefersFlat) {
    envRequirements.push(t("session:environment.prefersFlat"));
  }

  // The strip: the numbers that decide whether this is today's session.
  const facts: Fact[] = [
    {
      label: t("session:stats.duration"),
      value: formatDurationMinutes(duration),
      was:
        hasPlanContext && duration < baseDuration - 3
          ? formatDurationMinutes(baseDuration)
          : undefined,
    },
  ];
  if (planTargetDistanceKm != null && planTargetDistanceKm > 0) {
    facts.push({
      label: t("session:stats.distance"),
      value: `${workout.category !== "long_run" ? "~" : ""}${planTargetDistanceKm} km`,
    });
  }
  facts.push({
    label: t("session:stats.difficulty"),
    value: t(`library:difficulty.${workout.difficulty}`),
  });
  facts.push({
    label: t("session:stats.target"),
    value: t(`session:targetSystems.${workout.targetSystem}`),
  });
  if (envRequirements.length > 0) {
    facts.push({
      label: t("session:stats.environment"),
      value: envRequirements.join(" · "),
    });
  }
  if (hasTrail && trailMetrics.totalElevationGainM > 0) {
    facts.push({
      label: t("session:stats.elevation"),
      value: `+${trailMetrics.totalElevationGainM} m`,
    });
  }

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
              {
                "@type": "PropertyValue",
                name: "Category",
                value: workout.category,
              },
              {
                "@type": "PropertyValue",
                name: "Target System",
                value: workout.targetSystem,
              },
              {
                "@type": "PropertyValue",
                name: "Difficulty",
                value: workout.difficulty,
              },
              {
                "@type": "PropertyValue",
                name: "Dominant Zone",
                value: `Z${dominantZone}`,
              },
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
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "EUR",
              value: "0",
            },
            tool: [
              "Running shoes",
              "Heart rate monitor (optional)",
              "GPS watch (optional)",
            ],
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
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://zoned.run/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Bibliothèque",
                item: "https://zoned.run/library",
              },
              { "@type": "ListItem", position: 3, name: seoTitle },
            ],
          },
        ]}
      />

      <div className="zn-session">
        <SessionTrail breadcrumbs={breadcrumbs} onBack={() => navigate(-1)} />

        {/* 1 — what the session is, and the one thing to do with it */}
        <section className="zn-session__hero">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          >
            <div
              className="zn-cluster"
              style={{ "--gap": "var(--sp-5)" } as CSSProperties}
            >
              <span className="zn-mono zn-session__code">{workout.id}</span>
              <ZoneBadge zone={dominantZone} size="md" showLabel />
              <Badge variant="outline">
                <CategoryIcon className="zn-cat-icon" />
                {categoryLabel}
              </Badge>
              <Badge variant="secondary">
                {t(`library:activityToggle.${workoutDiscipline}`)}
              </Badge>
            </div>

            <h1 className="zn-display">{workoutName}</h1>

            <p className="zn-body zn-body--lead zn-session__lede">
              <GlossaryLinkedText text={pick(workout, "description")} />
            </p>

            {workout.sourceWorkoutId && (
              <WorkoutProvenance sourceId={workout.sourceWorkoutId} />
            )}

            {hasPlanContext && (
              <p className="zn-mono zn-faint">
                {t("session:planContext.banner", {
                  week: planWeekNumber,
                  volume: planVolumePercent,
                  duration,
                })}
              </p>
            )}

            {/* One primary call — the only vermillon fill on the screen. The
                route hand-off comes second, everything that is a variant of
                "share this" goes behind the overflow menu. */}
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-5)" } as CSSProperties}
            >
              <div
                className="zn-cluster"
                style={{ "--gap": "var(--sp-6)" } as CSSProperties}
              >
                <ExportMenu workout={workout} size="lg" />

                {canGenerateRoute && (
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/routes" state={{ workoutRouteWorkout: workout }}>
                      <Route />
                      {t("session:actions.findRoute")}
                    </Link>
                  </Button>
                )}

                {canAdjust && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      navigate(
                        `/workout/builder/${createCustomWorkoutId()}?from=${workout.id}`,
                      )
                    }
                  >
                    <SlidersHorizontal />
                    {t("session:actions.adjust")}
                  </Button>
                )}

                {/* A workout of one's own is edited, not copied again. Reached
                  from Favourites or a bookmark, this page was otherwise a dead
                  end: the only way back to the editor was through My Workouts. */}
                {isOwnWorkout && (
                  <Button variant="outline" size="lg" asChild>
                    <Link to={`/workout/builder/${workout.id}`}>
                      <Pencil />
                      {t("session:actions.edit")}
                    </Link>
                  </Button>
                )}

                <FavoriteButton workoutId={workout.id} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={t("session:actions.moreActions")}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShareOpen(true)}>
                      <Share />
                      {t("common:share.trigger")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        const ok = await copyToClipboard(
                          buildStravaShareText(workout),
                        );
                        if (ok) toast.success(t("session:strava.copied"));
                        else toast.error(t("common:errors.generic"));
                      }}
                    >
                      <StravaIcon />
                      {t("session:actions.shareStrava")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        const ok = await copyToClipboard(
                          publicWorkoutUrl(workout),
                        );
                        if (ok) toast.success(t("common:actions.linkCopied"));
                        else toast.error(t("common:errors.generic"));
                      }}
                    >
                      <Link2 />
                      {t("common:actions.copyLink")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* What the primary call actually produces. The formats live
                  inside the export menu; naming them here is what tells a
                  runner the session reaches their watch at all. */}
              <p className="zn-mono zn-faint">
                {t("session:screen.exportFormats")}
              </p>
            </div>

            <FactStrip facts={facts} />

            {!hasUserZones && <ZonePersonalizationCTA />}
          </div>

          <IllustrationSlot
            height={340}
            art={Runner}
            brief={t("session:illustration.brief")}
            label={t("session:illustration.label")}
          />
        </section>

        {/* 2 — the session itself: the whole profile, then phase by phase */}
        <section className="zn-section" aria-labelledby="session-structure">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          >
            <div
              className="zn-row zn-row--baseline"
              style={{ "--gap": "var(--sp-8)" } as CSSProperties}
            >
              <h2 id="session-structure" className="zn-title" data-level="1">
                {t("session:screen.structureTitle")}
              </h2>
              <span className="zn-kicker zn-kicker--inline">
                {t("session:screen.structureKicker", {
                  duration: formatDurationMinutes(duration),
                  phases: phaseCount,
                })}
              </span>
            </div>

            <div>
              {/* Le profil est la seule chose de la page qui se lit sur deux
                  axes à la fois. Sans un mot, on le prend pour une frise
                  décorative — d'où l'annotation, qui dit quoi regarder et le
                  montre. Une par écran : c'est la même discipline que l'aplat
                  vermillon unique. */}
              <Annotation
                text={t("session:screen.profileNote")}
                arrow="down-right"
                align="start"
                figure
              />
              <ZoneBar
                blocks={profileBlocks}
                height={112}
                className="zn-session__profile"
              />
              <div className="zn-session__axis">
                <span className="zn-kicker zn-kicker--inline">
                  {t("session:screen.axisStart")}
                </span>
                <span className="zn-kicker zn-kicker--inline">
                  {t("session:screen.axisEnd", {
                    duration: formatDurationMinutes(duration),
                  })}
                </span>
              </div>
            </div>
          </div>

          <WorkoutStructure
            workout={workout}
            userZones={hasUserZones ? userZones : undefined}
            className="zn-session__phases"
          />
        </section>

        {/* 3 — where the time goes, against how to spend it */}
        <section className="zn-session__split">
          <div
            className="zn-session__half zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
            aria-labelledby="session-zones"
          >
            <h2 id="session-zones" className="zn-title">
              {t("session:titles.zoneDistribution")}
            </h2>
            {/* Deuxième annotation de la page, et sans figure : le personnage
                n'apparaît qu'une fois par écran, les flèches peuvent se
                répéter. Sinon deux narrateurs se disputent la même page. */}
            <Annotation text={t("session:screen.zonesNote")} arrow="down-right" />
            <div className="zn-session__zones">
              {zonedRows.map((row) => (
                <ZoneRow
                  key={row.zone}
                  zone={row.zone}
                  name={row.label}
                  value={formatDurationMinutes(row.durationMin)}
                  percent={row.percent}
                />
              ))}
            </div>
            <p className="zn-mono zn-session__zones-total">
              {t("session:screen.total", {
                duration: formatDurationMinutes(duration),
              })}
              {unzonedRow
                ? ` · ${unzonedRow.label} ${formatDurationMinutes(unzonedRow.durationMin)}`
                : ""}
            </p>
          </div>

          <div className="zn-session__half zn-session__advice">
            <CoachingTips workout={workout} />
            {tip && (
              <TipCard tip={tip} variant="banner" className="zn-session__tip" />
            )}
          </div>
        </section>

        {/* 4 — the ground, when the session has one */}
        {hasTrail && (
          <section
            className="zn-section zn-stack"
            style={{ "--gap": "var(--sp-8)" } as CSSProperties}
            aria-labelledby="session-trail"
          >
            <h2 id="session-trail" className="zn-title" data-level="3">
              {t("session:titles.trailProfile")}
            </h2>
            <div className="zn-session__elevation">
              <MiniElevationProfile workout={workout} height={72} />
            </div>
            {trailMetrics.dominantTerrain && (
              <p className="zn-mono zn-faint">
                {t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)}
                {trailMetrics.verticalDensityMPerKm > 0 && (
                  <>
                    {" · "}
                    {t("library:trail.verticalDensity", {
                      value: trailMetrics.verticalDensityMPerKm,
                    })}
                  </>
                )}
                {trailMetrics.avgGradientPercent !== 0 && (
                  <>
                    {" · "}
                    {t("library:trail.gradientAvg", {
                      value: trailMetrics.avgGradientPercent,
                    })}
                  </>
                )}
              </p>
            )}
          </section>
        )}

        {/* 5 — the rest, folded: it stays in the DOM, it just waits its turn */}
        <section className="zn-section">
          <div className="zn-session__folds">
            <Section collapsible title={t("session:titles.nutritionRecovery")}>
              <NutritionRecoverySection workout={workout} />
            </Section>
            <Section collapsible title={t("session:titles.scienceMode")}>
              <ScienceSection workout={workout} />
            </Section>
          </div>
        </section>

        <ShareDialog
          workout={workout}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />

        {/* 6 — the next tap */}
        <section
          className="zn-section zn-stack"
          style={{ "--gap": "var(--sp-13)" } as CSSProperties}
          aria-labelledby="session-next"
        >
          <h2 id="session-next" className="zn-title" data-level="1">
            {t("session:titles.continueExploring")}
          </h2>
          {relatedWorkouts.length > 0 && (
            <div className="zn-grid">
              {relatedWorkouts.slice(0, 3).map((related) => (
                <WorkoutCardCompact key={related.id} workout={related} />
              ))}
            </div>
          )}
          <RelatedContent
            source={{ type: "workout", id: workout.id }}
            showTitle={false}
          />
        </section>
      </div>
    </>
  );
}

// ── shared furniture ────────────────────────────────────────────────────

/**
 * Back, then the trail. Mono, because a breadcrumb is a path rather than
 * prose; on a phone only the last two steps survive, which is the only part
 * of it a thumb ever uses.
 */
function SessionTrail({
  breadcrumbs,
  onBack,
}: {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="zn-session__trail">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft />
        {t("pages.workoutDetail.back")}
      </Button>

      <nav aria-label="Breadcrumb" className="zn-fill">
        <ol className="zn-session__crumbs zn-mono">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <li key={i} className="zn-session__crumb">
                {i > 0 && (
                  <span className="zn-session__crumb-sep" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast || !crumb.to ? (
                  <span
                    className="zn-session__crumb--current zn-truncate"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.to} state={crumb.state}>
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/** The four-up strip of facts under the hero: mono label, display value. */
function FactStrip({ facts }: { facts: Fact[] }) {
  return (
    <dl className="zn-session__facts">
      {facts.map((fact) => (
        <div key={fact.label} className="zn-session__fact">
          <dt className="zn-kicker zn-kicker--inline">{fact.label}</dt>
          <dd className="zn-session__fact-value">
            {fact.value}
            {fact.was && (
              <span className="zn-session__fact-was">{fact.was}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
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
    <p className="zn-body zn-body--sm zn-muted">
      {t("provenance.adaptedFrom")}{" "}
      <Link to={`/workout/${sourceId}`} className="zn-clink">
        {source ? pick(source, "name") : sourceId}
      </Link>
    </p>
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

function StrengthWorkoutDetail({
  workout,
  locationState,
}: StrengthWorkoutDetailProps) {
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
  const duration = Math.round(
    (workout.typicalDuration.min + workout.typicalDuration.max) / 2,
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: tCommon("nav.home"), to: "/" },
  ];

  if (locationState?.from === "plan" && locationState.planId) {
    breadcrumbs.push({ label: tCommon("nav.plans"), to: "/plans" });
    breadcrumbs.push({
      label:
        locationState.planName || tCommon("pages.workoutDetail.planFallback"),
      to: `/plan/${locationState.planId}`,
      state: {
        returnToWeek: locationState.weekNumber,
        returnScrollY: locationState.scrollY,
      },
    });
  } else {
    breadcrumbs.push({ label: tCommon("nav.library"), to: "/library" });
    breadcrumbs.push({
      label: tStrength("categories." + workout.category),
      to: `/library?activity=strength&category=${workout.category}`,
    });
  }
  breadcrumbs.push({ label: workoutName });

  // Coaching tips (shared shape with running)
  const tips = pickLangArray<string>(workout, "coachingTips");
  const mistakes = pickLangArray<string>(workout, "commonMistakes");

  const equipmentList = workout.equipment.filter((e) => e !== "none");
  const hasEquipment = equipmentList.length > 0;

  const seoTitle = workoutName;
  const seoDescription = description.slice(0, 155);

  const facts: Fact[] = [
    {
      label: tSession("stats.duration"),
      value: `${formatDurationMinutes(workout.typicalDuration.min)}–${formatDurationMinutes(workout.typicalDuration.max)}`,
    },
    {
      label: tSession("stats.difficulty"),
      value: tLib(`difficulty.${workout.difficulty}`),
    },
    {
      label: tSession("stats.frequency"),
      value: tStrength("detail.weeklyMax", {
        count: workout.weeklyFrequencyMax,
      }),
    },
    {
      label: tSession("stats.recovery"),
      value: tStrength("detail.minRecovery", {
        days: workout.minimumRecoveryDays,
      }),
    },
  ];

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
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://zoned.run/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Bibliothèque",
                item: "https://zoned.run/library",
              },
              { "@type": "ListItem", position: 3, name: seoTitle },
            ],
          },
        ]}
      />

      <div className="zn-session">
        <SessionTrail breadcrumbs={breadcrumbs} onBack={() => navigate(-1)} />

        <section className="zn-session__hero">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          >
            <div
              className="zn-cluster"
              style={{ "--gap": "var(--sp-5)" } as CSSProperties}
            >
              <span className="zn-mono zn-session__code">{workout.id}</span>
              <IntensityBadge intensity={workout.intensity} size="md" />
              <Badge variant="outline">
                <Dumbbell className="zn-cat-icon" />
                {tStrength(`categories.${workout.category}`)}
              </Badge>
              <Badge variant="secondary">
                {tLib("activityToggle.strength")}
              </Badge>
            </div>

            <h1 className="zn-display">{workoutName}</h1>

            <p className="zn-body zn-body--lead zn-session__lede">
              <GlossaryLinkedText text={description} />
            </p>

            <div
              className="zn-cluster"
              style={{ "--gap": "var(--sp-5)" } as CSSProperties}
            >
              <span className="zn-kicker zn-kicker--inline">
                {tStrength("detail.targetMuscles")}
              </span>
              <MuscleGroupBadges
                muscles={workout.primaryMuscleGroups}
                size="md"
              />
            </div>

            <div
              className="zn-cluster"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={async () => {
                  const ok = await copyToClipboard(window.location.href);
                  if (ok) toast.success(tCommon("actions.linkCopied"));
                  else toast.error(tCommon("errors.generic"));
                }}
              >
                <Link2 />
                {tCommon("actions.copyLink")}
              </Button>
              <FavoriteButton workoutId={workout.id} />
            </div>

            <FactStrip facts={facts} />
          </div>

          {/* Le gainage attend son dessin. Deux tentatives ont échoué et sont
              documentées dans docs/doodles.md : un contour fermé d'abord, puis
              une pose où le vermillon peignait l'avant-bras en l'air au lieu du
              contact — l'accent culminait six unités AU-DESSUS de la ligne de
              sol. Le brief imprimé dit « page sous presse » ; un dessin qui
              casse la règle de signature dirait autre chose. */}
          <IllustrationSlot
            height={340}
            brief={tSession("illustration.strengthBrief")}
            label={tSession("illustration.label")}
          />
        </section>

        <section
          className="zn-section zn-stack"
          style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          aria-labelledby="strength-structure"
        >
          <h2 id="strength-structure" className="zn-title" data-level="1">
            {tStrength("detail.sessionTimeline")}
          </h2>
          <StrengthSessionTimeline workout={workout} />
        </section>

        <section
          className="zn-section zn-stack"
          style={{ "--gap": "var(--sp-13)" } as CSSProperties}
          aria-labelledby="strength-exercises"
        >
          <h2 id="strength-exercises" className="zn-title" data-level="1">
            {tStrength("detail.exerciseDetail")}
          </h2>
          <StrengthExerciseList blocks={workout.warmupBlocks} phase="warmup" />
          <StrengthExerciseList blocks={workout.mainBlocks} phase="main" />
          <StrengthExerciseList
            blocks={workout.cooldownBlocks}
            phase="cooldown"
          />
        </section>

        <section className="zn-session__split">
          <div
            className="zn-session__half zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
            aria-labelledby="strength-muscles"
          >
            <h2 id="strength-muscles" className="zn-title">
              {tStrength("detail.muscleDistribution")}
            </h2>
            <MuscleDistribution workout={workout} />
          </div>
          <div
            className="zn-session__half zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
            aria-labelledby="strength-map"
          >
            <h2 id="strength-map" className="zn-title">
              {tStrength("detail.muscleMap")}
            </h2>
            <MuscleMap workout={workout} />
          </div>
        </section>

        <section className="zn-section">
          <div className="zn-session__folds">
            <Section collapsible title={tSession("titles.equipment")}>
              {hasEquipment ? (
                <div className="zn-cluster">
                  {equipmentList.map((eq) => (
                    <Badge key={eq} variant="secondary">
                      {tStrength(`equipment.${eq}`)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="zn-body zn-body--sm zn-muted">
                  {tStrength("detail.noEquipment")}
                </p>
              )}
            </Section>

            {workout.suitablePhases.length > 0 && (
              <Section collapsible title={tSession("titles.suitablePhases")}>
                <div className="zn-cluster">
                  {workout.suitablePhases.map((phase) => (
                    <Badge key={phase} variant="outline">
                      {tStrength(`trainingPhases.${phase}`)}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {(tips.length > 0 || mistakes.length > 0) && (
              <Section collapsible title={tSession("titles.coachingTips")}>
                <StrengthCoachingTips tips={tips} mistakes={mistakes} />
              </Section>
            )}

            {workout.references && workout.references.length > 0 && (
              <Section collapsible title={tSession("titles.scientificRefs")}>
                <ul className="zn-session__refs zn-source">
                  {workout.references.map((ref, i) => (
                    <li key={i}>
                      {ref.startsWith("http") ? (
                        <a href={ref} target="_blank" rel="noopener noreferrer">
                          {ref}
                        </a>
                      ) : (
                        ref
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </section>

        <section
          className="zn-section zn-stack"
          style={{ "--gap": "var(--sp-13)" } as CSSProperties}
          aria-labelledby="strength-next"
        >
          <h2 id="strength-next" className="zn-title" data-level="1">
            {tSession("titles.continueExploring")}
          </h2>
          <RelatedContent
            source={{ type: "workout", id: workout.id }}
            showTitle={false}
          />
          <p className="zn-source">
            {tCommon("pages.workoutDetail.exerciseCredits")}
          </p>
        </section>
      </div>
    </>
  );
}

// ── Strength coaching tips ──────────────────────────────────────────────

/**
 * The same two lists the running session prints, from the strength template's
 * own fields: an em rule for advice, a cross for a mistake, both in vermillon
 * type. The paint is `.zn-coaching`, shared with `CoachingTips`.
 */
function StrengthCoachingTips({
  tips,
  mistakes,
}: {
  tips: string[];
  mistakes: string[];
}) {
  const { t } = useTranslation("session");

  const groups: { title: string; mark: ReactNode; items: string[] }[] = [
    { title: t("coaching.tips"), mark: "—", items: tips },
    { title: t("coaching.mistakes"), mark: "×", items: mistakes },
  ];

  return (
    <div className="zn-coaching">
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.title} className="zn-coaching__group">
            <h4 className="zn-coaching__title">{group.title}</h4>
            <ul className="zn-coaching__list">
              {group.items.map((item, index) => (
                <li key={index} className="zn-coaching__item">
                  <span className="zn-coaching__mark" aria-hidden="true">
                    {group.mark}
                  </span>
                  <GlossaryLinkedText text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
