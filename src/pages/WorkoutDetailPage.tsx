import {
  useState,
  useEffect,
  type CSSProperties,
  type FunctionComponent,
  type ReactNode,
  type SVGProps,
  useCallback,
} from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Circle,
  Dumbbell,
  Mountain,
  Link2,
  MoreHorizontal,
  Route,
  Share,
  StravaIcon,
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
import Plank from "@/assets/doodles/plank.svg?react";
import Zone1 from "@/assets/doodles/zone-1.svg?react";
import Zone2 from "@/assets/doodles/zone-2.svg?react";
import Zone3 from "@/assets/doodles/zone-3.svg?react";
import Zone4 from "@/assets/doodles/zone-4.svg?react";
import Zone5 from "@/assets/doodles/zone-5.svg?react";
import Zone6 from "@/assets/doodles/zone-6.svg?react";
import { ZoneRow } from "@/components/domain/ZoneRow";
import { ShareDialog } from "@/components/share/ShareDialog";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/issueBuilder";
import { buildStravaShareText } from "@/lib/export";
import { NutritionRecoverySection } from "@/components/domain/NutritionRecoverySection";
import { ScienceSection } from "@/components/domain/ScienceSection";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { SEOHead } from "@/components/seo";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Section } from "@/components/editorial/Section";
import {
  ZoneBar,
  toZoneBarBlocks,
  transformSessionBlocks,
  formatDurationMinutes,
  MiniElevationProfile,
  type ZoneBarBlock,
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

/**
 * The figure IS the data the badge already states: a recovery run walks, a
 * threshold session runs at threshold, a 30/30 sprints. Six strides, indexed
 * by the dominant zone. `foot` is where the vermillon sole sits across the
 * drawing's width — the centre of the accent path, read from each file's
 * viewBox (zone-4: x 99.7–146.1 in a frame starting at 87.7, 175.5 wide) —
 * so that on a phone the CONTACT lands on the minute, not the frame's centre.
 *
 * Cycling and swimming get no figure: the rig draws no cyclist, and a runner
 * would contradict the page. Awaiting a decision, not an omission.
 */
const STANCES: Record<
  ZoneNumber,
  { art: FunctionComponent<SVGProps<SVGElement>>; foot: number }
> = {
  1: { art: Zone1, foot: 0.38 },
  2: { art: Zone2, foot: 0.37 },
  3: { art: Zone3, foot: 0.31 },
  4: { art: Zone4, foot: 0.2 },
  5: { art: Zone5, foot: 0.16 },
  6: { art: Zone6, foot: 0.16 },
};

/**
 * Where the figure stands: the first block of the hardest zone, as its index
 * in the profile and the fraction of the session at its centre. The profile
 * lays its blocks out with flex and 2px gaps, so the fraction alone is not a
 * position — session.css redoes that arithmetic from these two numbers.
 */
function hardestBlock(blocks: ZoneBarBlock[]) {
  const total = blocks.reduce((sum, b) => sum + b.seconds, 0);
  if (total === 0) return null;
  const index = blocks.reduce(
    (best, b, i) => (b.zone > blocks[best].zone ? i : best),
    0,
  );
  const before = blocks
    .slice(0, index)
    .reduce((sum, b) => sum + b.seconds, 0);
  return { index, at: (before + blocks[index].seconds / 2) / total };
}

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
  // 640px, the line every mobile rule on this page uses. Read here, above the
  // loading and not-found returns: a hook after an early return is a hook that
  // does not run on every render.
  const isPhone = useMediaQuery("(max-width: 640px)");

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

  const refreshUserZones = useCallback(() => {
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

  useEffect(() => {
    refreshUserZones();
  }, [refreshUserZones]);

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
  // One figure per screen, and only when it can be true: a running stride for
  // a running session. Where it goes depends on the width — see the hero and
  // the axis below.
  const stance = workoutDiscipline === "running" ? STANCES[dominantZone] : null;
  const stanceAt = stance ? hardestBlock(profileBlocks) : null;
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

  // Where the session has to be run. A LIST — it stays one.
  //
  // These used to be joined with " · " and pushed into `facts`, where the
  // strip printed them in 20px display type like a measurement. "Nécessite une
  // piste · Terrain plat préféré" then wrapped to three lines, took its row
  // from 68px to 109, and left the cell beside it with 40px of nothing. The
  // comment over `facts` says it out loud: the numbers that decide whether
  // this is today's session. A sentence is not one of them.
  //
  // Chips, under the block, with the marks the session card already uses.
  //
  // The labels are library:terrain.*, not session:environment.*. Both exist and
  // both are correct; the library's are the short ones — "Piste requise" rather
  // than "Nécessite une piste" — and they keep the required/preferred
  // distinction that a bare "Piste" would lose. Measured at 390px: the long
  // pair wrapped to two lines and cost 81px, the short pair sits on one at 40.
  // It also means the session page and the library filter now name the same
  // fact with the same words.
  const envRequirements: { key: string; label: string; icon?: ReactNode }[] = [];
  if (workout.environment.requiresTrack) {
    envRequirements.push({
      key: "track",
      label: t("library:terrain.track"),
      icon: <Circle size={12} />,
    });
  }
  if (workout.environment.requiresHills && !hasTrail) {
    envRequirements.push({
      key: "hills",
      label: t("library:terrain.hills"),
      icon: <Mountain size={12} />,
    });
  }
  if (workout.environment.prefersFlat) {
    envRequirements.push({
      key: "flat",
      label: t("library:terrain.flat"),
    });
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
  if (hasTrail && trailMetrics.totalElevationGainM > 0) {
    facts.push({
      label: t("session:stats.elevation"),
      value: `+${trailMetrics.totalElevationGainM} m`,
    });
  }

  // The action cluster, rendered in one of two places.
  //
  // On a wide screen it belongs in the hero, beside the facts. On a phone it
  // is docked to the floor of the viewport (.zn-session__dock, below 640):
  // 88px of buttons between the session's name and its profile is 88px of
  // someone not yet seeing the session.
  //
  // Three pills, and only three: send this to my watch, keep it, everything
  // else. The bar is sized for exactly that. A fourth control — the "see my
  // paces" call that focused the VMA field — landed here for a few hours and
  // ran off the left edge of a real iPhone; the owner had it removed. The VMA
  // field under the steps is the page's one entry point for the paces.
  const actionCluster = (
      <div
        className="zn-cluster zn-session__actions"
        style={{ "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <ExportMenu workout={workout} size="lg" variant={hasUserZones ? "default" : "outline"} />

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
            {canGenerateRoute && (
              <DropdownMenuItem asChild>
                <Link to="/routes" state={{ workoutRouteWorkout: workout }}>
                  <Route />
                  {t("session:actions.findRoute")}
                </Link>
              </DropdownMenuItem>
            )}

            {canAdjust && (
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    `/workout/builder/${createCustomWorkoutId()}?from=${workout.id}`,
                  )
                }
              >
                <SlidersHorizontal />
                {t("session:actions.adjust")}
              </DropdownMenuItem>
            )}

            {/* A workout of one's own is edited, not copied again. Reached
                from Favourites or a bookmark, this page was otherwise a
                dead end: the only way back to the editor was through My
                Workouts. */}
            {isOwnWorkout && (
              <DropdownMenuItem asChild>
                <Link to={`/workout/builder/${workout.id}`}>
                  <Pencil />
                  {t("session:actions.edit")}
                </Link>
              </DropdownMenuItem>
            )}

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
  );

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
          <div className="zn-stack zn-session__head">
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

            {!isPhone && actionCluster}

            <FactStrip facts={facts} />

            {envRequirements.length > 0 && (
              <div className="zn-cluster zn-session__env">
                {envRequirements.map((req) => (
                  <Badge key={req.key} variant="outline">
                    {req.icon}
                    {req.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* On a wide screen the figure fills the hero's second column and
              stands on the rule that closes the hero — the bottom of its box
              is that rule, see .zn-session__hero in session.css. Stacked on a
              phone it would sit between the facts and the session, and at any
              height that still reads as a figure it pushes the profile out of
              the first screen — measured: 140px of drawing moves the chart
              from 732 to 896 on an 844px screen.

              So below 640 it moves rather than shrinks: it stands on the
              profile's axis instead, at the minute of the hardest block. */}
          {!isPhone && stance && (
            <IllustrationSlot
              height={340}
              art={stance.art}
              brief={t("session:illustration.brief")}
              label={t("session:illustration.label")}
            />
          )}
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
                  montre. La flèche seule : la figure de l'écran est la foulée
                  de la séance (dans le héros, ou sous la frise sur un
                  téléphone), et une figure par écran, c'est la même discipline
                  que l'aplat vermillon unique. */}
              <Annotation
                text={t("session:screen.profileNote")}
                arrow="down-right"
                align="start"
              />
              <ZoneBar
                blocks={profileBlocks}
                height={112}
                className="zn-session__profile"
              />
              {/* The phone's one figure: under the profile, standing on the
                  axis hairline at the minute of the hardest block — the
                  stride the badge names, at the moment it is run. In the
                  flow, so it reserves its own height and never covers the
                  profile; static, never a cursor. Its sole is the contact
                  the axis measures, which is why the CONTACT sits on the
                  minute and not the frame. Decorative: the badge and the
                  profile's own label already say it in words. */}
              {isPhone && stance && stanceAt && (
                <div
                  className="zn-session__stance"
                  style={
                    {
                      "--i": stanceAt.index,
                      "--n": profileBlocks.length,
                      "--at": stanceAt.at,
                      "--foot": stance.foot,
                    } as CSSProperties
                  }
                >
                  <stance.art
                    className="zn-session__stance-art"
                    aria-hidden="true"
                    focusable="false"
                  />
                </div>
              )}
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

          {/* The offer to set your zones sits AFTER the session now. It was in
              the hero, between the facts and the drawing — 123px of aside
              standing between someone arriving and the workout they came for.
              Here it lands where it makes sense: right under the steps whose
              paces it would fill in. */}
          {!hasUserZones && (
            <ZonePersonalizationCTA className="zn-session__zone-cta" onSaved={refreshUserZones} />
          )}
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

      {/* The thumb-zone bar, on a phone and on this page only.
          Same shape as the shared-session dock below: pinned to the viewport
          floor, on a rule, giving up the end of its own gutter so the menu
          pill sits beside it rather than over it. */}
      {isPhone && <div className="zn-session__dock">{actionCluster}</div>}
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

          {/* Le gainage, à la quatrième tentative. Les deux contacts au sol —
              avant-bras et orteils — sont en vermillon comme docs/doodles.md
              les nomme, et cette fois ils mordent vraiment la ligne : de 0,2 à
              3,9 px sous elle, le duo approuvé étant à 3,07.

              Il garde un défaut nommé : les jambes s'arrêtent au sol sans pied
              dessiné. Le corriger a été tenté sur vingt tours et le résultat
              était pire — un nœud de chevilles qui perdait l'effilement des
              jambes. À 260 px, la taille de ce bloc, le manque ne se voit pas.
              Voir docs/doodles.md.

              Il se tient sur le filet qui ferme le héros, comme la foulée de la
              séance de course : le sol EST la règle de la page. Il prend la
              largeur de sa colonne, et sa hauteur suit le viewBox — pas de
              hauteur fixée, elle mentirait sur un dessin en paysage. */}
          <IllustrationSlot
            art={Plank}
            brief={tSession("illustration.strengthBrief")}
            label={tSession("illustration.strengthLabel")}
            className="zn-session__plank"
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
