import {
  useState,
  useEffect,
  type CSSProperties,
  useCallback,
} from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { HOME_LINK_STATE } from "@/components/layout/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Dumbbell,
  Link2,
  MoreHorizontal,
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
  FavoriteButton,
  ZonePersonalizationCTA,
  TipCard,
} from "@/components/domain";
import { CoachingMark, CoachingTips } from "@/components/domain/WorkoutStructure";
import { IntensityBar } from "@/components/domain/session/IntensityBar";
import { SessionPhaseList } from "@/components/domain/session/SessionPhaseList";
import { SessionRelated } from "@/components/domain/session/SessionRelated";
import { ZoneSplit } from "@/components/domain/session/ZoneSplit";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import Plank from "@/assets/doodles/plank.svg?react";
import { ShareDialog } from "@/components/share/ShareDialog";
import { toast } from "@/components/ui/toast";
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
} from "@/components/visualization";
import { StrengthSessionTimeline } from "@/components/visualization/StrengthSessionTimeline";
import { MuscleDistribution } from "@/components/visualization/MuscleDistribution";
import { MuscleMap } from "@/components/visualization/MuscleMap";
import { useWorkout, useTips } from "@/hooks";
import { RelatedContent } from "@/components/domain/RelatedContent";
import type { UserZonePreferences, ZoneRange } from "@/types";
import { getWorkoutDiscipline, getPeakZone } from "@/types";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";
import { getWorkoutPhaseSteps } from "@/lib/workoutStructure";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import { useIsEnglish, usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { estimateDistanceKm, intensitySplit, peakOf } from "@/lib/sessionFacts";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import { MuscleGroupBadges } from "@/components/domain/MuscleGroupBadge";
import { StrengthExerciseList } from "@/components/domain/StrengthExerciseList";
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
  /** The value this one replaced, printed struck through beside it. */
  was?: string;
  /** A value that is not a number yet, what is missing to have one. */
  muted?: boolean;
}

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["session", "library", "common"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();
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

  // The contextual tip follows the session's PEAK zone, as it always did: the
  // tip of a VO2 session is about VO2, even when most of its minutes are easy.
  const peakZoneForTip = runningWorkout ? getPeakZone(runningWorkout) : undefined;
  const { tip } = useTips({
    filters: peakZoneForTip ? { zones: [peakZoneForTip] } : undefined,
    autoLoad: !!workout && !isStrength,
  });

  // The athlete's zones, from localStorage. `zonePrefs` says what they were
  // computed from (a VMA, a max HR), the VMA line and the distance read it.
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  const [zonePrefs, setZonePrefs] = useState<UserZonePreferences | null>(null);

  // Share modal (5 social templates)
  const [shareOpen, setShareOpen] = useState(false);

  const refreshUserZones = useCallback(() => {
    const prefs = loadUserZonePrefs();
    if (prefs && (prefs.fcMax || prefs.vma)) {
      setUserZones(calculateAllZones(prefs));
      setZonePrefs(prefs);
    } else {
      setUserZones([]);
      setZonePrefs(null);
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

  const peakZone = getPeakZone(workout);
  const workoutDiscipline = getWorkoutDiscipline(workout);
  // Adjusting means copying: a workout already living in My Workouts is edited
  // in place instead, and one with no number to move has nothing to offer.
  const isOwnWorkout = isCustomWorkoutId(workout.id);
  const canAdjust = !isOwnWorkout && hasAdjustableParams(workout);
  // Plan context: duration from plan generation (volume-scaled, may differ for long runs)
  const planWeekNumber = locationState?.weekNumber;
  const planVolumePercent = locationState?.volumePercent;
  const planEstimatedDuration = locationState?.estimatedDurationMin;
  const planTargetDistanceKm = locationState?.targetDistanceKm;
  const hasPlanContext =
    locationState?.from === "plan" && planEstimatedDuration != null;

  // Base session data from workout template. One call, reused: the profile
  // bar, the zone split and the durations all read the same segments.
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

  // Always use plan duration when coming from a plan, it's the authoritative value
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
  // The template's own minutes, unless a plan scaled them: then the plan's.
  const split = intensitySplit(
    workout,
    hasPlanContext ? duration : sessionData.totalDurationMin,
  );
  const peak = peakOf(workout);

  // Breadcrumb trail
  const workoutName = pick(workout, "name");
  const categoryLabel = t(`library:categories.${workout.category}`);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t("common:nav.home"), to: "/", state: HOME_LINK_STATE },
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

  // ONE line of metadata, in mono: the code, what the session is, then the
  // discipline when it is not running (the default goes without saying) and
  // the ground when the session states one. It replaces five chips in four
  // styles, the zone badge among them, which named the peak as if it were
  // the session's character.
  const metaParts: string[] = [
    workout.id,
    t(`library:metaLine.category.${workout.category}`),
  ];
  if (workoutDiscipline !== "running") {
    metaParts.push(t(`library:activityToggle.${workoutDiscipline}`));
  }
  if (workout.environment.requiresTrack) metaParts.push(t("library:metaLine.terrain.track"));
  if (workout.environment.requiresHills && !hasTrail) metaParts.push(t("library:metaLine.terrain.hills"));
  if (workout.environment.prefersFlat) metaParts.push(t("library:metaLine.terrain.flat"));

  // The four numbers that decide whether this is today's session. The old
  // fourth, the target system, repeated the category line and is gone.
  const estimatedKm =
    planTargetDistanceKm != null && planTargetDistanceKm > 0
      ? planTargetDistanceKm
      : zonePrefs?.vma != null
        ? estimateDistanceKm(workout, zonePrefs.vma)
        : null;
  const kmFormat = new Intl.NumberFormat(isEn ? "en-GB" : "fr-FR", {
    maximumFractionDigits: 1,
  });
  const facts: Fact[] = [
    {
      label: t("session:stats.duration"),
      value: formatDurationMinutes(duration),
      was:
        hasPlanContext && duration < baseDuration - 3
          ? formatDurationMinutes(baseDuration)
          : undefined,
    },
    estimatedKm != null && estimatedKm > 0
      ? {
          label: t("session:stats.distance"),
          value: t("session:page.distanceEstimate", { km: kmFormat.format(estimatedKm) }),
        }
      : {
          label: t("session:stats.distance"),
          value: t("session:page.distanceNeedsVma"),
          muted: true,
        },
    {
      label: t("session:stats.difficulty"),
      value: t(`library:difficulty.${workout.difficulty}`),
    },
    {
      label: t("session:stats.peak"),
      value: peak
        ? peak.seconds > 0
          ? `Z${peak.zone} · ${formatDurationMinutes(peak.seconds / 60)}`
          : `Z${peak.zone}`
        : "-",
    },
  ];

  // The menu behind the dots: everything that is not the primary action.
  const moreMenu = (
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
                else toast.failure(t("common:share.toast.textCopyFailed"));
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
                else toast.failure(t("common:share.toast.linkCopyFailed"));
              }}
            >
              <Link2 />
              {t("common:actions.copyLink")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  );

  // The action cluster, rendered in one of two places: in the page from
  // 641px, docked to the floor of the viewport below (.zn-session__dock).
  // Export is an outline button: the screen's one vermillon is kept for
  // its primary action.
  const actionCluster = (
    <div className="zn-session__actions">
      <ExportMenu
        workout={workout}
        size="lg"
        variant="outline"
        iconOnly={isPhone}
      />
      <FavoriteButton workoutId={workout.id} />
      {moreMenu}
    </div>
  );

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`/workout/${workout.id}`}
        // Painted per session by scripts/generate-og-workouts.ts, and kept in
        // step with the static shell that generate-route-meta.ts writes.
        ogImage={`/og/workout/${workout.id}.png`}
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
                name: "Peak Zone",
                value: `Z${peakZone}`,
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
                    .join(" · ") || "Échauffement progressif",
              },
              {
                "@type": "HowToStep",
                position: 2,
                name: "Corps de séance",
                text:
                  workout.mainSetTemplate
                    .map((b) => pick(b, "description"))
                    .filter(Boolean)
                    .join(" · ") || seoDescription,
              },
              {
                "@type": "HowToStep",
                position: 3,
                name: "Retour au calme",
                text:
                  workout.cooldownTemplate
                    .map((b) => pick(b, "description"))
                    .filter(Boolean)
                    .join(" · ") || "Retour au calme",
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
      <div className="zn-session zn-session--run">
        <SessionTrail breadcrumbs={breadcrumbs} onBack={() => navigate(-1)} />

        <div className="zn-session__grid">
          {/* 1, what the session is */}
          <header className="zn-session__header">
            <p className="zn-session__meta">{metaParts.join(" · ")}</p>
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
          </header>

          {/* 2, its numbers, and what to do with it */}
          <div className="zn-session__summary">
            <FactStrip facts={facts} variant="grid" />
            {!isPhone && actionCluster}
          </div>

          {/* 3, the session itself: intensity, profile, then phase by phase */}
          <section className="zn-session__structure" aria-labelledby="session-structure">
            <div className="zn-session__titlerow">
              <h2 id="session-structure" className="zn-session__h2">
                {t("session:page.structureTitle")}
              </h2>
              <span className="zn-session__kicker">
                {t("session:page.structureKicker", {
                  count: phaseCount,
                  duration: formatDurationMinutes(duration),
                })}
              </span>
            </div>

            <IntensityBar split={split} peakZone={peak?.zone ?? null} />

            <div className="zn-session__profile">
              <ZoneBar blocks={profileBlocks} />
            </div>

            <ZonePersonalizationCTA
              className="zn-session__zone-cta"
              current={zonePrefs}
              onSaved={refreshUserZones}
            />

            <SessionPhaseList
              workout={workout}
              userZones={userZones.length > 0 ? userZones : undefined}
            />
          </section>

          {/* 4, where the time goes, then how to spend it */}
          <aside className="zn-session__aside">
            <section className="zn-session__distribution" aria-labelledby="session-zones">
              <h2 id="session-zones" className="zn-session__h2">
                {t("session:page.distributionTitle")}
              </h2>
              <ZoneSplit rows={sessionData.zoneBreakdown} />
            </section>

            <section className="zn-session__advice" aria-label={t("session:titles.coachingTips")}>
              <CoachingTips workout={workout} />
              {tip && (
                <TipCard tip={tip} variant="banner" className="zn-session__tip" />
              )}
            </section>
          </aside>

          {/* 5, the ground, when the session has one */}
          {hasTrail && (
            <section className="zn-session__wide zn-stack" aria-labelledby="session-trail">
              <h2 id="session-trail" className="zn-session__h2">
                {t("session:titles.trailProfile")}
              </h2>
              <div className="zn-session__elevation">
                <MiniElevationProfile workout={workout} height={72} />
              </div>
              <p className="zn-mono zn-faint">
                {[
                  trailMetrics.totalElevationGainM > 0
                    ? `+${trailMetrics.totalElevationGainM} m D+`
                    : null,
                  trailMetrics.dominantTerrain
                    ? t(`library:trail.terrainType.${trailMetrics.dominantTerrain}`)
                    : null,
                  trailMetrics.verticalDensityMPerKm > 0
                    ? t("library:trail.verticalDensity", { value: trailMetrics.verticalDensityMPerKm })
                    : null,
                  trailMetrics.avgGradientPercent !== 0
                    ? t("library:trail.gradientAvg", { value: trailMetrics.avgGradientPercent })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </section>
          )}

          {/* 6, the rest, folded: it stays in the DOM, it just waits its turn */}
          <div className="zn-session__wide zn-session__folds">
            <Section collapsible title={t("session:titles.nutritionRecovery")}>
              <NutritionRecoverySection workout={workout} />
            </Section>
            <Section collapsible title={t("session:titles.scienceMode")}>
              <ScienceSection workout={workout} />
            </Section>
          </div>

          {/* 7, the next tap */}
          <section className="zn-session__wide zn-session__next" aria-labelledby="session-next">
            <h2 id="session-next" className="zn-session__h2">
              {t("session:page.relatedTitle")}
            </h2>
            <SessionRelated workoutId={workout.id} />
            <RelatedContent
              source={{ type: "workout", id: workout.id }}
              showTitle={false}
              include={["articles"]}
            />
          </section>
        </div>

        <ShareDialog
          workout={workout}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      </div>

      {/* The thumb-zone bar, on a phone and on this page only: pinned to the
          viewport floor, full width, on a rule. */}
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

/**
 * The facts block: mono label, value. `grid` is the running page's four
 * figures, 2 x 2 on a phone and beside the header on a desktop, 4 x 1 on a
 * tablet; the default is the strength page's strip.
 */
function FactStrip({ facts, variant }: { facts: Fact[]; variant?: "grid" }) {
  return (
    <dl className="zn-session__facts" data-variant={variant}>
      {facts.map((fact) => (
        <div key={fact.label} className="zn-session__fact">
          <dt className="zn-kicker zn-kicker--inline">{fact.label}</dt>
          <dd className="zn-session__fact-value" data-muted={fact.muted || undefined}>
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
    { label: tCommon("nav.home"), to: "/", state: HOME_LINK_STATE },
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
      value: `${formatDurationMinutes(workout.typicalDuration.min)}-${formatDurationMinutes(workout.typicalDuration.max)}`,
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
                  else toast.failure(tCommon("share.toast.linkCopyFailed"));
                }}
              >
                <Link2 />
                {tCommon("actions.copyLink")}
              </Button>
              <FavoriteButton workoutId={workout.id} />
            </div>

            <FactStrip facts={facts} />
          </div>

          {/* Le gainage, à la quatrième tentative. Les deux contacts au sol,
              avant-bras et orteils, sont en vermillon comme docs/doodles.md
              les nomme, et cette fois ils mordent vraiment la ligne : de 0,2 à
              3,9 px sous elle, le duo approuvé étant à 3,07.

              Il garde un défaut nommé : les jambes s'arrêtent au sol sans pied
              dessiné. Le corriger a été tenté sur vingt tours et le résultat
              était pire, un nœud de chevilles qui perdait l'effilement des
              jambes. À 260 px, la taille de ce bloc, le manque ne se voit pas.
              Voir docs/doodles.md.

              Il se tient sur le filet qui ferme le héros, comme la foulée de la
              séance de course : le sol EST la règle de la page. Il prend la
              largeur de sa colonne, et sa hauteur suit le viewBox, pas de
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
 * own fields: an ink square for advice, an ink cross for a mistake. The paint
 * is `.zn-coaching`, shared with `CoachingTips`.
 */
function StrengthCoachingTips({
  tips,
  mistakes,
}: {
  tips: string[];
  mistakes: string[];
}) {
  const { t } = useTranslation("session");

  const groups: { title: string; mark: "tip" | "mistake"; items: string[] }[] = [
    { title: t("coaching.tips"), mark: "tip", items: tips },
    { title: t("coaching.mistakes"), mark: "mistake", items: mistakes },
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
                  <CoachingMark kind={group.mark} />
                  <GlossaryLinkedText text={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
