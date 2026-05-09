import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Activity, ArrowLeftRight, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, EyeOff, Maximize2, Minimize2, Pencil, RotateCcw, Save, TrendingUp, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MiniRouteMap } from "@/components/visualization/route/MiniRouteMap";
import { SEOHead } from "@/components/seo";
import {
  RouteParametersForm,
  type RouteFormSubmitPayload,
} from "@/components/domain/RouteParametersForm";
import { generateRouteCandidates } from "@/lib/routeGenerator";
import { useRouteEditor } from "@/hooks/useRouteEditor";
import {
  buildManualRouteIntent,
  buildTrainingRoutePreset,
  buildWorkoutRoutePreset,
  getDistanceMatchLabel,
  poiBoostForSession,
  rankRouteCandidates,
  type DistanceMatchLabel,
  type RankedRouteCandidate,
} from "@/lib/routeGenerator/recommendation";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { cn } from "@/lib/utils";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import type { WorkoutTemplate } from "@/types";
import type { Route, RouteCoordinate } from "@/types/route";
import type { PlanSession } from "@/types/plan";

const RouteMap = lazy(() =>
  import("@/components/visualization/route/RouteMap").then((m) => ({
    default: m.RouteMap,
  })),
);
const ElevationChart = lazy(() =>
  import("@/components/visualization/route/ElevationChart").then((m) => ({
    default: m.ElevationChart,
  })),
);

function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-72 w-full animate-pulse rounded-xl border border-border/60 bg-muted/40 sm:h-96 lg:h-[28rem]",
        className,
      )}
    />
  );
}

/**
 * Pick the editor's initial waypoint list by sampling the trace at roughly
 * one-kilometre intervals. The original Brouter "via points" aren't stored
 * on the Route, so we approximate: a denser handle list lets the user grab
 * the trace closer to the spot they want to move without having to insert
 * a fresh waypoint first. Capped at 10 to keep the map readable.
 */
interface DisplayCandidate {
  route: Route;
  recommendation: RankedRouteCandidate | null;
}

interface RouteGeneratorLocationState {
  planRouteSession?: {
    session: PlanSession;
    planSessionRef: NonNullable<Route["planSessionRef"]>;
  };
  workoutRouteWorkout?: WorkoutTemplate;
}

// Tailwind classes for the unique distance-match chip (replaces the
// previous "closest_to_target_distance" reason + amber "approximate"
// banner that could fire together in the 5–10 % window).
const DISTANCE_MATCH_CLASSES: Record<DistanceMatchLabel, string> = {
  very_close:
    "border-emerald-300/60 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-100",
  close: "border-border/60 bg-background text-foreground",
  approximate:
    "border-amber-300/60 bg-amber-50/80 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100",
};

export function RouteGeneratorPage() {
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const location = useLocation();
  const { saveRoute } = useRoutes();
  const { settings } = useSettings();
  const pickLang = usePickLang();
  const pickLocale = usePickLocale();
  const isMobile = useIsMobile();

  const [candidates, setCandidates] = useState<DisplayCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewStart, setPreviewStart] = useState<RouteCoordinate | null>(null);
  const [lastPayload, setLastPayload] = useState<RouteFormSubmitPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reversedIds, setReversedIds] = useState<Record<string, boolean>>({});
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  // Desktop one-page layout: the "Pourquoi ce parcours" panel collapses
  // by default so the map keeps the maximum vertical room. Users only
  // pop it open when they want to compare the rationale or read the
  // elevation profile in detail.
  const [detailsOpen, setDetailsOpen] = useState(false);

  const routeState = location.state as RouteGeneratorLocationState | null;
  const runnerProfile = useMemo(() => loadRunnerProfile(), []);
  const trainingPreset = useMemo(() => {
    const planRouteSession = routeState?.planRouteSession;
    if (planRouteSession) {
      return buildTrainingRoutePreset({
        session: planRouteSession.session,
        runnerProfile,
        planSessionRef: planRouteSession.planSessionRef,
      });
    }

    if (routeState?.workoutRouteWorkout) {
      return buildWorkoutRoutePreset({
        workout: routeState.workoutRouteWorkout,
        runnerProfile,
      });
    }

    return null;
  }, [routeState, runnerProfile]);

  const presetSession = routeState?.planRouteSession?.session ?? null;
  const presetWorkout = routeState?.workoutRouteWorkout ?? null;
  const presetSessionLabel = trainingPreset?.intent.sessionType
    ? pickLocale(SESSION_TYPE_LABELS[trainingPreset.intent.sessionType], trainingPreset.intent.sessionType)
    : null;
  const presetSessionNotes = presetSession
    ? pickLang(presetSession, "notes")
    : presetWorkout
      ? pickLang(presetWorkout, "description")
      : "";
  const presetTitle = presetWorkout ? pickLang(presetWorkout, "name") : null;

  const selectedCandidate = candidates[selectedIndex] ?? null;
  const route = selectedCandidate?.route ?? null;
  const isSelectedReversed = route ? !!reversedIds[route.id] : false;
  const selectedRecommendation = selectedCandidate?.recommendation ?? null;

  // Edit mode is entirely owned by useRouteEditor: state machine,
  // debounced re-route with AbortController, waypoint mutators. The
  // hook reads displayPoints lazily via a ref so the caller doesn't
  // need to pre-compute it (it's actually derived *from* this hook's
  // editPreview, which would otherwise create a circular dependency).
  // `onApply` plugs the edited route back into the candidates array
  // and clears the active reverse flag.
  const editorOnApply = useCallback((next: Route) => {
    setCandidates((prev) => {
      const idx = prev.findIndex((c) => c.route.id === next.id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], route: next, recommendation: null };
      return updated;
    });
    setReversedIds((prev) => ({ ...prev, [next.id]: false }));
  }, []);
  const editorDisplayPointsRef = useRef<RouteCoordinate[]>([]);
  const {
    editWaypoints,
    editPreview,
    isReRouting,
    onEnterEdit,
    onExitEdit,
    onApplyEdit,
    onWaypointMove,
    onWaypointInsert,
    onWaypointRemove,
  } = useRouteEditor({
    route,
    getDisplayPoints: useCallback(() => editorDisplayPointsRef.current, []),
    onApply: editorOnApply,
  });

  const isEditing = editWaypoints != null;
  const displayedRoute = editPreview ?? route;

  const displayPoints = useMemo(() => {
    if (!displayedRoute) return [] as RouteCoordinate[];
    if (isEditing) return displayedRoute.points;
    return isSelectedReversed ? [...displayedRoute.points].reverse() : displayedRoute.points;
  }, [displayedRoute, isSelectedReversed, isEditing]);
  // Mirror displayPoints into the ref the editor reads via getDisplayPoints
  // — refs don't trigger renders, so this assignment during the render
  // pass is safe (and avoids the useEffect tick lag).
  editorDisplayPointsRef.current = displayPoints;

  const displayElevation = useMemo(() => {
    if (!displayedRoute) return [] as Route["elevation"];
    if (isEditing || !isSelectedReversed) return displayedRoute.elevation;
    const total = displayedRoute.elevation[displayedRoute.elevation.length - 1]?.distanceM ?? 0;
    return [...displayedRoute.elevation]
      .map((p) => ({ distanceM: total - p.distanceM, altitudeM: p.altitudeM }))
      .reverse();
  }, [displayedRoute, isSelectedReversed, isEditing]);

  // Pre-compute the unselected traces once so RouteMap can render them in
  // the muted background layer without re-deriving the array each render.
  // Each entry keeps its original index so a click on the muted polyline
  // can promote it as the new selection (cf. onCandidateSelect).
  const candidateTraces = useMemo(
    () =>
      candidates
        .map((c, index) => ({
          index,
          points: c.route.points,
          label: `${t("form.candidate", { index: index + 1 })} · ${(c.route.distanceM / 1000).toFixed(1)} km`,
        }))
        .filter(({ index }) => index !== selectedIndex),
    [candidates, selectedIndex, t],
  );

  const displayDurationSec =
    isEditing && displayedRoute
      ? displayedRoute.estimatedDurationSec
      : selectedRecommendation?.predictedDurationSec ?? route?.estimatedDurationSec ?? 0;
  // Single source of truth for the distance-vs-target descriptor —
  // returns one of three mutually exclusive labels (very_close / close
  // / approximate) so the UI never shows two contradictory chips.
  const distanceMatchLabel: DistanceMatchLabel | null = displayedRoute
    ? getDistanceMatchLabel(
        displayedRoute.constraints.targetDistanceKm,
        displayedRoute.distanceM / 1000,
      )
    : null;

  const onReverseTrace = useCallback(() => {
    if (!route) return;
    setReversedIds((prev) => ({ ...prev, [route.id]: !prev[route.id] }));
  }, [route]);

  const onMapClick = useCallback((point: RouteCoordinate) => {
    setPreviewStart(point);
    // Drop the sheet to peek (snap index 1 = peek, 0 = expanded) so the
    // user sees the marker land where they tapped — Komoot/Strava
    // collapse on map tap to keep the cartography hero.
  }, []);

  const generate = useCallback(
    async (payload: RouteFormSubmitPayload, seed: number) => {
      setIsGenerating(true);
      try {
        const results = await generateRouteCandidates({
          start: payload.start,
          targetDistanceKm: payload.targetDistanceKm,
          discipline: payload.discipline,
          shape: payload.shape,
          surface: payload.surface,
          elevationGainTargetM: payload.elevationGainTargetM,
          seed,
          bearingDeg: payload.bearingDeg,
          count: 3,
          poiBoost: poiBoostForSession(trainingPreset?.intent.sessionType),
        });
        if (results.length === 0) {
          toast.error(t("errors.noConvergence"));
          return;
        }
        const nextCandidates = trainingPreset
          ? rankRouteCandidates(results, {
              intent: trainingPreset.intent,
              athlete: trainingPreset.athlete,
            }).map((entry) => ({ route: entry.route, recommendation: entry }))
          : rankRouteCandidates(results, {
              intent: buildManualRouteIntent({
                discipline: payload.discipline,
                shape: payload.shape,
                targetDistanceKm: payload.targetDistanceKm,
                surface: payload.surface,
                elevationGainTargetM: payload.elevationGainTargetM,
              }),
              athlete: runnerProfile
                ? {
                    vma: runnerProfile.vma,
                    runnerLevel: runnerProfile.runnerLevel,
                    currentWeeklyKm: runnerProfile.currentWeeklyKm,
                    currentLongRunKm: runnerProfile.currentLongRunKm,
                  }
                : null,
            }).map((entry) => ({ route: entry.route, recommendation: entry }));
        setCandidates(nextCandidates);
        setSelectedIndex(0);
        setLastPayload(payload);
        // Stay at peek so the trace is the hero; the stat strip + first
        // candidate card are already in the peek-visible header. The user
        // drags the sheet up only when they want to compare alternates or
        // re-tune the form.
          } catch (err) {
        console.warn("RouteGenerator: routing failed", err);
        toast.error(t("errors.routingFailed"));
      } finally {
        setIsGenerating(false);
      }
    },
    [runnerProfile, t, trainingPreset],
  );

  const onSubmit = (payload: RouteFormSubmitPayload) => {
    generate(payload, Date.now());
  };

  const onRegenerate = () => {
    if (!lastPayload) return;
    // Pick a fresh seed so the algorithm produces a different orientation.
    generate(lastPayload, Date.now());
  };

  const onSave = async () => {
    if (!route) return;
    const routeToSave: Route = {
      ...route,
      points: displayPoints,
      elevation: displayElevation,
      estimatedDurationSec: displayDurationSec || route.estimatedDurationSec,
      ...(trainingPreset?.planSessionRef ? { planSessionRef: trainingPreset.planSessionRef } : {}),
    };
    if (await saveRoute(routeToSave)) {
      toast.success(t("result.saved"));
      navigate(`/routes/${routeToSave.id}`);
    } else {
      toast.error(t("result.saveFailed"));
    }
  };

  const onExport = () => {
    if (!route) return;
    const exported: Route = isSelectedReversed
      ? { ...route, points: displayPoints, elevation: displayElevation }
      : route;
    const filename = downloadRouteGpx(exported);
    toast.success(filename);
  };

  if (!settings.routeGeneratorEnabled) {
    return (
      <>
        <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" noindex />
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
            <EyeOff className="size-10 text-muted-foreground" />
            <div className="space-y-1">
              <h1 className="text-xl font-bold">{t("disabled.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("disabled.body")}</p>
            </div>
            <Button asChild>
              <Link to="/settings">{t("disabled.cta")}</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ─── Content blocks shared by mobile (drawer) and desktop (grid) ──

  // Note: secondary nav (Mes parcours / Trouver une piste) used to live
  // in the page header on the right. Since they belong to the same
  // navigation domain as /routes itself, they're now sub-items in the
  // global Sidebar (cf. Sidebar.tsx). This keeps the page header to a
  // single h1 and de-duplicates navigation entry points.

  // Map height: full-bleed inside the mobile drawer's fixed parent;
  // generous on tablet/desktop so the carto dominates the viewport instead
  // of being capped at 28rem like before. Override `sm:h-96` from the
  // RouteMap default so it doesn't kick in inside the mobile fixed wrapper.
  // Komoot/AllTrails pattern on md+: the map fills its parent (which
  // is a flex-1 cell inside the right-column card). On smaller
  // screens we keep an explicit height so the map doesn't collapse.
  // No `min-h` on md+: the parent already constrains the column to
  // the viewport, and a `min-h` would push the strip down below the
  // fold and leave a blank gap when the map fills less than min-h.
  const mapHeightClass = isMobile
    ? "h-full w-full sm:h-full rounded-none border-0"
    : isMapExpanded
      ? "h-[calc(100svh-10rem)] sm:h-[calc(100svh-10rem)] lg:h-[calc(100svh-10rem)]"
      // RouteMap defaults to `lg:h-[28rem]` which would override
      // `md:h-full` on large screens and leave blank space below the
      // map. Re-assert h-full at lg/xl to keep the carto edge-to-edge.
      : "h-72 sm:h-96 md:h-full lg:h-full xl:h-full md:rounded-none md:border-0";

  const presetNode = trainingPreset ? (
    <>
      {presetSession && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            {t(`recommendation.eyebrow.${trainingPreset.intent.source}`)}
          </p>
          <div className="mt-2 space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {t("recommendation.optimizedFor", { session: presetSessionLabel ?? t("recommendation.genericSession") })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("recommendation.sessionSummary", {
                distance: trainingPreset.formDefaults.targetDistanceKm.toFixed(1),
                duration: presetSession.targetDurationMin ?? presetSession.estimatedDurationMin,
              })}
            </p>
            {presetSessionNotes && (
              <p className="text-xs leading-relaxed text-muted-foreground">{presetSessionNotes}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
              {t(`recommendation.preferences.${trainingPreset.intent.terrainPreference}`)}
            </span>
            <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
              {t(`recommendation.preferences.continuity_${trainingPreset.intent.continuityPriority}`)}
            </span>
            {trainingPreset.intent.repeatabilityPriority !== "low" && (
              <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                {t("recommendation.preferences.repeatable")}
              </span>
            )}
          </div>
          <div className="mt-3">
            <Link
              to={`/plan/${trainingPreset.planSessionRef?.planId}?week=${trainingPreset.planSessionRef?.weekNumber}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("recommendation.backToPlan")}
            </Link>
          </div>
        </div>
      )}
      {!presetSession && presetWorkout && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            {t(`recommendation.eyebrow.${trainingPreset.intent.source}`)}
          </p>
          <div className="mt-2 space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {t("recommendation.optimizedForWorkout", {
                session: presetSessionLabel ?? t("recommendation.genericSession"),
                workout: presetTitle ?? t("recommendation.genericWorkout"),
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("recommendation.sessionSummary", {
                distance: trainingPreset.formDefaults.targetDistanceKm.toFixed(1),
                duration: trainingPreset.intent.targetDurationMin ?? 0,
              })}
            </p>
            {presetSessionNotes && (
              <p className="text-xs leading-relaxed text-muted-foreground">{presetSessionNotes}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
              {t(`recommendation.preferences.${trainingPreset.intent.terrainPreference}`)}
            </span>
            <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
              {t(`recommendation.preferences.continuity_${trainingPreset.intent.continuityPriority}`)}
            </span>
            {trainingPreset.intent.repeatabilityPriority !== "low" && (
              <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                {t("recommendation.preferences.repeatable")}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  ) : null;

  const formNode = (
    <RouteParametersForm
      key={trainingPreset ? `${trainingPreset.planSessionRef?.planId}-${trainingPreset.planSessionRef?.weekNumber}-${trainingPreset.planSessionRef?.sessionIndex}` : "manual-route-form"}
      isGenerating={isGenerating}
      onSubmit={onSubmit}
      onError={(msg) => toast.error(msg)}
      onStartChange={(point) => setPreviewStart(point)}
      externalStart={previewStart}
      initialValues={trainingPreset?.formDefaults}
    />
  );

  // Map + overlays. The map fills its parent (fixed-positioned on mobile,
  // flex-1 inside the right-column card on desktop). Hint banner sits
  // above; action chips (reverse / edit / maximize) ride on top via
  // absolute positioning.
  const mapBlock = (
    <div
      className={cn(
        "relative",
        isMobile ? "h-full w-full" : "md:h-full",
      )}
    >
      {!route && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[600] -translate-x-1/2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
          {previewStart ? t("form.mapPickedHint") : t("form.mapPickStartHint")}
        </div>
      )}
      <Suspense fallback={<MapSkeleton className={mapHeightClass} />}>
        <RouteMap
          points={displayPoints}
          candidates={isEditing ? [] : candidateTraces}
          onCandidateSelect={isEditing ? undefined : setSelectedIndex}
          pois={isEditing ? undefined : displayedRoute?.pois}
          start={route ? null : previewStart}
          showDirection={!!route && !isEditing}
          onMapClick={!route ? onMapClick : undefined}
          editableWaypoints={editWaypoints ?? undefined}
          editClosedLoop={isEditing && route?.shape === "loop"}
          onWaypointMove={onWaypointMove}
          onWaypointInsert={onWaypointInsert}
          onWaypointRemove={onWaypointRemove}
          className={mapHeightClass}
        />
      </Suspense>
      {isEditing && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[600] -translate-x-1/2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary shadow-sm backdrop-blur-sm">
          {isReRouting ? t("edit.rerouting") : t("edit.hint")}
        </div>
      )}
      {!isMobile && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMapExpanded((v) => !v);
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-[1100] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
          aria-label={isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
        >
          {isMapExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          <span className="hidden sm:inline">
            {isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
          </span>
        </button>
      )}
      {/* Mobile keeps the floating action overlays — no horizontal
          strip on phones so the user needs an in-map fallback. Desktop
          has its dedicated action strip below the map (cf. desktopStrip)
          so we hide these to keep the cartography clean. */}
      {isMobile && route && !isEditing && (
        <div className="absolute bottom-3 right-3 z-[1100] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReverseTrace();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
            aria-label={t("form.reverseDirection")}
            title={t("form.reverseDirection")}
          >
            <ArrowLeftRight className="size-3.5" />
            <span className="hidden sm:inline">
              {isSelectedReversed ? t("form.reversedActive") : t("form.reverseDirection")}
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEnterEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            aria-label={t("edit.enter")}
            title={t("edit.enter")}
          >
            <Pencil className="size-3.5" />
            <span className="hidden sm:inline">{t("edit.enter")}</span>
          </button>
        </div>
      )}
      {isMobile && isEditing && (
        <div className="absolute bottom-3 right-3 z-[1100] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExitEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">{t("edit.cancel")}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            disabled={isReRouting || !editPreview}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="size-3.5" />
            <span className="hidden sm:inline">{t("edit.apply")}</span>
          </button>
        </div>
      )}
    </div>
  );

  // ─── Desktop stats bar (route stats promoted to h3 + pager) ──────
  // Sits *above* the action strip. Stats are the headline information
  // for a generated route (km, m, duration) and deserve real visual
  // weight; the pager "Proposition X/N" reads as a discreet caption to
  // their right (Strava 2025 Routes pattern).
  const desktopStatsBar = route ? (
    <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background px-3 pt-2 pb-1.5">
      <h3 className="flex items-baseline gap-4 text-lg font-semibold tabular-nums">
        <span className="inline-flex items-baseline gap-1">
          <Activity className="size-4 self-center text-primary" />
          {((displayedRoute?.distanceM ?? 0) / 1000).toFixed(1)}
          <span className="text-xs font-normal text-muted-foreground">km</span>
        </span>
        <span className="inline-flex items-baseline gap-1">
          <TrendingUp className="size-4 self-center text-primary" />
          {displayedRoute?.elevationGainM ?? 0}
          <span className="text-xs font-normal text-muted-foreground">m</span>
        </span>
        <span className="inline-flex items-baseline gap-1 font-medium text-muted-foreground">
          <Clock className="size-4 self-center" />
          {formatDurationMinutes(displayDurationSec / 60)}
        </span>
      </h3>
      {candidates.length > 1 && (
        <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5 text-sm">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => setSelectedIndex((i) => (i - 1 + candidates.length) % candidates.length)}
            aria-label={t("form.candidatesLabel")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[6rem] px-1 text-center font-semibold tabular-nums text-foreground">
            {t("form.candidate", { index: selectedIndex + 1 })}
            <span className="text-muted-foreground">{` / ${candidates.length}`}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => setSelectedIndex((i) => (i + 1) % candidates.length)}
            aria-label={t("form.candidatesLabel")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  ) : null;

  // ─── Desktop action strip (refactor: edit | output) ──────────────
  // Two clearly separated groups: editing actions on the left
  // (Modifier le tracé, Inverser le sens), output actions on the right
  // (Enregistrer, Régénérer, Télécharger), divided by a vertical rule.
  // When the user is in edit mode, the left group flips to Cancel /
  // Apply so all editing affordances live in one predictable location
  // — no more buttons floating over the map.
  const desktopStrip = route ? (
    <div className="flex h-12 items-center gap-3 border-t border-border/60 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-1.5">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
              onClick={onExitEdit}
            >
              <X className="size-3.5" />
              {t("edit.cancel")}
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
              onClick={onApplyEdit}
              disabled={isReRouting || !editPreview}
            >
              <Check className="size-3.5" />
              {t("edit.apply")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
              onClick={onEnterEdit}
            >
              <Pencil className="size-3.5" />
              {t("edit.enter")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs"
              onClick={onReverseTrace}
              aria-label={t("form.reverseDirection")}
              title={t("form.reverseDirection")}
            >
              <ArrowLeftRight className="size-3.5" />
              {isSelectedReversed ? t("form.reversedActive") : t("form.reverseDirection")}
            </Button>
          </>
        )}
      </div>
      <span className="h-6 w-px bg-border/60" aria-hidden />
      <div className="ml-auto flex items-center gap-1.5">
        <Button onClick={onSave} size="sm" className="h-8 gap-1.5 px-3 text-xs">
          <Save className="size-3.5" />
          {t("result.save")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onRegenerate}
          disabled={isGenerating}
          aria-label={t("form.regenerate")}
          title={t("form.regenerate")}
        >
          <RotateCcw className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onExport}
          aria-label={t("result.exportGpx")}
          title={t("result.exportGpx")}
        >
          <Download className="size-3.5" />
        </Button>
      </div>
    </div>
  ) : null;

  // ─── Desktop collapsible "Pourquoi ce parcours" panel ────────────
  // Closed by default — accent + reasons + elevation profile only get
  // unfolded when the user explicitly asks. Keeps the map dominant.
  const desktopDetails = route ? (
    <div className="border-t border-border/60 bg-background">
      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        aria-expanded={detailsOpen}
        className="flex h-9 w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          {t("recommendation.resultEyebrow")}
          {selectedRecommendation && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium tracking-normal normal-case text-primary">
              {t(`recommendation.accents.${selectedRecommendation.accent}`)}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            detailsOpen && "rotate-180",
          )}
        />
      </button>
      {detailsOpen && (
        <div className="max-h-[40svh] space-y-3 overflow-y-auto border-t border-border/60 px-3 py-3">
          <div className="flex flex-wrap gap-1.5">
            {distanceMatchLabel && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  DISTANCE_MATCH_CLASSES[distanceMatchLabel],
                )}
              >
                {t(`recommendation.distanceMatch.${distanceMatchLabel}`)}
              </span>
            )}
            {selectedRecommendation?.reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium"
              >
                {t(`recommendation.reasons.${reason}`)}
              </span>
            ))}
          </div>
          {displayElevation.length > 1 && (
            <Suspense fallback={null}>
              <ElevationChart profile={displayElevation} />
            </Suspense>
          )}
        </div>
      )}
    </div>
  ) : null;

  // "How it works" — collapsed by default, action-first page. Native
  // <details> for zero-JS toggling.

  // ─── Mobile: Strava-style persistent card over a full-bleed map ───
  // Pattern (Komoot / Strava / AllTrails 2024-2025): the sheet never
  // covers the map — it's a fixed card with two states (peek + expanded)
  // sitting permanently above the map. `react-modal-sheet` uses Motion
  // and supports `disableDrag` driven by scroll position, which solves
  // the scroll-vs-drag conflict that vaul leaves to the consumer.
  if (isMobile) {
    const distanceKmDisplay = displayedRoute ? (displayedRoute.distanceM / 1000).toFixed(1) : null;
    const elevationDisplay = displayedRoute?.elevationGainM ?? 0;
    const durationDisplay = formatDurationMinutes(displayDurationSec / 60);
    return (
      <>
        <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" />
        {/* Mobile layout = top form (compact, scroll if too tall) → map
            fills the rest → optional bottom result strip when a route is
            active. No drawer / no sheet ceremony: the user wanted the
            classic "controls on top, map below, action at bottom"
            pattern (cf. Komoot search header + map + result list).
            z-30 sits above the App-level <Footer /> (which renders as a
            flow-normal sibling of <main>) so neither the "Nouveautés"
            link nor the legal footer leak into the map area. */}
        <div className="fixed inset-x-0 top-12 bottom-0 z-30 flex flex-col bg-background">
          {/* Top filter bar — chip popovers + address + CTA. The compact
              form keeps itself ~150-180px tall; cap at 240px to give room
              for an optional plan-preset card without ever stealing more
              than 30 % of the viewport. */}
          {/* No max-h / overflow on the top form: an `overflow:auto`
              parent clips the address autocomplete dropdown so the
              Nominatim suggestions disappear behind the map. The form
              already wraps tightly (~120 px) so letting it size to its
              content is safe and the popover-based filters expand
              outward via Radix Portal anyway. */}
          <div className="shrink-0 space-y-2 border-b border-border/60 px-3 py-2">
            {presetNode}
            <RouteParametersForm
              key={trainingPreset ? `${trainingPreset.planSessionRef?.planId}-${trainingPreset.planSessionRef?.weekNumber}-${trainingPreset.planSessionRef?.sessionIndex}` : "manual-route-form"}
              isGenerating={isGenerating}
              onSubmit={onSubmit}
              onError={(msg) => toast.error(msg)}
              onStartChange={(point) => setPreviewStart(point)}
              externalStart={previewStart}
              initialValues={trainingPreset?.formDefaults}
              compact
            />
          </div>

          {/* Map fills the remaining vertical space. min-h-0 is the
              flexbox-on-mobile incantation that lets the child shrink
              below its content height — without it the map would push
              the result strip off-screen. */}
          <div className="relative min-h-0 flex-1">
            {mapBlock}
            {displayedRoute && (
              <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-semibold tabular-nums shadow-md backdrop-blur">
                {distanceKmDisplay} km · ↑ {elevationDisplay} m
              </div>
            )}
          </div>

          {/* Result strip: only when a route exists. Stat line on top,
              action buttons inline; horizontal candidate scroll below
              when there are 2+ alternates to compare. Strava lays this
              out vertically, but on a 100px strip we go horizontal so
              the user can sweep through candidates without losing the
              map. */}
          {route && (
            <div className="shrink-0 space-y-2 border-t border-border/60 bg-background px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {selectedRecommendation
                      ? t(`recommendation.accents.${selectedRecommendation.accent}`)
                      : t("recommendation.accents.closest_to_target")}
                  </p>
                  <p className="truncate text-sm font-semibold tabular-nums">
                    {distanceKmDisplay} km
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ↑ {elevationDisplay} m · {durationDisplay}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button onClick={onSave} className="h-9 gap-1.5 text-xs font-semibold">
                    <Save className="size-3.5" />
                    {t("result.save")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onRegenerate}
                    disabled={isGenerating}
                    aria-label={t("form.regenerate")}
                    title={t("form.regenerate")}
                    className="h-9 w-9 shrink-0"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onExport}
                    aria-label={t("result.exportGpx")}
                    title={t("result.exportGpx")}
                    className="h-9 w-9 shrink-0"
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
              {candidates.length > 1 && (
                <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:thin]">
                  {candidates.map((c, i) => {
                    const isSel = i === selectedIndex;
                    return (
                      <button
                        key={c.route.id}
                        type="button"
                        onClick={() => setSelectedIndex(i)}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                          isSel
                            ? "border-primary bg-primary/5"
                            : "border-border/60 bg-background",
                        )}
                        aria-pressed={isSel}
                      >
                        <MiniRouteMap
                          points={c.route.points}
                          color={isSel ? "#ea580c" : "#94a3b8"}
                          className="h-8 w-12"
                        />
                        <div className="text-[11px] leading-tight">
                          <p className="font-semibold tabular-nums text-foreground">
                            {(c.route.distanceM / 1000).toFixed(1)} km
                          </p>
                          <p className="tabular-nums text-muted-foreground">
                            ↑ {c.route.elevationGainM} m
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {distanceMatchLabel && (
                <span
                  className={cn(
                    "inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    DISTANCE_MATCH_CLASSES[distanceMatchLabel],
                  )}
                >
                  {t(`recommendation.distanceMatch.${distanceMatchLabel}`)}
                </span>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  // ─── Desktop / Tablet: 2-col one-page layout (Strava Routes pattern) ─
  // The whole interactive zone fits in a single viewport. The left rail
  // hosts only the form (no embedded result panel). The right column
  // stacks map (flex) + horizontal results strip + collapsible "why this
  // route" details. The Zoned footer is hidden on this route via
  // App.tsx so the page truly takes 100svh.
  return (
    <>
      <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" />
      {/* Total chrome above + below this page = pt-16 (TopBar offset)
          + pb-4 (main bottom padding) = 5rem. Subtracting that here
          keeps the page exactly viewport-sized — no scroll on the body
          (the previous 4rem ignored the bottom padding and produced a
          1rem overflow). */}
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-5 md:flex md:h-[calc(100svh-5rem)] md:flex-col md:overflow-hidden">
        {/* Mini-toolbar replacing the previous oversized hero banner.
            ~36 px of vertical space instead of 130 px, leaves the map
            room to dominate. Title is small and informative; secondary
            navigation links sit on the right where the user expects a
            "more from this section" rail. */}
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            {t("title")}
          </h1>
        </header>

        <div
          className={cn(
            "grid grid-cols-1 gap-4 md:flex-1 md:min-h-0",
            isMapExpanded ? "md:grid-cols-1" : "md:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr]",
          )}
        >
          {/* Left rail: form only. Scrolls internally if the form
              outgrows the viewport (tablet, small laptops, training
              presets with extra fields). overscroll-contain stops the
              wheel from leaking into the page or the map. */}
          <aside
            className={cn(
              "min-w-0 space-y-3 md:flex md:flex-col md:min-h-0",
              !isMapExpanded && "md:overflow-y-auto md:overscroll-contain md:pr-1",
              isMapExpanded && "md:hidden",
            )}
          >
            {presetNode}
            {formNode}
          </aside>

          {/* Right column: map (flex) + strip (auto) + collapsible
              details (auto). The whole column lives inside a single
              rounded card so the map, strip and details read as one
              cohesive surface — no double borders, no orphan blocks. */}
          <main className="min-w-0 md:flex md:min-h-0 md:flex-col md:overflow-hidden md:rounded-xl md:border md:border-border/60 md:bg-background md:shadow-sm">
            <div className="relative md:flex-1 md:min-h-0">{mapBlock}</div>
            {desktopStatsBar}
            {desktopStrip}
            {desktopDetails}
          </main>
        </div>
      </div>
    </>
  );
}

export default RouteGeneratorPage;
